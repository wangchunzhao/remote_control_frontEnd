<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-date-picker
        v-model="filterForm.timeRange"
        type="daterange"
        size="small"
        style="width: 250px;"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      >
      </el-date-picker>
      <div style="float: right;">
        <el-button
          @click.native="handleClickExport"
          v-permission="[inAlarmManageIndex ? 35 : 115]"
          size="mini"
          type="primary"
          :loading="exportLoading"
          style="margin-right: 20px;"
          >导出</el-button
        >
        <el-badge
          :hidden="showFilterNotice()"
          is-dot
          class="item"
          style="margin-top: 0px;"
        >
          <el-button
            @click.native="() => $refs.filterFormDialog.openDialog()"
            type="text"
            style="padding: 0;"
            >筛选<i class="el-icon-arrow-down"></i
          ></el-button>
        </el-badge>
        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="margin-left: 20px;"
          class="filter-input"
          placeholder="搜索设备/点位名称"
          suffix-icon="el-icon-search"
        />
      </div>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        prop="mname"
        min-width="110"
        fixed="left"
        label="设备名称"
      >
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="handleClickDeviceName(row)">
            {{ row.mname }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        fixed="left"
        min-width="110"
        prop="PointName"
        label="点位"
      />
      <el-table-column prop="Child" width="90" label="设备类型">
        <template slot-scope="{ row }">
          {{ row.Child }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="!inAlarmManageIndex"
        prop="ProjectName"
        label="所属项目"
      >
        <template slot-scope="{ row }">
          <el-button
            @click.native="() => handleClickProjectName(row.ProjectId)"
            type="text"
            >{{ row.ProjectName }}</el-button
          >
        </template>
      </el-table-column>
      <el-table-column prop="Level" width="80" label="报警等级">
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
      <el-table-column prop="AlarmType" width="90" label="报警类型">
        <template slot-scope="{ row }">
          {{ row.AlarmType }}
        </template>
      </el-table-column>
      <el-table-column prop="ALARM_SETTING" min-width="150" label="报警规则" />
      <el-table-column
        prop="Acttime"
        width="135"
        sortable="custom"
        label="触发时间"
      >
        <template slot-scope="{ row }">
          {{ row.Acttime && _dateFormat(row.Acttime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column width="90" label="当前状态">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="watchHistory(row, row.Acttime)">
            {{ row.value }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="NoticeNum"
        width="100"
        label="通知人数"
        sortable="custom"
      >
        <template slot-scope="{ row }">
          <el-tooltip class="item" effect="dark" placement="top">
            <div slot="content">
              <div
                v-for="(item, index) in row.NoticeUser"
                :key="index"
                style="line-height: 22px;"
              >
                {{ item }}
              </div>
            </div>
            <el-link
              @click.native="
                () => {
                  $refs.alarmMsgHistoryDialog.openDialog({
                    pointId: row.Point,
                    time: row.Acttime
                  })
                }
              "
              type="primary"
              :underline="false"
              >{{ row.NoticeNum }}</el-link
            >
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column
        prop="Acktime"
        width="135"
        sortable="custom"
        label="确认时间"
      >
        <template slot-scope="{ row }">
          {{ row.Acktime && _dateFormat(row.Acktime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column prop="Acname" label="确认人">
        <template slot-scope="{ row }">
          {{ row.Acname }}
        </template>
      </el-table-column>
      <el-table-column
        prop="Xtime"
        width="130"
        sortable="custom"
        label="响应时长"
      />
      <el-table-column label="操作" width="100">
        <template slot-scope="{ row }">
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
      :layout="[
        'projectIds',
        'deviceTypes',
        'alarmLevels',
        'alarmTypes',
        'comfirmUserIds'
      ]"
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
        timeRange: '',
        text: '',
        startTime: '',
        endTime: '',
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
        projectIds,
        deviceTypes,
        alarmLevels,
        confirmUserIds,
        alarmTypes
      } = this.filterForm
      return !(
        (this.$route.name === 'alarmManageIndex' ? false : projectIds.length) ||
        // 如果在单个项目下的报警管理页面使用
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
