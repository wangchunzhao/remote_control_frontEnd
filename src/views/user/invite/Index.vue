<template>
  <div class="invite-page">
    <div class="invite-content">
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
      <CheckForm @submit="changeStep" v-if="step === 'check'" />
      <LoginForm
        @showSuccess="showSuccess"
        v-if="step === 'login'"
        :phone="phone"
      />
      <RegisterForm
        @showSuccess="showSuccess"
        v-if="step === 'register'"
        :phone="phone"
      />
    </div>
  </div>
</template>
<script>
import LoginForm from './LoginForm'
import CheckForm from './CheckForm'
import RegisterForm from './RegisterForm'
// import SuccessPanel from './SuccessPanel'

export default {
  components: {
    LoginForm,
    RegisterForm,
    CheckForm
    // SuccessPanel
  },
  data() {
    return {
      step: 'check',
      phone: '',
      host: window.location.host,

      projectName: ''
    }
  },
  methods: {
    changeStep(val, phone, projectName) {
      this.phone = phone
      this.projectName = projectName
      if (val) {
        this.step = 'login'
      } else {
        this.step = 'register'
      }
    },
    showSuccess({ avatar }) {
      const params = new URLSearchParams()
      params.set('projectName', this.projectName)
      params.set('avatar', avatar)
      window.location.href =
        window.location.protocol +
        '//' +
        window.location.host +
        '/#/inviteSuccess?' +
        params
    }
  }
}
</script>
<style lang="scss" scoped>
.invite-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #324157;
  .invite-content {
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
  .platform-name {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 25px 0;
    font-family: PingFangSC;
    text-align: center;
    color: #000000;
  }
}
</style>

<style lang="scss">
.invite-success-dialog {
  background-color: rgba(244, 245, 246, 1);
  .el-dialog__header {
    display: none;
  }
}
</style>
