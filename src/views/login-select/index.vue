<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-13 10:48:02
 * @LastEditTime: 2022-01-26 09:49:48
 * @Description : 普通用户登录选择页面
-->
<template>
  <div class="login-select">
    <!-- 顶部 -->
    <div class="top">
      <!-- 返回按钮 -->
      <el-page-header
        title="返回"
        content="用户登录选择页面"
        @back="handleGoBack"
      ></el-page-header>
      <!-- 搜索栏 -->
      <el-autocomplete
        :style="{ width: '50%' }"
        v-model="searchText"
        placeholder="请输入用户名"
        prefix-icon="el-icon-search"
        clearable
        :maxlength="100"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        value-key="userName"
        @select="handleSearchSelect"
        @clear="handleSearchResect"
        @input="handleSearchResect"
      >
        <template slot="prepend">搜索</template>
      </el-autocomplete>
    </div>

    <!-- 表格 -->
    <el-table
      class="user-table"
      :data="tableData"
      style="width: 100%"
      height="100%"
      :default-sort="{ prop: 'lastLoginTime', order: 'descending' }"
      :stripe="false"
      :border="false"
      :highlight-current-row="true"
      v-loading="tableLoading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <!-- No -->
      <el-table-column align="center" type="index" width="50"></el-table-column>
      <!-- 用户名 -->
      <el-table-column
        align="center"
        prop="userName"
        label="用户名"
        width="200"
        sortable
      ></el-table-column>
      <!-- 性别 -->
      <el-table-column
        align="center"
        prop="sex"
        label="性别"
        width="80"
        sortable
      ></el-table-column>
      <!-- 出生日期 -->
      <el-table-column
        align="center"
        prop="birthday"
        label="出生日期"
        width="160"
        sortable
      ></el-table-column>
      <!-- 最近登录时间 -->
      <el-table-column
        align="center"
        prop="lastLoginTime"
        label="最近登录时间"
        sortable
      ></el-table-column>
      <!-- 注册时间 -->
      <el-table-column
        align="center"
        prop="createTime"
        label="注册时间"
        width="260"
        sortable
      ></el-table-column>

      <!-- 登录按钮 -->
      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-button
            type="success"
            v-loading.fullscreen.lock="loginLoading"
            @click="handleSelectUser(scope.$index, scope.row)"
            >登 录</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="btn__item" type="primary" @click="handleRefresh"
        >刷 新 页 面</el-button
      >
      <el-button class="btn__item" type="danger" @click="handleGoBack"
        >返 回</el-button
      >
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  nane: 'login-select',

  data() {
    return {
      tableLoading: true, // 表格加载动画
      loginLoading: false, // 登录按钮加载动画
      searchText: '', // 搜索框内容
      userData: [], // 所有用户数据
      tableData: [] // 表格显示的数据
    }
  },

  created() {
    this.getUsersData()
  },

  methods: {
    /**
     * @description: 从后端获取用户列表数据
     */
    getUsersData() {
      const facilityID = window.localStorage.getItem('facilityID')
      this.tableLoading = true
      this.$axios
        .post('/getUserList', {
          devices_name: facilityID
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 把key名改一下，与后端松耦合 */
            const newData = []
            for (let i = 0; i < data.result.length; i++) {
              const total = {
                userId: '',
                userName: '',
                sex: '',
                birthday: '',
                lastLoginTime: '',
                createTime: ''
              }
              const element = data.result[i]
              total.userId = element.id
              total.userName = element.name
              total.sex = element.sex === 1 ? '男' : '女'
              total.birthday = element.birthday
              total.lastLoginTime = element.login_time ? element.login_time : ''
              total.createTime = element.create_time
              newData.push(total)
            }
            /* 渲染表格数据 */
            this.userData = newData
            this.tableData = this.userData
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
          } else if (data.status === -10) {
            /* 用户数据列表为空 */
            this.$confirm(
              `[状态码为 ${data.status}] 用户列表为空，请先注册新用户！`,
              '提示',
              {
                type: 'info',
                center: true,
                showClose: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                confirmButtonText: '注册新用户',
                cancelButtonText: '返 回'
              }
            )
              .then(() => {
                this.$router.push({ path: '/register' })
              })
              .catch(() => {
                this.$router.push({ path: '/' })
              })
          }
        })
        .catch(err => {
          this.$confirm(
            `[从后端获取用户列表数据环节] ${err}。请确保网络连接正常！`,
            '网络请求错误',
            {
              type: 'error',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷新页面',
              cancelButtonText: '返 回'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.$router.push({ path: '/' })
            })
        })
        .finally(() => {
          this.tableLoading = false
        })
    },

    /**
     * @description: 带输入建议的搜索框
     * @param {String} queryString 输入的值
     * @param {Function} cb 回调函数
     */
    querySearch(queryString, cb) {
      const inputAdvices = this.userData // 建议列表
      // 建议结果
      const results = queryString
        ? inputAdvices.filter(this.createFilter(queryString))
        : inputAdvices
      // 调用 callback 返回建议结果的数据
      cb(results)
    },
    // 建议方法
    createFilter(queryString) {
      // inputAdvice是建议列表的单项
      return inputAdvice => {
        return (
          inputAdvice.userName
            .toLowerCase()
            .indexOf(queryString.toLowerCase()) !== -1
        )
      }
    },
    // item是选中的建议结果中的对象
    handleSearchSelect(item) {
      this.tableData = [item]
    },

    /**
     * @description: 重置表格数据（即清空搜索条件）
     */
    handleSearchResect() {
      this.tableData = this.userData
    },

    /**
     * @description: 登录按钮
     * @param {number} index 该行索引
     * @param {object} row 某一行数据
     */
    handleSelectUser(index, row) {
      const facilityID = window.localStorage.getItem('facilityID')
      const userId = row.userId
      this.loginLoading = true
      this.$axios
        .post('/userLogin', {
          devices_name: facilityID,
          user_id: userId
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 登录成功 */
            this.$store
              .dispatch('setCurrentUser', {
                userId: row.userId,
                userName: row.userName,
                birthday: row.birthday,
                sex: row.sex
              })
              .then(() => {
                this.$message({
                  message: `用户[${row.userName}]，登录成功`,
                  type: 'success',
                  duration: 2000
                })
              })
              .then(() => {
                this.$router.push({ path: '/layout/home' })
              })
              .catch(() => {
                this.$alert(
                  `设置Vuex失败，请刷新页面，然后重新登录！`,
                  '警告',
                  {
                    type: 'error',
                    showClose: false,
                    confirmButtonText: '刷新页面',
                    callback: () => {
                      this.handleRefresh()
                    }
                  }
                )
              })
              .finally(() => {
                this.$store.dispatch('setCurrentAdmin', {
                  adminId: '',
                  adminPassword: ''
                })
              })
          } else if (data.status === 0) {
            /* 登录失败 */
            this.$alert(
              `[状态码为 ${data.status}] 登录失败，请刷新页面，然后重新登录！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '刷新页面',
                callback: () => {
                  this.handleRefresh()
                }
              }
            )
          } else if (data.status === -6) {
            /* 用户账号不存在 */
            this.$alert(
              `[状态码为 ${data.status}] 该用户账号不存在，请刷新页面，然后重新登录！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '刷新页面',
                callback: () => {
                  this.handleRefresh()
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
          this.$confirm(
            `[用户登录环节] ${err}。请确保网络连接正常！`,
            '网络请求错误',
            {
              type: 'error',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷新页面',
              cancelButtonText: '返 回'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.$router.push({ path: '/' })
            })
        })
        .finally(() => {
          this.loginLoading = false
        })
    },

    /**
     * @description: 刷新页面，通过路由跳转的方式实现
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: '/login-select',
          duration: 300
        }
      })
    },

    /**
     * @description: 返回登录页面
     */
    handleGoBack() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-select {
  width: 100%;
  height: 100%;
  padding: 20px 40px 20px 40px;
  @include flex(column, stretch, stretch);

  /* 顶部 */
  .top {
    margin-bottom: 20px;
    @include flex(row, space-between, center);
  }

  /* 表格 */
  .user-table {
    flex: 1;
  }

  /* 按钮组 */
  .btn {
    margin-top: 20px;
    @include flex(row, center, center);
    .btn__item {
      margin: 0 30px;
      font-size: 20px;
    }
  }
}
</style>
