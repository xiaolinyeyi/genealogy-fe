<template>
    <el-dialog
        :model-value="modelValue"
        :title="dialogTitle"
        width="560px"
        append-to-body
        :close-on-click-modal="false"
        @update:model-value="close">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" label-position="left">
            <el-form-item label="代数">
                <span class="readonly-text">{{ genText }}</span>
            </el-form-item>
            <el-form-item label="父亲">
                <span class="readonly-text">{{ fatherText }}</span>
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="必填"/>
            </el-form-item>
            <el-form-item label="性别">
                <el-radio-group v-model="form.sex">
                    <el-radio :label="true">男</el-radio>
                    <el-radio :label="false">女</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="isSpouseRelation" label="结婚时间">
                <el-input v-model="form.marriageTime" placeholder="如 2014.12.22"/>
            </el-form-item>
            <el-form-item label="生日">
                <el-select v-model="form.birthdayCalendar" class="calendar-select">
                    <el-option v-for="item in calendars" :key="item" :label="item" :value="item"/>
                </el-select>
                <el-input v-model="form.birthdayText" class="date-input" placeholder="如 1966-09-03，或“三国时期”"/>
            </el-form-item>
            <el-form-item label="忌日">
                <el-select v-model="form.deathdayCalendar" class="calendar-select">
                    <el-option v-for="item in calendars" :key="item" :label="item" :value="item"/>
                </el-select>
                <el-input v-model="form.deathdayText" class="date-input" placeholder="留空表示健在"/>
            </el-form-item>
            <el-form-item label="籍贯">
                <el-input v-model="form.nativePlace"/>
            </el-form-item>
            <el-form-item label="居住地">
                <el-select v-model="form.habitation" multiple filterable allow-create default-first-option
                    class="tags-select" placeholder="可填多个，回车确认"/>
            </el-form-item>
            <el-form-item label="文化程度">
                <el-input v-model="form.educational"/>
            </el-form-item>
            <el-form-item label="政治面貌">
                <el-input v-model="form.politicalStatus"/>
            </el-form-item>
            <el-form-item label="职业">
                <el-select v-model="form.jobs" multiple filterable allow-create default-first-option
                    class="tags-select" placeholder="可填多个，回车确认"/>
            </el-form-item>
            <el-form-item label="职务">
                <el-select v-model="form.posts" multiple filterable allow-create default-first-option
                    class="tags-select" placeholder="可填多个，回车确认"/>
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="form.note" type="textarea" :rows="2"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button type="primary" :disabled="!canConfirm" :loading="saving" @click="confirm">确认</el-button>
        </template>
    </el-dialog>
</template>

