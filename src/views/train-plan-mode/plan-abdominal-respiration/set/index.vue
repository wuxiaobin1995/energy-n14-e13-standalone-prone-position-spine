<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-02 15:21:29
 * @LastEditTime: 2023-10-23 11:48:36
 * @Description : 方案-腹式呼吸训练-参数设置
-->
<template>
  <div class="plan-abdominal-respiration-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <div class="des">
        <div class="title">腹式呼吸训练</div>
        <div class="item">
          训练目的：进行腹式呼吸训练，加强腹横肌收缩能力，修复腹直肌分离
        </div>
        <div class="item">
          动作要求：首先鼻吸气腹部隆起，随后嘴呼气，同时控制腹部向内收紧，腰部保持在中立位，肩部臀部贴着软垫
        </div>
        <div class="item">提示：从中间点开始预备</div>
      </div>

      <div class="content">
        <!-- 示意图 -->
        <div class="img">
          <el-image class="item" :src="showImg" fit="scale-down"></el-image>
        </div>

        <!-- 配置项 -->
        <div class="set">
          <!-- 训练时长 -->
          <div class="item">
            <span class="text">训练时长</span>
            <el-input-number
              v-model="trainTime"
              :precision="0"
              :step="10"
              :min="30"
              :max="120"
            ></el-input-number>
          </div>
        </div>
      </div>

      <div class="btn">
        <el-button class="item" type="primary" @click="handleStart"
          >开 始</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

export default {
  name: 'plan-abdominal-respiration-set',

  data() {
    return {
      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/Train/腹式呼吸训练.mp3`),

      showImg: require('@/assets/img/Train/Abdominal_Respiration/腹式呼吸训练.gif'),

      /* 其他 */
      targetUp: this.$store.state.bothFlexibility.maxDepth, // 上限
      targetDown: this.$store.state.bothFlexibility.minDepth, // 下限

      trainTime: 60, // 训练时长(s)，30~120

      /* 参考曲线相关 */
      bgUpArray: [], // 上限参考曲线
      bgDownArray: [] // 下限参考曲线
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

  computed: {
    // 活动度中点
    midpoint() {
      return parseInt(((this.targetUp + this.targetDown) / 2).toFixed(0))
    }
  },

  methods: {
    /**
     * @description: 开始训练按钮
     */
    handleStart() {
      // 默认是中点的±5
      const up = this.midpoint + 5
      const down = this.midpoint - 5
      for (let i = 0; i < this.trainTime * 10; i++) {
        this.bgUpArray.push(up)
        this.bgDownArray.push(down)
      }

      this.$router.push({
        path: '/plan-abdominal-respiration-measure',
        query: {
          trainTime: JSON.stringify(this.trainTime), // 训练时长
          midpoint: JSON.stringify(this.midpoint), // 活动度中点
          bgUpArray: JSON.stringify(this.bgUpArray), // 上限数组
          bgDownArray: JSON.stringify(this.bgDownArray) // 下限数组
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-abdominal-respiration-set {
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
      .chart {
        flex: 1;
      }
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
