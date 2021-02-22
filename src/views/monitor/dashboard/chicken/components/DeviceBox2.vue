<template>
  <div class="dashboardChicken-box-SKDJF0392KJSDHF32 box-style">
    <div class="title">今日产蛋</div>
    <el-row :gutter="20" type="flex">
      <el-col :span="12">
        <span style="font-size: 24px;margin-right: 5px;" class="bold-text">
          {{ typeof data.TodayValue === 'number' ? data.TodayValue : '-' }}
        </span>
      </el-col>
      <el-col :span="12" style="position: relative;">
        <span class="light-text">软蛋</span>
        <span style="margin: 0 5px;" class="bold-text">
          {{ typeof data.SumValue === 'number' ? data.SumValue : '-' }}
        </span>
        <div style="position: absolute;top: -22px;">
          <span class="light-text">产蛋率</span>
          <span style="margin: 0 5px;" class="bold-text">
            {{ typeof data.LayingRate === 'number' ? data.LayingRate : '-' }}
          </span>
          <span class="light-text">%</span>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" type="flex">
      <el-col :span="12">
        <span class="light-text">日环比</span>
        <span
          style="margin: 0 4px;"
          :class="[
            'bold-text',
            upOrFallFactory(data.DayOnMonth) === 'up'
              ? 'red-text'
              : 'green-text'
          ]"
        >
          <i
            :class="[
              upOrFallFactory(data.DayOnMonth) === 'up'
                ? 'el-icon-caret-top'
                : 'el-icon-caret-bottom'
            ]"
          ></i>
          {{ typeof data.DayOnMonth === 'number' ? data.DayOnMonth : '-' }}%
        </span>
      </el-col>
      <el-col :span="12">
        <span class="light-text">周环比</span>
        <span
          style="margin: 0 4px;margin-left: 0;"
          :class="[
            'bold-text',
            upOrFallFactory(data.WeekOnMonth) === 'up'
              ? 'red-text'
              : 'green-text'
          ]"
        >
          <i
            :class="[
              upOrFallFactory(data.WeekOnMonth) === 'up'
                ? 'el-icon-caret-top'
                : 'el-icon-caret-bottom'
            ]"
          ></i>
          {{ typeof data.WeekOnMonth === 'number' ? data.WeekOnMonth : '-' }}%
        </span>
      </el-col>
    </el-row>
    <div
      class="chart-wrap"
      v-nodata="isEmpty"
      style="height: 100px;width: 100%;"
      :id="chartWrapId"
    ></div>
  </div>
</template>

<script>
import uuid from 'uuid/v4'
import { getWeekHenhouse, getHenhouseInfo } from '@/api/breed'
export default {
  props: {
    sidebarStatus: Boolean,
    projectId: Number,
    deviceId: Number,
    isActive: Boolean
  },
  data() {
    return {
      data: {},
      isEmpty: false,
      options: {
        grid: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        },
        color: ['#40A9FF', '#73D13D', '#FA8C16', '#40A9FF'],
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          // boundaryGap: false,
          data: [],
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
        yAxis: [
          {
            type: 'value',
            axisLine: {
              show: false
            },
            min: function(val) {
              let min = val.min - 20
              if (min <= 0) {
                return 0
              }
              return min
            },
            max: 100,
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
          {
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
          }
        ],
        series: [
          // {
          //   data: [820, 932, 901, 934, 1290, 1330, 1320],
          //   type: 'line',
          //   symbol: 'none',
          //   lineStyle: {
          //     width: 1,
          //     color: '#FA8C16'
          //   }
          // },
          // {
          //   data: [800, 902, 887, 954, 1200, 1730, 1920],
          //   type: 'bar',
          //   itemStyle: {
          //     color: '#40A9FF'
          //   }
          // }
        ]
      },
      chartWrapId: uuid()
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
    projectId() {
      this.fetchData()
      this.renderChart()
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
    })
    window.addEventListener('resize', () => {
      this.chart.resize()
    })
    this.fetchData()
    this.renderChart()
  },
  methods: {
    initCharts() {
      this.chart = echarts.init(document.getElementById(this.chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchData() {
      this.data = {}
      getHenhouseInfo({
        projectId: this.projectId,
        mtid: this.deviceId,
        queryPoint: '今日产蛋'
      }).then(res => {
        if (res.data.Code === 200) {
          this.data = res.data.Data
        }
      })
    },
    renderChart() {
      this.isEmpty = false
      this.data = {}
      getWeekHenhouse({
        projectId: this.projectId,
        mtid: this.deviceId,
        queryPoint: '今日产蛋'
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          this.options.xAxis.data = data.x
          let series = [
            {
              data: data.layingRateActual,
              type: 'line',
              symbol: 'none',
              yAxisIndex: 0,
              name: '实际产蛋率(%)',
              lineStyle: {
                width: 1
              }
            },
            {
              data: data.layingRateMax,
              type: 'line',
              symbol: 'none',
              yAxisIndex: 0,
              name: '最大产蛋率(%)',
              lineStyle: {
                width: 1
              }
            },
            {
              data: data.layingRateMin,
              type: 'line',
              symbol: 'none',
              yAxisIndex: 0,
              name: '最小产蛋率(%)',
              lineStyle: {
                // color: '#FA8C16',
                width: 1
              }
            },
            {
              data: data.y,
              type: 'bar',
              name: '产蛋量',
              yAxisIndex: 1,
              itemStyle: {
                color: '#40A9FF'
              }
            }
          ]
          this.options.series = series
          if (!data.y.length) {
            this.isEmpty = true
          }
        }
      })
    },
    upOrFallFactory(val) {
      if (typeof val === 'number') {
        if (val >= 0) {
          return 'up'
        } else {
          return 'fall'
        }
      } else {
        return 'up'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboardChicken-box-SKDJF0392KJSDHF32 {
  .title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 10px;
  }
  .bold-text {
    font-weight: 500;
  }
  .light-text {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
  }
  .el-row--flex {
    align-items: center;
    margin-bottom: 10px;
  }
  .red-text {
    color: #f5222d;
  }
  .green-text {
    color: #52c41a;
  }
  .chart-wrap {
    margin-top: 25px;
  }
}
</style>
