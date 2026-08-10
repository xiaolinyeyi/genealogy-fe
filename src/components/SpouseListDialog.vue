<template>
    <el-dialog
        :model-value="modelValue"
        title="编辑配偶信息"
        width="640px"
        append-to-body
        :close-on-click-modal="false"
        @update:model-value="close">
        <el-table :data="spouses" border empty-text="暂无配偶">
            <el-table-column prop="name" label="姓名" width="100"/>
            <el-table-column prop="sexDes" label="性别" width="70"/>
            <el-table-column prop="birthdayDes" label="生日" width="110"/>
            <el-table-column prop="time" label="结婚时间"/>
            <el-table-column label="操作" width="90">
                <template #default="scope">
                    <el-button link type="primary" @click="editSpouse(scope.row.id)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button type="primary" @click="addSpouse">新增</el-button>
        </template>
    </el-dialog>
    <people-edit-dialog
        v-model="editVisible"
        :people-id="editingId"
        :ctx="editCtx"/>
</template>

<script>
import People from '@/utils/people.js'
import PeopleEditDialog from './PeopleEditDialog.vue'

export default {
    name: 'SpouseListDialog',
    components: { PeopleEditDialog },
    props: {
        modelValue: { type: Boolean, default: false },
        peopleId: { type: [Number, String], default: null }
    },
    emits: ['update:modelValue'],
    inject: ['globalVars'],
    data() {
        return {
            editVisible: false,
            editingId: null
        }
    },
    computed: {
        owner() {
            if (this.peopleId == null) {
                return null
            }
            return this.globalVars.allPeople[this.peopleId.toString()]
        },
        editCtx() {
            return { ownerId: this.peopleId, relation: 'spouse' }
        },
        spouses() {
            if (this.owner == null || this.owner.spouses == null) {
                return []
            }
            const rows = []
            for (const entry of this.owner.spouses) {
                const metadata = this.globalVars.allPeople[entry.id.toString()]
                if (metadata == null) {
                    continue
                }
                const people = new People(JSON.parse(JSON.stringify(metadata)))
                rows.push({
                    id: people.id,
                    name: people.name,
                    sexDes: people.sexDes,
                    birthdayDes: people.birthdayDes,
                    time: entry.time != null ? entry.time : ''
                })
            }
            return rows
        }
    },
    methods: {
        editSpouse(id) {
            this.editingId = id
            this.editVisible = true
        },
        addSpouse() {
            this.editingId = null
            this.editVisible = true
        },
        close() {
            this.$emit('update:modelValue', false)
        }
    }
}
</script>
