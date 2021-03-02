<template>
  <div :id="domId" v-nodata="isNoData" style="height: 300px;" />
</template>

<script>
export default {
  props: {
    domId: {
      default: function() {
        return ''
      },
      type: String
    },
    data: {
      type: Array,
      default: function() {
        return []
      }
    },
    loading: {
      type: Boolean,
      default: function() {
        return true
      }
    }
  },
  data() {
    return {
      isNoData: false,
      isActive: false
    }
  },
  watch: {
    loading: {
      handler(val) {
        if (val) {
          this.chart &&
            this.chart.showLoading({
              color: '#1890ff'
            })
        } else {
          this.chart && this.chart.hideLoading()
        }
      },
      immediate: true
    },
    data: {
      handler(val) {
        this.isNoData = false
        if (!val) {
          return false
        }
        if (!val.length) {
          this.isNoData = true
          return false
        }
        this.chart.setOption({
          color: [
            '#26A9FF',
            '#00C74C',
            '#FECC00',
            '#242F77',
            '#8F30E8',
            '#00C6C3',
            '#3E29CF',
            '#FD2E62'
          ],
          tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
          },
          series: [
            {
              // name: '姓名',
              type: 'pie',
              radius: ['50%', '70%'],
              center: ['50%', '50%'],
              data: this.data,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        })
        this.chart.hideLoading()
      },
      deep: true
      // immediate: true
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.domId))
    window.addEventListener('resize', () => {
      if (this.isActive) {
        this.chart.resize()
      }
    })
    this.chart.showLoading({
      color: '#1890ff'
    })
  },
  activated() {
    this.isActive = true
  },
  deactivated() {
    this.isActive = false
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.chart.resize)
  }
}
</script>
