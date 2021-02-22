import fetch from '@/utils/service'

// #region 添加角色 start
// RoleType: 1:企业角色 2:项目角色
export const addRole = ({ RoleName, CompanyId, RoleType }) => {
  return fetch.post(
    BASE_URI + '/api/Role/AddRole',
    {
      RoleName,
      CompanyId,
      RoleType
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加角色 end

// #region 获取公司角色列表 start
export const getRoleList = ({ companyId, roleType }) => {
  return fetch.get(BASE_URI + '/api/Role/GetCompany_RoleList', {
    params: {
      companyId,
      roleType
    }
  })
}
// #endregion 获取公司角色列表 end

// #region 删除角色 start
export const daleteRole = ({ roleId }) => {
  return fetch.get(BASE_URI + '/api/Role/DaleteRole', {
    params: {
      roleId
    }
  })
}
// #endregion 删除角色 end

// #region 更新角色 start
export const updateRole = ({ roleId, roleName }) => {
  return fetch.get(BASE_URI + '/api/Role/UpdateRole', {
    params: {
      roleId,
      roleName
    }
  })
}
// #endregion 更新角色 end

// #region 设置默认角色 start
export const setDefaultRole = ({ roleId }) => {
  return fetch.get(BASE_URI + '/api/Role/SetDefaultRole', {
    params: {
      roleId
    }
  })
}
// #endregion 设置默认角色 end

// #region 获取公司下的角色下拉框 start
export const getRoleDropdownList = ({ companyId, roleType }) => {
  return fetch.get(BASE_URI + '/api/Role/GetRoleDropdownList', {
    params: {
      companyId,
      roleType
    }
  })
}
// #endregion 获取公司下的角色下拉框 end
