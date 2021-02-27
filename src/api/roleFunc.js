import fetch from '@/utils/service'

// #region 根据角色id获取功能菜单 start
// 1：企业权限 2：项目权限
// 行业id 1：冷链 2：商超
export const getRuleTree = ({ roleId, PlatformType, industry, companyId }) => {
  return fetch.get('/api/Role_Func/GetCompany_RoleList', {
    params: {
      roleId,
      PlatformType,
      industry,
      companyId
    }
  })
}
// #endregion 根据角色id获取功能菜单 end

// #region 更新角色对应的规则  start
export const editRoleRule = ({
  FuncIdS,
  RoleId,
  HalfSelection,
  StorageSpaceExtendList
}) => {
  return fetch.post(
    '/api/Role_Func/UpdateRole_Func',
    {
      FuncIdS,
      HalfSelection,
      RoleId,
      StorageSpaceExtendList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新角色对应的规则  end

// #region 获取用户功能权限 start
// 1企业权限 2业务权限
export const getUserFuncNewList = ({ userId, projectId, companyId, type }) => {
  return fetch.get('/api/Role_Func/GetUser_FuncNewList', {
    params: {
      userId,
      projectId,
      companyId,
      type
    }
  })
}
// #endregion 获取用户功能权限 end
