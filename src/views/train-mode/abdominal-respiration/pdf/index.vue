<!--
 * @Author      : Mr.bin
 * @Date        : 2023-05-19 16:29:06
 * @LastEditTime: 2023-05-19 18:00:10
 * @Description : 腹式呼吸训练-导出PDF
-->
<template>
  <div
    class="train-abdominal-respiration-pdf"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <div class="top">
        <el-image class="logo" :src="logoSrc" fit="scale-down"></el-image>

        <div class="title">腹式呼吸训练-综合报告</div>

        <div class="divider"></div>

        <div class="info">
          <div class="item">{{ pdfData.hospital }}</div>
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
            <div class="item">综合训练评分：{{ pdfData.completion }}分</div>
            <div class="item">训练目标：{{ pdfData.target }}</div>
            <div class="item">训练次数：{{ pdfData.num }}</div>
            <div class="item">训练组数：{{ pdfData.groups }}</div>
            <div class="item">保持时长：{{ pdfData.keepTime }}秒</div>
            <div class="item">休息时长：{{ pdfData.restTime }}秒</div>
            <div class="item">组间休息时长：{{ pdfData.groupRestTime }}秒</div>
            <div class="item">{{ advice }}</div>
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
  name: 'train-abdominal-respiration-pdf',

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

      /* 参考曲线相关 */
      standardArray: [], // 基础参考曲线
      fullArray: [], // 完整参考曲线

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
        hospital: '',
        userName: '',
        sex: '',

        targetUp: '', // 上限
        targetDown: '', // 下限

        midpoint: '', // 灵活度中点
        target: '', // 训练目标
        num: '', // 训练次数
        groups: '', // 训练组数
        groupRestTime: '', // 组间休息时间
        keepTime: '', // 保持时间
        restTime: '', // 休息时间

        allDepthArray: [], // 多组完整数据数组
        comprehensiveArray: [], // 综合曲线轨迹
        completion: '', // 完成度
        pdfTime: ''
      }
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
            this.advice = '腹式呼吸差，建议加强腹式呼气训练'
            this.lv = this.fourLv
            this.textLv = '差'
            this.colorLv = '#FA5151'
          } else if (
            this.pdfData.completion >= 40 &&
            this.pdfData.completion <= 59
          ) {
            this.advice = '腹式呼吸较差，建议加强腹式呼气训练'
            this.lv = this.threeLv
            this.textLv = '较差'
            this.colorLv = '#FFC300'
          } else if (
            this.pdfData.completion >= 60 &&
            this.pdfData.completion <= 79
          ) {
            this.advice = '腹式呼吸良好，建议加强腹式呼气训练'
            this.lv = this.twoLv
            this.textLv = '良好'
            this.colorLv = '#00B578'
          } else {
            this.advice = '腹式呼气优秀，建议加强静态训练'
            this.lv = this.oneLv
            this.textLv = '优秀'
            this.colorLv = '#07B9B9'
          }

          this.countChart().then(() => {
            this.initChart()
          })
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
              this.getTrainData()
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
     * @description: 计算图形所需参数逻辑函数
     */
    countChart() {
      return new Promise((resolve, reject) => {
        const midpoint = this.pdfData.midpoint // 灵活度中点
        const target = this.pdfData.target // 训练目标
        const restTime = this.pdfData.restTime // 休息时间
        const keepTime = this.pdfData.keepTime // 保持时间

        const restTimeArray = []
        for (let i = 0; i < restTime * 10 + 1; i++) {
          restTimeArray.push(midpoint)
        }

        const interval = parseFloat(((midpoint - target) / 10).toFixed(3)) // 间隔值

        const downArray = []
        let downSum = midpoint
        for (let i = 0; i < 9; i++) {
          downSum = downSum - interval
          downArray.push(downSum)
        }

        const keepTimeArray = []
        for (let i = 0; i < keepTime * 10 + 1; i++) {
          keepTimeArray.push(target)
        }

        const upArray = []
        let upSum = target
        for (let i = 0; i < 9; i++) {
          upSum = upSum + interval
          upArray.push(upSum)
        }

        this.standardArray = restTimeArray.concat(
          downArray,
          keepTimeArray,
          upArray
        )

        this.fullArray = []
        for (let i = 0; i < this.pdfData.num; i++) {
          this.fullArray.push(...this.standardArray)
        }

        /* x轴 */
        this.xData = []
        for (let i = 0; i < this.fullArray.length; i++) {
          this.xData.push(parseFloat((i * 0.1).toFixed(1)))
        }

        resolve()
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
          name: '秒',
          data: this.xData,
          boundaryGap: false // 从0点开始
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false // 隐藏背景网格线
          },
          min: this.pdfData.target - 10 >= 0 ? this.pdfData.target - 10 : 0,
          max: this.pdfData.midpoint + 10
        },
        legend: {},
        series: [
          {
            name: '综合轨迹',
            data: this.pdfData.comprehensiveArray,
            color: 'red',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: `参考曲线(${this.pdfData.target}~${this.pdfData.midpoint})`,
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
        `腹式呼吸训练-综合报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`,
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
.train-abdominal-respiration-pdf {
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
          .item {
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
