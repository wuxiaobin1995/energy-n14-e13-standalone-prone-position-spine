<!--
 * @Author      : Mr.bin
 * @Date        : 2021-11-09 14:57:04
 * @LastEditTime: 2021-11-15 16:16:00
 * @Description : 刷新中转页面
-->
<template>
  <div class="refresh" v-loading.fullscreen.lock="fullscreenLoading"></div>
</template>

<script>
export default {
  name: 'refresh',

  data() {
    return {
      fullscreenLoading: true,
      routerName: this.$route.query.routerName,
      duration: this.$route.query.duration ? this.$route.query.duration : 800 // 刷新时长
    }
  },

  created() {
    setTimeout(() => {
      this.$router.push({
        path: this.routerName
      })
    }, this.duration)
  }
}
</script>

<style lang="scss" scoped>
.refresh {
  width: 100%;
  height: 100%;
}
</style>
