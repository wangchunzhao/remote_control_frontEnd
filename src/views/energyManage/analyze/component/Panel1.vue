<template>
  <div class="energy_manage-panel energy_manage-analyze-panel1">
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="title">支路能耗趋势对比</span>
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
        <span style="color: rgb(96, 98, 102);padding: 0 10px 0 20px;"
          >用能支路:
        </span>
        <el-cascader
          :options="structTree"
          ref="cascader"
          clearable
          :filterable="isAcrossProject ? false : true"
          size="mini"
          :props="cascaderProps"
          collapse-tags
          @visible-change="handleBranchVisible"
        >
          <template slot-scope="{ node, data }">
            <c-svg
              v-if="data.IsSubentry"
              style="color: #909399; margin-right: 5px"
              name="folder-open-fill"
            ></c-svg>
            <span
              :class="[
                data.nodeType === 'projectNode' ? 'project-node-SJHDF9823' : ''
              ]"
              >{{ data.Name }}</span
            >
            <c-svg
              v-if="data.IsSummary"
              style="color: #909399; margin-left: 5px"
              name="zong"
            ></c-svg> </template
        ></el-cascader>
        <span style="color: rgb(96, 98, 102);padding: 0 10px;">跨项目对比</span>
        <el-switch v-model="isAcrossProject"> </el-switch>
        <span style="padding-left: 25px; color: rgb(96, 98, 102);"
          >日期范围：</span
        >
        <DatePickerGroup
          :initTime="_dateFormat(new Date(), 'YYYY-MM-DD HH:mm')"
          value-format="YYYY-MM-DD"
          size="mini"
          :layout="['date', 'week', 'month', 'year', 'daterange']"
          @change="handleDateChange"
        >
        </DatePickerGroup>
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
          :height="315"
        >
          <el-table-column
            v-for="(item, index) in tableCols"
            min-width="120"
            :prop="item"
            :label="item"
            :key="item + index"
          >
          </el-table-column>
        </el-table>
        <el-link
          @click.native="handleExportExcel"
          v-permission="[121]"
          :underline="false"
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
import { getEnergyContrastColumnare } from '@/api/energyStatistical'
import DatePickerGroup from '../../component/DatePickerGroup'
import { checkPermission } from '@/utils/permissions'
import { getSubentryTree } from '@/api/subentry'

function walk(arr) {
  arr.forEach(item => {
    item.ChildrenList && item.ChildrenList.length
      ? walk(item.ChildrenList)
      : delete item.ChildrenList
  })
}

