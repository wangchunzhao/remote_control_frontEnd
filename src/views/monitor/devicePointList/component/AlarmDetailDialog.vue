<template>
  <el-dialog
    width="680px"
    title="报警详情"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div v-loading="loading" class="alarm-detail-dialog-box">
      <div class="part-title">报警信息</div>
      <el-form :model="form" ref="form" label-width="100px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目">
              {{ form.ProjectName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称">
              {{ form.MName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="点位">
              {{ form.PointName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警等级">
              <el-tag
                size="small"
                :type="
                  form.Level === 3
                    ? 'primary'
                    : form.Level === 4
                    ? 'info'
                    : form.Level === 2
                    ? 'warning'
                    : 'danger'
                "
              >
                {{
                  form.Level === 1
                    ? '紧急'
                    : form.Level === 2
                    ? '重要'
                    : form.Level === 3
                    ? '一般'
                    : '记录'
                }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警类型">
              {{ form.AlarmType }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警规则">
              {{ row.ALARM_SETTING }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="触发时间">
              {{ _dateFormat(Acttime) }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.Status === 2 ? '最大超限' : '当前状态'">
              <el-button
                style="padding: 0"
                @click.native="() => $refs.historyDialog.toggleDialog()"
                type="text"
              >
                {{ form.Status === 2 ? form.MaxValue : form.PValue }}
                <el-tag
                  size="small"
                  :type="
                    alarmStatusList[form.Status]
                      ? alarmStatusList[form.Status].type
                      : ''
                  "
                  style="margin-left: 15px"
                >
                  {{
                    alarmStatusList[form.Status]
                      ? alarmStatusList[form.Status].label
                      : ''
                  }}
                </el-tag>
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="dialog-content-line"></div>
        <div class="part-title">跟进进度</div>
        <div class="detail-timeline-box">
          <el-timeline>
            <el-timeline-item v-for="(item, index) in step" :key="index">
              <div class="time-line-content">
                <div class="time-line-top">
                  <div class="time-line-top-active">
                    {{
                      AlarmSchedule[item.AlarmSchedule]
                        ? AlarmSchedule[item.AlarmSchedule].title
                        : ''
                    }}
                  </div>
                  <div>{{ item.Time }}</div>
                </div>
                <div class="time-line-bottom">
                  <div>
                    {{ item.Message }}
                  </div>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    placement="top"
                    v-if="item.PushList"
                  >
                    <div slot="content">
                      <div
                        style="line-height: 22px;"
                        v-for="(item1, index1) in item.PushList"
                        :key="index1"
                      >
                        {{ item1.Key + ' ' + item1.Value }}
                      </div>
                    </div>
                    <el-link
                      @click.native="
                        () => {
                          $refs.alarmMsgHistoryDialog.openDialog({
                            pointId: PointId,
                            time: Acttime
                          })
                        }
                      "
                      type="primary"
                      :underline="false"
                      >{{ item.PushList.length }}</el-link
                    >
                  </el-tooltip>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button
        size="medium"
        type="primary"
        @click.native="handleDeal"
        v-if="form.FLAG_COMMENT === 0 && form.Status === 2"
      >
        处理
      </el-button>
      <el-button
        size="medium"
        type="primary"
        @click.native="handleConfirmRepair"
        v-if="!row.RepairOrder && form.Status === 1"
      >
        报修
      </el-button>
      <el-button
        size="medium"
        type="primary"
        @click.native="handleConfirmAlarm"
        v-if="form.Status === 0"
      >
        确认报警
      </el-button>
      <el-button
        size="medium"
        type="primary"
        @click.native="handleConfirmRepair"
        v-if="form.Status === 0"
      >
        确认并报修
      </el-button>
    </span>
    <HistoryDialog
      appendToBody
      :dateRange="[history.startTime, history.endTime]"
      ref="historyDialog"
      :showRelatePoint="true"
      :is-alarm-point="true"
      :point-ids="history.point"
      :device-id="history.deviceId"
    />
    <RepairAddApp
      appendToBody
      ref="repairAddForm"
      @complete="confirmAlarmFun"
    />
    <AlarmRemarkDialog
      appendToBody
      @refresh="
        () => {
          $emit('refresh')
          this.handleClose()
        }
      "
      ref="alarmRemarkDialog"
    />
    <AlarmMsgHistoryDialog appendToBody ref="alarmMsgHistoryDialog" />
  </el-dialog>
</template>

<script>
import HistoryDialog from '@components/HistoryDialog'
import RepairAddApp from '../component/RepairAddApp'
import {
  getAlarmDetail,
  updateStatus,
  getAlarmSchedule
} from '@/api/alarmActive'
import AlarmRemarkDialog from '../alarmHistory/AlarmRemarkDialog'
import AlarmMsgHistoryDialog from '../component/AlarmMsgHistoryDialog'

export default {
  components: {
    HistoryDialog,
    RepairAddApp,
    AlarmRemarkDialog,
    AlarmMsgHistoryDialog
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      PointId: '', //点位ID
      Acttime: '', // 报警触发时间
      alarmId: undefined,
      row: {},
      form: {},
      step: [],
      history: {
        point: [],
        startTime: undefined,
        endTime: undefined,
        deviceId: 0
      },
      alarmStatusList: {
        '0': {
          label: '报警中',
          type: 'danger'
        },
        '1': {
          label: '已确认',
          type: 'warning'
        },
        '2': {
          label: '已恢复',
          type: 'success'
        }
      },
      // 报警进度 0：触发 1：重复 2：升级 3：消除 4：确认 5：消除
      AlarmSchedule: [
        {
          title: '触发报警'
        },
        {
          title: '重复报警'
        },
        {
          title: '报警升级'
        },
        {
          title: '点位恢复'
        },
        {
          title: '确认报警'
        },
        {
          title: '处理报警'
        }
      ]
    }
  },
  methods: {
    //处理
    handleDeal() {
      this.$refs.alarmRemarkDialog.openDialog({
        idList: [this.form.Id],
        type: this.form.Type
      })
    },
    //确认报修
    handleConfirmRepair() {
      this.$refs.repairAddForm.editToggleDialog(this.form.Id)
    },
    //确认报警
    handleConfirmAlarm() {
      this.$confirm('确认该报警 ？（确认后请及时处理）', '提示', {
        type: 'warning'
      })
        .then(() => {
          this.confirmAlarmFun(this.form.Id)
        })
        .catch(() => {})
    },
    confirmAlarmFun(Id) {
      if (this.form.Status != 0) {
        this.$emit('refresh')
        this.handleClose()
        return
      }
      updateStatus({
        id: Id
      }).then(res => {
        if (res.data.Code === 200) {
          this.$message.success('确认报警成功')
          this.$emit('refresh')
          this.handleClose()
        } else {
          this.$message.error('确认报警失败')
        }
      })
    },
    openDialog(row) {
      this.row = row
      this.loading = true
      this.alarmId = row.Id
      getAlarmDetail({
        alarmId: this.alarmId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.form = res.data.Data
            this.PointId = this.form.PointId
            this.Acttime = this.form.ALARM_EPOCH
            this.history.point = [this.form.PointId]
            this.history.startTime = new Date(this.form.ALARM_EPOCH)
            this.history.endTime = new Date(this.form.ALARM_EPOCH_CLEARED)
            this.history.deviceId = this.form.Mtid
            this.getStep({
              PointId: this.form.PointId,
              AlarmEpoch: this.form.ALARM_EPOCH,
              AlarmType: this.form.Status
            })
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取报警详情失败')
          this.loading = false
        })

      this.dialogVisible = true
    },
    getStep({ PointId, AlarmEpoch, AlarmType }) {
      getAlarmSchedule({
        PointId,
        AlarmEpoch,
        AlarmType
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.step = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取报警进度失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
.alarm-detail-dialog-box {
  .el-timeline-item__node--normal {
    left: -3px;
    background: #ffffff;
    border: 2px solid #1890ff;
  }
}
</style>
<style scoped lang="scss">
.part-title {
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 20px;
  margin: 0 0 16px 0;
}
.dialog-content-line {
  width: 100%;
  height: 1px;
  background: #e9e9e9;
  margin: 0 0 16px 0;
}
.time-line-content {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
  line-height: 22px;
  width: 350px;
}
.time-line-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
.time-line-top-active {
  color: #000;
}
.time-line-bottom {
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 16px;
}
.detail-timeline-box {
  max-height: 300px;
  overflow: auto;
}
</style>
