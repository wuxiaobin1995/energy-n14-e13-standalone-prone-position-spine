<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 11:55:02
 * @LastEditTime: 2021-12-15 15:10:32
 * @Description : 首页
-->
<template>
  <div class="home">
    <el-tabs tab-position="right">
      <el-tab-pane label="1、内核心是什么？">
        <div class="title">内核心是什么？</div>
        <div class="text">
          是位于腹腔、盆腔最深处的一组肌群，正常情况下，它们共同配合工作，将腹腔、盆腔围成一个坚实的桶状结构，但在妊娠分娩的过程中，内核心肌群也会面临一系列的结构改变，从而出现漏尿、腰疼、腹直肌分离等一系列问题。
        </div>
        <div class="img">
          <el-image class="img__one" :src="oneImgSrc" fit="fit"></el-image>
          <el-image class="img__two" :src="twoImgSrc" fit="fit"></el-image>
        </div>
      </el-tab-pane>

      <el-tab-pane label="2、为什么要训练内核心？">
        <div class="title">为什么要训练内核心？</div>
        <div class="text">
          产后出现的很多问题都与内核心肌群相关，如果不加以重视的话，很可能出现症状加重，从而影响生活质量。
        </div>
        <div class="img">
          <el-image class="img__three" :src="threeImgSrc" fit="fit"></el-image>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'home',

  data() {
    return {
      oneImgSrc: require('@/assets/img/home/1.png'),
      twoImgSrc: require('@/assets/img/home/2.png'),
      threeImgSrc: require('@/assets/img/home/3.png')
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', false)
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  padding: 40px 20px 20px 40px;

  .title {
    @include flex(row, center, center);
    font-size: 38px;
    color: #7a31b0;
  }

  .text {
    margin-top: 20px;
    font-size: 22px;
    text-indent: 2em;
    line-height: 1.5;
  }

  .img {
    margin-top: 40px;
    @include flex(row, space-between, center);
    .img__one {
      width: 40%;
    }
    .img__two {
      width: 56%;
    }
    .img__three {
      width: 100%;
    }
  }
}
</style>
