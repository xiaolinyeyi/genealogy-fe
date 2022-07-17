import { createApp } from 'vue'
import App from './App.vue'
import ElementUI from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router.js'
import vue3TreeOrg from 'vue3-tree-org'
import "vue3-tree-org/lib/vue3-tree-org.css"
import "@/utils/family"

createApp(App)
.use(ElementUI)
.use(router)
.use(vue3TreeOrg)
.mount("#app")