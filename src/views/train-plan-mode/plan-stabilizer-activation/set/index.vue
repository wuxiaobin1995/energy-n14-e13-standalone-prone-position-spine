<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-05 17:16:23
 * @LastEditTime: 2023-06-06 16:07:59
 * @Description : 方案-内核心激活训练-参数设置
-->
<template>
  <div class="plan-stabilizer-activation-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <div class="des">
        <div class="title">内核心激活训练</div>
        <div class="item">
          训练方式：通过测试模式确定活动范围后，训练者控制脊柱一格一格的移动并保持一定时间（5刻度为一格）通过小幅度且缓慢的脊柱活动，来激活局部的稳定肌
        </div>
        <div class="item">提示：从低点开始预备</div>
      </div>

      <div class="content">
        <!-- 示意图 -->
        <div class="img">
          <el-image class="item" :src="imgSrc" fit="scale-down"></el-image>
        </div>

        <!-- 配置项 -->
        <div class="set">
          <!-- 保持时长 -->
          <div class="item">
            <span class="text">保持时长</span>
            <el-input-number
              v-model="keepTime"
              :precision="0"
              :step="1"
              :min="1"
              :max="10"
            ></el-input-number>
          </div>
          <!-- 训练组数 -->
          <div class="item">
            <span class="text">训练组数</span>
            <el-input-number
              v-model="groups"
              :precision="0"
              :step="1"
              :min="2"
              :max="10"
            ></el-input-number>
          </div>
          <!-- 组间休息时长 -->
          <div class="item">
            <span class="text">组间休息时长</span>
            <el-input-number
              v-model="groupRestTime"
              :precision="0"
              :step="1"
              :min="30"
              :max="120"
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
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

export default {
  name: 'plan-stabilizer-activation-set',

  data() {
    return {
      imgSrc: require('@/assets/img/Train/Stabilizer_Activation/内核心激活训练.gif'), // 示意图

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(
        __static,
        `narrate/mandarin/Train/内核心激活训练.mp3`
      ),

      /* 其他 */
      targetUp: this.$store.state.bothFlexibility.maxDepth, // 上限
      targetDown: this.$store.state.bothFlexibility.minDepth, // 下限
      keepTime: 3, // 保持时长(s)，1~10
      groups: 3, // 训练组数，2~10
      groupRestTime: 30 // 组间休息时长(s)，30~120
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
        path: '/plan-stabilizer-activation-measure',
        query: {
          targetUp: JSON.stringify(this.targetUp), // 上限
          targetDown: JSON.stringify(this.targetDown), // 下限
          keepTime: JSON.stringify(this.keepTime), // 保持时长
          groups: JSON.stringify(this.groups), // 训练组数
          groupRestTime: JSON.stringify(this.groupRestTime) // 组间休息时长
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-stabilizer-activation-set {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 94%;
    height: 96%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 50px;
    @include flex(column, stretch, stretch);

    .des {
      .title {
        font-size: 22px;
        font-weight: 700;
        color: #8a38f5;
        margin-bottom: 5px;
      }
      .item {
        font-size: 18px;
        margin-bottom: 5px;
      }
    }

    .content {
      flex: 1;
      @include flex(row, space-between, stretch);
      .img {
        flex: 1;
        @include flex(row, center, center);
        .item {
          transform: scale(1.1);
        }
      }
      .set {
        width: 30%;
        @include flex(column, center, flex-start);
        .item {
          margin-bottom: 40px;
          .text {
            margin-right: 10px;
            font-size: 22px;
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
}
</style>
