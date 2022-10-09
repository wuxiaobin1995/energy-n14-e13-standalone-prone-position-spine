<!--
 * @Author      : Mr.bin
 * @Date        : 2021-12-01 16:27:01
 * @LastEditTime: 2022-05-24 10:50:36
 * @Description : 腹式呼吸训练-参数设置页面
-->
<template>
  <div class="abdominal-respiration-train-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="des">
      <div class="title">腹式呼吸训练</div>
      <div class="text">
        <div class="text__item">
          训练目的：进行腹式呼吸训练，加强腹横肌收缩能力；
        </div>
        <div class="text__item">
          首先鼻吸气腹部隆起，随后嘴呼气，同时控制腰腹部向下压紧床面且能触及侧腹部肌肉明显收紧，过程中保持肩部和臀部紧贴软垫，重复至训练结束
        </div>
      </div>
    </div>

    <div class="content">
      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>
      <div class="set">
        <!-- 训练目标 -->
        <div class="set__one">
          <span class="text">训练目标</span>
          <el-input-number
            v-model="target"
            :precision="0"
            :step="1"
            :min="targetDown + 5"
            :max="midpoint - 5"
            @change="handleTargetChange"
          ></el-input-number>
        </div>
        <!-- 训练个数 -->
        <div class="set__two">
          <span class="text">训练个数</span>
          <el-input-number
            v-model="num"
            :precision="0"
            :step="1"
            :min="5"
            :max="20"
          ></el-input-number>
        </div>
        <!-- 保持时间 -->
        <div class="set__three">
          <span class="text">保持时间</span>
          <el-input-number
            v-model="keepTime"
            :precision="0"
            :step="1"
            :min="3"
            :max="8"
            @change="handleKeepTimeChange"
          ></el-input-number>
        </div>
        <!-- 休息时间 -->
        <div class="set__four">
          <span class="text">休息时间</span>
          <el-input-number
            v-model="restTime"
            :precision="0"
            :step="1"
            :min="1"
            :max="3"
            @change="handleRestTimeChange"
          ></el-input-number>
        </div>
      </div>
    </div>

    <div class="btn">
      <el-button class="btn__item" type="primary" @click="handleStart"
        >开始训练</el-button
      >
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

export default {
  name: 'abdominal-respiration-train-set',

  data() {
    return {
      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(
        __static,
        `narrate/${this.$store.state.voiceBaseSrc}/12.mp3`
      ),

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // x轴

      /* 其他 */
      targetUp: this.$store.state.bothFlexibility.maxDepth
        ? this.$store.state.bothFlexibility.maxDepth
        : 100,
      targetDown: this.$store.state.bothFlexibility.minDepth
        ? this.$store.state.bothFlexibility.minDepth
        : 0,

      target:
        this.$store.state.bothFlexibility.minDepth + 5
          ? this.$store.state.bothFlexibility.minDepth + 5
          : 5, // 训练目标
      num: 5, // 训练个数，5~20
      keepTime: 6, // 保持时间，3~8
      restTime: 3, // 休息时间，1~3

      standardArray: [], // 基础参考曲线
      bgArray: [] // 参考曲线，暂定5个一组
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', false)
  },
  mounted() {
    if (this.audioOpen === true) {
      setTimeout(() => {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      }, 500)
    }

    this.countChart().then(() => {
      this.initChart()
      // 监听父容器的宽高变化，目的是实现echarts图形自适应父容器的宽高变化
      window.addEventListener('resize', this.resizeCharts)
    })
  },
  beforeDestroy() {
    // 注销echarts图形自适应监听事件
    window.removeEventListener('resize', this.resizeCharts)
  },

  watch: {
    '$store.state.isCollapse': {
      handler(newValue, oldValue) {
        setTimeout(() => {
          this.resizeCharts()
        }, 500)
      },
      immediate: true // 开启初次触发
    }
  },

  computed: {
    // 中点
    midpoint() {
      return parseInt(((this.targetUp + this.targetDown) / 2).toFixed(0))
    }
  },

  methods: {
    /**
     * @description: 计算图形所需参数逻辑函数
     */
    countChart() {
      return new Promise((resolve, reject) => {
        /* 绘制参考曲线逻辑 */
        const midpoint = this.midpoint // 中点
        const target = this.target // 目标
        const restTime = this.restTime // 休息时间
        const keepTime = this.keepTime // 保持时间

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

        this.bgArray = []
        for (let i = 0; i < 5; i++) {
          this.bgArray.push(...this.standardArray)
        }

        /* x轴 */
        this.xData = []
        for (let i = 0; i < this.bgArray.length; i++) {
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
          max: this.midpoint + 10,
          min: this.targetDown - 10 >= 0 ? this.targetDown - 10 : 0
        },
        legend: {},
        // tooltip: {},
        series: [
          {
            name: '参考曲线',
            data: this.bgArray,
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
     * @description: 训练目标改变触发
     */
    handleTargetChange() {
      this.countChart().then(() => {
        this.option.xAxis.data = this.xData
        this.option.series[0].data = this.bgArray
        this.myChart.setOption(this.option)
      })
    },
    /**
     * @description: 保持时间改变触发
     */
    handleKeepTimeChange() {
      this.countChart().then(() => {
        this.option.xAxis.data = this.xData
        this.option.series[0].data = this.bgArray
        this.myChart.setOption(this.option)
      })
    },
    /**
     * @description: 休息时间改变触发
     */
    handleRestTimeChange() {
      this.countChart().then(() => {
        this.option.xAxis.data = this.xData
        this.option.series[0].data = this.bgArray
        this.myChart.setOption(this.option)
      })
    },

    /**
     * @description: 开始训练按钮
     */
    handleStart() {
      this.$router.push({
        path: '/layout/abdominal-respiration-train-measure',
        query: {
          targetUp: JSON.stringify(this.targetUp), // 上限
          targetDown: JSON.stringify(this.targetDown), // 下限
          midpoint: JSON.stringify(this.midpoint), // 中点
          target: JSON.stringify(this.target), // 目标
          num: JSON.stringify(this.num), // 训练个数
          restTime: JSON.stringify(this.restTime), // 休息时间
          keepTime: JSON.stringify(this.keepTime) // 保持时间
        }
      })
    },

    /**
     * @description: 重新刷新画布（即重新获取父容器宽高），目的是实现echarts图形自适应父容器的宽高变化
     */
    resizeCharts() {
      if (this.myChart) {
        this.myChart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.abdominal-respiration-train-set {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  @include flex(column, stretch, stretch);

  .des {
    .title {
      font-size: 34px;
      color: green;
    }
    .text {
      margin-top: 15px;
      font-size: 18px;
      .text__item {
        margin-bottom: 5px;
      }
    }
  }

  .content {
    flex: 1;
    @include flex(row, space-between, stretch);
    .chart {
      flex: 1;
    }
    .set {
      @include flex(column, center, center);
      .set__one {
        margin-bottom: 50px;
        .text {
          margin-right: 10px;
          font-size: 22px;
        }
      }
      .set__two {
        margin-bottom: 50px;
        .text {
          margin-right: 10px;
          font-size: 22px;
        }
      }
      .set__three {
        margin-bottom: 50px;
        .text {
          margin-right: 10px;
          font-size: 22px;
        }
      }
      .set__four {
        .text {
          margin-right: 10px;
          font-size: 22px;
        }
      }
    }
  }

  .btn {
    @include flex(row, center, center);
    .btn__item {
      font-size: 28px;
    }
  }
}
</style>
