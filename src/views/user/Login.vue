<template>
  <div class="login-page">
    <div class="login-content">
      <div class="brand-wrap">
        <img
          v-if="host === 'kdlhealth.sinocold.net'"
          style="width: 310px;"
          src="https://cdn.sinocold.net/images/KDLlogo.png"
          alt=""
        />
        <img
          v-else-if="
            host === 'yun.ikold.com.cn' ||
              host === 'ikold.com.cn' ||
              host === 'cloud.ikold.com.cn'
          "
          src="https://cdn.sinocold.net/images/ikold.png"
          style="width: 160px;"
          alt=""
        />
        <div v-else class="sinocold-brand">
          <img
            class="sinocold-logo"
            src="https://cdn.sinocold.net/images/coolcare_logo.jpg"
            alt=""
          />
          <img
            class="coolcare-text"
            src="https://cdn.sinocold.net/images/coolcare_text.png"
            alt=""
          />
        </div>
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
        <el-form-item prop="username" style="margin-bottom: 25px;">
          <el-input
            clearable
            v-model="form.username"
            suffix-icon="el-icon-user"
            placeholder="用户名/手机号"
          />
        </el-form-item>
        <el-form-item prop="password">
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
        <div class="login-btn">
          <el-button
            type="primary"
            :loading="loading"
            @click="submitForm('form')"
          >
            登 录
          </el-button>
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
                src="https://cdn.sinocold.net/images/c1db124cb50e5f47c2a2e4ca5ce021e5.png"
                style="width: 200px;height: 200px;"
                alt=""
              />
              <!-- <img
                src="https://cdn.sinocold.net/images_app/iOS%E4%B8%8B%E8%BD%BD%E5%BC%95%E5%AF%BC%E5%9B%BE.png"
                style="width: 150px;height: 198px;"
                alt=""
              />
              <img
                src="https://cdn.sinocold.net/images_app/Android%E4%B8%8B%E8%BD%BD%E5%BC%95%E5%AF%BC%E5%9B%BE.png"
                style="width: 150px;height: 198px;"
                alt=""
              /> -->
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
          <el-link :underline="false">获取帮助</el-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { login } from '@/api/user'
import '@/utils/browserUpdate.js'

export default {
  data() {
    return {
      loading: false,
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, trigger: 'blur', message: '账号不能为空' }
        ],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }]
      },
      host: window.location.host
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true
          const { username, password } = this.form
          login({
            account: username,
            pwd: password
          })
            .then(res => {
              const result = res.data.Data
              if (result.code !== '200') {
                if (result.msg === '该账户无效！') {
                  this.$router.push({
                    path: '/forgetPwd',
                    query: { phone: this.form.username }
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
                this.$store.commit('UPDATE_TOKEN', result.token)
                this.$store.commit('UPDATE_USERINFO', result)
                this.$store.dispatch('fetchUserPreference')
                this.$store
                  .dispatch('fetchCompanyList', { uid: result.uid })
                  .then(() => {
                    this.$store
                      .dispatch('fetchProject', { uid: result.uid })
                      .then(() => {
                        this.$router.push({ name: 'triggerRouterGuard' })
                      })
                  })
                  .catch(err => {
                    console.error(err)
                  })
                  .finally(() => {
                    this.loading = false
                  })
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('服务器繁忙，请重试')
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
.login-page {
  position: relative;
  width: 100%;
  height: 100%;
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
