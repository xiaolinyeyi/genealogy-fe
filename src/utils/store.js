// 家谱数据的写入层：id 分配、关系维护、日期字段解析、序列化与落盘
// fileHandle 存在模块作用域，不能放进 reactive，否则被 Proxy 包裹后调用其方法会报 Illegal invocation
let fileHandle = null

const CACHE_KEY = "lastGenealogy"

export function supportsFileSystemAccess() {
    return typeof window !== "undefined" && typeof window.showOpenFilePicker === "function"
}

export function setFileHandle(handle) {
    fileHandle = handle
}

export function hasFileHandle() {
    return fileHandle != null
}

// 打开家谱文件，返回文件内容字符串，同时记住可写句柄
export async function openGenealogyFile() {
    const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [{
            description: "家谱 JSON",
            accept: { "application/json": [".json"] }
        }]
    })
    const file = await handle.getFile()
    const text = await file.text()
    setFileHandle(handle)
    return text
}

export function nextPeopleId(allPeople) {
    let max = 0
    for (const key in allPeople) {
        const id = Number(allPeople[key].id)
        if (!isNaN(id) && id > max) {
            max = id
        }
    }
    return max + 1
}

function pad(num) {
    return num < 10 ? "0" + num : String(num)
}

// 只有完整的年月日才认为是可解析日期，其余（如“三国时期”“1966”）走 ext
function parseFullDate(text) {
    const matched = text.match(/^(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})\s*日?$/)
    if (matched == null) {
        return null
    }
    const year = Number(matched[1])
    const month = Number(matched[2])
    const day = Number(matched[3])
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() != year || date.getMonth() != month - 1 || date.getDate() != day) {
        return null
    }
    return date.toISOString()
}

// 把 birthday / deathday 渲染成可编辑的纯文本
export function dateFieldText(people, key) {
    if (people == null) {
        return ""
    }
    if (people.ext != null && people.ext[key] != null) {
        return String(people.ext[key])
    }
    const value = people[key]
    if (value == null || value.date == null) {
        return ""
    }
    const date = new Date(value.date)
    if (isNaN(date.getTime())) {
        return String(value.date)
    }
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate())
}

export function dateFieldCalendar(people, key, defaultCalendar) {
    if (people != null && people[key] != null && people[key].calendar != null) {
        return people[key].calendar
    }
    return defaultCalendar || "农历"
}

// 文本写回：能解析成年月日的写进 birthday.date，解析不了的写进 ext
export function setDateField(people, key, calendar, text) {
    const trimmed = (text || "").trim()
    if (trimmed == "") {
        delete people[key]
        clearExt(people, key)
        return
    }
    const iso = parseFullDate(trimmed)
    if (iso != null) {
        people[key] = { calendar: calendar || "农历", date: iso }
        clearExt(people, key)
    } else {
        delete people[key]
        if (people.ext == null) {
            people.ext = {}
        }
        people.ext[key] = trimmed
    }
}

function clearExt(people, key) {
    if (people.ext == null) {
        return
    }
    delete people.ext[key]
    if (Object.keys(people.ext).length == 0) {
        delete people.ext
    }
}

// 去掉空字符串、空数组等无意义字段，保持导出的 json 干净
export function pruneEmptyFields(people) {
    for (const key of Object.keys(people)) {
        const value = people[key]
        if (value == null || value === "") {
            delete people[key]
        } else if (Array.isArray(value) && value.length == 0) {
            delete people[key]
        }
    }
    return people
}

export function buildGenealogyJSON(globalVars, allPeopleOverride) {
    const source = allPeopleOverride != null ? allPeopleOverride : globalVars.allPeople
    const allPeople = []
    for (const key in source) {
        allPeople.push(source[key])
    }
    allPeople.sort((a, b) => Number(a.id) - Number(b.id))
    const json = {
        meta: globalVars.meta,
        baseInfo: globalVars.baseInfo,
        allPeople: allPeople
    }
    if (globalVars.about != null) {
        json.about = globalVars.about
    }
    return json
}

// 把家谱 json 灌进全局响应式数据，allPeople 转成以 id 为 key 的字典
export function applyGenealogyJSON(globalVars, jsonData) {
    globalVars.meta = jsonData["meta"] != null ? jsonData["meta"] : {}
    globalVars.baseInfo = jsonData["baseInfo"] != null ? jsonData["baseInfo"] : {}
    const list = jsonData["allPeople"] != null ? jsonData["allPeople"] : []
    const map = {}
    for (let i = 0; i < list.length; i++) {
        map[list[i].id] = list[i]
    }
    globalVars.allPeople = map
    globalVars.about = jsonData["about"]
}

