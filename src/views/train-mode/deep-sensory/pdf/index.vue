<!--
 * @Author      : Mr.bin
 * @Date        : 2023-02-24 16:36:11
 * @LastEditTime: 2023-02-24 16:53:12
 * @Description : 深感觉训练-导出PDF
-->
<template>
  <div
    class="train-deep-sensory-pdf"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <!-- 上部分 -->
      <div class="up">
        <div>
          <!-- 标题 -->
          <div class="title">深感觉训练报告</div>
          <!-- 基本信息 -->
          <div class="info">
            <div class="info__item">姓名：{{ pdfData.userName }}</div>
            <div class="info__item">性别：{{ pdfData.sex }}</div>
            <div class="info__item">训练日期：{{ pdfData.pdfTime }}</div>
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
            <div class="val">{{ pdfData.averageCore }}</div>
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
      <el-button class="btn__item" type="primary" @click="handlePdf"
        >保存PDF</el-button
      >
      <el-button class="btn__item" type="success" plain @click="handleGoBack"
        >返回</el-button
      >
    </div>
  </div>
</template>

<script>
/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'train-deep-sensory-pdf',

  data() {
    return {
      /* 路由传参 */
      userId: JSON.parse(this.$route.query.userId),
      pdfTime: JSON.parse(this.$route.query.pdfTime),
      routerName: JSON.parse(this.$route.query.routerName),

      fullscreenLoading: false,

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
        threeVal: '',
        averageVal: ''
      }
    }
  },

  created() {
    this.getTrainData()
  },

  methods: {
    /**
     * @description: 获取对应 [ID、训练时间] 的训练报告源数据，并做相关计算
     */
    getTrainData() {
      this.fullscreenLoading = true
      const db = initDB()
      db.train_data
        .where({
          userId: this.userId,
          pdfTime: this.pdfTime
        })
        .toArray()
        .then(res => {
          this.pdfData = res[0]
        })
        .then(() => {
          const res = Math.abs(this.pdfData.averageCore - this.pdfData.target)
          if (res <= 5) {
            this.adviceShow = '好'
          } else if (res > 5 && res <= 7.5) {
            this.adviceShow = '较差'
          } else if (res > 7.5) {
            this.adviceShow = '差'
          } else {
            this.adviceShow = ''
          }
        })
        .catch(err => {
          this.$confirm(
            `${err}。获取ID为 [${this.userId}] 的用户数据失败，请重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '重 试',
              cancelButtonText: '返 回'
            }
          )
            .then(() => {
              this.getTrainData()
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
    handlePdf() {
      this.$htmlToPdf(
        'pdf',
        `深感觉训练报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`,
        500
      )
    },

    /**
     * @description: 返回上一页
     */
    handleGoBack() {
      this.$router.push({
        path: this.routerName
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.train-deep-sensory-pdf {
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
        font-size: 40px;
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
