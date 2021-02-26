<template>
  <div class="energy_manage-panel energy_manage-analyze-panel2">
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="title">支路用能排行</span>
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
          <c-svg name="table1" style="font-size: 17px;color: #BFBFBF;" />
        </el-link>

        <span style="color: rgb(96, 98, 102);padding: 0 10px 0 20px;"
          >能耗类型:
        </span>
        <el-select
          v-model="filterForm.branchId"
          size="mini"
          filterable
          style="width: 100px;"
          placeholder="请选择"
        >
          <el-option
            v-for="item in structTree"
            :key="item.SubentryId"
            :label="item.Name"
            :value="item.SubentryId"
          >
          </el-option>
        </el-select>

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
    <div class="chart-wrap" v-loading="loading">
      <div class="pie-chart-content">
        <div class="pie-chart" :id="pieChartWrapId"></div>
        <div style="color: rgb(96, 98, 102);">
          总用量
          <span
            data-v-76e4c912=""
            style="font-size: 20px; font-weight: bold; color: black;"
            >{{ totalNum }}</span
          >
          {{ unitText }}
        </div>
      </div>
      <div
        v-show="model === 'chart'"
        class="bar-chart-content"
        :id="barChartWrapId"
      ></div>
      <div v-show="model === 'table'" class="table-wrap">
        <el-table :data="tableData" style="width: 100%" :height="365">
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
const barChartWrapId = uuidv1()
const pieChartWrapId = uuidv1()
import { getEnergySubentryColumnare } from '@/api/energyStatistical'
import DatePickerGroup from '../../component/DatePickerGroup'
import BranchManageDialog from '../../component/BranchManageDialog'
import { checkPermission } from '@/utils/permissions'
import NP from 'number-precision'

