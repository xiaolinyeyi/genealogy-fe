<template>
    <h1 v-if="title">{{ title }}</h1>
    <div class="file-entry" :style="{float: title == null ? 'none' : 'right'}">
      <el-button v-if="canWriteBack" type="primary" plain @click="handleOpenFile">
        {{ allPeople ? '重新打开家谱' : '打开家谱' }}
      </el-button>
      <input v-else type="file" accept=".json" @change="handleSelectFile"/>
    </div>
  <div>
    <navigation-bar v-if="allPeople"></navigation-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'
import { provide, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { supportsFileSystemAccess, openGenealogyFile, applyGenealogyJSON } from '@/utils/store'

export default {
  name: 'App',
  data: function() {
    return {
      canWriteBack: supportsFileSystemAccess()
    }
  },
  computed: {
    title: function() {
      return this.globalVars.meta != null ? this.globalVars.meta.title : null
    },
    allPeople: function() {
      return Object.keys(this.globalVars.allPeople).length > 0 ? this.globalVars.allPeople : null
    }
  },
  components: {
    NavigationBar,
  },

  created: function() { // 创建时加载数据
    let cacheLastGenealogy = JSON.parse(localStorage.getItem("lastGenealogy"))
    if (cacheLastGenealogy != undefined) {
      applyGenealogyJSON(this.globalVars, cacheLastGenealogy)
    }
  },
  setup() {
    const globalVars = reactive({
      meta: {},
      baseInfo: {},
      allPeople: {},
      about: {}
    })
    provide('globalVars', globalVars)

    return {
      globalVars
    }
  },
  methods: {
    handleSelectFile: function(event) {
      const file = event.target.files[0]
      if (file == undefined) {
        return
      }
      const _this = this
      const reader = new FileReader()
      reader.onload = function(e) {
        const fileContent = e.target.result
        const jsonData = JSON.parse(fileContent)
        applyGenealogyJSON(_this.globalVars, jsonData)
        localStorage.setItem("lastGenealogy", fileContent)
      };
      reader.readAsText(file);
    },
    // 支持 File System Access API 时走这里，拿到可写句柄，编辑后能直接写回原文件
    handleOpenFile: async function() {
      try {
        const text = await openGenealogyFile()
        applyGenealogyJSON(this.globalVars, JSON.parse(text))
        localStorage.setItem("lastGenealogy", text)
      } catch (error) {
        if (error.name == "AbortError") { // 用户取消选择
          return
        }
        ElMessage.error("打开家谱失败：" + error.message)
      }
    }
  }
}

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
a {
  text-decoration: none;
}
a:visited {
  color: blue;
}
.file-entry {
  margin: 0 10px 10px 10px;
}
</style>
