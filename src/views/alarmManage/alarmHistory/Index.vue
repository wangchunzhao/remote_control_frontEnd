<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-radio-group
        v-model="filterForm.timeType"
        @change="timeTypeChange"
        size="small"
        style="transform: translateY(-2px);"
      >
        <el-radio-button label="近7天"></el-radio-button>
        <el-radio-button label="近30天"></el-radio-button>
        <el-radio-button label="自定义"></el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-model="filterForm.timeRange"
        type="daterange"
        :disabled="filterForm.timeType !== '自定义'"
        size="small"
        style="width: 250px;margin-left: 15px;"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      >
      </el-date-picker>
      <div style="float: right;">
        <el-button
          v-permission="[inAlarmManageIndex ? 37 : 118]"
          @click.native="handleBatchDeal"
          size="mini"
          style="margin-right: 20px;"
          >批量处理</el-button
        >
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" fixed />
      <el-table-column
        show-overflow-tooltip
        prop="mname"
        min-width="110"
        sortable="custom"
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
        show-overflow-tooltip
        label="所属项目"
        min-width="110"
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
      <el-table-column min-width="140" prop="ALARM_SETTING" label="报警规则" />
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
      <el-table-column min-width="90" label="当前状态">
        <template slot-scope="{ row }">
          已恢复
        </template>
      </el-table-column>
      <el-table-column label="最大超限" width="90">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            @click.native="watchHistory(row, row.Acttime, row.cletime)"
          >
            {{ row.MaxValue }}
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
        width="135"
        prop="Acktime"
        sortable="custom"
        label="确认时间"
      >
        <template slot-scope="{ row }">
          {{ row.Acktime && _dateFormat(row.Acktime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>

      <el-table-column prop="Acname" width="85" label="确认人">
        <template slot-scope="{ row }">
          {{ row.Acname }}
        </template>
      </el-table-column>
      <el-table-column width="135" prop="cletime" label="消除时间">
        <template slot-scope="{ row }">
          {{ row.cletime && _dateFormat(row.cletime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column
        prop="time"
        width="130"
        sortable="custom"
        label="持续时长"
      />
      <el-table-column width="135" prop="CommentTime" label="处理时间">
        <template slot-scope="{ row }">
          {{
            row.CommentTime && _dateFormat(row.CommentTime, 'YYYY-MM-DD HH:mm')
          }}
        </template>
      </el-table-column>
      <el-table-column prop="uname" label="处理人">
        <template slot-scope="{ row }">
          {{ row.uname }}
        </template>
      </el-table-column>
      <el-table-column prop="Comment" min-width="130" label="处理备注" />
      <el-table-column fixed="right" label="操作" width="90">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="handleWatch(row)">
            查看
          </el-button>
          <el-button
            v-if="row.FLAG_COMMENT === 0"
            v-permission="[inAlarmManageIndex ? 37 : 118]"
            type="text"
            @click.native="handleDeal(row)"
          >
            处理
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
    <AlarmDetailDialog
      @open="payload => $refs.alarmMsgHistoryDialog.openDialog(payload)"
      ref="alarmDetailDialog"
    />
    <AlarmMsgHistoryDialog ref="alarmMsgHistoryDialog" />
    <AlarmRemarkDialog
      @refresh="
        () => {
          fetchTableData()
          fetchFilterOptions()
        }
      "
      ref="alarmRemarkDialog"
    />
    <FilterFormDialog
      @change="filterFormChange"
      :alarmTypeOptions="alarmTypeOptions"
      :confirmUserOptions="confirmUserOptions"
      :dealUserOptions="dealUserOptions"
      :deviceTypeOptions="deviceTypeOptions"
      :inAlarmManageIndex="inAlarmManageIndex"
      :layout="[
        'projectIds',
        'deviceTypes',
        'alarmLevels',
        'alarmTypes',
        'comfirmUserIds',
        'dealUserIds',
        'continue',
        'response'
      ]"
      ref="filterFormDialog"
    />
  </div>
</template>

<script>
import HistoryDialog from '@/components/HistoryDialog'
import DevicePointDialog from '../component/DevicePointDialog'
import AlarmDetailDialog from './AlarmDetailDialog'
import AlarmRemarkDialog from './AlarmRemarkDialog'
import AlarmMsgHistoryDialog from '../component/AlarmMsgHistoryDialog'
import {
  getAlarmClear,
  getAlarmClearScreen,
  exportAlarm
} from '@/api/alarmActive'
import FilterFormDialog from '../component/FilterFormDialog'
import filesaver from 'file-saver'
import { getPathById } from '@/utils/index'
import debounce from 'lodash/debounce'
import { checkPermission } from '@/utils/permissions'

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
    AlarmDetailDialog,
    AlarmRemarkDialog,
    AlarmMsgHistoryDialog,
    FilterFormDialog
  },
  data() {
    return {
      multipleSelection: [],
      inAlarmManageIndex: this.$route.name === 'alarmManageIndex', // 是否在单个项目下的报警管理页面使用
      filterForm: {
        timeType: '近7天',
        timeRange: [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()],
        text: '',
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
        dealUserIds: [],
        continueTimeStart: undefined,
        continueTimeEnd: undefined,
        responseTimeStart: undefined,
        responseTimeEnd: undefined,
        sortProp: undefined,
        isAsc: undefined
      },
      deviceTypeOptions: [],
      alarmTypeOptions: [],
      confirmUserOptions: [],
      dealUserOptions: [],
      exportLoading: false,
      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      history: {
        point: [],
        deviceId: 0,
        projectId: 0,
        startTime: undefined,
        endTime: undefined
      },
      checkPermission
    }
  },
  computed: {
    industry() {
      return this.$store.state.app.project.Industry
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
        this.pagination.currentPage = 1
        this.fetchTableData()
        this.fetchFilterOptions()
      }
    }
  },
  mounted() {
    this.fetchTableData()
    this.fetchFilterOptions()
  },

  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
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
      let data = {
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
        status: 2,
        ContinuedStartTime: continueTimeStart,
        ContinuedEndTime: continueTimeEnd,
        ResponseTimeStartTime: responseTimeStart,
        ResponseTimeEndTime: responseTimeEnd,
        MtName: text
      }
      data = this.requestDataHandle(data)
      exportAlarm(data)
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
    timeTypeChange(val) {
      if (val === '近7天') {
        this.filterForm.timeRange = [
          new Date(Date.now() - 7 * 24 * 3600 * 1000),
          new Date()
        ]
      } else if (val === '近30天') {
        this.filterForm.timeRange = [
          new Date(Date.now() - 30 * 24 * 3600 * 1000),
          new Date()
        ]
      } else {
        this.filterForm.timeRange = ''
      }
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
    watchHistory(row, startTime, endTime) {
      this.history.startTime = new Date(startTime)
      this.history.endTime = new Date(endTime) || new Date()
      this.history.point = [row.Point]
      this.history.deviceId = row.Mtid
      this.history.projectId = row.ProjectId
      this.$refs.historyDialog.toggleDialog()
    },
    // 点查查看
    handleWatch(row) {
      this.$refs.alarmDetailDialog.openDialog(row.Id)
    },
    // 批量处理报警
    handleBatchDeal() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return
      }
      let idList = []
      let typeList = []
      this.multipleSelection.map(item => {
        if (item.FLAG_COMMENT === 0) {
          idList.push(item.Id)
          typeList.push(item.Type)
        }
      })
      if (!idList.length) {
        this.$message('请勿重复处理报警')
        return
      }
      typeList = [...new Set(typeList)]
      if (this.industry === 1 && typeList.length > 1) {
        this.$message('请选择相同点位类型')
        return
      }
      this.$refs.alarmRemarkDialog.openDialog({
        idList: idList,
        type: this.multipleSelection[0].Type
      })
    },
    // 点击处理
    handleDeal(row) {
      this.$refs.alarmRemarkDialog.openDialog({
        idList: [row.Id],
        type: row.Type
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
        case 'time':
          this.filterForm.sortProp = 7
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
        const { currentPage, size } = this.pagination
        let data = {
          page: currentPage,
          num: size,
          MtName: text,
          cstime: startTime || undefined,
          cetime: endTime || undefined,
          bstime: undefined,
          betime: undefined,
          area: projectIds.join(','),
          child: deviceTypes.join(','),
          AlarmClass: alarmTypes,
          confirmUser: confirmUserIds,
          commentUser: dealUserIds,
          acontent: undefined,
          level: alarmLevels.join(','),
          type: undefined,
          companyId: this.companyId,
          ContinuedStartTime: continueTimeStart,
          ContinuedEndTime: continueTimeEnd,
          ResponseTimeStartTime: responseTimeStart,
          ResponseTimeEndTime: responseTimeEnd,
          OrderByField: sortProp,
          IsDesc: isAsc
        }
        data = this.requestDataHandle(data)
        getAlarmClear(data)
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
            this.$message.error('获取失败')
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
      getAlarmClearScreen({
        MtName: text,
        cstime: startTime || undefined,
        cetime: endTime || undefined,
        bstime: undefined,
        betime: undefined,
        area: projectIds.join(','),
        child: deviceTypes.join(','),
        AlarmClass: alarmTypes,
        confirmUser: confirmUserIds,
        commentUser: dealUserIds,
        acontent: undefined,
        level: alarmLevels.join(','),
        type: undefined,
        companyId: this.companyId,
        ContinuedStartTime: continueTimeStart,
        ContinuedEndTime: continueTimeEnd,
        ResponseTimeStartTime: responseTimeStart,
        ResponseTimeEndTime: responseTimeEnd
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.deviceTypeOptions = data.DeviceTypeList
            this.alarmTypeOptions = data.AlarmTypeList
            this.confirmUserOptions = data.AckUserList
            this.dealUserOptions = data.AcuUserList
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
        alarmTypes,
        confirmUserIds,
        dealUserIds,
        continueTimeStart,
        continueTimeEnd,
        responseTimeStart,
        responseTimeEnd
      } = this.filterForm
      return !(
        (this.inAlarmManageIndex ? false : projectIds.length) ||
        // 如果在单个项目下的报警管理页面使用
        deviceTypes.length ||
        alarmLevels.length ||
        alarmTypes.length ||
        confirmUserIds.length ||
        dealUserIds.length ||
        (typeof continueTimeStart === 'number' &&
          typeof continueTimeEnd === 'number') ||
        (typeof responseTimeStart === 'number' &&
          typeof responseTimeEnd === 'number')
      )
    }
  }
}
</script>

<style lang="scss" scoped></style>
