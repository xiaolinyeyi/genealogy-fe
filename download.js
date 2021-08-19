function downloadHandler(params, contentDiv) {
    // 封面
    let coverDiv = document.createElement("div")
    coverDiv.innerHTML = "西同下村赵氏家谱"
    coverDiv.id = "cover"
    contentDiv.appendChild(coverDiv)
    let pageSperate1 = document.createElement("div")
    pageSperate1.style["page-break-after"] = "always"
    pageSperate1.innerHTML = "<br>"
    contentDiv.appendChild(pageSperate1)
    // 祖训 todo
    let zuxunDiv = document.createElement("div")
    zuxunDiv.innerHTML = "祖训<br>" + zuxun()
    zuxunDiv.id = "zuxun"
    contentDiv.appendChild(zuxunDiv)
    let pageSperate2 = document.createElement("div")
    pageSperate2.style["page-break-after"] = "always"
    pageSperate2.innerHTML = "<br>"
    contentDiv.appendChild(pageSperate2)
    // 家庭
    let rootID = 1
    let familyIDMap = {rootID: 1}
    let familyOwnerArray = [rootID] // 所有户主
    let index = 0
    while (index < familyOwnerArray.length) {
        let people = allPeople[familyOwnerArray[index]]
        let children = people.children
        if (children != null) {
            for (let i = 0; i < children.length; i++) {
                let child = children[i]
                if (peopleIsFamilyOwnerWithID(child)) {
                    familyOwnerArray.push(child)
                }
            }
        }
        index++
    }
    for (let i = 0; i < familyOwnerArray.length; i++) {
        let ownerID = familyOwnerArray[i]
        familyIDMap[ownerID] = i + 1
        let owner = allPeople[ownerID]
        let extTitle = ""
        if (owner.fatherID != null) {
            extTitle = "（从第" + familyIDMap[owner.fatherID]  + "页转来，本页号码" + (i + 1) + ")"
        } else {
            extTitle = "（本页号码1）"
        }
        familyTableHandler({"id": ownerID, "title": "赵氏第" + owner.genID + "代" + extTitle + "<br>"}, contentDiv)
        let pageSperate = document.createElement("div")
        pageSperate.style["page-break-after"] = "always"
        pageSperate.innerHTML = "<br>"
        contentDiv.appendChild(pageSperate)
    }
    setTimeout(function() {
        // window.print()
    }, 1000)
}