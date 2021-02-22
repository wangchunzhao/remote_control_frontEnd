<template>
  <div>
    <component
      @refresh="handleRefreshToken"
      v-if="isAutoLogin !== null"
      :is="isAutoLogin ? 'AutoLogin' : 'LoginForm'"
    />
  </div>
</template>

<script>
import AutoLogin from './AutoLogin'
import LoginForm from './LoginForm'
import { getRefreshToken } from '@/utils/auth'
export default {
  components: {
    AutoLogin,
    LoginForm
  },
  data() {
    return {
      isAutoLogin: null
    }
  },
  created() {
    if (getRefreshToken()) {
      this.isAutoLogin = true
    } else {
      this.isAutoLogin = false
    }
  },
  methods: {
    handleRefreshToken() {
      if (getRefreshToken()) {
        this.isAutoLogin = true
      } else {
        this.isAutoLogin = false
      }
    }
  }
}
</script>