export default {
  components: {
    DatePickerGroup,
    BranchManageDialog
  },
  data() {
    return {
      model: 'chart',
      filterForm: {
        branchId: undefined,
        startDate: '',
        endDate: '',
        dateType: 'date'
      },
      loading: false,
      totalNum: '-',
      unitText: '',
      pieSelectedState: {},
      pieOptions: {
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
        legend: {
          type: 'scroll'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        toolbox: {
          feature: (() => {
            if (checkPermission([121])) {
              return {
                saveAsImage: {
                  name: '支路用能排行'
                }
              }
            } else {
              return {}
            }
          })(),
          right: 0,
          bottom: 0
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: '80%',
            center: ['50%', '50%'],
            label: {
              normal: {
                formatter: '{b}',
                position: 'inside'
              }
            },
            selectedMode: 'single',
            data: [],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      },
      barOptions: {
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
        dataZoom: [
          {
            type: 'slider',
            height: 20,
            bottom: 10,
            show: false,
            startValue: 0,
            endValue: 40,
            zoomLock: true,
            handleSize: 0
          }
        ],
        legend: {
          show: false,
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
                  name: '支路用能排行'
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
            show: false,
            lineStyle: {
              color: ['#f5f5f5']
            }
          },
          axisLabel: {
            inside: true,
            textStyle: {
              color: '#dcdee2'
            },
            fontSize: 9,
            rotate: 90
          },
          axisLine: {
            show: false
          },
          z: 100
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
        series: [
          {
            name: '所有',
            type: 'bar',
            barMaxWidth: 40,
            data: []
          }
        ]
      },
      tableData: [],
      tableCols: ['支路', '用能'],
      barChartWrapId,
      pieChartWrapId
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
        this.barChart.resize()
      }, 500)
    },
    pieOptions: {
      handler: function(t) {
        this.pieChart.setOption(t, true)
      },
      deep: true
    },
    barOptions: {
      handler: function(t) {
        this.barChart.setOption(t, true)
      },
      deep: true
    },
    'filterForm.branchId'(val) {
      if (val) {
        this.totalNum = '-'
        this.unitText = ''
        const devices = this.structTree.find(function(e) {
          return e.SubentryId === val
        }).ModelTreeList
        if (devices.length) {
          this.fetchChartData()
        } else {
          this.$message('选中的分项下面没有设备，无法查询')
          this.barChart.clear()
          this.pieChart.clear()
        }
      }
    }
  },
  mounted() {
    this.filterForm.branchId = this.structTree[0].SubentryId
    this.initCharts()
    window.addEventListener('resize', () => {
      if (this.model === 'chart') {
        this.barChart.resize()
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
          filename: '支路用能排行',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    },
    handleDateChange({ startDate, endDate, dateType }) {
      this.filterForm.startDate = startDate
      this.filterForm.endDate = endDate
      this.filterForm.dateType = dateType
      this.filterForm.branchId && this.fetchChartData()
    },
    initCharts() {
      this.pieChart = echarts.init(document.getElementById(pieChartWrapId))
      this.pieChart.setOption(this.pieOptions)

      // 点击饼图触发
      this.pieChart.on('click', params => {
        let data = []
        if (this.barOptions.series[0].name === params.name) {
          // 取消饼图中的选中项
          this.pieOptions.series[0].data.forEach(item => {
            if (this.pieSelectedState[item.name] === true) {
              data.push(...item.sourceData)
            }
          })
          this.barOptions.series[0].name = '所有'
        } else {
          // 选中饼图中的一项
          data = params.data.sourceData
          this.barOptions.series[0].name = params.name
        }
        let barxAxisData = []
        let barSeriesData = []
        let temp = []
        data.forEach(item => {
          temp.push({
            name: item.name,
            value: item.value
          })
        })
        // 排序
        temp.sort((a, b) => {
          return b.value - a.value
        })
        temp.forEach(item => {
          barxAxisData.push(item.name)
          barSeriesData.push(item.value)
        })
        this.barOptions.series[0].data = barSeriesData
        this.barOptions.series[0].itemStyle = {
          color:
            this.barOptions.series[0].name === '所有' ? '#33CCFF' : params.color
        }
        this.barOptions.xAxis.data = barxAxisData
        if (this.barOptions.xAxis.data.length > 40) {
          this.barOptions.dataZoom[0].show = true
        } else {
          this.barOptions.dataZoom[0].show = false
        }
        this.tableData = this.createTableData(barxAxisData, barSeriesData)
      })

      // 点击饼图图例触发
      this.pieChart.on('legendselectchanged', e => {
        this.pieSelectedState = e.selected
        // this.pieChart.dispatchAction({
        //   type: 'pieUnSelect',
        //   name: this.barOptions.series[0].name
        // })
        let data = []
        this.barOptions.series[0].name = '所有'
        this.pieOptions.series[0].data.forEach(item => {
          if (e.selected[item.name] === true) {
            data.push(...item.sourceData)
          }
        })

        let barxAxisData = []
        let barSeriesData = []
        let temp = []
        data.forEach(item => {
          temp.push({
            name: item.name,
            value: item.value
          })
        })
        // 排序
        temp.sort((a, b) => {
          return b.value - a.value
        })
        temp.forEach(item => {
          barxAxisData.push(item.name)
          barSeriesData.push(item.value)
        })
        this.barOptions.series[0].data = barSeriesData
        this.barOptions.series[0].itemStyle = {
          color: '#33CCFF'
        }
        this.barOptions.xAxis.data = barxAxisData
        if (this.barOptions.xAxis.data.length > 40) {
          this.barOptions.dataZoom[0].show = true
        } else {
          this.barOptions.dataZoom[0].show = false
        }
        this.tableData = this.createTableData(barxAxisData, barSeriesData)
      })
      this.barChart = echarts.init(document.getElementById(barChartWrapId))
      this.barChart.setOption(this.barOptions)
    },
    fetchChartData: debounce(
      function() {
        const { dateType, branchId, startDate, endDate } = this.filterForm
        const modelTreeIdList = this.structTree
          .find(t => {
            return t.SubentryId === branchId
          })
          .ModelTreeList.filter(t => {
            return t.IsSummary !== 1
          })
          .map(v => v.ModelTreeId)
        this.loading = true
        getEnergySubentryColumnare({
          dateType:
            'date' === dateType
              ? 1
              : 'week' === dateType
              ? 2
              : 'month' === dateType || 'daterange' === dateType
              ? 3
              : 4,
          startDate: startDate,
          endDate: endDate,
          modelTreeIdList: modelTreeIdList,
          subentryId: branchId
        })
          .then(e => {
            if (
              startDate === this.filterForm.startDate &&
              endDate === this.filterForm.endDate &&
              dateType === this.filterForm.dateType &&
              branchId === this.filterForm.branchId
            )
              if (200 === e.data.Code) {
                let data = e.data.Data
                let seriesData = []
                let l = []

                Object.keys(data.Data).forEach(key => {
                  this.pieSelectedState[key] = true
                  var temp = {
                    sourceData: data.Data[key]
                  }
                  temp.name = key
                  temp.value = data.Data[key].reduce((t, e) => {
                    var a = null === e.value ? 0 : e.value
                    return NP.plus(t, a)
                  }, 0)
                  seriesData.push(temp)
                  data.Data[key].forEach(item => {
                    l.push({
                      name: item.name,
                      value: item.value
                    })
                  })
                })

                this.pieOptions.series[0].data = seriesData
                this.totalNum = seriesData.reduce((t, e) => {
                  return NP.plus(t, e.value)
                }, 0)
                // 保留一位小数
                this.totalNum = this.totalNum.toFixed(1)
                let barxAxisData = []
                let barSeriesData = []
                l.sort((t, e) => {
                  return e.value - t.value
                })
                l.forEach(item => {
                  barxAxisData.push(item.name), barSeriesData.push(item.value)
                })
                this.unitText = data.UnitAndDescription.Unit
                this.barOptions.yAxis.name =
                  data.UnitAndDescription.UnitDesc +
                  '/' +
                  data.UnitAndDescription.Unit
                this.barOptions.series[0].name = '所有'
                this.barOptions.series[0].data = barSeriesData
                this.barOptions.series[0].itemStyle = {
                  color: '#33CCFF'
                }
                this.barOptions.xAxis.data = barxAxisData
                if (this.barOptions.xAxis.data.length > 40) {
                  this.barOptions.dataZoom[0].show = true
                } else {
                  this.barOptions.dataZoom[0].show = false
                }
                this.tableData = this.createTableData(
                  barxAxisData,
                  barSeriesData
                )
              } else {
                this.$message.error('数据获取失败')
              }
          })
          .catch(err => {
            console.error(err)
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
    createTableData(t, e) {
      var a = []
      t.forEach(function(t, r) {
        a.push({
          支路: t,
          用能: null === e[r] ? '-' : e[r]
        })
      })
      return a
    },
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
.energy_manage-analyze-panel2 {
  .panel-header-left {
    display: flex;
    align-items: center;
  }

  .chart-wrap {
    display: flex;
  }

  .pie-chart-content {
    flex: 0 0 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .pie-chart {
    width: 350px;
    height: 350px;
  }

  .bar-chart-content {
    flex: 1;
    height: 450px;
  }

  .table-wrap {
    flex: 1;
    box-sizing: border-box;
    overflow-x: hidden;
    height: 450px;
    padding: 20px 30px;
  }
}
</style>
