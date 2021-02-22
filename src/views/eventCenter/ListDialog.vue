<template>
  <el-dialog
    width="848px"
    title="事件列表"
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="event-list-dialog"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane label="系统事件" name="first">
        <el-table :data="systemEventList" style="width: 100%;">
          <el-table-column prop="eventName" width="120" label="事件类型" />
          <el-table-column prop="parentName" width="140" label="所属资源类型" />
          <el-table-column prop="describe" label="事件描述" />
          <el-table-column prop="name" label="自定义" width="140">
            <template slot-scope="{ row }">
              <!-- 目前只有『修改离线判断间隔』可以修改 -->
              <el-link
                @click.native="() => $refs.intervalEditDialog.openDialog()"
                v-if="row.eventTypeId === 8"
                :underline="false"
                type="primary"
                >修改离线判断间隔</el-link
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="自定义事件" name="second">
        <el-table :data="customEventList" style="width: 100%;">
          <el-table-column prop="name" width="120" label="事件类型" />
          <el-table-column prop="name" width="140" label="所属资源类型" />
          <el-table-column prop="name" label="事件描述" />
          <el-table-column prop="name" label="自定义" width="140">
            <template>
              <el-link
                @click.native="() => $refs.intervalEditDialog.openDialog()"
                :underline="false"
                type="primary"
                >修改离线判断间隔</el-link
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <IntervalEditDialog ref="intervalEditDialog" />
  </el-dialog>
</template>

<script>
import IntervalEditDialog from './IntervalEditDialog'
import { getEventTypeAll } from '@/api/eventStrategy'
export default {
  components: {
    IntervalEditDialog
  },
  data() {
    return {
      activeName: 'first',
      dialogVisible: false,
      systemEventList: [{}, {}],
      customEventList: []
    }
  },
  mounted() {
    getEventTypeAll()
      .then(res => {
        if (res.data.Code === 200) {
          this.systemEventList = res.data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss">
div.event-list-dialog {
  .el-tabs__nav-scroll {
    padding-left: 0;
    margin-bottom: 15px;
  }
  .el-tabs__nav-wrap::after {
    display: none;
  }
  .el-dialog__body {
    padding: 0px 20px 30px 20px;
  }
}
</style>
