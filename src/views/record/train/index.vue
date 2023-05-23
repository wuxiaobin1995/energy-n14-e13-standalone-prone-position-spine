<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-14 14:37:48
 * @LastEditTime: 2023-05-23 15:55:52
 * @Description : 训练-数据记录
-->
<template>
  <div class="train-record">
    <div class="wrapper">
      <div class="btn">
        <el-button
          class="item"
          type="primary"
          round
          plain
          @click="handleAbdominalRespiration"
          >腹式呼吸训练</el-button
        >

        <el-button
          class="item"
          type="warning"
          round
          plain
          @click="handleActivityImprovement"
          >活动度训练</el-button
        >

        <el-button
          class="item"
          type="danger"
          round
          plain
          @click="handleStabilizerActivation"
          >内核心激活训练</el-button
        >

        <el-button
          class="item"
          type="success"
          round
          plain
          @click="handleDeepSensory"
          >本体感觉训练</el-button
        >

        <el-button class="item" type="info" round plain @click="handleStatic"
          >静态稳定训练</el-button
        >

        <el-button class="item" type="info" round plain @click="handleDynamic"
          >动态稳定训练</el-button
        >
      </div>

      <div class="divider"></div>

      <transition mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-record',

  methods: {
    /**
     * @description: 腹式呼吸训练
     */
    handleAbdominalRespiration() {
      this.$router.push({ path: '/train-record/abdominal-respiration' })
    },

    /**
     * @description: 活动度训练
     */
    handleActivityImprovement() {
      this.$router.push({ path: '/train-record/activity-improvement' })
    },

    /**
     * @description: 内核心激活训练
     */
    handleStabilizerActivation() {
      this.$router.push({ path: '/train-record/stabilizer-activation' })
    },

    /**
     * @description: 本体感觉训练
     */
    handleDeepSensory() {
      this.$router.push({ path: '/train-record/deep-sensory' })
    },

    /**
     * @description: 静态稳定训练
     */
    handleStatic() {
      this.$router.push({ path: '/train-record/static' })
    },

    /**
     * @description: 动态稳定训练
     */
    handleDynamic() {
      this.$router.push({ path: '/train-record/dynamic' })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 路由过渡动效 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s;
}
.v-enter,
.v-leave-to {
  opacity: 0;
}

.train-record {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 96%;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 20px;

    .btn {
      @include flex(row, space-around, center);
      .item {
        width: 200px;
        font-size: 22px;
      }
    }

    .divider {
      margin-top: 20px;
      border: 1px solid rgb(204, 204, 204);
      width: 100%;
    }
  }
}
</style>
