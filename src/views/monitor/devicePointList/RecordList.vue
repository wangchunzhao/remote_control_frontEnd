<template>
  <div class="device-recordList-page">
    <el-tabs class="page-tabs" v-model="activeName">
      <el-tab-pane label="当前报警" name="first">
        <Alarming
          @change="() => $refs.second.fetchTableData()"
          :project-id="projectId"
          ref="first"
          @showFilterNotice="showFilterNotice"
          @showAlarmDetailDialog="showAlarmDetailDialog"
        />
      </el-tab-pane>
      <el-tab-pane label="已确认报警" name="second">
        <AlarmConfirmed
          ref="second"
          :project-id="projectId"
          @showFilterNotice="showFilterNotice"
          @showAlarmDetailDialog="showAlarmDetailDialog"
        />
      </el-tab-pane>
      <el-tab-pane label="历史报警" name="third">
        <AlarmHistory
          ref="third"
          :project-id="projectId"
          @showFilterNotice="showFilterNotice"
          @showAlarmDetailDialog="showAlarmDetailDialog"
        />
      </el-tab-pane>
      <el-tab-pane label="维修记录" name="fourth">
        <RepairList
          ref="fourth"
          @showFilterNotice="showFilterNotice"
          @showRepairDetailDialog="showRepairDetailDialog"
        ></RepairList>
      </el-tab-pane>
    </el-tabs>
    <div class="contro-box">
      <div></div>
      <div>
        <el-badge
          :hidden="recordFilterDialog"
          is-dot
          class="item"
          style="margin-right: 15px;"
        >
          <el-button
            @click.native="showFilterDialog"
            type="text"
            style="padding: 0;"
          >
            筛选
            <i class="el-icon-arrow-down"></i>
          </el-button>
        </el-badge>
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
      </div>
    </div>
    <AlarmDetailDialog
      @refresh="refreshTab"
      ref="alarmDetailDialog"
    ></AlarmDetailDialog>
    <RepairDetailDialog
      @refresh="refreshRepairTab"
      ref="repairDetailDialog"
    ></RepairDetailDialog>
  </div>
</template>

<script>
import Alarming from './alarmCurrent/Index'
import AlarmConfirmed from './alarmConfirmed/Index'
import AlarmHistory from './alarmHistory/Index'
import RepairList from './repairList/Index'
import AlarmDetailDialog from './component/AlarmDetailDialog'
import RepairDetailDialog from './component/RepairDetailDialog'
export default {
  name: 'AlarmManageIndex',
  components: {
    Alarming,
    AlarmConfirmed,
    AlarmHistory,
    RepairList,
    AlarmDetailDialog,
    RepairDetailDialog
  },
  data() {
    return {
      activeName: 'first',
      recordFilterDialog: true,
      filterForm: {
        timeRange: [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()],
        startTime: this._dateFormat(
          new Date(Date.now() - 7 * 24 * 3600 * 1000),
          'YYYY-MM-DD HH:mm'
        ),
        endTime: this._dateFormat(new Date(), 'YYYY-MM-DD HH:mm')
      },
      deviceTypeOptions: [],
      alarmTypeOptions: [],
      confirmUserOptions: []
    }
  },
  watch: {
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
      this.$refs.first.updateTimeRange(range)
      this.$refs.second.updateTimeRange(range)
      this.$refs.third.updateTimeRange(range)
      this.$refs.fourth.updateTimeRange(range)
    },
    activeName(val) {
      this.showFilterNotice(this.$refs[val].showFilterNotice())
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  methods: {
    // 更新所有列表
    refreshTab() {
      this.refreshAlarmTab()
      this.refreshRepairTab()
    },
    // 更新报警列表
    refreshAlarmTab() {
      this.$refs.first.handleSizeChange()
      this.$refs.second.handleSizeChange()
      this.$refs.third.handleSizeChange()
    },
    // 更新维修列表
    refreshRepairTab() {
      this.$refs.fourth.handleSizeChange()
    },
    // 显示报警详情弹窗
    showAlarmDetailDialog(row) {
      this.$refs.alarmDetailDialog.openDialog(row)
    },
    // 显示维修详情弹窗
    showRepairDetailDialog(RepairOrder) {
      this.$refs.repairDetailDialog.openDialog(RepairOrder)
    },
    // 显示筛选弹窗
    showFilterDialog() {
      this.$refs[this.activeName].$refs.filterFormDialog.openDialog()
    },
    showFilterNotice(type) {
      this.recordFilterDialog = type
    },
    filterFormChange(form) {
      Object.assign(this.filterForm, form)
      this.pagination.currentPage = 1
      // this.fetchTableData()
    }
  },
  beforeRouteLeave(to, from, next) {
    this.activeName = 'first'
    next()
  }
}
</script>

<style lang="scss" scoped>
.device-recordList-page {
  position: relative;
}
.contro-box {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
