<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-01 14:44:04
 * @LastEditTime: 2023-06-05 16:03:11
 * @Description : 训练方案-项目选择
-->
<template>
  <div class="train-plan-select" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="wrapper">
      <div class="top">
        <el-page-header title="返回上一页" @back="handleBack"></el-page-header>
        <div class="title">{{ type }}-训练方案</div>
      </div>

      <div class="main">
        <!-- 介绍说明 -->
        <div class="introduce">请在已解锁的训练模式中选择训练项目</div>

        <!-- 训练项目选择 -->
        <div class="select">
          <el-checkbox-group v-model="planSelect">
            <el-checkbox
              label="腹式呼吸训练"
              border
              :disabled="!isAbdominalRespiration"
            ></el-checkbox>
            <el-checkbox
              label="活动度训练"
              border
              :disabled="!isActivityImprovement"
            ></el-checkbox>
            <el-checkbox
              label="内核心激活训练"
              border
              :disabled="!isStabilizerActivation"
            ></el-checkbox>
            <el-checkbox
              label="本体感觉训练"
              border
              :disabled="!isDeepSensory"
            ></el-checkbox>
            <el-checkbox
              label="静态稳定训练"
              border
              :disabled="!isStatic"
            ></el-checkbox>
            <el-checkbox
              label="动态稳定训练"
              border
              :disabled="!isDynamic"
            ></el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 提示 -->
        <div class="tip">PS：某些项目需达到60分，才能解锁后续训练内容</div>

        <!-- 训练内容 -->
        <div class="content">
          <el-steps class="steps" :active="planSelect.length" align-center>
            <el-step
              v-for="(item, index) of planSelect"
              :key="index"
              :title="item"
            ></el-step>
          </el-steps>
        </div>

        <!-- 按钮 -->
        <div class="btn">
          <el-button class="item" type="success" @click="handleStart"
            >确 定</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'train-plan-select',

  data() {
    return {
      /* 路由传参 */
      type: JSON.parse(this.$route.query.type), // 训练方案类型

      /* 是否可选择 */
      isAbdominalRespiration: false, // 腹式呼吸训练
      isActivityImprovement: false, // 活动度训练
      isStabilizerActivation: false, // 内核心激活训练
      isDeepSensory: false, // 本体感觉训练
      isStatic: false, // 静态稳定训练
      isDynamic: false, // 动态稳定训练

      /* 训练项目选择数组 */
      planSelect: [],

      /* 其他 */
      fullscreenLoading: false
    }
  },

  created() {
    window.sessionStorage.setItem('planType', this.type) // 所选的方案类型

    this.onJudgingSelectability()
  },

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: '/train-plan'
      })
    },

    /**
     * @description: 获取评分并判断是否可选函数
     */
    onJudgingSelectability() {
      const userId = this.$store.state.currentUserInfo.userId

      this.fullscreenLoading = true
      const db = initDB()
      db.train_data
        .where({
          userId: userId
        })
        .toArray()
        .then(res => {
          // console.log(res)
          /* 根据评分来判断是否可选（前一个的评分决定后一个的可选性） */
          const scoringCriteria = 60 // 评分标准
          for (let i = 0; i < res.length; i++) {
            const item = res[i]

            if (item.type === '腹式呼吸训练') {
              if (item.completion >= scoringCriteria) {
                this.isActivityImprovement = true
              }
            } else if (item.type === '活动度训练') {
              if (item.completion >= scoringCriteria) {
                this.isStabilizerActivation = true
              }
            } else if (item.type === '内核心激活训练') {
              if (item.completion >= scoringCriteria) {
                this.isDeepSensory = true
              }
            } else if (item.type === '本体感觉训练') {
              if (item.completion >= scoringCriteria) {
                this.isStatic = true
              }
            } else if (item.type === '静态稳定训练') {
              if (item.completion >= scoringCriteria) {
                this.isDynamic = true
              }
            }
          }
        })
        .catch(err => {
          this.$confirm(
            `${err}。获取用户ID为 [${userId}] 的评分数据失败，请重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '重 试',
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.onJudgingSelectability()
            })
            .catch(() => {
              this.handleBack()
            })
        })
        .finally(() => {
          /* 最后根据方案来确定必定可选的项 */
          if (this.type === '腹直肌分离') {
            this.isAbdominalRespiration = true
            this.isActivityImprovement = true
          } else if (this.type === '产后腰痛') {
            this.isAbdominalRespiration = true
            this.isActivityImprovement = true
            this.isStabilizerActivation = true
            this.isDeepSensory = true
            this.isStatic = true
          } else if (this.type === '盆骨前倾') {
            this.isAbdominalRespiration = true
            this.isActivityImprovement = true
            this.isStabilizerActivation = true
            this.isDeepSensory = true
            this.isStatic = true
          } else if (this.type === '耻骨联合痛') {
            this.isAbdominalRespiration = true
            this.isActivityImprovement = true
            this.isStabilizerActivation = true
          } else if (this.type === '骶髂关节痛') {
            this.isAbdominalRespiration = true
            this.isActivityImprovement = true
            this.isStabilizerActivation = true
          }

          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 开始
     */
    handleStart() {
      if (this.planSelect.length) {
        /* 中文名转成对应的路由地址 */
        const planSelectRouter = []
        for (let i = 0; i < this.planSelect.length; i++) {
          const chineseNameItem = this.planSelect[i]
          if (chineseNameItem === '腹式呼吸训练') {
            planSelectRouter.push('plan-abdominal-respiration')
          } else if (chineseNameItem === '活动度训练') {
            planSelectRouter.push('plan-activity-improvement')
          } else if (chineseNameItem === '内核心激活训练') {
            planSelectRouter.push('plan-stabilizer-activation')
          } else if (chineseNameItem === '本体感觉训练') {
            planSelectRouter.push('plan-deep-sensory')
          } else if (chineseNameItem === '静态稳定训练') {
            planSelectRouter.push('plan-static')
          } else if (chineseNameItem === '动态稳定训练') {
            planSelectRouter.push('plan-dynamic')
          }
        }
        /* 设置Vuex，然后跳转至第一个项目的参数配置页 */
        this.$store.dispatch('changePlanSelect', planSelectRouter).then(() => {
          this.$router.push({
            path: `/${planSelectRouter[0]}-set`
          })
        })
      } else {
        this.$message({
          message: '提示，选项不能为空！',
          type: 'warning',
          duration: 3000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.train-plan-select {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 94%;
    height: 96%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 20px 40px;
    @include flex(column, stretch, stretch);

    .top {
      margin-bottom: 10px;
      @include flex(row, stretch, center);
      .title {
        font-size: 22px;
        font-weight: 700;
        color: #8a38f5;
      }
    }

    .main {
      flex: 1;
      @include flex(column, stretch, stretch);
      .introduce {
        @include flex(row, center, center);
        font-size: 34px;
        font-weight: 700;
        margin-bottom: 30px;
      }

      .select {
        @include flex(row, center, center);
        margin-bottom: 20px;
      }

      .tip {
        @include flex(row, flex-end, center);
        margin-bottom: 20px;
      }

      .content {
        flex: 1;
        @include flex(row, center, center);
        border: 2px dashed #979595;
        border-radius: 30px;
        margin-bottom: 15px;
        .steps {
          width: 100%;
          /deep/ .el-step__head.is-finish {
            color: #8a38f5;
            border-color: #8a38f5;
          }
          /deep/ .el-step__title.is-finish {
            color: #8a38f5;
          }
        }
      }

      .btn {
        @include flex(row, center, center);
        .item {
          width: 200px;
          font-size: 26px;
        }
      }
    }
  }
}
</style>
