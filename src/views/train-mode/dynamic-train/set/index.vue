<!--
 * @Author      : Mr.bin
 * @Date        : 2021-12-06 17:57:07
 * @LastEditTime: 2022-05-24 14:10:58
 * @Description : 动态训练-参数设置页面
-->
<template>
  <div class="dynamic-train-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <!-- 文字说明 -->
    <div class="des">
      <div class="title">动态训练</div>
      <div class="content">
        <div class="content__item">训练目的：动态动作下，内核心稳定训练；</div>
        <div class="content__item">
          动作要求：首先将光标移动到绿色区域内，随后腰腹部持续收紧使光标不晃动，上下肢做指定的运动，过程中将肩部和臀部紧贴软垫，直至训练结束。
        </div>
      </div>
    </div>

    <!-- 主区域 -->
    <div class="main">
      <!-- 动作选择 -->
      <div class="action">
        <div class="item">
          <el-radio v-model="action" label="1" border>动作一</el-radio>
          <el-image :src="oneSrc" fit="scale-down"></el-image>
        </div>
        <div class="item">
          <el-radio v-model="action" label="2" border>动作二</el-radio>
          <el-image :src="twoSrc" fit="scale-down"></el-image>
        </div>
        <div class="item">
          <el-radio v-model="action" label="3" border>动作三</el-radio>
          <el-image :src="threeSrc" fit="scale-down"></el-image>
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
          :show-tooltip="false"
        ></el-slider>
      </div>

      <!-- 参数设置 -->
      <div class="set">
        <!-- 保持时间 -->
        <div class="set__one">
          <span class="text">保持时间</span>
          <el-input-number
            v-model="keepTime"
            :precision="0"
            :step="1"
            :min="10"
            :max="90"
          ></el-input-number>
        </div>

        <!-- 训练目标 -->
        <div class="set__two">
          <span class="text">训练目标</span>
          <el-input-number
            v-model="target"
            :precision="0"
            :step="5"
            :min="0"
            :max="100"
            @change="handleChangeTarget"
          ></el-input-number>
        </div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="btn__item" type="primary" @click="handleStart"
        >开始训练</el-button
      >
      <el-button class="btn__item" type="info" plain @click="handleRefresh"
        >刷新页面</el-button
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

export default {
  name: 'dynamic-train-set',

  data() {
    return {
      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(
        __static,
        `narrate/${this.$store.state.voiceBaseSrc}/18.mp3`
      ),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 其他 */
      oneSrc: require('@/assets/img/train-mode/dynamic-train/1.gif'),
      twoSrc: require('@/assets/img/train-mode/dynamic-train/2.gif'),
      threeSrc: require('@/assets/img/train-mode/dynamic-train/3.gif'),
      action: '1', // 动作选择
      core: 0, // 光标数值
      keepTime: 10, // 保持时间
      // 训练目标，默认取上下限的中间值
      target: parseInt(
        (this.$store.state.bothFlexibility.maxDepth +
          this.$store.state.bothFlexibility.minDepth) /
          2
      )
        ? parseInt(
            (this.$store.state.bothFlexibility.maxDepth +
              this.$store.state.bothFlexibility.minDepth) /
              2
          )
        : 50
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', false)
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
              this.$confirm(
                `请重新连接USB线，然后点击"刷新页面"按钮！`,
                '串口开启失败',
                {
                  type: 'error',
                  showClose: false,
                  closeOnClickModal: false,
                  closeOnPressEscape: false,
                  center: true,
                  confirmButtonText: '刷新页面',
                  cancelButtonText: '返回首页'
                }
              )
                .then(() => {
                  this.handleRefresh()
                })
                .catch(() => {
                  this.$router.push({
                    path: '/layout/home'
                  })
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
            this.$confirm(
              `请重新连接USB线，然后点击"刷新页面"按钮！`,
              '没有检测到USB连接',
              {
                type: 'error',
                showClose: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                center: true,
                confirmButtonText: '刷新页面',
                cancelButtonText: '返回首页'
              }
            )
              .then(() => {
                this.handleRefresh()
              })
              .catch(() => {
                this.$router.push({
                  path: '/layout/home'
                })
              })
          }
        })
        .catch(err => {
          this.$confirm(
            `${err}。请重新连接USB线，然后点击"刷新页面"按钮！`,
            `初始化SerialPort.list失败`,
            {
              type: 'error',
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              center: true,
              confirmButtonText: '刷新页面',
              cancelButtonText: '返回首页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.$router.push({
                path: '/layout/home'
              })
            })
        })
    },

    /**
     * @description: 训练目标计数器改变时触发
     */
    handleChangeTarget() {
      this.updateBg()
    },

    /**
     * @description: 更新绿色块逻辑函数
     */
    updateBg() {
      const newTarget = this.target
      const newHalfScope = 2.5
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
     * @description: 开始训练按钮
     */
    handleStart() {
      this.$router.push({
        path: '/layout/dynamic-train-measure',
        query: {
          halfScope: JSON.stringify(5),
          target: JSON.stringify(this.target),
          keepTime: JSON.stringify(this.keepTime),
          action: JSON.stringify(this.action)
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
          routerName: '/layout/dynamic-train-set',
          duration: 500
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dynamic-train-set {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  @include flex(column, stretch, stretch);

  /* 文字说明 */
  .des {
    margin-bottom: 20px;
    .title {
      color: green;
      font-size: 34px;
      margin-bottom: 15px;
    }
    .content {
      font-size: 18px;
      .content__item {
        margin-bottom: 5px;
      }
    }
  }

  /* 主区域 */
  .main {
    flex: 1;
    @include flex(row, space-between, stretch);

    /* 动作选择 */
    .action {
      width: 30%;
      padding-left: 40px;
      .item {
        width: 42vh;
        @include flex(row, center, center);
        margin: 20px 0;
      }
    }

    /* 图形区 */
    .chart {
      flex: 1;
      @include flex(row, center, stretch);
      .chart__bg {
        width: 80px;
        height: 90%;
      }
      .chart__core {
        height: 90%;
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

    /* 参数设置 */
    .set {
      width: 30%;
      .set__one {
        margin: 100px 0;
        @include flex(row, flex-start, center);
        .text {
          font-size: 22px;
          margin-right: 10px;
        }
      }
      .set__two {
        @include flex(row, flex-start, center);
        .text {
          font-size: 22px;
          margin-right: 10px;
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
