<template>
  <div class="login-container">
    <!-- 头像框 -->
    <div class="login-box">
      <div class="avater-box">
        <img src="~assets/logo.png" alt />
      </div>
      <!-- 表单区域 -->
      <el-form ref="form" class="login-form">
        <el-form-item >
          <el-input  prefix-icon="iconfon icon-yonghu"></el-input>
        </el-form-item>
        <el-form-item >
          <el-input  prefix-icon="iconfon icon-icon2"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary">登录</el-button>
          <el-button type="info">重置</el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.login-container {
  background-color: #2b4b6b;
  height: 100%;
  overflow: hidden;
}
.login-box {
  width: 450px;
  height: 300px;
  background: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avater-box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 0 10px #eee;
  position: absolute;
  background-color: #fff;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
}
.avater-box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #eee;
}
.login-form{
  width: 100%;
  padding:0 20px;
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
}
.btns{
  display: flex;
  justify-content: flex-end;
}
</style>