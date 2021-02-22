<template>
  <div class="energy_manage-panel energy_manage-electricity-panel2">
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="title">日负荷峰值时段分布</span>
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
          >日期范围：</span
        >
        <DatePickerGroup
          :initTime="_dateFormat(new Date(), 'YYYY-MM-DD HH:mm')"
          value-format="YYYY-MM-DD"
          size="mini"
          :layout="['week', 'month']"
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
          :height="270"
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
import { getProjectEnergyPowerScatterPlot } from '@/api/energyStatistical'
import DatePickerGroup from '../../component/DatePickerGroup'
import { checkPermission } from '@/utils/permissions'

let xAxisData = []
for (let i = 0; i < 24; i++) {
  ;['00', '15', '30', '45'].forEach(item => {
    xAxisData.push(`${i < 10 ? '0' + i : i}:${item}`)
  })
}
xAxisData = [...xAxisData, ['00:00']]

export default {
  components: {
    DatePickerGroup
  },
  data() {
    return {
      model: 'chart',
      loading: false,
      isNoData: false,
      filterForm: {
        startDate: '',
        endDate: '',
        dateType: 'date'
      },
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
                  name: '日负荷峰值时段分布'
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
          },
          axisLabel: {
            interval: 3
          }
        },
        yAxis: {
          type: 'value',
          name: '负荷/kW',
          boundaryGap: ['20%', '20%'],
          min: 0,
          scale: true,
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
      tableCols: ['支路', '用能'],
      chartWrapId
    }
  },
  computed: {
    sidebarStatus() {
      return this.$store.state.app.sidebar
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    structTree() {
      return this.$store.state.energy.energyStruct.filter(item => {
        return '电量' === item.Name
      })
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
    }
  },
  mounted() {
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
          filename: '日负荷峰值时段分布',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    },
    handleDateChange({ startDate, endDate, dateType }) {
      console.log({ startDate, endDate, dateType })
      this.filterForm.startDate = startDate
      this.filterForm.endDate = endDate
      this.filterForm.dateType = dateType
      startDate && this.fetchChartData()
    },
    initCharts() {
      this.chart = echarts.init(document.getElementById(chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchChartData: debounce(
      function() {
        const { startDate, endDate } = this.filterForm
        const deviceIds = this.structTree
          .find(e => '电量' === e.Name)
          .ModelTreeList.map(e => e.ModelTreeId)
        if (!deviceIds.length) {
          this.$message('电量分项下面没有设备，无法查询')
          this.isNoData = true
          this.options.series = []
          this.tableData = []
          this.tableCols = []
          return false
        }
        this.loading = true
        getProjectEnergyPowerScatterPlot({
          startDate: startDate,
          endDate: endDate,
          projectId: this.projectId
        })
          .then(res => {
            if (
              startDate === this.filterForm.startDate &&
              endDate === this.filterForm.endDate
            )
              if (200 === res.data.Code) {
                this.isNoData = false
                var data = res.data.Data
                this.options.series = data
                const tableCols = ['日期', '峰值时间', '负荷峰值']

                let tableData = []
                data.forEach(e => {
                  const temp = {
                    日期: e.name,
                    峰值时间: e.data[0][0],
                    负荷峰值: e.data[0][1]
                  }
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
            if (
              startDate === this.filterForm.startDate &&
              endDate === this.filterForm.endDate
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
.energy_manage-electricity-panel2 {
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
