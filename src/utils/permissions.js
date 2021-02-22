import store from '@/store'

/**
 * @param {Array} value eg: [1,2]
 * @returns {Boolean}
 */
export const checkPermission = value => {
  if (value && value instanceof Array && value.length > 0) {
    if (
      !store.state.permissions.projectPermissions ||
      !store.state.permissions.companyPermissions
    ) {
      return false
    }
    const roles = [
      ...store.state.permissions.projectPermissions,
      ...store.state.permissions.companyPermissions
    ]

    const permissionRoles = value
    // * 说明不用权限
    if (permissionRoles.includes('*')) {
      return true
    }
    const hasPermission = roles.some(role => {
      return permissionRoles.includes(role)
    })
    if (!hasPermission) {
      return false
    }
    return true
  } else {
    console.error(`need roles! checkPermission([23])`)
    return false
  }
}

export const getFirstRouterPath = routes => {
  let secondRoute = null
  let thridRoute = null
  if (routes.singleMenu) {
    secondRoute = routes.children[0]
  } else {
    secondRoute = routes.children.find(v => v.hidden !== true)
  }
  if (secondRoute.type === 'monitorSystemChild') {
    return secondRoute.path
  }
  if (secondRoute.children && secondRoute.children.length) {
    thridRoute = secondRoute.children.find(v => v.hidden !== true)
  }
  if (thridRoute) {
    return routes.path + '/' + secondRoute.path + '/' + thridRoute.path
  } else {
    return routes.path + '/' + secondRoute.path
  }
}
