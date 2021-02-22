<template>
  <el-dialog
    width="440px"
    title="电价设置"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="140px"
      size="small"
    >
      <el-form-item label="统一电价（元/度）" prop="price">
        <el-select v-model="form.price" placeholder="请选择">
          <el-input placeholder="0.6465" v-model="form.price"></el-input>
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
        price: ''
      },
      rules: {
        price: [
          { required: true, message: '请选择', trigger: 'blur' },
          {
            pattern: /^\d+(,\d{3})*(\.\d{1,6})?$/,
            message: '请输入数值'
          }
        ]
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
