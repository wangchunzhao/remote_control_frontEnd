<template>
  <el-form
    ref="form"
    :model="form"
    class="register-form-wrap"
    :rules="formRules"
    size="medium"
  >
    <div style="margin-bottom: 24px;text-align: center;color: #5e6d82;">
      直接注册并加入{{ $route.query.type === 'company' ? '企业' : '项目' }}
    </div>
    <el-form-item prop="phone" class="input-phone">
      <el-input disabled v-model.trim="form.phone" placeholder="手机号">
        <el-select slot="prepend" v-model="areaCode" style="width: 80px;">
          <el-option label="+86" value="+86" />
          <el-option label="+886" value="+886" />
        </el-select>
      </el-input>
    </el-form-item>
    <el-form-item error prop="userName">
      <el-input v-model.trim="form.userName" clearable placeholder="姓名" />
      <input style="position: fixed;top: -99999px;" />
    </el-form-item>
    <el-form-item prop="pwd">
      <input type="password" style="position: fixed;top: -99999px;" />
      <el-input
        v-model.trim="form.pwd"
        show-password
        clearable
        type="password"
        placeholder="密码"
      />
    </el-form-item>
    <el-form-item prop="checkPwd">
      <el-input
        v-model.trim="form.checkPwd"
        type="password"
        clearable
        show-password
        placeholder="确认密码"
      />
    </el-form-item>
    <el-form-item>
      <el-input
        v-model.trim="form.checkCode"
        placeholder="请输入验证码"
        :maxlength="4"
        :minlength="4"
        clearable
      >
        <template slot="append">
          <el-button
            :disabled="!canSent"
            class="send-msg-btn"
            @click.native="sendMsg"
          >
            <span v-show="canSent">发送短信</span>
            <span v-show="!canSent">{{ time }} S</span>
          </el-button>
        </template>
      </el-input>
    </el-form-item>
    <div class="submit-btn">
      <el-button
        type="primary"
        :loading="loading"
        style="width: 100%;"
        @click.native="submitForm('form')"
      >
        注册并加入{{ $route.query.type === 'company' ? '企业' : '项目' }}
      </el-button>
    </div>
  </el-form>
</template>
<script>
import { mobileCode, exists } from '@/api/user'
import { validatePhone, getAreaCode } from '@/utils/checkAreaCode'
import { registerAndInvitation } from '@/api/invitation'
import avatarFactory from '@/utils/avatarFactory'

export default {
  props: {
    phone: String
  },
  data() {
    const checkPhone = (rule, value, callback) => {
      if (!validatePhone(this.areaCode, value)) {
        callback(new Error('手机号格式错误'))
        return false
      }
      exists({ Mobile: value }).then(res => {
        if (res.data.Data.IsSuccess) {
          callback(new Error('该手机号已被注册'))
        } else {
          callback()
        }
      })
    }
    const pwdValidatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.form.checkPwd !== '') {
          this.$refs.form.validateField('checkPwd')
        }
        callback()
      }
    }
    const pwdValidatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.pwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      canSent: true,
      time: 120,
      areaCode: '+86',
      form: {
        userName: '',
        phone: '',
        pwd: '',
        checkPwd: '',
        checkCode: ''
      },
      formRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        pwd: [
          { validator: pwdValidatePass, trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9_~!@#$%^&*\.]{8,16}$/,
            message: '8到16位（由字母数字特殊字符（_~!@#$%^&*.）组成）'
          }
        ],
        checkPwd: [{ validator: pwdValidatePass2, trigger: 'blur' }]
      },
      loading: false
    }
  },
  watch: {
    phone: {
      handler: function(val) {
        const res = getAreaCode(val)
        this.areaCode = res.areaCode
        this.form.phone = res.phone
      },
      immediate: true
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true
          const { userName, phone, pwd, checkCode } = this.form
          registerAndInvitation({
            Mobile: phone,
            Pwd: pwd,
            Nickname: userName,
            SmsCode: checkCode,
            Avatar: avatarFactory(userName),
            invitationId: this.$route.query.invitationId
          })
            .then(({ data }) => {
              if (data.Code === 200) {
                this.$message.success('注册加入成功')
                const userInfo = data.Data
                if (
                  /Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(
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
                          this.$router.push({ path: '/monitor/dashboard' })
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
    },
    // 发送验证码
    sendMsg() {
      if (!this.form.phone) {
        this.$message('请填写手机号')
        return false
      }
      this.canSent = false
      this.countDown()
      mobileCode({
        mobile: this.form.phone,
        title: '',
        region: this.areaCode
      }).catch(err => {
        console.error(err)
        this.$message.error('验证码发送失败')
      })
    },
    countDown() {
      if (this.time === 0) {
        this.canSent = true
        this.time = 120
      } else {
        this.time--
        setTimeout(() => {
          this.countDown()
        }, 1000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.register-form-wrap {
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
