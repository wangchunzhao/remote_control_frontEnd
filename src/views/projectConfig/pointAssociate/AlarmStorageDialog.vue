<template>
  <el-dialog
    width="600px"
    title=""
    custom-class="point-storage-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
    append-to-body
  >
    <div v-loading="loading">
      <div style="font-weight: 500;margin-bottom: 15px;font-size: 15px;">
        报警规则
      </div>
      <div style="margin-left:20px;">
        <div style="line-height: 20px;">
          触发规则：
        </div>
        <template v-if="data.RuleSimulate && data.RuleSimulate.length">
          <div
            v-for="(item, index) in data.RuleSimulate"
            :key="index"
            style="line-height: 20px;"
          >
            {{ item.RuleText }}
          </div>
        </template>
        <template v-if="data.RuleState && data.RuleState.length">
          <div
            v-for="(item, index) in data.RuleState"
            :key="index"
            style="line-height: 20px;"
          >
            {{ item.RuleText }}
          </div>
        </template>
        <template>
          {{ data.RuleState === null && !data.RuleSimulate.length ? '无' : '' }}
          {{ data.RuleSimulate === null && !data.RuleState.length ? '无' : '' }}
        </template>
        <div style="line-height: 20px;margin-top: 10px;">
          清除规则：
        </div>
        <template v-if="data.AlarmClear">
          <div
            v-for="(item, index) in data.AlarmClear"
            :key="index"
            style="line-height: 20px;"
          >
            {{ item.RuleText }}
          </div>
        </template>
        <span v-if="data.AlarmClear">
          {{ !data.AlarmClear.length ? '无' : '' }}
        </span>

        <div style="line-height: 20px;margin-top: 10px;">
          报警升级：
        </div>
        <div style="line-height: 20px;">
          {{ data.Upgrade1 }}
        </div>
        <div style="line-height: 20px;">
          {{ data.Upgrade2 }}
        </div>
        <div style="line-height: 20px;">
          {{ data.Upgrade3 }}
        </div>
        {{ !data.Upgrade1 && !data.Upgrade2 && !data.Upgrade3 ? '无' : '' }}
      </div>

      <!-- ===================== -->
      <div style="font-weight: 500;margin: 15px 0;font-size: 15px;">
        通知规则
      </div>
      <div style="margin-left: 30px;">
        <div style="line-height: 20px;">
          通知方式：
        </div>
        <div style="line-height: 20px;">一般报警 - {{ data.normal }}</div>
        <div style="line-height: 20px;">重要报警 - {{ data.important }}</div>
        <div style="line-height: 20px;">紧急报警 - {{ data.emergency }}</div>
        <div style="line-height: 20px;margin-top: 10px;">
          清除时通知：
        </div>
        <div style="line-height: 20px;">{{ data.Clear }}</div>
        <div style="line-height: 20px;margin-top: 10px;">
          重复通知：
        </div>
        <div style="line-height: 20px;">{{ data.Repeat || '无' }}</div>
      </div>
      <div style="font-weight: 500;margin: 15px 0;font-size: 15px;">
        通知人员
      </div>
      <div style="margin-left: 30px;">
        <div
          v-for="(item, index) in data.Receive"
          :key="index"
          style="line-height: 22px;"
        >
          {{ item.RuleText }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getAlarmStrategyListView } from '@/api/alarmStrategyNew'
export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      data: {}
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    openDialog(id) {
      this.dialogVisible = true
      this.loading = true
      getAlarmStrategyListView({
        projectId: this.projectId,
        companyId: this.companyId,
        PointId: id,
        userID: undefined,
        typeID: undefined,
        strategyName: undefined,
        typeIDList: undefined,
        pageIndex: 1,
        pageSize: 100,
        OrderByField: undefined,
        IsDesc: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.data = res.data.Data.Data[0]
          } else {
            this.$message.error('报警策略获取失败')
          }
        })
        .catch(err => {
          this.$message.error('报警策略获取失败')
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleNoticeText(normal, important, emergency) {
      let str = ''
      if (normal) {
        str += normal + ','
      }
      if (important) {
        str += important + ','
      }
      if (emergency) {
        str += emergency + ','
      }
      return [...new Set(str.split(','))].join(',')
    }
  }
}
</script>

<style lang="scss">
.point-storage-dialog {
  .el-dialog__header {
    display: none;
  }
}
</style>
