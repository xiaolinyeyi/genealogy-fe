<template>
    <el-menu mode="horizontal" :default-active="$route.path" router="true">
        <el-menu-item index="/home">家族介绍</el-menu-item>
        <el-menu-item index="/tree">家族传承</el-menu-item>
        <el-menu-item index="/table">家庭详情</el-menu-item>
        <el-menu-item index="/sacrifice">供案</el-menu-item>
        <el-menu-item index="/about">关于</el-menu-item>
    </el-menu>
</template>
<script>
  export default {
    
  }
</script>