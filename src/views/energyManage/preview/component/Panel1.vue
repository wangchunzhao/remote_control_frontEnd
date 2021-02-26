<template>
  <div class="energy_manage-panel energy_manage-preview-panel1">
    <div class="panel-header">
      <div>
        <span class="title">日用能趋势</span>
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
          style="margin-left: 10px;    color: #BFBFBF;"
        >
          <c-svg name="table1" style="font-size: 17px;" />
        </el-link>
      </div>
      <div>
        <span class="desc"
          >今日用量<span class="desc-bold">{{ currentDayNum }}</span
          >{{ unitText }}</span
        ><span class="desc"
          >昨日用量<span class="desc-bold">{{ lastDayNum }}</span
          >{{ unitText }}</span
        >
      </div>
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
          :height="270"
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
          @click.native="handleExportExcel"
          :underline="false"
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
import { getEnergyTimeContrastBrokenLine } from '@/api/energyStatistical'
import { checkPermission } from '@/utils/permissions'

export default {
  data() {
    return {
      model: 'chart',
      filterForm: {
        branchId: undefined,
        deviceIds: []
      },
      isNoData: false,
      loading: false,
      currentDayNum: '-',
      lastDayNum: '-',
      unitText: '',
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
          feature: (() => {
            if (checkPermission([121])) {
              return {
                saveAsImage: {
                  name: '日用能趋势'
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
          data: [],
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
          name: '',
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
    this.filterForm.branchId = this.structTree.find(item => {
      return '电量' === item.Name
    }).SubentryId
    this.initCharts()
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
          filename: '日用能趋势',
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
        const { branchId, deviceIds } = this.filterForm
        if (!deviceIds.length) {
          this.$message('选中的分项下面没有设备，无法查询')
          this.isNoData = true
          // this.options.series = []
          this.tableData = []
          this.tableCols = []
          this.chart.clear()
          return
        }
        this.loading = true
        const dates = []
        const now = new Date()
        dates.push({
          StartDate: dayjs(now)
            .startOf('day')
            .format('YYYY-MM-DD'),
          EndDate: dayjs(now)
            .endOf('day')
            .add(1, 's')
            .format('YYYY-MM-DD')
        }),
          dates.push({
            StartDate: dayjs(now)
              .subtract(1, 'day')
              .startOf('day')
              .format('YYYY-MM-DD'),
            EndDate: dayjs(now)
              .startOf('day')
              .format('YYYY-MM-DD')
          }),
          getEnergyTimeContrastBrokenLine({
            dateType: 1,
            timeQuantumList: dates,
            modelTreeIdList: deviceIds
          })
            .then(res => {
              if (branchId === this.filterForm.branchId)
                if (200 === res.data.Code) {
                  this.isNoData = false
                  var data = res.data.Data,
                    s = ['时间']
                  data.DataList.forEach((item, index) => {
                    item.realName = item.name
                    s.push(item.name)
                    if (0 === index) {
                      item.name = '今日'
                      this.currentDayNum = item.Total
                      this.$store.commit('UPDATE_PREVIEW_DATA', {
                        todayElectricityUse: item.Total
                      })
                    } else {
                      item.name = '昨日'
                      this.lastDayNum = item.Total
                      this.$store.commit('UPDATE_PREVIEW_DATA', {
                        lastDayElectricityUse: item.Total
                      })
                    }

                    item.type = 'line'
                    item.areaStyle = {}
                    item.unitDesc = data.UnitAndDescription.UnitDesc
                    item.unit = data.UnitAndDescription.Unit
                  }),
                    (this.tableCols = s)
                  this.options.series = data.DataList
                  this.options.xAxis.data = data.XNameList
                  this.options.yAxis.name =
                    data.UnitAndDescription.UnitDesc +
                    '/' +
                    data.UnitAndDescription.Unit
                  this.unitText = data.UnitAndDescription.Unit
                  var tableData = []
                  data.XNameList.forEach((t, e) => {
                    var temp = {
                      时间: t
                    }
                    data.DataList.forEach(item => {
                      temp[item.realName] =
                        null === item.data[e] ? '-' : item.data[e]
                    })
                    tableData.push(temp)
                  })
                  this.tableData = tableData
                } else {
                  this.isNoData = false
                  this.options.series = []
                  this.tableData = []
                  this.tableCols = []
                  this.$message.error('数据获取失败')
                }
            })
            .catch(err => {
              this.isNoData = true
              console.error(err)
              this.$message.error('数据获取失败')
            })
            .finally(() => {
              branchId === this.filterForm.branchId && (this.loading = false)
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
.energy_manage-preview-panel1 {
  .chart-wrap {
    height: 320px;
  }
  .table-wrap {
    position: relative;
    box-sizing: border-box;
    height: 320px;
    padding: 20px 30px;
  }
  .desc {
    padding-left: 25px;
    color: #BFBFBF;
    font-size: 14px;
  }
  .desc-bold {
    padding: 0 12px;
    font-size: 20px;
    font-weight: 500;
    color: #000;
  }
}
</style>
