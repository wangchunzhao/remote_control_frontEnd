<template>
  <el-dialog
    width="500px"
    title="应用详情"
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
      <el-form-item label="应用名称" prop="name">
        <el-input
          clearable
          v-model="form.name"
          placeholder="请输入"
          style="width: 193px;"
        ></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="form.type"
          filterable
          clearable
          placeholder="请选择"
        >
          <el-option label="海康萤石" :value="0"></el-option>
          <el-option label="乐橙" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="AppKey" prop="appkey">
        <el-input
          clearable
          v-model="form.appkey"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="Secret" prop="secret">
        <el-input
          clearable
          v-model="form.secret"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        :loading="deleteLoading"
        v-if="form.id"
        size="medium"
        type="danger"
        @click.native="handleClickDelete"
        >删 除</el-button
      >
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
import {
  deleteVideoMonitorApplication,
  addOrUpdateVideoMonitorApplication
} from '@/api/videoMonitorApplication'
export default {
  data() {
    return {
      dialogVisible: false,
      deleteLoading: false,
      submitLoading: false,

      form: {
        id: '',
        name: '',
        type: '',
        appkey: '',
        secret: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        appkey: [{ required: true, message: '请输入', trigger: 'blur' }],
        secret: [{ required: true, message: '请输入', trigger: 'blur' }],
        type: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    openDialog(payload) {
      if (payload) {
        this.form.id = payload.VideoMonitorApplicationId
        this.form.name = payload.VideoMonitorApplicationName
        this.form.type = payload.Type
        this.form.appkey = payload.AppKey
        this.form.secret = payload.Secret
      }
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.form.id = ''
      this.form.name = ''
      this.form.type = ''
      this.form.appkey = ''
      this.form.secret = ''
      this.$refs.form.resetFields()
    },
    // 点击删除
    handleClickDelete() {
      this.$confirm(
        '删除应用后，应用下已添加到项目中的摄像头点位也将一并从平台中移除?',
        '确定要删除该应用吗',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.deleteLoading = true
          deleteVideoMonitorApplication({
            videoMonitorApplicationId: this.form.id
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('删除成功')
                this.dialogVisible = false
                this.$emit('refresh')
              } else {
                this.$message.error('操作失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
            .finally(() => {
              this.deleteLoading = false
            })
        })
        .catch(() => {})
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { id, name, type, appkey, secret } = this.form
          this.submitLoading = true
          addOrUpdateVideoMonitorApplication({
            VideoMonitorApplicationId: id || undefined,
            CompanyId: this.companyId,
            VideoMonitorApplicationName: name,
            Type: type,
            AppKey: appkey,
            Secret: secret,
            AccessToken: undefined,
            AccessTokenExpiredTime: undefined,
            VideoMonitorPointList: undefined
          })
            .then(res => {
              if (res.data.Code === 200) {
                if (res.data.Data.IsSuccess) {
                  this.$message.success(id ? '更新成功' : '添加成功')
                  this.$emit('refresh')
                  this.dialogVisible = false
                } else {
                  this.$message.error('操作失败')
                }
              } else {
                this.$message(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('操作失败')
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
