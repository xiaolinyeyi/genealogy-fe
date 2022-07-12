<template>
  <div style="height: 4000px;width: 10000px;">
  <!--tree-org属性说明：https://sangtian152.github.io/vue3-tree-org/demo/#attributes-->
    <vue3-tree-org 
    :data="rootNode"           
    :disabled=true
    :horizontal=false
    :collapsable=false
    :scalable=false
    v-if="rootNode"/>
    <div v-else>数据加载中</div>
  </div>
</template>

<script>
import { inject } from 'vue'

export default {
    data() {
        return {
            rootNode: null
        }
    },
    setup() {
        const allPeople = inject("allPeopleRef")
        return {
            allPeople
        }
    },
    mounted() { // 有数据之后才开始加载子组件
        const node = this.generatePeopleNode(this.allPeople.value)
        console.log(node)
        this.rootNode = node
    },
    methods: {
        groupByGen: function(allPeople) { // 每代人放到一个数组中
            var map = new Map()
            for (var key in allPeople) {
                var people = allPeople[key]
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
            let people = this.allPeople.value[peopleID]
            if (people.sex == false) {
                return false
            }
            if (people.spouses != null && people.spouses.length > 0) {
                return true
            }
            if (people.children != null && people.children.length > 0) {
                return true
            }
            return false
        },
        // 生成orgchart需要的格式
        generatePeopleNode: function(allPeople) {
            let peopleNode = new Map()
            let genGroups = this.groupByGen(allPeople)
            let maxGen = Object.keys(genGroups).length
            // 动规。从最小辈开始，计算节点信息，尤其是children节点，加到父节点上，直至父节点为root
            for (let i = maxGen; i > 0; i--) { 
                let peopleInGen = genGroups[i]
                for (let j = 0; j < peopleInGen.length; j++) {
                    let people = allPeople[peopleInGen[j]]
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
        }
    }
  }
</script>
