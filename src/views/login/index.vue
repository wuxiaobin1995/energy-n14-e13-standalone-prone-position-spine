<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 11:55:47
 * @LastEditTime: 2022-06-22 09:37:09
 * @Description : 登录主页面
-->
<template>
  <div class="login">
    <!-- 动能Logo -->
    <div class="logo">
      <el-image class="logo__img" :src="logoSrc" fit="fit"></el-image>
      <div class="logo__des">
        <div class="logo__des__item">广东安捷力运动康复有限公司</div>
        <div class="logo__des__item">
          专注于高效的医学运动康复、竞技体能训练和军队体能训练，并致力于运动器械和康复器械的研发与生产
        </div>
      </div>
    </div>

    <!-- 登录标签页 -->
    <el-tabs
      class="login-tabs"
      v-model="activeName"
      stretch
      :before-leave="handleTabsClick"
    >
      <!-- 普通用户登录 -->
      <el-tab-pane label="普通用户" name="普通用户">
        <div class="login-tabs__item">
          <el-form>
            <!-- 跳转至登录选择页面按钮 -->
            <el-form-item>
              <el-button
                :disabled="
                  this.$store.state.isfacilityExpire === 1 ? false : true
                "
                class="login-tabs__item--loginBtn"
                type="primary"
                @click="handleToUserLoginSelect"
                >用 户 列 表</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 管理员登录 -->
      <el-tab-pane label="管理员" name="管理员">
        <div class="login-tabs__item">
          <el-form :model="adminForm" :rules="adminRules" ref="adminForm">
            <!-- 账号 -->
            <el-form-item prop="adminId">
              <el-input
                class="login-tabs__item--input"
                v-model.trim="adminForm.adminId"
                prefix-icon="el-icon-user"
                placeholder="请输入管理员账号（限16字符）"
                maxlength="16"
              >
              </el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item prop="adminPassword">
              <el-input
                class="login-tabs__item--input"
                v-model.trim="adminForm.adminPassword"
                prefix-icon="el-icon-key"
                placeholder="请输入管理员密码（限16字符）"
                maxlength="16"
                show-password
              ></el-input>
            </el-form-item>
            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                :disabled="
                  this.$store.state.isfacilityExpire === 1 ? false : true
                "
                class="login-tabs__item--loginBtn"
                type="primary"
                @click="handleAdminLogin('adminForm')"
                >登 录</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 按钮组 -->
    <div class="register-btn" v-show="activeName === '普通用户'">
      <!-- 跳转至注册按钮 -->
      <el-button
        :disabled="this.$store.state.isfacilityExpire === 1 ? false : true"
        type="text"
        @click="handleToRegister"
        >注册账户</el-button
      >
    </div>

    <!-- 语音相关 -->
    <div class="audio-control">
      <el-switch
        v-model="switchValue"
        active-text="开"
        inactive-text="关"
        @change="handleSwitchChange"
      >
      </el-switch>
      <el-switch
        style="display: block"
        v-model="baseSrcValue"
        active-color="#13ce66"
        inactive-color="#409EFF"
        active-text="普通话"
        inactive-text="粤语"
        @change="handleBaseSrcChange"
      >
      </el-switch>
    </div>

    <!-- 底部信息 -->
    <div class="foot">
      <div>Copyright © Guangdong Energy Life Sport Rehabilitation Company</div>
      <div class="foot__info">
        <div class="foot__info--item">
          设备编号：{{
            this.$store.state.facilityID
              ? this.$store.state.facilityID
              : '未注册'
          }}
        </div>
        <div class="foot__info--item">
          设备期限：{{
            this.$store.state.facilityDeadline
              ? this.$store.state.facilityDeadline
              : '无'
          }}
        </div>
      </div>
    </div>

    <!-- 打开控制台按钮 -->
    <el-button
      class="btn-control"
      type="info"
      size="mini"
      @click="handleOpenDev"
      >Open Dev</el-button
    >
  </div>
</template>

<script>
/* 用于打开控制台 */
import { remote } from 'electron'

