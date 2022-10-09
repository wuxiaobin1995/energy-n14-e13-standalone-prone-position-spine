<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-16 19:34:02
 * @LastEditTime: 2022-01-13 16:50:43
 * @Description : 设备信息页面
-->
<template>
  <div class="facility-info">
    <el-descriptions class="descriptions" :column="2" border>
      <!-- 设备编号 -->
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-cpu"></i>
          设备编号
        </template>
        <el-tag class="text" type="success">{{
          this.$store.state.facilityID
        }}</el-tag>
      </el-descriptions-item>

      <!-- 联系方式 -->
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-mobile-phone"></i>
          联系方式
        </template>
        <el-tag class="text">0750-6318728</el-tag>
      </el-descriptions-item>

      <!-- 设备到期时间 -->
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-time"></i>
          设备到期时间
        </template>
        <el-tag class="text" type="danger">{{
          this.$store.state.facilityDeadline
        }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
export default {
  name: 'facility-info',

  created() {
    this.$store.dispatch('setIsCollapse', false)
  }
}
</script>

<style lang="scss" scoped>
.facility-info {
  width: 100%;
  height: 100%;
  padding: 40px;
  @include flex(row, center, flex-start);

  .descriptions {
    margin-top: 20vh;
    width: 70%;
    .text {
      font-size: 16px;
    }
  }
}
</style>
