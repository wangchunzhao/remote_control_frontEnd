<template>
  <div>
    <div class="chart-title">{{ info.ProjectName / info.ModelTreeName }}</div>
    <div :id="chartWrapId" style="flex: 1;width: 100%;height: 302px" />
  </div>
</template>

<script>
import { getMoreProjectPointBrokenLine } from '@/api/deviceMonitoryPoint'
import dayjs from 'dayjs'
export default {
  props: {
    Index: Number,
    info: Object
  },
  data() {
    return {
      chartWrapId: undefined,
      dialogVisible: false,
      form: {
        PointIdList: [],
        DateType: undefined,
        TimeQuantum: {
          StartDate: undefined,
          EndDate: undefined
        },
        TimeIntervalId: undefined,
        ClassifyList: []
      },
      chartOptions: {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          itemWidth: 11,
          itemHeight: 8,
          icon: 'rect',
          bottom: 0,
          textStyle: {
            color: '#8C8C8C'
          },
          type: 'scroll',
          padding: [0, 50],
          itemGap: 20
        },
        toolbox: {
          bottom: 0,
          right: 0,
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: 20,
          right: 10,
          bottom: 40,
          top: 45,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: [],
          axisTick: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.45)'
            }
          },
          axisLabel: {
            color: 'rgba(0, 0, 0, 0.45)'
          },
          splitLine: {
            lineStyle: {
              color: ['rgba(0, 0, 0, 0.45)']
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.45)'
            },
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '用电量/kWh',
          nameTextStyle: {
            color: '#808080'
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: 'rgba(0, 0, 0, 0.45)'
          },
          axisLine: {
            show: false
          }
        },
        series: [
          // {
          //   name: '邮件营销',
          //   type: 'line',
          //   symbol: 'none',
          //   areaStyle: {},
          //   // emphasis: {
          //   //   focus: 'series'
          //   // },
          //   data: [120, 132, 101, 134, 90, 230, 210]
          // },
        ]
      }
    }
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.chart = echarts.init(document.getElementById(this.chartWrapId))
          this.chart.group = 'deviceRunningAnalysisCharts'
          window.addEventListener('resize', this.chart.resize)
        })
      }
    }
  },
  mounted() {
    this.chartWrapId = `chart-wrap${Math.ceil(Math.random() * 10000)}`
  },
  beforeDestroy() {
    if (this.chart) {
      window.removeEventListener('resize', this.chart.resize)
    }
  },
  methods: {
    toggleDialog(form) {
      Object.assign((this.form = form))
      this.dialogVisible = true
      this.fetchChartSeries()
    },
    updateDialog(form) {
      Object.assign((this.form = form))
      this.fetchChartSeries()
    },
    fetchChartSeries() {
      if (!this.dialogVisible) {
        return
      }
      this.chart &&
        this.chart.showLoading({
          color: '#1890ff'
        })
      let data = JSON.parse(JSON.stringify(this.form))
      data.PointIdList = this.info.data
      getMoreProjectPointBrokenLine(data)
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data
            this.chartOptions.xAxis.data = data.Data.TimeList
              ? data.Data.TimeList.map(v => {
                  if (this.form.DateType === 'Day') {
                    v = dayjs(v).format('HH:mm')
                  } else if (this.form.DateType === 'Month') {
                    v = dayjs(v).format('DD') + '日'
                  } else if (this.form.DateType === 'Year') {
                    v = dayjs(v).month() + 1 + '月'
                  } else if (this.form.DateType === 'Custom') {
                    v = dayjs(v).format('YYYY-MM-DD')
                  }
                  return v
                })
              : []
            data.Data.DataList.forEach(v => {
              v.symbol = 'none'
            })
            this.chartOptions.series = data.Data.DataList
          } else {
            this.$message.error('获取折线图失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取折线图失败')
        })
        .finally(() => {
          this.chart.setOption(this.chartOptions)
          this.chart && this.chart.hideLoading()
          this.$emit('requestChart', {
            chart: this.chart,
            index: this.Index,
            chartId: this.chartWrapId
          })
        })
    }
  }
}
</script>

<style scoped lang="scss">
.chart-title {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #000000;
}
.tooltip-point {
  width: 8px;
  height: 8px;
  display: inline-block;
  border-radius: 50%;
  vertical-align: middle;
}
</style>
