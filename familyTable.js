function familyTableHandler(params, contentDiv) {
    let ownerID = params["id"]
    if (ownerID == null) {
        ownerID = 1
    }
    let family = fetchFamilyInfo(ownerID)
    let titleDiv = document.createElement("div")
    titleDiv.id = "title"
    contentDiv.appendChild(titleDiv)
    let defaultTitle = "赵氏第" + family.owner.genID + "代<br>"
    let tableTitle = params["title"] ? params["title"] : defaultTitle 
    let lastTitle = ""
    if (family.father != null) {
        lastTitle = "上一代户主：<a href='#familyTable?id=" + family.father.id + "'>" + family.father.name + "</a><br>"
    }
    let currentTitle = "户主：" + family.owner.name + "<br>";
    titleDiv.innerHTML = tableTitle + lastTitle + currentTitle
    
    renderFamilyTable(family, contentDiv)
}

// 需要展示的列名与json对应关系
var colName = {
    "name": "姓名", 
    "birthday": "生日",
    "sex": "性别",
    "relationship": "户主关系",
    "educational": "文化程度",
    "jobs": "从事职业",
    "nativePlace": "籍贯",
    "habitation": "居住地",
    "spouses": "婚姻",
    "deathday": "故时",
    "ext": "更多"
}

// 列值与显示值转换
var colMapper = {
    "name": function(family, people) {
        // people.sex != false  在数据库中存储时，默认为true，导致有的数据导出来没有sex字段
        if (people.sex != false && people.id != family.owner.id && 
            ((people.spouses != null && people.spouses.length > 0) || (people.children != null && people.children.length > 0))) {
            return "<a href='#familyTable?id=" + people.id + "'>" + people.name + "</a>"
        } else {
            return people.name
        }
    },
    "birthday": function(family, people) {
        if (people.ext != null && people.ext[0]["birthday"] != null) {
            return people.ext[0]["birthday"]
        }
        if (people.birthday == null) {
            return "不详"
        } else {
            let date = new Date(people.birthday.iso)
            return date.getFullYear()
        }
    },
    "deathday": function(family, people) {
        if (people.deathday != null) {
            let date = new Date(people.deathday.iso)
            return date.getFullYear()
        } else if (people.birthday != null) {
            let birthYear = new Date(people.birthday.iso).getFullYear()
            let year = new Date().getFullYear()
            if (year - birthYear > 100) { // 超过100，认为已经去世
                return "不详"
            }
        } else if (people.birthday == null && people.genID < 6) {
            return "不详"
        } else {
            return ""
        }
    },
    "sex": function(family, people) { return people.sex != false ? "男" : "女" },
    "relationship": function(family, people) {
        if (people.ext != null && people.ext[0].relationship != null) {
            return people.ext[0].relationship
        }
        if (people.id == family.owner.id) {
            return "户主"
        } else if (family.owner.spouses != null) {
            for (var i = 0; i < family.owner.spouses.length; i++) {
                if (people.id == family.owner.spouses[i].id) {
                    return "夫妻"
                }
            }
        } 

        return people.sex != false ? "子" : "女"
    },
    "posts": function(family, people) {
        if (people.posts != null) {
            return people.posts[people.posts.length - 1]
        } else {
            return "无"
        }
    }, 
    "jobs": function(family, people) {
        if (people.jobs != null) {
            return people.jobs[people.jobs.length - 1]
        } else {
            return ""
        }
    },
    "habitation": function(family, people) {
        if (people.habitation != null) {
            return people.habitation[people.habitation.length - 1]
        } else {
            return ""
        }
    },
    "spouses": function(family, people) {
        if (people.id == family.owner.id) {
            return "" // 把婚姻相关放在妻子处
        }
        let keyName = {"time": "【时间】", "place": "【地址】"}

        if (family.owner.spouses != null) {
            for (let i = 0; i < family.owner.spouses.length; i++) {
                let spouse = family.owner.spouses[i]
                if (people.id == spouse.id) { // 妻子
                    return (spouse.time != null ? ("【时间】" + spouse.time + "<br") : "") 
                         + (spouse.place != null ? ("【地址】" + spouse.place + "<br>") : "")
                }
            }
        }
        if (people.spouses == null) {
            return ""
        }
        let lastSpouse = people.spouses[people.spouses.length - 1] // 只展示最近的婚姻
        let str = ""
        if (people.sex == false && lastSpouse != null && lastSpouse.id != null) {
            str = str + "【姓名】" + allPeople[lastSpouse.id].name + "<br>"
        }
        for (let key in keyName) {
            if (lastSpouse[key] != null) {
                str = str + keyName[key] + people.spouses[people.spouses.length - 1][key] + "<br>"
            }
        }
        return str
    },
    "ext": function(family, people) {
        let str = ""
        if (people.politicalStatus != null) {
            str = str + "【政治面貌】" + people.politicalStatus + "<br>"
        }
        if (people.posts != null) {
            str = str + "【历任职务】" + people.posts[people.posts.length - 1] + "<br>"
        }
        if (people.ext != null && people.ext[0].note != null) {
            str = str + "【备注】" + people.ext[0].note + "<br>"
        }
        return str
    }
}

function renderFamilyTable(family, contentDiv) {
    let table = document.createElement("table")
    contentDiv.appendChild(table)
    // 列
    var thead = document.createElement("thead")
    var colRow = document.createElement("tr")
    for (var key in colName) {
        var cell = document.createElement("th")
        cell.id = "th-" + key
        cell.innerText = colName[key]
        colRow.appendChild(cell)
    }
    thead.appendChild(colRow)
    table.appendChild(thead)

    // 行
    var familyPeopleInTable = new Array()
    familyPeopleInTable.push(family.owner)
    if (family.marriage != null) {
        for (var i = 0; i < family.marriage.length; i++) {
            familyPeopleInTable.push(family.marriage[i])
        }
    }
    if (family.children != null) {
        for (var i = 0; i < family.children.length; i++) {
            familyPeopleInTable.push(family.children[i])
        }
    }

    var tbody = document.createElement("tbody")
    for (var i = 0; i < familyPeopleInTable.length; i++) {
        var row = document.createElement("tr")
        for (var colKey in colName) {
            var cell = document.createElement("td")
            cell.id = "td" + i + colKey
            cell.className = cell.className + "td-" + colKey
            var people = familyPeopleInTable[i]
            value = people[colKey]
            if (colMapper[colKey] != undefined) {
                value = colMapper[colKey](family, people)
            }
            if (value == undefined) {
                value = ""
            }
            cell.innerHTML = value
            row.appendChild(cell)
        }
        tbody.appendChild(row)
    }
    table.appendChild(tbody)
}