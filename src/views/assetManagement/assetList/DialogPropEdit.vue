<template>
  <el-dialog
    width="400px"
    title="修改资产属性"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
      <el-form-item label="属性类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择">
          <el-option label="项目" :value="0"></el-option>
          <el-option label="状态" :value="1"></el-option>
          <el-option label="安装日期" :value="2"></el-option>
          <el-option label="经销商" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.type === 0" label="项目" prop="projectId">
        <el-select v-model="form.projectId" filterable placeholder="请选择">
          <el-option
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.type === 1" label="状态" prop="statusId">
        <el-select v-model="form.statusId" filterable placeholder="请选择">
          <el-option label="使用中" :value="1" />
          <el-option label="闲置中" :value="2" />
          <el-option label="已验证" :value="3" />
          <el-option label="待验证" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.type === 2" label="安装日期" prop="installDate">
        <el-date-picker
          v-model="form.installDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="form.type === 3" label="经销商" prop="dealerId">
        <el-select v-model="form.dealerId" filterable placeholder="请选择">
          <el-option
            v-for="item in dealerOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
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
import { batchUpdateAssetsProperty, getDealerDropdownList } from '@/api/assets'
export default {
  props: {
    ids: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      dealerOptions: [],
      form: {
        type: 0,
        projectId: '',
        statusId: '',
        installDate: '',
        dealerId: ''
      },
      rules: {
        projectId: [{ required: true, message: '请选择', trigger: 'change' }],
        statusId: [{ required: true, message: '请选择', trigger: 'change' }],
        installDate: [{ required: true, message: '请选择', trigger: 'change' }],
        dealerId: [{ required: true, message: '请选择', trigger: 'change' }]
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
      this.fetchOption()
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { type, projectId, statusId, dealerId, installDate } = this.form
          const form = {
            ModelTreeIdList: this.ids,
            UpdateType: type
          }
          if (type === 0) {
            form.ProjectId = projectId
          } else if (type === 1) {
            form.Status = statusId
          } else if (type === 2) {
            form.InstallDate = installDate
          } else if (type === 3) {
            form.DealerId = dealerId
          }
          // ModelTreeIdList,
          // UpdateType,
          // ProjectId,
          // Status,
          // InstallDate,
          // locatDealerIdionZ
          this.submitLoading = true
          batchUpdateAssetsProperty(form)
            .then(res => {
              const data = res.data
              if (data.Code === 200 && data.Data) {
                this.$message.success('属性修改成功')
                this.dialogVisible = false
                this.$emit('complete')
              } else {
                this.$message.error('属性修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('属性修改失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    fetchOption() {
      getDealerDropdownList({
        companyId: this.companyId
      }).then(res => {
        if (res.data.Code === 200) {
          this.dealerOptions = res.data.Data
        }
      })
    }
  }
}
</script>
