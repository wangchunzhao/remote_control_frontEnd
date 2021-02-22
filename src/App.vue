<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  created() {
    // 删除在index.html里面设备是 loading timer
    if (window.loadingTimer) {
      clearTimeout(window.loadingTimer)
    }
  }
}
</script>

<style lang="scss">
@import 'src/assets/style/main.scss';
</style>
