<template>
    <div v-if="family">
        <div style="text-align: left;">
            <div>赵氏第 {{family.owner.genID}} 代</div>
            <div v-if="family.father">上一代户主：
                <router-link :to="{name: 'table', query: {id: family.father.id}}" 
                @click="familyOwnerDidClick(family.father.id)">
                    {{family.father.name}}
                </router-link>
            </div>
            <div>户主：{{family.owner.name}}</div>
        </div>
        <div>
            <el-table :data="tableData" style="width: 100%" border>
                <el-table-column prop="name" label="姓名">
                    <template #default="scope">
                        <router-link v-if="scope.row.id != this.family.owner.id && scope.row.isFamilyOwner()" 
                        :to="{name: 'table', query: {id: scope.row.id}}" 
                        @click="familyOwnerDidClick(scope.row.id)">
                            {{ scope.row.name }}
                        </router-link>
                        <span v-else>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
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
import { inject, watch } from 'vue'
import { useRoute } from 'vue-router' 
import Family from '@/utils/family'

export default {
    data() {
        return {
            globalVars: null,
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
    created() {
        console.log("table created")
        const globalVars = inject("globalVars")
        this.globalVars = globalVars
        watch(() => globalVars.allPeople, () => {
            console.log("table watch")
            this.updateFamilyByQuery()
        })
        return {
            globalVars
        }
    },
    mounted() {
        console.log("table mounted")
        if (this.allPeople() == null) {
            return
        }
        this.updateFamilyByQuery()
    },
    methods: {
        allPeople() {
            if (Object.keys(this.globalVars.allPeople).length > 0) {
                const allPeople = JSON.parse(JSON.stringify(this.globalVars.allPeople))
                return allPeople
            } else {
                return null
            }
        },
        updateFamilyByQuery() {
            if (useRoute() == undefined) {
                console.log("route is null")
                return
            }
            let peopleID = useRoute().query.id
            if (peopleID == undefined) {
                peopleID = "1"
            }
            const allPeople = this.allPeople()
            this.family = new Family(allPeople, peopleID)
        },
        familyOwnerDidClick(peopleID) {
            const allPeople = this.allPeople()
            this.family = new Family(allPeople, peopleID.toString())
        }
    }
}
</script>