export default {
  components: {
    DatePickerGroup
  },
  data() {
    return {
      isAcrossProject: false,
      cascaderProps: {
        multiple: true,
        children: 'ChildrenList',
        label: 'Name',
        value: 'SubentryId',
        lazy: false,
        lazyLoad: (node, resolve) => {
          if (node.level === 1) {
            getSubentryTree({
              companyId: this.$store.state.app.company.id,
              projectId: node.value,
              isGetModelTree: true
            })
              .then(res => {
                if (200 === res.data.Code) {
                  // 目前只要做了电量的
                  let data = res.data.Data
                  walk(data)
                  resolve(data)
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            resolve()
          }
        }
      },
      structTree: [],
      model: 'chart',
      filterForm: {
        branchIds: [],
        startDate: '',
        endDate: '',
        dateType: 'date'
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
                  name: '支路能耗趋势对比'
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
    proList() {
      return this.$store.state.app.proList
    },
    sidebarStatus() {
      return this.$store.state.app.sidebar
    },
    structTreeTemp() {
      return this.$store.state.energy.energyStruct
    },
    companyId() {
      return this.$store.state.app.company.id
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
    structTreeTemp: {
      handler: function(val) {
        this.structTree = val
      },
      immediate: true
    },
    isAcrossProject(val) {
      if (val) {
        let options = []
        this.proList.forEach(v => {
          options.push({
            Name: v.label,
            SubentryId: v.id,
            ChildrenList: [],
            nodeType: 'projectNode'
          })
        })
        this.cascaderProps.lazy = true
        this.structTree = options
      } else {
        this.cascaderProps.lazy = false
        this.structTree = this.structTreeTemp
      }
    }
  },
  mounted() {
    this.isNoData = true
    this.initCharts()
    window.addEventListener('resize', this.chart.resize)
  },
  methods: {
    handleExportExcel() {
      import('@/utils/export2Excel').then(excel => {
        const tHeader = this.tableCols
        const data = this.formatJson(this.tableCols, this.tableData)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '支路能耗趋势对比',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    },
    handleBranchVisible(isVisible) {
      if (isVisible) return
      // 获取选中的设备节点
      let checkedNodes = this.$refs.cascader.getCheckedNodes()
      if (!checkedNodes.length) {
        return
      }
      if (
        !checkedNodes.every(v => {
          if (v.data.TopSubentryId === checkedNodes[0].data.TopSubentryId) {
            return true
          }
          return false
        })
      ) {
        this.$notify.info({
          title: '消息',
          duration: 10000,
          offset: 70,
          message:
            '不支持不同类型支路的对比，如：电量下的 A 支路不可以和燃气量下的 B 支路对比'
        })
        return
      }
      let nodes = checkedNodes.filter(item => !item.data.IsSubentry)
      if (nodes.length) {
        let branchIds = []
        nodes.forEach(item => {
          branchIds.push(item.data.ModelTreeId)
        })
        if (!branchIds.length) {
          this.$message('选中的节点下面没有设备，无法查询')
          this.isNoData = true
          this.tableData = []
          this.tableCols = []
          this.chart.clear()
          return
        }
        this.filterForm.branchIds = branchIds
        this.filterForm.startDate.length && this.fetchChartData()
      } else {
        this.filterForm.branchIds = []
      }
    },
    handleDateChange({ startDate, endDate, dateType }) {
      this.filterForm.startDate = startDate
      this.filterForm.endDate = endDate
      this.filterForm.dateType = dateType
      this.filterForm.branchIds.length && this.fetchChartData()
    },
    initCharts() {
      this.chart = echarts.init(document.getElementById(chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchChartData: debounce(
      function() {
        const { dateType, branchIds, startDate, endDate } = this.filterForm
        if (!branchIds.length) {
          this.$message('选中的分项下面没有设备，无法查询')
          this.isNoData = true
          this.options.series = []
          this.tableData = []
          this.tableCols = []
          return
        }
        this.loading = true
        getEnergyContrastColumnare({
          dateType:
            'date' === dateType
              ? 1
              : 'week' === dateType
              ? 2
              : 'month' === dateType
              ? 3
              : 'year' === dateType
              ? 4
              : 5,
          startDate,
          endDate,
          modelTreeIdList: branchIds
        })
          .then(res => {
            if (
              startDate === this.filterForm.startDate &&
              endDate === this.filterForm.endDate &&
              dateType === this.filterForm.dateType
            )
              if (200 === res.data.Code) {
                this.isNoData = false
                var data = res.data.Data
                this.options.series = data.Data
                this.options.xAxis.data = data.Name
                this.options.yAxis.name =
                  data.UnitAndDescription.UnitDesc +
                  '/' +
                  data.UnitAndDescription.Unit
                // #region 构建表格数据 start
                let tabData = []
                let tableCols = ['时间']
                data.Data.forEach(v => {
                  tableCols.push(v.name)
                })
                data.Name.forEach((t, e) => {
                  let a = {
                    时间: t
                  }
                  data.Data.forEach(t => {
                    a[t.name] = null === t.data[e] ? '-' : t.data[e]
                  })
                  tabData.push(a)
                })
                this.tableData = tabData
                this.tableCols = tableCols
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
            if (
              startDate === this.filterForm.startDate &&
              endDate === this.filterForm.endDate &&
              dateType === this.filterForm.dateType
            ) {
              this.loading = false
            }
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
.energy_manage-analyze-panel1 {
  .panel-header-left {
    display: flex;
    align-items: center;
  }

  .chart-wrap {
    height: 350px;
  }

  .table-wrap {
    box-sizing: border-box;
    height: 350px;
    padding: 20px 30px;
  }
}
</style>

<style lang="scss"></style>