<script>
import { nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { dateFieldText, dateFieldCalendar, setDateField, savePeople } from '@/utils/store'

function emptyForm() {
    return {
        name: '',
        sex: true,
        marriageTime: '',
        birthdayCalendar: '农历',
        birthdayText: '',
        deathdayCalendar: '农历',
        deathdayText: '',
        nativePlace: '',
        habitation: [],
        educational: '',
        politicalStatus: '',
        jobs: [],
        posts: [],
        note: ''
    }
}

export default {
    name: 'PeopleEditDialog',
    props: {
        modelValue: { type: Boolean, default: false },
        // 编辑已有的人时传 id，新增时传 null
        peopleId: { type: [Number, String], default: null },
        // { ownerId, relation: 'child' | 'spouse' | null }
        ctx: { type: Object, default: null }
    },
    emits: ['update:modelValue', 'saved'],
    inject: ['globalVars'],
    data() {
        return {
            form: emptyForm(),
            snapshot: '',
            original: null,
            saving: false,
            calendars: ['农历', '公历'],
            rules: {
                name: [{ required: true, message: '请填写姓名', trigger: ['blur', 'change'] }]
            }
        }
    },
    computed: {
        isCreating() {
            return this.peopleId == null
        },
        relation() {
            return this.ctx != null ? this.ctx.relation : null
        },
        isSpouseRelation() {
            return this.relation == 'spouse'
        },
        owner() {
            if (this.ctx == null || this.ctx.ownerId == null) {
                return null
            }
            return this.globalVars.allPeople[this.ctx.ownerId.toString()]
        },
        dialogTitle() {
            if (!this.isCreating) {
                return '编辑个人信息'
            }
            if (this.relation == 'child') {
                return '新增子女'
            }
            if (this.relation == 'spouse') {
                return '新增配偶'
            }
            return '新增个人信息'
        },
        genText() {
            if (!this.isCreating) {
                return this.original != null && this.original.genID != null ? '第 ' + this.original.genID + ' 代' : '不详'
            }
            if (this.owner == null || this.owner.genID == null) {
                return '不详'
            }
            const gen = this.relation == 'child' ? Number(this.owner.genID) + 1 : Number(this.owner.genID)
            return '第 ' + gen + ' 代（自动生成）'
        },
        fatherText() {
            if (!this.isCreating) {
                if (this.original == null || this.original.fatherID == null) {
                    return '—'
                }
                return this.peopleName(this.original.fatherID)
            }
            if (this.relation == 'child' && this.owner != null) {
                return this.owner.name
            }
            return '—'
        },
        canConfirm() {
            if (this.form.name.trim() == '') {
                return false
            }
            return JSON.stringify(this.form) != this.snapshot
        }
    },
    watch: {
        modelValue(visible) {
            if (visible) {
                this.reset()
            }
        }
    },
    methods: {
        peopleName(id) {
            const people = this.globalVars.allPeople[id.toString()]
            return people != null ? people.name : '不详'
        },
        reset() {
            const form = emptyForm()
            const defaultCalendar = this.globalVars.meta != null ? this.globalVars.meta.defaultCalendar : '农历'
            form.birthdayCalendar = defaultCalendar || '农历'
            form.deathdayCalendar = form.birthdayCalendar

            if (this.isCreating) {
                this.original = null
                // 新增配偶时性别与本人相反
                if (this.relation == 'spouse' && this.owner != null) {
                    form.sex = !(this.owner.sex !== false)
                }
            } else {
                const metadata = this.globalVars.allPeople[this.peopleId.toString()]
                this.original = JSON.parse(JSON.stringify(metadata))
                form.name = metadata.name || ''
                form.sex = metadata.sex !== false
                form.birthdayText = dateFieldText(metadata, 'birthday')
                form.birthdayCalendar = dateFieldCalendar(metadata, 'birthday', defaultCalendar)
                form.deathdayText = dateFieldText(metadata, 'deathday')
                form.deathdayCalendar = dateFieldCalendar(metadata, 'deathday', defaultCalendar)
                form.nativePlace = metadata.nativePlace || ''
                form.habitation = metadata.habitation != null ? metadata.habitation.slice() : []
                form.educational = metadata.educational || ''
                form.politicalStatus = metadata.politicalStatus || ''
                form.jobs = metadata.jobs != null ? metadata.jobs.slice() : []
                form.posts = metadata.posts != null ? metadata.posts.slice() : []
                form.note = metadata.note || ''
            }
            if (this.isSpouseRelation) {
                form.marriageTime = this.currentMarriageTime()
            }
            this.form = form
            this.snapshot = JSON.stringify(form)
            // 组件实例复用，清掉上次留下的校验状态
            nextTick(() => {
                if (this.$refs.formRef != null) {
                    this.$refs.formRef.clearValidate()
                }
            })
        },
        currentMarriageTime() {
            if (this.owner == null || this.owner.spouses == null || this.peopleId == null) {
                return ''
            }
            const entry = this.owner.spouses.find((item) => Number(item.id) == Number(this.peopleId))
            return entry != null && entry.time != null ? entry.time : ''
        },
        buildPeople() {
            const people = this.original != null ? JSON.parse(JSON.stringify(this.original)) : {}
            people.name = this.form.name.trim()
            people.sex = this.form.sex
            people.nativePlace = this.form.nativePlace.trim()
            people.educational = this.form.educational.trim()
            people.politicalStatus = this.form.politicalStatus.trim()
            people.note = this.form.note.trim()
            people.habitation = this.form.habitation.slice()
            people.jobs = this.form.jobs.slice()
            people.posts = this.form.posts.slice()
            setDateField(people, 'birthday', this.form.birthdayCalendar, this.form.birthdayText)
            setDateField(people, 'deathday', this.form.deathdayCalendar, this.form.deathdayText)
            return people
        },
        async confirm() {
            this.saving = true
            try {
                const context = {
                    ownerId: this.ctx != null ? this.ctx.ownerId : null,
                    relation: this.relation,
                    marriageTime: this.form.marriageTime
                }
                const result = await savePeople(this.globalVars, this.buildPeople(), context)
                if (result.persisted == 'file') {
                    if (result.reloaded) {
                        ElMessage.success('已保存到家谱文件，并重新加载')
                    } else {
                        ElMessage.warning('已保存到家谱文件，但重新加载失败，页面展示的是内存数据')
                    }
                } else {
                    ElMessage.warning('当前浏览器不支持写回文件，已导出为新的 json')
                }
                this.$emit('saved')
                this.$emit('update:modelValue', false)
            } catch (error) {
                if (error.name == 'AbortError') { // 用户在保存对话框里点了取消
                    ElMessage.info('已取消保存，改动未生效')
                } else {
                    ElMessage.error('保存失败：' + error.message)
                }
            } finally {
                this.saving = false
            }
        },
        close() {
            this.$emit('update:modelValue', false)
        }
    }
}
</script>

<style scoped>
.readonly-text {
    color: #909399;
}
.calendar-select {
    width: 90px;
    margin-right: 8px;
}
.date-input {
    width: 260px;
}
.tags-select {
    width: 100%;
}
</style>
