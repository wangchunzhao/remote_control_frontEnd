<template>
  <div>
    <page-header title="能耗分析">
      <template v-slot:right>
        <div style="flex: 1;display: flex;justify-content: flex-end">
          <el-button
            @click.native="$refs.timeIntervalSetDialog.openDialog()"
            style="margin-left: 15px;"
            size="mini"
          >
            <c-svg name="time-circle" style="font-size: 13px;"></c-svg>
            时段设置
          </el-button>
          <el-button
            @click.native="$refs.groupBranchSetDialog.openDialog()"
            style="margin-left: 15px;"
            size="mini"
          >
            <c-svg name="time-circle" style="font-size: 13px;"></c-svg>
            分组设置
          </el-button>
        </div>
      </template>
    </page-header>
    <el-tabs class="page-tabs" v-model="activeName">
      <el-tab-pane label="基本概览" name="first">
        <Tab1 v-if="activeName === 'first'"></Tab1>
      </el-tab-pane>
      <el-tab-pane label="图表分析" name="second">
        <Tab2 v-if="activeName === 'second'"></Tab2>
      </el-tab-pane>
    </el-tabs>
    <TimeIntervalSetDialog
      ref="timeIntervalSetDialog"
      :projectId="projectId"
    ></TimeIntervalSetDialog>
    <GroupBranchSetDialog ref="groupBranchSetDialog"></GroupBranchSetDialog>
  </div>
</template>

<script>
import TimeIntervalSetDialog from '@components/TimeIntervalSetDialog/TimeIntervalSetDialog'
import GroupBranchSetDialog from '@components/GroupBranchSetDialog'
import Tab1 from './preview/Index'
import Tab2 from './analyze/Index'
export default {
  name: 'Index',
  components: {
    TimeIntervalSetDialog,
    GroupBranchSetDialog,
    Tab1,
    Tab2
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  data() {
    return {
      activeName: 'second'
    }
  },
  created() {
    if (this.$route.query.activeName) {
      this.activeName = this.$route.query.activeName
    }
  }
}
</script>

<style scoped></style>
