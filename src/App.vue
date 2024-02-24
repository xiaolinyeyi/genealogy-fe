<template>
  <h1>西同下赵氏家谱</h1>
  <div>
    <navigation-bar v-if="globalVars.allPeople"></navigation-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'
import { jsonp } from 'vue-jsonp'
import { provide, reactive } from 'vue'

export default {
  name: 'App',
  data: function() {
    return {
      // allPeople: null
    }
  },
  computed: {
    cacheKey: function(){
      return "genealogy.cache"
    }
  },
  components: {
    NavigationBar,
  },

  created: function() { // 创建时加载数据
    this.createCacheIfNeeded()

    let cacheMap = JSON.parse(localStorage.getItem(this.cacheKey))
    let userInfo = cacheMap.local.userInfo
    if (userInfo == undefined) {
      userInfo = prompt("请输入分配的密码：")
      cacheMap.local.userInfo = userInfo
    }
    // test just cache
    // this.allPeopleRef.value = new Map(Object.entries(cacheMap.response.data))
    // console.log(this.allPeopleRef.value)
    // this.allPeople = cacheMap.response.data
    
    let cacheVersion = ''
    if (cacheMap.response != undefined && cacheMap.response.version != undefined) {
      cacheVersion = cacheMap.response.version
    }
    this.getPeopleInfo({'userInfo': userInfo, 'version': cacheVersion}, (response) => {
      if (response.userLevel < 0) {
        alert("用户信息有误，无权查看")
        localStorage.removeItem(this.cacheKey)
        return
      }
      if (response.error != undefined) {
        alert(response.error)
        localStorage.removeItem(this.cacheKey)
        return
      }
      if (cacheVersion != response.version) { // cache需要更新
        cacheMap.response = response
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheMap))
        this.globalVars.allPeople = response.data
        this.allPeople = response.data
        console.log('没有命中缓存')
        console.log(this.allPeople)
      } else { // 直接使用本地缓存
        console.log('命中缓存')
        this.globalVars.allPeople = cacheMap.response.data
        this.allPeople = cacheMap.response.data
        console.log(this.allPeople)
      }
    })
    
  },
  setup() {
    const globalVars = reactive({
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
    getPeopleInfo: function(query, handler) {
      const host = "https://7br8y2rw0tat2.cfc-execute.bj.baidubce.com/genealogy"
      jsonp(host, {
        callbackQuery: "callback", // 这俩参数是什么规则 
        callbackName: "callback", 
        cmd: "fetch",
        userInfo: query.userInfo,
        version: query.version
      }).then((response) => {
        handler(response)
      })
    },
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
