<template>
  <div class="eventcenter">
    <page-header :title="$route.meta.title">
      <template v-slot:right>
        <el-button
          size="mini"
          style="padding: 5px 7px;margin-left: 15px;"
          plain
          @click.native="handleWatchList"
        >
          <c-svg name="wenjian"></c-svg>
          查看事件列表
        </el-button>
      </template>
    </page-header>
    <el-tabs v-model="tabsActive">
      <el-tab-pane v-if="checkPermission([124])" label="事件列表" name="first">
        <EventList />
      </el-tab-pane>
      <el-tab-pane v-if="checkPermission([125])" label="事件通知" name="second">
        <EventNotice />
      </el-tab-pane>
    </el-tabs>
    <ListDialog ref="listDialog" />
  </div>
</template>

<script>
import EventList from './eventList/Index'
import EventNotice from '@/views/alarmStrategy/eventNotice/Index'
import ListDialog from './ListDialog'
import { checkPermission } from '@/utils/permissions'
export default {
  name: 'EventCenter',
  components: {
    EventList,
    EventNotice,
    ListDialog
  },
  data() {
    return {
      tabsActive: '',
      checkPermission
    }
  },
  mounted() {
    if (checkPermission([124])) {
      this.tabsActive = 'first'
    } else if (checkPermission([125])) {
      this.tabsActive = 'second'
    }
  },
  methods: {
    handleWatchList() {
      this.$refs.listDialog.openDialog()
    }
  }
}
</script>

<style lang="scss">
.eventcenter {
  .el-tabs__header {
    margin-bottom: 0;
  }
  .el-tabs__nav-scroll {
    padding-left: 40px;
    background: #fff;
  }
}
</style>
