<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-17 15:30:15
 * @LastEditTime: 2022-05-23 09:23:02
 * @Description : 灵活性测试-测量页面
-->
<template>
  <div
    class="flexibility-test-measure"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- left -->
    <div class="left">
      <div class="header">
        <el-page-header
          class="page"
          title="返回"
          @back="handleGoBack"
        ></el-page-header>
        <div class="text">
          <div class="text__item">
            控制腰腹部缓慢向上抬至最高，随后缓慢向下压至最低，<span
              :style="{ color: 'red' }"
              >重复3次</span
            >
          </div>
          <div class="text__item">注意：上抬的过程中保持肩部和臀部紧贴软垫</div>
        </div>
      </div>

      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>

      <div class="btn">
        <el-button
          class="btn__item"
          plain
          type="primary"
          :disabled="isOpened"
          @click="handleStart"
          >开 始</el-button
        >
        <el-button
          class="btn__item"
          plain
          type="danger"
          :disabled="!isOpened"
          @click="handleFinish"
          >结 束</el-button
        >
        <el-button
          class="btn__item"
          type="success"
          :disabled="!isFinished"
          @click="handleToPdf"
          >查看报告</el-button
        >
        <el-button class="btn__item" plain type="info" @click="handleRefresh"
          >刷新页面</el-button
        >
        <el-button class="btn__item" plain type="warning" @click="handleGoBack"
          >返 回</el-button
        >
      </div>
    </div>

    <!-- right -->
    <div class="right">
      <div class="img">
        <el-image :src="imgSrc" fit="fit"></el-image>
      </div>

      <div class="result">
        <div>灵活度：{{ flexibility ? flexibility : '空' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

import { ipcRenderer } from 'electron'

export default {
  name: 'flexibility-test-measure',

  data() {
    return {
      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      /* 控制相关 */
      isOpened: false, // 是否串口开启成功
      isFinished: false, // 是否完成该次测试

      /* 其他 */
      imgSrc: require('@/assets/img/test-mode/flexibility-test/3.png'),
      fullscreenLoading: false,
      depthArray: [], // 数据数组
      flexibility: null, // 灵活度
      dataId: null // 后端数据库中数据的id，字符串类型
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
              this.isOpened = true
            })
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
              this.$alert(
                `请重新连接USB线，然后点击"刷新页面"按钮！`,
                '串口开启失败',
                {
                  type: 'error',
                  showClose: false,
                  center: true,
                  confirmButtonText: '刷新页面',
                  callback: () => {
                    this.handleRefresh()
                  }
                }
              )
            })

            this.parser = this.usbPort.pipe(new Readline({ delimiter: '\n' }))
            this.parser.on('data', data => {
              const depth = parseInt(data)
              /* 只允许正整数和0，且[0, 100] */
              if (/^-?[0-9]\d*$/.test(depth) && depth >= 0 && depth <= 100) {
                this.depthArray.push(depth)
                // 渲染图形
                this.option.series[0].data = this.depthArray
                this.myChart.setOption(this.option)
                // 完成
                if (this.depthArray.length === 180) {
                  this.saveData()
                }
              }
            })
          } else {
            this.$alert(
              `请重新连接USB线，然后点击"刷新页面"按钮！`,
              '没有检测到USB连接',
              {
                type: 'error',
                showClose: false,
                center: true,
                confirmButtonText: '刷新页面',
                callback: () => {
                  this.handleRefresh()
                }
              }
            )
          }
        })
        .catch(err => {
          this.$alert(
            `${err}。请重新连接USB线，然后点击"刷新页面"按钮！`,
            `初始化SerialPort.list失败`,
            {
              type: 'error',
              showClose: false,
              center: true,
              confirmButtonText: '刷新页面',
              callback: () => {
                this.handleRefresh()
              }
            }
          )
        })
    },

    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      // 计算横坐标数组
      this.xData = []
      for (let i = 0; i < 180; i++) {
        this.xData.push(parseFloat((i * 0.1).toFixed(1)))
      }

      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          name: '秒',
          data: this.xData
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100
        },
        series: [
          {
            data: [],
            type: 'line',
            smooth: true,
            showSymbol: false
          }
        ]
      }
      this.myChart.setOption(this.option)
    },

    /**
     * @description: 测试完成逻辑函数
     */
    saveData() {
      if (this.usbPort) {
        if (this.usbPort.isOpen) {
          this.usbPort.close()

          this.isOpened = false

          const maxDepth = Math.max(...this.depthArray)
          const minDepth = Math.min(...this.depthArray)
          this.flexibility = maxDepth - minDepth

          /* 保存 */
          const facilityID = window.localStorage.getItem('facilityID')
          const userId = this.$store.state.currentUser.userId
          this.fullscreenLoading = true
          this.$axios
            .post('/saveTestRecord', {
              devices_name: facilityID,
              user_id: userId,
              flexibility: this.flexibility,
              type: 'flexibility'
            })
            .then(res => {
              const data = res.data
              if (data.status === 1) {
                /* 成功 */
                this.dataId = data.result.id
                this.isFinished = true // 允许点击查看报告按钮
                this.$message({
                  message: `[状态码为 ${data.status}] 数据保存成功`,
                  type: 'success',
                  duration: 3000
                })
                this.$store
                  .dispatch('setBothFlexibility', {
                    maxDepth: maxDepth,
                    minDepth: minDepth
                  })
                  .catch(() => {
                    this.$alert(
                      `设置最大、最小灵活度Vuex失败，请重新测试！`,
                      '警告',
                      {
                        type: 'error',
                        center: false,
                        showClose: false,
                        confirmButtonText: '确 定',
                        callback: () => {}
                      }
                    )
                  })
              } else if (data.status === 0) {
                /* 失败 */
                this.$alert(
                  `[状态码为 ${data.status}] 数据保存失败，请点击"刷新页面"按钮，然后重新测试！`,
                  '警告',
                  {
                    type: 'error',
                    showClose: false,
                    confirmButtonText: '刷新页面',
                    callback: () => {
                      this.handleRefresh()
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
                `[灵活性测试环节] ${err}。请确保网络连接正常，然后重新测试！`,
                '网络请求错误',
                {
                  type: 'error',
                  showClose: false,
                  confirmButtonText: '重新测试',
                  callback: () => {
                    this.handleRefresh()
                  }
                }
              )
            })
            .finally(() => {
              this.fullscreenLoading = false
            })
        }
      }
    },

    /**
     * @description: 开始按钮
     */
    handleStart() {
      // 初始化相关变量
      this.isOpened = false
      this.isFinished = false
      this.depthArray = []
      this.flexibility = null
      this.dataId = null

      if (this.usbPort) {
        if (!this.usbPort.isOpen) {
          this.usbPort.open()
        }
      }
    },

    /**
     * @description: 结束按钮
     */
    handleFinish() {
      this.saveData()
    },

    /**
     * @description: 查看PDF按钮
     */
    handleToPdf() {
      this.$router.push({
        path: '/layout/flexibility-test-pdf',
        query: {
          dataId: this.dataId, // 字符串类型
          routerName: '/layout/flexibility-test-measure'
        }
      })
    },

    /**
     * @description: 刷新页面按钮
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: '/layout/flexibility-test-measure',
          duration: 300
        }
      })
    },

    /**
     * @description: 返回上一页按钮
     */
    handleGoBack() {
      this.$router.push({
        path: '/layout/flexibility-test-des'
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
.flexibility-test-measure {
  width: 100%;
  height: 100%;
  padding: 20px;
  @include flex(row, stretch, stretch);

  .left {
    flex: 1;
    @include flex(column, stretch, stretch);
    .header {
      @include flex(row, flex-start, center);
      .page /deep/ .el-page-header__title {
        font-size: 24px;
      }
      .text {
        font-size: 20px;
        .text__item {
          margin: 5px 0;
        }
      }
    }
    .chart {
      flex: 1;
    }
    .btn {
      @include flex(row, center, center);
      .btn__item {
        font-size: 28px;
        margin: 0 30px;
      }
    }
  }

  .right {
    @include flex(column, flex-start, center);
    width: 240px;
    .img {
      margin-top: 5vh;
      width: 98%;
    }
    .result {
      margin-top: 20vh;
      font-size: 24px;
    }
  }
}
</style>
