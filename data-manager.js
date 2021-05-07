let fetchHandler = null
let cacheKey = "cache"
var allPeople = null

function initCache() {
    let cache = localStorage.getItem(cacheKey)
    let cacheJson = JSON.parse(cache)
    if (cacheJson == null) {
        cacheJson = new Map()
        localStorage.setItem(cacheKey, JSON.stringify(cacheJson))
    }
}

initCache()

function fetchClanData(handler) {
    let cache = localStorage.getItem(cacheKey)
    let cacheJson = JSON.parse(cache)
    let userInfo = ""
    if (cacheJson != null && cacheJson.local != null && cacheJson.local.userinfo != null) {
        userInfo = cacheJson.local.userinfo
    } else {
        userInfo = prompt("请输入分配的密码：")
        if (cacheJson.local == null) {
            cacheJson.local = new Map()
        }
        cacheJson.local.userinfo = userInfo
        localStorage.setItem(cacheKey, JSON.stringify(cacheJson))
    }
    let version = ""
    if (cacheJson != null && cacheJson.response != null && cacheJson.response.version != null && cacheJson.response.data != null) {
        version = cacheJson.response["version"] // 上传本地缓存比较
    }
    let host = "https://7br8y2rw0tat2.cfc-execute.bj.baidubce.com/genealogy"
    let query = {
        "cmd": "fetch", 
        "userInfo": userInfo, 
        "version": version
    }
    let url = host + "?"
    for (let key in query) {
        url += (key + "=" + query[key] + "&")
    }
    let jsonpScript = document.createElement('script');
    jsonpScript.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(jsonpScript)
    fetchHandler = handler
}

function callback(response) {
    if (response.userLevel < 0) {
        alert("用户信息有误，无权查看")
        localStorage.removeItem(cacheKey)
        fetchHandler(null)
        return
    }
    let cache = localStorage.getItem(cacheKey)
    let cacheJson = JSON.parse(cache)
    if (cacheJson == null || cacheJson.response == null || cacheJson.response.version == null || cacheJson.response.version != response.version) {
        cacheJson.response = response
        localStorage.setItem(cacheKey, JSON.stringify(cacheJson))
        fetchHandler(response.data)
        allPeople = response.data
        console.log("cache expeired")
    } else {
        fetchHandler(cacheJson.response.data)
        allPeople = cacheJson.response.data
        console.log("use cache")
    }
    console.log(allPeople)
}

function fetchFamilyInfo(peopleID, allPeople) {
    var people = allPeople[peopleID]
    if (people == null || people.sex == false) {
        return null;
    } 
    var father = null
    if (people.fatherID != null) {
        father = allPeople[people.fatherID]
    }
    var mother = null
    if (people.motherID != null) {
        mother = allPeople[people.motherID]
    }
    var marriage = null
    if (people.spouses != null && people.spouses.length > 0) {
        marriage = new Array()
        for (var i = 0; i < people.spouses.length; i++) {
            var wife = people.spouses[i]
            if (allPeople[wife.id] != null) {
                marriage.push(allPeople[wife.id.toString()])
            }
        }
    }
    var children = null
    if (people.children != null && people.children.length > 0) {
        children = new Array()
        for (var i = 0; i < people.children.length; i++) {
            var child = people.children[i]
            if (allPeople[child] != null) {
                children.push(allPeople[child.toString()])
            }
        }
    }
    return {"gen": people.genID, "owner": people, "father": father, "mother": mother, "marriage": marriage, "children": children}
}

function groupByGen() {
    var map = new Map()
    for (var key in allPeople) {
        var people = allPeople[key]
        if (map[people.genID] == null) {
            map[people.genID] = new Array()
        }
        map[people.genID].push(people.id)
    }
    return map
}