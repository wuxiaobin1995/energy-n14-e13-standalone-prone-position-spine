<!--
 * @Author      : Mr.bin
 * @Date        : 2023-05-17 09:32:54
 * @LastEditTime: 2023-05-17 11:58:29
 * @Description : 腹式呼吸训练-具体测量
-->
<template>
  <div class="abdominal-respiration-measure">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <div class="title">腹式呼吸训练</div>
      <div>提示：开始有5秒预备时间，请从中间位开始预备</div>

      <div class="content">
        <div class="chart">
          <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
        </div>
        <div class="num">
          <div class="text">训练次数</div>
          <div class="value">{{ residueNum }}/{{ num }}</div>
        </div>
        <div class="num">
          <div class="text">训练组数</div>
          <div class="value">{{ residueGroups }}/{{ groups }}</div>
        </div>
      </div>

      <div class="btn">
        <el-button
          class="item"
          type="primary"
          :disabled="isStart"
          @click="handleStart"
          >开始训练</el-button
        >
        <el-button
          class="item"
          type="warning"
          :disabled="!isStart"
          v-show="isPause"
          @click="handleContinue"
          >继续训练</el-button
        >
        <el-button
          class="item"
          type="warning"
          :disabled="!isStart"
          v-show="!isPause"
          @click="handlePause"
          >暂停训练</el-button
        >
        <el-button
          class="item"
          type="success"
          :disabled="!isFinished"
          @click="handleToPdf"
          >查看报告</el-button
        >
        <el-button class="item" type="info" @click="handleGoBack"
          >返 回</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'abdominal-respiration-measure',

  data() {
    return {
      targetUp: this.$store.state.bothFlexibility.maxDepth,
      targetDown: this.$store.state.bothFlexibility.minDepth,

      /* 路由传参 */
      midpoint: JSON.parse(this.$route.query.midpoint), // 灵活度中点
      target: JSON.parse(this.$route.query.target), // 训练目标
      num: JSON.parse(this.$route.query.num), // 训练次数
      groups: JSON.parse(this.$route.query.groups), // 训练组数
      groupRestTime: JSON.parse(this.$route.query.groupRestTime), // 组间休息时间
      keepTime: JSON.parse(this.$route.query.keepTime), // 保持时间
      restTime: JSON.parse(this.$route.query.restTime), // 休息时间

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/鼻吸气.mp3`),
      audioInSrc: path.join(__static, `narrate/mandarin/鼻吸气.mp3`),
      audioOutSrc: path.join(__static, `narrate/mandarin/嘴呼气.mp3`),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      /* 控制相关 */
      isStart: false, // 是否开始
      isPause: false, // 是否暂停
      isFinished: false, // 是否完成该次训练
      isDelayed: true, // 是否要延时预备

      /* 其他 */
      residueNum: JSON.parse(this.$route.query.num), // 实时次数
      residueGroups: JSON.parse(this.$route.query.groups), // 实时组数

      residueNumArray: [], // 用于显示剩余次数的数组
      depthShowArray: [], // 展示数据数组
      depthArray: [], // 完整数据数组

      standardArray: [], // 基础参考曲线
      bgArray: [] // 参考曲线，暂定5个一组
    }
  },

  created() {
    this.initSerialPort()
  },
  mounted() {
    this.countChart().then(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    // 关闭串口
    if (this.usbPort) {
      if (this.usbPort.isOpen) {
        this.usbPort.close()
      }
    }
  },

  methods: {
    /**
     * @description: 初始化串口对象
     */
    initSerialPort() {
      SerialPort.list()
        .then(ports => {
          /* 遍历设备的USB串口，目标设备需安装驱动 */
          let comPath = ''
          for (const port of ports) {
            if (/^USB/.test(port.pnpId)) {
              comPath = port.path
              break
            }
          }

          /* 验证USB有没有连接到电脑，但不能验证有无数据发送给上位机 */
          if (comPath) {
            /**
             * @description: 创建串口实例
             * @param {String} comPath 串行端口的系统路径。例如：在Mac、Linux上的/dev/tty.XXX或Windows上的COM1
             * @param {Object} 配置项
             */
            this.usbPort = new SerialPort(comPath, {
              baudRate: this.scmBaudRate,
              autoOpen: false // 是否自动开启串口
            })
            /* 调用 this.usbPort.open() 成功时触发（开启串口成功） */
            this.usbPort.on('open', () => {
              this.isStart = true
              this.$message({
                message: '预备阶段，倒计时5秒......',
                type: 'warning',
                duration: 4500
              })
            })
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
              this.$alert(`请重新连接USB线，然后重试！`, '串口开启失败', {
                type: 'error',
                showClose: false,
                center: true,
                confirmButtonText: '返回上一页',
                callback: () => {
                  this.handleGoBack()
                }
              })
            })

            this.parser = this.usbPort.pipe(new Readline({ delimiter: '\n' }))
            this.parser.on('data', data => {
              const depth = parseInt(data)
              /* 只允许正整数和0，且[0, 100] */
              if (/^-?[0-9]\d*$/.test(depth) && depth >= 0 && depth <= 100) {
                /* 判断是否暂停 */
                if (this.isPause === false) {
                  /* 延时预备5秒，让用户有个时间调整 */
                  if (this.isDelayed === true) {
                    this.depthShowArray.push(depth)
                    this.option.series[0].data = this.depthShowArray
                    this.myChart.setOption(this.option)
                    if (this.depthShowArray.length >= 50) {
                      this.$message({
                        message: '正式开始！',
                        type: 'success',
                        duration: 3000
                      })
                      this.depthShowArray = []
                      this.isDelayed = false
                      // 先放一次鼻吸气语音，让用户的腰部在高位开始
                      if (this.audioOpen === true) {
                        this.audioSrc = this.audioInSrc
                        setTimeout(() => {
                          this.$refs.audio.currentTime = 0
                          this.$refs.audio.play()
                        }, 100)
                      }
                    }
                  }

                  /* 预备结束，正式开始测量 */
                  if (this.isDelayed === false) {
                    this.depthArray.push(depth)
                    this.depthShowArray.push(depth)
                    this.residueNumArray.push(depth)

                    if (this.depthShowArray.length === this.bgArray.length) {
                      this.depthShowArray = []
                    }
                    if (
                      this.residueNumArray.length === this.standardArray.length
                    ) {
                      this.residueNumArray = []
                      this.residueNum -= 1
                    }

                    /* 语音播放 */
                    if (this.audioOpen === true) {
                      if (
                        this.residueNumArray.length ===
                        this.restTime * 10 - 6
                      ) {
                        this.audioSrc = this.audioOutSrc
                        setTimeout(() => {
                          this.$refs.audio.currentTime = 0
                          this.$refs.audio.play()
                        }, 100)
                      } else if (
                        this.residueNumArray.length ===
                        this.standardArray.length - 16
                      ) {
                        this.audioSrc = this.audioInSrc
                        setTimeout(() => {
                          this.$refs.audio.currentTime = 0
                          this.$refs.audio.play()
                        }, 100)
                      }
                    }

                    // 渲染图形
                    this.option.series[0].data = this.depthShowArray
                    this.myChart.setOption(this.option)

                    // 结束
                    if (
                      this.depthArray.length ===
                      this.num * this.standardArray.length
                    ) {
                      this.saveData()
                    }
                  }
                }
              }
            })
          } else {
            this.$alert(`请重新连接USB线，然后重试！`, '没有检测到USB连接', {
              type: 'error',
              showClose: false,
              center: true,
              confirmButtonText: '返回上一页',
              callback: () => {
                this.handleGoBack()
              }
            })
          }
        })
        .catch(err => {
          this.$alert(
            `${err}。请重新连接USB线，然后重试！`,
            `初始化SerialPort.list失败`,
            {
              type: 'error',
              showClose: false,
              center: true,
              confirmButtonText: '返回上一页',
              callback: () => {
                this.handleGoBack()
              }
            }
          )
        })
    },

    /**
     * @description: 计算图形所需参数逻辑函数
     */
    countChart() {
      return new Promise((resolve, reject) => {
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
          min: this.target - 10 >= 0 ? this.target - 10 : 0
        },
        legend: {},
        series: [
          {
            name: '轨迹',
            data: [],
            color: 'red',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: `参考曲线(${this.target}~${this.midpoint})`,
            data: this.bgArray,
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
     * @description: 保存数据逻辑函数
     */
    saveData() {
      if (this.usbPort) {
        if (this.usbPort.isOpen) {
          this.usbPort.close()
        }
      }

      this.isStart = false
      this.isPause = false
      this.isDelayed = true

      /* 计算完成度 */
      const contrastArray = []
      for (let i = 0; i < this.num; i++) {
        contrastArray.push(...this.standardArray)
      }
      const yesArray = []
      for (let i = 0; i < this.depthArray.length; i++) {
        const item = this.depthArray[i]
        const contrast = contrastArray[i]
        const differenceVal = Math.abs(item - contrast)
        if (differenceVal >= 0 && differenceVal <= 5) {
          yesArray.push(differenceVal)
        }
      }
      const result = parseFloat(
        ((yesArray.length / this.depthArray.length) * 100).toFixed(0)
      )

      /* 保存 */
      this.$axios
        .post('/saveTrainRecord_v2', {
          devices_name: facilityID,
          user_id: this.$store.state.currentUserInfo.userId,
          number_target: this.num,
          completion: result,
          record_array: JSON.stringify(this.depthArray),
          upper_limit: this.targetUp,
          lower_limit: this.targetDown,
          midpoint: this.midpoint,
          press_down: this.target,
          keep_time: this.keepTime,
          rest_time: this.restTime,
          type: 'abdominal-respiration'
        })
        .then(res => {
          this.isFinished = true
          this.residueNum = this.num
        })
    },

    /**
     * @description: 开始训练按钮
     */
    handleStart() {
      this.isStart = false
      this.isPause = false
      this.isFinished = false
      this.isDelayed = true
      this.residueNumArray = [] // 用于显示剩余个数的数组
      this.depthShowArray = [] // 展示数据数组
      this.depthArray = [] // 完整数据数组
      this.residueNum = this.num

      if (this.usbPort) {
        if (!this.usbPort.isOpen) {
          this.usbPort.open()
        }
      }
    },

    /**
     * @description: 继续训练按钮
     */
    handleContinue() {
      this.isPause = false
    },

    /**
     * @description: 暂停训练按钮
     */
    handlePause() {
      this.isPause = true
    },

    /**
     * @description: 查看报告按钮
     */
    handleToPdf() {
      this.$router.push({
        path: '/train-abdominal-respiration-pdf',
        query: {
          routerName: JSON.stringify('/train-select/abdominal-respiration-set')
        }
      })
    },

    /**
     * @description: 返回上一页
     */
    handleGoBack() {
      this.$router.push({
        path: '/train-select/abdominal-respiration-set'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.abdominal-respiration-measure {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 94%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 40px;
    @include flex(column, stretch, stretch);

    .title {
      font-size: 34px;
      color: green;
    }

    .content {
      flex: 1;
      @include flex(row, space-between, stretch);
      .chart {
        flex: 1;
      }
      .num {
        font-size: 24px;
        @include flex(column, center, center);
        .text {
          margin-bottom: 16px;
        }
        .value {
          @include flex(row, center, center);
          padding: 4px 0;
          border: 1px solid black;
          border-radius: 5px;
          width: 100px;
          background-color: rgb(216, 216, 216);
        }
      }
    }

    .btn {
      @include flex(row, center, center);
      .item {
        font-size: 28px;
        margin: 0 40px;
      }
    }
  }
}
</style>
