<template>
    <div>
        <h2>数据说明</h2>
        本页面仅解析、展示家谱数据，不做数据存储。请家谱管理员妥善保存家谱数据
    </div>
    <div v-if="about">
        <h2>家谱管理员</h2>
        <el-table :data="contacts" style="width: 30%" border stripe>
            <el-table-column prop="name" label="姓名"></el-table-column>
            <el-table-column prop="phone" label="电话"></el-table-column>
        </el-table>
    </div>
    <div>
        <h2>技术支持</h2>
        xk_zhao@outlook.com
    </div>
    <div v-if="about" style="text-align: center;margin-top: 20px;color: dimgray;">家谱更新于{{ updateTime }}</div>
</template>
<script>
import { inject, watch } from 'vue'

export default {
    data() {
        return {
            about: null
        }
    },
    computed: {
        updateTime: function() {
            return this.about["updateTime"]
        },
        contacts: function() {
            return this.about["contacts"]
        }
    },
    created() {
        const globalVars = inject("globalVars")
        watch(() => globalVars.about, (newValue) => {
            this.about = JSON.parse(JSON.stringify(newValue))
            console.log(this.about)
        })
        return {
            globalVars
        }
    },
    methods: {
        
    },
    mounted() {
        console.log("about mounted")
        const globalVars = inject("globalVars")
        this.about = JSON.parse(JSON.stringify(globalVars.about))
        console.log(this.about.updateTime)
    }
}
</script>
<style scoped>
div, h2 {
    text-align: left;
}
.el-row {
  margin-bottom: 20px;
}
.el-col-1 {
    max-width: 50px;
    margin: 1px;
}
</style>