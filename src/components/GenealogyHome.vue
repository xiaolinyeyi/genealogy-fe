<template>
    <h2>族训</h2>
    <div>
        几长者共谋，立家案百愿呼。村东老茔穴尽水，各支于清末时，民故，觅佳城立墓，分而仰先。为聚祖力量，歌祖宗功德，永言孝思，而立我族家案。定立我族家规家训，以规范后人；记载族人功德，以勉励后人。强优我族，众志成城。虽社稷传优去弼，过己训群，优秀后人，贡献社会。再者，名讳不乱，长幼有序，扬我族威。长辈存载力，宜子宜孙，千古留芳
    </div>
    <h2>字辈表</h2>
    <el-row :gutter="10" v-for="i in (isMobile ? [0, 1] : [0])" :key="i">
        <el-col :span="isMobile ? 10 : 6" v-for="j in (isMobile ? [0, 1] : [0, 1, 2, 3])" :key="j">
            <el-table :data="this.getZibeiByGroup(i * 2 + j)" :border=true>
                <el-table-column prop="gen" label="代数" />
                <el-table-column prop="name" label="辈字" />
            </el-table>
        </el-col>
  </el-row>
</template>
<script>
export default {
    data() {
        return {
            zibei: [
                "子", "林", "壮", "连", "喜", "富", "文", "进", "彦", "晓", 
                "春", "龙", "勤", "学", "贤", "博", "雅", "如", "清", "淳", 
                "天", "乾", "坤", "浩", "魁", "星", "盖", "端", "正", "方",
                "忠", "谦", "礼", "聪", "惠", "敏", "秉", "权", "殿", "修"
            ],
            isMobile: false
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