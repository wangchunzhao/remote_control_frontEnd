<template>
  <div
    class="alarm-analysis content-box"
    style="padding: 0;background-color: transparent"
  >
    <div class="row1">
      <div class="line-chart">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报警数量趋势</span>
          </div>
          <div class="line-chart-wrap">
            <line-chart
              dom-id="chart1_1"
              :date-type="filterForm.scope"
              :loading="chart1_1Loading"
              :data="chart1_1Data"
              @drillDown="chart1_1DrillDown"
            />
            <div class="line-chart-right">
              <div
                style="color: rgba(0, 0, 0, 0.85);font-size: 22px;font-weight: bold;"
              >
                {{ chart1_1Info.total }}
              </div>
              <div style="margin-top: 60px;margin-bottom: 6px;">
                <span
                  style="color: rgba(0, 0, 0, 0.85);font-size: 22px;font-weight: bold;"
                >
                  {{ chart1_1Info.raingRatio }}
                </span>
                <span style="color: rgba(0, 0, 0, 0.65);">%</span>
              </div>
              <div>
                <span style="color: rgba(0, 0, 0, 0.65);">环比</span>
                <i
                  :style="{
                    color:
                      chart1_1Info.raingRatio > 0
                        ? 'rgba(47, 194, 91, 1)'
                        : 'rgba(245, 34, 45, 1)'
                  }"
                  :class="
                    chart1_1Info.raingRatio < 0
                      ? 'el-icon-caret-bottom'
                      : 'el-icon-caret-top'
                  "
                />
              </div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="chart-form">
        <el-card shadow="never" style="overflow: visible">
          <div slot="header" class="clearfix">
            <span class="card-title">数据筛选</span>
            <el-button
              type="text"
              style="float: right;padding: 0;"
              @click.native="resetForm"
            >
              清除筛选
            </el-button>
          </div>
          <el-form
            ref="filterForm"
            :model="filterForm"
            size="medium"
            label-position="top"
            class="thin-scroll"
            style="height: 302px;overflow: auto;"
          >
            <el-form-item label="时间范围">
              <el-radio-group v-model="filterForm.scope" @change="scopeChange">
                <el-radio label="day">
                  日
                </el-radio>
                <el-radio label="week">
                  周
                </el-radio>
                <el-radio label="month">
                  月
                </el-radio>
              </el-radio-group>
              <el-date-picker
                v-show="filterForm.pickerType === 'date'"
                v-model="filterForm.time"
                type="date"
                placeholder=""
                style="width: 100%;"
                :clearable="false"
                :picker-options="{
                  disabledDate(time) {
                    return time.getTime() > Date.now() - 3600000 * 24
                  }
                }"
                @change="timeChange"
              />
              <el-date-picker
                v-show="filterForm.pickerType === 'week'"
                v-model="filterForm.time"
                type="week"
                format="yyyy 第 WW 周"
                placeholder=""
                :clearable="false"
                :picker-options="{
                  firstDayOfWeek: 1,
                  disabledDate(time) {
                    return time.getTime() > Date.now() - 3600 * 1000 * 24 * 7
                  }
                }"
                style="width: 100%;"
                @change="timeChange"
              />
              <el-date-picker
                v-show="filterForm.pickerType === 'month'"
                v-model="filterForm.time"
                type="month"
                placeholder=""
                :clearable="false"
                style="width: 100%;"
                :picker-options="{
                  firstDayOfWeek: 1,
                  disabledDate(time) {
                    return (
                      time >
                      dayjs()
                        .subtract(1, 'month')
                        .startOf('month')
                    )
                  }
                }"
                @change="timeChange"
              />
            </el-form-item>
            <el-form-item label="地区">
              <treeselect
                v-model="filterForm.area"
                :default-expand-level="1"
                :multiple="true"
                :options="treeOptions"
                style="line-height: 20px;"
                placeholder=""
                :normalizer="normalizer"
                :show-count="true"
                :append-to-body="true"
                @close="areaChange"
              />
            </el-form-item>
            <el-form-item label="报警分类" style="margin-bottom: 18px;">
              <el-select
                v-model="filterForm.type"
                placeholder=""
                style="width:100%;"
                clearable
                @change="typeChanage"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.Id"
                  :label="item.Name"
                  :value="item.Id"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
    <el-row type="flex" :gutter="25">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报警数量排名</span>
          </div>
          <div>
            <bar-chart
              :data="chart2_1Data"
              :loading="chart2_1Loading"
              dom-id="chart2_1"
              @drillDown="chart2_1DrillDown"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报警分类</span>
          </div>
          <div>
            <pie-chart
              :data="chart2_2Data"
              :loading="chart2_2Loading"
              :type-id="filterForm.type"
              dom-id="chart2_2"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" :gutter="25">
      <el-col :span="24">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报警数量详情表</span>
            <el-tag size="small" type="info" style="margin-left: 15px;">
              {{
                dayjs(filterForm.start).format('YYYY-MM-DD HH:mm') +
                  ' 至 ' +
                  dayjs(filterForm.end)
                    .subtract(1, 'minute')
                    .format('YYYY-MM-DD HH:mm')
              }}
            </el-tag>
          </div>
          <div>
            <div>
              <el-button
                icon="el-icon-download"
                size="medium"
                @click.native="downloadExcel"
              >
                导出
              </el-button>
              <el-input
                v-model="projectNameFilter"
                placeholder="请输入项目名称"
                size="medium"
                clearable
                style="width: 200px;float: right;"
              />
            </div>
            <el-table
              v-if="tableData.length"
              v-loading="tableLoading"
              :data="tableData"
              style="width: 100%;margin-top: 20px;"
            >
              <el-table-column type="index" label="排名" width="50px" />

              <template v-for="item in Object.keys(tableData[0])">
                <el-table-column
                  v-if="item !== 'ProjectId'"
                  :key="item"
                  :prop="item"
                  :label="item"
                >
                  <template slot-scope="{ row }">
                    <span
                      v-if="
                        item === '项目' ||
                          item === '未统计' ||
                          row[item] === '0'
                      "
                      >{{ row[item] }}</span
                    >
                    <el-button
                      v-else
                      type="text"
                      @click="
                        openAlarmListDialog(item, row['ProjectId'], row[item])
                      "
                    >
                      {{ row[item] }}
                    </el-button>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            <el-pagination
              background
              :current-page.sync="pagination.currentPage"
              :page-size.sync="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      title="报警列表"
      :visible.sync="alarmListDialog"
      custom-class="alarm-dialog"
      width="1000px"
      @close="alarmPagination.currentPage = 1"
    >
      <el-table
        :data="alarmList"
        :show-header="false"
        style="width: 100%"
        @row-click="clickAlarmTableRow"
      >
        <el-table-column prop="ALARM_LEVEL" width="70">
          <template slot-scope="{ row }">
            <el-tag
              size="small"
              :type="
                row.ALARM_LEVEL === 3
                  ? 'primary'
                  : row.ALARM_LEVEL === 4
                  ? 'info'
                  : row.ALARM_LEVEL === 2
                  ? 'warning'
                  : 'danger'
              "
            >
              {{
                row.ALARM_LEVEL === 1
                  ? '紧急'
                  : row.ALARM_LEVEL === 2
                  ? '重要'
                  : row.ALARM_LEVEL === 3
                  ? '一般'
                  : '记录'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ALARM_DESCRIBE" />
        <el-table-column prop="typeCn" width="120" />
        <el-table-column prop="Alarm_time" width="120">
          <template slot-scope="{ row }">
            {{ timeStamp(row.Alarm_time) }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        :current-page.sync="alarmPagination.currentPage"
        :page-size.sync="alarmPagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="alarmPagination.total"
        style="margin-bottom: 20px;"
        @size-change="handleAlarmSizeChange"
        @current-change="handleAlarmCurrentChange"
      />
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" type="primary" @click="exportAlarmList"
          >导 出</el-button
        >
      </span>
    </el-dialog>
    <history-dialog
      :showRelatePointDisabled="true"
      ref="hsitoryDialog"
      :point-ids="pointId"
    />
  </div>
</template>

<script>
import LineChart from './component/LineChart'
import PieChart from './component/PieChart'
import BarChart from './component/BarChart'
import HistoryDialog from '@/components/HistoryDialog'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // load on demand
dayjs.locale('zh-cn')
import { getUserOwnSubareaTree } from '@/api/subarea'
import {
  getAlarmNumBrokenLine,
  getAlarmNumColumnare,
  getAlarmNumPie,
  getAlarmNumList,
  getAlarmListStatistical
} from '@/api/alarmStatistical'
import { getModelBigList } from '@/api/maintenanceStatistical'

export default {
  components: {
    LineChart,
    PieChart,
    BarChart,
    Treeselect,
    HistoryDialog
  },
  data() {
    function timeStamp(StatusMinute) {
      var day = parseInt(StatusMinute / 60 / 24)
      var hour = parseInt((StatusMinute / 60) % 24)
      var min = parseInt(StatusMinute % 60)
      StatusMinute = ''
      if (day > 0) {
        StatusMinute = day + '天'
      }
      if (hour > 0) {
        StatusMinute += hour + '小时'
      }
      if (min > 0) {
        StatusMinute += parseFloat(min) + '分钟'
      }
      return StatusMinute
    }
    return {
      treeOptions: [],
      typeOptions: [],
      normalizer(node) {
        return {
          id: node.SubareaId,
          label: node.SubareaName,
          children: node.Children
        }
      },

      filterForm: {
        scope: 'week',
        area: [],
        time: dayjs().subtract(1, 'week'),
        type: '',
        pickerType: 'week',
        start: dayjs()
          .subtract(1, 'week')
          .startOf('week')
          .format('YYYY-MM-DD'),
        end: dayjs()
          .subtract(1, 'week')
          .startOf('week')
          .add(7, 'day')
          .format('YYYY-MM-DD')
      },

      chart1_1Loading: true,
      chart1_1Data: null,
      chart1_1Info: {
        total: '',
        raingRatio: ''
      },

      chart2_1Data: null,
      chart2_1Loading: true,

      chart2_2Data: null,
      chart2_2Loading: true,

      projectNameFilter: '',
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      tableData: [],
      tableLoading: false,
      alarmListDialog: false,
      alarmList: [],
      pointId: null,
      alarmPagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },

      dayjs,
      timeStamp
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    industryId() {
      return this.$store.state.app.project.Industry
    }
  },
  watch: {
    'filterForm.scope'(val) {
      if (val === 'day') {
        this.filterForm.pickerType = 'date'
      } else if (val === 'week') {
        this.filterForm.pickerType = 'week'
      } else if (val === 'month') {
        this.filterForm.pickerType = 'month'
      }
    },
    'filterForm.time'(time) {
      if (time) {
        switch (this.filterForm.scope) {
          case 'day':
            this.filterForm.start = dayjs(time).format('YYYY-MM-DD')
            this.filterForm.end = dayjs(time)
              .add(1, 'day')
              .format('YYYY-MM-DD')
            break
          case 'week':
            this.filterForm.start = dayjs(time)
              .startOf('week')
              .format('YYYY-MM-DD')
            this.filterForm.end = dayjs(time)
              .endOf('week')
              .add(1, 'millisecond')
              .format('YYYY-MM-DD')
            break
          case 'month':
            this.filterForm.start = dayjs(time)
              .startOf('month')
              .format('YYYY-MM-DD')
            this.filterForm.end = dayjs(time)
              .endOf('month')
              .add(1, 'millisecond')
              .format('YYYY-MM-DD')
            break
          default:
            break
        }
      }
    },
    projectNameFilter() {
      this.fetchTableData()
    }
  },
  mounted() {
    this.renderChart1_1()
    this.renderChart2_1()
    this.renderChart2_2()
    this.fetchTableData()

    getUserOwnSubareaTree({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          let tree = [res.data.Data]
          this.walk(tree)
          this.treeOptions = tree
          this.$nextTick(() => {
            this.filterForm.area = [this.treeOptions[0].SubareaId]
          })
        }
      })
      .catch(err => {
        console.error(err)
      })

    getModelBigList({
      industry: this.$store.state.app.company.industry
    })
      .then(res => {
        if (res.data.Code === 200) {
          res.data.Data.unshift({
            Id: '',
            Name: '全部分类'
          })
          this.typeOptions = res.data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    // 清除筛选
    resetForm() {
      this.filterForm.scope = 'week'
      this.filterForm.area = [this.treeOptions[0].SubareaId]
      this.filterForm.time = dayjs().subtract(1, 'week')
      this.filterForm.type = ''
      this.filterForm.pickerType = 'week'
      this.filterForm.start = dayjs()
        .subtract(1, 'week')
        .startOf('week')
        .format('YYYY-MM-DD')
      this.filterForm.end = dayjs()
        .subtract(1, 'week')
        .startOf('week')
        .add(7, 'day')
        .format('YYYY-MM-DD')
      this.renderChart1_1()
      this.renderChart2_1()
      this.renderChart2_2()
      this.fetchTableData()
    },
    scopeChange(val) {
      if (val === 'day') {
        this.filterForm.pickerType = 'date'
        this.filterForm.time = dayjs().subtract(1, 'day')
        this.filterForm.start = dayjs()
          .subtract(1, 'day')
          .format('YYYY-MM-DD')
        this.filterForm.end = dayjs().format('YYYY-MM-DD')
      } else if (val === 'week') {
        this.filterForm.pickerType = 'week'
        this.filterForm.time = dayjs().subtract(1, 'week')
        this.filterForm.start = dayjs()
          .subtract(1, 'week')
          .startOf('week')
          .format('YYYY-MM-DD')
        this.filterForm.end = dayjs()
          .subtract(1, 'week')
          .startOf('week')
          .add(7, 'day')
          .format('YYYY-MM-DD')
      } else if (val === 'month') {
        this.filterForm.pickerType = 'month'
        this.filterForm.time = dayjs().subtract(1, 'month')
        this.filterForm.start = dayjs()
          .subtract(1, 'month')
          .startOf('month')
          .format('YYYY-MM-DD')
        this.filterForm.end = dayjs()
          .startOf('month')
          .format('YYYY-MM-DD')
      }
      this.renderChart1_1()
      this.renderChart2_1()
      this.renderChart2_2()
      this.fetchTableData()
    },
    areaChange() {
      // this.filterForm.area = node.SubareaId
      this.renderChart1_1()
      this.renderChart2_1()
      this.renderChart2_2()
      this.fetchTableData()
    },
    timeChange() {
      this.renderChart1_1()
      this.renderChart2_1()
      this.renderChart2_2()
      this.fetchTableData()
    },
    typeChanage() {
      this.renderChart1_1()
      this.renderChart2_1()
      this.renderChart2_2()
      this.fetchTableData()
    },
    renderChart1_1() {
      this.chart1_1Loading = true
      getAlarmNumBrokenLine({
        companyId: this.companyId,
        dateType:
          this.filterForm.scope === 'day'
            ? 1
            : this.filterForm.scope === 'week'
            ? 2
            : 3,
        startTime: this.filterForm.start,
        endTime: this.filterForm.end,
        subareaId: this.filterForm.area,
        modelBigId: this.filterForm.type
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.chart1_1Info.total = data.Total
            this.chart1_1Info.raingRatio = data.RingRatio
            data.TimeList = data.TimeList.map(item =>
              dayjs(item).format('YYYY-MM-DD')
            )
            this.chart1_1Data = {
              list1: data.DataList[0],
              list2: data.DataList[1],
              scopeType: this.filterForm.scope,
              xAxis: data.TimeList
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart1_1Loading = false
        })
    },
    // 图表1_1下钻
    chart1_1DrillDown(time) {
      this.filterForm.time = time
      this.filterForm.scope = 'day'
      this.filterForm.start = dayjs(time)
        .startOf('day')
        .format('YYYY-MM-DD HH:mm')
      this.filterForm.end = dayjs(time)
        .startOf('day')
        .add(1, 'day')
        .format('YYYY-MM-DD HH:mm')
      this.renderChart1_1()
      this.renderChart2_1()
      this.renderChart2_2()
      this.fetchTableData()
    },
    renderChart2_1() {
      this.chart2_1Loading = true
      getAlarmNumColumnare({
        companyId: this.companyId,
        dateType:
          this.filterForm.scope === 'day'
            ? 1
            : this.filterForm.scope === 'week'
            ? 2
            : 3,
        startTime: this.filterForm.start,
        endTime: this.filterForm.end,
        subareaId: this.filterForm.area,
        modelBigId: this.filterForm.type
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.chart2_1Data = {
              data: data.Data,
              xAxis: data.Name,
              projectIds: data.Id
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart2_1Loading = false
        })
    },
    // 图表2_1下钻
    chart2_1DrillDown(id) {
      this.filterForm.area = [id]
      this.renderChart1_1()
      this.renderChart2_2()
      this.fetchTableData()
    },
    renderChart2_2() {
      this.chart2_2Loading = true
      getAlarmNumPie({
        companyId: this.companyId,
        startTime: this.filterForm.start,
        endTime: this.filterForm.end,
        subareaId: this.filterForm.area,
        industry: this.$store.state.app.company.industry,
        modelBigId: this.filterForm.type
      })
        .then(res => {
          if (res.data.Code === 200) {
            res.data.Data = res.data.Data.filter(item => item.value !== 0)
            this.chart2_2Data = {
              data: res.data.Data
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart2_2Loading = false
        })
    },
    downloadExcel() {
      let query = ''
      this.filterForm.area.forEach(item => {
        query += `&subareaId=${item}`
      })
      window.location = `${BASE_URI}/api/AlarmStatistical/ExportAlarmNumList?startTime=${this.filterForm.start}&endTime=${this.filterForm.end}&industry=${this.$store.state.app.company.industry}&projectName=${this.projectNameFilter}&companyId=${this.companyId}&userId=${this.$store.state.app.userInfo.uid}${query}`
    },
    fetchTableData() {
      this.tableLoading = true
      getAlarmNumList({
        companyId: this.companyId,
        startTime: this.filterForm.start,
        endTime: this.filterForm.end,
        subareaId: this.filterForm.area,
        industry: this.$store.state.app.company.industry,
        pageIndex: this.pagination.currentPage,
        pageSize: this.pagination.size,
        projectName: this.projectNameFilter
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tableData = res.data.Data.Data
            this.pagination.total = res.data.Data.TotalCount
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    // 点击报警列表列
    clickAlarmTableRow(row) {
      this.pointId = [row.PointId]
      this.$refs.hsitoryDialog.toggleDialog()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleAlarmCurrentChange() {
      this.fetchAlarmList()
    },
    handleAlarmSizeChange() {
      this.alarmPagination.currentPage = 1
      this.fetchAlarmList()
    },
    // 删除空的Children
    walk(arr) {
      arr.forEach(item => {
        if (item.Children) {
          if (!item.Children.length) {
            delete item.Children
          } else {
            this.walk(item.Children)
          }
        }
      })
    },
    openAlarmListDialog(name, projectId, num) {
      this.alarmListDialog = true
      const model = this.typeOptions.find(item => item.Name === name)
      this.alarmForm = {
        projectId,
        modelBigId: model ? model.Id : 0
      }
      this.alarmPagination.total = ~~num
      this.fetchAlarmList()
    },
    exportAlarmList() {
      window.location = `${BASE_URI}/api/AlarmStatistical/ExportAlarmListStatistical?startTime=${this.filterForm.start}&endTime=${this.filterForm.end}&modelBigId=${this.alarmForm.modelBigId}&projectId=${this.alarmForm.projectId}`
    },
    fetchAlarmList() {
      getAlarmListStatistical({
        startTime: this.filterForm.start,
        endTime: this.filterForm.end,
        projectId: this.alarmForm.projectId,
        modelBigId: this.alarmForm.modelBigId,
        pageIndex: this.alarmPagination.currentPage,
        pageSize: this.alarmPagination.size
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.alarmList = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-analysis {
  .el-card {
    overflow: visible;
  }
  .el-row--flex {
    margin-bottom: 25px;
  }
  .row1 {
    display: flex;
    margin-bottom: 25px;
    .line-chart {
      flex: 1;
      margin-right: 25px;
    }
    .chart-form {
      flex: 0 0 350px;
    }
  }
  .el-pagination {
    text-align: center;
    margin-top: 25px;
  }
  .line-chart-wrap {
    position: relative;
  }
  .line-chart-right {
    position: absolute;
    top: 60px;
    right: 15px;
    text-align: center;
  }
}
</style>

<style lang="scss">
.alarm-analysis {
  .el-form-item--medium .el-form-item__label {
    padding: 0;
    line-height: 31px;
  }
  .el-table__row {
    cursor: pointer;
  }
  .alarm-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }
}
</style>
