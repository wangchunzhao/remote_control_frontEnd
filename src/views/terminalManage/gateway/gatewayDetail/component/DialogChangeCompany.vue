<template>
  <el-dialog
    width="400px"
    title="变更企业"
    :visible.sync="visible"
    append-to-body
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
      <el-form-item label="企业名称" prop="company">
        <el-select v-model="form.company" filterable placeholder="请选择">
          <el-option
            v-for="item in companyOptions"
            :label="item.CompanyName"
            :value="item.CompanyId"
            :key="item.CompanyId"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        size="medium"
        type="primary"
        :loading="submitLoading"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { updateCompanyDevice } from '@/api/device_new'
export default {
  props: {
    deviceId: Number
  },
  data() {
    return {
      visible: false,
      projectDialogVisible: false,
      projectOptions: [],
      form: {
        company: ''
      },
      rules: {
        company: [{ required: true, message: '请选择', trigger: 'blur' }]
      },
      submitLoading: false
    }
  },
  computed: {
    companyOptions() {
      return this.$store.state.app.companyList
    }
  },
  methods: {
    openDialog() {
      this.visible = true
    },
    handleClose() {
      this.visible = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const { company } = this.form
          updateCompanyDevice({
            deviceId: this.deviceId,
            companyId: company
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message.success('变更企业成功')
                this.$emit('complete')
                this.visible = false
              } else {
                this.$message.error('变更企业失败')
              }
            })
            .catch(err => {
              this.$message.error('变更企业失败')
              console.error(err)
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
