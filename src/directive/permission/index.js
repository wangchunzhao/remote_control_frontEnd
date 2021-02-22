import store from '@/store'

export default {
  inserted(el, binding) {
    const projectPermissions = store.state.permissions.projectPermissions
    const companyPermissions = store.state.permissions.companyPermissions
    if (!projectPermissions && !companyPermissions) {
      // 切换项目或企业的时候会存在权限集合为null的时候
      return false
    }
    const { value } = binding

    // 如果获取权限还没有返回结果，下面两个权限集就是空的，导致之后的代码报错
    if (!projectPermissions || !companyPermissions) {
      return false
    }
    const roles = [...projectPermissions, ...companyPermissions]
    if (value && value instanceof Array && value.length > 0) {
      const permissionRoles = value
      //  * 号说明不用权限
      if (permissionRoles.includes('*')) {
        return false
      }

      const hasPermission = roles.some(role => {
        return permissionRoles.includes(role)
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`need roles! Like v-permission="[23, 12]"`)
    }
  }
}
