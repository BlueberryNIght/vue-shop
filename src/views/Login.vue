<template>
  <div class="login-container">
    <div class="login-box">
      <div class="avater-box">
        <img src="~assets/logo.png" alt="">
      </div>
    </div>
    <el-form ref="form"  label-width="80px">
      <el-form-item label="活动名称">
        <el-input ></el-input>
      </el-form-item>
      <el-form-item label="活动名称">
        <el-input ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.login-container{
    background-color: #2b4b6b;
    height: 100%;
    overflow: hidden;
}
.login-box{
  width: 450px;
  height:300px;
  background: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avater-box{
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
.avater-box img{
  width: 100%;
  height: 100%;
  border-radius:50%;
  background: #eee;
}

</style>