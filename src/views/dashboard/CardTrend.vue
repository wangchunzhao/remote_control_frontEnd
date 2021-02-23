<template>
  <el-card shadow="never" class="box-card card-trend">
    <div slot="header" class="clearfix card-top">
      <div class="card-title">{{ dateType === 1 ? '日' : '月' }}用能趋势</div>
      <div style="flex:1">
        <el-radio-group v-model="dateType" size="mini" @change="fetchTableData">
          <el-radio-button :label="1">日</el-radio-button>
          <el-radio-button :label="3">月</el-radio-button>
        </el-radio-group>
      </div>
      <div class="card-title">
        {{ dateType === 1 ? '今日' : '本月' }}用量
        <span class="card-value">{{ currentNum }}</span>
        kwh
      </div>
      <div class="card-title">
        {{ dateType === 1 ? '今日' : '本月' }}指标消耗
        <span class="card-value">{{ currentPercent }}</span>
        %
      </div>
      <div class="card-title">
        {{ dateType === 1 ? '昨日' : '上月' }}用量
        <span class="card-value">{{ lastNum }}</span>
        kwh
      </div>
    </div>
    <div id="chart-wrap-JKNFJDSK" style="height: 270px" />
  </el-card>
</template>

<script>
import { checkPermission } from '@/utils/permissions'
import dayjs from 'dayjs'
import { getEnergyTimeContrastBrokenLine } from '@/api/energyStatistical'
export default {
  data() {
    return {
      branchId: undefined,
      deviceIds: [],
      dateType: 3, //时间类型 1：日 2：周 3：月
      currentNum: '-', //本用电量
      currentPercent: '-', //消耗指标
      lastNum: '-', //上次用电量
      chartOptions: {
        color: ['#1878ff', '#1cbe24'],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: [],
          bottom: 15
        },
        grid: {
          left: 60,
          right: 40,
          top: 40,
          bottom: 40,
          containLabel: true
        },
        toolbox: {
          feature: (() => {
            if (checkPermission([212])) {
              return {
                saveAsImage: {
                  name: '用能趋势'
                }
              }
            } else {
              return {}
            }
          })(),
          bottom: 15,
          right: 0
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          splitLine: {
            show: true,
            lineStyle: {
              type: 'solid',
              color: '#F7F7F7'
            }
          },
          axisLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '用电量/kWh',
          splitLine: {
            lineStyle: {
              type: 'solid',
              color: '#F7F7F7'
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#333'
            }
          },
          nameTextStyle: {
            color: '#999'
          },
          splitArea: {
            show: false
          }
        },
        series: [
          {
            name: '8日',
            type: 'line',
            data: [],
            smooth: true,
            areaStyle: {}
          },
          {
            name: '9日',
            type: 'line',
            data: [],
            smooth: true,
            areaStyle: {}
          }
        ]
      },
      dayxAxis: [
        '0:00',
        '1:00',
        '2:00',
        '3:00',
        '4:00',
        '5:00',
        '6:00',
        '7:00',
        '8:00',
        '9:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00'
      ]
    }
  },
  computed: {
    company() {
      return this.$store.state.app.company
    },
    project() {
      return this.$store.state.app.project
    },
    structTree() {
      return this.$store.state.energy.energyStruct
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById('chart-wrap-JKNFJDSK'))
    this.chart.showLoading({
      color: '#1890ff'
    })
    this.branchId = this.structTree.find(item => {
      return '电量' === item.Name
    }).SubentryId
    this.deviceIds = this.structTree
      .find(item => {
        return item.SubentryId === this.branchId
      })
      .ModelTreeList.map(item => {
        return item.ModelTreeId
      })
    this.currentPercent =
      this.deviceIds.length && this.deviceIds[dayjs().month() + 1].Ratio
        ? this.deviceIds[dayjs().month() + 1].Ratio.replace('%', '')
        : '-'
    window.addEventListener('resize', this.chart.resize)
    this.fetchTableData()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.chart.resize)
  },
  methods: {
    //获取数据
    fetchTableData() {
      const dates = []
      const now = new Date()
      if (this.dateType === 1) {
        dates.push({
          StartDate: dayjs(now)
            .startOf('day')
            .format('YYYY-MM-DD'),
          EndDate: dayjs(now)
            .endOf('day')
            .add(1, 's')
            .format('YYYY-MM-DD')
        })
        dates.push({
          StartDate: dayjs(now)
            .subtract(1, 'day')
            .startOf('day')
            .format('YYYY-MM-DD'),
          EndDate: dayjs(now)
            .startOf('day')
            .format('YYYY-MM-DD')
        })
      } else {
        dates.push({
          StartDate: dayjs(now)
            .startOf('month')
            .format('YYYY-MM-DD'),
          EndDate: dayjs(now)
            .endOf('month')
            .add(1, 's')
            .format('YYYY-MM-DD')
        })
        dates.push({
          StartDate: dayjs(now)
            .subtract(1, 'month')
            .startOf('month')
            .format('YYYY-MM-DD'),
          EndDate: dayjs(now)
            .startOf('month')
            .format('YYYY-MM-DD')
        })
      }

      getEnergyTimeContrastBrokenLine({
        dateType: this.dateType,
        timeQuantumList: dates,
        modelTreeIdList: this.deviceIds
      })
        .then(res => {
          if (200 === res.data.Code) {
            let data = res.data.Data
            data.DataList.forEach((item, index) => {
              item.realName = item.name
              if (0 === index) {
                item.name = this.dateType === 1 ? '今日' : '本月'
                this.currentNum = item.Total
              } else {
                item.name = this.dateType === 1 ? '昨日' : '上月'
                this.lastNum = item.Total
              }

              item.type = 'line'
              item.areaStyle = {}
              item.unitDesc = data.UnitAndDescription.UnitDesc
              item.unit = data.UnitAndDescription.Unit
            })
            this.chartOptions.toolbox.feature = (() => {
              if (checkPermission([212])) {
                return {
                  saveAsImage: {
                    name: this.dateType === 1 ? '日用能趋势' : '月用能趋势'
                  }
                }
              } else {
                return {}
              }
            })()
            this.chartOptions.series[0].data = data.DataList[0].data
            this.chartOptions.series[0].name = data.DataList[0].name
            this.chartOptions.legend.data[0] = data.DataList[0].name
            this.chartOptions.legend.data[1] = data.DataList[1].name
            this.chartOptions.series[1].data = data.DataList[1].data
            this.chartOptions.series[1].name = data.DataList[1].name
            this.chartOptions.xAxis.data = data.XNameList
            this.chartOptions.yAxis.name =
              this.dateType === 1 ? '日用电量/kWh' : '月用电量/kWh'
          } else {
            this.chartOptions.series = []
            // this.$message.error('数据获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          // this.$message.error('数据获取失败')
        })
        .finally(() => {
          this.chart.setOption(this.chartOptions)
          this.chart.hideLoading()
          this.chart2_1Loading = false
        })
    }
  }
}
</script>

<style lang="scss">
.card-trend {
  height: 330px;
  .el-card__header {
    border-bottom: none;
  }
  .card-title {
    margin-right: 10px;
  }
  .el-card__body {
    padding: 0;
  }
}
</style>
<style lang="scss" scoped>
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
