<template>
  <el-dialog
    width="450px"
    title="复制模板"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      style="margin-right: 40px;"
      size="small"
    >
      <el-form-item label="新模板名称" prop="name">
        <el-input
          style="width: 200px;"
          v-model="form.name"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
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
import { copyDeviceTemplate } from '@/api/deviceTemplate'
export default {
  data() {
    return {
      dialogVisible: false,

      form: {
        name: '',
        id: undefined
      },
      submitLoading: false,
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    openDialog(id) {
      this.form.id = id
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { id, name } = this.form
          this.submitLoading = true
          copyDeviceTemplate({
            deviceTemplateId: id,
            deviceTemplateName: name
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('模板复制成功')
                this.dialogVisible = false
                this.$emit('refresh')
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('模板复制失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
