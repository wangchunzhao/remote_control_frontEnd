<template>
  <div class="energy_manage-panel energy_manage-analyze-panel3">
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="title">分项用能多时段对比</span>
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
        <span style="padding-left: 25px; color: rgb(96, 98, 102);"
          >日期单位：</span
        >
        <DatePickerGroup
          :initTime="_dateFormat(new Date(), 'YYYY-MM-DD HH:mm')"
          value-format="YYYY-MM-DD"
          size="mini"
          :layout="['date', 'week', 'month', 'year']"
          @change="handleDateChange"
          @typeChange="handleDateTypeChange"
        >
          <template v-slot:datepickerLabel>
            <span style="color: rgb(96, 98, 102);padding: 0 10px 0 20px;"
              >添加日期对象:
            </span>
          </template>
        </DatePickerGroup>
        <el-link
          @click.native="handleTagAdd"
          :underline="false"
          type="primary"
          style="margin-left: 10px;font-size: 13px;font-weight: normal"
        >
          添加至选中
        </el-link>
      </div>
      <div>
        <el-link
          @click.native="() => $refs.branchManageDialog.openDialog()"
          type="primary"
          :underline="false"
        >
          <c-svg name="shezhi"></c-svg> 管理分项</el-link
        >
      </div>
    </div>
    <div style="padding: 15px 24px;">
      <span data-v-117500e1="" style="color: rgb(96, 98, 102); font-size: 12px;"
        >已选中日期：</span
      >
      <el-tag
        v-for="(item, index) in filterForm.dates"
        size="mini"
        :key="item.StartDate"
        closable
        @close="() => handleTagRemove(index)"
      >
        {{
          'date' === item.dateType
            ? item.StartDate
            : item.StartDate + ' 至 ' + item.EndDate
        }}
      </el-tag>
    </div>
    <div v-loading="loading">
      <div
        class="chart-wrap"
        :style="{ height: wrapHeight + 'px' }"
        :id="chartWrapId"
        v-nodata="isNoData"
        v-show="model === 'chart'"
      ></div>
      <div
        v-show="model === 'table'"
        :style="{ height: wrapHeight + 'px' }"
        v-nodata="isNoData"
        class="table-wrap"
      >
        <el-table
          :data="tableData"
          style="width: 100%"
          empty-text=" "
          :height="wrapHeight - 40"
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
    <BranchManageDialog ref="branchManageDialog" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import uuidv1 from 'uuid/v1'
const chartWrapId = uuidv1()
import { getEnergyTimeContrastColumnare } from '@/api/energyStatistical'
import DatePickerGroup from '../../component/DatePickerGroup'
import BranchManageDialog from '../../component/BranchManageDialog'
import { checkPermission } from '@/utils/permissions'

export default {
  components: {
    DatePickerGroup,
    BranchManageDialog
  },
  data() {
    return {
      model: 'chart',
      filterForm: {
        deviceIds: void 0,
        dateType: 'date',
        dates: []
      },
      isNoData: false,
      loading: false,
      wrapHeight: 280,
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
                  name: '分项用能多时段对比'
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
          type: 'scroll',
          top: 25,
          left: 35,
          right: 100,
          bottom: 40,
          containLabel: !0
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
          axisLabel: {
            formatter: e => {
              var a = e.split('至')
              a[0] = this._dateFormat(a[0], 'MM-DD')
              a[2] = this._dateFormat(a[1], 'MM-DD')
              a[1] = '至'
              return a.join('\n')
            }
          },
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
    'filterForm.dates'(val) {
      // 动态修改图表高度
      if (val.length < 5) {
        this.wrapHeight = 280
      } else {
        this.wrapHeight = 280 + (val.length - 4) * 60
      }
      this.$nextTick(() => {
        this.chart.resize({ height: this.wrapHeight })
      })
    }
  },
  mounted() {
    this.filterForm.deviceIds = this.structTree
      .find(v => '电量' === v.Name)
      .ModelTreeList.filter(v => v.IsSummary !== 1)
      .map(v => v.ModelTreeId)
    this.isNoData = true
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
          filename: '分项用能多时段对比',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    },
    handleDateChange({ startDate, endDate, dateType }) {
      if (startDate) {
        this.filterForm.dateType = dateType
        this.tempDate = {
          StartDate: startDate,
          dateType: dateType,
          EndDate: endDate
        }
      }
    },
    handleDateTypeChange() {
      this.options.series = []
      this.tableData = []
      this.tableCols = []
      this.filterForm.dates = []
    },
    handleTagRemove(t) {
      this.filterForm.dates.splice(t, 1)
      if (!this.filterForm.dates.length) {
        this.tableData = []
        this.tableCols = []
        this.options.series = []
        return
      }

      if (this.filterForm.dates.length && this.filterForm.deviceIds.length) {
        this.fetchChartData()
      }
    },
    handleTagAdd: function() {
      var t = this.filterForm.dates.map(function(t) {
        return ''.concat(t.StartDate, '至').concat(t.EndDate)
      })
      t.includes(
        ''.concat(this.tempDate.StartDate, '至').concat(this.tempDate.EndDate)
      ) || (this.filterForm.dates.push(this.tempDate), this.fetchChartData())
    },
    initCharts() {
      this.chart = echarts.init(document.getElementById(chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchChartData: debounce(
      function() {
        const { dateType, deviceIds, dates } = this.filterForm
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
        getEnergyTimeContrastColumnare({
          dateType:
            'date' === dateType
              ? 1
              : 'week' === dateType
              ? 2
              : 'month' === dateType
              ? 3
              : 4,
          timeQuantumList: dates,
          modelTreeIdList: deviceIds
        })
          .then(res => {
            if (dateType === this.filterForm.dateType)
              if (200 === res.data.Code) {
                this.isNoData = false
                var data = res.data.Data
                let tableCols = ['日期']
                data.Data.forEach(item => {
                  tableCols.push(item.name)
                  item.stack = '总量'
                  item.barMaxWidth = 40
                  item.label = {
                    normal: {
                      show: !0,
                      position: 'insideRight'
                    }
                  }
                })

                this.options.series = data.Data

                let yAxisData = dates.map(function(t) {
                  return ''.concat(t.StartDate, '至').concat(t.EndDate)
                })
                this.options.yAxis.data = yAxisData
                this.options.xAxis.name =
                  data.UnitAndDescription.UnitDesc +
                  '/' +
                  data.UnitAndDescription.Unit

                // #region 构建表格数据 start
                this.tableCols = tableCols
                let tableData = []
                yAxisData.forEach(function(y, index) {
                  var a = {
                    日期: y
                  }
                  data.Data.forEach(function(t) {
                    a[t.name] = t.data[index]
                  })
                  tableData.push(a)
                }),
                  (this.tableData = tableData)
                // #endregion 构建表格数据 end
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
            dateType === this.filterForm.dateType && (this.loading = false)
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
.energy_manage-analyze-panel3 {
  .panel-header-left {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .table-wrap {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 20px 30px;
  }

  .el-tag--mini {
    margin-bottom: 10px;
  }

  .el-tag--mini + .el-tag--mini {
    margin-left: 10px;
  }
}
</style>
