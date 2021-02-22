<template>
  <div class="energy_manage-panel energy_manage-electricity-panel1">
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="title">负荷曲线</span>
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
        <el-cascader
          :options="structTree"
          ref="cascader"
          clearable
          :filterable="isAcrossProject ? false : true"
          size="mini"
          style="margin-left: 20px;"
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
            <span>{{ data.Name }}</span>
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
          :layout="['date', 'week', 'month']"
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
          :height="280"
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
          :underline="false"
          class="table-download-btn"
          v-permission="[121]"
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
import { getEnergyPowerBrokenLine } from '@/api/energyStatistical'
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
              isGetModelTree: true,
              // subentryId: 1 只获取电量类型
              subentryId: 1
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
        branchs: [],
        startDate: '',
        endDate: '',
        dateType: ''
      },
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
                  name: '负荷曲线'
                }
              }
            } else {
              return {}
            }
          })(),
          excludeComponents: ['dataZoom'],
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
        dataZoom: [
          {
            show: false,
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'empty',
            height: 15,
            handleIcon:
              'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '90%'
          }
        ],
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
          },
          axisLabel: {
            formatter: e => {
              return 'date' === this.filterForm.dateType
                ? this._dateFormat(e, 'HH:mm')
                : this._dateFormat(e, 'MM-DD HH:mm')
            }
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
        series: []
      },
      tableData: [],
      tableCols: [],
      chartWrapId
    }
  },
  computed: {
    project() {
      return this.$store.state.app.project
    },
    sidebarStatus() {
      return this.$store.state.app.sidebar
    },
    structTreeTemp() {
      return this.$store.state.energy.energyStruct.filter(t => {
        return '电量' === t.Name
      })
    },
    proList() {
      return this.$store.state.app.proList
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
        if ('date' !== this.filterForm.dateType) {
          val.dataZoom[0].show = true
        } else {
          val.dataZoom[0].show = false
        }
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
          filename: '负荷曲线',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    },
    handleBranchVisible(isVisible) {
      if (isVisible) return
      let checkedNodes = this.$refs.cascader.getCheckedNodes()

      if (checkedNodes.length) {
        let branchs = []

        checkedNodes.forEach(node => {
          let projectName = ''
          if (this.isAcrossProject) {
            const rootNode = this.getRootNode(node)
            if (rootNode) {
              projectName = rootNode.label
            }
          }
          if (node.data.nodeType !== 'projectNode') {
            if (node.data.IsSubentry) {
              branchs.push({
                modelTreeName: node.data.Name,
                modelTreeIdList: node.data.ModelTreeList.map(
                  item => item.ModelTreeId
                ),
                projectName
              })
            } else {
              branchs.push({
                modelTreeName: node.data.Name,
                modelTreeIdList: [node.data.ModelTreeId],
                projectName
              })
            }
          }
        })
        this.filterForm.branchs = branchs

        if (!branchs.length && checkedNodes.length) {
          this.$message('选中的节点下面没有设备，无法查询')
          this.isNoData = true
          this.options.series = []
          this.tableData = []
          this.tableCols = []
          return false
        }
        this.filterForm.startDate && this.fetchChartData()
      } else {
        this.filterForm.branchs = []
      }
    },
    handleDateChange({ startDate, endDate, dateType }) {
      this.filterForm.startDate = startDate
      this.filterForm.endDate = endDate
      this.filterForm.dateType = dateType
      this.filterForm.branchs.length && this.fetchChartData()
    },
    initCharts() {
      this.chart = echarts.init(document.getElementById(chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchChartData: debounce(
      function() {
        var t = this
        this.loading = true
        const { startDate, endDate, branchs } = this.filterForm
        getEnergyPowerBrokenLine({
          IsYesterday: false,
          startDate: startDate,
          endDate: endDate,
          modelTreeList: branchs
        })
          .then(res => {
            if (
              startDate === this.filterForm.startDate &&
              endDate === this.filterForm.endDate
            )
              if (200 === res.data.Code) {
                t.isNoData = false
                var data = res.data.Data
                this.options.series = data.DataList
                this.options.xAxis.data = data.TimeList
                var tableCols = ['时间']
                let tableData = []
                data.DataList.forEach(t => {
                  tableCols.push(t.name)
                })
                data.TimeList.forEach((v, index) => {
                  let temp = {
                    时间: v
                  }
                  data.DataList.forEach(vv => {
                    temp[vv.name] =
                      null === vv.data[index] ? '-' : vv.data[index]
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
    },
    getRootNode(node) {
      let nodeTemp = node
      while (nodeTemp.parent) {
        nodeTemp = nodeTemp.parent
      }
      return nodeTemp
    }
  }
}
</script>

<style lang="scss" scoped>
.energy_manage-electricity-panel1 {
  .panel-header-left {
    display: flex;
    align-items: center;
  }

  .chart-wrap {
    height: 320px;
  }

  .table-wrap {
    box-sizing: border-box;
    height: 320px;
    padding: 20px 30px;
  }
}
</style>
