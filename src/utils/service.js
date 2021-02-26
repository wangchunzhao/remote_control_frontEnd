import axios from 'axios'
import qs from 'qs'
import router from '@/router'
// import store from '@/store'
import { getToken, getRefreshToken } from '@/utils/auth'
// import { _host } from '../config'
import store from '@/store/index'

// 创建一个axios实例
const service = axios.create({
  baseURL: BASE_URI
  // timeout: 25000   // 删除请求超时功能，因为后台配置有的接口响应时间比较长
})

service.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded'

const ignoreTokenApi = [
  '/api/User/login',
  '/api/User/AddUser',
  '/api/User/Exists',
  '/api/User/MobileCode',
  '/api/User/CheckCode',
  '/api/User/ForgetPwd',
  '/api/User/MobileCodeUP',
  '/api/User/MobileCode',
  '/api/Invitation/GetInvitationInfo',
  'api/User/Exists',
  '/api/Invitation/LoginAndInvitation',
  '/api/Invitation/RegisterAndInvitation'
]

// 请求拦截器
service.interceptors.request.use(
  config => {
    let TOKEN = getToken()
    if (!TOKEN && !ignoreTokenApi.find(url => config.url.indexOf(url) > -1)) {
      router.replace('/login')
    }
    // 让每个请求携带token作为验证。
    if (!ignoreTokenApi.find(url => config.url.indexOf(url) > -1)) {
      config.headers['Authorization'] = 'Bearer ' + TOKEN
    }
    // 因为部分post接口接收不到参数，所以将请求数据序列化，转换为键值对形式(application/x-www-form-urlencoded)
    if (
      config.method === 'post' &&
      config.headers['Content-Type'] !== 'multipart/form-data' &&
      config.headers['Content-Type'] !== 'application/json'
    ) {
      config.data = qs.stringify(config.data)
    }
    if (config.headers['Content-Type'] === 'application/json') {
      config.data = JSON.stringify(config.data)
    }
    return config
  },
  error => {
    console.error(error)
    Promise.reject(error)
  }
)

let isRefreshing = false // 标记是否正在刷新 token
let requests = [] // 存储待重发请求的数组

// 刷新 access_token 的接口
const refreshToken = () => {
  return service.get(
    BASE_URI + '/api/User/RefreshToken',
    {
      params: {
        refreshToken: getRefreshToken()
      }
    },
    true
  )
}

// 响应拦截器
service.interceptors.response.use(
  response => {
    // switch (response.status) {
    // case 400:
    //   Message.error({
    //     message: '错误请求',
    //     duration: 5 * 1000
    //   })
    //   break
    // case 401:
    //   Message.error({
    //     message: '身份认证失败,请重新登录',
    //     duration: 5 * 1000
    //   })
    //   setTimeout(() => {
    //     router.replace('/login')
    //   }, 5000)
    //   break
    // case 403:
    //   Message.error({
    //     message: '禁止访问',
    //     duration: 5 * 1000
    //   })
    //   break
    // case 404:
    //   Message.error({
    //     message: '资源不存在',
    //     duration: 5 * 1000
    //   })
    //   break
    // case 500:
    //   Message.error({
    //     message: '服务器错误，请稍后重试',
    //     duration: 5 * 1000
    //   })
    //   break
    //   default:
    //     return response
    // }
    return response
  },
  error => {
    if (
      error.response.status === 401 &&
      !error.config.url.includes('/api/User/RefreshToken')
    ) {
      const { config } = error
      if (!isRefreshing) {
        isRefreshing = true
        return refreshToken()
          .then(res => {
            if (res.data.Data.code === '401') {
              throw new Error('抱歉，您的登录状态已失效，请重新登录！')
            } else {
              const { token, refreshToken } = res.data.Data
              store.commit('UPDATE_TOKEN', {
                token,
                refreshToken
              })
              config.headers.Authorization = `Bearer ${token}`
              // token 刷新后将数组的方法重新执行
              requests.forEach(cb => cb(token))
              requests = [] // 重新请求完清空
              return service(config)
            }
          })
          .catch(err => {
            console.log('抱歉，您的登录状态已失效，请重新登录！')
            store.dispatch('LOG_OUT')
            return Promise.reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      } else {
        // 返回未执行 resolve 的 Promise
        return new Promise(resolve => {
          // 用函数形式将 resolve 存入，等待刷新后再执行
          requests.push(token => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(service(config))
          })
        })
      }
    }
    // console.error('err: ' + error) // for debug
    // Message({
    //   message: error,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    return Promise.reject(error)
  }
)

export default service
