import { createRouter, createWebHistory } from 'vue-router'
import GenealogyHome from './components/GenealogyHome.vue'
import GenealogyTree from './components/GenealogyTree.vue'
import GenealogyTable from './components/GenealogyTable.vue'

//路由数组
const routes = [
    {
        path: "/",
        name: "home",
        component: GenealogyHome,
    },
    {
        path: "/tree",
        name: "tree",
        component: GenealogyTree
    },
    {
        path: "/table",
        name: "table",
        component: GenealogyTable
    }
]
//路由对象
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes //上面的路由数组
})

//导出路由对象，在main.js中引用
export default router