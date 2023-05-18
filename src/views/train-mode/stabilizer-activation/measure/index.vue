<!--
 * @Author      : Mr.bin
 * @Date        : 2023-02-08 14:17:27
 * @LastEditTime: 2023-03-08 09:00:44
 * @Description : 内核心激活训练-具体测量
-->
<template>
  <div class="stabilizer-activation-measure">
    <div class="wrapper">
      <div class="title">内核心激活训练</div>
      <div>提示：开始有5秒预备时间，请从低位开始预备</div>

      <div class="content">
        <div class="chart">
          <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
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
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'stabilizer-activation-measure',

  data() {
    return {
      /* 路由传参 */
      targetUp: JSON.parse(this.$route.query.targetUp),
      targetDown: JSON.parse(this.$route.query.targetDown),
      keepTime: JSON.parse(this.$route.query.keepTime),

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
      depthArray: [], // 完整数据数组
      pdfTime: '',

      bgArray: [] // 参考曲线
    }
  },

  created() {
    this.initSerialPort()
  },
  mounted() {
    this.initChart()
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
                if (this.isPause === false) {
                  // 延时预备5秒，让用户有个时间调整
                  if (this.isDelayed === true) {
                    this.depthArray.push(depth)
                    this.option.series[0].data = this.depthArray
                    this.myChart.setOption(this.option)
                    if (this.depthArray.length >= 50) {
                      this.$message({
                        message: '正式开始！',
                        type: 'success',
                        duration: 3000
                      })
                      this.depthArray = []
                      this.isDelayed = false
                    }
                  }

                  // 预备结束，正式测量
                  if (this.isDelayed === false) {
                    this.depthArray.push(depth)

                    // 渲染图形
                    this.option.series[0].data = this.depthArray
                    this.myChart.setOption(this.option)

                    // 结束并保存数据
                    if (this.depthArray.length === this.bgArray.length) {
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
     * @description: 初始化echarts图形
     */
    initChart() {
      /* 绘制参考曲线逻辑 */
      const keepTime = this.keepTime
      const targetUp = this.targetUp
      const targetDown = this.targetDown
      const intervalTarget = targetUp - targetDown
      const number = parseInt(intervalTarget / 5)

      const standardUpArray = []
      const standardTopArray = []
      const standardDownArray = []

      /* 上升阶段 */
      let sum = targetDown
      for (let i = 0; i < number; i++) {
        for (let i = 0; i < keepTime * 10; i++) {
          standardUpArray.push(sum)
        }
        for (let i = 0; i < 10; i++) {
          sum = sum + 0.5
          standardUpArray.push(sum)
        }
      }

      /* 最高阶段 */
      for (let i = 0; i < keepTime * 10; i++) {
        standardTopArray.push(sum)
      }

      /* 下降阶段 */
      for (let i = 0; i < number; i++) {
        for (let i = 0; i < 10; i++) {
          sum = sum - 0.5
          standardDownArray.push(sum)
        }
        for (let i = 0; i < keepTime * 10; i++) {
          standardDownArray.push(sum)
        }
      }

      this.bgArray.push(...standardUpArray)
      this.bgArray.push(...standardTopArray)
      this.bgArray.push(...standardDownArray)

      /* x轴 */
      for (let i = 0; i < this.bgArray.length; i++) {
        this.xData.push(parseFloat((i * 0.1).toFixed(1)))
      }

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
          min: targetDown - 3 >= 0 ? targetDown - 3 : 0,
          max: targetUp + 3 <= 100 ? targetUp + 3 : 100
        },
        legend: {},
        series: [
          {
            name: '运动轨迹',
            data: [],
            color: 'red',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: `参考曲线(${targetDown}~${targetUp})`,
            data: this.bgArray,
            color: 'rgba(0, 255, 0, 0.7)',
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
      const yesArray = []
      for (let i = 0; i < this.depthArray.length; i++) {
        const item = this.depthArray[i]
        const contrast = this.bgArray[i]
        const differenceVal = Math.abs(item - contrast)
        if (differenceVal >= 0 && differenceVal <= 2) {
          yesArray.push(differenceVal)
        }
      }
      const completion = parseFloat(
        ((yesArray.length / this.depthArray.length) * 100).toFixed(0)
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

          pdfTime: this.pdfTime,

          keepTime: this.keepTime,
          completion: completion,
          depthArray: this.depthArray,
          bgArray: this.bgArray,
          targetUp: this.targetUp,
          targetDown: this.targetDown,
          type: '内核心激活训练'
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
      this.depthArray = [] // 完整数据数组

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
        path: '/train-stabilizer-activation-pdf',
        query: {
          userId: JSON.stringify(this.$store.state.currentUserInfo.userId),
          pdfTime: JSON.stringify(this.pdfTime),
          routerName: JSON.stringify('/train-select/stabilizer-activation-set')
        }
      })
    },

    /**
     * @description: 返回上一页
     */
    handleGoBack() {
      this.$router.push({
        path: '/train-select/stabilizer-activation-set'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.stabilizer-activation-measure {
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
      @include flex(row, center, stretch);
      .chart {
        flex: 1;
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
