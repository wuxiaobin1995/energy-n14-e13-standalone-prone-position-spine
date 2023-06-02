<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-09 21:12:48
 * @LastEditTime: 2023-06-02 14:37:38
 * @Description : 活动度训练-参数设置
-->
<template>
  <div class="activity-improvement-set">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="des">
      <div class="item">训练目的：改善骨盆灵活度</div>
      <div class="item">
        动作要求：吸气同时控制腰腹部，缓慢上抬至最高，上抬的过程中保持肩部和臀部紧贴软垫，随后呼气同时控制腰腹部缓慢向下压至最低，重复至训练结束
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
        <!-- 训练次数 -->
        <div class="item">
          <span class="text">训练次数</span>
          <el-input-number
            v-model="num"
            :precision="0"
            :step="1"
            :min="5"
            :max="20"
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
        <!-- 间隔时长 -->
        <div class="item">
          <span class="text">间隔时长</span>
          <el-input-number
            v-model="intervalTime"
            :precision="0"
            :step="1"
            :min="3"
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
      audioSrc: path.join(__static, `narrate/mandarin/Train/活动度训练.mp3`),

      /* 其他 */
      targetUp: this.$store.state.bothFlexibility.maxDepth, // 上限
      targetDown: this.$store.state.bothFlexibility.minDepth, // 下限
      num: 10, // 训练次数，5~20
      groups: 3, // 训练组数，2~10
      intervalTime: 5, // 间隔时长(s)，3~10
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
        path: '/activity-improvement-measure',
        query: {
          targetUp: JSON.stringify(this.targetUp), // 上限
          targetDown: JSON.stringify(this.targetDown), // 下限
          num: JSON.stringify(this.num), // 训练次数
          groups: JSON.stringify(this.groups), // 训练组数
          intervalTime: JSON.stringify(this.intervalTime), // 间隔时长
          groupRestTime: JSON.stringify(this.groupRestTime) // 组间休息时长
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
      @include flex(row, center, center);
      .item {
        width: 90%;
      }
    }
    .set {
      width: 35%;
      padding-left: 30px;
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
</style>
