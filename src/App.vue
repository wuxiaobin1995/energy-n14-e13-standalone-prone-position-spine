<!--
 * @Author      : Mr.bin
 * @Date        : 2022-10-08 10:51:46
 * @LastEditTime: 2023-02-07 15:16:13
 * @Description : 根组件
-->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',

  created() {
    /* 初始化医院名称 */
    if (!window.localStorage.getItem('hospital')) {
      window.localStorage.setItem('hospital', '')
    }
  }
}
</script>

<style lang="scss" scoped></style>
