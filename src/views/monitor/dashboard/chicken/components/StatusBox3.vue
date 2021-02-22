<template>
  <div class="dashboardChicken-status-box box-style">
    <div class="left-wrap">
      <div class="title">
        CO2
        <el-tooltip
          v-if="alarmInfo"
          effect="dark"
          :content="
            `CO2 ${alarmInfo.ALARM_SETTING}，已持续 ${alarmInfo.DurationTime}`
          "
          placement="top"
        >
          <c-svg
            name="warning-circle-fill"
            style="color: #FF4D4F;font-size: 16px;"
          ></c-svg>
        </el-tooltip>
      </div>
      <div>
        <span :style="{ color: alarmInfo ? '#F5222D' : null }" class="value">{{
          currentValue
        }}</span>
        <span :style="{ color: alarmInfo ? '#F5222D' : null }" class="unit"
          >ppm</span
        >
      </div>
    </div>
    <div v-nodata="isEmpty" class="chart-wrap" :id="chartWrapId"></div>
  </div>
</template>

<script>
import uuid from 'uuid/v4'
import { getHenhousePointData } from '@/api/breed'
import dayjs from 'dayjs'
export default {
  props: {
    deviceId: Number,
    sidebarStatus: Boolean,
    projectId: Number,
    isActive: Boolean
  },
  data() {
    return {
      currentValue: '-',
      alarmInfo: null,
      isEmpty: false,
      chartWrapId: uuid(),
      options: {
        color: ['#E6F7FF'],
        grid: {
          top: 15,
          left: 0,
          right: 0,
          bottom: 0
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLable: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
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
        },
        series: [
          // {
          //   data: [],
          //   type: 'line',
          //   areaStyle: {
          //     color: '#E6F7FF'
          //   },
          //   symbol: 'none',
          //   lineStyle: {
          //     width: 1
          //   }
          // }
        ]
      }
    }
  },
  watch: {
    sidebarStatus() {
      setTimeout(() => {
        this.chart.resize()
      }, 500)
    },
    projectId() {
      this.renderChart()
    },
    options: {
      handler: function(val) {
        this.chart.setOption(val, true)
      },
      deep: true
    },
    isActive(val) {
      if (val) {
        this.chart.resize()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
      window.addEventListener('resize', () => {
        this.chart.resize()
      })
    })
    this.renderChart()
  },
  methods: {
    initCharts() {
      this.chart = echarts.init(document.getElementById(this.chartWrapId))
      this.chart.setOption(this.options)
    },
    renderChart() {
      this.isEmpty = false
      this.currentValue = '-'
      getHenhousePointData({
        projectId: this.projectId,
        mtid: this.deviceId,
        start: dayjs()
          .subtract(1, 'day')
          .format('YYYY-MM-DD HH:mm'),
        end: dayjs().format('YYYY-MM-DD HH:mm'),
        pointType: 'CO2'
      }).then(res => {
        if (res.data.Code === 200) {
          let series = []
          const data = res.data.Data
          if (!data.PointData) {
            this.isEmpty = true
            return
          }
          this.alarmInfo = data.HenhouseAlarm
          data.PointData.PointList.forEach(v => {
            let data = []
            v.DataList.forEach(vv => {
              data.push([vv.Time, vv.Value])
            })
            series.push({
              data,
              name: v.PointName,
              type: 'line',
              areaStyle: {
                color: this.alarmInfo ? '#FFF1F0' : '#E6F7FF'
              },
              symbol: 'none',
              lineStyle: {
                width: 1
              }
            })
          })
          this.options.series = series
          const value = res.data.Data.Value
          this.currentValue = value ? parseFloat(value.toFixed(2)) : '-'
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboardChicken-status-box {
  display: flex;
  background-color: #fff;
  & > div {
    flex: 1;
  }
  .title {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    margin-bottom: 15px;
  }
  .value {
    font-size: 24px;
    font-weight: 500;
    margin-right: 6px;
  }
  .unit {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}
</style>
