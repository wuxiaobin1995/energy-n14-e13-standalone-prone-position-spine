<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-06 14:16:09
 * @LastEditTime: 2023-06-06 14:34:44
 * @Description : 静态稳定训练-pdf子组件
-->
<template>
  <div class="plan-static-pdf">
    <div class="left">
      <div class="item">
        <div class="title">静态稳定训练</div>
      </div>
      <div class="item">
        <div class="text">训练目标：</div>
        <div class="val">{{ data.target }}</div>
      </div>
      <div class="item">
        <div class="text">目标范围：</div>
        <div class="val">{{ data.scope }}</div>
      </div>
      <div class="item">
        <div class="text">训练时长：</div>
        <div class="val">{{ data.keepTime }}s</div>
      </div>
      <div class="item">
        <div class="text">组间休息时长：</div>
        <div class="val">{{ data.groupRestTime }}s</div>
      </div>
      <div class="item">
        <div class="text">训练组数：</div>
        <div class="val">{{ data.groups }}</div>
      </div>
      <div class="item">
        <div class="text">动作：</div>
        <div class="val">{{ data.action }}</div>
      </div>
      <div class="item">
        <div class="text">训练评分：</div>
        <div class="val">{{ data.completion }}</div>
      </div>
    </div>

    <div class="center">
      <table border="1" class="table">
        <tr :style="{ height: '40px' }" bgcolor="#E7E6E6" align="center">
          <th>训练组数</th>
          <th>训练完成度%</th>
        </tr>
        <tr
          :style="{ height: '30px' }"
          align="center"
          v-for="(item, index) in data.completionResultArray"
          :key="index"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ item }}</td>
        </tr>
      </table>
    </div>

    <div class="right">
      <el-image :src="showSrc" fit="scale-down"></el-image>
    </div>
  </div>
</template>

<script>
export default {
  name: 'plan-static-pdf',

  props: {
    data: {
      type: Object,
      default: {}
    }
  },

  data() {
    return {
      showSrc: require('@/assets/img/Train/Static/1.png'),
      oneSrc: require('@/assets/img/Train/Static/1.png'),
      twoSrc: require('@/assets/img/Train/Static/2.png'),
      threeSrc: require('@/assets/img/Train/Static/3.png')
    }
  },

  created() {
    /* 根据不同的类型展示不同图片 */
    if (this.data.action === '1') {
      this.showSrc = this.oneSrc
    } else if (this.data.action === '2') {
      this.showSrc = this.twoSrc
    } else if (this.data.action === '3') {
      this.showSrc = this.threeSrc
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-static-pdf {
  width: 100%;
  height: 80%;
  padding: 10px;
  @include flex(row, space-around, center);

  .left {
    @include flex(column, stretch, stretch);
    .item {
      @include flex(row, flex-start, center);
      margin-bottom: 25px;
      .title {
        font-size: 32px;
        font-weight: 700;
        color: #8a38f5;
      }
      .text {
        font-size: 28px;
        font-weight: 700;
      }
      .val {
        font-size: 28px;
      }
    }
  }

  .center {
    .table {
      width: 350px;
      font-size: 22px;
    }
  }

  .right {
    width: 26%;
    @include flex(row, center, center);
  }
}
</style>
