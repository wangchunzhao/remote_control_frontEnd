import {
  getToken,
  setToken,
  setRefreshToken,
  removeToken,
  removeRefreshToken
} from '@/utils/auth.js'
import Cookies from 'js-cookie'
import { getCompanysByUser } from '@/api/userSubarea'
import { getUserOwnSubareaTree, getUserProjectAlarm } from '@/api/subarea'
import { storageName, getPathById } from '@/utils/index'
import { modelTrees } from '@/api/model_new'
import { getSubareaTree } from '@/api/subarea'
import { getPreferences } from '@/api/preferences'
import { message, Message } from 'element-ui'
import router, { resetRouter } from '@/router'
import { getLanguage } from '@/lang/index'

const app = {
  state: {
    // !+ ： + 字符串转数字 ！数字转 boolean
    sidebar: !+sessionStorage.getItem(storageName('sidebarStatus')),
    language: getLanguage(),
    mapOverviewHeaderVisible: !!+sessionStorage.getItem(
      storageName('mapOverviewHeaderVisible')
    ), // 地图总览页- header 是否可见
    pid: sessionStorage.getItem(storageName('project'))
      ? JSON.parse(sessionStorage.getItem(storageName('project'))).id
      : '', // 当前 项目 id
    company: sessionStorage.getItem(storageName('company'))
      ? JSON.parse(sessionStorage.getItem(storageName('company')))
      : {}, // 当前公司信息
    companyList: sessionStorage.getItem(storageName('companyList'))
      ? JSON.parse(sessionStorage.getItem(storageName('companyList')))
      : [], // 公司列表
    structTree: sessionStorage.getItem(storageName('structTree'))
      ? JSON.parse(sessionStorage.getItem(storageName('structTree')))
      : [], // 结构树
    proList: JSON.parse(sessionStorage.getItem(storageName('proList'))), // 项目集合
    project: sessionStorage.getItem(storageName('project'))
      ? JSON.parse(sessionStorage.getItem(storageName('project')))
      : null, // 当前选中项目
    token: getToken(),
    userInfo: JSON.parse(sessionStorage.getItem(storageName('userInfo'))),
    isEmptyAccount:
      sessionStorage.getItem(storageName('isEmptyAccount')) === 'true'
        ? true
        : false, // 是否是空白账号（没有企业）
    header: sessionStorage.getItem(storageName('headerTitle')),
    subarea: JSON.parse(sessionStorage.getItem(storageName('subarea'))), // 登录用户在当前公司下有权限的结构树
    projectPath:
      JSON.parse(sessionStorage.getItem(storageName('projectPath'))) || [],
    monitorModels:
      JSON.parse(sessionStorage.getItem(storageName('monitorModels'))) || [],
    companyStruct:
      JSON.parse(sessionStorage.getItem(storageName('companyStruct'))) || [] // 公司完整结构树
  },
  mutations: {
    UPDATE_MONITOR_MODELS: (state, payload) => {
      state.monitorModels = payload
      sessionStorage.setItem(
        storageName('monitorModels'),
        JSON.stringify(payload)
      )
    },
    UPDATE_COMPANY_LIST: (state, payload) => {
      state.companyList = payload
      sessionStorage.setItem(
        storageName('companyList'),
        JSON.stringify(payload)
      )
    },
    SET_LANGUAGE: (state, language) => {
      console.log('[74]-app.js', language)
      state.language = language
      Cookies.set('language', language)
    },
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar) {
        sessionStorage.setItem(storageName('sidebarStatus'), 1)
      } else {
        sessionStorage.setItem(storageName('sidebarStatus'), 0)
      }
      state.sidebar = !state.sidebar
    },
    TOGGLE_MAP_OVERVIEW_HEADER_VISIBLE: state => {
      if (state.sidebar) {
        sessionStorage.setItem(storageName('mapOverviewHeaderVisible'), 1)
      } else {
        sessionStorage.setItem(storageName('mapOverviewHeaderVisible'), 0)
      }
      state.mapOverviewHeaderVisible = !state.mapOverviewHeaderVisible
    },
    CLOSE_SIDEBAR: state => {
      state.sidebar = false
    },
    UPDATE_PROJECT_PATH: (state, payload) => {
      state.projectPath = payload
      sessionStorage.setItem(
        storageName('projectPath'),
        JSON.stringify(payload)
      )
    },
    CHANGE_PROJECT: (state, data) => {
      if (data) {
        state.pid = data.id
        state.project = data
        sessionStorage.setItem(storageName('project'), JSON.stringify(data))
      } else {
        state.pid = ''
        state.project = null
        sessionStorage.removeItem(storageName('project'))
      }
    },

    SET_STRUCT_TREE: (state, treeData) => {
      state.structTree = treeData
      sessionStorage.setItem(
        storageName('structTree'),
        JSON.stringify(treeData)
      )
    },
    SET_HEADER_TITLE: (state, data) => {
      state.header = data
      sessionStorage.setItem(storageName('headerTitle'), data)
    },
    UPDATE_PROJECT_LIST: (state, data) => {
      state.proList = data
      sessionStorage.setItem(storageName('proList'), JSON.stringify(data))
    },
    UPDATE_USERINFO(state, userInfo) {
      state.userInfo = userInfo
      sessionStorage.setItem(storageName('userInfo'), JSON.stringify(userInfo))
    },
    UPDATE_ISEMPTYACCOUNT(state, payload) {
      state.isEmptyAccount = payload
      sessionStorage.setItem(storageName('isEmptyAccount'), payload)
    },
    UPDATE_TOKEN(state, { token, refreshToken }) {
      state.token = token
      setToken(token)
      if (refreshToken) {
        setRefreshToken(refreshToken)
      }
    },
    UPDATE_CHECKID(state, checkId) {
      state.checkId = checkId
      sessionStorage.setItem(storageName('checkId'), checkId)
    },
    UPDATE_COMPANY(state, payload) {
      state.company = payload
      sessionStorage.setItem(storageName('company'), JSON.stringify(payload))
    },
    UPDATE_SUBAREA(state, payload) {
      state.subarea = payload
      sessionStorage.setItem(storageName('subarea'), JSON.stringify(payload))
    },
    UPDATE_COMPANY_STRUCT(state, payload) {
      state.companyStruct = payload
      sessionStorage.setItem(
        storageName('companyStruct'),
        JSON.stringify(payload)
      )
    }
  },
  actions: {
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    },
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar: ({ commit }) => {
      commit('CLOSE_SIDEBAR')
    },
    ChangeProject: ({ commit, dispatch }, data) => {
      // 清空上一个项目权限
      commit('UPDATE_PROJECT_PERMISSIONS', null)
      commit('UPDATE_COMPANY_PERMISSIONS', null)
      commit('CHANGE_PROJECT', data)
      dispatch('fetchEnergyStruct')
    },
    /** 切换平台之后跳转页面, 不传 pagePath, 默认跳转第一个页面 */
    ChangePlatfromAndGoPage: ({ commit, rootState }, payload) => {
      const { platform, pagePath } = payload
      if (!platform) {
        console.error(new Error('请输入要跳转的平台'))
        return
      }
      if (rootState.permissions.platform !== platform) {
        commit('UPDATE_PLATFORM', platform)
        // 清空项目和公司权限
        commit('UPDATE_PROJECT_PERMISSIONS', null)
        commit('UPDATE_COMPANY_PERMISSIONS', null)
        if (platform === PLATFORM.business) {
          router.push({
            name: 'triggerRouterGuard',
            query: {
              goPage: '/map/index'
            }
          })
        } else {
          router.push({
            name: 'triggerRouterGuard',
            query: {
              goPage: pagePath
            }
          })
        }
        resetRouter()
      }
    },
    fetchStructTree({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        modelTrees({
          projectId: payload ? payload.pid : state.pid
        })
          .then(({ data }) => {
            if (data.Code === 200) {
              let list = []
              list = data.Data
              commit('SET_STRUCT_TREE', list)
              resolve(list)
            }
          })
          .catch(err => {
            reject()
            console.error(err)
          })
      })
    },
    fetchProject({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserProjectAlarm({
          companyId: state.company.id,
          SubareaId: 0,
          IsShow: true
        })
          .then(res => {
            const data = res.data
            if (data.Code === 200) {
              if (!data.Data.length && !state.isEmptyAccount) {
                Message.info('当前账号没有分配项目')
              }
              let list = []
              data.Data.forEach(item => {
                list.push({
                  id: item.ProjectId,
                  label: item.ProjectName,
                  ...item
                })
              })
              commit('UPDATE_PROJECT_LIST', list)
              // if (!state.project && list.length) {
              //   commit('CHANGE_PROJECT', list[0])
              //   dispatch('fetchStructTree')
              // } else {
              // commit('CHANGE_PROJECT', {})
              // }
              resolve(list)
            } else {
              commit('UPDATE_PROJECT_LIST', [])
              resolve([])
            }
          })
          .catch(err => {
            commit('UPDATE_PROJECT_LIST', [])
            message.error('服务器错误，项目信息获取失败')
            console.error(err)
            reject('服务器错误，项目信息获取失败')
          })
      })
    },
    // 获取公司列表
    fetchCompanyList({ commit, state, dispatch }) {
      return new Promise((resolve, reject) => {
        Promise.all([
          getCompanysByUser(),
          getPreferences({
            type: 'RememberCompany',
            foreignId: state.userInfo.uid
          })
        ])
          .then(([res1, res2]) => {
            const data = res1.data.Data
            commit('UPDATE_COMPANY_LIST', data)
            if (data.length) {
              const companyHistory = res2.data.Data
                ? JSON.parse(res2.data.Data.Field)
                : null // 上一次登录所在的公司
              if (
                companyHistory &&
                data.find(item => item.CompanyId === companyHistory.id)
              ) {
                // 选择上一次登录时所在的公司
                commit('UPDATE_COMPANY', companyHistory)
              } else {
                // 选择第一个企业
                commit('UPDATE_COMPANY', {
                  id: data[0].CompanyId,
                  industry: data[0].Industry,
                  label: data[0].CompanyName
                })
              }
              commit('UPDATE_ISEMPTYACCOUNT', false)
              dispatch('fetchCompanyStruct')
            } else {
              // ('当前账号不属于任何企业')
              commit('UPDATE_ISEMPTYACCOUNT', true)
            }
            resolve(data)
          })
          .catch(err => {
            console.error(err)
            reject()
          })
      })
    },
    // 获取登录用户在当前公司下有权限的结构树
    fetchUserOwnSubareaTree({ commit, state }) {
      getUserOwnSubareaTree({
        companyId: state.company.id
      })
        .then(res => {
          let data = res.data.Data
          if (res.data.Code === 200) {
            if (!data.Children.length && data.ProjectId) {
              // 说明该账号下只有一个项目
              walk([data])
              commit('UPDATE_SUBAREA', [data])
              commit('UPDATE_PROJECT_PATH', [data.ProjectId])
            } else {
              let tree = data.Children
              walk(data.Children)
              commit('UPDATE_SUBAREA', data.Children)
              let projectPath = []
              tree.forEach(item => {
                getPathById(state.pid, item, val => {
                  projectPath = val
                })
              })
              commit('UPDATE_PROJECT_PATH', projectPath)
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取公司的完整结构
    fetchCompanyStruct({ commit, state }) {
      return new Promise((resolve, reject) => {
        // 没有公司id, 当前账号是刚注册的，会出现这种情况
        if (state.company && !state.company.id) {
          commit('UPDATE_COMPANY_STRUCT', [])
          resolve()
          return
        }
        getSubareaTree({
          companyId: state.company.id
        })
          .then(res => {
            let structData = []
            if (res.data.Code === 200) {
              structData = res.data.Data
            } else {
              structData = []
              console.error(res.data.Message)
              reject(new Error('公司结构树获取失败'))
            }
            commit('UPDATE_COMPANY_STRUCT', structData)
            resolve()
          })
          .catch(err => {
            commit('UPDATE_COMPANY_STRUCT', [])
            console.error(err)
            reject(new Error('公司结构树获取失败'))
          })
      })
    },
    // 退出登录
    LOG_OUT({ state, rootState }) {
      removeRefreshToken()
      removeToken()
      state.token = ''
      state.userInfo = {}
      state.proList = []
      state.pid = ''
      state.project = null
      state.routerMap = []
      state.company = {}
      rootState.permissions.projectPermissionId = null
      rootState.permissions.companyPermissionId = null
      rootState.permissions.platform = ''
      rootState.permissions.routerMap = []
      sessionStorage.clear()
      window.location.reload()
    }
  }
}
export default app

function walk(arr) {
  arr.forEach(item => {
    if (item.Remark === '项目') {
      item.SubareaId = item.ProjectId
    }
    if (item.Children) {
      if (!item.Children.length) {
        delete item.Children // 删除空的Children
      } else {
        walk(item.Children)
      }
    }
  })
}
