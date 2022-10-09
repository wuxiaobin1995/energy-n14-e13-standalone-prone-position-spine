<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 14:54:04
 * @LastEditTime: 2022-01-18 21:23:12
 * @Description : 管理员信息修改页面
-->
<template>
  <div class="admin-edit">
    <el-form
      class="update-form"
      :model="updateForm"
      :rules="updateRules"
      ref="updateForm"
      label-width="auto"
      label-position="right"
    >
      <!-- 账号 -->
      <el-form-item label="账号：">
        <el-input v-model.trim="updateForm.adminId" disabled></el-input>
      </el-form-item>
      <!-- 密码 -->
      <el-form-item label="密码：" prop="adminPassword">
        <el-input
          v-model.trim="updateForm.adminPassword"
          placeholder="请输入管理员密码（限16字符）"
          maxlength="16"
          show-password
        ></el-input>
      </el-form-item>

      <!-- 按钮组 -->
      <el-form-item>
        <div class="update-form__btn">
          <!-- 更新管理员信息按钮 -->
          <el-button
            class="update-form__btn--update"
            type="primary"
            @click="handleAdminUpdate('updateForm')"
            >更 新</el-button
          >
          <!-- 刷新页面按钮 -->
          <el-button type="success" @click="handleRefresh">重 置 表 单</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'admin-edit',

  data() {
    return {
      updateForm: {
        adminId: '',
        adminPassword: ''
      },
      updateRules: {
        adminPassword: [
          { required: true, message: '请输入管理员密码', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', false)
    this.getAdminData() // 从localStorage中获取管理员的校验账号、密码
  },

  methods: {
    /**
     * @description: 从localStorage中获取管理员的校验账号、密码
     */
    getAdminData() {
      if (!window.localStorage.getItem('adminIdVerify')) {
        window.localStorage.setItem('adminIdVerify', 'energy')
      }
      this.updateForm.adminId = window.localStorage.getItem('adminIdVerify')
      if (!window.localStorage.getItem('adminPasswordVerify')) {
        window.localStorage.setItem('adminPasswordVerify', 'energy')
      }
      this.updateForm.adminPassword = window.localStorage.getItem(
        'adminPasswordVerify'
      )
    },

    /**
     * @description: 更新按钮
     * @param {*} formName 表单的ref名字
     */
    handleAdminUpdate(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.updateAdmin()
        } else {
          return false
        }
      })
    },

    /**
     * @description: 更新管理员信息逻辑函数
     */
    updateAdmin() {
      /* 只允许修改管理员密码，账号永远是"energy" */
      window.localStorage.setItem(
        'adminPasswordVerify',
        this.updateForm.adminPassword
      )
      this.$store
        .dispatch('setCurrentAdmin', {
          adminId: this.updateForm.adminId,
          adminPassword: this.updateForm.adminPassword
        })
        .then(() => {
          this.$message({
            message: '修改管理员信息成功',
            type: 'success',
            duration: 3000
          })
        })
        .then(() => {
          this.handleRefresh()
        })
        .catch(() => {
          this.$alert(`设置Vuex失败，请刷新页面，然后重试！`, '警告', {
            type: 'error',
            showClose: false,
            confirmButtonText: '刷新页面',
            callback: () => {
              this.handleRefresh()
            }
          })
        })
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: '/layout/admin-edit',
          duration: 100
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-edit {
  width: 100%;
  height: 100%;
  @include flex(row, center, flex-start);

  .update-form {
    margin-top: 20vh;
    width: 36%;
    .update-form__btn {
      @include flex(row, space-between, center);
      .update-form__btn--update {
        width: 200px;
      }
    }
  }
}
</style>
