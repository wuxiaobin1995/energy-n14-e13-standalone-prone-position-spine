<!--
 * @Author      : Mr.bin
 * @Date        : 2021-12-14 09:59:19
 * @LastEditTime: 2021-12-14 11:16:01
 * @Description : 开发者页面
-->
<template>
  <div class="developer">
    <el-card>
      <div class="main">
        <el-button class="btn" type="success" round @click="handleOpenDev"
          >打开控制台</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script>
/* 用于打开控制台 */
import { remote } from 'electron'

export default {
  name: 'developer',

  methods: {
    /**
     * @description: 打开控制台
     */
    handleOpenDev() {
      this.$prompt('请输入密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^htpm$/,
        inputErrorMessage: '密码不正确',
        showClose: true,
        closeOnClickModal: false
      })
        .then(() => {
          try {
            remote.getCurrentWebContents().openDevTools()
          } catch (err) {
            this.$message({
              type: 'error',
              message: `打开控制台失败：${err}`
            })
          }
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.developer {
  width: 100%;
  height: 100%;
  padding: 40px;

  .main {
    @include flex(row, center, center);
    .btn {
      font-size: 30px;
    }
  }
}
</style>
