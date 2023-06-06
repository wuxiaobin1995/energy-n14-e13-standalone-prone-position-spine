<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-06 09:28:53
 * @LastEditTime: 2023-06-06 14:11:51
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
        <div class="item">训练目标：{{ data.target }}</div>
        <div class="item">训练次数：{{ data.num }}</div>
        <div class="item">训练组数：{{ data.groups }}</div>
        <div class="item">保持时长：{{ data.keepTime }}秒</div>
        <div class="item">休息时长：{{ data.restTime }}秒</div>
        <div class="item">组间休息时长：{{ data.groupRestTime }}秒</div>
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

      /* 参考曲线相关 */
      standardArray: [], // 基础参考曲线
      fullArray: [], // 完整参考曲线

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
    this.countChart().then(() => {
      this.initChart()
    })
  },

  methods: {
    /**
     * @description: 计算图形所需参数逻辑函数
     */
    countChart() {
      return new Promise((resolve, reject) => {
        const midpoint = this.data.midpoint // 灵活度中点
        const target = this.data.target // 训练目标
        const restTime = this.data.restTime // 休息时长
        const keepTime = this.data.keepTime // 保持时长

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
        for (let i = 0; i < this.data.num; i++) {
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
          min: this.data.target - 10 >= 0 ? this.data.target - 10 : 0,
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
            name: `参考曲线(${this.data.target}~${this.data.midpoint})`,
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
