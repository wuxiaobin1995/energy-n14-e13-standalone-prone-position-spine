<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-05 17:31:17
 * @LastEditTime: 2023-06-06 16:01:51
 * @Description : 方案-本体感觉训练-参数设置
-->
<template>
  <div class="plan-deep-sensory-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <!-- 主区域 -->
      <div class="main">
        <!-- 文字说明和图示 -->
        <div class="des">
          <div class="content">
            <div class="title">本体感觉训练</div>
            <div class="item">训练目的：增强腰椎深感觉功能</div>
            <div class="item">
              起始位置：缓慢躺在软垫上，将双脚置于踏板上，让腰部中段（对准肚脐垂直线的位置）压在圆钮上
            </div>
            <div class="item">
              动作要求：选取任意一点（末端除外），控制滑块移动至绿色区域内，重复3～5次点击“开始”，除去视觉反馈，5秒内，凭借本体感觉控制光标移动至目标区域内
            </div>
          </div>

          <div class="img">
            <el-image :src="imgSrc" fit="scale-down"></el-image>
          </div>
          <div class="amplify-btn">
            <el-button class="item" type="success" @click="handleAmplify"
              >放 大</el-button
            >
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

        <!-- 配置项 -->
        <div class="set">
          <!-- 目标范围 -->
          <div class="item">
            <span class="text">目标范围</span>
            <el-select
              v-model="scope"
              placeholder="目标范围"
              @change="handleChangeScope"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <!-- 训练目标 -->
          <div class="item">
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
          <!-- 训练组数 -->
          <div class="item">
            <span class="text">训练组数</span>
            <el-input-number
              v-model="groups"
              :precision="0"
              :step="1"
              :min="2"
              :max="10"
            ></el-input-number>
          </div>
          <!-- 组间休息时长 -->
          <div class="item">
            <span class="text">组间休息时长</span>
            <el-input-number
              v-model="groupRestTime"
              :precision="0"
              :step="1"
              :min="30"
              :max="120"
            ></el-input-number>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button class="item" type="primary" @click="handleStart"
          >开始训练</el-button
        >
        <el-button class="item" type="info" @click="handleRefresh"
          >刷新页面</el-button
        >
      </div>

      <!-- 图示放大弹窗 -->
      <el-dialog
        title="图 示"
        :visible.sync="imgDialogVisible"
        width="30%"
        center
      >
        <div class="img-dialog">
          <el-image :src="imgSrc" fit="scale-down"></el-image>
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

export default {
  name: 'plan-deep-sensory-set',

  data() {
    return {
      imgSrc: require('@/assets/img/Train/Deep_Sensory/本体感觉训练.gif'),

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/Train/本体感觉训练.mp3`),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      imgDialogVisible: false, // 图示弹窗

      /* 其他 */
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
        : 50, // 训练目标（默认取上下限的中间值），0~100
      scope: 5, // 目标范围（5、10），指绿色区域的宽度
      options: [
        {
          value: 5
        },
        {
          value: 10
        }
      ],
      groups: 10, // 训练组数，2~10
      groupRestTime: 30, // 组间休息时长(s)，30~120

      core: 0 // 光标实时数值
    }
  },

  created() {
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
     * @description: 返回方案主页
     */
    handleToPlan() {
      this.$router.push({
        path: '/train-plan'
      })
    },

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
                  cancelButtonText: '返回方案主页'
                }
              )
                .then(() => {
                  this.handleRefresh()
                })
                .catch(() => {
                  this.handleToPlan()
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
                cancelButtonText: '返回方案主页'
              }
            )
              .then(() => {
                this.handleRefresh()
              })
              .catch(() => {
                this.handleToPlan()
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
              cancelButtonText: '返回方案主页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleToPlan()
            })
        })
    },

    /**
     * @description: 目标范围下拉框改变时触发
     */
    handleChangeScope() {
      this.updateBg()
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
     * @description: 开始训练按钮
     */
    handleStart() {
      this.$router.push({
        path: '/plan-deep-sensory-measure',
        query: {
          scope: JSON.stringify(this.scope), // 目标范围
          target: JSON.stringify(this.target), // 训练目标
          groups: JSON.stringify(this.groups), // 训练组数
          groupRestTime: JSON.stringify(this.groupRestTime) // 组间休息时长
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
          routerName: JSON.stringify('/plan-deep-sensory-set'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-deep-sensory-set {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 94%;
    height: 96%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 50px;
    @include flex(column, stretch, stretch);

    /* 主区域 */
    .main {
      flex: 1;
      margin: 5px 0 15px 60px;
      @include flex(row, space-between, stretch);
      /* 文字说明和图示 */
      .des {
        width: 30%;
        .content {
          font-size: 20px;
          .title {
            font-size: 22px;
            font-weight: 700;
            color: #8a38f5;
            margin-bottom: 5px;
          }
          .item {
            margin-bottom: 20px;
          }
        }
        .img {
          @include flex(row, center, center);
        }
        .amplify-btn {
          @include flex(row, center, center);
          margin-top: 10px;
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

      /* 参数设置 */
      .set {
        width: 30%;
        @include flex(column, center, flex-start);
        .item {
          margin-bottom: 30px;
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
      .item {
        font-size: 26px;
        margin: 0 40px;
      }
    }

    .img-dialog {
      @include flex(row, center, center);
      transform: scale(2);
    }
  }
}
</style>
