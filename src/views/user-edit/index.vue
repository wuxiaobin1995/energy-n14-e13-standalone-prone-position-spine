<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 14:51:57
 * @LastEditTime: 2022-01-26 09:55:56
 * @Description : 个人信息修改页面
-->
<template>
  <div class="user-edit">
    <el-form
      class="update-form"
      :model="updateForm"
      :rules="updateRules"
      ref="updateForm"
      label-width="auto"
      label-position="right"
    >
      <!-- 用户名 -->
      <el-form-item label="用户名：">
        <el-input v-model.trim="updateForm.userName" disabled></el-input>
      </el-form-item>
      <!-- 出生日期 -->
      <el-form-item label="出生日期：" prop="birthday">
        <el-date-picker
          v-model="updateForm.birthday"
          type="date"
          placeholder="请选择日期（必填）"
          :editable="false"
          value-format="yyyy-MM-dd"
        >
        </el-date-picker>
      </el-form-item>
      <!-- 性别 -->
      <el-form-item label="性别：">
        <el-radio-group v-model="updateForm.sex">
          <el-radio label="1">男性</el-radio>
          <el-radio label="0">女性</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 按钮组 -->
      <el-form-item>
        <div class="update-form__btn">
          <!-- 更新个人信息按钮 -->
          <el-button
            class="update-form__btn--update"
            type="primary"
            v-loading.fullscreen.lock="fullscreenLoading"
            @click="handleUserUpdate('updateForm')"
            >更 新</el-button
          >
          <!-- 刷新页面 -->
          <el-button type="success" @click="handleRefresh">重 置 表 单</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'user-edit',

  data() {
    return {
      fullscreenLoading: false,

      updateForm: {
        userId: this.$store.state.currentUser.userId, // 用户ID
        userName: this.$store.state.currentUser.userName, // 用户名
        birthday: this.$store.state.currentUser.birthday, // 出生日期
        sex: this.$store.state.currentUser.sex === '男' ? '1' : '0' // 性别，'1'男，'0'女
      },
      updateRules: {
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

  created() {
    this.$store.dispatch('setIsCollapse', false)
  },

  methods: {
    /**
     * @description: 更新按钮
     * @param {String} formName 表单的ref名字
     */
    handleUserUpdate(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.updateUser()
        } else {
          return false
        }
      })
    },

    /**
     * @description: 更新个人信息逻辑函数
     */
    updateUser() {
      const facilityID = window.localStorage.getItem('facilityID')
      this.fullscreenLoading = true
      this.$axios
        .post('/userMessageChange', {
          devices_name: facilityID,
          user_id: this.updateForm.userId,
          birthday: this.updateForm.birthday,
          sex: this.updateForm.sex
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 更新成功 */
            this.$store
              .dispatch('setCurrentUser', {
                userId: this.updateForm.userId,
                userName: this.updateForm.userName,
                birthday: this.updateForm.birthday,
                sex: this.updateForm.sex === '1' ? '男' : '女'
              })
              .then(() => {
                this.$message({
                  message: `[状态码为 ${data.status}] 个人信息更新成功`,
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
          } else if (data.status === 0) {
            /* 更新失败 */
            this.$alert(
              `[状态码为 ${data.status}] 更新失败，请重试！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '确 定',
                callback: () => {}
              }
            )
          } else if (data.status === -6) {
            /* 该用户ID不存在 */
            this.$alert(
              `[状态码为 ${data.status}] 该用户ID不存在，请重启软件！`,
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
            `[更新个人信息环节] ${err}。请确保网络连接正常，然后重试！`,
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
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: '/layout/user-edit',
          duration: 100
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-edit {
  width: 100%;
  height: 100%;
  @include flex(row, center, flex-start);

  .update-form {
    margin-top: 20vh;
    width: 40%;
    .update-form__btn {
      @include flex(row, space-between, center);
      .update-form__btn--update {
        width: 200px;
      }
    }
  }
}
</style>
