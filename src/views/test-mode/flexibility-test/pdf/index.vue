<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-19 15:14:13
 * @LastEditTime: 2022-05-23 17:24:46
 * @Description : 灵活性测试-PDF报告
-->
<template>
  <div
    class="flexibility-test-pdf"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <!-- 上部分 -->
      <div class="up">
        <div>
          <!-- 标题 -->
          <div class="title">灵活性测试报告</div>
          <!-- 基本信息 -->
          <div class="info">
            <div class="info__item">姓名：{{ pdfData.userName }}</div>
            <div class="info__item">性别：{{ pdfData.sex }}</div>
            <div class="info__item">测试日期：{{ pdfData.pdfTime }}</div>
          </div>
          <!-- 灵活度 -->
          <div class="flexibility">灵活度：{{ pdfData.flexibility }}</div>
        </div>

        <!-- logo -->
        <div class="logo-img">
          <el-image :src="logoSrc" fit="scale-down"></el-image>
        </div>
      </div>

      <!-- 图形展示 -->
      <div class="chart">
        <div class="chart__text">
          <div class="too-small">很小</div>
          <div class="small">小</div>
          <div class="middle">适中</div>
          <div class="big">大</div>
          <div class="too-big">很大</div>
        </div>
        <div class="chart__value">
          <div>当前值：{{ pdfData.flexibility }}</div>
        </div>
        <div class="chart__bg" :style="bgColorObj"></div>
        <el-slider
          class="chart__core"
          v-model="pdfData.flexibility"
          :disabled="true"
          :show-tooltip="false"
        ></el-slider>
        <div class="chart__recommend">
          <div>推荐值：<span class="chart__recommend--item">30~40</span></div>
        </div>
      </div>

      <!-- 建议 -->
      <div class="advice">
        <div class="advice__wrapper">
          <div v-if="adviceShow === '很小'" class="advice__content">
            <span class="advice__content--active">腰椎活动度很小：</span
            >可能会出现活动受限或腰背酸痛等症状，需要首先进行内核心激活和活动度改善，增加腰椎灵活度的同时，掌握肌肉发力，建议内核心激活训练5～10次，活动度训练5～10次。
          </div>
          <div v-else-if="adviceShow === '小'" class="advice__content">
            <span class="advice__content--active">腰椎活动度小：</span
            >可能会出现活动受限或腰背酸痛等症状，需要改善活动度，掌握核心肌群发力，建议活动度训练5～10次，腹式呼吸训练5～10次。
          </div>
          <div v-else-if="adviceShow === '适中'" class="advice__content">
            <span class="advice__content--active">腰椎活动适中：</span
            >建议加强内核心力量，增强脊柱稳定，静态稳定5～10次，动态稳定5～10次。
          </div>
          <div v-else-if="adviceShow === '大'" class="advice__content">
            <span class="advice__content--active">腰椎活动度大：</span
            >可能会导致慢性腰痛、腰椎间盘突出、骶髂关节疼痛等问题，需要加强腰椎的稳定，建议内核心激活训练5～10次，腹式呼吸训练5～10次，静态稳定5～10次。
          </div>
          <div v-else-if="adviceShow === '很大'" class="advice__content">
            <span class="advice__content--active">腰椎活动度很大：</span
            >与腰椎不稳、遗传等因素有关，可能会导致慢性腰痛、腰椎间盘突出、骶髂关节疼痛等问题，需要加强腰椎和骨盆的稳定，腹式呼吸训练5～10次，静态稳定5～10次，动态稳定5～10次。
          </div>
        </div>
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
  name: 'flexibility-test-pdf',

  data() {
    return {
      fullscreenLoading: false,
      dataId: this.$route.query.dataId, // 字符串类型
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标
      adviceShow: '', // 建议文字
      // 数据
      pdfData: {
        userName: '',
        sex: '',
        pdfTime: '',
        flexibility: 0
      },
      // 背景图颜色渐变
      bgColorObj: {
        'background-image': `linear-gradient(
          to right,
          rgba(255, 0, 0, 1) ${0}%,
          rgba(255, 0, 0, 1) ${20}%,
          rgba(255, 192, 0, 1) ${20}%,
          rgba(255, 192, 0, 1) ${30}%,
          rgba(112, 173, 71, 1) ${30}%,
          rgba(112, 173, 71, 1) ${40}%,
          rgba(255, 192, 0, 1) ${40}%,
          rgba(255, 192, 0, 1) ${50}%,
          rgba(255, 0, 0, 1) ${50}%,
          rgba(255, 0, 0, 1) ${100}%
        )`
      }
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', true)
    this.getData()
  },

  methods: {
    /**
     * @description: 从后端获取测试数据
     */
    getData() {
      this.fullscreenLoading = true
      this.$axios
        .post('/getOneTestRecord', {
          test_record_id: this.dataId
        })
        .then(res => {
          const data = res.data
          if (data.status === 1) {
            /* 成功 */
            this.pdfData.userName = data.result.user_name
            this.pdfData.sex = data.result.sex === 0 ? '女' : '男'
            this.pdfData.pdfTime = data.result.create_time
            this.pdfData.flexibility = parseInt(data.result.flexibility)

            if (
              parseInt(data.result.flexibility) >= 0 &&
              parseInt(data.result.flexibility) < 20
            ) {
              this.adviceShow = '很小'
            } else if (
              parseInt(data.result.flexibility) >= 20 &&
              parseInt(data.result.flexibility) < 30
            ) {
              this.adviceShow = '小'
            } else if (
              parseInt(data.result.flexibility) >= 30 &&
              parseInt(data.result.flexibility) < 40
            ) {
              this.adviceShow = '适中'
            } else if (
              parseInt(data.result.flexibility) >= 40 &&
              parseInt(data.result.flexibility) < 50
            ) {
              this.adviceShow = '大'
            } else if (
              parseInt(data.result.flexibility) >= 50 &&
              parseInt(data.result.flexibility) <= 100
            ) {
              this.adviceShow = '很大'
            } else {
              this.adviceShow = ''
            }
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
            `[灵活性测试-PDF报告环节] ${err}。请确保网络连接正常！`,
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
     * @description: 保存PDF按钮
     */
    handlePrint() {
      this.$htmlToPdf(
        'pdf',
        `灵活性测试报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`,
        530
      )
    },

    /**
     * @description: 返回按钮
     */
    handleGoBack() {
      this.$router.push({
        path: this.$route.query.routerName
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.flexibility-test-pdf {
  width: 100%;
  height: 100%;
  @include flex(column, stretch, stretch);

  /* PDF区域 */
  .pdf-wrapper {
    padding: 40px;
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
      /* 灵活度 */
      .flexibility {
        margin-top: 20px;
        font-size: 26px;
      }

      /* logo */
      .logo-img {
        width: 300px;
      }
    }

    /* 图形展示 */
    .chart {
      flex: 1;
      @include flex(column, center, center);
      .chart__text {
        width: 80vw;
        @include flex(row, stretch, center);
        margin-bottom: 20px;
        font-size: 30px;
        .too-small {
          flex-basis: 20%;
          @include flex(row, center, center);
        }
        .small {
          flex-basis: 10%;
          @include flex(row, center, center);
        }
        .middle {
          flex-basis: 10%;
          @include flex(row, center, center);
        }
        .big {
          flex-basis: 10%;
          @include flex(row, center, center);
        }
        .too-big {
          flex-basis: 50%;
          @include flex(row, center, center);
        }
      }
      .chart__value {
        width: 80vw;
        @include flex(row, center, center);
        margin-bottom: 20px;
        font-size: 22px;
      }
      .chart__bg {
        width: 80vw;
        height: 60px;
      }
      .chart__core {
        width: 80vw;
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
          border-width: 0 10px 30px;
          border-style: solid;
          border-color: transparent transparent black;
          border-radius: 0;
          background-color: #ffffff;
        }
      }
      .chart__recommend {
        width: 80vw;
        @include flex(row, center, center);
        margin-top: 20px;
        font-size: 22px;
        .chart__recommend--item {
          color: red;
        }
      }
    }

    /* 建议 */
    .advice {
      @include flex(column, center, center);
      font-size: 22px;
      .advice__wrapper {
        width: 70vw;
        .advice__content {
          .advice__content--active {
            color: red;
          }
        }
      }
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
