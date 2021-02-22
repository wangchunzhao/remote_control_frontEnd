<template>
  <div class="forget-wrap">
    <div class="form-wrap">
      <el-form
        v-if="step === 'step1'"
        ref="formCheck"
        :rules="formCheckRules"
        :model="formCheck"
      >
        <h3 class="title">
          找回密码
        </h3>
        <el-form-item prop="phone">
          <el-input v-model="formCheck.phone">
            <el-select
              slot="prepend"
              v-model="formCheck.areaCode"
              style="width: 90px;"
            >
              <el-option label="+86" value="+86" />
              <el-option label="+886" value="+886" />
            </el-select>
          </el-input>
          <!-- <el-input v-model="formCheck.phone" placeholder="请输入注册手机" /> -->
        </el-form-item>
        <el-form-item prop="code">
          <el-input
            v-model="formCheck.code"
            :maxlength="4"
            :minlength="4"
            placeholder="短信验证码"
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
        <el-button class="next-btn" type="primary" @click="next('formCheck')">
          下一步
        </el-button>
      </el-form>
      <el-form v-else ref="formPwd" :rules="formPwdRules" :model="formPwd">
        <h3 class="title">
          修改密码
        </h3>
        <el-form-item prop="pwd">
          <el-input
            v-model="formPwd.pwd"
            type="password"
            show-password
            placeholder="新密码"
          />
        </el-form-item>
        <el-form-item prop="rePwd">
          <el-input
            v-model="formPwd.rePwd"
            type="password"
            show-password
            placeholder="确认密码"
          />
        </el-form-item>
        <el-button class="next-btn" type="primary" @click="submit('formPwd')">
          确认修改
        </el-button>
      </el-form>
    </div>
  </div>
</template>
<script>
import { validatePhone } from '@/utils/checkAreaCode'
import { mobileCodeUP, changePwd } from '@/api/user'

export default {
  data() {
    const checkPhone = (rule, value, callback) => {
      if (validatePhone(this.formCheck.areaCode, value)) {
        callback()
      } else {
        callback(new Error('手机号格式错误'))
      }
    }
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.formPwd.pwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      step: 'step1',
      formCheck: {
        phone: '',
        code: '',
        areaCode: '+86'
      },
      formCheckRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      },
      formPwd: {
        pwd: '',
        rePwd: ''
      },
      formPwdRules: {
        pwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          {
            // /^[a-zA-Z0-9_-]{4,16}$/
            // /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*]{8,18}$/
            pattern: /^[a-zA-Z0-9_~!@#$%^&*\.]{8,16}$/,
            message: '8到16位（由字母数字特殊字符（_~!@#$%^&*.）组成）'
          }
        ],
        rePwd: [{ validator: validatePass, trigger: 'blur' }]
      },
      canSent: true,
      time: 120
    }
  },
  mounted() {
    if (this.$route.query.phone) {
      this.formCheck.phone = this.$route.query.phone
    }
  },
  methods: {
    next(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.step = 'step2'
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          changePwd({
            Mobile:
              this.formCheck.areaCode === '+86'
                ? this.formCheck.phone
                : this.formCheck.areaCode + this.formCheck.phone,
            Code: this.formCheck.code,
            Pwd: this.formPwd.pwd
          })
            .then(res => {
              if (res.data.Code === 200) {
                if (res.data.Data.IsSuccess) {
                  this.$message.success('密码修改成功')
                  this.$router.go(-1)
                } else {
                  this.$message.error('修改失败，请确保手机号与验证码无误')
                }
              } else {
                this.$message.error('密码修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('密码修改失败')
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    sendMsg() {
      const { phone, areaCode } = this.formCheck
      if (!phone) {
        this.$message('请输入手机号')
        return false
      }
      this.canSent = false
      this.countDown()
      mobileCodeUP({
        mobile: phone,
        title: '',
        region: areaCode
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

<style scoped lang="scss">
.title {
  margin: 0px auto 20px auto;
  text-align: center;
  color: #505458;
  font-size: 14px;
}
.form-wrap {
  width: 280px;
  margin: 0 auto 25px auto;
  margin-top: 25vh;
  padding: 25px;
  border-radius: 5px;
  background: #fff;
}
.next-btn {
  width: 100%;
}
.send-msg-btn {
  &:hover {
    color: #13ce66;
  }
}
.forget-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #324157;
}
.ms-title {
  width: 100%;
  text-align: center;
  font-size: 28px;
  color: #fff;
  padding-bottom: 15px;
}
</style>
