<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 11:56:29
 * @LastEditTime: 2022-03-05 18:39:13
 * @Description : 注册页面
-->
<template>
  <div class="register">
    <!-- 动能Logo -->
    <div class="logo">
      <el-image class="logo__img" :src="logoSrc" fit="fit"></el-image>
    </div>

    <!-- 注册表单 -->
    <el-form
      class="register-form"
      :model="registerForm"
      :rules="registerRules"
      ref="registerForm"
      label-width="auto"
      label-position="right"
    >
      <!-- 用户名 -->
      <el-form-item label="用户名：" prop="userName">
        <el-input
          v-model.trim="registerForm.userName"
          placeholder="请输入用户名（必填，限16字符）"
          maxlength="16"
          show-word-limit
        ></el-input>
      </el-form-item>
      <!-- 出生日期 -->
      <el-form-item label="出生日期：" prop="birthday">
        <el-date-picker
          v-model="registerForm.birthday"
          type="date"
          placeholder="请选择日期（必填）"
          :editable="false"
          value-format="yyyy-MM-dd"
        >
        </el-date-picker>
      </el-form-item>
      <!-- 性别 -->
      <el-form-item label="性别：">
        <el-radio-group v-model="registerForm.sex">
          <el-radio label="1">男性</el-radio>
          <el-radio label="0">女性</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 按钮组 -->
      <el-form-item>
        <div class="register-form__btn">
          <!-- 注册按钮 -->
          <el-button
            class="register-form__btn--register"
            type="primary"
            v-loading.fullscreen.lock="fullscreenLoading"
            @click="handleUserRegister('registerForm')"
            >注 册</el-button
          >
          <!-- 跳转至登录按钮 -->
          <el-button type="text" @click="handleToLogin"
            >使用已有账户登录</el-button
          >
        </div>
      </el-form-item>
    </el-form>

    <!-- 底部版权信息 -->
    <div class="foot">
      Copyright © Guangdong Energy Life Sport Rehabilitation Company
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'register',

  data() {
    return {
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标
      fullscreenLoading: false,

      /* 普通用户 */
      registerForm: {
        userName: '', // 用户名
        birthday: '', // 出生日期
        sex: '1' // 性别，'1'男，'0'女
      },
      registerRules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        birthday: [
          {
            required: true,
            message: '出生日期不能为空',
            trigger: 'change'
          }
        ]
      }
    }
  },

  methods: {
    /**
     * @description: 注册按钮
     * @param {String} formName 表单的ref名字
     */
    handleUserRegister(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.registerUser()
        } else {
          return false
        }
      })
    },

    /**
     * @description: 注册新用户逻辑函数
     */
    registerUser() {
      const facilityID = window.localStorage.getItem('facilityID')
      this.fullscreenLoading = true
      this.$axios
        .post('/registerUserName', {
          devices_name: facilityID,
          user_name: this.registerForm.userName,
          birthday: this.registerForm.birthday,
          sex: this.registerForm.sex
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 注册成功 */
            this.$router.push({ path: '/' })
            this.$message({
              message: `[状态码为 ${data.status}] 用户注册成功`,
              type: 'success',
              duration: 3000
            })
          } else if (data.status === 0) {
            /* 注册失败 */
            this.$alert(
              `[状态码为 ${data.status}] 注册失败，请重试！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '确 定',
                callback: () => {}
              }
            )
          } else if (data.status === -5) {
            /* 该用户已存在 */
            this.$alert(
              `[状态码为 ${data.status}] 该用户名已存在，请重新输入！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '确 定',
                callback: () => {}
              }
            )
          } else if (data.status === -9) {
            /* 该设备编号不存在 */
            this.$alert(
              `[状态码为 ${data.status}] 该设备编号不存在，请重启软件！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '关闭软件',
                callback: () => {
                  ipcRenderer.send('close') // 关闭整个程序
                }
              }
            )
          } else if (data.status === -11) {
            /* 传参错误 */
            this.$alert(
              `[状态码为 ${data.status}] [${data.message}] 传参错误，请重启软件！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '关闭软件',
                callback: () => {
                  ipcRenderer.send('close') // 关闭整个程序
                }
              }
            )
          }
        })
        .catch(err => {
          this.$alert(
            `[注册新用户环节] ${err}。请确保网络连接正常，然后重新注册！`,
            '网络请求错误',
            {
              type: 'error',
              showClose: false,
              confirmButtonText: '确 定',
              callback: () => {}
            }
          )
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 跳转至登录按钮
     */
    handleToLogin() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="scss" scoped>
.register {
  width: 100%;
  height: 100%;
  @include flex(column, flex-start, center);
  @include bg-img(
    '../../assets/img/Background _Image/common_bg_img.png',
    repeat
  );

  /* 动能Logo */
  .logo {
    margin: 20px 0 60px 0;
    @include flex(column);
    .logo__img {
      width: 300px;
    }
  }

  /* 注册表单 */
  .register-form {
    width: 40%;
    .register-form__btn {
      @include flex(row, space-between, center);
      .register-form__btn--register {
        width: 200px;
      }
    }
  }

  /* 底部版权信息 */
  .foot {
    flex: 1;
    @include flex(row, center, flex-end);
    margin-bottom: 14px;
    color: rgba(0, 0, 0, 0.5);
    font-size: 14px;
  }
}
</style>
