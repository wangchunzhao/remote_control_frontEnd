import fetch from '@/utils/service'

// #region 新增用户角色分区 start
export const addMember = ({
  Avatar,
  Nickname,
  Mobile,
  SubareaIdS,
  SubareaId = undefined,
  CompanyId,
  IsAdd,
  UserId,
  CompanyRole,
  ProjectRole
}) => {
  return fetch.post(
    BASE_URI + '/api/User_Subarea/AddUser_Role_Subarea',
    {
      Avatar,
      Nickname,
      Mobile,
      SubareaIdS,
      SubareaId,
      CompanyId,
      IsAdd,
      UserId,
      CompanyRole,
      ProjectRole
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 新增用户角色分区 end

// #region 批量新增用户 start
export const addMembers = members => {
  return fetch.post(
    BASE_URI + '/api/User_Subarea/AddUser_Role_SubareaList',
    members,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量新增用户 end

// #region 获取成员列表 start
export const getMemberList = ({
  CompanyId,
  UserType,
  SubareaId,
  UserNameOrMobile,
  CompanyRoleId,
  ProjectRoleId,
  ActiveStatus,
  SortType,
  IsAsc,
  pageIndex,
  pageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/User_Subarea/GetUser_Role_SubareaList',
    {
      CompanyId,
      UserType,
      SubareaId,
      UserNameOrMobile,
      CompanyRoleId,
      ProjectRoleId,
      ActiveStatus,
      SortType,
      IsAsc,
      pageIndex,
      pageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取成员列表 end

// #region 删除成员 start
export const deleteMember = ({
  CompanyId,
  SubareaId,
  UserIdList,
  StorageSpace
}) => {
  return fetch.post(
    BASE_URI + '/api/User_Subarea/DeleteUser_Role_Subarea',
    {
      CompanyId,
      SubareaId,
      UserIdList,
      StorageSpace
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 删除成员 end

// #region 根据公司与角色获取可关联用户列表 start
export const getUsersConnectSource = ({ roleId, companyId }) => {
  return fetch.get(BASE_URI + '/api/User_Subarea/GetUser_RoleList', {
    params: {
      companyId,
      roleId
    }
  })
}
// #endregion 根据公司与角色获取可关联用户列表 end

// #region 角色关联用户 start
export const roleConnectUser = ({ UserRoleSubareaIds, RoleId, CompanyId }) => {
  return fetch.post(
    BASE_URI + '/api/User_Subarea/RelationUser_Role_Subarea',
    {
      RoleId,
      UserRoleSubareaIds,
      CompanyId
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 角色关联用户 end

// #region 根据角色ID获取已关联用户 start
export const getConnectedUser = ({
  RoleId,
  companyId,
  pageIndex,
  pageSize
}) => {
  return fetch.get(BASE_URI + '/api/User_Subarea/GetRole_UserList', {
    params: {
      RoleId,
      companyId,
      pageIndex,
      pageSize
    }
  })
}
// #endregion 根据角色ID获取已关联用户 end

// #region 删除用户与角色的关联 start
export const disConnectUser = ({ UserRoleIdS }) => {
  return fetch.delete(BASE_URI + '/api/User_Subarea/DeleteUser_RoleList', {
    params: {
      UserRoleIdS
    }
  })
}
// #endregion 删除用户与角色的关联 end

// #region 根据用户id获取项目列表 start
export const getProjectsByUser = ({ userId, companyId }) => {
  return fetch.get(BASE_URI + '/api/User_Subarea/GetUser_ProjectList', {
    params: {
      userId,
      companyId
    }
  })
}
// #endregion 根据用户id获取项目列表 end

// #region 根据用户id获取企业列表 start
export const getCompanysByUser = () => {
  return fetch.get(BASE_URI + '/api/User_Subarea/GetUser_CompanyList', {})
}
// #endregion 根据用户id获取企业列表 end

// #region 获取公司成员信息 start
export const getUserInfo = ({ UserRoleSubareaId }) => {
  return fetch.get(BASE_URI + '/api/User_Subarea/GetUser_SubareaModel', {
    params: {
      UserRoleSubareaId
    }
  })
}
// #endregion 获取公司成员信息 end

// #region 修改用户分区和角色 start
export const editUserInfo = ({
  Nickname,
  Mobile,
  UserRoleIdS,
  SubareaIdS,
  UId,
  CompanyId
}) => {
  return fetch.post(
    BASE_URI + '/api/User_Subarea/UpdateDelUser_Subarea',
    {
      Nickname,
      Mobile,
      UserRoleIdS: UserRoleIdS || undefined,
      SubareaIdS,
      UId,
      CompanyId
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 修改用户分区和角色 end

// #region 导入项目成员 start
export const importProjectUser = ({
  companyId,
  projectSubareaId,
  isSystemImport,
  form
}) => {
  return fetch.post(BASE_URI + '/api/User_Subarea/ImportProjectUser', form, {
    params: {
      companyId,
      projectSubareaId,
      isSystemImport
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 导入项目成员 end

// #region 导入企业成员 start
export const importCompanyUser = ({ companyId, form }) => {
  return fetch.post(BASE_URI + '/api/User_Subarea/ImportCompanyUser', form, {
    params: {
      companyId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 导入项目成员 end

// #region 获取项目成员列表 start
export const getProjectUserList = ({ projectId, pageIndex, pageSize }) => {
  return fetch.get(BASE_URI + '/api/User_Subarea/GetProject_UserList', {
    params: {
      projectId,
      pageIndex,
      pageSize
    }
  })
}
// #endregion 获取项目成员列表 end

// #region 获取公司下的用户（下拉框） start
export const getCompanyUserDropdown = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/User_Subarea/GetCompanyUserDropdown', {
    params: {
      companyId
    }
  })
}
// #endregion 获取公司下的用户（下拉框） end

// #region 获取公司下所有成员，包含待分配成员 start
export const getCompanyAllUserDropdown = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/User_Subarea/GetCompanyAllUserDropdown', {
    params: {
      companyId
    }
  })
}
// #endregion 获取公司下所有成员，包含待分配成员 end
