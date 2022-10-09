<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 11:38:43
 * @LastEditTime: 2021-11-09 11:38:43
 * @Description : 布局组件
-->
<template>
  <div class="layout">
    <!-- 侧边菜单栏 -->
    <side-bar />

    <!-- 右侧区域 -->
    <div class="right-box">
      <!-- 头部状态栏 -->
      <header-status-bar />

      <!-- 内容 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar'
import HeaderStatusBar from '@/components/HeaderStatusBar'

export default {
  name: 'layout',

  components: {
    SideBar,
    HeaderStatusBar
  }
}
</script>

<style lang="scss" scoped>
.layout {
  width: 100%;
  height: 100%;
  @include flex(row, stretch, stretch);

  /* 右侧区域 */
  .right-box {
    flex: 1;
    height: 100%;
    @include flex(column, stretch, stretch);
    overflow: hidden; // 加上这个之后，内容就不会出现无法自适应的bug

    /* 内容 */
    .content {
      flex: 1;
      width: 100%;
      overflow-x: hidden; // 不允许X轴滚动
      overflow-y: auto; // 超出时才允许Y轴滚动
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        // 滚动条里面小方块
        border-radius: 2px;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: #535353;
      }
    }
  }
}
</style>
