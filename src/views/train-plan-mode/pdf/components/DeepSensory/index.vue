<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-06 14:09:45
 * @LastEditTime: 2023-06-06 14:49:56
 * @Description : 本体感觉训练-pdf子组件
-->
<template>
  <div class="plan-deep-sensory-pdf">
    <div class="left">
      <div class="item">
        <div class="title">本体感觉训练</div>
      </div>
      <div class="item">
        <div class="text">训练目标：</div>
        <div class="val">{{ data.target }}</div>
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
        <div class="text">训练平均值：</div>
        <div class="val">{{ data.average }}</div>
      </div>
      <div class="item">
        <div class="text">完成度：</div>
        <div class="val">{{ data.completion }}%</div>
      </div>
    </div>

    <div class="right">
      <table border="1" class="table">
        <tr :style="{ height: '40px' }" bgcolor="#E7E6E6" align="center">
          <th>训练组数</th>
          <th>训练值</th>
        </tr>
        <tr
          :style="{ height: '30px' }"
          align="center"
          v-for="(item, index) in data.coreResultArray"
          :key="index"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ item }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'plan-deep-sensory-pdf',

  props: {
    data: {
      type: Object,
      default: {}
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-deep-sensory-pdf {
  width: 100%;
  height: 80%;
  padding: 10px;
  @include flex(row, center, center);

  .left {
    @include flex(column, stretch, stretch);
    margin-right: 260px;
    .item {
      @include flex(row, flex-start, center);
      margin-bottom: 30px;
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

  .right {
    .table {
      width: 350px;
      font-size: 22px;
    }
  }
}
</style>
