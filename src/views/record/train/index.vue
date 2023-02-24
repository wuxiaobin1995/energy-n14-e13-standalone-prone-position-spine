<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-14 14:37:48
 * @LastEditTime: 2023-02-24 15:17:05
 * @Description : 训练-数据记录
-->
<template>
  <div class="train-record">
    <div class="wrapper">
      <div class="btn">
        <el-button
          class="item"
          type="warning"
          round
          plain
          @click="handleActivityImprovement"
          >活动度改善训练</el-button
        >

        <el-button
          class="item"
          type="danger"
          round
          plain
          @click="handleStabilizerActivation"
          >局部稳定肌激活</el-button
        >

        <el-button
          class="item"
          type="success"
          round
          plain
          @click="handleDeepSensory"
          >深感觉训练</el-button
        >

        <el-button class="item" type="primary" round plain @click="handleStatic"
          >静态训练</el-button
        >

        <el-button class="item" type="info" round plain @click="handleDynamic"
          >动态训练</el-button
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
     * @description: 活动度改善训练
     */
    handleActivityImprovement() {
      this.$router.push({ path: '/train-record/activity-improvement' })
    },

    /**
     * @description: 局部稳定肌激活训练
     */
    handleStabilizerActivation() {
      this.$router.push({ path: '/train-record/stabilizer-activation' })
    },

    /**
     * @description: 深感觉训练
     */
    handleDeepSensory() {
      this.$router.push({ path: '/train-record/deep-sensory' })
    },

    /**
     * @description: 静态训练
     */
    handleStatic() {
      this.$router.push({ path: '/train-record/static' })
    },

    /**
     * @description: 动态训练
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
