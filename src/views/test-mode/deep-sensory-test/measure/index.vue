<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-17 15:34:09
 * @LastEditTime: 2022-05-23 17:18:28
 * @Description : 深感觉测试-测量页面
-->
<template>
  <div
    class="deep-sensory-test-measure"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- 主区域 -->
    <div class="main">
      <div class="left">
        <div class="title">深感觉测试</div>
        <div class="content">
          <div v-show="timeShow" class="time-bg">
            <div class="time-rd-f">
              <div class="time-rd-c">
                <div class="time-text">{{ this.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图形区 -->
      <div v-show="chartShow" class="chart">
        <div class="chart__bg" :style="bgColorObj"></div>
        <el-slider
          class="chart__core"
          v-model="core"
          vertical
          :min="0"
          :max="100"
          :disabled="true"
          :show-tooltip="true"
        ></el-slider>
      </div>

      <div class="right">
        <!-- <div class="text">
          <div>训练范围</div>
          <div class="val">{{ halfScope * 2 }}</div>
        </div> -->
        <div class="text">
          <div>训练目标</div>
          <div class="val">{{ target }}</div>
        </div>
        <div class="text">
          <div>第一次值</div>
          <div class="val active">{{ oneVal }}</div>
        </div>
        <div class="text">
          <div>第二次值</div>
          <div class="val active">{{ twoVal }}</div>
        </div>
        <div class="text">
          <div>第三次值</div>
          <div class="val active">{{ threeVal }}</div>
        </div>
        <div class="text">
          <div>平均值</div>
          <div class="val active">{{ averageCore }}</div>
        </div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button
        class="btn__item"
        type="primary"
        :disabled="!isRestart"
        @click="handleRestart"
        >重新测试</el-button
      >
      <el-button
        class="btn__item"
        type="success"
        :disabled="!isFinished"
        @click="handleToPdf"
        >查看报告</el-button
      >
      <el-button class="btn__item" type="info" plain @click="handleGoBack"
        >返回</el-button
      >
    </div>
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

import { ipcRenderer } from 'electron'

export default {
  name: 'deep-sensory-test-measure',

  data() {
    return {
      /* 路由传参 */
      halfScope: JSON.parse(this.$route.query.halfScope),
      target: JSON.parse(this.$route.query.target),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 控制相关 */
      timeShow: true,
      chartShow: false,
      isRestart: false,
      isFinished: false, // 是否完成该次测试

      /* 其他 */
      fullscreenLoading: false,
      timeClock: null, // 计时器
      time: 15, // 倒计时，默认15秒，做3次
      core: 0, // 光标数值

      oneVal: null,
      twoVal: null,
      threeVal: null,
      averageCore: null, // 平均值

      dataId: null // 后端数据库中数据的id，字符串类型
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', true)

    this.updateBg()
    this.initSerialPort()
    this.setTimeClock()
  },
  beforeDestroy() {
    // 清除计时器
    if (this.timeClock) {
      clearInterval(this.timeClock)
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
              autoOpen: true // 是否自动开启串口
            })
            /* 调用 this.usbPort.open() 成功时触发（开启串口成功） */
            this.usbPort.on('open', () => {})
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
                this.core = depth
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
     * @description: 更新绿色块逻辑函数
     */
    updateBg() {
      const newTarget = this.target
      const newHalfScope = this.halfScope
      this.bgColorObj = {
        'background-image': `linear-gradient(
          to top,
          rgba(254, 231, 107, 1) ${0}%,
          rgba(254, 231, 107, 1) ${newTarget - newHalfScope}%,
          rgba(112, 173, 71, 1) ${newTarget - newHalfScope}%,
          rgba(112, 173, 71, 1) ${newTarget + newHalfScope}%,
          rgba(254, 231, 107, 1) ${newTarget + newHalfScope}%,
          rgba(254, 231, 107, 1) ${100}%
        )`
      }
    },

    /**
     * @description: 定时器逻辑函数
     */
    setTimeClock() {
      this.timeClock = setInterval(() => {
        this.time -= 1
        if (this.time === 10) {
          this.oneVal = this.core ? this.core : 0
        } else if (this.time === 5) {
          this.twoVal = this.core ? this.core : 0
        } else if (this.time === 0) {
          this.threeVal = this.core ? this.core : 0
        }

        if (
          this.oneVal !== null &&
          this.twoVal !== null &&
          this.threeVal !== null
        ) {
          this.averageCore = parseInt(
            ((this.oneVal + this.twoVal + this.threeVal) / 3).toFixed(0)
          )
          this.core = this.averageCore
          this.saveData()
        }
      }, 1000)
    },

    /**
     * @description: 保存数据逻辑函数
     */
    saveData() {
      if (this.timeClock) {
        clearInterval(this.timeClock)
      }
      if (this.usbPort) {
        if (this.usbPort.isOpen) {
          this.usbPort.close()
        }
      }
      this.timeShow = false
      this.chartShow = true

      /* 保存 */
      const facilityID = window.localStorage.getItem('facilityID')
      const userId = this.$store.state.currentUser.userId
      this.fullscreenLoading = true
      this.$axios
        .post('/saveTestRecord2', {
          devices_name: facilityID,
          user_id: userId,
          oneVal: this.oneVal,
          twoVal: this.twoVal,
          threeVal: this.threeVal,
          target: this.target,
          type: 'deep-sensory'
        })
        .then(res => {
          const data = res.data
          // console.log(data)
          if (data.status === 1) {
            /* 成功 */
            this.dataId = data.result.id
            this.isFinished = true // 允许点击查看报告按钮
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
            `[深感觉测试环节] ${err}。请确保网络连接正常，点击"返回上一页"按钮，然后重新测试！`,
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
          this.isRestart = true
        })
    },

    /**
     * @description: 重新测试按钮
     */
    handleRestart() {
      this.isRestart = false
      this.isFinished = false
      this.timeClock = null // 计时器
      this.time = 15
      this.timeShow = true
      this.chartShow = false
      this.oneVal = null
      this.twoVal = null
      this.threeVal = null
      this.averageCore = null
      this.dataId = null

      if (this.usbPort) {
        if (!this.usbPort.isOpen) {
          this.usbPort.open()

          this.setTimeClock()
        }
      }
    },

    /**
     * @description: 查看PDF按钮
     */
    handleToPdf() {
      this.$router.push({
        path: '/layout/deep-sensory-test-pdf',
        query: {
          dataId: this.dataId, // 字符串类型
          routerName: '/layout/deep-sensory-test-set'
        }
      })
    },

    /**
     * @description: 返回上一页按钮
     */
    handleGoBack() {
      this.$router.push({
        path: '/layout/deep-sensory-test-set'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.deep-sensory-test-measure {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  @include flex(column, stretch, stretch);

  /* 主区域 */
  .main {
    flex: 1;
    @include flex(row, space-between, stretch);
    .left {
      .title {
        color: green;
        font-size: 34px;
        margin-bottom: 15vh;
      }
      .content {
        @include flex(row, center, center);
        padding-left: 100px;
        /* 倒计时 */
        .time-bg {
          width: 400px;
          height: 280px;
          @include flex(row, center, center);
          background-color: rgba(2, 145, 2, 0.2);
          border-radius: 12%;
          .time-rd-f {
            width: 180px;
            height: 180px;
            padding: 5px;
            border-radius: 50%;
            background-image: -webkit-linear-gradient(top, red 0%, blue 90%);
            .time-rd-c {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background-color: #ffffff;
              @include flex(row, center, center);
              .time-text {
                font-size: 80px;
              }
            }
          }
        }
      }
    }

    /* 图形区 */
    .chart {
      flex: 1;
      @include flex(row, center, stretch);
      .chart__bg {
        width: 80px;
        height: 80%;
      }
      .chart__core {
        height: 80%;
        & /deep/ .el-slider__runway {
          background-color: #ffffff;
        }
        & /deep/ .el-slider__bar {
          background-color: #ffffff;
        }
        &
          /deep/
          .el-slider__runway.disabled
          .el-slider__button-wrapper
          .el-slider__button {
          width: 0;
          height: 0;
          border-top: 12px solid transparent;
          border-right: 30px solid red;
          border-bottom: 12px solid transparent;
          border-left: 0 solid transparent;
          border-radius: 0;
          background-color: #ffffff;
        }
      }
    }

    .right {
      .text {
        padding-right: 50px;
        font-size: 28px;
        margin: 60px 0;
        @include flex(row, space-between, center);
        .val {
          @include flex(row, center, center);
          width: 100px;
          margin-left: 20px;
          border-radius: 6px;
          border: 1px solid rgb(161, 161, 161);
          background-color: rgb(242, 242, 242);
        }
        .active {
          color: red;
        }
      }
    }
  }

  /* 按钮组 */
  .btn {
    @include flex(row, center, center);
    .btn__item {
      font-size: 26px;
      margin: 0 40px;
    }
  }
}
</style>
