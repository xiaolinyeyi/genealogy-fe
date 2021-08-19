let tdWidth = 50
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
    peopleColMap[root] = 0 // 每个人所在的列数

    var tableMaxWidth = maxWidth[root]
    var tableMaxHeight = maxGen

    table.style.width = tableMaxWidth * tdWidth + "px"

    for (var i = 1; i <= tableMaxHeight; i++) {
        let peopleInGen = genGroups[i]
        let colWithPeople = new Map() // col: peopleID
        // 把下一代位置安排好
        for (let j = 0; j < peopleInGen.length; j++) {
            let peopleID = peopleInGen[j]
            let people = allPeople[peopleID]
            if (people.children != null) {
                for (let m = 0; m < people.children.length; m++) {
                    if (m == 0) { // 第一个孩子，应该和父亲一列
                        peopleColMap[people.children[m]] = peopleColMap[peopleID]
                    } else { // 不是第一个孩子，应该是前面兄弟所在列+兄弟宽度
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

        let lastPeopleIndex = -1 // 注意这是列的索引，不是人的id
        for (var j = 0; j < tableMaxWidth; j++) {
            if (lastPeopleIndex != -1 && j >= lastPeopleIndex && j < lastPeopleIndex + maxWidth[colWithPeople[lastPeopleIndex]]) {
                continue
            }
            var cell = document.createElement("td")
            row.appendChild(cell)

            if (colWithPeople[j] != null) {
                let peopleID = colWithPeople[j]
                let people = allPeople[peopleID]
                let isOwner = people.sex != false && (people.spouses != null || people.children != null)
                // top
                let topP = document.createElement("p")
                topP.className = "topP"
                if (peopleID != root) {
                    topP.className = topP.className + " parentline"
                }
                cell.appendChild(topP)

                // middle
                let nameDiv = document.createElement("div")
                nameDiv.className = "nameCell"
                if (people.sex) {
                    nameDiv.className = nameDiv.className + " man"
                } else {
                    nameDiv.className = nameDiv.className + " woman"
                }
                if (isOwner) {
                    nameDiv.innerHTML = "<a href=#familyTable?id=" + people.id + ">" + people.name + "</a>"
                } else {
                    nameDiv.innerHTML = people.name
                }
                cell.appendChild(nameDiv)

                // bottom
                let bottomP = document.createElement("p")
                bottomP.className = "bottomP"
                if (people.children != null && people.children.length > 0) {
                    bottomP.className = bottomP.className + " childrenline"
                } else {
                    bottomP.className = bottomP.className + " n-childrenline"
                }
                cell.appendChild(bottomP)

                // bottom line
                if (people.children != null && people.children.length > 1) {
                    let cellWidth = tdWidth * 0.99
                    let firstChildID = people.children[0]
                    let firstWidth = maxWidth[firstChildID] * cellWidth
                    let lastChildID = people.children[people.children.length - 1]
                    let lastWidth = maxWidth[lastChildID] * cellWidth
                    let bottomWidth = firstWidth / 2 + lastWidth / 2
                    for (let ci = 1; ci < people.children.length - 1; ci++) {
                        bottomWidth = bottomWidth + maxWidth[people.children[ci]] * cellWidth
                    }
                    let bottomLine = document.createElement("div")
                    bottomLine.style.marginLeft = firstWidth / 2 + "px"
                    bottomLine.style.width = bottomWidth + "px"
                    bottomLine.className = "bottomline"
                    cell.appendChild(bottomLine)
                }
                cell.colSpan = maxWidth[peopleID]
                lastPeopleIndex = j
            }
        }
    }
}