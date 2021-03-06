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
            <span>{{ _dateFormat(item.maintainFirst, 'YYYY-MM-DD') }}</span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script>
import { getMaintainContractQuery } from '@/api/maintainContract'
export default {
  data() {
    return {
      loading: false,
      submitLoading: false,
      dialogVisible: false,

      data: {}
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
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
      display: none;
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
