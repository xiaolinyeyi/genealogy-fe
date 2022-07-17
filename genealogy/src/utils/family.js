class People {
    constructor(peopleInfo) {
        if (peopleInfo == null) {
            return null
        }
        this.metadata = peopleInfo

        this.genID = peopleInfo.genID
        this.name = peopleInfo.name
        this.sexDes = this.sexDes()
        this.nativePlace = peopleInfo.nativePlace
        this.birthdayDes = this.birthdayDes()
        this.deathdayDes = this.deathdayDes()
        this.educational = peopleInfo.educational
        this.lastJob = this.lastJob()
        this.lastHabitation = this.lastHabitation()
        this.extDes = this.extDes()
    }
    sexDes() {
        return this.metadata.sex == false ? "女" : "男"
    }
    birthdayDes() {
        if (this.metadata.ext != null && this.metadata.ext[0]["birthday"] != null) {
            return this.ext[0]["birthday"]
        }
        if (this.metadata.birthday == null) {
            return "不详"
        } else {
            let date = new Date(this.metadata.birthday.iso)
            return date.getFullYear()
        }
    }
    deathdayDes() {
        if (this.metadata.deathday != null) {
            let date = new Date(this.metadata.deathday.iso)
            return date.getFullYear()
        } else if (this.metadata.birthday != null) {
            let birthYear = new Date(this.metadata.birthday.iso).getFullYear()
            let year = new Date().getFullYear()
            if (year - birthYear > 100) { // 超过100，认为已经去世
                return "不详"
            }
        } else if (this.metadata.birthday == null && this.metadata.genID < 6) { // 有坑，别人的家谱就会出bug
            return "不详"
        } else {
            return ""
        }
    }
    lastPost() {
        const posts = this.metadata.posts
        if (posts == undefined) {
            return ""
        }
        return posts[posts.length - 1]
    }
    lastJob() {
        const jobs = this.metadata.jobs
        if (jobs == undefined) {
            return ""
        }
        return jobs[jobs.length - 1]
    }
    lastHabitation() {
        const habition = this.metadata.habitation
        if (habition == undefined) {
            return ""
        }
        return habition[habition.length - 1]
    }
    extDes() {
        let str = ""
        const people = this.metadata
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

Map.prototype.getFamilyInfo = function(peopleID) {
    console.log('get family info, id: ' + peopleID)
    const metadata = this.get(peopleID)
    console.log('get family info: ' + metadata)
    let people = new People(metadata)
    console.log(people)
    if (people == null || people.sex == false) {
        return null
    } 
    people.relationship = "户主"

    var father = null
    if (metadata.fatherID != null) {
        father = new People(this.get(metadata.fatherID.toString()))
    }
    var mother = null
    if (metadata.motherID != null) {
        mother = new People(this.get(metadata.motherID.toString()))
    }
    var marriage = null
    if (metadata.spouses != null && metadata.spouses.length > 0) {
        marriage = new Array()
        for (let i = 0; i < metadata.spouses.length; i++) {
            const spouse = metadata.spouses[i]
            let wife = new People(this.get(spouse.id.toString()))
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
    var children = null
    if (metadata.children != null && metadata.children.length > 0) {
        children = new Array()
        for (let k = 0; k < metadata.children.length; k++) {
            const childID = metadata.children[k]
            let child = new People(this.get(childID.toString()))
            if (child != null) {
                child.relationship = child.metadata.sex == false ? "女" : "子"
                if (child.metadata.spouses != null) { // 显示最后一次婚姻状态
                    let lastSpouse = child.metadata.spouses[child.metadata.spouses.length - 1]
                    let spouseDes = "" 
                    if (lastSpouse.id != null) {
                        spouseDes = spouseDes + "【姓名】" + this.get(lastSpouse.id.toString()).name + "\n"
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
    return {
        "gen": people.genID, 
        "owner": people, 
        "father": father, 
        "mother": mother, 
        "marriage": marriage, 
        "children": children}
}