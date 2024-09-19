<template>
    <div v-if="zuxun">
        <h2>族训</h2>
        <div>{{ zuxun }}</div>
    </div>
    <div v-if="zibei">
        <h2>字辈表</h2>
        <el-row :gutter="10" v-for="i in (isMobile ? [0, 1] : [0])" :key="i">
            <el-col :span="isMobile ? 10 : 6" v-for="j in (isMobile ? [0, 1] : [0, 1, 2, 3])" :key="j">
                <el-table :data="this.getZibeiByGroup(i * 2 + j)" :border=true>
                    <el-table-column prop="gen" label="代数" />
                    <el-table-column prop="name" label="辈字" />
                </el-table>
            </el-col>
    </el-row>
    </div>
</template>
<script>

import { inject, watch } from 'vue'

export default {
    data() {
        return {
            zuxun: null,
            zibei: null,
            isMobile: false
        }
    },
    created() {
        const globalVars = inject("globalVars")
        watch(() => globalVars.baseInfo, (newValue) => {
            const baseInfo = JSON.parse(JSON.stringify(newValue))
            this.zuxun = baseInfo["zuxun"]
            this.zibei = baseInfo["zibei"]
        })
        return {
            globalVars
        }
    },
    methods: {
        getZibeiByGroup: function(group) {
            let zibei = []
            for (var i = group * 10; i < (group + 1) * 10; i++) {
                zibei.push({
                    "gen": "第" + (i + 1) + "代",
                    "name": this.zibei[i]
                })
            }
            return zibei
        }
    },
    mounted() {
        console.log('home mounted')
        if (window.innerWidth <= 768) {
            this.isMobile = true;
        } else {
            this.isMobile = false;
        }

        const globalVars = inject("globalVars")
        const baseInfo = JSON.parse(JSON.stringify(globalVars.baseInfo))
        this.zuxun = baseInfo["zuxun"]
        this.zibei = baseInfo["zibei"]
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