<template>
  <el-scrollbar>
    <div style="width:5000px;height:1400px">
        <!--tree-org属性说明：https://sangtian152.github.io/vue3-tree-org/demo/#attributes-->
        <vue3-tree-org 
        :data="rootNode"           
        :disabled=true
        :horizontal=false
        :collapsable=false
        :scalable=false
        v-if="rootNode">
        <template v-slot="{node}">
            <div style="width:20px; height: 75px;">
                <router-link :to="{name: 'table', query: {id: node.id}}" v-if="peopleIsFamilyOwnerWithID(node.id)">
                    {{node.label}}
                </router-link>
                <div v-else>
                    {{node.label}}
                </div>
            </div>
        </template>
        </vue3-tree-org>
        <div v-else>数据加载中</div>
        <!-- <div @click="snap">snap</div> -->
    </div>
  </el-scrollbar>
</template>

<script>
import { inject, watch } from 'vue'
import People from '@/utils/people.js'
import html2canvas from 'html2canvas'

export default {
    data() {
        return {
            allPeople: null,
            rootNode: null
        }
    },
    created() {
        console.log("tree created")
        const globalVars = inject("globalVars")
        this.allPeople = JSON.parse(JSON.stringify(globalVars.allPeople))
        watch(() => globalVars.allPeople, (newValue) => {
            console.log("tree watch")
            this.allPeople = JSON.parse(JSON.stringify(newValue))
            const node = this.generatePeopleNode(this.allPeople)
            this.rootNode = node
        })
        return {
            globalVars
        }
    },
    mounted() {
        console.log("tree mounted")
        this.rootNode = this.generatePeopleNode(this.allPeople)
    },
    methods: {
        groupByGen: function(allPeople) { // 每代人放到一个数组中
            var map = new Map()
            for (var key in allPeople) {
                const people = allPeople[key]
                if (people.genID == null) {
                    continue
                }
                let isZhao = (people.fatherID != undefined && people.fatherID != 0)
                if (!isZhao && people.id != 1) {
                    continue
                }
                if (map[people.genID] == null) {
                    map[people.genID] = new Array()
                }
                map[people.genID].push(people.id)
            }
            return map
        },
        // 是否为户主（男性，有配偶或者孩子）
        peopleIsFamilyOwnerWithID: function(peopleID) {
            if (peopleID == undefined) { return false }
            let metadata = this.allPeople[peopleID.toString()]
            let people = new People(metadata)
            return people.isFamilyOwner()
        },
        // 生成orgchart需要的格式
        generatePeopleNode: function(allPeople) {
            if (allPeople == undefined) {
                return undefined
            }
            let peopleNode = new Map()
            let genGroups = this.groupByGen(allPeople)
            let maxGen = Object.keys(genGroups).length
            // 动规。从最小辈开始，计算节点信息，尤其是children节点，加到父节点上，直至父节点为root
            for (let i = maxGen; i > 0; i--) { 
                let peopleInGen = genGroups[i]
                for (let j = 0; j < peopleInGen.length; j++) {
                    let people = allPeople[peopleInGen[j].toString()]
                    let node = {'label': people.name, 'id': people.id, 'isOwner': this.peopleIsFamilyOwnerWithID(people.id)}
                    if (people.children != undefined) {
                        let childrenNode = []
                        for (let ci = 0; ci < people.children.length; ci++) {
                            childrenNode.push(peopleNode[people.children[ci]])
                            delete peopleNode[people.children[ci]] // 删除缓存的孩子节点信息，节省内存
                        }
                        node['children'] = childrenNode
                    }
                    peopleNode[people.id] = node
                }
            }
            return peopleNode[1] // 只保留根节点，其他节点可以删除了
        },
        /// 截图
        snap: function() {
            let tree = document.getElementsByClassName("tree-org")[0]
            html2canvas(tree).then((canvas) => {
                // 这里可以将 canvas 添加到页面中或者进行其他操作
                document.body.appendChild(canvas);
            })
        }
    }
  }
</script>
