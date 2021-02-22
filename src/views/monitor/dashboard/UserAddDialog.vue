<template>
  <el-dialog
    width="415px"
    title="添加项目成员"
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="monitor-user-add-dialog"
  >
    <div v-loading="loading">
      <el-input
        size="small"
        clearable
        v-model="filterText"
        placeholder="输入手机号查找"
        suffix-icon="el-icon-search"
      ></el-input>
      <div style="margin: 16px 0;">从企业中添加</div>
      <div class="panel">
        <div class="panel-header">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
            >全选</el-checkbox
          >
          {{ checkList.length }}/{{ checkOptions.length }}项
        </div>
        <div class="panel-body thin-scroll">
          <el-checkbox-group v-model="checkList" @change="checkGroupChange">
            <el-checkbox
              v-for="item in checkOptions"
              :key="item.Id"
              :label="item.Id"
              >{{ item.Nickname }}</el-checkbox
            >
          </el-checkbox-group>
        </div>
      </div>
    </div>

    <span slot="footer">
      <el-button size="medium" @click.native="() => (dialogVisible = false)"
        >稍候添加</el-button
      >
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
import { addMembers } from '@/api/userSubarea'
import { getUserDropdownByMobileOrName } from '@/api/user'
import avatarFactory from '@/utils/avatarFactory'

export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      submitLoading: false,
      filterText: '',
      isIndeterminate: false,
      checkAll: false,
      checkOptions: [],
      checkList: []
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    project() {
      return this.$store.state.app.project
    }
  },
  watch: {
    filterText() {
      this.fetchUserList()
    }
  },
  methods: {
    openDialog(options) {
      this.dialogVisible = true
      this.checkOptions = options
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleCheckAllChange(value) {
      this.checkList = value ? this.checkOptions.map(item => item.Id) : []
      this.isIndeterminate = false
    },
    checkGroupChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.checkOptions.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.checkOptions.length
    },
    submitForm() {
      if (!this.checkList.length) {
        this.$message('请至少选中一个要添加的成员')
        return false
      }
      let list = []
      this.checkOptions.forEach(item => {
        if (this.checkList.includes(item.Id)) {
          list.push(item)
        }
      })
      list.forEach(item => {
        item.ProjectId = this.project.id
        item.CompanyId = this.companyId
      })
      this.submitLoading = true
      addMembers(list)
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.$message.success('成员添加成功')
            this.dialogVisible = false
          } else {
            this.$message.error('成员添加失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    fetchUserList: debounce(
      function() {
        this.checkList = []
        if (this.filterText === '') {
          this.checkOptions = []
          this.loading = false
          return false
        }
        this.loading = true

        getUserDropdownByMobileOrName({
          mobileOrName: this.filterText
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.checkOptions = res.data.Data
              this.checkOptions.forEach(item => {
                item.Id = item.Key
                item.Nickname = item.Value
                item.Avatar = item.Extend
              })
              if (
                !this.checkOptions.length &&
                /^[1]([3-9])[0-9]{9}$/.test(this.filterText)
              ) {
                this.$prompt('未查找到该用户，可以直接注册', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  inputValidator: function(value) {
                    if (
                      value.length > 2 &&
                      value.length < 15 &&
                      /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)
                    ) {
                      return true
                    } else {
                      return '名称长度（2至15之间），不可有特殊字符'
                    }
                  },
                  inputErrorMessage: ''
                })
                  .then(({ value }) => {
                    const user = {}
                    user.Avatar = avatarFactory(value)
                    user.ProjectId = this.project.id
                    user.CompanyId = this.companyId
                    user.Nickname = value
                    user.Mobile = this.filterText
                    addMembers([user])
                      .then(res => {
                        const data = res.data
                        if (data.Code === 200) {
                          this.$message.success('成员添加成功')
                        } else {
                          this.$message.error('成员添加失败')
                        }
                      })
                      .catch(err => {
                        console.error(err)
                      })
                  })
                  .catch(() => {})
              }
            } else {
              this.checkOptions = []
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.loading = false
          })
      },
      1000,
      {
        leading: true
      }
    )
  }
}
</script>

<style lang="scss">
.monitor-user-add-dialog {
  .el-dialog__body {
    padding: 16px 32px;
  }
  .panel {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
  .panel-header {
    height: 32px;
    line-height: 32px;
    padding: 0 15px;
    border-bottom: 1px solid #dcdfe6;
  }
  .panel-body {
    height: 250px;
    overflow: auto;
    padding: 10px 15px;
  }
  .el-checkbox-group {
    .el-checkbox {
      display: block;
      margin-bottom: 6px;
    }
  }
}
</style>
