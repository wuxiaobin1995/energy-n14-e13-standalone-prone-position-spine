<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-01 14:43:57
 * @LastEditTime: 2023-06-05 22:10:31
 * @Description : 训练方案-主页
-->
<template>
  <div class="train-plan">
    <div class="wrapper">
      <div class="title">根据症状，选择相应的训练方案</div>

      <div class="main">
        <div class="row-one">
          <!-- 腹直肌分离 -->
          <el-image
            class="item"
            :src="srcSeparationOfRectusAbdominisMuscle"
            fit="scale-down"
            @click.native="handleClick('srcSeparationOfRectusAbdominisMuscle')"
          ></el-image>
          <!-- 产后腰痛 -->
          <el-image
            class="item"
            :src="srcPostpartumLowBackPain"
            fit="scale-down"
            @click.native="handleClick('srcPostpartumLowBackPain')"
          ></el-image>
          <!-- 盆骨前倾 -->
          <el-image
            class="item"
            :src="srcPelvicAnteriorTilt"
            fit="scale-down"
            @click.native="handleClick('srcPelvicAnteriorTilt')"
          ></el-image>
        </div>

        <div class="row-two">
          <!-- 耻骨联合痛 -->
          <el-image
            class="item"
            :src="srcPubicSymphysisPain"
            fit="scale-down"
            @click.native="handleClick('srcPubicSymphysisPain')"
          ></el-image>
          <!-- 骶髂关节痛 -->
          <el-image
            class="item"
            :src="srcSacroiliacJointPain"
            fit="scale-down"
            @click.native="handleClick('srcSacroiliacJointPain')"
          ></el-image>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-plan',

  data() {
    return {
      srcSeparationOfRectusAbdominisMuscle: require('@/assets/img/Train_Plan/Home_Page/腹直肌分离.png'), // 腹直肌分离
      srcPostpartumLowBackPain: require('@/assets/img/Train_Plan/Home_Page/产后腰痛.png'), // 产后腰痛
      srcPelvicAnteriorTilt: require('@/assets/img/Train_Plan/Home_Page/盆骨前倾.png'), // 盆骨前倾
      srcPubicSymphysisPain: require('@/assets/img/Train_Plan/Home_Page/耻骨联合痛.png'), // 耻骨联合痛
      srcSacroiliacJointPain: require('@/assets/img/Train_Plan/Home_Page/骶髂关节痛.png') // 骶髂关节痛
    }
  },

  created() {
    /* 初始化 Vuex */
    this.$store.dispatch('changePlanSelect', []) // 训练方案的选项
    /* 初始化 sessionStorage */
    window.sessionStorage.setItem('planDataArray', JSON.stringify([])) // 完成一次训练方案的数据
    window.sessionStorage.setItem('planType', '') // 所选的方案类型
  },

  methods: {
    /**
     * @description: 页面跳转
     * @param {String} src
     */
    handleClick(src) {
      // 腹直肌分离
      if (src === 'srcSeparationOfRectusAbdominisMuscle') {
        this.$router.push({
          path: '/train-plan-select',
          query: {
            type: JSON.stringify('腹直肌分离')
          }
        })
      }
      // 产后腰痛
      else if (src === 'srcPostpartumLowBackPain') {
        this.$router.push({
          path: '/train-plan-select',
          query: {
            type: JSON.stringify('产后腰痛')
          }
        })
      }
      // 盆骨前倾
      else if (src === 'srcPelvicAnteriorTilt') {
        this.$router.push({
          path: '/train-plan-select',
          query: {
            type: JSON.stringify('盆骨前倾')
          }
        })
      }
      // 耻骨联合痛
      else if (src === 'srcPubicSymphysisPain') {
        this.$router.push({
          path: '/train-plan-select',
          query: {
            type: JSON.stringify('耻骨联合痛')
          }
        })
      }
      // 骶髂关节痛
      else if (src === 'srcSacroiliacJointPain') {
        this.$router.push({
          path: '/train-plan-select',
          query: {
            type: JSON.stringify('骶髂关节痛')
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.train-plan {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    @include flex(column, stretch, stretch);
    padding: 30px 60px;

    .title {
      font-size: 35px;
      font-weight: 700;
      margin-left: 40px;
      margin-bottom: 45px;
    }

    .main {
      flex: 1;
      .row-one {
        @include flex(row, space-around, center);
        margin-bottom: 60px;
      }
      .row-two {
        @include flex(row, center, center);
        .item {
          margin: 0 70px;
        }
      }
    }
  }
}
</style>
