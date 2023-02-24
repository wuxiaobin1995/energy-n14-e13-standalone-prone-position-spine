<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-09 21:12:48
 * @LastEditTime: 2023-02-24 15:49:20
 * @Description : 活动度改善训练-参数设置
-->
<template>
  <div class="activity-improvement-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="des">
      <div class="item">训练目的：改善骨盆灵活度</div>
      <div class="item">
        动作要求：吸气同时控制腰腹部缓慢向上抬至最高，上抬的过程中保持肩部和臀部紧贴软垫，随后呼气同时控制腰腹部缓慢向下压至最低，重复至训练结束
      </div>
      <div class="item">提示：从低点开始预备</div>
    </div>

    <div class="content">
      <div class="img">
        <el-image class="item" :src="imgSrc" fit="scale-down"></el-image>
      </div>
      <div class="set">
        <!-- 训练个数 -->
        <div class="set__one">
          <span class="text">训练个数</span>
          <el-input-number
            v-model="num"
            :precision="0"
            :step="1"
            :min="1"
            :max="30"
          ></el-input-number>
        </div>
        <!-- 间隔时间 -->
        <div class="set__two">
          <span class="text">间隔时间</span>
          <el-input-number
            v-model="intervalTime"
            :precision="0"
            :step="1"
            :min="3"
            :max="10"
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
  name: 'activity-improvement-set',

  data() {
    return {
      imgSrc: require('@/assets/img/Train/Activity_Improvement/示意图.png'), // 示意图

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/活动度改善训练.mp3`),

      /* 图形相关变量 */
      myChart: null,
      option: {},

      /* 其他 */
      targetUp: this.$store.state.bothFlexibility.maxDepth, // 训练目标上限
      targetDown: this.$store.state.bothFlexibility.minDepth, // 训练目标下限
      num: 5, // 训练个数（1~30）
      intervalTime: 5 // 间隔时间（秒）（3~10）
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
        path: '/activity-improvement-measure',
        query: {
          targetUp: JSON.stringify(this.targetUp),
          targetDown: JSON.stringify(this.targetDown),
          num: JSON.stringify(this.num),
          intervalTime: JSON.stringify(this.intervalTime)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.activity-improvement-set {
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
      .set__two {
        margin-top: 50px;
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
