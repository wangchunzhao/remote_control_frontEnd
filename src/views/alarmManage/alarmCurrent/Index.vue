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
          :loading="exportLoading"
          type="primary"
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
        label="设备名称"
      >
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="handleClickDeviceName(row)">
            {{ row.mname }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column min-width="110" prop="PointName" label="点位" />
      <el-table-column prop="Child" min-width="90" label="设备类型">
        <template slot-scope="{ row }">
          {{ row.Child }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="!inAlarmManageIndex"
        prop="ProjectName"
        label="所属项目"
        min-width="90"
      >
        <template slot-scope="{ row }">
          <el-button
            @click.native="() => handleClickProjectName(row.ProjectId)"
            type="text"
            >{{ row.ProjectName }}</el-button
          >
        </template>
      </el-table-column>
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
      <el-table-column prop="ALARM_SETTING" min-width="140" label="报警规则" />
      <el-table-column
        prop="Acttime"
        min-width="135"
        sortable="custom"
        label="触发时间"
      >
        <template slot-scope="{ row }">
          {{ _dateFormat(row.Acttime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column min-width="90" label="当前状态">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="watchHistory(row, row.Acttime)">
            {{ row.value }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="NoticeNum"
        min-width="100"
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
      <el-table-column label="操作" width="200">
        <template slot-scope="{ row }">
          <el-button
            v-permission="[inAlarmManageIndex ? 36 : 117]"
            type="text"
            @click.native="handleConfirmAlarm(row.Id)"
          >
            确认报警
          </el-button>
          <el-button
            v-permission="[platform === PLATFORM.business ? 41 : '*']"
            type="text"
            @click.native="handleConfirmRepair(row.Id)"
          >
            确认并报修
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
    <DevicePointDialog ref="devicePointDialog" />
    <AlarmMsgHistoryDialog ref="alarmMsgHistoryDialog" />
    <FilterFormDialog
      :alarmTypeOptions="alarmTypeOptions"
      :deviceTypeOptions="deviceTypeOptions"
      :inAlarmManageIndex="inAlarmManageIndex"
      @change="filterFormChange"
      :layout="['projectIds', 'deviceTypes', 'alarmLevels', 'alarmTypes']"
      ref="filterFormDialog"
    />
    <RepairAddApp ref="repairAddForm" @complete="confirmAlarmFun" />
  </div>
</template>

<script>
import HistoryDialog from '@/components/HistoryDialog'
import DevicePointDialog from '../component/DevicePointDialog'
import {
  getAlarmAct,
  updateStatus,
  getAlarmActScreen,
  exportAlarm
} from '@/api/alarmActive'
import FilterFormDialog from '../component/FilterFormDialog'
import filesaver from 'file-saver'
import { getPathById } from '@/utils/index'
import AlarmMsgHistoryDialog from '../component/AlarmMsgHistoryDialog'
import debounce from 'lodash/debounce'
import RepairAddApp from '../component/RepairAddApp'

export default {
  props: {
    projectId: {
      type: [Number],
      default: 0
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
        startTime: '',
        endTime: '',
        text: '',
        projectIds:
          this.$route.name === 'alarmManageIndex' ? [this.projectId] : [], // 如果在单个项目下的报警管理页面使用
        deviceTypes: [],
        alarmLevels: [],
        alarmTypes: [],
        sortProp: undefined,
        isAsc: undefined
      },
      deviceTypeOptions: [],
      alarmTypeOptions: [],
      exportLoading: false,
      tableLoading: false,
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
      this.fetchFilterOptions()
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
        alarmTypes
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
        confirmUser: undefined,
        commentUser: undefined,
        OrderByField: sortProp,
        Type: undefined,
        status: 0,
        ContinuedStartTime: undefined,
        ContinuedEndTime: undefined,
        ResponseTimeStartTime: undefined,
        ResponseTimeEndTime: undefined,
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
    // 点击确认报修
    handleConfirmRepair(Id) {
      this.$refs.repairAddForm.editToggleDialog(Id)
    },
    // 点击确认报警
    handleConfirmAlarm(Id) {
      this.$confirm('确认该报警 ？（确认后请及时处理）', '提示', {
        type: 'warning'
      })
        .then(() => {
          this.confirmAlarmFun(Id)
        })
        .catch(() => {})
    },
    confirmAlarmFun(Id) {
      updateStatus({
        id: Id
      }).then(res => {
        if (res.data.Code === 200) {
          this.$message.success('确认报警成功')
          this.$emit('change')
          this.fetchTableData()
        } else {
          this.$message.error('确认报警失败')
        }
      })
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
    fetchTableData: debounce(
      function() {
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
          confirmUser,
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
          IsRepair: false,
          AlarmClass: alarmTypes,
          confirmUser,
          commentUser: undefined,
          type: undefined,
          companyId: this.companyId,
          status: 0,
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
              this.tableData.forEach(item => {
                item.NoticeUser = item.NoticeUser && item.NoticeUser.split(';')
              })
              this.pagination.total = data.Data.TotalCount
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
      },
      1000,
      {
        leading: true
      }
    ),
    fetchFilterOptions() {
      const {
        text,
        startTime,
        endTime,
        projectIds,
        alarmTypes,
        alarmLevels,
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
        confirmUser: undefined,
        commentUser: undefined,
        type: undefined,
        companyId: this.companyId,
        status: 0,
        ContinuedStartTime: undefined,
        ContinuedEndTime: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.deviceTypeOptions = data.DeviceTypeList
            this.alarmTypeOptions = data.AlarmTypeList
          } else {
            this.$message.error(res.data.Message)
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
        alarmTypes
      } = this.filterForm
      return !(
        (this.inAlarmManageIndex ? false : projectIds.length) ||
        // 如果在单个项目下的报警管理页面使用
        deviceTypes.length ||
        alarmLevels.length ||
        alarmTypes.length
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.confirmPopoverContent {
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
  border-radius: 2px;
  margin-bottom: 18px;
}
.PopoverBtn {
  cursor: pointer;
  height: 24px;
  padding: 0 8px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
  background: #fff;
  line-height: 22px;
}
.confirmPopoverBtn {
  background: #1890ff;
  color: #fff;
}
.cancelPopoverBtn {
  border: 1px solid rgba(0, 0, 0, 0.15);
  margin-right: 16px;
}
</style>
