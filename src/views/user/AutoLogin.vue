<template>
  <div class="autoLogin">
    <div class="spinner">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
  </div>
</template>

<script>
import { getRefreshToken, removeRefreshToken } from '@/utils/auth'
import { refreshToken } from '@/api/user'
export default {
  created() {
    refreshToken({
      refreshToken: getRefreshToken()
    }).then(res => {
      const result = res.data.Data
      if (result.code === '401') {
        removeRefreshToken()
        this.$emit('refresh')
      } else {
        this.$store.commit('UPDATE_TOKEN', {
          token: result.token,
          refreshToken: result.refreshToken
        })
        this.$store.commit('UPDATE_USERINFO', result)
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
            removeRefreshToken()
            this.$emit('refresh')
          })
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.autoLogin {
  background-color: #324157;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  .spinner {
    margin: 100px auto 0;
    width: 70px;
    text-align: center;
  }

  .spinner > div {
    width: 18px;
    height: 18px;
    background-color: #ffffff;

    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  }

  .spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }

  @-webkit-keyframes sk-bouncedelay {
    0%,
    80%,
    100% {
      -webkit-transform: scale(0);
    }
    40% {
      -webkit-transform: scale(1);
    }
  }

  @keyframes sk-bouncedelay {
    0%,
    80%,
    100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }
    40% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }
}
</style>
