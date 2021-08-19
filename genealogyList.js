function genealogyListHandler(params, contentDiv) {
    let ul = document.createElement('ul')
    ul.id = 'org'
    ul.style = ul.style + 'display:none'
    contentDiv.appendChild(ul)
    var genGroups = groupByGen()
    var maxGen = Object.keys(genGroups).length

    // 统计每个人最长一代总数，该数决定了树的宽度
    // 每个人最大长度为：各个孩子最大长度之和
    var maxWidth = new Map()
    for (var i = 1; i <= maxGen; i++) {
        var peopleInGen = genGroups[i]
        for (var j = 0; j < peopleInGen.length; j++) {
            var people = allPeople[peopleInGen[j]]
            if (people.id != 1 && (people.fatherID == undefined || people.fatherID == 0)) {
                continue;
            }
            let li = document.createElement('li')
            li.innerText = people.name
            li.id = 'liid' + people.id
            if (people.id == 1) {
                ul.appendChild(li)
            } else {
                let fatherLi = document.getElementById('liid' + people.fatherID)
                let fatherUl = document.getElementById('ulid' + people.fatherID)
                if (fatherUl == undefined) {
                    fatherUl = document.createElement('ul')
                    fatherUl.id = 'ulid' + people.fatherID
                    fatherLi.appendChild(fatherUl)
                }
                fatherUl.appendChild(li)
            }
        }
    }
}
