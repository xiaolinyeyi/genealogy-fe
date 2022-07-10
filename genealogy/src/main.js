import { createApp } from 'vue'
import App from './App.vue'
import ElementUI from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router.js'

createApp(App)
.use(ElementUI)
.use(router)
.mount("#app")

