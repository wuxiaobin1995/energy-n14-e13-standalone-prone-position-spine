<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-14 14:37:48
 * @LastEditTime: 2023-06-05 21:30:51
 * @Description : 训练方案-数据记录
-->
<template>
  <div class="train-plan-record">
    <div class="wrapper">
      <div class="btn">
        <el-button
          class="item"
          type="primary"
          round
          plain
          @click="handleSeparationOfRectusAbdominisMuscle"
          >腹直肌分离</el-button
        >

        <el-button
          class="item"
          type="warning"
          round
          plain
          @click="handlePostpartumLowBackPain"
          >产后腰痛</el-button
        >

        <el-button
          class="item"
          type="danger"
          round
          plain
          @click="handlePelvicAnteriorTilt"
          >盆骨前倾</el-button
        >

        <el-button
          class="item"
          type="success"
          round
          plain
          @click="handlePubicSymphysisPain"
          >耻骨联合痛</el-button
        >

        <el-button
          class="item"
          type="info"
          round
          plain
          @click="handleSacroiliacJointPain"
          >骶髂关节痛</el-button
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
  name: 'train-plan-record',

  methods: {
    /**
     * @description: 腹直肌分离
     */
    handleSeparationOfRectusAbdominisMuscle() {
      this.$router.push({
        path: '/train-plan-record/separationofrectus-abdominismuscle'
      })
    },

    /**
     * @description: 产后腰痛
     */
    handlePostpartumLowBackPain() {
      this.$router.push({ path: '/train-plan-record/postpartum-lowbackpain' })
    },

    /**
     * @description: 盆骨前倾
     */
    handlePelvicAnteriorTilt() {
      this.$router.push({ path: '/train-plan-record/pelvic-anteriortilt' })
    },

    /**
     * @description: 耻骨联合痛
     */
    handlePubicSymphysisPain() {
      this.$router.push({ path: '/train-plan-record/pubic-symphysispain' })
    },

    /**
     * @description: 骶髂关节痛
     */
    handleSacroiliacJointPain() {
      this.$router.push({ path: '/train-plan-record/sacroiliac-jointpain' })
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

.train-plan-record {
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
