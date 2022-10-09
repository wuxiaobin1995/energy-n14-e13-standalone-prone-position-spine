<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-17 15:29:15
 * @LastEditTime: 2022-03-04 17:57:15
 * @Description : 灵活性测试-描述页面
-->
<template>
  <div class="flexibility-test-des">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="title">灵活性测试</div>

    <div class="text">
      <div class="text__item">测试目的：检查腰椎是否可以灵活运动；</div>
      <div class="text__item">
        起始位置：请将双脚置于踏板上，随后缓缓躺在软垫上，将圆钮压在腰部中段，对准肚脐的垂直线；
      </div>
      <div class="text__item">
        动作要求：首先控制腰腹部缓慢向上抬至最高，上抬的过程中保持肩部和臀部紧贴软垫，随后缓慢向下压至最低，重复3次。
      </div>
    </div>

    <div class="img">
      <el-image class="img__item" :src="imgSrc" fit="fit"></el-image>
    </div>

    <div class="btn">
      <el-button class="btn__item" type="primary" @click="handleStart"
        >开 始 测 试</el-button
      >
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

export default {
  name: 'flexibility-test-des',

  data() {
    return {
      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(
        __static,
        `narrate/${this.$store.state.voiceBaseSrc}/3.mp3`
      ),

      imgSrc: require('@/assets/img/test-mode/flexibility-test/show.gif')
    }
  },

  created() {
    this.$store.dispatch('setIsCollapse', false)
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
     * @description: 开始测试按钮
     */
    handleStart() {
      this.$router.push({ path: '/layout/flexibility-test-measure' })
    }
  }
}
</script>

<style lang="scss" scoped>
.flexibility-test-des {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  @include flex(column, flex-start, stretch);

  .title {
    color: #008000;
    font-size: 34px;
  }

  .text {
    font-size: 20px;
    margin-top: 20px;
    .text__item {
      margin: 10px 0;
    }
  }

  .img {
    flex: 1;
    @include flex(row, center, center);
    .img__item {
      width: 50%;
    }
  }

  .btn {
    @include flex(row, center, center);
    .btn__item {
      font-size: 28px;
    }
  }
}
</style>