export default {
  name: 'login',

  data() {
    return {
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标
      activeName: '普通用户',

      /* 管理员 */
      adminForm: {
        adminId: '',
        adminPassword: ''
      },
      adminRules: {
        adminId: [
          { required: true, message: '请输入管理员账号', trigger: 'blur' }
        ],
        adminPassword: [
          { required: true, message: '请输入管理员密码', trigger: 'blur' }
        ]
      },

      /* 管理员校验账号、密码 */
      adminIdVerify: '',
      adminPasswordVerify: '',

      /* 语音相关 */
      switchValue: true,
      baseSrcValue: true
    }
  },

  created() {
    this.getAdminData() // 从localStorage中获取管理员的校验账号、密码

    this.$store.dispatch('setVoiceSwitch', true)
    this.$store.dispatch('setVoiceBaseSrc', 'mandarin')
  },

  methods: {
    /**
     * @description: 从localStorage中获取管理员的校验账号、密码
     */
    getAdminData() {
      if (!window.localStorage.getItem('adminIdVerify')) {
        window.localStorage.setItem('adminIdVerify', 'energy')
      }
      this.adminIdVerify = window.localStorage.getItem('adminIdVerify')
      if (!window.localStorage.getItem('adminPasswordVerify')) {
        window.localStorage.setItem('adminPasswordVerify', 'energy')
      }
      this.adminPasswordVerify = window.localStorage.getItem(
        'adminPasswordVerify'
      )
    },

    /**
     * @description: 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换
     * @param {*} activeName 新tab
     * @param {*} oldActiveName 旧tab
     */
    handleTabsClick(activeName, oldActiveName) {
      /* 清空内容，并去除校验结果 */
      this.adminForm.adminId = ''
      this.adminForm.adminPassword = ''
      this.$refs['adminForm'].clearValidate()
    },

    /**
     * @description: 跳转至普通用户登录选择页面按钮
     */
    handleToUserLoginSelect() {
      this.$router.push({ path: '/login-select' })
    },

    /**
     * @description: 管理员-登录按钮
     * @param {String} formName 表单的ref名字
     */
    handleAdminLogin(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.adminForm.adminId === this.adminIdVerify) {
            if (this.adminForm.adminPassword === this.adminPasswordVerify) {
              this.$store
                .dispatch('setCurrentAdmin', {
                  adminId: this.adminForm.adminId,
                  adminPassword: this.adminForm.adminPassword
                })
                .then(() => {
                  this.$message({
                    message: '管理员登录成功',
                    type: 'success',
                    duration: 2000
                  })
                })
                .then(() => {
                  this.$router.push({ path: '/layout/home' })
                })
                .catch(() => {
                  this.$message({
                    message: '管理员登录校验出错，请重启软件！',
                    type: 'error'
                  })
                })
                .finally(() => {
                  this.$store.dispatch('setCurrentUser', {
                    userId: '',
                    userName: '',
                    birthday: '',
                    sex: ''
                  })
                })
            } else {
              this.$message({
                message: '管理员密码错误',
                type: 'error'
              })
            }
          } else {
            this.$message({
              message: '管理员账号错误',
              type: 'error'
            })
          }
        } else {
          return false
        }
      })
    },

    /**
     * @description: 跳转至注册按钮
     */
    handleToRegister() {
      this.$router.push({ path: '/register' })
    },

    /**
     * @description: 语音开关
     */
    handleSwitchChange() {
      if (this.switchValue === true) {
        this.$store.dispatch('setVoiceSwitch', true)
      } else {
        this.$store.dispatch('setVoiceSwitch', false)
      }
    },
    /**
     * @description: 语音基础地址
     */
    handleBaseSrcChange() {
      if (this.baseSrcValue === true) {
        this.$store.dispatch('setVoiceBaseSrc', 'mandarin')
      } else {
        this.$store.dispatch('setVoiceBaseSrc', 'Cantonese')
      }
    },

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
.login {
  width: 100%;
  height: 100%;
  @include flex(column, flex-start, center);
  @include bg-img(
    '../../assets/img/Background _Image/common_bg_img.png',
    repeat
  );

  /* 动能Logo */
  .logo {
    margin: 80px 0 40px 0;
    @include flex(column);
    .logo__img {
      width: 300px;
      margin-bottom: 4px;
    }
    .logo__des {
      color: rgba(0, 0, 0, 0.5);
      font-size: 14px;
      .logo__des__item {
        margin: 6px 0;
        @include flex();
      }
    }
  }

  /* 登录标签页 */
  .login-tabs {
    // 修改字体大小
    & /deep/ .el-tabs__item {
      font-size: 16px;
    }
    .login-tabs__item {
      width: 400px;
      @include flex();
      .login-tabs__item--input {
        width: 400px;
      }
      .login-tabs__item--loginBtn {
        margin-top: 20px;
        width: 400px;
      }
    }
  }

  /* 按钮组 */
  .register-btn {
    width: 400px;
    @include flex(row, flex-end);
  }

  /* 语音相关 */
  .audio-control {
    margin-top: 50px;
    width: 360px;
    @include flex(row, space-between, center);
  }

  /* 底部信息 */
  .foot {
    flex: 1;
    @include flex(column, flex-end, center);
    margin-bottom: 14px;
    color: rgba(0, 0, 0, 0.5);
    font-size: 14px;
    .foot__info {
      margin-top: 5px;
      @include flex(row, center, center);
      .foot__info--item {
        margin: 0 15px;
        color: rgba(0, 128, 0, 0.8);
      }
    }
  }

  /* 打开控制台按钮 */
  .btn-control {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>
