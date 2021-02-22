<template>
  <div class="ellipsis-tooltip">
    <el-tooltip placement="top" :disabled="tooltipDisabled">
      <div slot="content" style="max-width: 200px;line-height: 18px;">
        {{ content }}
      </div>
      <div :ref="refName" :class="['text-wrap233', `row${row}`]">
        {{ content }}
      </div>
    </el-tooltip>
  </div>
</template>

<script>
import { randomString } from '@/utils/index'
export default {
  props: {
    row: {
      type: Number,
      default() {
        return 1
      }
    },
    content: String
  },
  data() {
    return {
      refName: randomString(10),
      tooltipDisabled: true
    }
  },
  created() {
    // 可参考：https://github.com/iplaces/blog/issues/3
    this.$nextTick(() => {
      this.tooltipDisabled = !(
        this.$refs[this.refName].offsetWidth <
          this.$refs[this.refName].scrollWidth || // 处理单行省略
        this.$refs[this.refName].offsetHeight <
          this.$refs[this.refName].scrollHeight
      ) // 处理多行省略
    })
  }
}
</script>

<style lang="scss">
.ellipsis-tooltip {
  .text-wrap233 {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
  }
  .row1 {
    -webkit-line-clamp: 1;
  }
  .row2 {
    -webkit-line-clamp: 2;
  }
  .row3 {
    -webkit-line-clamp: 3;
  }
  .row4 {
    -webkit-line-clamp: 4;
  }
  .row5 {
    -webkit-line-clamp: 5;
  }
  .row6 {
    -webkit-line-clamp: 6;
  }
  .row7 {
    -webkit-line-clamp: 7;
  }
  .row8 {
    -webkit-line-clamp: 8;
  }
}
</style>
