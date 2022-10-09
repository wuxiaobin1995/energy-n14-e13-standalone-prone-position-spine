<!--
 * @Author      : Mr.bin
 * @Date        : 2021-12-08 10:21:13
 * @LastEditTime: 2022-01-26 09:54:46
 * @Description : 内核心激活训练-数据记录
-->
<template>
  <div class="core-activation-train-record">
    <!-- 表格 -->
    <el-table
      class="table"
      :data="showData"
      style="width: 100%"
      height="100%"
      :default-sort="{ prop: 'pdfTime', order: 'descending' }"
      :stripe="false"
      :border="true"
      :highlight-current-row="true"
      v-loading="tableLoading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <!-- No -->
      <el-table-column align="center" type="index" width="50"></el-table-column>
      <!-- 训练时间 -->
      <el-table-column
        align="center"
        prop="pdfTime"
        label="训练时间"
        width="220"
        sortable
      ></el-table-column>
      <!-- 完成情况 -->
      <el-table-column
        align="center"
        prop="adopt"
        label="完成情况"
        sortable
      ></el-table-column>

      <!-- 删除报告按钮 -->
      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-button
            type="danger"
            plain
            @click="handleDelete(scope.$index, scope.row)"
            >删除报告</el-button
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
  name: 'core-activation-train-record',

  data() {
    return {
      tableLoading: true, // 表格加载动画
      showData: [] // 表格显示的数据
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', false)
    this.getData()
  },

  methods: {
    /**
     * @description: 从后端获取数据
     */
    getData() {
      const facilityID = window.localStorage.getItem('facilityID')
      const userId = this.$store.state.currentUser.userId
      this.tableLoading = true
      this.$axios
        .post('/getTrainRecordByType', {
          devices_name: facilityID,
          user_id: userId,
          type: 'core-activation'
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 把key名改一下，与后端松耦合 */
            const newData = []
            for (let i = 0; i < data.result.length; i++) {
              const total = {
                dataId: '',
                pdfTime: '',
                adopt: ''
              }
              const element = data.result[i]
              total.dataId = element.id
              total.pdfTime = element.create_time
              total.adopt = element.adopt === 1 ? '完成' : '未完成'
              newData.push(total)
            }
            /* 渲染表格数据 */
            this.showData = newData
          } else if (data.status === 0) {
            /* 失败 */
            this.$confirm(
              `[状态码为 ${data.status}] 获取数据失败，请重试！`,
              '警告',
              {
                type: 'error',
                center: true,
                showClose: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                confirmButtonText: '重 试',
                cancelButtonText: '返回首页'
              }
            )
              .then(() => {
                this.getData()
              })
              .catch(() => {
                this.$router.push({ path: '/layout/home' })
              })
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
          this.$confirm(
            `[内核心激活训练-数据记录环节] ${err}。请确保网络连接正常，然后重试！`,
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
     * @description: 删除报告
     * @param {*} index
     * @param {*} row
     */
    handleDelete(index, row) {
      this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        showClose: false
      })
        .then(() => {
          const id = row.dataId
          this.tableLoading = true
          this.$axios
            .post('/deleteTrainRecord', {
              train_record_id: id
            })
            .then(res => {
              const data = res.data
              if (data.status === 1) {
                /* 成功 */
                this.$message({
                  message: '删除成功',
                  type: 'success',
                  duration: 2000
                })
                this.getData()
              } else if (data.status === 0) {
                /* 失败 */
                this.$alert(
                  `[状态码为 ${data.status}] 删除失败，请刷新页面后重试！`,
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
                `[内核心激活训练-删除数据环节] ${err}。请确保网络连接正常，刷新页面后重试！`,
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
              this.tableLoading = false
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
          routerName: '/layout/core-activation-train-record',
          duration: 100
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.core-activation-train-record {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  @include flex(column, stretch, stretch);

  /* 表格 */
  .table {
    flex: 1;
  }

  /* 按钮组 */
  .btn {
    margin-top: 20px;
    @include flex(row, center, center);
  }
}
</style>
