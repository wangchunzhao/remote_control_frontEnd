<template>
  <div class="login-page">
    <div class="login-content">
      <div class="brand-wrap">
        <img
          v-if="host === 'kdlhealth.sinocold.net'"
          style="width: 310px;"
          src="https://front-end-assets.oss-cn-shanghai.aliyuncs.com/images/KDLlogo.png"
          alt=""
        />
        <img
          v-else-if="
            host === 'yun.ikold.com.cn' ||
              host === 'ikold.com.cn' ||
              host === 'cloud.ikold.com.cn'
          "
          src="https://front-end-assets.oss-cn-shanghai.aliyuncs.com/images/ikold.png"
          style="width: 160px;"
          alt=""
        />
        <img
          v-else-if="host === 'service.haiercarrier.com'"
          src="https://cdn.sinocold.net/images/haier_logo.png"
          style="width: 240px;"
          alt=""
        />
        <div v-else class="sinocold-brand">
          <img
            class="sinocold-logo"
            src="https://front-end-assets.oss-cn-shanghai.aliyuncs.com/images/coolcare_logo.jpg"
            alt=""
          />
          <img
            class="coolcare-text"
            src="https://front-end-assets.oss-cn-shanghai.aliyuncs.com/images/coolcare_text.png"
            alt=""
          />
        </div>
        <LangSelect class="lang-select" />
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="0px"
        size="medium"
        class="login-form"
      >
        <h3 class="platform-name">
          {{
            host === 'kdlhealth.sinocold.net'
              ? '温湿度综合管理平台'
              : '物联网设备管理云平台'
          }}
        </h3>
        <el-form-item
          prop="account"
          v-show="isAccountNormalLogin"
          style="margin-bottom: 25px;"
        >
          <el-input
            clearable
            v-model="form.account"
            suffix-icon="el-icon-user"
            :placeholder="'用户名/手机号'"
          />
        </el-form-item>
        <el-form-item v-show="isAccountNormalLogin" prop="password">
          <el-input
            v-model="form.password"
            suffix-icon="el-icon-lock"
            placeholder="密码"
            type="password"
            clearable
            @keyup.enter.native="submitForm('form')"
          />
        </el-form-item>
        <el-form-item
          v-show="!isAccountNormalLogin"
          prop="phone"
          style="margin-bottom: 25px;"
        >
          <el-input
            clearable
            v-model="form.phone"
            suffix-icon="el-icon-mobile-phone"
            :placeholder="'手机号'"
          />
        </el-form-item>

        <el-form-item v-show="!isAccountNormalLogin" prop="code">
          <el-input
            v-model="form.code"
            :maxlength="4"
            :minlength="4"
            clearable
            placeholder="短信验证码"
          >
            <template slot="append">
              <el-button
                :disabled="!canSent"
                class="send-msg-btn"
                @click.native="sendMsg"
              >
                <span v-show="canSent">获取验证码</span>
                <span v-show="!canSent">{{ time }} S</span>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button
            type="primary"
            :loading="loading"
            @click="submitForm('form')"
          >
            {{
              isAccountNormalLogin
                ? $t('login.logIn')
                : acountExist
                ? $t('login.logIn')
                : '注 册'
            }}
          </el-button>
        </div>
        <div class="switch-btns">
          <div>
            <el-link
              @click.native="
                () => {
                  isAccountNormalLogin = !isAccountNormalLogin
                  acountExist = true
                }
              "
              type="primary"
              :underline="false"
            >
              {{ isAccountNormalLogin ? '验证码登录' : '账号密码登录' }}
            </el-link>
            <el-link
              @click.native="
                () => {
                  isAccountNormalLogin = false
                  acountExist = false
                }
              "
              type="primary"
              :underline="false"
            >
              注册
            </el-link>
          </div>
          <el-link
            type="info"
            @click.native="() => $router.push({ name: 'forgetPwd' })"
            :underline="false"
            >忘记密码</el-link
          >
        </div>
      </el-form>
      <div class="ms-helpers">
        <div
          v-if="host === 'kdlhealth.sinocold.net'"
          style="color: #fff;text-align: center;margin-top: 25px;"
        >
          Powered by
          <span style="font-size: 16px;font-weight: bold;">CoolCare</span> v4.1
          <div
            style="font-size: 12px;margin-top: 12px; color: rgb(165, 167, 169);"
          >
            <el-tooltip
              class="item"
              effect="light"
              content="秦骏设备监控软件 V4.1"
              placement="bottom"
            >
              <span>
                版权信息
              </span>
            </el-tooltip>
          </div>
        </div>
        <div
          v-else-if="
            host === 'yun.ikold.com.cn' ||
              host === 'ikold.com.cn' ||
              host === 'cloud.ikold.com.cn'
          "
          style="color: #fff;text-align: center;margin-top: 25px;"
        >
          Powered by
          <span style="font-size: 16px;font-weight: bold;"
            >Cryotek Refrigeration</span
          >
          v4.3
        </div>
        <div class="tool-link" v-else>
          <el-tooltip effect="light" placement="right">
            <div slot="content">
              <img
                src="https://front-end-assets.oss-cn-shanghai.aliyuncs.com/images/c1db124cb50e5f47c2a2e4ca5ce021e5.png"
                style="width: 200px;height: 200px;"
                alt=""
              />
            </div>
            <el-link :underline="false">app下载</el-link>
          </el-tooltip>
          <span class="dividing-line"> | </span>
          <el-link
            @click.native="() => $router.push({ name: 'companyRegister' })"
            :underline="false"
            >企业注册</el-link
          >
          <span class="dividing-line"> | </span>
          <el-link :underline="false" @click.native="goHelp">
            获取帮助
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { login, loginOrRegister, loginOrRegisterSMSCode } from '@/api/user'
import '@/utils/browserUpdate.js'
import { exists } from '@/api/user'
import LangSelect from '@/components/LangSelect'
const phoneRule = /^[1]([3-9])[0-9]{9}$/
export default {
  components: {
    LangSelect
  },
  data() {
    const checkPhone = (rule, value, callback) => {
      if (this.isAccountNormalLogin) {
        callback()
        return
      }
      if (phoneRule.test(value)) {
        exists({
          Mobile: value
        }).then(res => {
          if (res.data.Code === 200) {
            if (res.data.Data.IsSuccess) {
              this.acountExist = true
            } else {
              this.acountExist = false
            }
          }
        })
        callback()
      } else {
        callback(new Error('请输入手机号'))
      }
    }
    const checkCode = (rule, value, callback) => {
      if (this.isAccountNormalLogin) {
        callback()
        return
      }
      if (value && value.length === 4) {
        callback()
      } else {
        callback(new Error('输入4位数验证码'))
      }
    }
    const checkPassword = (rule, value, callback) => {
      if (!this.isAccountNormalLogin) {
        callback()
        return
      }
      if (value) {
        callback()
      } else {
        callback(new Error('输入密码'))
      }
    }
    const checkAccount = (rule, value, callback) => {
      if (!this.isAccountNormalLogin) {
        callback()
        return
      }
      if (value) {
        callback()
      } else {
        callback(new Error('输入账号'))
      }
    }
    return {
      loading: false,
      isAccountNormalLogin: false,
      acountExist: true,
      form: {
        account: '',
        phone: '',
        password: '',
        code: ''
      },
      rules: {
        account: [
          {
            validator: checkAccount,
            trigger: 'blur'
          }
        ],
        phone: [
          {
            validator: checkPhone,
            trigger: 'blur'
          }
        ],
        password: [
          {
            validator: checkPassword,
            trigger: 'blur'
          }
        ],
        code: [
          {
            validator: checkCode,
            trigger: 'blur'
          }
        ]
      },
      time: 60,
      canSent: true,
      host: window.location.host
    }
  },
  computed: {
    language() {
      return this.$store.getters.language
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true
          const { account, password, code, phone } = this.form
          if (this.isAccountNormalLogin) {
            login({
              account: account,
              pwd: password
            })
              .then(async res => {
                const result = res.data.Data
                if (result.code !== '200') {
                  if (result.msg === '该账户无效！') {
                    this.$router.push({
                      path: '/forgetPwd',
                      query: { phone: this.form.account }
                    })
                    this.$notify.info({
                      title: '消息',
                      message: '为了您的账号安全，请修改默认的密码再进行登录',
                      duration: 30000
                    })
                  } else {
                    this.$message.error(result.msg)
                    this.loading = false
                  }
                } else {
                  this.$store.commit('UPDATE_TOKEN', {
                    token: result.token,
                    refreshToken: result.refreshToken
                  })
                  this.$store.commit('UPDATE_USERINFO', result)
                  this.$store.dispatch('fetchUserPreference')
                  await this.$store.dispatch('fetchCompanyList', {
                    uid: result.uid
                  })
                  await this.$store.dispatch('fetchProject', {
                    uid: result.uid
                  })
                  this.$router.push({ name: 'triggerRouterGuard' })
                  this.loading = false
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('服务器繁忙，请重试')
                this.loading = false
              })
          } else {
            // 手机号登录
            loginOrRegister({
              Mobile: phone,
              SMSCode: code,
              Avatar: undefined
            })
              .then(async res => {
                const result = res.data.Data
                if (result.code !== '200') {
                  if (result.msg === '该账户无效！') {
                    this.$router.push({
                      path: '/forgetPwd',
                      query: { phone: this.form.account }
                    })
                    this.$notify.info({
                      title: '消息',
                      message: '为了您的账号安全，请修改默认的密码再进行登录',
                      duration: 30000
                    })
                  } else {
                    this.$message(result.msg)
                    this.loading = false
                  }
                } else {
                  this.$store.commit('UPDATE_TOKEN', {
                    token: result.token,
                    refreshToken: result.refreshToken
                  })
                  this.$store.commit('UPDATE_USERINFO', result)
                  this.$store.dispatch('fetchUserPreference')

                  await this.$store.dispatch('fetchCompanyList', {
                    uid: result.uid
                  })
                  await this.$store.dispatch('fetchProject', {
                    uid: result.uid
                  })
                  this.$router.push({ name: 'triggerRouterGuard' })
                  this.loading = false
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('服务器繁忙，请重试')
                this.loading = false
              })
          }
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    sendMsg() {
      const { phone } = this.form
      if (!phoneRule.test(phone)) {
        this.$message('请输入手机号')
        return false
      }
      this.canSent = false
      this.countDown()
      loginOrRegisterSMSCode({
        mobile: phone,
        region: '+86'
      }).catch(err => {
        console.error(err)
        this.$message.error('验证码发送失败')
      })
    },
    countDown() {
      if (this.time === 0) {
        this.canSent = true
        this.time = 60
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
.login-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background: #324157;
  .login-content {
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%, -50%);
    width: 320px;
  }
  .brand-wrap {
    position: relative;
    text-align: center;
    padding-bottom: 24px;
  }
  .sinocold-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    .sinocold-logo {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      margin-right: 16px;
    }
    .coolcare-text {
      width: 153px;
    }
    span {
      font-size: 24px;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
    }
  }
  .login-form {
    width: 320px;
    padding: 24px 35px;
    margin-bottom: 24px;
    box-sizing: border-box;
    border-radius: 6px;
    background: #fff;
  }
  .platform-name {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 25px 0;
    font-family: PingFangSC;
    text-align: center;
    color: #000000;
  }
  .login-btn {
    button {
      width: 100%;
    }
  }
  .switch-btns {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  .forget-link {
    color: #20a0ff;
  }
  .tool-link {
    text-align: center;
    .el-link.el-link--default {
      font-weight: normal;
      color: rgba(255, 255, 255, 0.45);
      &:hover {
        color: #409eff;
      }
    }
  }
  .dividing-line {
    color: rgba(255, 255, 255, 0.45);
  }
}

.ms-helpers .helper-title {
  text-align: center;
  font-size: 18px;
  color: #fff;
}
</style>

<style lang="scss">
.login-page {
  .lang-select {
    position: absolute;
    right: 0px;
    top: 15px;
    .icon {
      color: #fff;
    }
  }
}
</style>
