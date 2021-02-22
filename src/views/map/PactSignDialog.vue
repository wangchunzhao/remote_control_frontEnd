<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="680px"
    class="pact-detail-dialog"
    @close="handleClose"
  >
    <div slot="title">
      <span style="line-height: 24px;font-size: 18px;color: #303133;">
        合同详情：{{ data.contractNumber }}
        <el-tag
          v-if="!loading"
          size="small"
          :type="
            data.contractStatus === 0
              ? 'warning'
              : data.contractStatus === 1
              ? 'success'
              : data.contractStatus === 2
              ? 'info'
              : ''
          "
        >
          {{
            data.contractStatus === 0
              ? '待签约'
              : data.contractStatus === 1
              ? '执行中'
              : data.contractStatus === 2
              ? '已到期'
              : ''
          }}
        </el-tag>
      </span>
    </div>

    <div v-loading="loading">
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            合同名称
          </div>
        </el-col>
        <el-col :span="20">
          <div class="column-value">
            {{ data.contractName }}
          </div>
        </el-col>
      </el-row>
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            甲方企业
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ data.partyAName }}
          </div>
        </el-col>
        <el-col :span="4" class="column-label">
          <div>
            维保单位
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ data.partyBName }}
          </div>
        </el-col>
      </el-row>
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            设备类型
          </div>
        </el-col>
        <el-col :span="20">
          <div class="column-value">
            {{ data.maintainTypeName }}
          </div>
        </el-col>
      </el-row>
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            签订时间
          </div>
        </el-col>
        <el-col :span="20">
          <div class="column-value">
            {{ data.contractSignTime }}
          </div>
        </el-col>
      </el-row>
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            开始日期
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ _dateFormat(data.startDate, 'YYYY-MM-DD') }}
          </div>
        </el-col>
        <el-col :span="4" class="column-label">
          <div>
            结束日期
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ _dateFormat(data.endDate, 'YYYY-MM-DD') }}
          </div>
        </el-col>
      </el-row>
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            签订项目
          </div>
        </el-col>
        <el-col :span="20">
          <div class="column-value">
            {{
              data.projectList &&
                data.projectList.map(item => item.Value).join('，')
            }}
          </div>
        </el-col>
      </el-row>
      <el-row
        v-for="(item, index) in data.templateList"
        :key="item.templateId"
        class="row"
        type="flex"
      >
        <el-col :span="4" class="column-label">
          <div>保养模板{{ index + 1 }}</div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            <el-button
              style="padding: 0;"
              type="text"
              @click.native="handlePreView(item)"
            >
              {{ item.templateName }}
            </el-button>
          </div>
        </el-col>
        <el-col :span="4" class="column-label">
          <div>
            首保日期
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            <span v-if="!item.editable">{{
              _dateFormat(item.maintainFirst, 'YYYY-MM-DD HH')
            }}</span>
            <el-date-picker
              v-else
              type="datetime"
              size="mini"
              format="yyyy-MM-dd HH"
              v-model="item.maintainFirst"
              placeholder="选择时间"
              style="width: 100%;"
            ></el-date-picker>
            <el-button
              type="text"
              class="edit-btn"
              @click.native="() => handleEditTime(item)"
            >
              <c-svg :name="item.editable ? 'true' : 'bianji'" />
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="medium" @click="dialogVisible = false">取 消</el-button>
      <el-button
        size="medium"
        :loading="submitLoading"
        type="primary"
        @click="sigingPact"
        >签 约</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import {
  getMaintainContractQuery,
  signingMaintainContract,
  updateMaintainTime
} from '@/api/maintainContract'
export default {
  data() {
    return {
      loading: false,
      submitLoading: false,
      dialogVisible: false,

      data: {}
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
      this.data = {}
    },
    // 预览模板
    handlePreView(template) {
      if (!template.maintenance_Template.Url) {
        this.$message({
          message:
            '预览文件暂未生成，请前往模板详情页，点击预览报告按钮生成预览文件',
          duration: 10000
        })
        return false
      }
      window.open(template.maintenance_Template.Url, '_blank')
    },
    // 编辑模板的首保时间
    handleEditTime(item) {
      item.editable = !item.editable
      // 说明是编辑
      if (!item.editable) {
        updateMaintainTime({
          Key: item.templateId,
          Value:
            this._dateFormat(item.maintainFirst, 'YYYY-MM-DD HH') + ':00:00'
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.$message.success('时间修改成功')
            } else {
              this.$message.error('时间修改失败，请刷新页面重试')
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    // 签定合同
    sigingPact() {
      this.$confirm(
        `确认要与${this.data.partyAName}签订维保合同【${this.data.contractName}】？`,
        '提示',
        { type: 'warning' }
      )
        .then(() => {
          this.submitLoading = true
          signingMaintainContract({
            contractID: this.data.contractID,
            partyA: this.data.partyA,
            partyB: this.data.partyB,
            MaintenanceTemplate: this.data.templateList.map(item => {
              return {
                Key: item.templateId,
                Value:
                  this._dateFormat(item.maintainFirst, 'YYYY-MM-DD HH') +
                  ':00:00'
              }
            })
          })
            .then(res => {
              if (res.data.Code === 200) {
                if (res.data.Data.IsSuccess) {
                  this.$message.success('合同签订成功')
                  this.dialogVisible = false
                  this.$emit('refresh', this.data.contractID)
                } else {
                  this.$message.error('合同签订失败')
                }
              } else {
                this.$message.error('合同签订失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('合同签订失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        })
        .catch(() => {})
    },
    openDialog(id) {
      this.dialogVisible = true
      this.loading = true
      getMaintainContractQuery({
        contractID: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.templateList.forEach(item => {
              item.editable = false
            })
            this.data = data
          } else {
            this.$message.error('合同详情获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('合同详情获取失败')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.pact-detail-dialog {
  .row {
    border-bottom: 1px solid #ebeef5;
  }
  .column-label {
    box-sizing: border-box;
    padding: 14px 16px;
    background-color: #f2f6fc;
  }
  .column-value {
    box-sizing: border-box;
    padding: 12px 35px 12px 16px;
    position: relative;
    &:hover {
      .el-button.edit-btn {
        display: inline-block;
      }
    }
    .el-button.edit-btn {
      padding: 0;
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .el-dialog__body {
    padding: 20px;
  }
}
</style>
