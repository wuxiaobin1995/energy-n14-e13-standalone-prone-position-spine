<!--
 * @Author      : Mr.bin
 * @Date        : 2021-12-07 14:22:15
 * @LastEditTime: 2022-03-05 18:41:22
 * @Description : 动态训练-PDF报告
-->
<template>
  <div class="dynamic-train-pdf" v-loading.fullscreen.lock="fullscreenLoading">
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <!-- 上部分 -->
      <div class="up">
        <div>
          <!-- 标题 -->
          <div class="title">动态训练报告</div>
          <!-- 基本信息 -->
          <div class="info">
            <div class="info__item">姓名：{{ pdfData.userName }}</div>
            <div class="info__item">性别：{{ pdfData.sex }}</div>
            <div class="info__item">训练日期：{{ pdfData.pdfTime }}</div>
          </div>
          <!-- 训练个数 -->
          <div class="keep-time">保持时间：{{ pdfData.keepTime }}秒</div>
          <!-- 完成度 -->
          <div class="completion">
            训练完成度：<span class="val">{{ pdfData.completion }}%</span>
          </div>
          <!-- 建议 -->
          <div class="advice">{{ advice }}</div>
        </div>

        <!-- 图片 -->
        <div class="imgs">
          <div class="logo-img">
            <el-image :src="logoSrc" fit="scale-down"></el-image>
          </div>
          <div class="action-img">
            <el-image :src="showSrc" fit="scale-down"></el-image>
          </div>
        </div>
      </div>

      <!-- 图形 -->
      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="btn__item" type="primary" @click="handlePrint"
        >保存PDF</el-button
      >
      <el-button class="btn__item" type="success" plain @click="handleGoBack"
        >返回</el-button
      >
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'dynamic-train-pdf',

  data() {
    return {
      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      /* 其他 */
      fullscreenLoading: false,
      dataId: this.$route.query.dataId, // 字符串类型
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标
      oneSrc: require('@/assets/img/train-mode/dynamic-train/1.png'),
      twoSrc: require('@/assets/img/train-mode/dynamic-train/2.png'),
      threeSrc: require('@/assets/img/train-mode/dynamic-train/3.png'),
      showSrc: '', // 展示的动作图片
      // 数据
      pdfData: {
        userName: '',
        sex: '',
        pdfTime: '', // 训练日期
        completion: null, // 完成度
        keepTime: null, // 保持时间
        target: null, // 训练目标
        type: '', // 训练类型
        depthArray: [] // 数据数组
      },

      advice: '' // 建议
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', true)
  },
  mounted() {
    this.getData()
  },
  beforeDestroy() {
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
     * @description: 从后端获取训练数据
     */
    getData() {
      this.fullscreenLoading = true
      this.$axios
        .post('/getOneTrainRecord', {
          train_record_id: this.dataId
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 成功 */
            this.pdfData.userName = data.result.user_name
            this.pdfData.sex = data.result.sex === 0 ? '女' : '男'
            this.pdfData.pdfTime = data.result.create_time
            this.pdfData.completion = data.result.completion
            this.pdfData.keepTime = data.result.keep_time
            this.pdfData.target = data.result.training_target
            this.pdfData.type = data.result.type
            this.pdfData.depthArray = JSON.parse(data.result.record_array)

            if (this.pdfData.type === 'dynamic-1') {
              this.showSrc = this.oneSrc
            } else if (this.pdfData.type === 'dynamic-2') {
              this.showSrc = this.twoSrc
            } else if (this.pdfData.type === 'dynamic-3') {
              this.showSrc = this.threeSrc
            }

            /* 根据不同的分，显示不同的建议 */
            if (this.pdfData.completion < 40) {
              this.advice = '内核心稳定性差，建议加强动态训练'
            } else if (
              this.pdfData.completion >= 40 &&
              this.pdfData.completion <= 59
            ) {
              this.advice = '内核心稳定性较差，建议加强动态训练'
            } else if (
              this.pdfData.completion >= 60 &&
              this.pdfData.completion <= 79
            ) {
              this.advice = '内核心稳定性良好，建议加强动态训练'
            } else if (this.pdfData.completion >= 80) {
              this.advice =
                '内核心稳定性优秀，建议每周保持2次的动态训练，保持内核心稳定能力'
            }

            this.initChart()
            // 监听父容器的宽高变化，目的是实现echarts图形自适应父容器的宽高变化
            window.addEventListener('resize', this.resizeCharts)
          } else if (data.status === 0) {
            /* 失败 */
            this.$confirm(
              `[状态码为 ${data.status}] 获取数据失败，请重试！`,
              '警告',
              {
                type: 'error',
                center: true,
                showClose: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                confirmButtonText: '重 试',
                cancelButtonText: '返 回'
              }
            )
              .then(() => {
                this.getData()
              })
              .catch(() => {
                this.handleGoBack()
              })
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
          this.$confirm(
            `[动态训练-PDF报告环节] ${err}。请确保网络连接正常，然后重试！`,
            '网络请求错误',
            {
              type: 'error',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷新页面',
              cancelButtonText: '返 回'
            }
          )
            .then(() => {
              this.getData()
            })
            .catch(() => {
              this.handleGoBack()
            })
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      /* x轴 */
      for (let i = 0; i < this.pdfData.depthArray.length; i++) {
        this.xData.push(parseFloat((i * 0.1).toFixed(1)))
      }

      /* 绘制参考曲线逻辑 */
      const up = this.pdfData.target + 5
      const down = this.pdfData.target - 5
      const upArray = []
      for (let i = 0; i < this.pdfData.depthArray.length; i++) {
        upArray.push(up)
      }
      const downArray = []
      for (let i = 0; i < this.pdfData.depthArray.length; i++) {
        downArray.push(down)
      }

      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          name: '秒',
          data: this.xData,
          boundaryGap: false // 从0点开始
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false // 隐藏背景网格线
          }
        },
        legend: {},
        // tooltip: {},
        series: [
          {
            name: '轨迹',
            data: this.pdfData.depthArray,
            color: 'red',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: '目标上限',
            data: upArray,
            color: 'green',
            type: 'line',
            smooth: false,
            showSymbol: false
          },
          {
            name: '目标下限',
            data: downArray,
            color: 'green',
            type: 'line',
            smooth: false,
            showSymbol: false
          }
        ],
        animation: false
      }
      this.myChart.setOption(this.option)
    },

    /**
     * @description: 保存PDF按钮
     */
    handlePrint() {
      this.$htmlToPdf(
        'pdf',
        `动态训练报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`
      )
    },

    /**
     * @description: 返回按钮
     */
    handleGoBack() {
      this.$router.push({
        path: this.$route.query.routerName
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
.dynamic-train-pdf {
  width: 100%;
  height: 100%;
  @include flex(column, stretch, stretch);

  /* PDF区域 */
  .pdf-wrapper {
    padding: 20px 40px;
    flex: 1;
    @include flex(column, stretch, stretch);

    /* 上部分 */
    .up {
      @include flex(row, space-between, stretch);
      /* 标题 */
      .title {
        font-size: 34px;
        color: green;
      }
      /* 基本信息 */
      .info {
        margin-top: 20px;
        @include flex(row, flex-start, center);
        font-size: 26px;
        .info__item {
          margin-right: 30px;
        }
      }
      /* 保持时间 */
      .keep-time {
        margin-top: 20px;
        font-size: 26px;
      }
      /* 完成度 */
      .completion {
        margin-top: 20px;
        font-size: 26px;
        .val {
          width: 200px;
          border: 1px solid rgb(206, 206, 206);
          background-color: rgb(206, 206, 206);
          border-radius: 6px;
          padding: 0 10px;
        }
      }
      /* 建议 */
      .advice {
        margin-top: 10px;
        font-size: 18px;
        color: red;
      }

      /* 图片 */
      .imgs {
        @include flex(column, stretch, stretch);
        .logo-img {
          width: 200px;
        }
        .action-img {
          width: 220px;
        }
      }
    }

    /* 图形 */
    .chart {
      flex: 1;
    }
  }

  /* 按钮组 */
  .btn {
    @include flex(row, center, center);
    margin: 20px 0;
    .btn__item {
      font-size: 28px;
      margin: 0 40px;
    }
  }
}
</style>
