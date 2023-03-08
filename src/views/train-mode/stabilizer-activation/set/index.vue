<!--
 * @Author      : Mr.bin
 * @Date        : 2023-02-08 14:17:27
 * @LastEditTime: 2023-03-07 17:50:52
 * @Description : 局部稳定肌激活训练-参数设置
-->
<template>
  <div class="stabilizer-activation-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="des">
      <div class="item">
        动作要求：通过测试模式确定活动范围后，训练者控制脊柱一格一格（5刻度为一格）的移动并保持一定时间，通过小幅度且缓慢的脊柱活动激活局部的稳定肌
      </div>
      <div class="item">提示：从低点开始预备</div>
    </div>

    <div class="content">
      <div class="img">
        <el-image class="item" :src="imgSrc" fit="scale-down"></el-image>
      </div>
      <div class="set">
        <!-- 保持时长 -->
        <div class="set__one">
          <span class="text">保持时长</span>
          <el-input-number
            v-model="keepTime"
            :precision="0"
            :step="1"
            :min="3"
            :max="20"
          ></el-input-number>
        </div>
      </div>
    </div>

    <div class="btn">
      <el-button class="item" type="primary" @click="handleStart"
        >开始训练</el-button
      >
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

export default {
  name: 'stabilizer-activation-set',

  data() {
    return {
      imgSrc: require('@/assets/img/Train/Stabilizer_Activation/示意图.png'), // 示意图

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/局部稳定肌激活训练.mp3`),

      /* 图形相关变量 */
      myChart: null,
      option: {},

      /* 其他 */
      targetUp: this.$store.state.bothFlexibility.maxDepth, // 训练目标上限
      targetDown: this.$store.state.bothFlexibility.minDepth, // 训练目标下限
      keepTime: 3 // 保持时长（3~20）
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
     * @description: 开始训练按钮
     */
    handleStart() {
      this.$router.push({
        path: '/stabilizer-activation-measure',
        query: {
          targetUp: JSON.stringify(this.targetUp),
          targetDown: JSON.stringify(this.targetDown),
          keepTime: JSON.stringify(this.keepTime)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.stabilizer-activation-set {
  width: 100%;
  height: 100%;
  @include flex(column, stretch, stretch);

  .des {
    margin: 5px 0 15px 60px;
    font-size: 18px;
    .item {
      margin-bottom: 5px;
    }
  }

  .content {
    flex: 1;
    @include flex(row, space-between, stretch);
    .img {
      flex: 1;
      @include flex(row, flex-end, center);
      .item {
        width: 90%;
      }
    }
    .set {
      width: 35%;
      @include flex(column, center, center);
      .set__one {
        .text {
          font-size: 22px;
          margin-right: 10px;
        }
      }
    }
  }

  .btn {
    @include flex(row, center, center);
    .item {
      font-size: 28px;
    }
  }
}
</style>
