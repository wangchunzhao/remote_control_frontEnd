<template>
  <div class="dashboardChicken-box-SKFDSIRESDF902343SDF box-style">
    <div class="left-wrap">
      <div class="info-item" style="padding-left: 0;">
        <div class="title">周龄</div>
        <div>
          <span class="number-text">
            {{ typeof data.WeekAge !== undefined ? data.WeekAge : '-' }}
          </span>
          <span
            style="float: right;transform: translateY(6px);"
            class="light-text"
          >
            {{ typeof data.AgeOfDay !== undefined ? data.AgeOfDay : '-' }}
            天
          </span>
        </div>
      </div>

      <div class="info-item">
        <div class="title">目标温度</div>
        <div>
          <span class="number-text">
            {{ typeof data.Temperature !== undefined ? data.Temperature : '-' }}
          </span>
          <span class="light-text">℃</span>
        </div>
      </div>
      <div class="info-item">
        <div class="title">目标湿度</div>
        <div>
          <span class="number-text">
            {{ typeof data.Humidity !== undefined ? data.Humidity : '-' }}
          </span>
          <span class="light-text">%</span>
        </div>
      </div>
      <div class="info-item">
        <div class="title">鸡只体重</div>
        <div>
          <span class="number-text">
            {{ typeof data.weight !== undefined ? data.weight : '-' }}
          </span>
          <span class="light-text">kg</span>
        </div>
      </div>
      <div class="info-item">
        <div class="title">最小通风量</div>
        <div>
          <span class="number-text">
            {{
              typeof data.VentilationCapacity !== undefined
                ? data.VentilationCapacity
                : '-'
            }}
          </span>
          <span class="light-text">m3/h</span>
        </div>
      </div>
    </div>
    <div class="right-wrap">
      <div class="chart-wrap" v-nodata="isEmpty" :id="chartWrapId"></div>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid/v4'
import { getHenhouseAgeOfDayData, getHenhouseSetting } from '@/api/breed'
export default {
  props: {
    deviceId: Number
  },
  data() {
    return {
      data: {},
      isEmpty: false,
      chartWrapId: uuid(),
      options: {
        color: [
          '#40A9FF',
          '#73D13D',
          '#9254DE',
          '#E6F7FF',
          '#91D5FF',
          '#40A9FF',
          '#096DD9'
        ],
        grid: {
          top: 0,
          left: 10,
          right: 10,
          bottom: 5
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          },
          axisLable: {
            show: false
          }
        },
        yAxis: [
          // {
          //   type: 'value',
          //   axisLine: {
          //     show: false
          //   },
          //   axisLabel: {
          //     show: false
          //   },
          //   axisTick: {
          //     show: false
          //   },
          //   axisLable: {
          //     show: false
          //   },
          //   splitLine: {
          //     show: false
          //   }
          // }
        ],
        series: [
          // {
          //   data: [820, 932, 901, 934, 1290, 1330, 1320],
          //   type: 'line',
          //   yAxisIndex: 0,
          //   symbol: 'none',
          //   lineStyle: {
          //     width: 1
          //   }
          // }
        ]
      }
    }
  },
  computed: {
    sidebarStatus() {
      return this.$store.state.app.sidebar
    },
    project() {
      return this.$store.state.app.project
    }
  },
  watch: {
    sidebarStatus() {
      setTimeout(() => {
        this.chart.resize()
      }, 500)
    },
    options: {
      handler: function(val) {
        this.chart.setOption(val, true)
      },
      deep: true
    },
    project() {
      this.fetchData()
      this.drawChart()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
      window.addEventListener('resize', () => {
        this.chart.resize()
      })
    })

    this.fetchData()
    this.drawChart()
  },
  methods: {
    initCharts() {
      this.chart = echarts.init(document.getElementById(this.chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchData() {
      this.data = {}
      getHenhouseAgeOfDayData({
        projectId: this.project.id,
        mtid: this.deviceId
      }).then(res => {
        if (res.data.Code === 200) {
          this.data = res.data.Data
        }
      })
    },
    drawChart() {
      this.isEmpty = false
      getHenhouseSetting({
        mtid: this.deviceId
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          let series = []
          let yAxisList = []
          data.CurveData.forEach((v, index) => {
            yAxisList.push({
              type: 'value',
              axisLine: {
                show: false
              },
              axisLabel: {
                show: false
              },
              axisTick: {
                show: false
              },
              axisLable: {
                show: false
              },
              splitLine: {
                show: false
              }
            })
            series.push({
              data: v.y,
              type: 'line',
              name: v.Name,
              yAxisIndex: index,
              symbol: 'none',
              lineStyle: {
                width: 1
              }
            })
          })
          this.options.series = series
          this.options.yAxis = yAxisList
          this.options.xAxis.data = data.x
          if (!series.length) {
            this.isEmpty = true
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboardChicken-box-SKFDSIRESDF902343SDF {
  display: flex;
  padding: 24px 20px;
  .left-wrap {
    flex: 0 0 750px;
    display: flex;
  }
  .info-item {
    flex: 1;
    padding: 10px 15px;
    & + .info-item {
      border-left: 1px solid #e8e8e8;
    }
  }
  .right {
    flex: 1;
  }
  .title {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 15px;
  }
  .light-text {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
  .number-text {
    font-size: 24px;
    font-weight: 500;
    margin-right: 5px;
  }
  .right-wrap {
    flex: 1;
  }
  .chart-wrap {
    width: 65%;
    float: right;
    height: 75px;
  }
}
</style>
