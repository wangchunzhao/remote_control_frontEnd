<template>
  <div>
    <page-header
      v-if="$route.meta.customHeader"
      :title="$route.meta.title"
      :showBack="$route.meta.showBackButton"
    >
      <template v-slot:right>
        <el-button
          v-permission="[131]"
          v-if="$route.name === 'alarmManageIndex'"
          @click.native="() => $router.push({ name: 'alarmPushStatistical' })"
          size="mini"
          plain
          style="padding: 5px 7px;margin-left: 15px;"
        >
          <c-svg name="linechart"></c-svg>
          推送统计
        </el-button>
      </template>
    </page-header>
    <el-tabs class="page-tabs" v-model="activeName">
      <el-tab-pane label="当前报警" name="first">
        <Alarming
          @change="() => $refs.confired.fetchTableData()"
          :project-id="
            $route.name === 'alarmManageIndex' ? projectId : undefined
          "
        />
      </el-tab-pane>
      <el-tab-pane label="已确认报警" name="second">
        <AlarmConfirmed
          ref="confired"
          :project-id="
            $route.name === 'alarmManageIndex' ? projectId : undefined
          "
        />
      </el-tab-pane>
      <el-tab-pane label="历史报警" name="thrid">
        <AlarmHistory
          :project-id="
            $route.name === 'alarmManageIndex' ? projectId : undefined
          "
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="$route.name === 'alarmManageIndex'"
        label="报警策略"
        name="four"
      >
        <AlarmStrategy />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AlarmStrategy from './alarmStrategy/Index'
import Alarming from './alarmCurrent/Index'
import AlarmConfirmed from './alarmConfirmed/Index'
import AlarmHistory from './alarmHistory/Index'
export default {
  name: 'AlarmManageIndex',
  components: {
    AlarmStrategy,
    Alarming,
    AlarmConfirmed,
    AlarmHistory
  },
  data() {
    return {
      activeName: 'first'
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  beforeRouteLeave(to, from, next) {
    this.activeName = 'first'
    next()
  }
}
</script>
