<template>
  <div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        fixed="left"
        min-width="110"
        prop="PointName"
        label="点位名称"
      />
      <el-table-column prop="Level" min-width="80" label="报警等级">
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :type="
              row.Level === 3
                ? 'primary'
                : row.Level === 4
                ? 'info'
                : row.Level === 2
                ? 'warning'
                : 'danger'
            "
          >
            {{
              row.Level === 1
                ? '紧急'
                : row.Level === 2
                ? '重要'
                : row.Level === 3
                ? '一般'
                : '记录'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="AlarmType" min-width="90" label="报警类型">
        <template slot-scope="{ row }">
          {{ row.AlarmType }}
        </template>
      </el-table-column>
      <el-table-column prop="ALARM_SETTING" min-width="150" label="报警规则" />
      <el-table-column prop="Acttime" min-width="135" label="触发时间">
        <template slot-scope="{ row }">
          {{ row.Acttime && _dateFormat(row.Acttime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column min-width="90" label="当前状态">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="watchHistory(row, row.Acttime)">
            {{ row.value }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="sendToAlarmDetailDialog(row)">
            查看
          </el-button>
          <el-button
            v-permission="[platform === PLATFORM.business ? 41 : '*']"
            v-if="!row.RepairOrder"
            type="text"
            @click.native="handleConfirmRepair(row.Id)"
          >
            报修
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
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
    <HistoryDialog
      :dateRange="[history.startTime, history.endTime]"
      ref="historyDialog"
      :showRelatePoint="true"
      :is-alarm-point="true"
      :projectId="history.projectId"
      :device-id="history.deviceId"
      :point-ids="history.point"
    />
    <AlarmMsgHistoryDialog ref="alarmMsgHistoryDialog" />
    <DevicePointDialog ref="devicePointDialog" />
    <FilterFormDialog
      @change="filterFormChange"
      :alarmTypeOptions="alarmTypeOptions"
      :inAlarmManageIndex="inAlarmManageIndex"
      :confirmUserOptions="confirmUserOptions"
      :deviceTypeOptions="deviceTypeOptions"
      :layout="['alarmLevels', 'alarmTypes']"
      ref="filterFormDialog"
    />
    <RepairAddApp ref="repairAddForm" @complete="fetchTableData" />
  </div>
</template>

<script>
import HistoryDialog from '@/components/HistoryDialog'
import DevicePointDialog from '../component/DevicePointDialog'
import { getAlarmAct, getAlarmActScreen, exportAlarm } from '@/api/alarmActive'
import { throttle } from '@/utils/index'
import FilterFormDialog from '../component/FilterFormDialog'

import filesaver from 'file-saver'
import { getPathById } from '@/utils/index'
import AlarmMsgHistoryDialog from '../component/AlarmMsgHistoryDialog'
import RepairAddApp from '../component/RepairAddApp'

export default {
  props: {
    projectId: {
      type: [Number]
      // default: 0
    }
  },
  components: {
    HistoryDialog,
    DevicePointDialog,
    FilterFormDialog,
    AlarmMsgHistoryDialog,
    RepairAddApp
  },
  data() {
    return {
      inAlarmManageIndex: this.$route.name === 'alarmManageIndex', // 是否在单个项目下的报警管理页面使用
      filterForm: {
        text: '',
        timeRange: [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()],
        startTime: this._dateFormat(
          new Date(Date.now() - 7 * 24 * 3600 * 1000),
          'YYYY-MM-DD HH:mm'
        ),
        endTime: this._dateFormat(new Date(), 'YYYY-MM-DD HH:mm'),
        projectIds:
          this.$route.name === 'alarmManageIndex' ? [this.projectId] : [], // 如果在单个项目下的报警管理页面使用
        deviceTypes: [],
        alarmLevels: [],
        alarmTypes: [],
        confirmUserIds: [],
        sortProp: undefined,
        isAsc: undefined
      },

      deviceTypeOptions: [],
      alarmTypeOptions: [],
      confirmUserOptions: [],
      tableLoading: false,
      exportLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      PLATFORM,
      history: {
        point: [],
        deviceId: 0,
        projectId: 0,
        startTime: undefined,
        endTime: new Date()
      }
    }
  },
  watch: {
    projectId(val) {
      this.filterForm.projectIds = [val]
      this.pagination.currentPage = 1
      this.fetchTableData()
      this.fetchFilterOptions()
    },
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    'filterForm.deviceType'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    'filterForm.timeRange'(range) {
      if (range) {
        this.filterForm.startTime = this._dateFormat(
          range[0],
          'YYYY-MM-DD HH:mm'
        )
        this.filterForm.endTime = this._dateFormat(range[1], 'YYYY-MM-DD HH:mm')
      } else {
        this.filterForm.startTime = undefined
        this.filterForm.endTime = undefined
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  computed: {
    platform() {
      return this.$store.state.permissions.platform
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    projectList() {
      return this.$store.state.app.proList
    },
    subarea() {
      return this.$store.state.app.subarea
    }
  },
  mounted() {
    this.fetchTableData()
    this.fetchFilterOptions()
  },
  methods: {
    sendToAlarmDetailDialog(row) {
      row.Status = 1
      this.$emit('showAlarmDetailDialog', row)
    },
    updateTimeRange(range) {
      this.filterForm.timeRange = range
    },
    // 点击确认报修
    handleConfirmRepair(Id) {
      this.$refs.repairAddForm.editToggleDialog(Id)
    },
    // 点击导出excel
    handleClickExport() {
      this.exportLoading = true
      const {
        text,
        sortProp,
        startTime,
        endTime,
        projectIds,
        deviceTypes,
        alarmLevels,
        alarmTypes,
        confirmUserIds,
        dealUserIds,
        continueTimeStart,
        continueTimeEnd,
        responseTimeStart,
        responseTimeEnd
      } = this.filterForm
      exportAlarm({
        CompanyId: this.companyId,
        Cstime: startTime || undefined,
        Cetime: endTime || undefined,
        Bstime: undefined,
        Betime: undefined,
        Area: projectIds.join(','),
        Acontent: undefined,
        Child: deviceTypes.join(','),
        Level: alarmLevels.join(','),
        Mtid: undefined,
        AlarmClass: alarmTypes,
        confirmUser: confirmUserIds,
        commentUser: dealUserIds,
        OrderByField: sortProp,
        Type: undefined,
        status: 1,
        ContinuedStartTime: continueTimeStart,
        ContinuedEndTime: continueTimeEnd,
        ResponseTimeStartTime: responseTimeStart,
        ResponseTimeEndTime: responseTimeEnd,
        MtName: text
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
          filesaver.saveAs(blob, '报警日志.xls')
        })
        .catch(err => {
          console.error(err)
          this.$message.error('日志导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    filterFormChange(form) {
      Object.assign(this.filterForm, form)
      this.pagination.currentPage = 1
      this.fetchTableData()
      this.$emit('showFilterNotice', this.showFilterNotice())
    },
    // 点击项目名称
    handleClickProjectName(id) {
      const project = this.projectList.find(item => item.id === id)
      this.$store.dispatch('ChangeProject', project)

      let projectPath = []
      this.subarea.forEach(item => {
        getPathById(id, item, val => {
          projectPath = val
        })
      })
      this.$store.commit('UPDATE_PROJECT_PATH', projectPath)
      this.$router.push({
        name: 'alarmManageIndex'
      })
    },
    // 点击设备名称
    handleClickDeviceName(row) {
      this.$refs.devicePointDialog.openDialog({
        id: row.Mtid,
        name: row.mname
      })
    },
    // 查看历史数据
    watchHistory(row, startTime) {
      this.history.startTime = new Date(startTime)
      this.history.point = [row.Point]
      this.history.deviceId = row.Mtid
      this.history.projectId = row.ProjectId
      this.$refs.historyDialog.toggleDialog()
    },
    // 表格排序
    sortChange(val) {
      switch (val.prop) {
        case 'mname':
          this.filterForm.sortProp = 1
          break
        case 'PointName':
          this.filterForm.sortProp = 2
          break
        case 'Acttime':
          this.filterForm.sortProp = 3
          break
        case 'NoticeNum':
          this.filterForm.sortProp = 4
          break
        case 'Acktime':
          this.filterForm.sortProp = 5
          break
        case 'Xtime':
          this.filterForm.sortProp = 6
          break
        default:
          break
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 分页
    handleCurrentChange() {
      this.fetchTableData()
    },
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 获取表格数据
    fetchTableData: throttle(function() {
      this.tableLoading = true
      const {
        text,
        sortProp,
        isAsc,
        startTime,
        endTime,
        projectIds,
        alarmTypes,
        alarmLevels,
        confirmUserIds,
        deviceTypes
      } = this.filterForm
      const { currentPage, size } = this.pagination
      getAlarmAct({
        pid: undefined,
        page: currentPage,
        num: size,
        MtName: text,
        Mtid: this.$route.query.mtid - 0,
        cstime: startTime || undefined,
        cetime: endTime || undefined,
        bstime: undefined,
        betime: undefined,
        area: projectIds.join(','),
        child: deviceTypes.join(','),
        acontent: undefined,
        level: alarmLevels.join(','),
        AlarmClass: alarmTypes,
        confirmUser: confirmUserIds,
        commentUser: undefined,
        type: undefined,
        companyId: this.companyId,
        status: 1,
        ContinuedStartTime: undefined,
        ContinuedEndTime: undefined,
        OrderByField: sortProp,
        IsDesc: isAsc
      })
        .then(res => {
          if (currentPage !== this.pagination.currentPage) {
            return false
          }
          let data = res.data
          if (data.Code === 200) {
            this.tableData = data.Data.Data
            this.pagination.total = data.Data.TotalCount
            this.tableData.forEach(item => {
              item.NoticeUser = item.NoticeUser && item.NoticeUser.split(';')
            })
          } else {
            this.tableData = []
            this.pagination.total = 0
            this.$message.error('列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          if (currentPage !== this.pagination.currentPage) {
            return false
          }
          this.tableData = []
          this.pagination.total = 0
          this.$message.error('列表获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    }, 1000),
    fetchFilterOptions() {
      const {
        text,
        startTime,
        endTime,
        projectIds,
        alarmTypes,
        alarmLevels,
        confirmUserIds,
        deviceTypes
      } = this.filterForm
      getAlarmActScreen({
        MtName: text,
        cstime: startTime || undefined,
        cetime: endTime || undefined,
        bstime: undefined,
        betime: undefined,
        area: projectIds.join(','),
        child: deviceTypes.join(','),
        acontent: undefined,
        level: alarmLevels.join(','),
        AlarmClass: alarmTypes,
        confirmUser: confirmUserIds,
        commentUser: undefined,
        type: undefined,
        companyId: this.companyId,
        status: 1,
        ContinuedStartTime: undefined,
        ContinuedEndTime: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.deviceTypeOptions = data.DeviceTypeList
            this.alarmTypeOptions = data.AlarmTypeList
            this.confirmUserOptions = data.AckUserList
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    showFilterNotice() {
      const {
        deviceTypes,
        alarmLevels,
        confirmUserIds,
        alarmTypes
      } = this.filterForm
      return !(
        deviceTypes.length ||
        alarmLevels.length ||
        alarmTypes.length ||
        confirmUserIds.length
      )
    }
  }
}
</script>

<style lang="scss" scoped></style>
