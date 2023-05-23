<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-12 21:31:50
 * @LastEditTime: 2023-05-23 15:53:41
 * @Description : 动态稳定训练-导出PDF
-->
<template>
  <div class="train-dynamic-pdf" v-loading.fullscreen.lock="fullscreenLoading">
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <div class="top">
        <el-image class="logo" :src="logoSrc" fit="scale-down"></el-image>

        <div class="title">动态稳定训练-综合报告</div>

        <div class="divider"></div>

        <div class="info">
          <div class="item">{{ pdfData.hospital }}</div>
          <div class="item">姓名：{{ pdfData.userName }}</div>
          <div class="item">性别：{{ pdfData.sex }}</div>
          <div class="item">训练日期：{{ pdfData.pdfTime }}</div>
        </div>

        <div class="divider"></div>
      </div>

      <div class="main">
        <div class="left">
          <div class="item">
            <div class="text">训练目标：</div>
            <div class="val">{{ pdfData.target }}</div>
          </div>
          <div class="item">
            <div class="text">目标范围：</div>
            <div class="val">{{ pdfData.scope }}</div>
          </div>
          <div class="item">
            <div class="text">训练时长：</div>
            <div class="val">{{ pdfData.keepTime }}s</div>
          </div>
          <div class="item">
            <div class="text">组间休息时长：</div>
            <div class="val">{{ pdfData.groupRestTime }}s</div>
          </div>
          <div class="item">
            <div class="text">训练组数：</div>
            <div class="val">{{ pdfData.groups }}</div>
          </div>
          <div class="item">
            <div class="text">动作：</div>
            <div class="val">{{ pdfData.action }}</div>
          </div>
          <div class="item">
            <div class="text">训练评分：</div>
            <div class="val">{{ pdfData.completion }}</div>
          </div>
        </div>

        <div class="center">
          <table border="1" class="table">
            <tr :style="{ height: '40px' }" bgcolor="#E7E6E6" align="center">
              <th>训练组数</th>
              <th>训练完成度%</th>
            </tr>
            <tr
              :style="{ height: '30px' }"
              align="center"
              v-for="(item, index) in pdfData.completionResultArray"
              :key="index"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ item }}</td>
            </tr>
          </table>
        </div>

        <div class="right">
          <el-image :src="showSrc" fit="scale-down"></el-image>
        </div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="item" type="primary" @click="handlePdf"
        >保存PDF</el-button
      >
      <el-button class="item" type="warning" @click="handleGoBack"
        >返 回</el-button
      >
    </div>
  </div>
</template>

<script>
/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'train-dynamic-pdf',

  data() {
    return {
      /* 路由传参 */
      userId: JSON.parse(this.$route.query.userId),
      pdfTime: JSON.parse(this.$route.query.pdfTime),
      routerName: JSON.parse(this.$route.query.routerName),

      fullscreenLoading: false,
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标

      showSrc: require('@/assets/img/Train/Static/1.png'),
      oneSrc: require('@/assets/img/Train/Static/1.png'),
      twoSrc: require('@/assets/img/Train/Static/2.png'),
      threeSrc: require('@/assets/img/Train/Static/3.png'),

      pdfData: {
        hospital: '',
        userName: '',
        sex: '',

        target: '', // 训练目标
        scope: '', // 目标范围
        keepTime: '', // 训练时长
        groups: '', // 训练组数
        groupRestTime: '', // 组间休息时长
        action: '', // 动作

        completion: '', // 平均完成度
        completionResultArray: [], // 多组的完成度数组
        pdfTime: '',

        depthArray: [] // 数据数组
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
          /* 根据不同的类型展示不同图片 */
          if (this.pdfData.action === '1') {
            this.showSrc = this.oneSrc
          } else if (this.pdfData.action === '2') {
            this.showSrc = this.twoSrc
          } else if (this.pdfData.action === '3') {
            this.showSrc = this.threeSrc
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
     * @description: 保存PDF
     */
    handlePdf() {
      this.$htmlToPdf(
        'pdf',
        `动态稳定训练-综合报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`,
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
.train-dynamic-pdf {
  width: 100vw;
  height: 100vh;
  padding: 10px;
  @include flex(column, stretch, stretch);

  /* PDF区域 */
  .pdf-wrapper {
    flex: 1;
    @include flex(column, stretch, stretch);

    .top {
      position: relative;
      @include flex(column, stretch, center);
      .logo {
        position: absolute;
        top: 10px;
        right: 5px;
        width: 180px;
      }
      .title {
        font-size: 50px;
      }
      .divider {
        margin-top: 15px;
        border: 1px solid rgb(204, 204, 204);
        width: 100%;
      }
      .info {
        width: 100%;
        margin-top: 15px;
        @include flex(row, space-around, center);
        .item {
          font-size: 20px;
        }
      }
    }

    .main {
      flex: 1;
      @include flex(row, space-around, center);
      .left {
        @include flex(column, stretch, stretch);
        .item {
          @include flex(row, flex-start, center);
          margin-bottom: 25px;
          .text {
            font-size: 28px;
            font-weight: 700;
          }
          .val {
            font-size: 28px;
          }
        }
      }

      .center {
        .table {
          width: 350px;
          font-size: 22px;
        }
      }

      .right {
        width: 26%;
        @include flex(row, center, center);
      }
    }
  }

  /* 按钮组 */
  .btn {
    @include flex(row, center, center);
    margin: 20px 0;
    .item {
      font-size: 28px;
      margin: 0 50px;
    }
  }
}
</style>
