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
      type: Object,
      default: function() {
        return null
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
        if (!val) {
          return false
        }
        if (!val.data.length) {
          this.isNoData = true
        } else {
          this.isNoData = false
        }
        this.chart.setOption({
          color: ['#1878ff', '#1cbe24'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          // legend: {
          //   data: [this.chartData.data[0].name, this.chartData.data[1].name],
          //   top: 0
          // },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
          },
          yAxis: {
            type: 'category',
            data: this.data.xAxis,
            axisLabel: {
              color: '#000',
              interval: 0,
              formatter: function(value) {
                if (value.length > 6) {
                  return value.substring(0, 6) + '...'
                } else {
                  return value
                }
              }
            }
          },
          series: [
            {
              type: 'bar',
              data: this.data.data
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
