<template>
  <el-dialog
    width="550px"
    title="报警详情"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div v-loading="loading">
      <div style="line-height: 20px; padding-bottom: 10px;">
        设备名称：{{ data.MName }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        点位：{{ data.PointName }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        等级：
        <el-tag
          size="small"
          :type="
            data.Level === 3
              ? 'primary'
              : data.Level === 4
              ? 'info'
              : data.Level === 2
              ? 'warning'
              : 'danger'
          "
        >
          {{
            data.Level === 1
              ? '紧急'
              : data.Level === 2
              ? '重要'
              : data.Level === 3
              ? '一般'
              : '记录'
          }}
        </el-tag>
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        报警类型：{{ data.AlarmType }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        报警规则：{{ data.ALARM_SETTING }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        触发时间：{{ data.ALARM_EPOCH }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        持续时长：{{ data.ContinuedTime }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        最大超限：
        <el-button
          style="padding: 0"
          @click.native="() => $refs.historyDialog.toggleDialog()"
          type="text"
        >
          {{ data.MaxValue }}
        </el-button>
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        确认人：{{ data.AckedName }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        确认时间：{{ data.ALARM_EPOCH_ACKED }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        处理人：{{ data.CommentName }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        处理时间：{{ data.COMMENT_TIME }}
      </div>
      <div style="line-height: 20px; padding-bottom: 10px;">
        原因备注：{{ data.Comment }}
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button
        size="medium"
        :disabled="!data.PointId"
        @click.native="
          () =>
            $emit('open', {
              pointId: data.PointId,
              time: data.ALARM_EPOCH
            })
        "
        >查看推送记录</el-button
      >
      <el-button
        size="medium"
        type="primary"
        @click.native="() => (dialogVisible = false)"
        >确 定</el-button
      >
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
  </el-dialog>
</template>

<script>
import { getAlarmDetail } from '@/api/alarmActive'
import HistoryDialog from '@/components/HistoryDialog'

export default {
  components: {
    HistoryDialog
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      data: {},
      alarmId: undefined,

      history: {
        point: [],
        startTime: undefined,
        endTime: undefined,
        deviceId: 0
      }
    }
  },
  methods: {
    openDialog(id) {
      this.dialogVisible = true
      this.loading = true
      this.alarmId = id
      getAlarmDetail({
        alarmId: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.data = res.data.Data
            this.history.point = [this.data.PointId]
            this.history.startTime = new Date(this.data.ALARM_EPOCH)
            this.history.endTime = new Date(this.data.ALARM_EPOCH_CLEARED)
            this.history.deviceId = this.data.Mtid
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleClose() {
      this.dialogVisible = false
      this.data = {}
    }
  }
}
</script>
