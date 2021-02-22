<template>
  <div
    ref="scrollContainer"
    class="scroll-container"
    @wheel.prevent="handleScroll"
  >
    <div
      ref="scrollWrapper"
      class="scroll-wrapper"
      :style="{ top: top + 'px' }"
    >
      <slot />
    </div>
  </div>
</template>

<script>
const delta = 0

export default {
  name: 'ScrollBar',
  data() {
    return {
      top: 0
    }
  },
  methods: {
    handleScroll(e) {
      const eventDelta = (e.wheelDelta * 1) / 3 || -e.deltaY * 3
      const $container = this.$refs.scrollContainer
      const $containerHeight = $container.offsetHeight
      const $wrapper = this.$refs.scrollWrapper
      const $wrapperHeight = $wrapper.offsetHeight
      if (eventDelta > 0) {
        this.top = Math.min(0, this.top + eventDelta)
      } else {
        if ($containerHeight - delta < $wrapperHeight) {
          if (this.top < -($wrapperHeight - $containerHeight + delta)) {
            this.top = this.top
          } else {
            this.top = Math.max(
              this.top + eventDelta,
              $containerHeight - $wrapperHeight - delta
            )
          }
        } else {
          this.top = 0
        }
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.scroll-container {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  cursor: pointer;
  .scroll-wrapper {
    position: absolute;
    width: 100% !important;
  }
}
</style>
