<template>
  <div class="energy_manage-panel energy_manage-preview-panel3">
    <div class="panel-header">
      <div>
        <span class="title">日用电负荷</span>
        <el-link
          @click.native="() => (model = 'chart')"
          :underline="false"
          :type="model === 'chart' ? 'primary' : undefined"
          style="margin-left: 10px;"
        >
          <c-svg name="linechart" style="font-size: 17px;" />
        </el-link>
        <el-link
          @click.native="() => (model = 'table')"
          :underline="false"
          :type="model === 'table' ? 'primary' : undefined"
          style="margin-left: 10px;"
        >
          <c-svg name="table1" style="font-size: 17px;" />
        </el-link>
      </div>
      <div></div>
    </div>
    <div v-loading="loading">
      <div
        v-show="model === 'chart'"
        v-nodata="isNoData"
        :id="chartWrapId"
        class="chart-wrap"
      ></div>
      <div v-show="model === 'table'" v-nodata="isNoData" class="table-wrap">
        <el-table
          empty-text=" "
          :data="tableData"
          style="width: 100%"
          height="270"
        >
          <el-table-column
            v-for="(item, index) in tableCols"
            :prop="item"
            :label="item"
            :key="item + index"
          >
          </el-table-column>
        </el-table>
        <el-link
          :underline="false"
          @click.native="handleExportExcel"
          v-permission="[121]"
          class="table-download-btn"
        >
          <c-svg name="xiazai1"></c-svg>
        </el-link>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import dayjs from 'dayjs'
import uuidv1 from 'uuid/v1'
const chartWrapId = uuidv1()
import { getEnergyPowerBrokenLine } from '@/api/energyStatistical'
import { checkPermission } from '@/utils/permissions'

let xAxisData = []
for (let i = 0; i < 24; i++) {
  ;['00', '15', '30', '45'].forEach(item => {
    xAxisData.push(`${i < 10 ? '0' + i : i}:${item}`)
  })
}
xAxisData = [...xAxisData, ['00:00']]

export default {
  data() {
    return {
      model: 'chart',
      loading: false,
      isNoData: false,
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
          type: 'scroll',
          padding: [0, 50],
          itemGap: 20,
          itemHeight: 10,
          itemWidth: 10,
          bottom: 5
        },
        toolbox: {
          feature: (() => {
            if (checkPermission([121])) {
              return {
                saveAsImage: {
                  name: '日用电负荷'
                }
              }
            } else {
              return {}
            }
          })(),
          right: 0,
          bottom: 0
        },
        grid: {
          top: 45,
          left: 35,
          right: 40,
          bottom: 40,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#f5f5f5']
            }
          },
          axisLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '负荷/kW',
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
        series: [
          {
            name: '今日',
            type: 'line',
            symbol: 'circle',
            markPoint: {
              data: [
                {
                  type: 'max',
                  name: '最大值'
                }
              ]
            },
            data: [120, 132, 101, 134, 90, 230, 2100]
          },
          {
            name: '咋天',
            type: 'line',
            symbol: 'rect',
            markPoint: {
              data: [
                {
                  type: 'max',
                  name: '最大值'
                }
              ]
            },
            data: [220, 182, 191, 234, 290, 330, 310]
          }
        ]
      },
      tableData: [],
      tableCols: [],
      chartWrapId
    }
  },
  computed: {
    sidebarStatus() {
      return this.$store.state.app.sidebar
    },
    structTree() {
      return this.$store.state.energy.energyStruct
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  watch: {
    projectId() {
      // this.fetchChartData()
    },
    'filterForm.branchId'(val) {
      this.filterForm.deviceIds = this.structTree
        .find(item => {
          return item.SubentryId === val
        })
        .ModelTreeList.map(item => {
          return item.ModelTreeId
        })
      this.fetchChartData()
    },
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
    }
  },
  mounted() {
    this.initCharts()
    this.fetchChartData()
    window.addEventListener('resize', () => {
      if (this.model === 'chart') {
        this.chart.resize()
      }
    })
  },
  methods: {
    handleExportExcel() {
      import('@/utils/export2Excel').then(excel => {
        const tHeader = this.tableCols
        const data = this.formatJson(this.tableCols, this.tableData)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '日用电负荷',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    },
    initCharts() {
      this.chart = echarts.init(document.getElementById(chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchChartData: debounce(
      function() {
        const deviceIds = this.structTree
          .find(function(t) {
            return '电量' === t.Name
          })
          .ModelTreeList.map(function(t) {
            return t.ModelTreeId
          })

        if (!deviceIds.length) {
          this.options.series = []
          this.tableData = []
          this.tableCols = []
          this.isNoData = true
          return
        }
        this.loading = true
        getEnergyPowerBrokenLine({
          IsYesterday: true,
          startDate: dayjs()
            .startOf('day')
            .format('YYYY-MM-DD'),
          endDate: dayjs()
            .endOf('day')
            .add(1, 's')
            .format('YYYY-MM-DD'),
          modelTreeList: [
            {
              modelTreeName: '电量',
              modelTreeIdList: deviceIds
            }
          ]
        })
          .then(res => {
            if (200 === res.data.Code) {
              this.isNoData = false
              const data = res.data.Data
              this.options.series = data.DataList
              this.$store.commit('UPDATE_PREVIEW_DATA', {
                todayElectricityLoad: data.Total
              })
              let tableCols = ['时间']
              let tableData = []
              data.DataList.forEach(t => {
                tableCols.push(t.name)
              }),
                xAxisData.forEach((t, index) => {
                  var temp = {
                    时间: t
                  }
                  data.DataList.forEach(t => {
                    temp[t.name] = null === t.data[index] ? '-' : t.data[index]
                  }),
                    tableData.push(temp)
                })
              this.tableData = tableData
              this.tableCols = tableCols
            } else {
              this.isNoData = true
              this.options.series = []
              this.tableData = []
              this.tableCols = []
              this.$message.error('数据获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.isNoData = true
            this.options.series = []
            this.tableData = []
            this.tableCols = []
            this.$message.error('数据获取失败')
          })
          .finally(() => {
            this.loading = false
          })
      },
      1000,
      {
        leading: true
      }
    ),
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          return v[j]
        })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.energy_manage-preview-panel3 {
  .chart-wrap {
    height: 320px;
  }
  .table-wrap {
    position: relative;
    box-sizing: border-box;
    height: 320px;
    padding: 20px 30px;
    .table-download-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      .icon {
        font-size: 16px;
      }
    }
  }
}
</style>
