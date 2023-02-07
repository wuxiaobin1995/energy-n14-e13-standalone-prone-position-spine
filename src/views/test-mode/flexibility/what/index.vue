<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-08 14:38:48
 * @LastEditTime: 2022-12-08 16:07:53
 * @Description : 骨盆灵活度测试-内核心是什么
-->
<template>
  <div class="test-flexibility-what">
    <div class="wrapper">
      <div class="title">内核心是什么？</div>

      <div class="text">
        内核心肌群是由腹横肌、多裂肌、膈肌、盆底肌组成的一组肌群，就像一个腹部气囊，维持脊柱稳定、运动平衡。
        妊娠分娩的过程中，内核心肌群收到损伤改变，从而出现漏尿、腰疼、腹直肌分离等一系列问题。
      </div>

      <div class="img">
        <el-image :src="oneImg" fit="scale-down"></el-image>
        <el-image :src="twoImg" fit="scale-down"></el-image>
      </div>

      <el-button
        class="btn-spec"
        icon="el-icon-right"
        type="success"
        round
        @click="handleNext"
      ></el-button>

      <div class="btn">
        <el-button class="item" type="warning" round @click="handleCancel"
          >返 回</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'test-flexibility-what',

  data() {
    return {
      oneImg: require('@/assets/img/Test/Flexibility/内核心1.png'),
      twoImg: require('@/assets/img/Test/Flexibility/内核心2.png')
    }
  },

  methods: {
    /**
     * @description: 返回
     */
    handleCancel() {
      this.$router.push({
        path: '/test-flexibility-show'
      })
    },

    /**
     * @description: 下一页
     */
    handleNext() {
      this.$router.push({
        path: '/test-flexibility-why'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-flexibility-what {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 30px 100px;
    @include flex(column, stretch, stretch);
    position: relative;

    .title {
      @include flex(row, center, center);
      font-size: 36px;
      margin-bottom: 20px;
      font-weight: 700;
    }

    .text {
      font-size: 20px;
      line-height: 1.5em;
    }

    .img {
      @include flex(row, space-around, center);
      flex: 1;
    }

    .btn-spec {
      position: absolute;
      top: 50%;
      right: 30px;
      font-size: 22px;
      height: 60px;
    }

    .btn {
      @include flex(row, center, center);
      .item {
        font-size: 22px;
        width: 130px;
      }
    }
  }
}
</style>
