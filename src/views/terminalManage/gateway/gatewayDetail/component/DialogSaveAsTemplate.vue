<template>
  <el-dialog
    width="320px"
    title="保存为组合模板"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="85px"
      size="small"
    >
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="form.name"
          style="width: 170px"
          placeholder="请输入"
        ></el-input>
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
import { addOrUpdateDeviceTemplate } from '@/api/deviceTemplate'

export default {
  props: {
    list: Array
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      form: {
        name: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
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
          const { name } = this.form
          addOrUpdateDeviceTemplate({
            DeviceTemplateId: undefined,
            DeviceTemplateName: name,
            Device_Template_ModuleList: this.list,
            ShareAble: false
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('模板添加成功')
                this.dialogVisible = false
              } else {
                this.$message.error('模板添加失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('模板添加失败')
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
