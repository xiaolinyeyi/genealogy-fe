let tdWidth = 50
function genealogyTreeHandler(params, contentDiv) {
    let nodes = []
    let rootID = 1
    for (let peopleID in allPeople) {
        let people = allPeople[peopleID]
        console.log(people)
        if (people.id == rootID) {
            nodes.push({'id': people.id, 'name': people.name})
        } else if (people.fatherID != undefined) {
            nodes.push({'id': people.id, 'name': people.name, 'pid': people.fatherID})
        }
    }
    loadFile('./OrgChartJS/OrgChart.js', callback = function(){
        var chart = new OrgChart(contentDiv, {
            nodeBinding: {
                field_0: "name"
            },
            nodes: nodes,
            zoom: {
                speed: 10,
                smooth: 5
            }
        });
    })
    
}