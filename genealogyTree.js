function genealogyTreeHandler(params, contentDiv) {
    let container = document.createElement('div')
    container.id = 'chart-container'
    contentDiv.appendChild(container)
    let peopleNode = new Map()
    let genGroups = groupByGen()
    let maxGen = Object.keys(genGroups).length
    // 动规。从最小辈开始，计算节点信息，尤其是children节点，加到父节点上，直至父节点为root
    for (let i = maxGen; i > 0; i--) { 
        let peopleInGen = genGroups[i]
        for (let j = 0; j < peopleInGen.length; j++) {
            let people = allPeople[peopleInGen[j]]
            let node = {'name': people.name}
            if (people.children != undefined) {
                let childrenNode = []
                for (let ci = 0; ci < people.children.length; ci++) {
                    childrenNode.push(peopleNode[people.children[ci]])
                    delete peopleNode[people.children[ci]] // 删除缓存的孩子节点信息，节省内存
                }
                node['children'] = childrenNode
            }
            peopleNode[people.id] = node
        }
    }
    loadFile("https://cdnjs.cloudflare.com/ajax/libs/orgchart/3.1.1/js/jquery.orgchart.min.js", callback = function() {
        var oc = $('#chart-container').orgchart({
            'data': peopleNode[1],
            'nodeTemplate': function(data) {
                return '<div class="nodeTemplate">' + data.name + '</div>'
            }
        });
    })
    loadFile("https://cdnjs.cloudflare.com/ajax/libs/orgchart/3.1.1/css/jquery.orgchart.min.css", callback = function() { })
}