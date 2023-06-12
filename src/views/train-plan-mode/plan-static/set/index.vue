<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-05 20:24:34
 * @LastEditTime: 2023-06-05 20:44:37
 * @Description : 方案-静态稳定训练-参数设置
-->
<template>
  <div class="plan-static-set">
    <div class="wrapper">
      <!-- 文字说明 -->
      <div class="des">
        <div class="title">静态稳定训练</div>
        <div class="item">训练目的：增强腰椎稳定性</div>
        <div class="item">
          动作要求：控制光标移动到绿色区域内，持续收紧腰腹部使光标不晃动，过程中肩部和臀部紧贴软垫，直至训练结束
        </div>
      </div>

      <!-- 主区域 -->
      <div class="main">
        <!-- 参数设置 -->
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
          <!-- 训练时长 -->
          <div class="item">
            <span class="text">训练时长</span>
            <el-input-number
              v-model="keepTime"
              :precision="0"
              :step="1"
              :min="10"
              :max="600"
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

        <!-- 动作选择 -->
        <div class="action">
          <div class="item">
            <el-radio v-model="action" label="1" border>动作一</el-radio>
            <el-image
              :src="oneSrc"
              fit="scale-down"
              @click.native="handleAmplifyOne"
            ></el-image>
          </div>
          <div class="item">
            <el-radio v-model="action" label="2" border>动作二</el-radio>
            <el-image
              :src="twoSrc"
              fit="scale-down"
              @click.native="handleAmplifyTwo"
            ></el-image>
          </div>
          <div class="item">
            <el-radio v-model="action" label="3" border>动作三</el-radio>
            <el-image
              :src="threeSrc"
              fit="scale-down"
              @click.native="handleAmplifyThree"
            ></el-image>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button class="item" type="primary" @click="handleStart"
          >开始训练</el-button
        >
        <el-button class="item" type="info" plain @click="handleRefresh"
          >刷新页面</el-button
        >
      </div>

      <!-- 图示1放大弹窗 -->
      <el-dialog
        title="图 示"
        :visible.sync="imgDialogVisibleOne"
        width="30%"
        center
      >
        <div class="img-dialog">
          <el-image :src="oneSrc" fit="scale-down"></el-image>
        </div>
      </el-dialog>
      <!-- 图示2放大弹窗 -->
      <el-dialog
        title="图 示"
        :visible.sync="imgDialogVisibleTwo"
        width="30%"
        center
      >
        <div class="img-dialog">
          <el-image :src="twoSrc" fit="scale-down"></el-image>
        </div>
      </el-dialog>
      <!-- 图示3放大弹窗 -->
      <el-dialog
        title="图 示"
        :visible.sync="imgDialogVisibleThree"
        width="30%"
        center
      >
        <div class="img-dialog">
          <el-image :src="threeSrc" fit="scale-down"></el-image>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

export default {
  name: 'plan-static-set',

  data() {
    return {
      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      oneSrc: require('@/assets/img/Train/Static/1.png'),
      twoSrc: require('@/assets/img/Train/Static/2.png'),
      threeSrc: require('@/assets/img/Train/Static/3.png'),

      imgDialogVisibleOne: false, // 图示1弹窗
      imgDialogVisibleTwo: false, // 图示2弹窗
      imgDialogVisibleThree: false, // 图示3弹窗

      /* 其他 */
      action: '1', // 动作选择
      keepTime: 30, // 训练时长，10~600
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
      groups: 3, // 训练组数，2~10
      groupRestTime: 30, // 组间休息时长(s)，30~120

      core: 0 // 光标实时数值
    }
  },

  created() {
    this.updateBg()
    this.initSerialPort()
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
     * @description: 图示1放大
     */
    handleAmplifyOne() {
      this.imgDialogVisibleOne = true
      this.imgDialogVisibleTwo = false
      this.imgDialogVisibleThree = false
    },
    /**
     * @description: 图示2放大
     */
    handleAmplifyTwo() {
      this.imgDialogVisibleTwo = true
      this.imgDialogVisibleOne = false
      this.imgDialogVisibleThree = false
    },
    /**
     * @description: 图示3放大
     */
    handleAmplifyThree() {
      this.imgDialogVisibleThree = true
      this.imgDialogVisibleOne = false
      this.imgDialogVisibleTwo = false
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
        path: '/plan-static-measure',
        query: {
          scope: JSON.stringify(this.scope), // 目标范围
          target: JSON.stringify(this.target), // 训练目标
          keepTime: JSON.stringify(this.keepTime), // 训练时长
          groups: JSON.stringify(this.groups), // 训练组数
          groupRestTime: JSON.stringify(this.groupRestTime), // 组间休息时长
          action: JSON.stringify(this.action) // 动作
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
          routerName: JSON.stringify('/plan-static-set'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-static-set {
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

    /* 文字说明 */
    .des {
      .title {
        font-size: 22px;
        font-weight: 700;
        color: #8a38f5;
        margin-bottom: 5px;
      }
      .item {
        font-size: 18px;
        margin-bottom: 5px;
      }
    }

    /* 主区域 */
    .main {
      margin: 0 0 0 60px;
      flex: 1;
      @include flex(row, space-between, stretch);
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

      /* 动作选择 */
      .action {
        width: 30%;
        padding-right: 100px;
        @include flex(column, center, center);
        .item {
          width: 36vh;
          @include flex(row, center, center);
          margin: 20px 0;
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
