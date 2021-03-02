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
      <el-checkbox-group v-model="checkList">
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
              circle
              icon="el-icon-plus"
              style="margin-left: 10px;"
          />
        </user-select>
      </div>
      <div class="custom-panel-body">
        <el-table :data="contactTableData" style="width: 100%;">
          <el-table-column label="操作" width="60px">
            <template slot-scope="scope">
              <el-button
                type="text"
                class="btn-danger"
                @click.native="deleteContact(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column min-width="100" prop="name" label="姓名" />
          <el-table-column min-width="100" prop="mobile" label="电话" />
          <el-table-column
            min-width="100"
            prop="binding"
            label="是否关注公众号"
          />
          <el-table-column min-width="100" prop="mobile" label="邮箱" />
        </el-table>
      </div>
    </div>
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submit">
        确 定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import UserSelect from './UserSelect'
import { queryProjectConcats } from '@/api/alarmStrategyNew'

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
      submitLoading: false,
      userList: [], // 用户列表
      checkList: [], // 选择的通知方式
      contactTableData: [] // 选择的用户列表
    }
  },
  mounted() {
    this.fetchUserList()
  },
  methods: {
    // 选择联系人
    selectUser(user) {
      if (user.check) {
        user.range = [
          new Date('2016', '9', '06', '00', '00', '00'),
          new Date('2016', '9', '06', '23', '59', '59')
        ]
        // 默认选中所有的通知等级
        user.levels = [1, 2, 3]
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
          item.check = false
        }
      })
    },
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.submitLoading = false
    },
    // 提交
    submit() {
      this.submitLoading = true
      this.handleClose()
    },
    // 获取公司联系人
    fetchUserList() {
      // this.userList = []
      // queryProjectConcats({
      //   strategyID: strategyID,
      //   project: this.basicForm.project
      // })
      //     .then(res => {
      //       if (res.data.Code === 200) {
      //         const data = res.data.Data
      //         data.forEach(item => {
      //           if (!item.levels) {
      //             item.levels = []
      //           }
      //         })
      //         this.userList = data
      //       }
      //     })
      //     .catch(err => {
      //       console.error(err)
      //     })
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
