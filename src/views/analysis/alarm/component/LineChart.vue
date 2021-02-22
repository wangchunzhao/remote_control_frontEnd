<template>
  <div :id="domId" style="height: 302px;" />
</template>

<script>
// import dayjs from 'dayjs'
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
    return {}
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
        window.drillDown = this.drillDown

        let xAxisData = []
        for (let i = 1; i <= this.data.list1.data.length; i++) {
          xAxisData.push(i)
        }
        this.chart.setOption({
          color: ['#1878ff', '#1cbe24'],
          legend: {
            data: [this.data.list1.name, this.data.list2.name],
            bottom: 0
          },
          grid: {
            left: 50,
            right: 90
          },
          tooltip: {
            trigger: 'axis',
            enterable: true,
            formatter: params => {
              var icon =
                this.data.scopeType === 'day'
                  ? ''
                  : `
                <a href="javascript:void(0);" style="float: right;color: #fff;margin-left: 30px;" onclick="drillDown('${params[0].dataIndex}')">
                  <img style="width: 15px; cursor: pointer;" src="https://cdn.sinocold.net/images/20190404140158.png" alt="">
                  下钻
                </a>
              `
              var str = `
                  <div style="margin-bottom: 6px;">
                    <span>${
                      this.dateType === 'day'
                        ? params[0].axisValue + ':00'
                        : this.dateType === 'month'
                        ? params[0].axisValue + '日'
                        : params[0].axisValue
                    }</span>
                    ${icon}
                  </div>
                  <div>
                    <span class="tooltip-point" style="background: ${
                      params[0].color
                    }"></span>
                    <span>${
                      this.dateType === 'lastDay'
                        ? params[0].axisValue + ':00'
                        : this.dateType === 'lastMonth'
                        ? params[0].axisValue + '日'
                        : params[0].axisValue
                    }：${params[0].data || ''}</span>
                  </div>
                  ${
                    params[1]
                      ? `
                      <div>
                        <span class="tooltip-point" style="background: ${
                          params[1].color
                        }"></span>
                        <span>${params[1].seriesName}：${params[1].data ||
                          ''}</span>
                      </div>
                    `
                      : ''
                  }
                `
              return str
            }
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
              this.data.scopeType === 'week'
                ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                : this.data.scopeType === 'day'
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
            //     if (this.data.scopeType === 'month') {
            //       return value + '日'
            //     } else {
            //       return value
            //     }
            //   }
            // }
          },
          yAxis: {
            name: '报警数量',
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
      // immediate: true
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.domId))
    this.chart.showLoading({
      color: '#1890ff'
    })
    window.addEventListener('resize', this.chart.resize)
    this.chart.on('click', params => {
      if (this.data.scopeType === 'day') {
        return false
      }
      if (this.data.xAxis[params.dataIndex] !== 'Invalid Date') {
        this.$emit('drillDown', this.data.xAxis[params.dataIndex])
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.chart.resize)
  },
  methods: {
    drillDown(val) {
      this.$emit('drillDown', this.data.xAxis[val])
    }
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
