<template>
  <div class="member-connect">
    <el-button type="primary" size="small" @click.native="clickConnect">
      关联成员
    </el-button>
    <el-button type="danger" size="small" @click.native="remove">
      批量移除
    </el-button>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;margin-top: 25px;"
      @selection-change="val => (multipleSelection = val)"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" label="#" width="50px" />
      <el-table-column prop="Nickname" label="负责人" />
      <el-table-column prop="Mobile" label="联系电话" />
      <el-table-column prop="SubareaName" label="管理范围" />
    </el-table>
    <el-pagination
      background
      :current-page.sync="pagination.currentPage"
      :page-size.sync="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog
      title="关联用户"
      :visible.sync="connectDialog"
      width="800px"
      @close="() => (connectMembers = [])"
    >
      <el-transfer
        v-model="connectMembers"
        filterable
        :titles="['可关联用户', '关联用户']"
        filter-placeholder="通过用户名或所有分区查找"
        :data="connectSource"
      >
        <div slot-scope="{ option }" class="member-item">
          <img :src="option.Avatar" class="user-logo" />
          <div class="member-info">
            <div>{{ option.Nickname }} - {{ option.Mobile }}</div>
            <div style="font-size: 12px; color: #b4b4b4 !important;">
              {{ option.SubareaName }}
            </div>
          </div>
        </div>
      </el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="connectDialog = false"
          >取 消</el-button
        >
        <el-button type="primary" size="medium" @click="handleConnect"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getUsersConnectSource,
  roleConnectUser,
  getConnectedUser,
  disConnectUser
} from '@/api/userSubarea'
export default {
  props: {
    role: {
      type: Object,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      tableLoading: false,
      multipleSelection: [],
      tableData: [],
      connectDialog: false,
      connectSource: [],
      connectMembers: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  watch: {
    role: {
      handler: function(val) {
        if (val) {
          this.pagination.currentPage = 1
          this.fetchMemberList()
          getUsersConnectSource({
            companyId: this.$store.state.app.company.id,
            roleId: val.RoleId
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                data.Data.forEach(item => {
                  item.key = item.UserRoleSubareaId
                  item.label = item.Nickname + '-' + item.SubareaName
                })
                this.connectSource = data.Data
              } else {
                this.connectSource = []
              }
            })
            .catch(err => {
              console.error(err)
              this.connectSource = []
              this.$message.error('用户角色获取失败')
            })
        }
      },
      immediate: true
    }
  },
  methods: {
    clickConnect() {
      this.connectDialog = true
    },
    // 点击批量删除
    remove() {
      if (!this.multipleSelection.length) {
        this.$message('至少选择一位要移除的成员')
        return
      }
      this.$confirm('确认要移除选定人员', '确认', {
        type: 'warning',
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      })
        .then(() => {
          disConnectUser({
            UserRoleIdS: this.multipleSelection
              .map(item => item.User_roleId)
              .join(',')
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('人员移除成功')
                this.fetchMemberList()
              } else {
                this.$message.error('人员移除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('人员移除失败')
            })
        })
        .catch(() => {})
    },
    // 保存
    handleConnect() {
      if (!this.connectMembers.length) {
        this.$message('请至少选中一位要关联的用户')
        return false
      }
      roleConnectUser({
        RoleId: this.role.RoleId,
        UserRoleSubareaIds: this.connectMembers,
        CompanyId: this.$store.state.app.company.id
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.$message.success('人员关联成功')
            this.connectDialog = false
            this.fetchMemberList()
          } else {
            this.$message.error('人员关联失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('人员关联失败')
        })
    },
    handleCurrentChange() {
      this.fetchMemberList()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchMemberList()
    },
    fetchMemberList() {
      this.tableLoading = true
      getConnectedUser({
        RoleId: this.role.RoleId,
        companyId: this.$store.state.app.company.id,
        pageIndex: this.pagination.currentPage,
        pageSize: this.pagination.size
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.tableData = data.Data.Data
            this.pagination.total = data.Data.TotalCount
          } else {
            this.tableData = []
            this.pagination.total = 0
            this.$message.error('已关联人员获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('已关联人员获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>

<style lang="scss">
.member-connect {
  .member-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    img {
      flex: 0 0 45px;
      width: 45px;
      height: 45px;
      margin-right: 15px;
      border-radius: 50%;
    }
  }
  .el-transfer-panel__item {
    height: auto;
    line-height: auto;
  }
  .el-transfer-panel__item .el-checkbox__input {
    top: 15px;
  }
  .el-transfer-panel {
    width: 330px;
  }
  .el-transfer-panel__body {
    height: 380px;
  }
  .el-transfer-panel__list.is-filterable {
    height: 333px;
  }
  .el-transfer-panel__item.el-checkbox .el-checkbox__label {
    font-weight: normal;
    line-height: 20px;
  }
  .el-pagination {
    margin-top: 15px;
    text-align: center;
  }
}
</style>
