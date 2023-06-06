<!--
 * @Author      : Mr.bin
 * @Date        : 2022-10-08 10:51:46
 * @LastEditTime: 2023-06-06 20:15:53
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
    this.initLocalStorage()
  },

  methods: {
    /**
     * @description: 初始化 LocalStorage
     */
    initLocalStorage() {
      /* 初始化医院名称 */
      if (!window.localStorage.getItem('hospital')) {
        window.localStorage.setItem('hospital', '')
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
