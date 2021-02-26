import fetch from '@/utils/service'

// #region 通过企业id获取分区树 start
export const getSubareaTree = ({ companyId, isGetProject = true }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetSubareaTree', {
    params: {
      isGetProject,
      companyId
    }
  })
}
// #endregion 通过企业id获取分区树 end

// #region 判断企业下项目是否未配置其他成员(第一次配置加载企业成员) start
export const getCompanyProjectUserConfig = ({ projectId, CompanyId }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetCompanyProjectUserConfig', {
    params: {
      projectId,
      CompanyId
    }
  })
}
// #endregion 判断企业下项目是否未配置其他成员(第一次配置加载企业成员) end

// #region 添加分区 start
export const addSubarea = ({ parentId, subareaName }) => {
  return fetch.post(BASE_URI + '/api/Subarea/AddSubarea', null, {
    params: {
      parentId,
      subareaName
    }
  })
}
// #endregion 添加分区 end

// #region 编辑分区 start
export const editSubarea = ({ subareaId, subareaName }) => {
  return fetch.put(BASE_URI + '/api/Subarea/EditSubarea', null, {
    params: {
      subareaId,
      subareaName
    }
  })
}
// #endregion 编辑分区 end

// #region 删除分区 start
export const deleteSubarea = ({ subareaId }) => {
  return fetch.delete(BASE_URI + '/api/Subarea/DeleteSubarea', {
    params: {
      subareaId
    }
  })
}
// #endregion 删除分区 end

// #region 添加项目 start
export const addProject = (form, parentId) => {
  return fetch.post(BASE_URI + '/api/Subarea/AddProject', form, {
    params: {
      parentId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 添加项目 end

// #region 获取项目列表 start
export const getProjectList = ({
  SubareaId,
  ProjectName,
  Industry,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/Subarea/GetProjectPage',
    {
      SubareaId,
      ProjectName,
      Industry,
      SortType,
      IsAsc,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取项目列表 end

// #region 导出项目列表 start
export const exportProjectPage = ({ SubareaId, ProjectName, Industry }) => {
  return fetch.post(
    BASE_URI + '/api/Subarea/ExportProjectPage',
    {
      SubareaId,
      ProjectName,
      Industry
    },
    {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'blob'
    }
  )
}
// #endregion 导出项目列表 end

// #region 获取单个项目 start
export const getProject = ({ projectId }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetProject', {
    params: {
      projectId
    }
  })
}
// #endregion 获取单个项目 end

// #region 编辑项目 start
export const editProject = (form, parentId) => {
  return fetch.put(BASE_URI + '/api/Subarea/EditProject', form, {
    params: {
      parentId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 编辑项目 end

// #region 获取分区列表 start
export const getSubareaList = ({ subareaId, pageIndex, pageSize }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetSubareaPage', {
    params: {
      subareaId,
      pageIndex,
      pageSize
    }
  })
}
// #endregion 获取分区列表 end

// #region 该企业下分区或项目名称是否存在 start
export const isNameExist = ({ companyId, subareaName }) => {
  return fetch.get(BASE_URI + '/api/Subarea/IsSubareaExist', {
    params: {
      companyId,
      subareaName
    }
  })
}
// #endregion 该企业下分区或项目名称是否存在 end

// #region 删除项目 start
export const deleteProject = ({ pwd, projectId }) => {
  return fetch.delete(BASE_URI + '/api/Subarea/DeleteProject', {
    params: {
      pwd,
      projectId
    }
  })
}
// #endregion 删除项目 end

// #region 获取分区options start
export const getSubareaOptions = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetAllSubarea', {
    params: {
      companyId
    }
  })
}
// #endregion 获取分区options end

// #region 当前用户拥有的分区树 start
export const getUserOwnSubareaTree = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetUserOwnSubareaTree', {
    params: {
      companyId
    }
  })
}
// #endregion 当前用户拥有的分区树 end

// #region 获取用户拥有的项目 start
export const getUserOwnProject = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetUserOwnProject', {
    params: {
      companyId
    }
  })
}
// #endregion 获取用户拥有的项目 end

// #region 项目列表 start
export const getUserProjectAlarm = ({ companyId, SubareaId, IsShow }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetUserProjectAlarm', {
    params: {
      companyId,
      SubareaId,
      IsShow
    }
  })
}
// #endregion 项目列表 end

// #region 分区列表 start
export const getUserSubareaList = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetUserSubareaList', {
    params: {
      companyId
    }
  })
}
// #endregion 分区列表 end

// #region 获取行业下改项目子系统信息 start
export const getProjectModelList = ({ projectId, Industry }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetProject_ModelList', {
    params: {
      projectId,
      Industry
    }
  })
}
// #endregion 获取行业下改项目子系统信息 end

// #region 子系统配置 start
export const updateProjectModel = ({ modelList }) => {
  return fetch.post(BASE_URI + '/api/Subarea/UpdateProjectModel', modelList, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 子系统配置 end

// #region 项目迁移 start
export const updateProjectCompany = ({
  OldCompanyId,
  CompanyId,
  SubareaId,
  ProjectIds,
  Access
}) => {
  return fetch.post(
    BASE_URI + '/api/Subarea/UpdateProjectCompany',
    {
      OldCompanyId,
      CompanyId,
      SubareaId,
      ProjectIds,
      Access
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 项目迁移 end

// #region 获取迁入迁出企业权限 start
export const getAccessCompany = ({ Access }) => {
  return fetch.post(BASE_URI + '/api/Subarea/GetAccessCompany', null, {
    params: {
      Access
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取迁入迁出企业权限 end

// #region 获取所有分区树 start
export const getAllSubareaTree = ({ isGetProject, isPermission }) => {
  return fetch.get(BASE_URI + '/api/Subarea/GetAllSubareaTree', {
    params: {
      isGetProject,
      isPermission
    }
  })
}
// #endregion 获取所有分区树 end

// #region 获取分区标签 start
export const getSubareaTagPage = ({ CompanyId, PageIndex, PageSize }) => {
  return fetch.post(BASE_URI + '/api/Subarea/GetSubareaTagPage', {
    params: {
      CompanyId,
      PageIndex,
      PageSize
    }
  })
}
// #endregion 获取分区标签 end
