<template>
  <el-dialog
    title="身份验证"
    :visible.sync="dialogVisible"
    width="400px"
    custom-class="userconfirm-dialog"
  >
    <div class="attention-info">
      这是一个危险操作，需要进行身份验证
    </div>
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item prop="password">
        <el-input
          v-model.trim="form.password"
          placeholder="请输入登录密码"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        size="small"
        type="danger"
        :loading="submitLoading"
        @click.native="submitForm('delProjectForm')"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { login } from '@/api/user'

export default {
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      form: {
        password: ''
      },
      rules: {
        password: [
          {
            required: true,
            message: '请输入登录密码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    userInfo: function() {
      return this.$store.state.app.userInfo
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
    submitForm: function() {
      var t = this
      this.$refs.form.validate(function(e) {
        if (!e) return console.log('error submit!!'), !1
        t.submitLoading = true
        login({
          account: t.userInfo.mobile,
          pwd: t.form.password
        })
          .then(function(e) {
            const data = e.data.Data
            if (data.code === '200') {
              t.$emit('validation')
              t.dialogVisible = false
            } else {
              t.$message('密码错误')
            }
          })
          .catch(err => {
            console.error(err)
            console.error('验证失败')
          })
          .finally(() => {
            t.submitLoading = false
          })
      })
    }
  }
}
</script>

<style lang="scss">
.userconfirm-dialog {
  .attention-info {
    padding: 10px;
    margin-bottom: 20px;
    background: #f2d7d8;
    font-size: 15px;
    color: #cc5454;
    border-radius: 4px;
  }
}
</style>
