<template>
  <div class="login-container">
    <!-- 头像框 -->
    <div class="login-box">
      <div class="avater-box">
        <img src="~assets/logo.png" alt />
      </div>
      <!-- 表单区域 -->
      <el-form ref="form" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-edit" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="restForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单数据对象
      loginForm: {
        username: "admin",
        password: "123456"
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    // 表单重置:调用表单对象的resetFields()方法
    restForm() {
      this.$refs.form.resetFields();
    },
    // 表单验证validate(valid => {})  valid回调函数  通过返回true,不通过返回false
    login() {
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        // axios请求(url, 参数)
        const { data: res } = await this.$http.post("login", this.loginForm);
        //根据status状态判断是否登录成功
        if (res.meta.status !== 200)
          return this.$message.error("登录失败请重新输入！");
        this.$message.success("登录成功！！！");
        //获取token
        // console.log(res.data.token);
        // 将token保存到sessionStorage中
        window.sessionStorage.setItem('token', res.data.token);
        this.$router.push('/home')
      });
    }
  }
};
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
.login-form {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>