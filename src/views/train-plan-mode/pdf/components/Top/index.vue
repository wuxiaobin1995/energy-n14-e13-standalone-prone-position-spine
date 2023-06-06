<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-06 11:06:08
 * @LastEditTime: 2023-06-06 11:32:40
 * @Description : 顶部信息
-->
<template>
  <div class="top">
    <el-image class="logo" :src="logoSrc" fit="scale-down"></el-image>

    <div class="title">{{ data.type }}-综合报告</div>

    <div class="divider"></div>

    <div class="info">
      <div class="item">{{ data.hospital }}</div>
      <div class="item">姓名：{{ data.userName }}</div>
      <div class="item">性别：{{ data.sex }}</div>
      <div class="item">训练日期：{{ data.pdfTime }}</div>
    </div>

    <div class="divider"></div>
  </div>
</template>

<script>
export default {
  name: 'top',

  props: {
    data: {
      type: Object,
      default: {}
    }
  },

  data() {
    return {
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png') // 公司商标
    }
  }
}
</script>

<style lang="scss" scoped>
.top {
  width: 100%;
  height: 20%;
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
</style>
