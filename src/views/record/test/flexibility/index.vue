<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-14 10:10:35
 * @LastEditTime: 2023-02-24 10:28:38
 * @Description : 活动度测试-数据记录
-->
<template>
  <div class="test-flexibility-record">
    <!-- 顶部 -->
    <div class="top">
      <!-- 标题 -->
      <el-page-header
        title="返回首页"
        content="活动度测试"
        @back="handleToHome"
      ></el-page-header>
      <!-- 日期筛选 -->
      <el-date-picker
        class="data-select"
        v-model="selectDateValue"
        type="daterange"
        :picker-options="pickerOptions"
        range-separator="——"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd HH:mm:ss"
        :editable="false"
        :clearable="false"
        :unlink-panels="true"
        align="right"
        @change="changeData"
      >
      </el-date-picker>
    </div>

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
      <!-- 测试时间 -->
      <el-table-column
        align="center"
        prop="pdfTime"
        label="测试时间"
        width="260"
        sortable
      ></el-table-column>
      <!-- 上限 -->
      <el-table-column
        align="center"
        prop="maxDepth"
        label="上限"
        width="200"
      ></el-table-column>
      <!-- 下限 -->
      <el-table-column
        align="center"
        prop="minDepth"
        label="下限"
        width="200"
      ></el-table-column>
      <!-- 灵活度 -->
      <el-table-column
        align="center"
        prop="flexibility"
        label="骨盆灵活度"
        sortable
      ></el-table-column>

      <!-- 查看报告按钮 -->
      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-button
            type="primary"
            plain
            @click="handleToPdf(scope.$index, scope.row)"
            >查看报告</el-button
          >
        </template>
      </el-table-column>
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
      <el-button class="item" type="success" @click="handleSecularTrend"
        >长期趋势报告</el-button
      >
      <el-button class="item" type="primary" @click="handleRefresh"
        >刷 新 表 格</el-button
      >
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

export default {
  name: 'test-flexibility-record',

  data() {
    return {
      tableLoading: true, // 表格加载动画
      tableData: [], // 表格数据
      // 日期选择器的筛选值
      selectDateValue: [
        this.$moment().format('YYYY-MM-DD 00:00:00'),
        this.$moment().format('YYYY-MM-DD 23:59:59')
      ],
      /* 日期选择器快捷选项 */
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
              end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一周',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一年',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 360)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '该用户所有数据',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 36000)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },

  created() {
    this.initData()
  },

  methods: {
    /**
     * @description: 返回首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
      })
    },

    /**
     * @description: 表格数据初始化
     */
    initData() {
      const db = initDB()
      this.tableLoading = true
      db.test_data
        .where({
          userId: this.$store.state.currentUserInfo.userId,
          type: '活动度测试'
        })
        .toArray()
        .then(res => {
          this.tableData = res
        })
        .catch(err => {
          this.$confirm(`${err}。获取数据失败，请点击刷新按钮重试！`, '提示', {
            type: 'warning',
            center: true,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            confirmButtonText: '刷 新',
            cancelButtonText: '返回首页'
          })
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleToHome()
            })
        })
        .finally(() => {
          this.tableLoading = false
        })
    },

    /**
     * @description: 根据日期选择获取表格数据
     */
    getData() {
      const db = initDB()
      this.tableLoading = true
      db.test_data
        .where(['userId', 'type', 'pdfTime'])
        .between(
          [
            this.$store.state.currentUserInfo.userId,
            '活动度测试',
            this.selectDateValue[0]
          ],
          [
            this.$store.state.currentUserInfo.userId,
            '活动度测试',
            this.selectDateValue[1]
          ],
          true,
          true
        )
        .toArray()
        .then(res => {
          this.tableData = res
        })
        .catch(err => {
          this.$confirm(
            `${err}。根据日期获取数据失败，请点击刷新按钮重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷 新',
              cancelButtonText: '返回首页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleToHome()
            })
        })
        .finally(() => {
          this.tableLoading = false
        })
    },

    /**
     * @description: 用户确认选定的值时触发
     * @param {*} value 选择的日期数组
     */
    changeData(value) {
      this.selectDateValue = value
      this.getData()
    },

    /**
     * @description: 查看报告
     * @param {*} index
     * @param {*} row
     */
    handleToPdf(index, row) {
      this.$router.push({
        path: '/test-flexibility-pdf',
        query: {
          userId: JSON.stringify(row.userId),
          pdfTime: JSON.stringify(row.pdfTime),
          routerName: JSON.stringify('/test-record/flexibility')
        }
      })
    },

    /**
     * @description: 删除按钮
     * @param {*} index
     * @param {*} row
     */
    handleDelete(index, row) {
      this.$confirm('此操作将"永久删除"该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          const db = initDB()
          db.test_data
            .where({
              userId: row.userId,
              pdfTime: row.pdfTime,
              type: row.type
            })
            .delete()
            .then(() => {
              this.$message({
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
            })
            .then(() => {
              this.getData()
            })
            .catch(() => {
              this.$message({
                message: '删除失败',
                type: 'error',
                duration: 3000
              })
            })
        })
        .catch(() => {})
    },

    /**
     * @description: 查看长期趋势报告
     */
    handleSecularTrend() {
      this.$router.push({
        path: '/test-flexibility-secular-trend-pdf',
        query: {
          userId: JSON.stringify(this.$store.state.currentUserInfo.userId),
          routerName: JSON.stringify('/test-record/flexibility'),
          type: JSON.stringify('活动度测试')
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
          routerName: JSON.stringify('/test-record/flexibility'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-flexibility-record {
  width: 100%;
  height: 90%;
  @include flex(column, stretch, center);

  /* 顶部 */
  .top {
    width: 100%;
    margin: 10px 0;
    @include flex(row, space-between, center);
    // 标题
    .text {
      font-size: 32px;
      color: green;
    }
  }

  /* 表格 */
  .table {
    flex: 1;
  }

  /* 按钮组 */
  .btn {
    margin-top: 20px;
    @include flex(row, center, center);
    .item {
      margin: 0 40px;
    }
  }
}
</style>
