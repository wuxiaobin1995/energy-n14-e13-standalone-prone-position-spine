<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-25 16:18:07
 * @LastEditTime: 2022-02-11 09:18:44
 * @Description : 内核心激活训练-测量页面
-->
<template>
  <div
    class="core-activation-train-measure"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <div class="title">内核心激活训练</div>

    <div class="content">
      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>
      <div class="num">
        <div class="text">剩余训练个数</div>
        <div class="value">{{ residueNum }}</div>
      </div>
    </div>

    <div class="btn">
      <el-button
        class="btn__item"
        type="primary"
        :disabled="isStart"
        @click="handleStart"
        >开始训练</el-button
      >
      <el-button
        class="btn__item"
        type="warning"
        :disabled="!isStart"
        v-show="isPause"
        @click="handleContinue"
        >继续训练</el-button
      >
      <el-button
        class="btn__item"
        type="warning"
        :disabled="!isStart"
        v-show="!isPause"
        @click="handlePause"
        >暂停训练</el-button
      >
      <el-button
        class="btn__item"
        type="danger"
        :disabled="!isStart"
        @click="handleOver"
        >结束训练</el-button
      >
      <el-button class="btn__item" @click="handleGoBack">返回</el-button>
    </div>
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

import { ipcRenderer } from 'electron'

export default {
  name: 'core-activation-train-measure',

  data() {
    return {
      /* 路由传参 */
      targetUp: JSON.parse(this.$route.query.targetUp),
      targetDown: JSON.parse(this.$route.query.targetDown),
      num: JSON.parse(this.$route.query.num),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 图形相关变量 */
      myChart: null,
      option: {},

      /* 控制相关 */
      isInto: false,
      isStart: false, // 是否开始
      isPause: false, // 是否暂停

      /* 其他 */
      fullscreenLoading: false,
      residueNum: JSON.parse(this.$route.query.num), // 剩余个数

      showArray: [] // 展示数组
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', true)
    this.initSerialPort()
  },
  mounted() {
    this.initChart()
    // 监听父容器的宽高变化，目的是实现echarts图形自适应父容器的宽高变化
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    // 关闭串口
    if (this.usbPort) {
      if (this.usbPort.isOpen) {
        this.usbPort.close()
      }
    }
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
            })
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
              this.$alert(`请重新连接USB线！`, '串口开启失败', {
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
                  this.showArray.push(depth)

                  if (this.showArray.length > 200) {
                    this.showArray = []
                  }

                  // 渲染图形
                  this.option.series[0].data = this.showArray
                  this.myChart.setOption(this.option)

                  // 判断次数逻辑
                  if (depth >= this.targetUp) {
                    this.isInto = true
                  }

                  if (this.isInto) {
                    if (depth <= this.targetDown) {
                      this.isInto = false
                      this.residueNum -= 1
                      if (this.residueNum === 0) {
                        this.saveData()
                      }
                    }
                  }
                }
              }
            })
          } else {
            this.$alert(`请重新连接USB线！`, '没有检测到USB连接', {
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
            `${err}。请重新连接USB线！`,
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
      const xData = []
      const targetUpArray = []
      const targetDownArray = []
      for (let i = 0; i < 200; i++) {
        xData.push(parseFloat((i * 0.1).toFixed(1)))
        targetUpArray.push(this.targetUp)
        targetDownArray.push(this.targetDown)
      }

      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          data: xData,
          boundaryGap: false // 从0点开始
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false // 隐藏背景网格线
          },
          max: this.targetUp + 20 <= 100 ? this.targetUp + 20 : 100,
          min: this.targetDown - 20 >= 0 ? this.targetDown - 20 : 0
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
            name: '上限',
            data: targetUpArray,
            color: 'blue',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: '下限',
            data: targetDownArray,
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

      /* 保存 */
      const result = this.residueNum === 0 ? 1 : 0
      const facilityID = window.localStorage.getItem('facilityID')
      const userId = this.$store.state.currentUser.userId
      this.fullscreenLoading = true
      this.$axios
        .post('/saveTrainRecord', {
          devices_name: facilityID,
          user_id: userId,
          adopt: result,
          type: 'core-activation'
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 成功 */
            this.residueNum = this.num
            this.$message({
              message: `[状态码为 ${data.status}] 数据保存成功`,
              type: 'success',
              duration: 3000
            })
          } else if (data.status === 0) {
            /* 失败 */
            this.$alert(
              `[状态码为 ${data.status}] 数据保存失败，请点击"返回上一页"按钮，然后重新测试！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '返回上一页',
                callback: () => {
                  this.handleGoBack()
                }
              }
            )
          } else if (data.status === -6) {
            /* 该用户ID不存在 */
            this.$alert(
              `[状态码为 ${data.status}] 该用户ID不存在，请重启软件！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '关闭软件',
                callback: () => {
                  ipcRenderer.send('close') // 关闭整个程序
                }
              }
            )
          } else if (data.status === -9) {
            /* 该设备编号不存在 */
            this.$alert(
              `[状态码为 ${data.status}] 该设备编号不存在，请重启软件！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '关闭软件',
                callback: () => {
                  ipcRenderer.send('close') // 关闭整个程序
                }
              }
            )
          } else if (data.status === -11) {
            /* 传参错误 */
            this.$alert(
              `[状态码为 ${data.status}] [${data.message}] 传参错误，请重启软件！`,
              '警告',
              {
                type: 'error',
                showClose: false,
                confirmButtonText: '关闭软件',
                callback: () => {
                  ipcRenderer.send('close') // 关闭整个程序
                }
              }
            )
          }
        })
        .catch(err => {
          this.$alert(
            `[内核心激活训练环节] ${err}。请确保网络连接正常，点击"返回上一页"按钮，然后重新测试！`,
            '网络请求错误',
            {
              type: 'error',
              showClose: false,
              confirmButtonText: '返回上一页',
              callback: () => {
                this.handleGoBack()
              }
            }
          )
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 开始训练按钮
     */
    handleStart() {
      // 初始化
      this.isInto = false
      this.isStart = false
      this.isPause = false
      this.showArray = [] // 展示数组
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
     * @description: 结束训练按钮
     */
    handleOver() {
      this.saveData()
    },

    /**
     * @description: 返回上一页按钮
     */
    handleGoBack() {
      this.$router.push({
        path: '/layout/core-activation-train-set'
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
.core-activation-train-measure {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
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
    .btn__item {
      font-size: 28px;
      margin: 0 40px;
    }
  }
}
</style>
