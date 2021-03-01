<template>
  <div style="padding-bottom: 25px;">
    <page-header
      :title="$route.meta.title"
      showBack
      :onClickBack="() => $router.push('/analysis/home')"
    >
      <template v-slot:right>
        <div style="flex: 1;display: flex;justify-content: flex-end">
          <el-button
            @click.native="$refs.timeIntervalSetDialog.openDialog()"
            style="margin-left: 15px;"
            size="mini"
          >
            <c-svg name="time-circle" style="font-size: 13px;"></c-svg>
            时段设置
          </el-button>
        </div>
      </template>
    </page-header>
    <div class="energy-consumption-analysis content-box" style="padding: 0;">
      <div class="left-wrap">
        <div class="title">能耗趋势对比</div>
        <Echart
          v-loading="chartLoading"
          :options="chartOptions"
          style="height: 320px; margin-bottom: 35px;"
        />
        <Table
          v-loading="tableLoading"
          :data="tableData"
          :columns="tableColumns"
          :exportLoading="exportLoading"
          @onClickExport="onClickExport"
        />
      </div>
      <div class="right-wrap">
        <div class="title">筛选条件</div>
        <div class="secondary-title">日期</div>
        <CustomDatePicker
          :typeArr="['day', 'month', 'year', 'custom']"
          @timeChange="timeChange"
          ref="customDatePicker"
        ></CustomDatePicker>
        <div class="secondary-title">时段</div>
        <CustomTimeIntervalPicker
          :companyId="companyId"
          @typeChange="timeIntervalTypeChange"
          @chooseChange="timeIntervalChange"
          size="small"
          ref="customTimeIntervalPicker"
        ></CustomTimeIntervalPicker>
        <div class="secondary-title">项目</div>

        <StructTree @change="handleProjectChange" />
      </div>
    </div>
    <TimeIntervalSetDialog
      :companyId="companyId"
      ref="timeIntervalSetDialog"
    ></TimeIntervalSetDialog>
  </div>
</template>

<script>
import Table from './Table'
import Echart from '@/components/Echart'
import StructTree from './StructTree'
import CustomDatePicker from '@/components/CustomDatePicker'
import dayjs from 'dayjs'
import { getMoreProjectEnergy, getMoreProjectEnergyTable } from '@/api/energy'
import { mapGetters } from 'vuex'
import TimeIntervalSetDialog from '@components/TimeIntervalSetDialog/TimeIntervalSetDialog'
import CustomTimeIntervalPicker from '@/components/CustomTimeIntervalPicker'
import saveAs from 'file-saver'
const dateTypeMap = {
  day: 1,
  month: 3,
  year: 4,
  custom: 5
}

