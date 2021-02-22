<template>
  <el-dialog
    width="370px"
    title="修改权限"
    :visible.sync="dialogVisible"
    class="standardAddDialog"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      size="small"
      style="margin:0 30px;"
    >
      <el-form-item prop="type" label="授权类型：">
        <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="item in typeList"
            :key="item.FuncGroupId"
            :label="item.FuncGroupName"
            :value="item.FuncGroupId"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <div slot="footer">
      <div
        style="display: flex;align-items: center;justify-content: space-between"
      >
        <div />
        <div>
          <el-button size="medium" @click.native="handleClose">取消</el-button>
          <el-button
            :loading="submitLoading"
            size="medium"
            type="primary"
            @click.native="submitForm"
            >确定</el-button
          >
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { addOrUpdateUserFuncGroup } from '@/api/userApply'
export default {
  props: {
    typeList: Array
  },
  data() {
    return {
      UserId: '',
      deviceId: '',
      dialogVisible: false,
      submitLoading: false,
      form: {
        type: ''
      },
      rules: {
        type: [{ required: true, message: '请输入', trigger: 'change' }]
      }
    }
  },
  methods: {
    openDialog(UserId, deviceId) {
      this.UserId = UserId
      this.deviceId = deviceId
      this.dialogVisible = true
    },
    handleClose() {
      this.form.type = ''
      this.$refs.form.clearValidate()
      this.dialogVisible = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          let data = {
            Type: 'Gateway',
            ForeignId: this.deviceId,
            UserFuncGroupList: [
              {
                UserId: this.UserId,
                FuncGroupId: this.form.type
              }
            ]
          }
          addOrUpdateUserFuncGroup(data)
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message.success('修改权限成功')
                this.$emit('refresh')
                this.handleClose()
              } else {
                this.$message.error('修改权限失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('修改权限失败')
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
