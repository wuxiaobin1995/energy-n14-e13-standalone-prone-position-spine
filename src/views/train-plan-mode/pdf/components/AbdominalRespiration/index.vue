<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-06 09:28:53
 * @LastEditTime: 2023-10-23 14:30:17
 * @Description : 腹式呼吸训练-pdf子组件
-->
<template>
  <div class="plan-abdominal-respiration-pdf">
    <div class="chart">
      <div
        id="abdominal-respiration-chart"
        :style="{ width: '100%', height: '100%' }"
      ></div>
    </div>

    <div class="other">
      <el-image :src="lv" fit="scale-down"></el-image>
      <div class="val">
        <div class="title" :style="{ color: colorLv }">{{ textLv }}</div>
        <div class="item">综合训练评分：{{ data.completion }}分</div>
        <div class="item">训练时长：{{ data.trainTime }}</div>
        <div class="item">{{ advice }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'plan-abdominal-respiration-pdf',

  props: {
    data: {
      type: Object,
      default: {}
    }
  },

  data() {
    return {
      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      lv: require('@/assets/img/Train/PDF/优秀.png'),
      oneLv: require('@/assets/img/Train/PDF/优秀.png'), // 优秀
      twoLv: require('@/assets/img/Train/PDF/良好.png'), // 良好
      threeLv: require('@/assets/img/Train/PDF/较差.png'), // 较差
      fourLv: require('@/assets/img/Train/PDF/差.png'), // 差
      textLv: '',
      colorLv: '#000000',
      advice: '' // 建议
    }
  },

  created() {
    /* 根据不同的评分动态变化显示 */
    if (this.data.completion < 40) {
      this.advice = '腹式呼吸差，建议加强腹式呼气训练'
      this.lv = this.fourLv
      this.textLv = '差'
      this.colorLv = '#FA5151'
    } else if (this.data.completion >= 40 && this.data.completion <= 59) {
      this.advice = '腹式呼吸较差，建议加强腹式呼气训练'
      this.lv = this.threeLv
      this.textLv = '较差'
      this.colorLv = '#FFC300'
    } else if (this.data.completion >= 60 && this.data.completion <= 79) {
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
  },
  mounted() {
    /* 渲染图形 */
    this.initChart()
  },

  methods: {
    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      /* x轴 */
      this.xData = []
      for (let i = 0; i < this.data.trainTime * 10; i++) {
        this.xData.push(parseFloat((i * 0.1).toFixed(1)))
      }

      this.myChart = this.$echarts.init(
        document.getElementById('abdominal-respiration-chart')
      )
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
          min: this.data.midpoint - 10 >= 0 ? this.data.midpoint - 10 : 0,
          max: this.data.midpoint + 10
        },
        legend: {},
        series: [
          {
            name: `${this.data.type}-轨迹`,
            data: this.data.comprehensiveArray,
            color: 'red',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: `上限曲线(${this.data.midpoint + 5})`,
            data: this.data.bgUpArray,
            color: 'green',
            type: 'line',
            smooth: false,
            showSymbol: false
          },
          {
            name: `下限曲线(${this.data.midpoint - 5})`,
            data: this.data.bgDownArray,
            color: 'green',
            type: 'line',
            smooth: false,
            showSymbol: false
          }
        ],
        animation: false
      }
      this.myChart.setOption(this.option)
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-abdominal-respiration-pdf {
  width: 100%;
  height: 60%;
  padding: 10px;
  @include flex(row, space-between, stretch);

  .chart {
    flex: 1;
  }

  .other {
    @include flex(row, center, center);
    width: 520px;
    .val {
      padding-left: 20px;
      width: 300px;
      font-size: 20px;
      font-weight: 700;
      .title {
        margin-bottom: 30px;
        font-size: 46px;
      }
      .item {
        margin-bottom: 3px;
      }
    }
  }
}
</style>
