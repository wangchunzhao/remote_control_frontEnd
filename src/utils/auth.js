import { storageName } from '@/utils/index'
import Cookies from 'js-cookie'
export function getToken() {
  // return Cookies.get(TokenKey)
  return sessionStorage.getItem(storageName('token'))
}

export function setToken(token) {
  // return Cookies.set(TokenKey,token)
  return sessionStorage.setItem(storageName('token'), token)
}

export function removeToken() {
  return sessionStorage.removeItem(storageName('token'))
  // return Cookies.remove(TokenKey)
}

export function setRefreshToken(token) {
  Cookies.set('refreshToken', token)
}

export function getRefreshToken() {
  return Cookies.get('refreshToken')
}

export function removeRefreshToken() {
  Cookies.remove('refreshToken')
}

export function setCookie(key, value, parmas = {}) {
  Cookies.set(key, value, parmas)
}

export function getDataScreenCookie() {
  let info = Cookies.get('coolcare_prepayment_dataScreen')
  return info ? JSON.parse(info) : ''
}

export function removeDataScreenCookie() {
  Cookies.remove('coolcare_prepayment_dataScreen')
}
