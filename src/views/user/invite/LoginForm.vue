<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      :rules="formRules"
      label-width="0px"
      size="medium"
      class="form-wrap"
    >
      <div style="color: #5e6d82;text-align: center;margin-bottom: 24px;">
        账号已存在，请直接登录加入{{
          $route.query.type === 'company' ? '企业' : '项目'
        }}
      </div>
      <el-form-item prop="account" style="margin-bottom: 25px;">
        <el-input
          clearable
          disabled
          v-model="form.account"
          suffix-icon="el-icon-user"
          placeholder="用户名/手机号"
        />
        <input style="position: absolute;top: -999999px;" />
      </el-form-item>
      <el-form-item prop="password">
        <input type="password" style="position: absolute;top: -999999px;" />
        <el-input
          v-model="form.password"
          suffix-icon="el-icon-lock"
          placeholder="密码"
          type="password"
          show-password
          clearable
          @keyup.enter.native="submitForm('form')"
        />
      </el-form-item>
      <div style="padding-bottom: 15px;">
        <router-link to="/forgetPwd" class="forget-link">
          忘记密码？
        </router-link>
      </div>
      <div class="submit-btn">
        <el-button
          type="primary"
          :loading="loading"
          @click="submitForm('form')"
        >
          登 录
        </el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import { loginAndInvitation } from '@/api/invitation'
export default {
  props: {
    phone: String
  },
  data() {
    return {
      loading: false,
      form: {
        account: this.phone,
        password: ''
      },
      formRules: {
        account: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }]
      },
      dialogVisible: true
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true
          const { account, password } = this.form
          loginAndInvitation({
            account: account,
            pwd: password,
            invitationId: this.$route.query.invitationId
          })
            .then(({ data }) => {
              if (data.Code === 200) {
                this.$message.success('加入成功')
                const userInfo = data.Data
                if (
                  /Android|webOS|iPhone|iPod|iPad|BlackBerry|SymbianOS/i.test(
                    navigator.userAgent
                  ) // 移动端
                ) {
                  this.$emit('showSuccess', {
                    avatar: userInfo.avatar
                  })
                } else {
                  this.$store.commit('UPDATE_TOKEN', {
                    token: userInfo.token,
                    refreshToken: userInfo.refreshToken
                  })
                  this.$store.commit('UPDATE_USERINFO', userInfo)
                  this.$store
                    .dispatch('fetchCompanyList', { uid: userInfo.uid })
                    .then(() => {
                      this.$store
                        .dispatch('fetchProject', { uid: userInfo.uid })
                        .then(() => {
                          this.$router.push({ path: 'triggerRouterGuard' })
                          this.loading = false
                        })
                    })
                    .catch(err => {
                      console.error(err)
                    })
                }
              } else {
                this.$message(data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message('加入失败')
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-wrap {
  padding: 24px 35px;
  margin-bottom: 24px;
  box-sizing: border-box;
  border-radius: 6px;
  background: #fff;
}
.submit-btn {
  button {
    width: 100%;
  }
}
.forget-link {
  color: #20a0ff;
}
</style>
