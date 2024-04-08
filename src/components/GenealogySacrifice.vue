<template>
      <el-timeline style="margin-top:10px">
        <el-timeline-item v-for="(ancestor, index) in ancestors" :key="index"> 
            <el-row>
                <el-col :span="1" v-for="(people, index) in ancestor" :key="index">
                    <el-container>
                        <el-main>{{ people.name }}</el-main>
                        <!-- <el-footer>{{ people.birthdayDes + "\n|\n" + people.deathdayDes }}</el-footer> -->
                    </el-container>
                </el-col>
            </el-row>
        </el-timeline-item>
    </el-timeline>
</template>
<script>
import { inject, watch } from 'vue'
import People from '@/utils/people.js'
export default {
    data() {
        return {
            globalVars: null,
            ancestors: []
        }
    },
    created() {
        const globalVars = inject("globalVars")
        this.globalVars = globalVars
        watch(() => globalVars.allPeople, () => {
            this.createSacrificeArr()
        })
        return {
            globalVars
        }
    },
    mounted() {
        this.createSacrificeArr()
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
        createSacrificeArr() {
            this.ancestors = []
            const allPeople = this.allPeople()
            for (const key in allPeople) {
                const metadata = allPeople[key]
                let people = new People(metadata)
                if (people.genID == undefined) {
                    continue
                }
                if (people.sexDes === "女") {
                    continue
                }
                if (!people.isDead()) {
                    continue
                }
                var arr = this.ancestors[people.genID - 1]
                if (arr == undefined) {
                    arr = [people]
                } else {
                    arr.push(people)
                }
                this.ancestors[people.genID - 1] = arr
            }
        }
    }
}
</script>
<style>
.el-container {
    width: 50px;
    border-width: 1px;
    border-radius: 5px;
    border-color: black;
    border-style: solid;
}
.el-col-1 {
    max-width: 50px;
    margin: 1px;
}
.el-main {
    height: 100px; 
    padding-left: 17px;
}
.el-footer {
    height: 60px;
}
</style>