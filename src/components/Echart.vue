<template>
  <div v-loading="loading" class="echart-wrap">
    <div :id="domId" style="height: 100%;"></div>
  </div>
</template>

<script>
/** 默认的颜色组 */
const defaultColors = [
  '#1890FF',
  '#04C74C',
  '#FFCD00',
  '#253076',
  '#8F30E9',
  '#03C7C3'
]

import { randomString } from '@/utils'
export default {
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: function() {
        return false
      }
    },
    domId: {
      type: String,
      required: false,
      default: function() {
        // 默认随机生成一个 domId
        return randomString(8)
      }
    },
    options: {
      type: Object,
      required: true
    }
  },
  watch: {
    options: {
      handler: function(options) {
        if (!options) {
          throw new Error('echart need options')
        }
        this.chart.setOption({
          color: this.defaultColors || defaultColors,
          ...options
        })
      }
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.domId))
    if (this.options) {
      this.chart.setOption({
        color: defaultColors,
        ...this.options
      })
    }
    // 监听 window 的 resize 事件，重绘图表
    window.addEventListener('resize', () => {
      this.chart.resize()
    })
  },
  beforeDestroy() {
    // 组件卸载时，调用 ECharts 的销毁函数
    this.chart.dispose()
  }
}
</script>
