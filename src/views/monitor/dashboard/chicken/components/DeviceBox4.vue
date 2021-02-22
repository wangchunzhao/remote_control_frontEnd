<template>
  <div class="dashboardChicken-box-SKDJF0392KJSDHF32 box-style">
    <div class="title">存栏鸡只</div>
    <el-row :gutter="20" type="flex">
      <el-col :span="12">
        <span style="font-size: 24px;margin-right: 5px;" class="bold-text">
          {{ typeof data.TodayValue === 'number' ? data.TodayValue : '-' }}
        </span>
      </el-col>
      <el-col :span="12">
        <span class="light-text">今日死淘</span>
        <span style="margin: 0 5px;" class="bold-text">
          {{
            typeof data.ToDayDeadAmoy === 'number' ? data.ToDayDeadAmoy : '-'
          }}
        </span>
      </el-col>
    </el-row>
    <el-row :gutter="20" type="flex">
      <el-col :span="24">
        <span class="light-text">累计死淘率</span>
        <span style="margin: 0 4px;" class="bold-text">
          {{ typeof data.Mortality === 'number' ? data.Mortality : '-' }}%
        </span>
      </el-col>
    </el-row>
    <div
      class="chart-wrap"
      style="height: 100px"
      v-nodata="isEmpty"
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
      isEmpty: false,
      data: {},
      options: {
        grid: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          // boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
          {
            data: [],
            type: 'bar',
            itemStyle: {
              color: '#40A9FF'
            }
          }
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
        queryPoint: '存栏鸡只'
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
        queryPoint: '存栏鸡只'
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          this.options.xAxis.data = data.x
          this.options.series[0].data = data.y
          if (!data.y.length) {
            this.isEmpty = true
          }
        }
      })
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
