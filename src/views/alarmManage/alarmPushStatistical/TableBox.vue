<template>
  <div class="box" style="margin-top: 24px">
    <el-radio-group
      @change="handleClickShortCust"
      v-model="shortcuts"
      size="small"
    >
      <el-radio-button label="上月"></el-radio-button>
      <el-radio-button label="本月"></el-radio-button>
      <el-radio-button label="自定义"></el-radio-button>
    </el-radio-group>
    <el-date-picker
      v-model="dateRange"
      :disabled="shortcuts !== '自定义'"
      @change="handleDateRangeChange"
      size="small"
      type="daterange"
      style="width: 250px;margin: 0 15px;height: 33px; line-height: 33px;"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    >
    </el-date-picker>
    <el-button
      :loading="exportLoading"
      @click.native="handleClickExport"
      size="small"
      plain
      >导出</el-button
    >
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      show-summary
      style="width: 100%;margin-top: 20px;"
    >
      <el-table-column prop="CREATE_TIME" label="日期">
        <template slot-scope="{ row }">
          {{ _dateFormat(row.CREATE_TIME, 'YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column prop="AppNumber" label="app推送量" />
      <el-table-column prop="AppReadNumber" label="已读推送" />
      <el-table-column prop="SmsNumber" label="短信发送量" />
      <el-table-column prop="SuccessNumber" label="接收成功短信" />
      <el-table-column prop="CallNumber" label="语音电话拨打量" />
      <el-table-column prop="SumTime" label="通话时长（分钟）" />
    </el-table>
  </div>
</template>

<script>
import {
  getAlarmPushStatus,
  exportAlarmPushStatistical
} from '@/api/alarmActive'
import dayjs from 'dayjs'
import fileSaver from 'file-saver'

const currentMonthRange = [
  dayjs()
    .startOf('month')
    .format('YYYY-MM-DD HH:mm'),
  dayjs()
    .add(1, 'month')
    .startOf('month')
    .format('YYYY-MM-DD HH:mm')
]

// 上月的某一天
const temp = dayjs().subtract(1, 'month')
const lastMonthRange = [
  dayjs(temp)
    .startOf('month')
    .format('YYYY-MM-DD HH:mm'),
  dayjs()
    .startOf('month')
    .format('YYYY-MM-DD HH:mm')
]

export default {
  data() {
    return {
      shortcuts: '本月',
      dateRange: currentMonthRange,
      tableLoading: false,
      exportLoading: false,
      tableData: []
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    handleClickShortCust(val) {
      switch (val) {
        case '本月':
          this.dateRange = currentMonthRange
          this.$emit('change', currentMonthRange)
          this.fetchTableData()
          break
        case '上月':
          this.dateRange = lastMonthRange
          this.$emit('change', lastMonthRange)
          this.fetchTableData()
          break
        default:
          break
      }
    },
    handleDateRangeChange(val) {
      let [start, end] = val
      start = dayjs(start).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      end = dayjs(end).add(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      if (dayjs(new Date(end)).diff(dayjs(new Date(start)), 'day') > 31) {
        this.$message('查询的最大范围是31天')
        return
      }
      this.$emit('change', [start, end])
      this.fetchTableData()
    },
    handleClickExport() {
      let [start, end] = this.dateRange
      start = dayjs(start).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      end = dayjs(end).add(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      if (dayjs(new Date(end)).diff(dayjs(new Date(start)), 'day') > 31) {
        this.$message('导出的最大范围是31天')
        return
      }
      this.exportLoading = true
      exportAlarmPushStatistical({
        projectId: this.projectId,
        startTime: start,
        endTime: end
      })
        .then(res => {
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
          fileSaver.saveAs(blob, '报警推送统计.xls')
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    fetchTableData() {
      let [start, end] = this.dateRange
      start = dayjs(start).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      end = dayjs(end).add(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      this.tableLoading = true
      getAlarmPushStatus({
        projectId: this.projectId,
        startTime: start,
        endTime: end
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tableData = res.data.Data
          } else {
            this.tableData = []
          }
        })
        .catch(err => {
          console.error(err)
          this.tableData = []
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
