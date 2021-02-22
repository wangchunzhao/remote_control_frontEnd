<template>
  <div class="point-connect">
    <el-tabs v-model="tabsActive">
      <el-tab-pane v-if="checkPermission([108])" label="阈值报警" name="first">
        <ThresholdAlarm />
      </el-tab-pane>
      <el-tab-pane v-if="checkPermission([127])" label="事件通知" name="second">
        <EventNotice />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ThresholdAlarm from './thresholdAlarm/Index'
import EventNotice from './eventNotice/Index'
import { checkPermission } from '@/utils/permissions'
export default {
  name: 'AlarmStrategyIndex',
  components: {
    ThresholdAlarm,
    EventNotice
  },
  data() {
    return {
      tabsActive: '',
      checkPermission
    }
  },
  mounted() {
    if (checkPermission([108])) {
      this.tabsActive = 'first'
    } else if (checkPermission([108])) {
      this.tabsActive = 'second'
    }
  }
}
</script>

<style lang="scss">
.point-connect {
  .el-tabs__header {
    margin-bottom: 0;
  }
  .el-tabs__nav-scroll {
    padding-left: 40px;
    background: #fff;
  }
}
</style>
