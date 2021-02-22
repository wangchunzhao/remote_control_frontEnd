<template>
  <el-dialog
    width="260px"
    title="设置截止日期"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="50px"
      size="small"
    >
      <el-form-item label="每月" prop="day">
        <el-select v-model="form.day" placeholder="请选择">
          <el-option v-for="i in 30" :key="i" :label="i" :value="i"></el-option>
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
export default {
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      form: {
        day: ''
      },
      rules: {
        day: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // const { name, deviceType, cycle, id } = this.form
          // CopyMaintenanceTemplate({
          //   MaintenanceTemplateId: id,
          //   CompanyId: this.companyId,
          //   BigTypeId: deviceType,
          //   BigTypeName: this.deviceTypes.find(item => item.id === deviceType)
          //     .mname,
          //   MaintenanceTemplateName: name,
          //   MaintenanceCycle: cycle
          // })
          // .then(res => {
          //   const data = res.data
          //   if (data.Code === 200) {
          //     if (data.Data.IsSuccess) {
          //       this.$message.success('模板复制成功')
          //       this.$router.push({
          //         name: 'maintenanceTemplate'
          //       })
          //     } else {
          //       this.$message.error('模板复制失败')
          //     }
          //   } else {
          //     this.$message.error('模板复制失败')
          //   }
          // })
          // .catch(err => {
          //   console.error(err)
          //   this.$message.error('模板新增失败')
          // })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
