<template>
  <el-container id="home">
    <!-- 头部区域 -->
    <el-header>
      <div class="title">
        <img src="~assets/img/logo.png" alt />
        <div>电商后台管理系统</div>
      </div>
      <el-button type="info" @click="loginout">退出</el-button>
    </el-header>
    <!-- 内容区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px' : '200px'" class="aside">
        <div class="toggle" @click="toggleChange">|||</div>
        <el-menu
          :default-active="this.$router.history.current.path"
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse='isCollapse'
          :collapse-transition='false'
          :router="true"
          >
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容主体 -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      isCollapse: false,
      iconsObj: {
        "125": "el-icon-s-custom icon",
        "103": "el-icon-s-tools icon",
        "101": "el-icon-s-goods icon",
        "102": "el-icon-s-order icon",
        "145": "el-icon-s-marketing icon"
      }
    };
  },
  created() {
    this.getMenusList();
  },
  methods: {
    loginout() {
      this.$message.info("退出登录！");
      // 清除token
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取侧边菜单数据
    async getMenusList() {
      const { data: res } = await this.$http.get("/menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
    },
    // 收缩菜单栏
    toggleChange() {
      this.isCollapse = !this.isCollapse
    }
  }
};
</script>

<style scoped>
#home {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 25px 12px 0;
  color: #fff;
}
.el-header .title {
  height: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 22px;
}
.el-header .title img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}
.el-aside {
  background-color: #333744;
  overflow: hidden;
}
.el-menu {
  border-right: none;
}
.el-main {
  background-color: #eaedf1;
}
.icon{
  margin-right: 10px;
}
.toggle{
  background: #4a5064;
  line-height: 25px;
  text-align: center;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  letter-spacing: .1em;
}
</style>>
