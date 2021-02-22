<template>
  <el-dialog
    width="415px"
    title="添加维保团队成员"
    append-to-body
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="maintenanceTeam-user-add-dialog"
  >
    <div v-loading="loading">
      <div>从企业中添加</div>
      <el-input
        size="small"
        clearable
        v-model="filterText"
        style="margin: 10px 0;"
        placeholder="搜索企业成员"
        suffix-icon="el-icon-search"
      ></el-input>
      <div class="panel">
        <div class="panel-header">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
          ></el-checkbox>
          &nbsp;{{ checkedList.length }}/{{ checkOptions.length }}项
        </div>
        <div class="panel-body thin-scroll">
          <el-checkbox-group v-model="checkedList" @change="checkGroupChange">
            <el-checkbox
              v-for="item in checkOptions"
              :key="item.Key"
              :label="item.Key"
            >
              <div>
                <c-avatar :src="item.Extend" :size="25" />
                <span style="margin-left: 10px;">
                  {{ item.Value }}
                </span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>

    <div style="margin: 16px 0;">查找用户</div>
    <el-select
      v-model="selectUserIds"
      multiple
      @change="selectChange"
      filterable
      collapse-tags
      remote
      size="small"
      style="width: 100%;"
      placeholder="通过手机号搜索"
      :remote-method="querySearchAsync"
      :loading="selectLoading"
    >
      <el-option
        v-for="item in selectOptions"
        :key="item.id"
        :label="item.nickname"
        :value="item.id"
      >
        <c-avatar
          :src="item.avatar"
          :size="25"
          style="vertical-align: middle;margin-right: 10px;"
        ></c-avatar>
        <span>{{ item.nickname }}</span>
      </el-option>
    </el-select>

    <span slot="footer">
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
import { getCompanyAllUserDropdown } from '@/api/userSubarea'
import { queryContact } from '@/api/user'

export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      submitLoading: false,
      filterText: '',
      isIndeterminate: false,
      checkAll: false,
      checkedList: [],
      options: [],

      selectOptions: [],
      selectOptionsHistory: [],
      selectLoading: false,
      selectUserIds: []
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    checkOptions() {
      return this.options.filter(
        v =>
          v.Value.toLowerCase().includes(this.filterText.toLowerCase()) ||
          v.Title.toLowerCase().includes(this.filterText.toLowerCase())
      )
    }
  },
  mounted() {
    // getMaintenancePageParameter({})
    this.fetchUserOptions()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchUserOptions()
    },
    handleClose() {
      this.checkedList = []
      this.filterText = ''
      this.selectUserIds = []
      this.isIndeterminate = false
      this.checkAll = false
      this.dialogVisible = false
    },
    handleCheckAllChange(value) {
      this.checkedList = value ? this.checkOptions.map(item => item.Key) : []
      this.isIndeterminate = false
    },
    checkGroupChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.checkOptions.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.checkOptions.length
    },
    submitForm() {
      let list = []
      this.checkOptions.forEach(item => {
        if (this.checkedList.includes(item.Key)) {
          list.push(item)
        }
      })
      this.selectUserIds.forEach(v => {
        const temp = this.selectOptionsHistory.find(vv => vv.id === v)
        if (temp) {
          list.push({
            Value: temp.nickname,
            Title: temp.mobile,
            Key: temp.id
          })
        }
      })
      if (!list.length) {
        this.$message('请至少选中一个要添加的成员')
        return false
      }
      this.$emit('change', list)
      this.dialogVisible = false
    },
    selectChange() {
      this.selectOptionsHistory = [
        ...this.selectOptionsHistory,
        ...this.selectOptions
      ]
    },
    querySearchAsync(queryString) {
      this.selectLoading = true
      queryContact(queryString)
        .then(res => {
          if (res.data.Code === 200 && res.data.Data) {
            this.selectOptions = [res.data.Data]
          } else {
            this.selectOptions = []
          }
        })
        .catch(err => {
          console.error(err)
          this.selectOptions = []
        })
        .finally(() => {
          this.selectLoading = false
        })
    },
    fetchUserOptions() {
      getCompanyAllUserDropdown({
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.options = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss">
.maintenanceTeam-user-add-dialog {
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
      display: flex;
      align-items: center;
      height: 35px;
    }
    .el-checkbox__label {
      & > div {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
