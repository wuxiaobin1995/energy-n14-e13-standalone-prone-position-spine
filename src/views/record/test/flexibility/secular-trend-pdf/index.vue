<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-14 10:13:00
 * @LastEditTime: 2023-05-30 14:33:45
 * @Description : 活动度测试-导出长期趋势PDF
-->
<template>
  <div
    class="test-flexibility-secular-trend-pdf"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <div class="top">
        <el-image class="logo" :src="logoSrc" fit="scale-down"></el-image>

        <div class="title">活动度测试-长期趋势报告</div>

        <div class="divider"></div>

        <div class="info">
          <div class="item">{{ hospital }}</div>
          <div class="item">姓名：{{ userName }}</div>
          <div class="item">性别：{{ sex }}</div>
        </div>

        <div class="divider"></div>
      </div>

      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="item" type="primary" @click="handlePdf"
        >保存PDF</el-button
      >
      <el-button class="item" type="warning" @click="handleGoBack"
        >返 回</el-button
      >
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

export default {
  name: 'test-flexibility-secular-trend-pdf',

  data() {
    return {
      /* 路由传参 */
      userId: JSON.parse(this.$route.query.userId),
      routerName: JSON.parse(this.$route.query.routerName),
      type: JSON.parse(this.$route.query.type),

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      /* 其他 */
      fullscreenLoading: false,
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标
      userName: this.$store.state.currentUserInfo.userName,
      sex: this.$store.state.currentUserInfo.sex,
      hospital: window.localStorage.getItem('hospital')
        ? window.localStorage.getItem('hospital')
        : '未设置医院',
      flexibilityArray: [] // 灵活度数组
    }
  },

  created() {
    this.getData()
  },

  methods: {
    /**
     * @description: 根据userId、type复合查询该次的数据
     */
    getData() {
      this.fullscreenLoading = true
      const db = initDB()
      db.test_data
        .where({
          userId: this.userId,
          type: this.type
        })
        .toArray()
        .then(res => {
          this.testData = res
        })
        .then(() => {
          for (let i = 0; i < this.testData.length; i++) {
            const element = this.testData[i]

            this.flexibilityArray.push(element.flexibility)
            this.xData.push(element.pdfTime)
          }
        })
        .then(() => {
          // 绘图
          this.initChart()
        })
        .catch(err => {
          this.$confirm(
            `${err}。获取ID为 [${this.userId}] 的用户数据失败，请重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '重 试',
              cancelButtonText: '返 回'
            }
          )
            .then(() => {
              this.getData()
            })
            .catch(() => {
              this.handleGoBack()
            })
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          name: '日期',
          data: this.xData,
          boundaryGap: true // 从0点开始
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false // 隐藏背景网格线
          }
        },
        legend: {},
        series: [
          {
            name: '骨盆灵活度',
            data: this.flexibilityArray,
            color: 'green',
            type: 'line',
            smooth: false,
            showSymbol: false
          }
        ],
        animation: false
      }
      this.myChart.setOption(this.option)
    },

    /**
     * @description: 保存PDF
     */
    handlePdf() {
      this.$htmlToPdf(
        'pdf',
        `活动度测试-长期趋势报告 ${this.$moment().format(
          'YYYY-MM-DD HH_mm_ss'
        )}`,
        500
      )
    },

    /**
     * @description: 返回上一页
     */
    handleGoBack() {
      this.$router.push({
        path: this.routerName
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-flexibility-secular-trend-pdf {
  width: 100vw;
  height: 100vh;
  padding: 10px;
  @include flex(column, stretch, stretch);

  /* PDF区域 */
  .pdf-wrapper {
    flex: 1;
    @include flex(column, stretch, stretch);

    .top {
      position: relative;
      @include flex(column, stretch, center);
      .logo {
        position: absolute;
        top: 10px;
        right: 5px;
        width: 180px;
      }
      .title {
        font-size: 50px;
      }
      .divider {
        margin-top: 15px;
        border: 1px solid rgb(204, 204, 204);
        width: 100%;
      }
      .info {
        width: 100%;
        margin-top: 15px;
        @include flex(row, space-around, center);
        .item {
          font-size: 20px;
        }
      }
    }

    .chart {
      flex: 1;
      margin-top: 20px;
    }
  }

  /* 按钮组 */
  .btn {
    @include flex(row, center, center);
    margin: 20px 0;
    .item {
      font-size: 28px;
      margin: 0 50px;
    }
  }
}
</style>
