<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-08 14:37:53
 * @LastEditTime: 2023-06-12 20:20:49
 * @Description : 活动度测试-动作展示
-->
<template>
  <div class="test-flexibility-show">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content=""
        @back="handleToHome"
      ></el-page-header>

      <div class="top">
        <div class="left">
          <div class="title">活动度测试</div>
          <div class="text">测试目的：检查腰椎的灵活性</div>
        </div>
        <el-button icon="el-icon-search" type="warning" @click="handleDes"
          >查看内核心介绍</el-button
        >
      </div>

      <div class="show">
        <el-image
          class="item"
          :src="showImg"
          fit="scale-down"
          @click.native="handleAmplify"
        ></el-image>
      </div>

      <div class="btn">
        <el-button class="item" type="primary" round @click="handleStart"
          >开 始 测 试</el-button
        >
      </div>

      <!-- 图示放大弹窗 -->
      <el-dialog
        title="图 示"
        :visible.sync="imgDialogVisible"
        width="30%"
        center
      >
        <div class="img-dialog">
          <el-image :src="showImg" fit="scale-down"></el-image>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

export default {
  name: 'test-flexibility-show',

  data() {
    return {
      showImg: require('@/assets/img/Test/Flexibility/活动度测试-动作展示.gif'),

      imgDialogVisible: false, // 图示弹窗

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/Test/活动度测试.mp3`)
    }
  },

  mounted() {
    if (this.audioOpen === true) {
      setTimeout(() => {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      }, 500)
    }
  },

  methods: {
    /**
     * @description: 回到首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
      })
    },

    /**
     * @description: 图示放大
     */
    handleAmplify() {
      this.imgDialogVisible = true
    },

    /**
     * @description: 开始测试
     */
    handleStart() {
      this.$router.push({
        path: '/test-flexibility-measure'
      })
    },

    /**
     * @description: 查看内核心介绍
     */
    handleDes() {
      this.$router.push({
        path: '/test-flexibility-what'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-flexibility-show {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 50px 100px;
    @include flex(column, stretch, stretch);
    position: relative;

    .page {
      position: absolute;
      top: 20px;
      left: 30px;
    }

    .top {
      @include flex(row, space-between, center);
      .left {
        @include flex(column, stretch, stretch);
        .title {
          font-size: 38px;
          margin-bottom: 10px;
        }
        .text {
          font-size: 22px;
        }
      }
    }

    .show {
      flex: 1;
      @include flex(row, center, center);
      .item {
        transform: scale(1.5);
        border: 1px solid black;
      }
    }

    .btn {
      @include flex(row, center, center);
      .item {
        font-size: 28px;
        width: 240px;
      }
    }

    .img-dialog {
      @include flex(row, center, center);
      transform: scale(2);
    }
  }
}
</style>
