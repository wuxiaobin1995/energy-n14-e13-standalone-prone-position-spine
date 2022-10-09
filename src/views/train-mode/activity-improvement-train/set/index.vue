<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-26 11:51:19
 * @LastEditTime: 2022-02-11 09:17:16
 * @Description : 活动度改善训练-参数设置页面
-->
<template>
  <div class="activity-improvement-train-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="des">
      <div class="title">活动度改善训练</div>
      <div class="text">
        <div class="text__item">训练目的：改善腰椎灵活性；</div>
        <div class="text__item">
          动作要求：吸气同时控制腰腹部缓慢向上抬至最高，上抬的过程中保持肩部和臀部紧贴软垫，随后呼气同时控制腰腹部缓慢向下压至最低，重复至训练结束。
        </div>
      </div>
    </div>

    <div class="content">
      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>
      <div class="set">
        <!-- 训练个数 -->
        <div class="set__one">
          <span class="text">训练个数</span>
          <el-input-number
            v-model="num"
            :precision="0"
            :step="1"
            :min="5"
            :max="20"
          ></el-input-number>
        </div>
        <!-- 间隔时间 -->
        <div class="set__two">
          <span class="text">间隔时间</span>
          <el-input-number
            v-model="intervalTime"
            :precision="0"
            :step="1"
            :min="2"
            :max="10"
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
  name: 'activity-improvement-train-set',

  data() {
    return {
      /* 语音相关 */ audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(
        __static,
        `narrate/${this.$store.state.voiceBaseSrc}/10.mp3`
      ),

      /* 图形相关变量 */
      myChart: null,
      option: {},

      /* 其他 */
      targetUp: this.$store.state.bothFlexibility.maxDepth
        ? this.$store.state.bothFlexibility.maxDepth
        : 100,
      targetDown: this.$store.state.bothFlexibility.minDepth
        ? this.$store.state.bothFlexibility.minDepth
        : 0,

      num: 5, // 训练个数
      intervalTime: 4 // 间隔时间（秒）
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

    this.initChart()
    // 监听父容器的宽高变化，目的是实现echarts图形自适应父容器的宽高变化
    window.addEventListener('resize', this.resizeCharts)
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

  methods: {
    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          name: '秒',
          data: [],
          boundaryGap: false // 从0点开始
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false // 隐藏背景网格线
          },
          max: this.targetUp + 10,
          min: this.targetDown - 10 >= 0 ? this.targetDown - 10 : 0
        },
        legend: {},
        series: [
          {
            name: '上限',
            data: [this.targetUp, this.targetUp],
            color: 'blue',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: '下限',
            data: [this.targetDown, this.targetDown],
            color: 'green',
            type: 'line',
            smooth: true,
            showSymbol: false
          }
        ],
        animation: false
      }
      this.myChart.setOption(this.option)
    },

    /**
     * @description: 开始训练按钮
     */
    handleStart() {
      this.$router.push({
        path: '/layout/activity-improvement-train-measure',
        query: {
          targetUp: JSON.stringify(this.targetUp), // 上限
          targetDown: JSON.stringify(this.targetDown), // 下限
          num: JSON.stringify(this.num), // 训练个数
          intervalTime: JSON.stringify(this.intervalTime) // 间隔时间
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
.activity-improvement-train-set {
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
        .text {
          font-size: 22px;
          margin-right: 10px;
        }
      }
      .set__two {
        margin-top: 50px;
        .text {
          font-size: 22px;
          margin-right: 10px;
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