export default {
  components: {
    Table,
    Echart,
    StructTree,
    CustomDatePicker,
    TimeIntervalSetDialog,
    CustomTimeIntervalPicker
  },
  data() {
    return {
      chartLoading: false,
      tableLoading: false,
      exportLoading: false,
      filter: {
        // 1：日 2：周 3：月 4：年 5：自定义
        dateType: 'day',
        dateRange: [],
        projectSubareaIds: [],
        timeIntervalId: undefined,
        timeIntervalList: [],
        timeIntervalRange: []
      },
      timeIntervalType: 'default',
      chartOptions: {
        color: [
          '#46B6FF',
          '#29CF67',
          '#1890FF',
          '#04C74C',
          '#FFCD00',
          '#253076',
          '#8F30E9',
          '#03C7C3'
        ],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          itemWidth: 11,
          itemHeight: 8,
          icon: 'rect',
          bottom: 0,
          textStyle: {
            color: '#8C8C8C'
          },
          type: 'scroll',
          padding: [0, 50],
          itemGap: 20
        },
        toolbox: {
          bottom: 0,
          right: 0,
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: 20,
          right: 10,
          bottom: 40,
          top: 45,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: [],
          axisTick: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.45)'
            }
          },
          axisLabel: {
            color: 'rgba(0, 0, 0, 0.45)'
          },
          splitLine: {
            lineStyle: {
              color: ['rgba(0, 0, 0, 0.45)']
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.45)'
            },
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '用电量/kWh',
          nameTextStyle: {
            color: '#808080'
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: 'rgba(0, 0, 0, 0.45)'
          },
          axisLine: {
            show: false
          }
        },
        series: [
          // {
          //   name: '邮件营销',
          //   type: 'line',
          //   symbol: 'none',
          //   areaStyle: {},
          //   // emphasis: {
          //   //   focus: 'series'
          //   // },
          //   data: [120, 132, 101, 134, 90, 230, 210]
          // },
        ]
      },
      tableData: [],
      tableColumns: []
    }
  },
  watch: {
    filter: {
      handler: function() {
        this.fetchChartData()
        this.fetchTableData()
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['companyId'])
  },
  mounted() {
    // 默认查昨天的数据
    this.$refs.customDatePicker.init(
      'day',
      dayjs()
        .subtract(1, 'day')
        .format('YYYY-MM-DD') + '00:00'
    )
    this.$refs.customTimeIntervalPicker.init('default', true)
  },
  methods: {
    handleProjectChange(nodes) {
      this.filter.projectSubareaIds = nodes
        .filter(v => v.Remark === '项目')
        .map(v => v.SubareaId)
    },
    timeChange({ type, dateRange }) {
      this.filter.dateType = type
      this.filter.dateRange = dateRange
    },
    // 更换时段类型
    timeIntervalTypeChange(val) {
      this.timeIntervalType = val
    },
    // 更换时段
    timeIntervalChange({ timeInterval, timeIntervalId, dateRange }) {
      if (timeInterval === 'all') {
        this.filter.timeIntervalList = undefined
      } else {
        this.filter.timeIntervalList = [timeInterval]
        this.filter.timeIntervalRange = dateRange
      }
      this.filter.timeIntervalId = timeIntervalId
    },
    async fetchChartData() {
      const {
        dateType,
        dateRange,
        projectSubareaIds,
        timeIntervalId,
        timeIntervalRange,
        timeIntervalList
      } = this.filter
      if (dateType === 'custom' && !dateRange.length) {
        return
      }
      if (this.timeIntervalType === 'custom' && !timeIntervalRange.length) {
        return
      }
      if (this.timeIntervalType === 'default' && !timeIntervalId) {
        return
      }
      this.chartLoading = true
      try {
        const { data } = await getMoreProjectEnergy({
          CompanyId: this.companyId,
          DateType: dateTypeMap[dateType],
          SubareaIdList: projectSubareaIds,
          TimeQuantum: {
            StartDate: dateRange[0],
            EndDate: dateRange[1]
          },
          TimeIntervalId: timeIntervalId,
          ClassifyList:
            this.timeIntervalType === 'custom'
              ? timeIntervalRange
              : timeIntervalList
        })
        if (data.Code === 200) {
          const { dateType } = this.filter
          this.chartOptions.xAxis.data = data.Data.TimeList
            ? data.Data.TimeList.map(v => {
                if (dateType === 'day') {
                  v = dayjs(v).format('HH:mm')
                } else if (dateType === 'month') {
                  v = dayjs(v).format('DD') + '日'
                } else if (dateType === 'year') {
                  v = dayjs(v).month() + 1 + '月'
                } else if (dateType === 'custom') {
                  v = dayjs(v).format('YYYY-MM-DD')
                }
                return v
              })
            : []
          data.Data.DataList.forEach(v => {
            v.areaStyle = {}
            v.symbol = 'none'
          })
          this.chartOptions.series = data.Data.DataList
        } else {
          this.$message.error('图表数据获取失败')
        }
      } catch (error) {
        console.error(error)
        this.$message.error('图表数据获取失败')
      } finally {
        this.chartLoading = false
      }
    },
    async fetchTableData() {
      const {
        dateType,
        dateRange,
        projectSubareaIds,
        timeIntervalId,
        timeIntervalList,
        timeIntervalRange
      } = this.filter
      if (dateType === 'custom' && !dateRange.length) {
        return
      }
      if (this.timeIntervalType === 'custom' && !timeIntervalRange.length) {
        return
      }
      if (this.timeIntervalType === 'default' && !timeIntervalId) {
        return
      }
      this.tableLoading = true
      try {
        const { data } = await getMoreProjectEnergyTable({
          CompanyId: this.companyId,
          DateType: dateTypeMap[dateType],
          SubareaIdList: projectSubareaIds,
          TimeQuantum: {
            StartDate: dateRange[0],
            EndDate: dateRange[1]
          },
          TimeIntervalId: timeIntervalId,
          ClassifyList:
            this.timeIntervalType === 'custom'
              ? timeIntervalRange
              : timeIntervalList,
          isExport: false
        })
        if (data.Code === 200) {
          this.tableData = data.Data
          this.tableColumns = Object.keys(this.tableData[0])
        } else {
          this.$message.error('表格数据获取失败')
          this.tableData = []
          this.tableColumns = []
        }
      } catch (error) {
        console.error(error)
        this.$message.error('表格数据获取失败')
        this.tableData = []
        this.tableColumns = []
      } finally {
        this.tableLoading = false
      }
    },
    async onClickExport() {
      const {
        dateType,
        dateRange,
        projectSubareaIds,
        timeIntervalId,
        timeIntervalList,
        timeIntervalRange
      } = this.filter
      if (dateType === 'custom' && !dateRange.length) {
        return
      }
      if (this.timeIntervalType === 'custom' && !timeIntervalRange.length) {
        return
      }
      if (this.timeIntervalType === 'default' && !timeIntervalId) {
        return
      }
      try {
        this.exportLoading = true
        const res = await getMoreProjectEnergyTable({
          CompanyId: this.companyId,
          DateType: dateTypeMap[dateType],
          SubareaIdList: projectSubareaIds,
          TimeQuantum: {
            StartDate: dateRange[0],
            EndDate: dateRange[1]
          },
          TimeIntervalId: timeIntervalId,
          ClassifyList:
            this.timeIntervalType === 'custom'
              ? timeIntervalRange
              : timeIntervalList,
          isExport: true
        })
        if (res.data.Code === 200) {
          if (
            res.headers['content-type'] === 'application/json; charset=utf-8'
          ) {
            // blob转json
            var reader = new FileReader()
            reader.onload = e => {
              const temp = JSON.parse(e.target.result)
              this.$message(temp.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          const blob = new Blob([res.data])
          saveAs(blob, `能耗分析.xls`)
        } else {
          this.$message.error('表格导出失败')
        }
      } catch (error) {
        this.exportLoading = false
        console.error(error)
        this.$message.error('表格导出失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.energy-consumption-analysis {
  display: flex;
  .left-wrap {
    flex: 1;
    padding: 16px 24px;
  }
  .right-wrap {
    flex: 0 0 340px;
    box-sizing: border-box;
    padding: 16px 30px;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }
  .title {
    font-size: 16px;
    color: #000000;
    line-height: 24px;
  }
  .secondary-title {
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 8px;
    margin-top: 20px;
  }
}
</style>
