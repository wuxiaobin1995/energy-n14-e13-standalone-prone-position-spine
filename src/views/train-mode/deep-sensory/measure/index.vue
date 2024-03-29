<!--
 * @Author      : Mr.bin
 * @Date        : 2023-02-24 16:08:17
 * @LastEditTime: 2023-05-23 15:05:10
 * @Description : 本体感觉训练-具体测量
-->
<template>
  <div class="deep-sensory-measure">
    <div class="wrapper">
      <!-- 主区域 -->
      <div class="main">
        <!-- left区域 -->
        <div class="left">
          <div class="title">本体感觉训练</div>
          <dir class="info">
            倒计时5秒，取结束时刻的值，休息{{
              groupRestTime
            }}秒后，自动进行下一组训练。
          </dir>
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

        <!-- 图形区（默认不显示） -->
        <div v-show="false" class="chart">
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

        <!-- right区域 -->
        <div class="right">
          <div class="text">
            <div>目标范围</div>
            <div class="val">{{ scope }}</div>
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
            <div>当组测量值</div>
            <div class="val active">{{ coreResult }}</div>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button
          class="item"
          type="success"
          :disabled="!isFinished"
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
  name: 'deep-sensory-measure',

  data() {
    return {
      /* 路由传参 */
      scope: JSON.parse(this.$route.query.scope), // 目标范围
      target: JSON.parse(this.$route.query.target), // 训练目标
      groups: JSON.parse(this.$route.query.groups), // 训练组数
      groupRestTime: JSON.parse(this.$route.query.groupRestTime), // 组间休息时长

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 控制相关 */
      isFinished: false, // 是否完成该训练
      isRest: false, // 是否处于休息状态

      /* 其他 */
      nowGroups: 0, // 实时组数

      trainTimeClock: null, // 训练计时器
      time: 5, // 实时训练倒计时，默认5秒
      restDialogVisible: false, // 休息倒计时弹窗
      restTimeClock: null, // 休息计时器
      nowGroupRestTime: JSON.parse(this.$route.query.groupRestTime), // 实时休息时间倒计时

      core: 0, // 光标实时数值
      coreResult: null, // 每组的测量结果值
      coreResultArray: [], // 多组的结果值数组

      pdfTime: ''
    }
  },

  created() {
    this.updateBg()
    this.initSerialPort()
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
            this.usbPort.on('open', () => {
              this.setTrainTimeClock() // 开始训练
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
                if (this.isRest === false) {
                  this.core = depth
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
     * @description: 绿色块逻辑函数
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

      // 进入休息状态，标志位置true
      this.isRest = true

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
      this.coreResult = null
      this.time = 5
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
          this.nowGroups += 1
          this.coreResult = this.core
          this.coreResultArray.push(this.coreResult)

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

      /* 计算完成度和平均值 */
      let sum = 0
      for (let i = 0; i < this.coreResultArray.length; i++) {
        sum += this.coreResultArray[i]
      }
      const average = parseInt(sum / this.coreResultArray.length)
      const completion = parseInt(
        (1 - Math.abs(average - this.target) / this.target) * 100
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

          scope: this.scope, // 目标范围
          target: this.target, // 训练目标
          groups: this.groups, // 训练组数
          groupRestTime: this.groupRestTime, // 组间休息时长

          coreResultArray: this.coreResultArray, // 多组的结果值数组
          average: average, // 平均值
          completion: completion, // 完成度
          pdfTime: this.pdfTime,

          type: '本体感觉训练'
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
     * @description: 查看PDF按钮
     */
    handleToPdf() {
      this.$router.push({
        path: '/train-deep-sensory-pdf',
        query: {
          userId: JSON.stringify(this.$store.state.currentUserInfo.userId),
          pdfTime: JSON.stringify(this.pdfTime),
          routerName: JSON.stringify('/train-select/deep-sensory-set')
        }
      })
    },

    /**
     * @description: 返回上一页按钮
     */
    handleGoBack() {
      this.$router.push({
        path: '/train-select/deep-sensory-set'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.deep-sensory-measure {
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
        .title {
          color: green;
          font-size: 34px;
        }
        .info {
          margin-bottom: 12vh;
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
          padding-right: 150px;
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
  }
}
</style>
