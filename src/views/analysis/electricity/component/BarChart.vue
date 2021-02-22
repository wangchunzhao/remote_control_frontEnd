<template>
  <div :id="domId" style="height: 300px;" />
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
      chartData: {}
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
    data(val) {
      this.chartData = val
    },
    chartData: {
      handler(data) {
        if (!data) {
          return false
        }
        data.data.forEach(item => {
          item.barMaxWidth = 50
        })
        this.chart.setOption({
          color: ['#1878ff', '#1cbe24'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: [this.chartData.data[0].name, this.chartData.data[1].name],
            top: 0
          },
          grid: {
            left: '3%',
            right: '4%',
            // bottom: '3%',
            containLabel: true
          },
          dataZoom: [
            {
              type: 'slider',
              show: true,
              startValue: 0,
              endValue: 3,
              zoomLock: true,
              handleSize: 0
            }
          ],
          xAxis: {
            type: 'category',
            data: this.chartData.xAxis,
            axisLabel: {
              interval: 0
            }
          },
          yAxis: {
            name: '用电量/kWh',
            type: 'value'
          },
          series: this.chartData.data

          // series: [
          //   {
          //     name: '上周',
          //     type: 'bar',
          //     data: [320, 332, 324, 233]
          //   },
          //   {
          //     name: '上上周',
          //     type: 'bar',
          //     data: [220, 182, 34, 233]
          //   }
          // ]
        })
        this.chart.hideLoading()
      },
      deep: true
      // immediate: true
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.domId))
    window.addEventListener('resize', this.chart.resize)
    this.chart &&
      this.chart.showLoading({
        color: '#1890ff'
      })
    this.chart.getZr().on('click', params => {
      const pointInPixel = [params.offsetX, params.offsetY]
      if (this.chart.containPixel('grid', pointInPixel)) {
        let xIndex = this.chart.convertFromPixel({ seriesIndex: 0 }, [
          params.offsetX,
          params.offsetY
        ])[0]
        /* 事件处理代码书写位置*/
        this.chartData.data.forEach((item, index) => {
          item.data.forEach((item2, index2) => {
            if (xIndex !== index2) {
              if (index === 0) {
                item.data[index2] = {
                  value: typeof item2 === 'object' ? item2.value : item2,
                  itemStyle: {
                    color: '#898989'
                  }
                }
              } else {
                item.data[index2] = {
                  value: typeof item2 === 'object' ? item2.value : item2,
                  itemStyle: {
                    color: '#d0d0d0'
                  }
                }
              }
            } else {
              item.data[index2] = {
                value: typeof item2 === 'object' ? item2.value : item2,
                itemStyle: {
                  color: '#1878ff'
                }
              }
            }
          })
        })
        this.$set(this.chartData, 'temp', new Date().getTime()) // 强制触发vue更新
        this.$emit('drillDown', this.data.projectIds[xIndex])
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.chart.resize)
  }
}
</script>
