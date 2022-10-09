<!--
 * @Author      : Mr.bin
 * @Date        : 2021-12-09 14:31:25
 * @LastEditTime: 2022-01-26 09:56:19
 * @Description : 管理员查看用户测试报告
-->
<template>
  <div class="user-pdf-check-test">
    <!-- 下拉菜单 -->
    <el-select
      class="select"
      v-model="type"
      placeholder="请选择测试类型"
      @change="handleTypeChange"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>

    <!-- 表格 -->
    <el-table
      class="table"
      :data="tableData"
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
      <!-- 用户名 -->
      <el-table-column
        align="center"
        prop="userName"
        label="用户名"
        sortable
      ></el-table-column>
      <!-- 测试时间 -->
      <el-table-column
        align="center"
        prop="pdfTime"
        label="测试时间"
        sortable
      ></el-table-column>

      <!-- 查看报告 -->
      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-button
            type="success"
            plain
            @click="handleToPdf(scope.$index, scope.row)"
            >查看报告</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="btn">
      <el-button class="btn__item" type="primary" @click="handleRefresh"
        >刷 新 表 格</el-button
      >
      <el-button class="btn__item" type="info" plain @click="handleGoBack"
        >返 回</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'user-pdf-check-test',

  data() {
    return {
      /* 其他 */
      tableLoading: false,
      tableData: [],
      type: '',
      options: [
        {
          value: 'flexibility',
          label: '灵活性测试'
        }
      ]
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', false)
  },

  methods: {
    /**
     * @description:
     */
    /**
     * @description: 从后端获取数据
     */
    getData() {
      const facilityID = window.localStorage.getItem('facilityID')
      const userId = this.$store.state.selectUserId
      this.tableLoading = true
      this.$axios
        .post('/getTestRecordByType', {
          devices_name: facilityID,
          user_id: userId,
          type: this.type
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
                userName: ''
              }
              const element = data.result[i]
              total.dataId = element.id
              total.pdfTime = element.create_time
              total.userName = element.user_name
              newData.push(total)
            }
            /* 渲染表格数据 */
            this.tableData = newData
          } else if (data.status === 0) {
            /* 失败 */
            this.$alert(
              `[状态码为 ${data.status}] 获取数据失败，请重试！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '重 试',
                callback: () => {
                  this.getData()
                }
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
          this.$confirm(
            `[管理员查看用户测试报告环节] ${err}。请确保网络连接正常！`,
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
     * @description: 下拉菜单触发
     */
    handleTypeChange() {
      this.getData()
    },

    /**
     * @description: 查看报告
     * @param {*} index
     * @param {*} row
     */
    handleToPdf(index, row) {
      this.$router.push({
        path: `/layout/${this.type}-test-pdf`,
        query: {
          dataId: row.dataId,
          routerName: `/layout/user-pdf-check-test`
        }
      })
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: '/layout/user-pdf-check-test',
          duration: 100
        }
      })
    },

    /**
     * @description: 返回按钮
     */
    handleGoBack() {
      this.$router.push({
        path: '/layout/user-pdf-check'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-pdf-check-test {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  @include flex(column, stretch, stretch);

  /* 下拉菜单 */
  .select {
    width: 20%;
    margin-bottom: 20px;
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
      margin: 0 40px;
    }
  }
}
</style>