// 从磁盘重新读取家谱；没有句柄时退回读 localStorage 缓存
export async function reloadGenealogyJSON() {
    if (fileHandle != null) {
        const file = await fileHandle.getFile()
        return JSON.parse(await file.text())
    }
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached == null) {
        return null
    }
    return JSON.parse(cached)
}

function downloadJSON(text, name) {
    const blob = new Blob([text], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = name || "genealogy.json"
    link.click()
    URL.revokeObjectURL(url)
}

// 落盘：优先写回已绑定的文件；还没绑定就弹「另存为」让用户选位置并记住句柄
export async function persist(globalVars, allPeopleOverride) {
    const text = JSON.stringify(buildGenealogyJSON(globalVars, allPeopleOverride), null, 2)

    if (fileHandle == null && typeof window.showSaveFilePicker == "function") {
        // 必须 await 到用户选完，否则后面的刷新会抢在保存对话框之前
        const handle = await window.showSaveFilePicker({
            suggestedName: fileNameOf(globalVars),
            types: [{
                description: "家谱 JSON",
                accept: { "application/json": [".json"] }
            }]
        })
        setFileHandle(handle)
    }

    if (fileHandle == null) { // 浏览器不支持 File System Access，只能导出下载
        localStorage.setItem(CACHE_KEY, text)
        downloadJSON(text, fileNameOf(globalVars))
        return "download"
    }

    const options = { mode: "readwrite" }
    let permission = await fileHandle.queryPermission(options)
    if (permission != "granted") {
        permission = await fileHandle.requestPermission(options)
    }
    if (permission != "granted") {
        throw new Error("没有拿到家谱文件的写入权限")
    }
    const writable = await fileHandle.createWritable()
    await writable.write(text)
    await writable.close()
    localStorage.setItem(CACHE_KEY, text) // 文件写成功后再更新缓存，避免两者不一致
    return "file"
}

function fileNameOf(globalVars) {
    const title = globalVars.meta != null ? globalVars.meta.title : null
    return (title || "genealogy") + ".json"
}

/**
 * 保存一个人，并按上下文维护关系；先写文件，再把文件读回来刷新页面
 * @param {object} globalVars provide 出来的全局响应式数据
 * @param {object} draft 待保存的人物原始数据，新增时 id 为空
 * @param {object} ctx { ownerId, relation: 'child' | 'spouse' | null, marriageTime }
 * @returns {Promise<{persisted: 'file' | 'download', reloaded: boolean}>}
 */
export async function savePeople(globalVars, draft, ctx) {
    const allPeople = JSON.parse(JSON.stringify(globalVars.allPeople))
    const people = pruneEmptyFields(JSON.parse(JSON.stringify(draft)))
    const context = ctx || {}
    const owner = context.ownerId != null ? allPeople[context.ownerId.toString()] : null

    if (people.id == null) { // 新增
        people.id = nextPeopleId(allPeople)
        if (context.relation == "child" && owner != null) {
            people.fatherID = Number(owner.id)
            people.genID = Number(owner.genID) + 1
        } else if (context.relation == "spouse" && owner != null) {
            people.genID = Number(owner.genID)
            delete people.fatherID // 配偶不是本家，不写 fatherID
        }
    }
    allPeople[people.id.toString()] = people

    if (owner != null && context.relation == "child") {
        if (owner.children == null) {
            owner.children = []
        }
        if (!owner.children.some((id) => Number(id) == Number(people.id))) {
            owner.children.push(Number(people.id))
        }
    }

    if (owner != null && context.relation == "spouse") {
        if (owner.spouses == null) {
            owner.spouses = []
        }
        let entry = owner.spouses.find((item) => Number(item.id) == Number(people.id))
        if (entry == null) {
            entry = { id: Number(people.id) }
            owner.spouses.push(entry)
        }
        const time = (context.marriageTime || "").trim()
        if (time != "") {
            entry.time = time
        } else {
            delete entry.time
        }
    }

    // 第一步：写文件
    const persisted = await persist(globalVars, allPeople)
    // 第二步：把刚写好的文件重新读回来刷新页面，保证界面展示的就是磁盘上的内容
    let reloaded = false
    try {
        const jsonData = await reloadGenealogyJSON()
        if (jsonData != null) {
            applyGenealogyJSON(globalVars, jsonData)
            reloaded = true
        }
    } catch (error) {
        console.error("重新加载家谱失败", error)
    }
    if (!reloaded) { // 读回失败就退回内存里的数据，避免界面和已保存的内容脱节
        globalVars.allPeople = allPeople
    }
    return { persisted, reloaded }
}
