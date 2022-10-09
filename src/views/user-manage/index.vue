<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 14:53:07
 * @LastEditTime: 2022-01-26 09:56:07
 * @Description : 用户管理页面
-->
<template>
  <div class="user-manage">
    <!-- 搜索栏 -->
    <div class="user-search">
      <el-autocomplete
        :style="{ width: '40%' }"
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
      <!-- 用户ID -->
      <el-table-column
        align="center"
        prop="userId"
        label="ID"
        width="80"
      ></el-table-column>
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

      <!-- 删除按钮 -->
      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-button
            type="danger"
            v-loading.fullscreen.lock="deleteLoading"
            @click="handleDeleteUser(scope.$index, scope.row)"
            >删 除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button type="primary" @click="handleRefresh">刷 新 表 格</el-button>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'user-manage',

  data() {
    return {
      tableLoading: true, // 表格加载动画
      deleteLoading: false, // 删除按钮加载动画
      searchText: '', // 搜索框内容
      userData: [], // 所有用户数据
      tableData: [] // 表格显示的数据
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', false)
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
            this.tableData = newData
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
            /* 用户列表为空 */
            this.$message({
              message: `[状态码为 ${data.status}] 用户列表为空！`,
              type: 'warning',
              duration: 3000
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
              cancelButtonText: '返回首页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.$router.push({ path: '/layout/home' })
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
     * @description: 删除用户按钮
     * @param {number} index 该行索引
     * @param {object} row 某一行数据
     */
    handleDeleteUser(index, row) {
      this.$confirm('此操作将永久删除该用户及其数据，是否继续？', '提示', {
        type: 'warning',
        showClose: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          const facilityID = window.localStorage.getItem('facilityID')
          const userId = row.userId
          this.deleteLoading = true
          this.$axios
            .post('/userDelete', {
              devices_name: facilityID,
              user_id: userId
            })
            .then(res => {
              const data = res.data
              if (data.status === 1) {
                /* 删除成功 */
                this.$message({
                  message: `用户[${row.userName}]，删除成功`,
                  type: 'success',
                  duration: 3000
                })
                this.handleRefresh()
              } else if (data.status === 0) {
                /* 删除失败 */
                this.$alert(
                  `[状态码为 ${data.status}] 删除失败，请刷新页面！`,
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
                /* 该用户ID不存在 */
                this.$alert(
                  `[状态码为 ${data.status}] 该用户ID不存在，请刷新页面！`,
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
              this.$alert(
                `[删除用户环节] ${err}。请确保网络连接正常！`,
                '网络请求错误',
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
              this.deleteLoading = false
            })
        })
        .catch(() => {})
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: '/layout/user-manage',
          duration: 100
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-manage {
  width: 100%;
  height: 100%;
  padding: 20px 40px 20px 40px;
  @include flex(column, stretch, stretch);

  /* 搜索栏 */
  .user-search {
    margin-bottom: 20px;
    @include flex(row, flex-start, center);
  }

  /* 表格 */
  .user-table {
    flex: 1;
  }

  /* 按钮组 */
  .btn {
    margin-top: 20px;
    @include flex(row, center, center);
  }
}
</style>
