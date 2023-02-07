<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-08 14:39:11
 * @LastEditTime: 2022-12-08 16:12:10
 * @Description : 骨盆灵活度测试-内核心训练的好处
-->
<template>
  <div class="test-flexibility-why">
    <div class="wrapper">
      <div class="title">内核心训练的好处</div>

      <div class="text">产后出现以下问题需进行专业评估和相应的内核心训练</div>

      <div class="img">
        <el-image class="item" :src="imgSrc" fit="scale-down"></el-image>
      </div>

      <el-button
        class="btn-spec"
        icon="el-icon-back"
        type="success"
        round
        @click="handleBack"
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
  name: 'test-flexibility-why',

  data() {
    return {
      imgSrc: require('@/assets/img/Test/Flexibility/内核心训练的好处.png')
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
     * @description: 上一页
     */
    handleBack() {
      this.$router.push({
        path: '/test-flexibility-what'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-flexibility-why {
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
      @include flex(row, center, center);
    }

    .img {
      @include flex(row, center, center);
      flex: 1;
      .item {
        width: 80%;
      }
    }

    .btn-spec {
      position: absolute;
      top: 50%;
      left: 30px;
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
