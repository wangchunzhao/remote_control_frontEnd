<template>
  <div v-loading="loading" class="box" style="padding-bottom: 0">
    <div :id="chartWrapId" class="chart-wrap" style="height: 320px;"></div>
  </div>
</template>

<script>
import { getAlarmAppPushNum } from '@/api/alarmActive'
import dayjs from 'dayjs'
import uuidv1 from 'uuid/v1'
const chartWrapId = uuidv1()

const currentMonth = [
  dayjs()
    .startOf('month')
    .format('YYYY-MM-DD HH:mm'),
  dayjs()
    .endOf('month')
    .format('YYYY-MM-DD HH:mm')
]
export default {
  props: {
    dateRange: {
      type: Array,
      default: function() {
        return currentMonth
      }
    }
  },
  data() {
    return {
      loading: false,
      chartWrapId,
      options: {
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
          itemGap: 20,
          itemHeight: 10,
          itemWidth: 10,
          bottom: 5
        },
        toolbox: {
          feature: {
            saveAsImage: {
              name: '报警推送统计'
            }
          },
          right: 0,
          bottom: 0
        },
        grid: {
          top: 30,
          left: 15,
          right: 15,
          bottom: 35,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#f5f5f5']
            }
          },
          axisLabel: {
            formatter: val => {
              return this._dateFormat(val, 'DD日')
            }
          },
          axisLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '数量',
          splitLine: {
            lineStyle: {
              color: ['#f5f5f5']
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        series: []
      }
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  watch: {
    options: {
      handler: function(val) {
        this.chart.setOption(val, true)
      },
      deep: true
    },
    dateRange(val) {
      if (val) {
        this.fetchData()
      }
    }
  },
  mounted() {
    this.initCharts()
    this.fetchData()
  },
  methods: {
    initCharts() {
      this.chart = echarts.init(document.getElementById(chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchData() {
      this.loading = true
      const [start, end] = this.dateRange
      getAlarmAppPushNum({
        projectId: this.projectId,
        startTime: start,
        endTime: end
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            const xAxisData = []
            data.TimeList.forEach(v => {
              if (v !== null) {
                xAxisData.push(v)
              }
            })
            this.options.xAxis.data = xAxisData
            this.options.series = data.DataList
          } else {
            this.options.xAxis.data = []
            this.options.series = []
          }
        })
        .catch(err => {
          console.error(err)
          this.tableData = []
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
