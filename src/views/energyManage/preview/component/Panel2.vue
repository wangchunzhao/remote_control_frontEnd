<template>
  <div class="energy_manage-panel energy_manage-preview-panel2">
    <div class="panel-header">
      <div>
        <span class="title">分组用能日占比</span>
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
          style="margin-left: 10px"
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
        <el-table empty-text=" " :data="tableData" style="width: 100%">
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
          v-permission="[121]"
          @click.native="handleExportExcel"
          class="table-download-btn"
        >
          <c-svg name="xiazai1"></c-svg>
        </el-link>
      </div>
    </div>
    <BranchManageDialog ref="branchManageDialog" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import dayjs from 'dayjs'
import uuidv1 from 'uuid/v1'
const chartWrapId = uuidv1()
import { getEnergyTimeContrastColumnare } from '@/api/energyStatistical'
import BranchManageDialog from '../../component/BranchManageDialog'
import { checkPermission } from '@/utils/permissions'

export default {
  components: {
    BranchManageDialog
  },
  data() {
    return {
      model: 'chart',
      loading: false,
      filterForm: {
        branchId: undefined,
        deviceIds: []
      },
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
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
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
          right: 100,
          bottom: 40,
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '',
          boundaryGap: false,
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
          type: 'category',
          data: [],
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
          filename: '日用电分项',
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
          this.options.series = []
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
          getEnergyTimeContrastColumnare({
            dateType: 1,
            timeQuantumList: dates,
            modelTreeIdList: deviceIds
          })
            .then(res => {
              if (branchId === this.filterForm.branchId)
                if (200 === res.data.Code) {
                  this.isNoData = false
                  const data = res.data.Data
                  let tableCols = ['时间']
                  data.Data.forEach(item => {
                    tableCols.push(item.name)
                    item.stack = '总量'
                    item.barMaxWidth = 40
                    item.label = {
                      normal: {
                        show: true,
                        position: 'insideRight'
                      }
                    }
                  })

                  this.tableCols = tableCols
                  this.options.series = data.Data
                  this.options.yAxis.data = dates.map((t, e) => {
                    return 0 === e ? '今日' : '昨日'
                  })
                  this.options.xAxis.name =
                    data.UnitAndDescription.UnitDesc +
                    '/' +
                    data.UnitAndDescription.Unit

                  let tableData = []
                  let o = dates.map(t => {
                    return ''.concat(t.StartDate, '至').concat(t.EndDate)
                  })
                  o.forEach(function(t, e) {
                    var temp = {
                      时间: t
                    }
                    data.Data.forEach(function(t) {
                      temp[t.name] = t.data[e]
                    }),
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
              this.options.series = []
              this.tableData = []
              this.tableCols = []
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
.energy_manage-preview-panel2 {
  .chart-wrap {
    height: 280px;
  }
  .table-wrap {
    position: relative;
    box-sizing: border-box;
    height: 280px;
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
  .desc {
    padding-left: 25px;
  }
  .desc-bold {
    padding: 0 5px;
    font-size: 18px;
    font-weight: 500;
  }
}
</style>
