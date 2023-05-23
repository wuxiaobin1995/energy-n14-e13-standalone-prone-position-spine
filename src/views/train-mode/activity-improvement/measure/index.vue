<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-12 17:42:55
 * @LastEditTime: 2023-05-22 16:08:33
 * @Description : 活动度训练-具体测量
-->
<template>
  <div class="activity-improvement-measure">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <div class="title">活动度训练</div>
      <div>提示：开始有5秒预备时间，请从低位开始预备</div>

      <!-- 主内容区 -->
      <div class="content">
        <!-- 图形 -->
        <div class="chart">
          <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
        </div>

        <!-- 实时次数和组数 -->
        <div class="num">
          <div class="item">
            <div class="text">训练次数</div>
            <div class="value">{{ nowNum }}/{{ num }}</div>
          </div>
          <div class="item">
            <div class="text">训练组数</div>
            <div class="value">{{ nowGroups }}/{{ groups }}</div>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
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

      <!-- 休息倒计时弹窗 -->
      <el-dialog
        title="休 息 倒 计 时"
        :visible.sync="restDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        top="30vh"
        width="20%"
        center
      >
        <div class="rest-dialog">
          <div class="item">{{ nowGroupRestTime }}</div>
        </div>
        <span slot="footer">
          <el-button type="primary" @click="handleSkip">跳 过</el-button>
        </span>
      </el-dialog>
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
  name: 'activity-improvement-measure',

  data() {
    return {
      /* 路由传参 */
      targetUp: JSON.parse(this.$route.query.targetUp), // 上限
      targetDown: JSON.parse(this.$route.query.targetDown), // 下限
      num: JSON.parse(this.$route.query.num), // 训练次数
      groups: JSON.parse(this.$route.query.groups), // 训练组数
      intervalTime: JSON.parse(this.$route.query.intervalTime), // 间隔时长
      groupRestTime: JSON.parse(this.$route.query.groupRestTime), // 组间休息时长

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/上凸.mp3`),
      audioUpSrc: path.join(__static, `narrate/mandarin/上凸.mp3`),
      audioDownSrc: path.join(__static, `narrate/mandarin/下压.mp3`),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      /* 参考曲线相关 */
      standardArray: [], // 基础参考曲线
      bgArray: [], // 参考曲线，暂定5个一组

      /* 控制相关 */
      isStart: false, // 是否开始训练
      isPause: false, // 是否暂停训练
      isFinished: false, // 是否完成该训练
      isDelayed: true, // 是否要延时预备
      isRest: false, // 是否处于休息状态

      /* 其他 */
      nowNum: 0, // 实时次数
      nowGroups: 0, // 实时组数
      restDialogVisible: false, // 休息倒计时弹窗
      restTimeClock: null, // 休息计时器
      nowGroupRestTime: JSON.parse(this.$route.query.groupRestTime), // 实时休息时间倒计时

      nowNumArray: [], // 用于计算剩余次数的数组
      depthShowArray: [], // 实时展示曲线轨迹数组
      depthArray: [], // 一组完整数据数组
      allDepthArray: [], // 多组完整数据数组
      pdfTime: ''
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
    // 清除计时器
    if (this.restTimeClock) {
      clearInterval(this.restTimeClock)
    }
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
                      /* 正式开始，先放一次上凸语音 */
                      if (this.audioOpen === true) {
                        this.audioSrc = this.audioUpSrc
                        setTimeout(() => {
                          this.$refs.audio.currentTime = 0
                          this.$refs.audio.play()
                        }, 100)
                      }
                    }
                  }

                  /* 预备结束，正式开始测量 */
                  if (this.isDelayed === false && this.isRest === false) {
                    this.depthArray.push(depth)
                    this.depthShowArray.push(depth)
                    this.nowNumArray.push(depth)

                    if (this.depthShowArray.length === this.bgArray.length) {
                      this.depthShowArray = []
                    }
                    if (this.nowNumArray.length === this.standardArray.length) {
                      this.nowNumArray = []
                      this.nowNum += 1
                    }

                    /* 语音播放 */
                    if (this.audioOpen === true) {
                      if (
                        this.nowNumArray.length ===
                        this.intervalTime * 20 - 4
                      ) {
                        this.audioSrc = this.audioUpSrc
                        setTimeout(() => {
                          this.$refs.audio.currentTime = 0
                          this.$refs.audio.play()
                        }, 100)
                      } else if (
                        this.nowNumArray.length ===
                        this.intervalTime * 10 - 4
                      ) {
                        this.audioSrc = this.audioDownSrc
                        setTimeout(() => {
                          this.$refs.audio.currentTime = 0
                          this.$refs.audio.play()
                        }, 100)
                      }
                    }

                    // 渲染图形
                    this.option.series[0].data = this.depthShowArray
                    this.myChart.setOption(this.option)

                    // 结束一组训练
                    if (
                      this.depthArray.length ===
                      this.num * this.standardArray.length
                    ) {
                      this.nowGroups += 1 // 实时组数+1
                      this.allDepthArray.push(this.depthArray) // 数组累加

                      this.depthArray = []
                      this.depthShowArray = []
                      this.nowNumArray = []

                      // 休息弹窗
                      if (this.nowGroups < this.groups) {
                        this.onRestDialog()
                      }
                    }

                    /* 所有组完成，保存数据 */
                    if (this.nowGroups >= this.groups) {
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
        const targetUp = this.targetUp // 上限
        const targetDown = this.targetDown // 下限
        const intervalTime = this.intervalTime // 间隔时长

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
        for (let i = 0; i < 5; i++) {
          this.bgArray.push(...this.standardArray)
        }
        this.bgArray.push(targetDown)

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
          min: this.targetDown - 10 >= 0 ? this.targetDown - 10 : 0,
          max: this.targetUp + 10 <= 100 ? this.targetUp + 10 : 100
        },
        legend: {},
        series: [
          {
            name: '单组轨迹',
            data: [],
            color: 'red',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: `参考曲线(${this.targetDown}~${this.targetUp})`,
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
     * @description: 休息倒计时弹窗函数
     */
    onRestDialog() {
      // 进入休息状态，标志位置true
      this.isRest = true

      // 清一下实时次数
      this.nowNum = 0

      // 开启弹窗
      this.restDialogVisible = true

      // 初始化倒计时长
      this.nowGroupRestTime = this.groupRestTime

      // 开始倒计时
      this.restTimeClock = setInterval(() => {
        this.nowGroupRestTime -= 1
        if (this.nowGroupRestTime === 0) {
          this.handleSkip()
        }
      }, 1000)
    },
    /**
     * @description: 跳过休息按钮
     */
    handleSkip() {
      // 休息结束，标志位置false
      this.isRest = false

      // 清除计时器
      if (this.restTimeClock) {
        clearInterval(this.restTimeClock)
      }

      // 关闭弹窗
      this.restDialogVisible = false
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

      this.isPause = false
      this.isDelayed = true
      this.isRest = false

      /* 计算综合曲线轨迹 */
      const allDepthArrayDelayering = [] // 数组扁平化
      for (let i = 0; i < this.allDepthArray.length; i++) {
        allDepthArrayDelayering.push(...this.allDepthArray[i])
      }
      // console.log(this.allDepthArray)
      // console.log(allDepthArrayDelayering)
      const itemArrLen = this.allDepthArray[0].length // 单个元素数组的元素数量
      let comprehensiveArray = []
      let sum = 0
      for (let i = 0; i < this.allDepthArray[0].length; i++) {
        for (let j = 0; j < this.groups; j++) {
          sum += allDepthArrayDelayering[itemArrLen * j + i]
        }
        comprehensiveArray.push(parseInt(sum / this.groups))
        sum = 0
      }
      // console.log(comprehensiveArray)

      /* 计算完成度 */
      const contrastArray = []
      for (let i = 0; i < this.num; i++) {
        contrastArray.push(...this.standardArray)
      }
      const yesArray = []
      for (let i = 0; i < comprehensiveArray.length; i++) {
        const item = comprehensiveArray[i]
        const contrast = contrastArray[i]
        const differenceVal = Math.abs(item - contrast)
        if (differenceVal >= 0 && differenceVal <= 5) {
          yesArray.push(differenceVal)
        }
      }
      const completion = parseFloat(
        ((yesArray.length / comprehensiveArray.length) * 100).toFixed(0)
      )

      /* 保存到数据库 */
      this.pdfTime = this.$moment().format('YYYY-MM-DD HH:mm:ss')
      const hospital = window.localStorage.getItem('hospital')
      const db = initDB()
      db.train_data
        .add({
          hospital: hospital,
          userId: this.$store.state.currentUserInfo.userId,
          userName: this.$store.state.currentUserInfo.userName,
          sex: this.$store.state.currentUserInfo.sex,
          height: this.$store.state.currentUserInfo.height,
          weight: this.$store.state.currentUserInfo.weight,
          birthday: this.$store.state.currentUserInfo.birthday,

          targetUp: this.targetUp, // 上限
          targetDown: this.targetDown, // 下限
          num: this.num, // 训练次数
          groups: this.groups, // 训练组数
          intervalTime: this.intervalTime, // 间隔时长
          groupRestTime: this.groupRestTime, // 组间休息时长

          allDepthArray: this.allDepthArray, // 多组完整数据数组
          comprehensiveArray: comprehensiveArray, // 综合曲线轨迹
          completion: completion, // 完成度
          pdfTime: this.pdfTime,

          type: '活动度训练'
        })
        .then(() => {
          this.$message({
            message: '数据保存成功',
            type: 'success',
            duration: 1500
          })
        })
        .then(() => {
          this.isFinished = true
        })
        .catch(() => {
          this.$alert(`请点击"返回"按钮，然后重新测试！`, '数据保存失败', {
            type: 'error',
            showClose: false,
            center: true,
            confirmButtonText: '返回',
            callback: () => {
              this.handleGoBack()
            }
          })
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
      this.isRest = false

      this.nowNumArray = [] // 用于计算剩余次数的数组
      this.depthShowArray = [] // 实时展示曲线轨迹数组
      this.depthArray = [] // 一组完整数据数组
      this.allDepthArray = [] // 多组完整数据数组

      this.nowNum = 0
      this.nowGroups = 0

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
        path: '/train-activity-improvement-pdf',
        query: {
          userId: JSON.stringify(this.$store.state.currentUserInfo.userId),
          pdfTime: JSON.stringify(this.pdfTime),
          routerName: JSON.stringify('/train-select/activity-improvement-set')
        }
      })
    },

    /**
     * @description: 返回上一页按钮
     */
    handleGoBack() {
      this.$router.push({
        path: '/train-select/activity-improvement-set'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.activity-improvement-measure {
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
        @include flex(column, center, stretch);
        padding: 0 20px;
        .item {
          font-size: 24px;
          @include flex(column, center, center);
          margin: 30px 0;
          .text {
            margin-bottom: 12px;
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
    }

    .btn {
      @include flex(row, center, center);
      .item {
        font-size: 28px;
        margin: 0 40px;
      }
    }

    .rest-dialog {
      @include flex(column, center, center);
      .item {
        font-size: 90px;
        font-weight: 700;
        color: green;
      }
    }
  }
}
</style>
