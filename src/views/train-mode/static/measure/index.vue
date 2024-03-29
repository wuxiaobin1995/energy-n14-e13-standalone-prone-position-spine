<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-12 20:45:16
 * @LastEditTime: 2023-06-02 14:53:41
 * @Description : 静态稳定训练-具体测量
-->
<template>
  <div class="static-measure">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <!-- 主区域 -->
      <div class="main">
        <!-- 左半部 -->
        <div class="left">
          <div class="title">静态稳定训练</div>
          <div v-if="action === '1'" class="text">
            动作要求：控制光标移动到绿色区域内，持续收紧腰腹部使光标不晃动，<span
              :style="{ color: 'green' }"
              >保持单腿屈曲的动作</span
            >，过程中肩部和臀部紧贴软垫，直至训练结束。
          </div>
          <div v-if="action === '2'" class="text">
            动作要求：控制光标移动到绿色区域内，持续收紧腰腹部使光标不晃动，<span
              :style="{ color: 'green' }"
              >保持双腿屈曲的动作</span
            >，过程中将肩部和臀部紧贴软垫，直至训练结束。
          </div>
          <div v-if="action === '3'" class="text">
            动作要求：控制光标移动到绿色区域内，持续收紧腰腹部使光标不晃动，<span
              :style="{ color: 'green' }"
              >保持对侧肢体屈曲的动作</span
            >，过程中将肩部和臀部紧贴软垫，直至训练结束。
          </div>
          <div class="content">
            <div class="time-bg">
              <div class="time-rd-f">
                <div class="time-rd-c">
                  <div class="time-text">{{ time }}</div>
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

        <!-- 右半部 -->
        <div class="right">
          <div class="amplify-btn">
            <el-button class="item" type="success" @click="handleAmplify"
              >放 大</el-button
            >
          </div>
          <div class="img">
            <el-image :src="actionSrc" fit="scale-down"></el-image>
          </div>
          <div class="text">
            <div>训练目标</div>
            <div class="val">{{ target }}</div>
          </div>
          <div class="text">
            <div>训练组数</div>
            <div class="val">{{ nowGroups }}/{{ groups }}</div>
          </div>
          <div class="text">
            <div>当组完成度</div>
            <div class="val">{{ completion }}</div>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button
          class="item"
          :disabled="isStart"
          type="primary"
          @click="handleStart"
          >开始训练</el-button
        >
        <el-button
          class="item"
          :disabled="!isFinished"
          type="success"
          @click="handleToPdf"
          >查看报告</el-button
        >
        <el-button class="item" type="info" plain @click="handleGoBack"
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

      <!-- 图示放大弹窗 -->
      <el-dialog
        title="图 示"
        :visible.sync="imgDialogVisible"
        width="30%"
        center
      >
        <div class="img-dialog">
          <el-image :src="actionSrc" fit="scale-down"></el-image>
        </div>
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
  name: 'static-measure',

  data() {
    return {
      /* 路由传参 */
      scope: JSON.parse(this.$route.query.scope), // 目标范围
      target: JSON.parse(this.$route.query.target), // 训练目标
      keepTime: JSON.parse(this.$route.query.keepTime), // 训练时长
      groups: JSON.parse(this.$route.query.groups), // 训练组数
      groupRestTime: JSON.parse(this.$route.query.groupRestTime), // 组间休息时长
      action: JSON.parse(this.$route.query.action), // 动作

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(
        __static,
        `narrate/mandarin/Train/静态稳定训练-1.mp3`
      ),
      audioSrc1: path.join(
        __static,
        `narrate/mandarin/Train/静态稳定训练-1.mp3`
      ),
      audioSrc2: path.join(
        __static,
        `narrate/mandarin/Train/静态稳定训练-2.mp3`
      ),
      audioSrc3: path.join(
        __static,
        `narrate/mandarin/Train/静态稳定训练-3.mp3`
      ),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 控制相关 */
      isStart: false, // 是否开始训练
      isFinished: false, // 是否完成该训练
      isRest: false, // 是否处于休息状态

      oneSrc: require('@/assets/img/Train/Static/1.png'),
      twoSrc: require('@/assets/img/Train/Static/2.png'),
      threeSrc: require('@/assets/img/Train/Static/3.png'),

      imgDialogVisible: false, // 图示弹窗

      /* 其他 */
      nowGroups: 0, // 实时组数

      trainTimeClock: null, // 训练计时器
      time: JSON.parse(this.$route.query.keepTime), // 实时训练倒计时
      restDialogVisible: false, // 休息倒计时弹窗
      restTimeClock: null, // 休息计时器
      nowGroupRestTime: JSON.parse(this.$route.query.groupRestTime), // 实时休息时间倒计时

      core: 0, // 光标实时数值

      completion: null, // 每组的完成度
      depthArray: [], // 每组的数据数组
      completionResultArray: [], // 多组的完成度数组

      pdfTime: ''
    }
  },

  created() {
    if (this.action === '1') {
      this.audioSrc = this.audioSrc1
    } else if (this.action === '2') {
      this.audioSrc = this.audioSrc2
    } else if (this.action === '3') {
      this.audioSrc = this.audioSrc3
    }

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
    // 清除训练计时器
    if (this.trainTimeClock) {
      clearInterval(this.trainTimeClock)
    }
    // 清除休息计时器
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

  computed: {
    actionSrc() {
      if (this.action === '1') {
        return this.oneSrc
      } else if (this.action === '2') {
        return this.twoSrc
      } else {
        return this.threeSrc
      }
    }
  },

  methods: {
    /**
     * @description: 图示放大
     */
    handleAmplify() {
      this.imgDialogVisible = true
    },

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
                this.core = depth

                if (this.isStart === true && this.isRest === false) {
                  this.depthArray.push(depth)
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
     * @description: 更新绿色块逻辑函数
     */
    updateBg() {
      const newTarget = this.target
      const newHalfScope = parseFloat((this.scope / 2).toFixed(1))
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
     * @description: 休息倒计时弹窗函数
     */
    onRestDialog() {
      // 清除训练计时器
      if (this.trainTimeClock) {
        clearInterval(this.trainTimeClock)
      }

      // 开启弹窗
      this.restDialogVisible = true

      // 初始化倒计时长
      this.nowGroupRestTime = this.groupRestTime

      // 开始休息计时器倒计时
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

      // 清除休息计时器
      if (this.restTimeClock) {
        clearInterval(this.restTimeClock)
      }

      // 重新启动训练计时器
      this.depthArray = []
      this.completion = null
      this.time = this.keepTime
      this.setTrainTimeClock()

      // 关闭弹窗
      this.restDialogVisible = false
    },

    /**
     * @description: 训练定时器函数
     */
    setTrainTimeClock() {
      this.trainTimeClock = setInterval(() => {
        this.time -= 1
        if (this.time === 0) {
          // 进入休息状态，标志位置true
          this.isRest = true

          this.nowGroups += 1

          /* 计算完成度 */
          const halfScope = parseFloat((this.scope / 2).toFixed(1))
          const up = this.target + halfScope
          const down = this.target - halfScope
          const yesArray = []
          for (let i = 0; i < this.depthArray.length; i++) {
            const item = this.depthArray[i]
            if (item >= down && item <= up) {
              yesArray.push(item)
            }
          }
          this.completion = parseFloat(
            ((yesArray.length / this.depthArray.length) * 100).toFixed(0)
          )
          this.completionResultArray.push(this.completion)

          if (this.nowGroups < this.groups) {
            this.onRestDialog()
          }
          if (this.nowGroups === this.groups) {
            this.saveData()
          }
        }
      }, 1000)
    },

    /**
     * @description: 保存数据逻辑函数
     */
    saveData() {
      // 清除训练计时器
      if (this.trainTimeClock) {
        clearInterval(this.trainTimeClock)
      }
      // 清除休息计时器
      if (this.restTimeClock) {
        clearInterval(this.restTimeClock)
      }
      // 关闭串口
      if (this.usbPort) {
        if (this.usbPort.isOpen) {
          this.usbPort.close()
        }
      }

      /* 计算平均完成度 */
      let sum = 0
      for (let i = 0; i < this.completionResultArray.length; i++) {
        sum += this.completionResultArray[i]
      }
      const completion = parseInt(sum / this.completionResultArray.length)

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

          scope: this.scope, // 目标范围
          target: this.target, // 训练目标
          keepTime: this.keepTime, // 训练时长
          groups: this.groups, // 训练组数
          groupRestTime: this.groupRestTime, // 组间休息时长
          action: this.action, // 动作

          completionResultArray: this.completionResultArray, // 多组的完成度数组
          completion: completion, // 平均完成度
          pdfTime: this.pdfTime,

          type: '静态稳定训练'
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
     * @description: 开始按钮
     */
    handleStart() {
      this.isStart = true
      this.setTrainTimeClock() // 开始训练计时
    },

    /**
     * @description: 查看报告按钮
     */
    handleToPdf() {
      this.$router.push({
        path: '/train-static-pdf',
        query: {
          userId: JSON.stringify(this.$store.state.currentUserInfo.userId),
          pdfTime: JSON.stringify(this.pdfTime),
          routerName: JSON.stringify('/train-select/static-set')
        }
      })
    },

    /**
     * @description: 返回上一页
     */
    handleGoBack() {
      this.$router.push({
        path: '/train-select/static-set'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.static-measure {
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

    /* 主区域 */
    .main {
      flex: 1;
      @include flex(row, space-between, stretch);
      .left {
        width: 24%;
        .title {
          font-size: 40px;
          font-weight: 700;
          color: green;
          margin-bottom: 10px;
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
        @include flex(column, center, center);
        .amplify-btn {
          @include flex(row, center, center);
          margin-bottom: 10px;
        }
        .img {
          width: 38vh;
          @include flex(row, center, center);
          margin-bottom: 50px;
        }
        .text {
          font-size: 26px;
          margin-bottom: 30px;
          @include flex(row, center, center);
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
      .item {
        font-size: 26px;
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

    .img-dialog {
      @include flex(row, center, center);
      transform: scale(2);
    }
  }
}
</style>
