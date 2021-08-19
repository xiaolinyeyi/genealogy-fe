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
    if (cacheJson.response == null || cacheJson.response.version == null || cacheJson.response.version != response.version) {
        cacheJson.response = response
        localStorage.setItem(cacheKey, JSON.stringify(cacheJson))
        fetchHandler(response.data)
        allPeople = response.data
    } else {
        fetchHandler(cacheJson.response.data)
        allPeople = cacheJson.response.data
    }
}

function fetchFamilyInfo(peopleID) {
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
        if (people.genID == null) {
            continue
        }
        let isZhao = (people.fatherID != undefined && people.fatherID != 0)
        if (!isZhao && people.id != 1) {
            continue
        }
        if (map[people.genID] == null) {
            map[people.genID] = new Array()
        }
        map[people.genID].push(people.id)
    }
    return map
}

function peopleIsFamilyOwnerWithID(peopleID) {
    let people = allPeople[peopleID]
    if (people.sex == false) {
        return false
    }
    if (people.spouses != null && people.spouses.length > 0) {
        return true
    }
    if (people.children != null && people.children.length > 0) {
        return true
    }
    return false
}

function zuxun() {
    return "几长者共谋，立家案百愿呼。村东老茔穴尽水，各支于清末时，民故，觅佳城立墓，分而仰先。为聚祖力量，歌祖宗功德，永言孝思，而立我族家案。" + 
    "定立我族家规家训，以规范后人；记载族人功德，以勉励后人。强优我族，众志成城。虽社稷传优去弼，过己训群，优秀后人，贡献社会。再者，名慧（讳？）不乱，长幼有序，扬我族威。长辈存载力，宜子宜孙，千古留芳"
}