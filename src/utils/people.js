class People {
    constructor(peopleInfo) {
        if (peopleInfo == null) {
            return null
        }
        this.metadata = peopleInfo
        this.id = peopleInfo.id
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
    isFamilyOwner() {
        if (this.metadata.sex == false) {
            return false
        }
        if (this.metadata.spouses != null && this.metadata.spouses.length > 0) {
            return true
        }
        if (this.metadata.children != null && this.metadata.children.length > 0) {
            return true
        }
        return false
    }
    isDead() {
        return this.deathdayDes != undefined && this.deathdayDes != ""
    }
    sexDes() {
        return this.metadata.sex == false ? "女" : "男"
    }
    birthdayDes() {
        if (this.metadata.ext != null && this.metadata.ext[0]["birthday"] != null) {
            return this.metadata.ext[0]["birthday"]
        }
        if (this.metadata.birthday == null) {
            return "不详"
        } else {
            let date = new Date(this.metadata.birthday.date)
            return date.getFullYear()
        }
    }
    deathdayDes() {
        if (this.metadata.deathday != null) {
            let date = new Date(this.metadata.deathday.date)
            return date.getFullYear()
        } else if (this.metadata.birthday != null) {
            let birthYear = new Date(this.metadata.birthday.date).getFullYear()
            let year = new Date().getFullYear()
            if (year - birthYear > 100) { // 超过100，认为已经去世
                return "不详"
            }
        } else if (this.isSameFamily() && typeof this.birthdayDes != "number") { // 本家生日非数字，一定已经去世，不可考了
            return "不详"
        } else if (typeof this.birthdayDes != "number" && this.metadata.genID < 6) { // 有坑，别人的家谱就会出bug
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
            str = str + "【政治面貌】" + people.politicalStatus + "\n"
        }
        if (people.posts != null) {
            str = str + "【历任职务】" + people.posts[people.posts.length - 1] + "\n"
        }
        if (people.ext != null && people.ext[0].note != null) {
            str = str + "【备注】" + people.ext[0].note + "\n"
        }
        return str
    }
    isSameFamily() {
        if (this.id == 1) {
            return true
        }
        return this.metadata.fatherID != undefined
    }
}

export default People