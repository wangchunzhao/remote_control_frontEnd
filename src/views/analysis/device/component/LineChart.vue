<template>
  <div>
    <div class="chart-title">
      {{ info.ProjectName }} / {{ info.ModelTreeName }}
    </div>
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
        yAxis: [],
        series: []
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
      this.dialogVisible = true
      Object.assign((this.form = form))
      this.fetchChartSeries()
    },
    updateDialog(form) {
      Object.assign((this.form = form))
      this.fetchChartSeries()
    },
    fetchChartSeries() {
      this.chart &&
        this.chart.showLoading({
          color: '#1890ff'
        })
      let data = JSON.parse(JSON.stringify(this.form))
      data.PointIdList = this.info.data
      let chartOptions = this.chartOptions
      getMoreProjectPointBrokenLine(data)
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data
            chartOptions.xAxis.data = data.Data.TimeList
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
            let yAxis = []
            let yAxisNameArr = []
            let DataList = data.Data.DataList
            // Y轴坐标处理
            DataList.map(item => {
              // 判断已有Y轴中是否存在相同类型
              let pointTypeArr = yAxisNameArr.filter(
                item1 => item1 === item.ExtendData.PointTypeName
              )
              // 没有相同类型
              if (!pointTypeArr.length) {
                yAxisNameArr.push(item.ExtendData.PointTypeName)
                item.yAxisIndex = yAxisNameArr.length - 1 + ''
                yAxis.push({
                  position: yAxisNameArr.length === 1 ? 'left' : 'right',
                  offset:
                    yAxisNameArr.length === 2
                      ? -5
                      : yAxisNameArr.length > 2
                      ? (yAxisNameArr.length - 2) * -80
                      : 0,
                  type: 'value',
                  name: `${item.ExtendData.PointTypeName}${
                    item.ExtendData.Unit ? '/' + item.ExtendData.Unit : ''
                  }`,
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
                })
              } else {
                // 有相同类型，指定该类型坐标轴
                for (let i = 0; i < yAxisNameArr.length; i++) {
                  if (yAxisNameArr[i] === item.ExtendData.PointTypeName) {
                    item.yAxisIndex = i + ''
                    break
                  }
                }
              }
            })
            console.log(DataList, 'DataList');
            chartOptions.series = DataList
            chartOptions.yAxis = yAxis
          } else {
            this.$message.error('获取折线图失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取折线图失败')
        })
        .finally(() => {
          this.chartOptions = chartOptions
          this.chart.setOption(chartOptions, true)
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
