<template>
  <el-scrollbar>
    <div style="width:100vw;height:100vh">
        <!--tree-org属性说明：https://sangtian152.github.io/vue3-tree-org/demo/#attributes-->
        <vue3-tree-org 
        :data="rootNode"           
        :disabled=true
        :horizontal=false
        :collapsable=false
        :scalable=false
        v-if="rootNode"
        style="margin: 20px;">
        <template v-slot="{node}">
            <div style="width:20px; height: 75px;" @contextmenu.prevent="showMenu($event, node)">
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
    </div>
  </el-scrollbar>
  <ul v-if="menu.visible" class="people-context-menu" :style="{left: menu.x + 'px', top: menu.y + 'px'}">
    <li v-for="item in menuItems" :key="item.key" class="people-context-menu__item" @click="onMenuClick(item.key)">
        {{ item.label }}
    </li>
  </ul>
  <people-edit-dialog v-model="peopleDialog.visible" :people-id="peopleDialog.peopleId" :ctx="peopleDialog.ctx"/>
  <spouse-list-dialog v-model="spouseDialog.visible" :people-id="spouseDialog.peopleId"/>
  <!-- <div @click="snap">snap</div> -->
  <div style="height: 200px;"></div>
</template>

<script>
import { inject, watch } from 'vue'
import People from '@/utils/people.js'
import html2canvas from 'html2canvas'
import PeopleEditDialog from './PeopleEditDialog.vue'
import SpouseListDialog from './SpouseListDialog.vue'

export default {
    components: { PeopleEditDialog, SpouseListDialog },
    data() {
        return {
            allPeople: null,
            rootNode: null,
            menu: { visible: false, x: 0, y: 0, peopleId: null },
            peopleDialog: { visible: false, peopleId: null, ctx: null },
            spouseDialog: { visible: false, peopleId: null }
        }
    },
    computed: {
        // 本家男性可编辑个人信息、配偶、新增子女；本家女性只开放配偶
        menuItems() {
            const metadata = this.menuPeople()
            if (metadata == null) {
                return []
            }
            const people = new People(metadata)
            if (!people.isSameFamily()) {
                return []
            }
            if (metadata.sex === false) {
                return [{ key: 'spouse', label: '编辑配偶信息' }]
            }
            return [
                { key: 'self', label: '编辑个人信息' },
                { key: 'spouse', label: '编辑配偶信息' },
                { key: 'child', label: '新增子女' }
            ]
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
        document.addEventListener("click", this.closeMenu)
    },
    unmounted() {
        document.removeEventListener("click", this.closeMenu)
    },
    methods: {
        menuPeople: function() {
            if (this.menu.peopleId == null || this.allPeople == null) {
                return null
            }
            return this.allPeople[this.menu.peopleId.toString()]
        },
        showMenu: function(event, node) {
            this.menu = { visible: true, x: event.clientX, y: event.clientY, peopleId: node.id }
        },
        closeMenu: function() {
            this.menu.visible = false
        },
        onMenuClick: function(key) {
            const peopleId = this.menu.peopleId
            this.closeMenu()
            if (key == 'self') {
                this.peopleDialog = { visible: true, peopleId: peopleId, ctx: null }
            } else if (key == 'child') {
                this.peopleDialog = { visible: true, peopleId: null, ctx: { ownerId: peopleId, relation: 'child' } }
            } else if (key == 'spouse') {
                this.spouseDialog = { visible: true, peopleId: peopleId }
            }
        },
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
            console.log("snap")
            let tree = document.getElementsByClassName("tree-org")[0]
            html2canvas(tree).then((canvas) => {
                // 这里可以将 canvas 添加到页面中或者进行其他操作
                document.body.appendChild(canvas);
            })
        }
    }
  }
</script>

<style>
.zm-draggable {
    margin-bottom: 20px;
    margin-right: 20px;
}
.people-context-menu {
    position: fixed;
    z-index: 3000;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    min-width: 130px;
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.people-context-menu__item {
    padding: 6px 16px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
}
.people-context-menu__item:hover {
    background-color: #ecf5ff;
    color: #409eff;
}
</style>