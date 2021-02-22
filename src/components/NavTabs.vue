<template>
  <div class="navtabs-wrap">
    <div
      v-for="(item, index) in tabList"
      :key="index"
      :class="[
        'navtabs-item',
        item.routePath === $route.path ? 'is-active' : ''
      ]"
      :style="{ color: item.routePath === $route.path ? color : '#303133' }"
      @click="clickItem(item.label)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tabList: {
      type: Array,
      required: true
    },
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  methods: {
    clickItem(label) {
      this.$emit('clickItem', label)
    }
  }
}
</script>

<style lang="scss" scoped>
.navtabs-wrap {
  margin-bottom: 15px;
  border-bottom: 2px solid #e4e7ed;
  background: #fff;
}
.navtabs-item {
  padding: 0 20px;
  height: 40px;
  box-sizing: border-box;
  line-height: 40px;
  display: inline-block;
  list-style: none;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  cursor: pointer;
  &:hover {
    color: #1890ff !important;
    cursor: pointer;
  }
  &:first-child {
    padding-left: 0;
    &.is-active {
      &::after {
        width: calc(100% - 20px);
        left: 0;
        transform: none;
      }
    }
  }
  &.is-active {
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 40px);
      height: 2px;
      bottom: -2px;
      background: currentColor;
    }
  }
}
</style>
