<template>
  <el-dialog
    width="380px"
    custom-class="filter-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="90px" size="small">
      <el-form-item label="资产分类:">
        <el-select
          filterable
          v-model="form.classifyIds"
          style="width: 100%;"
          clearable
          multiple
          collapse-tags
          placeholder="请选择"
        >
          <el-option
            v-for="item in classifyOptions"
            :label="item.TypeName"
            :key="item.ID"
            :value="item.ID"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="项目:">
        <el-select
          filterable
          v-model="form.projectIds"
          style="width: 100%;"
          clearable
          multiple
          collapse-tags
          placeholder="请选择"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态:">
        <el-select
          filterable
          v-model="form.statusIds"
          style="width: 100%;"
          collapse-tags
          clearable
          multiple
          placeholder="请选择"
        >
          <el-option label="使用中" :value="1" />
          <el-option label="闲置中" :value="2" />
          <el-option label="已验证" :value="3" />
          <el-option label="待验证" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="安装日期:">
        <el-date-picker
          v-model="form.installDateRange"
          type="daterange"
          range-separator="至"
          style="width: 100%;"
          start-placeholder="开始日期"
          value-format="yyyy-MM-dd"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="创建日期:">
        <el-date-picker
          v-model="form.createDateRange"
          type="daterange"
          range-separator="至"
          style="width: 100%;"
          start-placeholder="开始日期"
          value-format="yyyy-MM-dd"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button size="small" type="primary" @click.native="submitForm"
        >筛 选</el-button
      >
      <el-button
        size="small"
        type="text"
        @click.native="resetForm"
        style="font-size: 14px;"
      >
        <c-svg style="font-size: 15px;" name="undo" />
        重置筛选</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { getCompanyAssetsTypeList } from '@/api/assetTypeProject'

export default {
  data() {
    return {
      dialogVisible: false,
      classifyOptions: [],

      form: {
        projectIds: [],
        statusIds: [],
        installDateRange: null,
        createDateRange: null,
        classifyIds: []
      }
    }
  },
  computed: {
    projectOptions() {
      return this.$store.state.app.proList
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchOptions()
    },
    handleClose() {
      this.dialogVisible = false
    },
    resetForm() {
      Object.assign(this.form, {
        projectIds: [],
        statusIds: [],
        installDateRange: null,
        createDateRange: null,
        classifyIds: []
      })
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    submitForm() {
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    fetchOptions() {
      getCompanyAssetsTypeList({
        companyId: this.companyId
      }).then(res => {
        if (res.data.Code === 200) {
          this.classifyOptions = res.data.Data.subset
        }
      })
    }
  }
}
</script>

<style lang="scss">
.filter-dialog {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 30px 30px 20px 20px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
