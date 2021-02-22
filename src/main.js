import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import './config.js'
import './permission'
import dayjs from 'dayjs'
import _ from 'lodash'
import CSvg from '@/components/CSvg'
import CAvatar from '@/components/CAvatar'
import NavTabs from '@/components/NavTabs'
import HistoryDialog from '@/components/HistoryDialog'
import noData from '@/directive/noData/index.js'
import Permission from '@/directive/permission/index'
import PageHeader from '@/components/PageHeader'

if (!('Promise' in window)) {
  import('promise-polyfill/src/polyfill')
}

// import './registerServiceWorker'

// 关闭所有的 serviceWorker (window 上的 serviceWorker 开启后，不写代码就不会自动关闭), 过一段时间后可以把下面的代码删除（当前代码更新时间为 2020-12-21）
if (navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

import * as filters from '@/filters/index' // 全局 filters
// 注册全局filter
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(ElementUI)
Vue.directive('nodata', noData)
Vue.directive('permission', Permission)
Vue.component('c-svg', CSvg)
Vue.component('c-avatar', CAvatar)
Vue.component('nav-tabs', NavTabs)
Vue.component('history-dialog', HistoryDialog)
Vue.component('page-header', PageHeader)

/**
 * 时间格式转换
 * @param time {Date} 时间
 * @param formateString {String} 时间格式。例如：'YYYY-MM-DD HH:mm:ss'，默认：'YYYY-MM-DD HH:mm'
 * @return {String} 处理后的时间格式
 * @example this._dateFormat(new Date(),'YYYY-MM-DD HH:mm:ss')
 */
Vue.prototype._dateFormat = (time, formateString = 'YYYY-MM-DD HH:mm') => {
  return time ? dayjs(time).format(formateString) : ''
}

/**
 * 跳转帮助文档页
 */
Vue.prototype.goHelp = () => {
  window.open('http://wiki.sinocold.net', 'target')
}

/**
 * 请求前参数空值过滤
 * @param data {Object} 请求参数
 * @return {Object} 处理后的参数。如果传入的参数不是Object类型，则返回原参数。不传返回{}
 * @example 删除参数值为[]、[undefined]、[null]、{}、''、undefined、null的参数
 */
Vue.prototype.requestDataHandle = (data = {}) => {
  if (
    Object.prototype.toString.call(data) !== '[object Object]' ||
    !Object.keys(data).length
  ) {
    return data
  }
  for (const key in data) {
    switch (Object.prototype.toString.call(data[key])) {
      case '[object String]':
        // 删除 ''
        if (!data[key]) {
          delete data[key]
        }
        break
      case '[object Undefined]':
        // 删除 undefined
        delete data[key]
        break
      case '[object Null]':
        // 删除 null
        delete data[key]
        break
      case '[object Object]':
        // 删除 {}
        if (!Object.keys(data[key]).length) {
          delete data[key]
        }
        break
      case '[object Array]':
        // 删除 []
        if (!data[key].length) {
          delete data[key]
        } else if (data[key].length === 1) {
          // 删除 [undefined]、[null]
          let type = Object.prototype.toString.call(data[key][0])
          if (type.indexOf('Undefined') > -1 || type.indexOf('Null') > -1) {
            delete data[key]
          }
        }
        break
      default:
        break
    }
  }
  return data
}

/**
 * 获取url中的参数
 * @example getUrlParam('key')
 * @param name {string} 参数名称
 * @return {string} 参数值
 */
Vue.prototype.getUrlParam = name => {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)') // 构造一个含有目标参数的正则表达式对象
  let r = window.location.search.substr(1).match(reg) // 匹配目标参数
  if (r != null) return unescape(r[2])
  return null // 返回参数值
}

/**
 * 数组按某属性值（中文）排序
 * @param arr {Array} 需要排序的数组
 * @param dataLeven {string} 数组内的需要比较的元素属性
 * @return {Array} 排序后的数组
 */
Vue.prototype.sortChinese = (arr, dataLeven) => {
  /* 获取数组元素内需要比较的值 */
  function getValue(option) {
    // 参数： option 数组元素
    if (!dataLeven) return option
    let data = option
    dataLeven.split('.').filter(function(item) {
      data = data[item]
    })
    return data + ''
  }
  arr.sort(function(item1, item2) {
    return getValue(item1).localeCompare(getValue(item2), 'zh-CN')
  })
}

Vue.prototype._ = _

// 为date原型添加format时间格式化函数(new Date().format("yyyy-MM-dd hh:mm:ss"))
Date.prototype.format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
