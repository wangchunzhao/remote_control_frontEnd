<template>
  <div class="energy_manage-panel energy_manage-analyze-panel4">
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="title">支路用能多时段对比</span>
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
          <c-svg name="table1" style="font-size: 17px" />
        </el-link>
        <el-cascader
          :options="structTree"
          ref="cascader"
          clearable
          filterable
          size="mini"
          style="margin-left: 20px;"
          :props="{
            multiple: true,
            children: 'ChildrenList',
            label: 'Name',
            value: 'SubentryId'
          }"
          collapse-tags
          @visible-change="handleBranchVisible"
        >
          <template slot-scope="{ node, data }">
            <c-svg
              v-if="data.IsSubentry"
              style="color: #909399; margin-right: 5px"
              name="folder-open-fill"
            ></c-svg>
            <span>{{ data.Name }}</span>
            <c-svg
              v-if="data.IsSummary"
              style="color: #909399; margin-left: 5px"
              name="zong"
            ></c-svg> </template
        ></el-cascader>
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
      <div class="chart-wrap" v-show="model === 'chart'">
        <div v-nodata="isNoData" :id="chartWrapId" class="chart"></div>
        <div class="chart-desc thin-scroll">
          <div
            v-for="(item, index) in options.series"
            :key="item.name + index"
            class="desc-item"
          >
            <div>
              {{
                filterForm.dates && filterForm.dates.length
                  ? 'date' === filterForm.dates[index].dateType
                    ? filterForm.dates[index].StartDate
                    : filterForm.dates[index].StartDate +
                      ' 至 ' +
                      filterForm.dates[index].EndDate
                  : ''
              }}
              总用量
            </div>
            <div>
              <span class="desc-blod">{{ item.Total }}</span> {{ item.unit }}
            </div>
          </div>
        </div>
      </div>
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
import uuidv1 from 'uuid/v1'
const chartWrapId = uuidv1()
import { getEnergyTimeContrastBrokenLine } from '@/api/energyStatistical'
import DatePickerGroup from '../../component/DatePickerGroup'
import { checkPermission } from '@/utils/permissions'

export default {
  components: {
    DatePickerGroup
  },
  data() {
    return {
      model: 'chart',
      filterForm: {
        deviceIds: [],
        dateType: '',
        dates: []
      },
      isNoData: false,
      loading: false,
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
                  name: '支路用能多时段对比'
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
    }
  },
  watch: {
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
          filename: '支路用能多时段对比',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    },
    handleBranchVisible: function(t) {
      if (t) return
      var checkedNodes = this.$refs.cascader.getCheckedNodes()
      if (checkedNodes.length) {
        var checkedNodeLevels = checkedNodes.map(item => {
          return item.level
        })
        const maxLevel = checkedNodeLevels.sort((t, e) => {
          return t - e
        })[0]

        const deviceIds = []
        checkedNodes.forEach(item => {
          if (item.level === maxLevel) {
            if (item.data.IsSubentry) {
              deviceIds.push(
                ...item.data.ModelTreeList.map(item => {
                  return item.ModelTreeId
                })
              )
            } else {
              deviceIds.push(item.data.ModelTreeId)
            }
          }
        })
        if (!deviceIds.length) {
          this.$message('选中的节点下面没有设备，无法查询')
          this.isNoData = true
          this.tableData = []
          this.tableCols = []
          this.chart.clear()
          return
        }
        this.filterForm.deviceIds = deviceIds
        this.filterForm.dates.length && this.fetchChartData()
      } else {
        this.filterForm.deviceIds = []
      }
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
    handleTagAdd() {
      var t = this.filterForm.dates.map(function(t) {
        return ''.concat(t.StartDate, '至').concat(t.EndDate)
      })
      t.includes(
        ''.concat(this.tempDate.StartDate, '至').concat(this.tempDate.EndDate)
      ) ||
        (this.filterForm.dates.push(this.tempDate),
        this.filterForm.deviceIds.length && this.fetchChartData())
    },
    initCharts() {
      this.chart = echarts.init(document.getElementById(chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchChartData: debounce(
      function() {
        if (!this.isSignBranch()) {
          this.$message('只能选择属于同一类型的支路进行对比')
          return false
        }
        const { dateType, deviceIds, dates } = this.filterForm
        if (!deviceIds.length) {
          this.$message('选中的分项下面没有设备，无法查询')
          this.isNoData = true
          this.options.series = []
          this.tableData = []
          this.tableCols = []
          return
        }
        this.loading = true
        getEnergyTimeContrastBrokenLine({
          dateType:
            'date' === dateType
              ? 1
              : 'week' === dateType
              ? 2
              : 'month' === dateType
              ? 3
              : 4,
          timeQuantumList: dates,
          modelTreeIdList: deviceIds,
          isGetSummary: true
        })
          .then(res => {
            if (dateType === this.filterForm.dateType)
              if (200 === res.data.Code) {
                this.isNoData = false
                var data = res.data.Data
                let tableCols = ['时间']
                data.DataList.forEach(item => {
                  tableCols.push(item.name)
                  item.type = 'line'
                  item.areaStyle = {}
                  item.unitDesc = data.UnitAndDescription.UnitDesc
                  item.unit = data.UnitAndDescription.Unit
                })

                this.options.series = data.DataList
                this.options.xAxis.data = data.XNameList
                this.options.yAxis.name =
                  data.UnitAndDescription.UnitDesc +
                  '/' +
                  data.UnitAndDescription.Unit

                // #region 构建表格数据 start
                this.tableCols = tableCols
                var tableData = []
                data.XNameList.forEach(function(x, index) {
                  var temp = {
                    时间: x
                  }
                  data.DataList.forEach(item => {
                    temp[item.name] =
                      null === item.data[index] ? '-' : item.data[index]
                  })
                  tableData.push(temp)
                })
                this.tableData = tableData
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
    },
    isSignBranch() {
      let checkedNodes = this.$refs.cascader.getCheckedNodes()
      let rootIds = []

      // 查找选中节点的根节点
      checkedNodes.forEach(node => {
        let nodeTemp = node
        while (nodeTemp.parent) {
          nodeTemp = nodeTemp.parent
        }
        rootIds.push(nodeTemp.data.SubentryId)
      })
      if ([...new Set(rootIds)].length === 1) {
        return true
      } else {
        console.log(false)
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.energy_manage-analyze-panel4 {
  .panel-header-left {
    display: flex;
    align-items: center;
  }
  .chart-wrap {
    display: flex;
  }
  .chart {
    flex: 1;
    height: 300px;
  }
  .chart-desc {
    flex: 0 0 200px;
    height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .chart-desc .desc-item {
    line-height: 20px;
    margin-bottom: 25px;
    color: #606266;
  }
  .chart-desc .desc-blod {
    font-weight: 500;
    font-size: 20px;
    color: #000;
  }
  .table-wrap {
    display: flex;
    box-sizing: border-box;
    height: 300px;
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
