<!--
 * @Author      : Mr.bin
 * @Date        : 2023-05-02 16:28:38
 * @LastEditTime: 2023-05-31 14:52:39
 * @Description : 腹式呼吸训练-参数设置
-->
<template>
  <div class="abdominal-respiration-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="des">
      <div class="item">
        训练目的：进行腹式呼吸训练，加强腹横肌收缩能力，修复腹直肌分离，缓解肩颈疼痛
      </div>
      <div class="item">
        动作要求：首先鼻吸气腹部隆起，随后嘴呼气，同时控制腰腹部向下压紧，且能触及侧腹部肌肉明显收缩，同时保持肩部和臀部紧贴软垫，重复动作至训练结束
      </div>
      <div class="item">提示：从中间点开始预备</div>
    </div>

    <div class="content">
      <!-- 图形 -->
      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>

      <!-- 配置项 -->
      <div class="set">
        <!-- 训练目标 -->
        <div class="item">
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
        <!-- 训练次数 -->
        <div class="item">
          <span class="text">训练次数</span>
          <el-input-number
            v-model="num"
            :precision="0"
            :step="1"
            :min="5"
            :max="20"
          ></el-input-number>
        </div>
        <!-- 训练组数 -->
        <div class="item">
          <span class="text">训练组数</span>
          <el-input-number
            v-model="groups"
            :precision="0"
            :step="1"
            :min="2"
            :max="10"
          ></el-input-number>
        </div>
        <!-- 组间休息时长 -->
        <div class="item">
          <span class="text">组间休息时长</span>
          <el-input-number
            v-model="groupRestTime"
            :precision="0"
            :step="1"
            :min="30"
            :max="120"
            @change="handleKeepTimeChange"
          ></el-input-number>
        </div>
        <!-- 保持时间 -->
        <div class="item">
          <span class="text">保持时长</span>
          <el-input-number
            v-model="keepTime"
            :precision="0"
            :step="1"
            :min="1"
            :max="10"
            @change="handleKeepTimeChange"
          ></el-input-number>
        </div>
        <!-- 休息时间 -->
        <div class="item">
          <span class="text">休息时长</span>
          <el-input-number
            v-model="restTime"
            :precision="0"
            :step="1"
            :min="1"
            :max="10"
            @change="handleRestTimeChange"
          ></el-input-number>
        </div>
      </div>
    </div>

    <div class="btn">
      <el-button class="item" type="primary" @click="handleStart"
        >开始训练</el-button
      >
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

export default {
  name: 'abdominal-respiration-set',

  data() {
    return {
      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/腹式呼吸训练.mp3`),

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // x轴

      /* 其他 */
      targetUp: this.$store.state.bothFlexibility.maxDepth, // 上限
      targetDown: this.$store.state.bothFlexibility.minDepth, // 下限
      target: this.$store.state.bothFlexibility.minDepth + 5, // 训练目标
      num: 10, // 训练次数，5~20
      groups: 3, // 训练组数，2~10
      groupRestTime: 30, // 组间休息时长(s)，30~120
      keepTime: 4, // 保持时长(s)，1~10
      restTime: 2, // 休息时长(s)，1~10

      /* 参考曲线相关 */
      standardArray: [], // 基础参考曲线
      bgArray: [] // 参考曲线，暂定5个一组
    }
  },

  mounted() {
    this.countChart().then(() => {
      this.initChart()
    })

    if (this.audioOpen === true) {
      setTimeout(() => {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      }, 500)
    }
  },

  computed: {
    // 灵活度中点
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
        const midpoint = this.midpoint // 灵活度中点
        const target = this.target // 训练目标
        const restTime = this.restTime // 休息时长
        const keepTime = this.keepTime // 保持时长

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
          min: this.target - 10 >= 0 ? this.target - 10 : 0,
          max: this.midpoint + 10
        },
        legend: {},
        series: [
          {
            name: `参考曲线`,
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
        path: '/abdominal-respiration-measure',
        query: {
          targetUp: JSON.stringify(this.targetUp), // 上限
          targetDown: JSON.stringify(this.targetDown), // 下限
          midpoint: JSON.stringify(this.midpoint), // 灵活度中点
          target: JSON.stringify(this.target), // 训练目标
          num: JSON.stringify(this.num), // 训练次数
          groups: JSON.stringify(this.groups), // 训练组数
          groupRestTime: JSON.stringify(this.groupRestTime), // 组间休息时长
          keepTime: JSON.stringify(this.keepTime), // 保持时长
          restTime: JSON.stringify(this.restTime) // 休息时长
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.abdominal-respiration-set {
  width: 100%;
  height: 100%;
  @include flex(column, stretch, stretch);

  .des {
    margin: 5px 0 15px 60px;
    font-size: 18px;
    .item {
      margin-bottom: 5px;
    }
  }

  .content {
    flex: 1;
    @include flex(row, space-between, stretch);
    .chart {
      flex: 1;
    }
    .set {
      width: 35%;
      padding-left: 30px;
      @include flex(column, stretch, flex-start);
      .item {
        margin-bottom: 40px;
        .text {
          margin-right: 10px;
          font-size: 22px;
        }
      }
    }
  }

  .btn {
    @include flex(row, center, center);
    .item {
      font-size: 28px;
    }
  }
}
</style>
