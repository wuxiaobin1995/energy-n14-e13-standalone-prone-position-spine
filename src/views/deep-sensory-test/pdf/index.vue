<!--
 * @Author      : Mr.bin
 * @Date        : 2022-05-23 11:48:39
 * @LastEditTime: 2022-06-27 14:49:53
 * @Description : 深感觉测试-PDF报告
-->
<template>
  <div
    class="deep-sensory-test-pdf"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <!-- 上部分 -->
      <div class="up">
        <div>
          <!-- 标题 -->
          <div class="title">深感觉测试报告</div>
          <!-- 基本信息 -->
          <div class="info">
            <div class="info__item">姓名：{{ pdfData.userName }}</div>
            <div class="info__item">性别：{{ pdfData.sex }}</div>
            <div class="info__item">测试日期：{{ pdfData.pdfTime }}</div>
          </div>
        </div>

        <!-- logo -->
        <div class="logo-img">
          <el-image :src="logoSrc" fit="scale-down"></el-image>
        </div>
      </div>

      <!-- 结果 -->
      <div class="main">
        <div class="main-wrapper">
          <div class="item">
            <div class="text">目标值</div>
            <div class="val">{{ pdfData.target }}</div>
          </div>
          <div class="item">
            <div class="text">测量值</div>
            <div class="val-mid">{{ pdfData.oneVal }}</div>
            <div class="val-mid">{{ pdfData.twoVal }}</div>
            <div class="val-mid">{{ pdfData.threeVal }}</div>
          </div>
          <div class="item">
            <div class="text">平均值</div>
            <div class="val">{{ averageVal }}</div>
          </div>
        </div>
      </div>

      <!-- 建议 -->
      <div class="advice">
        <div class="advice__wrapper">
          <div v-if="adviceShow === '好'" class="advice__content">
            <span class="advice__content--active">腰椎深感觉功能好：</span
            >位置觉好，建议加强内核心力量，增强脊柱稳定，静态稳定5～10次，动态稳定5～10次。
          </div>
          <div v-else-if="adviceShow === '较差'" class="advice__content">
            <span class="advice__content--active">腰椎深感觉功能较差：</span
            >位置觉较差，建议腹式呼吸训练5～10次，静态稳定训练5～10次。
          </div>
          <div v-else-if="adviceShow === '差'" class="advice__content">
            <span class="advice__content--active">腰椎深感觉功能差：</span
            >位置觉差，建议内核心激活训练5～10次，腹式呼吸训练5～10次。
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
  name: 'deep-sensory-test-pdf',

  data() {
    return {
      fullscreenLoading: false,
      dataId: this.$route.query.dataId, // 字符串类型
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标
      adviceShow: '',
      // 数据
      pdfData: {
        userName: '',
        sex: '',
        pdfTime: '',
        target: '',
        oneVal: '',
        twoVal: '',
        threeVal: ''
      },

      averageVal: ''
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
          // console.log(res)
          const data = res.data
          if (data.status === 1) {
            /* 成功 */
            this.pdfData.userName = data.result.user_name
            this.pdfData.sex = data.result.sex === 0 ? '女' : '男'
            this.pdfData.pdfTime = data.result.create_time
            this.pdfData.target = data.result.target
            this.pdfData.oneVal = data.result.oneVal
            this.pdfData.twoVal = data.result.twoVal
            this.pdfData.threeVal = data.result.threeVal

            this.averageVal = parseFloat(
              (
                (this.pdfData.oneVal +
                  this.pdfData.twoVal +
                  this.pdfData.threeVal) /
                3
              ).toFixed(1)
            )
            const res = Math.abs(this.averageVal - this.pdfData.target)
            if (res <= 5) {
              this.adviceShow = '好'
            } else if (res > 5 && res <= 7.5) {
              this.adviceShow = '较差'
            } else if (res > 7.5) {
              this.adviceShow = '差'
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
            `[深感觉测试-PDF报告环节] ${err}。请确保网络连接正常！`,
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
        `深感觉测试报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`,
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
.deep-sensory-test-pdf {
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
      /* logo */
      .logo-img {
        width: 300px;
      }
    }

    /* 结果 */
    .main {
      flex: 1;
      @include flex(column, center, center);
      .main-wrapper {
        border: 1px solid black;
        @include flex(row, stretch, stretch);
        .item {
          width: 20vw;
          .text {
            font-size: 30px;
            font-weight: 700;
            padding: 10px 0;
            @include flex(row, center, center);
            border: 1px solid black;
          }
          .val {
            font-size: 24px;
            height: 180px;
            @include flex(row, center, center);
            border: 1px solid black;
          }
          .val-mid {
            font-size: 24px;
            height: 60px;
            @include flex(row, center, center);
            border: 1px solid black;
          }
        }
      }
    }

    /* 建议 */
    .advice {
      @include flex(column, center, center);
      font-size: 22px;
      .advice__wrapper {
        width: 60vw;
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
