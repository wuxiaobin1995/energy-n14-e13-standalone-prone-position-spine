<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 11:39:36
 * @LastEditTime: 2022-03-05 18:40:06
 * @Description : 侧边菜单栏
-->
<template>
  <el-menu
    class="side-bar"
    background-color="#545c64"
    text-color="#ffffff"
    active-text-color="#ffffff"
    router
    :default-active="this.$route.path"
    :collapse="isCollapse"
    :unique-opened="true"
  >
    <!-- 动能Logo -->
    <div class="side-bar__logo">
      <el-image :src="logoSrc" fit="scale-down"></el-image>
    </div>

    <!-- 首页 -->
    <el-menu-item index="/layout/home">
      <i class="el-icon-s-home"></i>
      <span slot="title">首页</span>
    </el-menu-item>

    <!-- 个人设置 -->
    <el-submenu index="1" v-if="this.$store.state.currentUser.userId">
      <template slot="title">
        <i class="el-icon-user-solid"></i>
        <span>个人设置</span>
      </template>
      <el-menu-item index="/layout/user-edit">个人信息修改</el-menu-item>
    </el-submenu>

    <!-- 管理员设置 -->
    <el-submenu index="2" v-if="this.$store.state.currentAdmin.adminId">
      <template slot="title">
        <i class="el-icon-s-operation"></i>
        <span>管理员设置</span>
      </template>
      <el-menu-item index="/layout/user-manage">用户管理</el-menu-item>
      <el-menu-item index="/layout/admin-edit">管理员信息修改</el-menu-item>
      <el-menu-item index="/layout/user-pdf-check">用户报告查看</el-menu-item>
    </el-submenu>

    <!-- 设备信息 -->
    <el-menu-item
      index="/layout/facility-info"
      v-if="this.$store.state.currentAdmin.adminId"
    >
      <i class="el-icon-s-platform"></i>
      <span slot="title">设备信息</span>
    </el-menu-item>

    <!-- 开发者页面 -->
    <el-menu-item
      index="/layout/developer"
      v-if="this.$store.state.currentAdmin.adminId"
    >
      <i class="el-icon-s-promotion"></i>
      <span slot="title">开发者</span>
    </el-menu-item>

    <!-- 测试模式 -->
    <el-submenu index="3" v-if="this.$store.state.currentUser.userId">
      <template slot="title">
        <i class="el-icon-connection"></i>
        <span>测试模式</span>
      </template>
      <el-menu-item index="/layout/flexibility-test-des"
        >灵活性测试</el-menu-item
      >
      <el-menu-item
        index="/layout/deep-sensory-test-set"
        :disabled="
          this.$store.state.bothFlexibility.maxDepth === null ||
          this.$store.state.bothFlexibility.minDepth === null
        "
        >深感觉测试</el-menu-item
      >
    </el-submenu>

    <!-- 训练模式 -->
    <el-submenu index="4" v-if="this.$store.state.currentUser.userId">
      <template slot="title">
        <i class="el-icon-s-flag"></i>
        <span>训练模式</span>
      </template>
      <el-menu-item
        index="/layout/core-activation-train-set"
        :disabled="
          this.$store.state.bothFlexibility.maxDepth === null ||
          this.$store.state.bothFlexibility.minDepth === null
        "
        >内核心激活训练</el-menu-item
      >
      <el-menu-item
        index="/layout/activity-improvement-train-set"
        :disabled="
          this.$store.state.bothFlexibility.maxDepth === null ||
          this.$store.state.bothFlexibility.minDepth === null
        "
        >活动度改善训练</el-menu-item
      >
      <el-menu-item
        index="/layout/abdominal-respiration-train-set"
        :disabled="
          this.$store.state.bothFlexibility.maxDepth === null ||
          this.$store.state.bothFlexibility.minDepth === null
        "
        >腹式呼吸训练</el-menu-item
      >
      <el-menu-item
        index="/layout/static-train-set"
        :disabled="
          this.$store.state.bothFlexibility.maxDepth === null ||
          this.$store.state.bothFlexibility.minDepth === null
        "
        >静态训练</el-menu-item
      >
      <el-menu-item
        index="/layout/dynamic-train-set"
        :disabled="
          this.$store.state.bothFlexibility.maxDepth === null ||
          this.$store.state.bothFlexibility.minDepth === null
        "
        >动态训练</el-menu-item
      >
    </el-submenu>

    <!-- 数据记录 -->
    <el-submenu index="5" v-if="this.$store.state.currentUser.userId">
      <template slot="title">
        <i class="el-icon-s-data"></i>
        <span>数据记录</span>
      </template>
      <!-- 测试 -->
      <el-submenu index="5-1">
        <template slot="title">测试</template>
        <el-menu-item index="/layout/flexibility-test-record"
          >灵活性测试记录</el-menu-item
        >
        <el-menu-item index="/layout/deep-sensory-test-record"
          >深感觉测试记录</el-menu-item
        >
      </el-submenu>

      <!-- 训练 -->
      <el-submenu index="5-2">
        <template slot="title">训练</template>
        <el-menu-item index="/layout/core-activation-train-record"
          >内核心激活训练</el-menu-item
        >
        <el-menu-item index="/layout/activity-improvement-train-record"
          >活动度改善训练</el-menu-item
        >
        <el-menu-item index="/layout/abdominal-respiration-train-record"
          >腹式呼吸训练</el-menu-item
        >
        <el-menu-item index="/layout/static-train-record"
          >静态训练</el-menu-item
        >
        <el-menu-item index="/layout/dynamic-train-record"
          >动态训练</el-menu-item
        >
      </el-submenu>
    </el-submenu>
  </el-menu>
</template>

<script>
export default {
  name: 'SideBar',

  data() {
    return {
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png') // 公司商标
    }
  },

  computed: {
    /* 是否展开、折叠菜侧边菜单栏 */
    isCollapse() {
      return this.$store.state.isCollapse
    }
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  border-right: none;
  /* 折叠状态时生效的样式 */
  height: 100%;
  width: 0; // 侧边栏收缩时实现完全隐藏
  overflow: hidden; // 侧边栏收缩时实现完全隐藏
  /* 展开状态时生效的样式 */
  &:not(.el-menu--collapse) {
    box-shadow: 2px 0 6px rgba(82, 85, 87, 0.35);
    width: 200px;
    height: 100%;
    overflow-x: hidden; // 不允许X轴滚动
    overflow-y: auto; // 超出时才允许Y轴滚动
  }
  /* 改变滚动条样式，更美观 */
  &::-webkit-scrollbar {
    display: none; // 隐藏滚动条
  }
  /* 改变element激活item的样式 */
  & /deep/ .el-menu-item.is-active {
    background-color: rgb(24, 144, 255) !important;
  }

  /* 动能Logo */
  .side-bar__logo {
    @include flex();
    // padding: 2px;
  }
}
</style>
