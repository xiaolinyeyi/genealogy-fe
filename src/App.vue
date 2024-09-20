<template>
    <h1 v-if="title">{{ title }}</h1>
    <input type="file" accept=".json" @change="handleSelectFile" :style="{float: title == null ? 'center' : 'right'}"/>
  <div>
    <navigation-bar v-if="allPeople"></navigation-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'
import { provide, reactive } from 'vue'

export default {
  name: 'App',
  data: function() {
    return {
      allPeople: null,
      title: null
    }
  },
  components: {
    NavigationBar,
  },

  created: function() { // 创建时加载数据
    this.createCacheIfNeeded()

    let cacheLastGenealogy = JSON.parse(localStorage.getItem("lastGenealogy"))
    if (cacheLastGenealogy != undefined) {
      this.initGlobalVarsWithJSON(cacheLastGenealogy)
    }
    console.log("creating!!!")
    console.log(cacheLastGenealogy)

    // test just cache
    // this.allPeopleRef.value = new Map(Object.entries(cacheMap.response.data))
    // console.log(this.allPeopleRef.value)
    // this.allPeople = cacheMap.response.data
    
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
    createCacheIfNeeded: function() {
      let cache = JSON.parse(localStorage.getItem(this.cacheKey))
      let changed = false
      if (cache == undefined) {
        cache = new Map()
        changed = true
      }
      if (cache.local == undefined) {
        cache.local = new Map()
        changed = true
      }
      if (changed) {
        localStorage.setItem(this.cacheKey, JSON.stringify(cache))
      }
    },
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
        _this.initGlobalVarsWithJSON(jsonData)
        localStorage.setItem("lastGenealogy", JSON.stringify(jsonData))
      };
      reader.readAsText(file);
    },
    initGlobalVarsWithJSON: function(jsonData) {
      // 取meta
      this.globalVars.meta = jsonData["meta"]
      this.title = this.globalVars.meta["title"]
      // 取baseInfo
      this.globalVars.baseInfo = jsonData["baseInfo"]
      // 取allPeople
      const allPeople = jsonData["allPeople"]
      let allPeopleMap = new Map()
      for (var i = 0; i < allPeople.length; i++) {
        let people = allPeople[i]
        allPeopleMap[people.id] = people
      }
      this.globalVars.allPeople = allPeopleMap
      this.allPeople = allPeopleMap
      // 取about
      this.globalVars.about = jsonData["about"]
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
</style>
