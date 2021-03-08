<template>
  <el-dialog
    width="660px"
    title="联系人设置"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="part">
      <div class="part-title">
        通知方式
      </div>
      <el-checkbox-group v-model="checkList" :disabled="submitLoading">
        <el-checkbox label="1">弹屏</el-checkbox>
        <el-checkbox label="2">邮箱</el-checkbox>
        <el-checkbox label="3">微信</el-checkbox>
        <el-checkbox label="4">APP</el-checkbox>
        <el-checkbox label="5">短信</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="part">
      <div class="part-title">
        联系人
        <user-select :data="userList" @change="selectUser">
          <el-button
            type="primary"
            size="mini"
            :disabled="submitLoading"
            circle
            icon="el-icon-plus"
            style="margin-left: 10px;"
          />
        </user-select>
      </div>
      <div class="custom-panel-body">
        <el-table
          :data="contactTableData"
          style="width: 100%;"
          v-loading="tableLoading"
        >
          <el-table-column label="操作" width="60px">
            <template slot-scope="scope">
              <el-button
                type="text"
                :disabled="submitLoading"
                class="btn-danger"
                @click.native="deleteContact(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column min-width="100" prop="name" label="姓名" />
          <el-table-column min-width="100" prop="Mobile" label="电话" />
          <el-table-column
            min-width="100"
            prop="IsBindOfficial"
            label="是否关注公众号"
          >
            <template slot-scope="{ row }">
              <span>{{ row.IsBindOfficial ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="150" prop="Email" label="邮箱" />
        </el-table>
      </div>
    </div>
    <span slot="footer">
      <el-button
        size="medium"
        type="primary"
        @click.native="submit"
        :loading="submitLoading"
      >
        确 定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import UserSelect from './UserSelect'
import {
  setReportContact,
  getReportContact,
  getProjectReportContactUser
} from '@/api/reportContact'

export default {
  components: {
    UserSelect
  },
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      tableLoading: false,
      submitLoading: false,
      ProjectId: undefined,
      ReportContactId: undefined,
      userList: [], // 用户列表
      checkList: [], // 选择的通知方式
      contactTableData: [] // 选择的用户列表
    }
  },
  methods: {
    // 选择联系人
    selectUser(user) {
      if (user.check) {
        user.range = [
          new Date('2016', '9', '06', '00', '00', '00'),
          new Date('2016', '9', '06', '23', '59', '59')
        ]
        this.contactTableData.push(user)
      } else {
        this.contactTableData = this.contactTableData.filter(
          item => item.userId !== user.userId
        )
      }
    },
    // 删除联系人
    deleteContact(user) {
      this.contactTableData = this.contactTableData.filter(
        item => item.userId !== user.userId
      )
      this.userList.forEach(item => {
        if (item.userId === user.userId) {
          item.check = 0
        }
      })
    },
    openDialog(ProjectId) {
      this.ProjectId = ProjectId
      this.fetchNoticeList()
      this.fetchUserList()
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.submitLoading = false
      this.tableLoading = false
      this.ProjectId = undefined
      this.ReportContactId = undefined
      this.userList = []
      this.checkList = []
      this.contactTableData = []
    },
    // 提交
    submit() {
      if (!this.checkList.length) {
        this.$message.error('请选择通知方式')
        return
      } else if (!this.contactTableData.length) {
        this.$message.error('请至少添加一位联系人')
        return
      }
      this.submitLoading = true
      let data = {
        ReportContactId: this.ReportContactId,
        ProjectId: this.ProjectId,
        PlayScreen: this.checkList.includes('1') ? 1 : 0,
        Email: this.checkList.includes('2') ? 1 : 0,
        WeChat: this.checkList.includes('3') ? 1 : 0,
        App: this.checkList.includes('4') ? 1 : 0,
        Sms: this.checkList.includes('5') ? 1 : 0,
        Created: new Date().toISOString()
      }
      data.UserIdList = this.contactTableData.map(item => item.userId)
      setReportContact(data)
        .then(res => {
          if (res.data.Code === 200 && res.data.Data) {
            this.$message.success('设置成功')
            this.$emit('refresh')
            this.handleClose()
          } else {
            this.$message.error(res.data.Message)
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('设置失败')
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    fetchNoticeList() {
      getReportContact({
        projectId: this.ProjectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            if (res.data.Data) {
              let checkList = []
              let data = res.data.Data
              this.ReportContactId = data.ReportContactId
              if (data.PlayScreen) {
                checkList.push('1')
              }
              if (data.Email) {
                checkList.push('2')
              }
              if (data.WeChat) {
                checkList.push('3')
              }
              if (data.App) {
                checkList.push('4')
              }
              if (data.Sms) {
                checkList.push('5')
              }
              this.checkList = checkList
            } else {
              this.checkList = []
              this.ReportContactId = undefined
            }
          } else {
            this.$message.error('获取通知方式失败')
            this.checkList = []
            this.ReportContactId = undefined
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取通知方式失败')
          this.checkList = []
          this.ReportContactId = undefined
        })
    },
    // 获取项目联系人
    fetchUserList() {
      this.tableLoading = true
      getProjectReportContactUser({
        projectId: this.ProjectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            let userList = []
            data.map(item => {
              userList.push({
                userId: item.UserId,
                name: item.UserName,
                avatar: item.Avatar,
                check: item.IsCheck ? 1 : 0,
                Mobile: item.Mobile,
                Email: item.Email,
                IsBindOfficial: item.IsBindOfficial
              })
            })
            this.userList = userList
            this.contactTableData = userList.filter(item => item.check === 1)
          } else {
            this.$message.error('获取联系人失败')
            this.userList = []
            this.contactTableData = []
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取联系人失败')
          this.userList = []
          this.contactTableData = []
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>
<style scoped lang="scss">
.part {
  margin-bottom: 20px;
}
.part-title {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  color: #000000;
  line-height: 24px;
  margin-bottom: 10px;
}
</style>
