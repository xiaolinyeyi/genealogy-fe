import People from "./people"

class Family {
    constructor(allPeople, ownerID) {
        if (allPeople == null || allPeople == undefined || Object.keys(allPeople).length == 0) {
            return null
        }
        // 户主
        const metadata = allPeople[ownerID]
        let people = new People(metadata)
        if (people == null || people.sex == false) {
            return null
        } 
        people.relationship = "户主"
        this.owner = people

        // 父亲
        var father = null
        if (metadata.fatherID != null) {
            father = new People(allPeople[metadata.fatherID.toString()])
        }
        this.father = father

        // 母亲
        var mother = null
        if (metadata.motherID != null) {
            mother = new People(allPeople[metadata.motherID.toString()])
        }
        this.mother = mother

        // 配偶
        var marriage = null
        if (metadata.spouses != null && metadata.spouses.length > 0) {
            marriage = new Array()
            for (let i = 0; i < metadata.spouses.length; i++) {
                const spouse = metadata.spouses[i]
                let wife = new People(allPeople[spouse.id.toString()])
                if (wife != null) {
                    wife.relationship = "夫妻"
                    let spouseDes = "" 
                    if (spouse.time != null) {
                        spouseDes = spouseDes + "【时间】" + spouse.time + "\n"
                    }
                    if (spouse.place != null) {
                        spouseDes = spouseDes + "【地址】" + spouse.place + "\n"
                    }
                    marriage.push(wife)
                }
            }
        }
        this.marriage = marriage

        // 孩子
        var children = null
        if (metadata.children != null && metadata.children.length > 0) {
            children = new Array()
            for (let k = 0; k < metadata.children.length; k++) {
                const childID = metadata.children[k]
                let child = new People(allPeople[childID.toString()])
                if (child != null) {
                    child.relationship = child.metadata.sex == false ? "女" : "子"
                    if (child.metadata.spouses != null) { // 显示最后一次婚姻状态
                        let lastSpouse = child.metadata.spouses[child.metadata.spouses.length - 1]
                        let spouseDes = "" 
                        if (lastSpouse.id != null) {
                            spouseDes = spouseDes + "【姓名】" + allPeople[lastSpouse.id.toString()].name + "\n"
                        }
                        if (lastSpouse.time != null) {
                            spouseDes = spouseDes + "【时间】" + lastSpouse.time + "\n"
                        }
                        if (lastSpouse.place != null) {
                            spouseDes = spouseDes + "【地址】" + lastSpouse.place + "\n"
                        }
                        child.spouses = spouseDes
                    }
                    children.push(child)
                }
            }
        }
        this.children = children
    }
}
export default Family