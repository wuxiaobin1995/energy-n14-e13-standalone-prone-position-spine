<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-12 21:31:50
 * @LastEditTime: 2023-02-07 18:05:14
 * @Description : 活动度改善训练-导出PDF
-->
<template>
  <div
    class="train-activity-improvement-pdf"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <div class="top">
        <el-image class="logo" :src="logoSrc" fit="scale-down"></el-image>

        <div class="title">活动度改善训练报告</div>

        <div class="divider"></div>

        <div class="info">
          <div class="item">{{ hospital }}</div>
          <div class="item">姓名：{{ pdfData.userName }}</div>
          <div class="item">性别：{{ pdfData.sex }}</div>
          <div class="item">训练日期：{{ pdfData.pdfTime }}</div>
        </div>

        <div class="divider"></div>
      </div>

      <div class="main">
        <div class="chart">
          <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
        </div>

        <div class="other">
          <el-image :src="lv" fit="scale-down"></el-image>
          <div class="val">
            <div class="title" :style="{ color: colorLv }">{{ textLv }}</div>
            <div class="num">训练个数：{{ pdfData.num }}</div>
            <div class="completion">训练评分：{{ pdfData.completion }}</div>
            <div class="advice">{{ advice }}</div>
          </div>
        </div>
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
/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'train-activity-improvement-pdf',

  data() {
    return {
      /* 路由传参 */
      userId: JSON.parse(this.$route.query.userId),
      pdfTime: JSON.parse(this.$route.query.pdfTime),
      routerName: JSON.parse(this.$route.query.routerName),

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      fullscreenLoading: false,

      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标
      lv: require('@/assets/img/Train/PDF/优秀.png'),
      oneLv: require('@/assets/img/Train/PDF/优秀.png'), // 优秀
      twoLv: require('@/assets/img/Train/PDF/良好.png'), // 良好
      threeLv: require('@/assets/img/Train/PDF/较差.png'), // 较差
      fourLv: require('@/assets/img/Train/PDF/差.png'), // 差
      textLv: '',
      colorLv: '#000000',
      advice: '', // 建议

      pdfData: {
        userName: '',
        sex: '',
        pdfTime: '',
        completion: '', // 完成度
        num: '', // 训练个数
        intervalTime: '', // 间隔时间
        targetUp: '', // 上限
        targetDown: '', // 下限
        depthArray: [] // 数据数组
      },
      hospital: window.localStorage.getItem('hospital')
        ? window.localStorage.getItem('hospital')
        : '未设置医院',

      standardArray: [], // 基础参考曲线
      fullArray: [] // 完整参考曲线
    }
  },

  created() {
    this.getTrainData()
  },

  methods: {
    /**
     * @description: 获取对应 [ID、训练时间] 的训练报告源数据，并做相关计算
     */
    getTrainData() {
      this.fullscreenLoading = true
      const db = initDB()
      db.train_data
        .where({
          userId: this.userId,
          pdfTime: this.pdfTime
        })
        .toArray()
        .then(res => {
          this.pdfData = res[0]
        })
        .then(() => {
          /* 根据不同的评分动态变化显示 */
          if (this.pdfData.completion < 40) {
            this.advice = '腰椎灵活性差，建议加强活动度训练'
            this.lv = this.fourLv
            this.textLv = '差'
            this.colorLv = '#FA5151'
          } else if (
            this.pdfData.completion >= 40 &&
            this.pdfData.completion <= 59
          ) {
            this.advice = '腰椎灵活性较差，建议加强活动度训练'
            this.lv = this.threeLv
            this.textLv = '较差'
            this.colorLv = '#FFC300'
          } else if (
            this.pdfData.completion >= 60 &&
            this.pdfData.completion <= 79
          ) {
            this.advice = '腰椎灵活性良好，建议加强活动度训练'
            this.lv = this.twoLv
            this.textLv = '良好'
            this.colorLv = '#00B578'
          } else {
            this.advice = '腰椎灵活性优秀，建议加强静态训练'
            this.lv = this.oneLv
            this.textLv = '优秀'
            this.colorLv = '#07B9B9'
          }

          /* 渲染图形 */
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
              this.getTestData()
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
      /* x轴 */
      for (
        let i = 0;
        i < this.pdfData.num * this.pdfData.intervalTime * 20;
        i++
      ) {
        this.xData.push(parseFloat((i * 0.1).toFixed(1)))
      }

      /* 绘制参考曲线逻辑 */
      const targetUp = this.pdfData.targetUp
      const targetDown = this.pdfData.targetDown
      const intervalTime = this.pdfData.intervalTime
      const interval = parseFloat(
        ((targetUp - targetDown) / (intervalTime * 10)).toFixed(3)
      ) // 间隔值
      this.standardArray.push(targetDown)
      let sum = targetDown
      for (let i = 0; i < intervalTime * 10 - 1; i++) {
        sum = sum + interval
        this.standardArray.push(sum)
      }
      sum = targetUp
      for (let i = 0; i < intervalTime * 10; i++) {
        this.standardArray.push(sum)
        sum = sum - interval
      }
      for (let i = 0; i < this.pdfData.num; i++) {
        this.fullArray.push(...this.standardArray)
      }
      this.fullArray.push(targetDown)

      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          name: '秒',
          data: this.xData,
          boundaryGap: false // 从0点开始
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false // 隐藏背景网格线
          },
          min: targetDown - 10 >= 0 ? targetDown - 10 : 0,
          max: targetUp + 10 <= 100 ? targetUp + 10 : 100
        },
        legend: {},
        series: [
          {
            name: '运动轨迹',
            data: this.pdfData.depthArray,
            color: 'red',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: `参考曲线(${targetDown}~${targetUp})`,
            data: this.fullArray,
            color: 'rgba(0, 255, 0, 0.5)',
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
        `活动度改善训练报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`,
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
.train-activity-improvement-pdf {
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

    .main {
      margin-top: 15px;
      flex: 1;
      @include flex(row, space-between, stretch);
      .chart {
        flex: 1;
      }
      .other {
        @include flex(row, space-between, center);
        width: 360px;
        margin-right: 20px;
        .val {
          width: 240px;
          font-size: 20px;
          font-weight: 700;
          .title {
            font-size: 46px;
            margin-bottom: 30px;
          }
          .num {
            margin-bottom: 3px;
          }
          .completion {
            margin-bottom: 3px;
          }
          .advice {
            margin-bottom: 3px;
          }
        }
      }
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
