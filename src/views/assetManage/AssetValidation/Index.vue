<template>
  <div class="asset-validation">
    <el-tabs v-model="activeName">
      <el-tab-pane label="日程列表" name="first">
        <ScheduleList />
      </el-tab-pane>
      <el-tab-pane label="报告查询" name="second">
        <ReportQuery />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ScheduleList from './ScheduleList'
import ReportQuery from './ReportQuery'
export default {
  components: {
    ScheduleList,
    ReportQuery
  },
  data() {
    return {
      activeName: 'first'
    }
  }
}
</script>

<style lang="scss">
.asset-validation {
  .el-tabs__nav-scroll {
    padding-left: 40px;
    background: #fff;
  }
  .el-tabs__header {
    margin: 0;
  }
}
</style>
