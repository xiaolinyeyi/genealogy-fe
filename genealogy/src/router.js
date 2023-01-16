import { createRouter, createWebHistory } from 'vue-router'
import GenealogyHome from './components/GenealogyHome.vue'
import GenealogyTree from './components/GenealogyTree.vue'
import GenealogyTable from './components/GenealogyTable.vue'
import GenealogySacrifice from './components/GenealogySacrifice.vue'

//路由数组
const routes = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        path: "/home",
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
    },
    {
        path: "/sacrifice",
        name: "sacrifice",
        component: GenealogySacrifice
    }
]
//路由对象
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes //上面的路由数组
})

//导出路由对象，在main.js中引用
export default router