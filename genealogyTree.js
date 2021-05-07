function genealogyTreeHandler(params, contentDiv) {
    let table = document.createElement("table")
    contentDiv.appendChild(table)

    var genGroups = groupByGen()
    var maxGen = Object.keys(genGroups).length

    // 统计每个人最长一代总数，该数决定了树的宽度
    // 每个人最大长度为：各个孩子最大长度之和
    var maxWidth = new Map()
    for (var i = maxGen; i > 0; i--) {
        var peopleInGen = genGroups[i]
        for (var j = 0; j < peopleInGen.length; j++) {
            var people = allPeople[peopleInGen[j]]
            if (people.children == null) {
                maxWidth[people.id] = 1
            } else {
                var count = 0
                for (var m = 0; m < people.children.length; m++) {
                    count += maxWidth[people.children[m]] 
                }
                maxWidth[people.id] = count == 0 ? 1 : count
            }
        }
    }
    
    var root = 1
    var peopleColMap = new Map()
    peopleColMap[root] = 0

    var tableMaxWidth = maxWidth[root]
    var tableMaxHeight = maxGen
    var tableLeft = 100
    var tableTop = 100
    for (var i = 1; i <= tableMaxHeight; i++) {
        let peopleInGen = genGroups[i]
        let colWithPeople = new Map() // col: peopleID
        // 把下一代位置安排好
        for (let j = 0; j < peopleInGen.length; j++) {
            let peopleID = peopleInGen[j]
            let people = allPeople[peopleID]
            if (people.children != null) {
                for (let m = 0; m < people.children.length; m++) {
                    if (m == 0) {
                        peopleColMap[people.children[m]] = peopleColMap[peopleID]
                    } else {
                        peopleColMap[people.children[m]] = peopleColMap[people.children[m - 1]] + maxWidth[people.children[m - 1]]
                    }
                }
            }

            colWithPeople[[peopleColMap[peopleID]]] = peopleID
        }

        let childrenIndex = 0
        var row = document.createElement("tr")
        table.appendChild(row)

        var genTitleCell = document.createElement("td")
        genTitleCell.innerHTML = "第" + i + "代"
        genTitleCell.className = "titleCell"
        row.appendChild(genTitleCell)

        for (var j = 0; j < tableMaxWidth; j++) {
            var cell = document.createElement("td")
            row.appendChild(cell)

            if (colWithPeople[j] != null) {
                let people = allPeople[colWithPeople[j]]
                let isOwner = people.sex != false && (people.spouses != null || people.children != null)
                cell.innerHTML += "<div class='nameCell " + (people.sex ? "man" : "woman") + "'>" + 
                    (isOwner ? ("<a href=#familyTable?id=" + people.id + ">") : "") + people.name + (isOwner ? "</a>" : "") + 
                "</div>"
            }
        }
    }
}