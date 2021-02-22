<template>
  <el-dialog
    width="1000px"
    title="通知推送记录"
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="event-msg-history-dialog"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane label="App记录" name="first">
        <el-table
          v-loading="tableLoadingApp"
          :data="tableDataApp"
          style="width: 100%;margin-top: 20px;"
          @filter-change="filterChangeApp"
        >
          <el-table-column
            column-key="UserName"
            prop="UserName"
            :filters="userOptionsApp"
            label="姓名"
          />
          <el-table-column prop="Mobile" label="号码" />
          <el-table-column
            column-key="PushType"
            prop="PushType"
            :filters="pushTypeOptions"
            label="推送类型"
          >
            <template slot-scope="{ row }">
              {{
                row.PushType !== null
                  ? pushTypeOptions.find(item => item.value === row.PushType)
                      .text
                  : ''
              }}
            </template>
          </el-table-column>
          <el-table-column prop="SendTime" label="发送时间" />
          <el-table-column
            column-key="SendStatus"
            prop="SendStatus"
            :filter-multiple="false"
            :filters="[
              { text: '成功', value: true },
              { text: '失败', value: false }
            ]"
            label="发送状态"
          >
            <template slot-scope="{ row }">
              <el-tag size="mini" :type="row.SendStatus ? 'success' : 'info'">{{
                row.SendStatus ? '成功' : '失败'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            column-key="IsRead"
            prop="IsRead"
            :filter-multiple="false"
            :filters="[
              { text: '已读', value: true },
              { text: '未读', value: false }
            ]"
            label="是否已读"
          >
            <template slot-scope="{ row }">
              <el-tag size="mini" :type="row.IsRead ? 'success' : 'info'">{{
                row.IsRead ? '已读' : '未读'
              }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap" style="margin-bottom: 20px;">
          <el-pagination
            background
            :current-page.sync="paginationApp.currentPage"
            :page-size.sync="paginationApp.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="paginationApp.total"
            @size-change="handleSizeChangeApp"
            @current-change="handleCurrentChangeApp"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="短信记录" name="second">
        <el-table
          v-loading="tableLoadingSMS"
          :data="tableDataSMS"
          style="width: 100%;margin-top: 20px;"
          @filter-change="filterChangeSMS"
        >
          <el-table-column
            column-key="UserName"
            prop="UserName"
            width="80"
            :filters="userOptionsSMS"
            label="姓名"
          />
          <el-table-column width="110" prop="Mobile" label="号码" />
          <el-table-column
            column-key="PushType"
            prop="PushType"
            width="90"
            :filters="pushTypeOptions"
            label="推送类型"
          >
            <template slot-scope="{ row }">
              {{
                row.PushType !== null
                  ? pushTypeOptions.find(item => item.value === row.PushType)
                      .text
                  : ''
              }}
            </template>
          </el-table-column>
          <el-table-column width="155" prop="SendTime" label="发送时间" />
          <el-table-column width="155" prop="ReceiptTime" label="接收时间" />
          <el-table-column
            column-key="SendStatus"
            prop="SendStatus"
            width="90"
            :filter-multiple="false"
            :filters="[
              { text: '成功', value: true },
              { text: '失败', value: false }
            ]"
            label="发送状态"
          >
            <template slot-scope="{ row }">
              <el-tag size="mini" :type="row.SendStatus ? 'success' : 'info'">{{
                row.SendStatus ? '成功' : '失败'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            column-key="ReceiptStatus"
            prop="ReceiptStatus"
            width="90"
            :filter-multiple="false"
            :filters="[
              { text: '成功', value: true },
              { text: '失败', value: false }
            ]"
            label="接收状态"
          >
            <template slot-scope="{ row }">
              <el-tag
                size="mini"
                :type="row.ReceiptStatus ? 'success' : 'info'"
                >{{ row.ReceiptStatus ? '成功' : '失败' }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="Explain" label="说明" />
        </el-table>
        <div class="pagination-wrap" style="margin-bottom: 20px;">
          <el-pagination
            background
            :current-page.sync="paginationSMS.currentPage"
            :page-size.sync="paginationSMS.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="paginationSMS.total"
            @size-change="handleSizeChangeSMS"
            @current-change="handleCurrentChangeSMS"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="语音记录" name="thrid">
        <el-table
          v-loading="tableLoadingVoice"
          :data="tableDataVoice"
          style="width: 100%;margin-top: 20px;"
          @filter-change="filterChangeVoice"
        >
          <el-table-column
            column-key="UserName"
            prop="UserName"
            width="80"
            :filters="userOptionsVoice"
            label="姓名"
          />
          <el-table-column width="110" prop="Mobile" label="号码" />
          <el-table-column
            column-key="PushType"
            prop="PushType"
            width="90"
            :filters="pushTypeOptions"
            label="推送类型"
          >
            <template slot-scope="{ row }">
              {{
                row.PushType !== null
                  ? pushTypeOptions.find(item => item.value === row.PushType)
                      .text
                  : ''
              }}
            </template>
          </el-table-column>
          <el-table-column width="155" prop="SendTime" label="发送时间" />
          <el-table-column width="155" prop="ReceiptTime" label="接收时间" />
          <el-table-column
            column-key="SendStatus"
            prop="SendStatus"
            width="90"
            :filter-multiple="false"
            :filters="[
              { text: '成功', value: true },
              { text: '失败', value: false }
            ]"
            label="发送状态"
          >
            <template slot-scope="{ row }">
              <el-tag size="mini" :type="row.SendStatus ? 'success' : 'info'">{{
                row.SendStatus ? '成功' : '失败'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            column-key="ReceiptStatus"
            prop="ReceiptStatus"
            width="90"
            :filter-multiple="false"
            :filters="[
              { text: '成功', value: true },
              { text: '失败', value: false }
            ]"
            label="接收状态"
          >
            <template slot-scope="{ row }">
              <el-tag
                size="mini"
                :type="row.ReceiptStatus ? 'success' : 'info'"
                >{{ row.ReceiptStatus ? '成功' : '失败' }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="Explain" label="说明" />
        </el-table>
        <div class="pagination-wrap" style="margin-bottom: 20px;">
          <el-pagination
            background
            :current-page.sync="paginationVoice.currentPage"
            :page-size.sync="paginationVoice.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="paginationVoice.total"
            @size-change="handleSizeChangeVoice"
            @current-change="handleCurrentChangeVoice"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    <span slot="footer" class="dialog-footer">
      <el-button
        size="medium"
        type="primary"
        @click.native="() => (dialogVisible = false)"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import {
  getSmsPushLogPage,
  getSmsPushLogUserDropdownList,
  getCallPushLogPage,
  getCallPushLogUserDropdownList,
  getAppPushLogUserDropdownList,
  getAppPushLogPage
} from '@/api/eventStrategy'
import debounde from 'lodash/debounce'

export default {
  data() {
    return {
      dialogVisible: false,
      activeName: 'first',
      EventId: undefined,
      time: undefined,
      pushTypeOptions: [
        { text: '触发', value: 0 },
        { text: '重复', value: 1 },
        { text: '升级', value: 2 },
        { text: '清除', value: 3 }
      ],

      userOptionsSMS: [],
      tableLoadingSMS: false,
      tableDataSMS: [],
      filterFormSMS: {
        userIdList: undefined,
        sendStatus: undefined,
        receiptStatus: undefined,
        pushType: undefined
      },
      paginationSMS: {
        currentPage: 1,
        size: 10,
        total: 0
      },

      userOptionsVoice: [],
      tableLoadingVoice: false,
      tableDataVoice: [],
      filterFormVoice: {
        userIdList: undefined,
        sendStatus: undefined,
        receiptStatus: undefined,
        pushType: undefined
      },
      paginationVoice: {
        currentPage: 1,
        size: 10,
        total: 0
      },

      userOptionsApp: [],
      tableLoadingApp: false,
      tableDataApp: [],
      filterFormApp: {
        userIdList: undefined,
        sendStatus: undefined,
        isRead: undefined,
        pushType: undefined
      },
      paginationApp: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  methods: {
    openDialog(EventId) {
      this.dialogVisible = true
      this.EventId = EventId
      this.fetchTableDataSMS()
      this.fetchUserOptionsSMS()
      this.fetchTableDataVoice()
      this.fetchUserOptionsVoice()
      this.fetchUserOptionsApp()
      this.fetchTableDataApp()
    },
    handleClose() {
      this.activeName = 'first'
      this.tableDataSMS = []
      this.paginationSMS.currentPage = 1
      this.paginationSMS.size = 10
      this.paginationSMS.total = 0
      this.filterFormSMS = {
        userIdList: undefined,
        sendStatus: undefined,
        receiptStatus: undefined
      }

      this.tableDataVoice = []
      this.paginationVoice.currentPage = 1
      this.paginationVoice.size = 10
      this.paginationVoice.total = 0
      this.filterFormVoice = {
        userIdList: undefined,
        sendStatus: undefined,
        receiptStatus: undefined
      }

      this.filterFormApp = {
        userIdList: undefined,
        sendStatus: undefined,
        isRead: undefined,
        pushType: undefined
      }
      this.tableDataApp = []
      this.paginationApp.currentPage = 1
      this.paginationApp.size = 10
      this.paginationApp.total = 0

      this.userOptionsSMS = []
      this.userOptionsVoice = []
      this.userOptionsApp = []
      this.dialogVisible = false
    },

    // 表格筛选
    filterChangeApp(filter) {
      if (filter.UserName) {
        this.filterFormApp.userIdList = filter.UserName
      } else if (filter.SendStatus) {
        if (filter.SendStatus.length) {
          this.filterFormApp.sendStatus = filter.SendStatus[0]
        } else {
          this.filterFormApp.sendStatus = undefined
        }
      } else if (filter.IsRead) {
        if (filter.IsRead) {
          this.filterFormApp.isRead = filter.IsRead[0]
        } else {
          this.filterFormApp.isRead = undefined
        }
      } else if (filter.PushType) {
        this.filterFormApp.pushType = filter.PushType
      }
      this.paginationApp.currentPage = 1
      this.fetchTableDataApp()
    },
    // 分页
    handleCurrentChangeApp() {
      this.fetchTableDataApp()
    },
    // 表格每页数量
    handleSizeChangeApp() {
      this.paginationApp.currentPage = 1
      this.fetchTableDataApp()
    },
    // 获取表格数据
    fetchTableDataApp: debounde(
      function() {
        this.tableLoadingApp = true
        const { userIdList, sendStatus, isRead, pushType } = this.filterFormApp
        const { currentPage, size } = this.paginationApp
        getAppPushLogPage({
          EventId: this.EventId,
          UserIdList: userIdList,
          SendStatus: sendStatus,
          PushTypeList: pushType,
          IsRead: isRead,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            let data = res.data
            if (data.Code === 200) {
              this.tableDataApp = data.Data.Data
              this.paginationApp.total = data.Data.TotalCount
            } else {
              this.tableDataApp = []
              this.paginationApp.total = 0
              this.$message.error('列表获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.tableDataApp = []
            this.paginationApp.total = 0
            this.$message.error('列表获取失败')
          })
          .finally(() => {
            this.tableLoadingApp = false
          })
      },
      400,
      {
        leading: true
      }
    ),

    // 表格筛选
    filterChangeSMS(filter) {
      if (filter.UserName) {
        this.filterFormSMS.userIdList = filter.UserName
      } else if (filter.SendStatus) {
        if (filter.SendStatus.length) {
          this.filterFormSMS.sendStatus = filter.SendStatus[0]
        } else {
          this.filterFormSMS.sendStatus = undefined
        }
      } else if (filter.ReceiptStatus) {
        if (filter.ReceiptStatus.length) {
          this.filterFormSMS.receiptStatus = filter.ReceiptStatus[0]
        } else {
          this.filterFormSMS.receiptStatus = undefined
        }
      } else if (filter.PushType) {
        this.filterFormSMS.pushType = filter.PushType
      }
      this.paginationSMS.currentPage = 1
      this.fetchTableDataSMS()
    },
    // 分页
    handleCurrentChangeSMS() {
      this.fetchTableDataSMS()
    },
    // 表格每页数量
    handleSizeChangeSMS() {
      this.paginationSMS.currentPage = 1
      this.fetchTableDataSMS()
    },
    // 获取表格数据
    fetchTableDataSMS: debounde(
      function() {
        this.tableLoadingSMS = true
        const {
          userIdList,
          sendStatus,
          receiptStatus,
          pushType
        } = this.filterFormSMS
        const { currentPage, size } = this.paginationSMS
        getSmsPushLogPage({
          EventId: this.EventId,
          UserIdList: userIdList,
          SendStatus: sendStatus,
          PushTypeList: pushType,
          ReceiptStatus: receiptStatus,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            let data = res.data
            if (data.Code === 200) {
              this.tableDataSMS = data.Data.Data
              this.paginationSMS.total = data.Data.TotalCount
            } else {
              this.tableDataSMS = []
              this.paginationSMS.total = 0
              this.$message.error('列表获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.tableDataSMS = []
            this.paginationSMS.total = 0
            this.$message.error('列表获取失败')
          })
          .finally(() => {
            this.tableLoadingSMS = false
          })
      },
      1000,
      {
        leading: true
      }
    ),

    // 表格筛选
    filterChangeVoice(filter) {
      if (filter.UserName) {
        this.filterFormVoice.userIdList = filter.UserName
      } else if (filter.SendStatus) {
        if (filter.SendStatus.length) {
          this.filterFormVoice.sendStatus = filter.SendStatus[0]
        } else {
          this.filterFormVoice.sendStatus = undefined
        }
      } else if (filter.ReceiptStatus) {
        if (filter.ReceiptStatus.length) {
          this.filterFormVoice.receiptStatus = filter.ReceiptStatus[0]
        } else {
          this.filterFormVoice.receiptStatus = undefined
        }
      } else if (filter.PushType) {
        this.filterFormVoice.pushType = filter.PushType
      }
      this.paginationVoice.currentPage = 1
      this.fetchTableDataVoice()
    },
    // 分页
    handleCurrentChangeVoice() {
      this.fetchTableDataVoice()
    },
    // 表格每页数量
    handleSizeChangeVoice() {
      this.paginationVoice.currentPage = 1
      this.fetchTableDataVoice()
    },
    // 获取表格数据
    fetchTableDataVoice: debounde(
      function() {
        this.tableLoadingVoice = true
        const {
          userIdList,
          sendStatus,
          receiptStatus,
          pushType
        } = this.filterFormVoice
        const { currentPage, size } = this.paginationVoice
        getCallPushLogPage({
          EventId: this.EventId,
          UserIdList: userIdList,
          SendStatus: sendStatus,
          PushTypeList: pushType,
          ReceiptStatus: receiptStatus,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            let data = res.data
            if (data.Code === 200) {
              this.tableDataVoice = data.Data.Data
              this.paginationVoice.total = data.Data.TotalCount
            } else {
              this.tableDataVoice = []
              this.paginationVoice.total = 0
              this.$message.error('列表获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.tableDataVoice = []
            this.paginationSMS.total = 0
            this.$message.error('列表获取失败')
          })
          .finally(() => {
            this.tableLoadingVoice = false
          })
      },
      1000,
      {
        leading: true
      }
    ),

    fetchUserOptionsApp() {
      getAppPushLogUserDropdownList({
        EventId: this.EventId
      }).then(res => {
        if (res.data.Code === 200) {
          this.userOptionsApp = res.data.Data
          this.userOptionsApp.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
        }
      })
    },
    fetchUserOptionsSMS() {
      getSmsPushLogUserDropdownList({
        EventId: this.EventId
      }).then(res => {
        if (res.data.Code === 200) {
          this.userOptionsSMS = res.data.Data
          this.userOptionsSMS.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
        }
      })
    },
    fetchUserOptionsVoice() {
      getCallPushLogUserDropdownList({
        EventId: this.EventId
      }).then(res => {
        if (res.data.Code === 200) {
          this.userOptionsVoice = res.data.Data
          this.userOptionsVoice.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
div.event-msg-history-dialog {
  .el-dialog__body {
    padding: 0 24px;
  }
  .el-tabs__nav-scroll {
    padding-left: 0;
  }
  .el-tabs__nav-wrap {
    &::after {
      display: none;
    }
  }
}
</style>
