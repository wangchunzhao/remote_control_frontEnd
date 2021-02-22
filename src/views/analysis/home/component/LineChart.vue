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
    dateType: String,
    loading: {
      type: Boolean,
      default: function() {
        return true
      }
    }
  },
  data() {
    return {
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
        let xAxisData = []
        for (let i = 1; i <= this.data.list1.data.length; i++) {
          xAxisData.push(i)
        }
        this.chart.setOption({
          color: ['#1878ff', '#1cbe24'],
          tooltip: {
            trigger: 'axis',
            formatter: params => {
              var str = `
                  <div style="margin-bottom: 6px;">
                    <span>${
                      this.dateType === 'lastDay'
                        ? params[0].axisValue + ':00'
                        : this.dateType === 'lastMonth'
                        ? params[0].axisValue + '日'
                        : params[0].axisValue
                    }</span>
                  </div>
                  <div>
                    <span class="tooltip-point" style="background: ${
                      params[0].color
                    }"></span>
                    <span>${params[0].seriesName}：${params[0].data || ''} ${
                this.data.yAxisName === '用电量 /kWh' ? 'kWh' : ''
              }</span>
                  </div>
                  <div>
                    <span class="tooltip-point" style="background: ${
                      params[1].color
                    }"></span>
                    <span>${params[1].seriesName}：${params[1].data || ''} ${
                this.data.yAxisName === '用电量 /kWh' ? 'kWh' : ''
              }</span>
                  </div>
                `
              return str
            }
          },
          legend: {
            data: [this.data.list1.name, this.data.list2.name],
            bottom: 0
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            // data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            data:
              this.data.scopeType === 2
                ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                : this.data.scopeType === 1
                ? [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23
                  ]
                : xAxisData
            // axisLabel: {
            //   formatter: (value) => {
            //     if (this.data.scopeType === 3) {
            //       return dayjs(value).format('DD')
            //     } else {
            //       return value
            //     }
            //   }
            // }
          },
          yAxis: {
            name: this.data.yAxisName,
            type: 'value'
          },
          series: [
            {
              // name: '上周',
              type: 'line',
              // data: [220, 182, 191, 234, 290, 330, 310],
              symbolSize: 6,
              symbol: 'circle',
              lineStyle: {
                type: 'solid'
              },
              ...this.data.list1
            },
            {
              // name: '上上周',
              // data: [120, 132, 101, 134, 90, 230, 210],
              symbol: 'rect',
              symbolSize: 6,
              type: 'line',
              lineStyle: {
                type: 'dashed'
              },
              ...this.data.list2
            }
          ]
        })
        this.chart.hideLoading()
      },
      deep: true
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

<style>
.tooltip-point {
  width: 8px;
  height: 8px;
  display: inline-block;
  border-radius: 50%;
  vertical-align: middle;
}
</style>
