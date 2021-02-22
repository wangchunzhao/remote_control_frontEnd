import router from './router'
import store from './store'
import uuidv1 from 'uuid/v1'
import {
  systemManageRouter,
  dataAnalysisRouter,
  businessRouter,
  deviceConnectRouter,
  constRouter,
  resetRouter
} from './router'
import { getToken } from '@/utils/auth'
import { getModelListByProject } from '@/api/model'
import { getPreferences } from '@/api/preferences'
import { getFirstRouterPath } from './utils/permissions'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

const whiteList = [
  '/login',
  '/register',
  '/forgetPwd',
  '/invite',
  '/inviteSuccess',
  '/other',
  '/companyRegister'
] // 路由白名单
NProgress.configure({ showSpinner: false }) // NProgress Configuration

router.beforeEach((to, from, next) => {
  to.name !== 'redirect' && NProgress.start()
  if (getToken() && !whiteList.find(item => item === to.path)) {
    if (
      !store.state.permissions.projectPermissions ||
      !store.state.permissions.companyPermissions
    ) {
      if (to.path === '/emptyAccount') {
        next()
        NProgress.done()
        return
      }
      Promise.all([
        store.dispatch('fetchProjectPermission'),
        store.dispatch('fetchCompanyPermission')
      ]).then(async () => {
        if (!store.state.permissions.platform) {
          // 不处于任何一平台,说明刚登录, 或切换了企业
          store.dispatch('fetchUserOwnSubareaTree')
          store.commit('UPDATE_PLATFORM', PLATFORM.business)
          resetRouter()
          await routerFactory(store.state.permissions.platform)
          next({ name: 'mapIndex', replace: true })
          NProgress.done()
        } else {
          resetRouter()
          await routerFactory(store.state.permissions.platform)
          if (to.name === 'triggerRouterGuard') {
            if (from.name === 'mapIndex') {
              // 从地图总览页面点击项目会触发这个
              let firstPath = ''
              store.state.permissions.routerMap.some(router => {
                try {
                  firstPath = getFirstRouterPath(router)
                  if (firstPath) {
                    return true
                  }
                } catch (err) {
                  console.error(err)
                }
              })
              next({
                path: firstPath,
                replace: true
              })
            } else if (to.query.behavior === 'switchToBusiness') {
              // 切换平台后触发这里
              next({ name: 'mapIndex', replace: true })
            } else {
              let firstPath = ''
              store.state.permissions.routerMap.some(router => {
                try {
                  firstPath = getFirstRouterPath(router)
                  if (firstPath) {
                    return true
                  }
                } catch (err) {
                  console.error(err)
                }
              })
              next({
                path: firstPath,
                replace: true
              })
            }
            NProgress.done()
          } else {
            next({ ...to, replace: true })
            NProgress.done()
          }
        }
      })
    } else {
      next()
      NProgress.done()
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
      NProgress.done()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

async function routerFactory(platform) {
  return new Promise(async resolve => {
    let routes = []
    switch (platform) {
      case PLATFORM.systemManage: // 系统管理平台
        routes = filterAsyncRouter(
          systemManageRouter,
          store.state.permissions.companyPermissions,
          platform
        )
        break
      case PLATFORM.dataAnalysis: // 数据分析平台
        routes = filterAsyncRouter(
          dataAnalysisRouter,
          store.state.permissions.companyPermissions,
          platform
        )
        break
      case PLATFORM.business: // 业务运营平台
        routes = filterAsyncRouter(
          businessRouter,
          store.state.permissions.projectPermissions,
          platform
        )
        if (!store.state.app.project) {
          // 当在 地图 页面时是没有项目的， 不用生成监测菜单
          break
        }
        await Promise.all([
          getPreferences({
            type: 'SubSystemCard',
            foreignId: store.state.app.project.id
          }),
          getModelListByProject({
            projectId: store.state.app.project.id
          })
        ]).then(([res1, res2]) => {
          let orderRules = null
          if (res1.data.Code === 200 && res1.data.Data !== null) {
            orderRules = JSON.parse(res1.data.Data.Field)
          }

          if (res2.data.Code === 200) {
            let monitorSystemRouteMap = res2.data.Data
            if (orderRules) {
              // 如果有排序规则
              monitorSystemRouteMap.forEach(v => {
                const temp = orderRules.find(vv => vv.key === v.BigTypeId)
                if (temp) {
                  v.order = temp.order
                } else {
                  v.order = 10000
                }
              })
              monitorSystemRouteMap.sort((x, y) => x.order - y.order)
            }
            monitorSystemRouteMap.forEach(item => {
              item.type = 'monitorSystemChild'
              // sid=${item.BigTypeId}&routeType=monitorRoute
              item.path = `${item.path}`
              item.query = {
                sid: item.BigTypeId,
                routeType: 'monitorRoute'
              }
            })
            // 定制设备监测-子系统 导航栏
            generateMonitorSystemNav(routes, monitorSystemRouteMap)
          }
        })
        break
      case PLATFORM.deviceConnect: // 设备连接平台
        routes = filterAsyncRouter(
          deviceConnectRouter,
          store.state.permissions.companyPermissions,
          platform
        )
        break
      default:
        routes = filterAsyncRouter(
          businessRouter,
          store.state.permissions.projectPermissions,
          platform
        )
        break
    }
    router.addRoutes(routes)
    store.commit('UPDATE_ROUTER_MAP', [...routes, ...constRouter])
    resolve()
  })
}

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

/**
 * 通过meta中的参数判断是否与当前用户权限匹配
 * @param permissions
 * @param route
 */
function hasPermission(permissions, route, platform) {
  let res = true
  if (route.meta) {
    if (route.meta.projectPermissionId || route.meta.companyPermissionId) {
      // 需要项目或企业权限的路由
      if (platform === PLATFORM.business) {
        res = permissions.some(item => {
          return route.meta.projectPermissionId.includes(item)
        })
      } else {
        res = permissions.some(item => {
          return route.meta.companyPermissionId.includes(item)
        })
      }
    }
    if (Array.isArray(route.meta.companyIds)) {
      res = res && route.meta.companyIds.includes(store.state.app.company.id)
    }
    if (Array.isArray(route.meta.industry)) {
      // 分行业的路由，如果路由需要指定行业才能看，那么就算有对应的权限id,也不可以看
      res =
        res && route.meta.industry.includes(store.state.app.project.Industry)
    }
  }
  return res
}

// 业务运营平台-定制化实时监测导航
function generateMonitorSystemNav(routes, monitorSystemRouteMap) {
  const industry = store.state.app.project.Industry
  let temp = routes.find(item => item.name === 'monitor')
  // 可能存在没有设备监测的路由权限
  if (temp) {
    if (industry === 2 || industry === 4) {
      // 商超行业或文物保护
      temp.children = temp.children.filter(
        item => item.type !== 'monitorSystem'
      ) // 删除上一个项目的实时监测子系统
      // 将所有子系统放入子系统菜单下
      temp.children.push({
        type: 'monitorSystem',
        name: '子系统',
        path: uuidv1(),
        children: [...monitorSystemRouteMap]
      })
    } else if (industry === 1) {
      // 冷链行业
      monitorSystemRouteMap.forEach(v => {
        if (v.name === '运输监测') {
          ;(
            temp.children.find(vv => vv.name === 'transportMonitor') || {}
          ).hidden = false
        } else if (v.name === '仓库监测') {
          ;(
            temp.children.find(vv => vv.name === 'warehouse') || {}
          ).hidden = false
        }
      })
      // temp.children = temp.children.filter(
      //   item => item.type !== 'monitorSystemChild'
      // ) // 删除上一个项目的实时监测子系统
      // temp.children.unshift(...monitorSystemRouteMap)
    } else if (industry === 3) {
      // 养殖业
      temp.children = temp.children.filter(
        item => item.type !== 'monitorSystemChild'
      ) // 删除上一个项目的实时监测子系统
      temp.children.push(...monitorSystemRouteMap)
    }
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(routes, permissions, platform) {
  const res = []

  routes.forEach(route => {
    const temp = { ...route }
    if (hasPermission(permissions, temp, platform)) {
      if (temp.children) {
        temp.children = filterAsyncRouter(temp.children, permissions, platform)
      }
      res.push(temp)
    }
  })

  return res
}
