<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-05 16:25:35
 * @LastEditTime: 2023-06-06 14:47:02
 * @Description : 方案报告-导出PDF
-->
<template>
  <div class="plan-pdf" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="wrapper" v-if="trainType.includes('腹式呼吸训练')">
      <top :data="top" />
      <abdominal-respiration :data="abdominalRespirationData" />
    </div>

    <div class="wrapper" v-if="trainType.includes('活动度训练')">
      <top :data="top" />
      <activity-improvement :data="activityImprovementData" />
    </div>

    <div class="wrapper" v-if="trainType.includes('内核心激活训练')">
      <top :data="top" />
      <stabilizer-activation :data="stabilizerActivationData" />
    </div>

    <div
      class="wrapper"
      :style="{ height: dynamicHeight }"
      v-if="trainType.includes('本体感觉训练')"
    >
      <top :data="top" />
      <deep-sensory :data="deepSensoryData" />
    </div>

    <div
      class="wrapper"
      :style="{ height: dynamicHeight }"
      v-if="trainType.includes('静态稳定训练')"
    >
      <top :data="top" />
      <static :data="staticData" />
    </div>

    <div
      class="wrapper"
      :style="{ height: dynamicHeight }"
      v-if="trainType.includes('动态稳定训练')"
    >
      <top :data="top" />
      <dynamic :data="dynamicData" />
    </div>

    <!-- 按钮组 -->
    <div class="btn-print btn">
      <el-button type="primary" class="item" @click="handlePrint"
        >打 印</el-button
      >
      <el-button type="danger" class="item" @click="handleGoBack"
        >返 回</el-button
      >
    </div>
  </div>
</template>

<script>
/* 数据库 */
import { initDB } from '@/db/index.js'

/* 子组件 */
import Top from '@/views/train-plan-mode/pdf/components/Top'
import AbdominalRespiration from '@/views/train-plan-mode/pdf/components/AbdominalRespiration'
import ActivityImprovement from '@/views/train-plan-mode/pdf/components/ActivityImprovement'
import StabilizerActivation from '@/views/train-plan-mode/pdf/components/StabilizerActivation'
import DeepSensory from '@/views/train-plan-mode/pdf/components/DeepSensory'
import Static from '@/views/train-plan-mode/pdf/components/Static'
import Dynamic from '@/views/train-plan-mode/pdf/components/Dynamic'

export default {
  name: 'plan-pdf',

  components: {
    Top, // 顶部信息
    AbdominalRespiration, // 腹式呼吸训练
    ActivityImprovement, // 活动度训练
    StabilizerActivation, // 内核心激活训练
    DeepSensory, // 本体感觉训练
    Static, // 静态稳定训练
    Dynamic // 动态稳定训练
  },

  data() {
    return {
      /* 路由传参 */
      userId: JSON.parse(this.$route.query.userId),
      pdfTime: JSON.parse(this.$route.query.pdfTime),
      routerName: JSON.parse(this.$route.query.routerName),

      fullscreenLoading: false, // 全屏加载

      /* 报告源数据 */
      planData: {
        type: '',
        hospital: '',
        userId: '',
        userName: '',
        sex: '',
        height: '',
        weight: '',
        birthday: '',
        planDataArray: [],
        pdfTime: ''
      },

      /* 处理后的数据 */
      trainType: [],

      top: {},
      abdominalRespirationData: {},
      activityImprovementData: {},
      stabilizerActivationData: {},
      deepSensoryData: {},
      staticData: {},
      dynamicData: {}
    }
  },

  computed: {
    /* 动态改变 height 的值 */
    dynamicHeight() {
      if (
        this.trainType.includes('腹式呼吸训练') ||
        this.trainType.includes('活动度训练') ||
        this.trainType.includes('内核心激活训练')
      ) {
        return '124vh'
      } else {
        return '100vh'
      }
    }
  },

  created() {
    this.getPlanData()
  },

  methods: {
    /**
     * @description: 获取对应 [ID、方案时间] 的方案报告源数据，并做相关计算
     */
    getPlanData() {
      this.fullscreenLoading = true
      const db = initDB()
      db.train_plan_data
        .where({
          userId: this.userId,
          pdfTime: this.pdfTime
        })
        .toArray()
        .then(res => {
          this.planData = res[0]
        })
        .then(() => {
          this.top.type = this.planData.type
          this.top.hospital = this.planData.hospital
          this.top.userId = this.planData.userId
          this.top.userName = this.planData.userName
          this.top.sex = this.planData.sex
          this.top.height = this.planData.height
          this.top.weight = this.planData.weight
          this.top.birthday = this.planData.birthday
          this.top.pdfTime = this.planData.pdfTime

          for (let i = 0; i < this.planData.planDataArray.length; i++) {
            const type = this.planData.planDataArray[i].type
            this.trainType.push(type)

            const obj = this.planData.planDataArray[i]
            if (type === '腹式呼吸训练') {
              this.abdominalRespirationData = obj
            } else if (type === '活动度训练') {
              this.activityImprovementData = obj
            } else if (type === '内核心激活训练') {
              this.stabilizerActivationData = obj
            } else if (type === '本体感觉训练') {
              this.deepSensoryData = obj
            } else if (type === '静态稳定训练') {
              this.staticData = obj
            } else if (type === '动态稳定训练') {
              this.dynamicData = obj
            }
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
              this.getPlanData()
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
     * @description: 打印报告
     */
    handlePrint() {
      window.print()
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
/* 打印时触发的CSS */
@media print {
  @page {
    // size: portrait; // 纵向打印
    size: landscape; // 横向打印
  }
  .btn-print {
    display: none !important;
  }
}

.plan-pdf {
  width: 100%;

  .wrapper {
    width: 100%;
    height: 124vh; // 若打印布局有问题，调整此值
    border-bottom: 1px solid black;
  }

  .btn {
    @include flex(row, center, center);
    .item {
      margin: 10px 50px;
      font-size: 30px;
    }
  }
}
</style>
