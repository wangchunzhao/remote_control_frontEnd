<template>
  <el-dialog
    width="415px"
    title="编辑子系统"
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="monitor-user-add-dialog"
  >
    <div v-loading="loading">
      <div style="margin-bottom: 16px;">选择子系统</div>
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
              :key="item.id"
              :label="item.id"
              >{{ item.mname }}</el-checkbox
            >
          </el-checkbox-group>
        </div>
      </div>
    </div>
    <div style="color: rgb(233, 233, 235);font-size: 10px;margin-top: 10px;">
      注意：拥有设备的子系统不可删除
    </div>
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submit"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { getProjectModelList, updateProjectModel } from '@/api/subarea'
export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,

      isIndeterminate: false,
      checkAll: false,
      checkOptions: [],
      checkList: [],
      submitLoading: false
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    industry() {
      return this.$store.state.app.project.Industry
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.loading = true
      getProjectModelList({
        Industry: this.industry,
        projectId: this.projectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.checkOptions = res.data.Data
            this.checkList = this.checkOptions
              .filter(item => item.ischecked)
              .map(item => item.id)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleCheckAllChange(value) {
      this.checkList = value ? this.checkOptions.map(item => item.id) : []
      this.isIndeterminate = false
    },
    checkGroupChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.checkOptions.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.checkOptions.length
    },
    submit() {
      this.submitLoading = true
      let list = this.checkList.map(item => ({
        projectId: this.projectId,
        modelId: item
      }))
      updateProjectModel({
        modelList: list
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('子系统编辑成功')

            this.dialogVisible = false
            setTimeout(() => {
              // 编辑了子系统后，通过刷新页面来更新路由。
              window.location.reload()
            }, 1000)
          } else {
            this.$message.error('子系统编辑失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('子系统编辑失败')
        })
        .finally(() => {
          this.submitLoading = false
        })
    }
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
