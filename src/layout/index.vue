<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 11:38:43
 * @LastEditTime: 2023-05-02 09:31:34
 * @Description : 布局组件
-->
<template>
  <div class="container">
    <!-- 顶部栏 -->
    <div class="topbar">
      <top-bar />
    </div>

    <!-- 内容区 -->
    <div class="main">
      <transition mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'

export default {
  name: 'layout',

  components: {
    TopBar
  }
}
</script>

<style lang="scss" scoped>
/* 路由过渡动效 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s;
}
.v-enter,
.v-leave-to {
  opacity: 0;
}

.container {
  width: 100%;
  height: 100%;

  /* 顶部栏 */
  .topbar {
    width: 100%;
    height: 8vh;
  }

  /* 内容区 */
  .main {
    box-shadow: inset 0 1px 16px rgba(0, 0, 0, 0.5);
    background: linear-gradient(-45deg, #dfe9ff, #f2e4fb, #d6f1fc);
    width: 100%;
    height: 92vh;
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
</style>
