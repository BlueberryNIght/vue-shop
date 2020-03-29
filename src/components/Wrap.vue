<template>
  <div class="warp">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, index) in title" :key="index">{{item}}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <slot name="card"></slot>
    </el-card>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: Array
    }
  }
};
</script>

<style>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1;
}
.el-card {
  margin-top: 15px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
}
.el-table{
  margin-top: 15px;
  font-size: 12px;
}
</style>