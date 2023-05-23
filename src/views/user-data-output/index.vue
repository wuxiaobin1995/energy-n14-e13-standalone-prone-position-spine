<!--
 * @Author      : Mr.bin
 * @Date        : 2023-05-23 15:58:13
 * @LastEditTime: 2023-05-23 16:24:15
 * @Description : 导出所选用户的数据（测试、训练）
-->
<template>
  <div class="user-data-output">
    <div class="wrapper">
      <!-- 顶部部分 -->
      <div class="top">
        <!-- 返回 -->
        <el-page-header
          title="返回上一页"
          content="用户数据导出页面"
          @back="handleBack"
        ></el-page-header>
      </div>

      <!-- 表格 -->
      <el-table
        class="table"
        :data="allUserData"
        style="width: 100%"
        height="auto"
        :default-sort="{ prop: 'userId', order: 'descending' }"
        :stripe="false"
        :border="false"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        <!-- 姓名 -->
        <el-table-column
          align="center"
          prop="userName"
          label="姓名"
          width="200"
        ></el-table-column>
        <!-- 用户ID -->
        <el-table-column
          align="center"
          prop="userId"
          label="用户ID"
          width="180"
        ></el-table-column>
        <!-- 性别 -->
        <el-table-column
          align="center"
          prop="sex"
          label="性别"
          width="80"
          sortable
        ></el-table-column>
      </el-table>

      <!-- 按钮 -->
      <div class="btn">
        <el-button
          class="item"
          type="success"
          icon="el-icon-download"
          @click="handleTestOutput"
          >导出测试数据</el-button
        >
        <el-button
          class="item"
          type="success"
          icon="el-icon-download"
          @click="handleTrainOutput"
          >导出训练数据</el-button
        >
        <el-button class="item" type="info" @click="handleRefresh"
          >刷 新</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

export default {
  name: 'user-data-output',

  data() {
    return {
      loading: false, // 表格加载动画
      testLoading: false, // 导出测试 Excel加载动画
      trainLoading: false, // 导出训练 Excel加载动画

      allUserData: [], // user表的所有用户数据
      allTestData: [], // test_data表的所有数据
      allTrainData: [] // train_data表的所有数据
    }
  },

  created() {
    this.getAllUsers()
  },

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: '/user'
      })
    },

    /**
     * @description: 获取所有user信息数据
     */
    getAllUsers() {
      this.loading = true
      const db = initDB()
      db.user
        .toArray()
        .then(res => {
          this.allUserData = res
        })
        .catch(() => {
          this.$confirm(`获取user表数据失败，请点击刷新按钮重试！`, '提示', {
            type: 'warning',
            center: true,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            confirmButtonText: '刷 新',
            cancelButtonText: '返回上一页'
          })
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleBack()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 获取所有测试数据
     */
    getTestData() {
      this.loading = true
      const db = initDB()
      db.test_data
        .toArray()
        .then(res => {
          this.allTestData = res
          console.log(this.allTestData)
        })
        .catch(() => {
          this.$confirm(
            `获取test_data表数据失败，请点击刷新按钮重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷 新',
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleBack()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 获取所有训练数据
     */
    getTrainData() {
      this.loading = true
      const db = initDB()
      db.test_data
        .toArray()
        .then(res => {
          this.allTrainData = res
          console.log(this.allTrainData)
        })
        .catch(() => {
          this.$confirm(
            `获取train_data表数据失败，请点击刷新按钮重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷 新',
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleBack()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 导出测试数据
     */
    handleTestOutput() {},

    /**
     * @description: 导出训练数据
     */
    handleTrainOutput() {},

    /**
     * @description: 导出用户 Excel按钮
     */
    handleUserExcel() {
      if (this.allUserData.length) {
        this.userExcelLoading = true
        // 此处使用懒加载的方式
        import('@/utils/Export2Excel.js')
          .then(excel => {
            const excelTitle = {
              userId: 'ID',
              userName: '姓名',
              sex: '性别',
              height: '身高(cm)',
              weight: '体重(kg)',
              birthday: '出生日期',
              lastLoginTime: '最后登录时间',
              remarks: '备注'
            }
            const tHeader = Object.values(excelTitle)
            // 会根据key键的顺序、属性值等动态变化
            const filterVal = Object.keys(excelTitle)
            const exportData = this.formatJson(filterVal, this.allUserData)
            excel.export_json_to_excel({
              header: tHeader, // 表头 必填
              data: exportData, // 具体数据 必填
              filename:
                '卧姿肢体康复评估与训练系统-单机版-所有用户信息 ' +
                this.$moment().format('YYYY-MM-DD HH_mm_ss'), // 导出文件名，非必填
              autoWidth: true, // 自适应列宽，非必填
              bookType: 'xlsx' // 导出格式，非必填
            })
          })
          .then(() => {
            this.$message({
              message: '导出Excel成功',
              type: 'success',
              duration: 3000
            })
          })
          .catch(err => {
            this.$message({
              message: `导出Excel失败：${err}`,
              type: 'error',
              duration: 5000
            })
          })
          .finally(() => {
            this.userExcelLoading = false
          })
      } else {
        this.$message({
          message: '表格数据不能为空！',
          type: 'error',
          duration: 3000
        })
      }
    },

    /**
     * @description: 数据格式化，将 [{},{},...] => [[],[],...]
     * @param {Array} filterVal key键
     * @param {Array} jsonData [{},{},...]
     * @return {Array} 二维数组 [[],[],...]
     */
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          return v[j]
        })
      )
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/user-data-output'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-data-output {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 96%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 40px;
    @include flex(column, stretch, stretch);

    /* 顶部部分 */
    .top {
      margin-bottom: 20px;
      @include flex(row, flex-start, center);
    }

    /* 表格 */
    .table {
      flex: 1;
    }

    /* 按钮 */
    .btn {
      margin-top: 20px;
      @include flex(row, center, center);
      .item {
        font-size: 24px;
        margin: 0 80px;
      }
    }
  }
}
</style>
