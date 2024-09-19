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

    let cacheMap = JSON.parse(localStorage.getItem(this.cacheKey))
    // this.allPeopleRef.value = new Map(Object.entries(cacheMap.response.data))
    // this.allPeople = cacheMap.response.data
    console.log("creating!!!")
    console.log(cacheMap)

    // test just cache
    // this.allPeopleRef.value = new Map(Object.entries(cacheMap.response.data))
    // console.log(this.allPeopleRef.value)
    // this.allPeople = cacheMap.response.data
    
  },
  setup() {
    const globalVars = reactive({
      meta: {},
      baseInfo: {},
      allPeople: {}
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

        // 取meta
        _this.globalVars.meta = jsonData["meta"]
        _this.title = _this.globalVars.meta["title"]
        // 取baseInfo
        _this.globalVars.baseInfo = jsonData["baseInfo"]
        // 取allPeople
        const allPeople = jsonData["allPeople"]
        let allPeopleMap = new Map()
        for (var i = 0; i < allPeople.length; i++) {
          let people = allPeople[i]
          allPeopleMap[people.id] = people
        }
        _this.globalVars.allPeople = allPeopleMap
        _this.allPeople = allPeopleMap
      };
      reader.readAsText(file);
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
