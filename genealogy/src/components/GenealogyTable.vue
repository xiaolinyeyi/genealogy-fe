<template>
    <div v-if="family">
        <div>赵氏第{{family.gen}}代</div>
        <div v-if="family.father">上一代户主：{{family.father.name}}</div>
        <div>户主：{{family.owner.name}}</div>
        <div>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="name" label="姓名"></el-table-column>
                <el-table-column prop="birthdayDes" label="生日"></el-table-column>
                <el-table-column prop="sexDes" label="性别"></el-table-column>
                <el-table-column prop="relationship" label="户主关系"></el-table-column>
                <el-table-column prop="educational" label="	文化程度"></el-table-column>
                <el-table-column prop="lastJob" label="从事职业"></el-table-column>
                <el-table-column prop="nativePlace" label="籍贯"></el-table-column>
                <el-table-column prop="lastHabitation" label="居住地"></el-table-column>
                <el-table-column prop="spouses" label="婚姻"></el-table-column>
                <el-table-column prop="deathdayDes" label="故时"></el-table-column>
                <el-table-column prop="extDes" label="更多"></el-table-column>
            </el-table>
        </div>
    </div>
    <div v-else>数据加载中</div>
</template>

<script>
import { inject } from 'vue'
import { useRoute } from 'vue-router'
export default {
    data() {
        return {
            family: null,
        }
    },
    computed: {
        tableData: function() {
            // 所有人归拢到一起
            let familyPeopleInTable = new Array()
            familyPeopleInTable.push(this.family.owner)
            if (this.family.marriage != null) {
                familyPeopleInTable.push(...this.family.marriage)
            }
            if (this.family.children != null) {
                familyPeopleInTable.push(...this.family.children)
            }
            return familyPeopleInTable
        },
    },
    setup() {
        const allPeople = inject("allPeopleRef")
        return {
            allPeople
        }
    },
    mounted() {
        let peopleID = useRoute().query.id
        if (peopleID == undefined) {
            peopleID = "1"
        }
        this.family = this.allPeople.value.getFamilyInfo(peopleID)
        console.log('--------family-------')
        console.log(this.family)
    },
    methods: {
    }
}
</script>
