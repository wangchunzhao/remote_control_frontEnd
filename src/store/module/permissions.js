import { getUserFuncNewList } from '@/api/roleFunc'
import { storageName } from '@/utils/index'
const permissions = {
  state: {
    projectPermissions: null, // 项目下的权限集合
    companyPermissions: null, // 企业下的权限集合
    platform: sessionStorage.getItem(storageName('platform')) || '', // 当前所处平台
    routerMap: []
  },
  mutations: {
    UPDATE_PROJECT_PERMISSIONS(state, payload) {
      state.projectPermissions = payload
    },
    UPDATE_COMPANY_PERMISSIONS(state, payload) {
      state.companyPermissions = payload
    },
    UPDATE_PLATFORM(state, payload) {
      state.platform = payload
      sessionStorage.setItem(storageName('platform'), payload)
    },
    UPDATE_ROUTER_MAP(state, payload) {
      state.routerMap = payload
    }
  },
  actions: {
    fetchProjectPermission({ commit, rootState }) {
      return new Promise(async (resolve, reject) => {
        if (!rootState.app.project) {
          // 登录账号没有被分配项目、
          commit('UPDATE_PROJECT_PERMISSIONS', [])
          resolve()
          return false
        }
        getUserFuncNewList({
          userId: rootState.app.userInfo.uid,
          projectId: rootState.app.project.id,
          companyId: rootState.app.company.id,
          type: 2
        })
          .then(res => {
            if (res.data.Code === 200) {
              commit('UPDATE_PROJECT_PERMISSIONS', res.data.Data.FuncS)
            } else {
              console.error('用户权限获取失败')
              reject()
            }
            resolve()
          })
          .catch(err => {
            console.error(err)
            reject()
          })
      })
    },
    fetchCompanyPermission({ commit, rootState }) {
      return new Promise(async (resolve, reject) => {
        getUserFuncNewList({
          userId: rootState.app.userInfo.uid,
          projectId: 0,
          companyId: rootState.app.company.id,
          type: 1
        })
          .then(res => {
            if (res.data.Code === 200) {
              commit('UPDATE_COMPANY_PERMISSIONS', res.data.Data.FuncS)
            } else {
              console.error('用户权限获取失败')
              reject()
            }
            resolve()
            resolve()
          })
          .catch(err => {
            console.error(err)
            reject()
          })
      })
    }
  }
}
export default permissions
