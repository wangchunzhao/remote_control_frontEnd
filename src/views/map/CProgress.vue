<template>
  <div class="c-progress">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="c-progress-bar-inner"
      :style="{ width: item.width, backgroundColor: item.color }"
    ></div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.c-progress {
  height: 2px;
  display: flex;
  .c-progress-bar-inner {
    display: inline-block;
    height: 2px;
  }
}
</style>
