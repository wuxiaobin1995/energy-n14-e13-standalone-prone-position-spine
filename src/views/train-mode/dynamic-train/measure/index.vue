<!--
 * @Author      : Mr.bin
 * @Date        : 2021-12-07 14:11:52
 * @LastEditTime: 2022-03-03 20:35:27
 * @Description : 动态训练-测量页面
-->
<template>
  <div
    class="dynamic-train-measure"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <!-- 主区域 -->
    <div class="main">
      <div class="left">
        <div class="title">动态训练</div>
        <div v-if="action === '1'" class="text">
          动作要求：首先将光标移动到绿色区域内，随后腰腹部持续收紧使光标不晃动，单腿做屈伸的运动，过程中将肩部和臀部紧贴软垫，直至训练结束。
        </div>
        <div v-if="action === '2'" class="text">
          动作要求：首先将光标移动到绿色区域内，随后腰腹部持续收紧使光标不晃动，双腿做交替屈伸的运动，过程中将肩部和臀部紧贴软垫，直至训练结束。
        </div>
        <div v-if="action === '3'" class="text">
          动作要求：同时，首先将光标移动到绿色区域内，随后腰腹部持续收紧使光标不晃动，四肢做对侧交替屈伸的运动，过程中将肩部和臀部紧贴软垫，直至训练结束。
        </div>
        <div class="content">
          <div class="time-bg">
            <div class="time-rd-f">
              <div class="time-rd-c">
                <div class="time-text">{{ this.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图形区 -->
      <div class="chart">
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
        <div class="img">
          <el-image :src="actionSrc" fit="scale-down"></el-image>
        </div>
        <div class="text">
          <div>训练目标</div>
          <div class="val">{{ target }}</div>
        </div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button
        class="btn__item"
        :disabled="isStart"
        type="primary"
        @click="handleStart"
        >开始训练</el-button
      >
      <el-button
        class="btn__item"
        :disabled="!isStart"
        type="danger"
        @click="handleOver"
        >结束训练</el-button
      >
      <el-button
        class="btn__item"
        :disabled="!isFinish"
        type="success"
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
/* 路径模块 */
import path from 'path'

/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

import { ipcRenderer } from 'electron'

export default {
  name: 'dynamic-train-measure',

  data() {
    return {
      /* 路由传参 */
      halfScope: JSON.parse(this.$route.query.halfScope),
      target: JSON.parse(this.$route.query.target),
      keepTime: JSON.parse(this.$route.query.keepTime),
      action: JSON.parse(this.$route.query.action),

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(
        __static,
        `narrate/${this.$store.state.voiceBaseSrc}/19.mp3`
      ),
      audioOneSrc: path.join(
        __static,
        `narrate/${this.$store.state.voiceBaseSrc}/19.mp3`
      ),
      audioTwoSrc: path.join(
        __static,
        `narrate/${this.$store.state.voiceBaseSrc}/20.mp3`
      ),
      audioThreeSrc: path.join(
        __static,
        `narrate/${this.$store.state.voiceBaseSrc}/21.mp3`
      ),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 控制相关 */
      isStart: false,
      isFinish: false,

      /* 其他 */
      oneSrc: require('@/assets/img/train-mode/dynamic-train/1.gif'),
      twoSrc: require('@/assets/img/train-mode/dynamic-train/2.gif'),
      threeSrc: require('@/assets/img/train-mode/dynamic-train/3.gif'),
      fullscreenLoading: false,
      timeClock: null, // 计时器
      time: JSON.parse(this.$route.query.keepTime), // 倒计时
      core: 0, // 光标数值
      depthArray: [], // 数据数组
      dataId: null // 后端数据库中数据的id，字符串类型
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', true)
    this.updateBg()
    this.initSerialPort()
  },
  mounted() {
    if (this.audioOpen === true) {
      setTimeout(() => {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      }, 500)
    }
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

  computed: {
    actionSrc() {
      if (this.action === '1') {
        this.audioSrc = this.audioOneSrc
        return this.oneSrc
      } else if (this.action === '2') {
        this.audioSrc = this.audioTwoSrc
        return this.twoSrc
      } else {
        this.audioSrc = this.audioThreeSrc
        return this.threeSrc
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
                if (this.isStart === true) {
                  this.depthArray.push(depth)
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
        /* 倒计时结束 */
        if (this.time === 0) {
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
      this.isStart = false

      /* 计算完成度 */
      const up = this.target + this.halfScope
      const down = this.target - this.halfScope
      const yesArray = []
      for (let i = 0; i < this.depthArray.length; i++) {
        const item = this.depthArray[i]
        if (item >= down && item <= up) {
          yesArray.push(item)
        }
      }
      const result = parseFloat(
        ((yesArray.length / this.depthArray.length) * 100).toFixed(0)
      )

      /* 保存 */
      const facilityID = window.localStorage.getItem('facilityID')
      const userId = this.$store.state.currentUser.userId
      this.fullscreenLoading = true
      this.$axios
        .post('/saveTrainRecord', {
          devices_name: facilityID,
          user_id: userId,
          keep_time: this.keepTime,
          training_target: this.target,
          completion: result,
          record_array: JSON.stringify(this.depthArray),
          type: `dynamic-${this.action}`
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 成功 */
            this.isFinish = true
            this.time = this.keepTime // 倒计时
            this.dataId = data.result.id
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
            `[动态训练环节] ${err}。请确保网络连接正常，点击"返回上一页"按钮，然后重新测试！`,
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
          this.isStart = false
        })
    },

    /**
     * @description: 开始按钮
     */
    handleStart() {
      this.isStart = false
      this.isFinish = false
      this.timeClock = null // 计时器
      this.time = this.keepTime // 倒计时
      this.depthArray = []

      this.isStart = true
      this.setTimeClock() // 开始计时
    },

    /**
     * @description: 结束按钮
     */
    handleOver() {
      this.saveData()
    },

    /**
     * @description: 查看报告按钮
     */
    handleToPdf() {
      this.$router.push({
        path: '/layout/dynamic-train-pdf',
        query: {
          dataId: this.dataId, // 字符串类型
          routerName: '/layout/dynamic-train-set'
        }
      })
    },

    /**
     * @description: 返回上一页按钮
     */
    handleGoBack() {
      this.$router.push({
        path: '/layout/dynamic-train-set'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dynamic-train-measure {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  @include flex(column, stretch, stretch);

  /* 主区域 */
  .main {
    flex: 1;
    @include flex(row, space-between, stretch);
    .left {
      width: 24%;
      .title {
        color: green;
        font-size: 34px;
        margin-bottom: 20px;
      }
      .text {
        font-size: 20px;
        margin-bottom: 4vh;
      }
      .content {
        @include flex(row, center, center);
        /* 倒计时 */
        .time-bg {
          width: 360px;
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
          border-right: 30px solid green;
          border-bottom: 12px solid transparent;
          border-left: 0 solid transparent;
          border-radius: 0;
          background-color: #ffffff;
        }
      }
    }

    .right {
      .img {
        width: 44vh;
        @include flex(row, center, center);
      }
      .text {
        padding-right: 50px;
        font-size: 28px;
        margin: 80px 0;
        @include flex(row, space-between, center);
        .val {
          @include flex(row, center, center);
          width: 100px;
          margin-left: 20px;
          border-radius: 6px;
          border: 1px solid rgb(161, 161, 161);
          background-color: rgb(242, 242, 242);
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
