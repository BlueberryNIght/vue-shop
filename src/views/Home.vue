<template>
  <h2 @click="loginout">我是主页</h2>
</template>

<script>
export default {
    methods: {
        loginout() {
            this.$message.info('退出登录！')
            this.$router.push('/login')
        }
    }
}
</script>

<style>

</style>