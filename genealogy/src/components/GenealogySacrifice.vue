<template>
      <el-timeline style="margin-top:50px">
        <el-timeline-item v-for="(ancestor, index) in ancestors" :key="index"> 
            <el-row>
                <el-col :span="1" v-for="(people, index) in ancestor" :key="index">
                    {{ people.name }}
                </el-col>
            </el-row>
        </el-timeline-item>
    </el-timeline>
</template>
<script>
import { inject } from 'vue'
import People from '@/utils/family.js'
export default {
    data() {
        return {
            ancestors: []
        }
    },
    setup() {
        const allPeople = inject("allPeopleRef")
        return {
            allPeople
        }
    },
    mounted() {
        this.createSacrificeArr()
    },
    methods: {
        createSacrificeArr() {
            for (const peopleKV of this.allPeople.value) {
                const metadata = peopleKV[1]
                let people = new People(metadata)
                if (people.genID == undefined) {
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