<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-12 20:45:16
 * @LastEditTime: 2023-02-22 17:30:15
 * @Description : 静态训练-具体测量
-->
<template>
  <div class="static-measure">
    <div class="wrapper">
      <!-- 主区域 -->
      <div class="main">
        <div class="left">
          <div class="title">静态训练</div>
          <div v-if="action === '1'" class="text">
            动作要求：首先将光标移动到绿色区域内，随后腰腹部持续收紧使光标不晃动，保持单腿屈曲的动作，过程中将肩部和臀部紧贴软垫，直至训练结束。
          </div>
          <div v-if="action === '2'" class="text">
            动作要求：首先将光标移动到绿色区域内，随后腰腹部持续收紧使光标不晃动，保持双腿屈曲的动作，过程中将肩部和臀部紧贴软垫，直至训练结束。
          </div>
          <div v-if="action === '3'" class="text">
            动作要求：首先将光标移动到绿色区域内，随后腰腹部持续收紧使光标不晃动，保持对侧肢体屈曲的动作，过程中将肩部和臀部紧贴软垫，直至训练结束。
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
          <div class="title">动作展示</div>
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
          class="item"
          :disabled="isStart"
          type="primary"
          @click="handleStart"
          >开始训练</el-button
        >
        <el-button
          class="item"
          :disabled="!isStart"
          type="danger"
          @click="handleOver"
          >结束训练</el-button
        >
        <el-button
          class="item"
          :disabled="!isFinish"
          type="success"
          @click="handleToPdf"
          >查看报告</el-button
        >
        <el-button class="item" type="info" plain @click="handleGoBack"
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
  name: 'static-measure',

  data() {
    return {
      /* 路由传参 */
      halfScope: JSON.parse(this.$route.query.halfScope),
      target: JSON.parse(this.$route.query.target),
      keepTime: JSON.parse(this.$route.query.keepTime),
      action: JSON.parse(this.$route.query.action),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 控制相关 */
      isStart: false,
      isFinish: false,

      oneSrc: require('@/assets/img/Train/Static/1.png'),
      twoSrc: require('@/assets/img/Train/Static/2.png'),
      threeSrc: require('@/assets/img/Train/Static/3.png'),

      /* 其他 */
      timeClock: null, // 计时器
      time: JSON.parse(this.$route.query.keepTime), // 倒计时
      core: 0, // 光标数值
      depthArray: [], // 数据数组

      pdfTime: ''
    }
  },

  created() {
    this.updateBg()
    this.initSerialPort()
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
                if (this.isStart === true) {
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

          halfScope: this.halfScope,
          target: this.target,
          keepTime: this.keepTime,
          action: this.action,
          completion: completion,
          depthArray: this.depthArray,
          type: '静态训练'
        })
        .then(() => {
          this.$message({
            message: '数据保存成功',
            type: 'success',
            duration: 1500
          })
        })
        .then(() => {
          this.isFinish = true
          this.time = this.keepTime // 倒计时
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
        @include flex(column, center, center);
        .title {
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 18px;
        }
        .img {
          width: 38vh;
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
      .item {
        font-size: 26px;
        margin: 0 40px;
      }
    }
  }
}
</style>
