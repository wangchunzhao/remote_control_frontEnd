import fetch from '@/utils/service'

// #region 获取模板下拉框（Extend 权限集合 1:查看 2:使用 3:分享 4:编辑 5:删除(,1,2,3,4,5,)） start
export const getDeviceTemplateDropdown = () => {
  return fetch.get(BASE_URI + '/api/DeviceTemplate/GetDeviceTemplateDropdown')
}
// #endregion 获取模板下拉框（Extend 权限集合 1:查看 2:使用 3:分享 4:编辑 5:删除(,1,2,3,4,5,)） end

// #region 获取模板下拉框 包括模块 start
export const getDeviceTemplateIncludeModuleDropdown = () => {
  return fetch.get(
    BASE_URI + '/api/DeviceTemplate/GetDeviceTemplateIncludeModuleDropdown'
  )
}
// #endregion 获取模板下拉框 包括模块 end

// #region 获取模板页分享用户(来源)下拉框 start
export const getDeviceTemplatePageShareUserDropdown = () => {
  return fetch.get(
    BASE_URI + '/api/DeviceTemplate/GetDeviceTemplatePageShareUserDropdown'
  )
}
// #endregion 获取模板页分享用户(来源)下拉框 end

// #region 获取模板信息 start
export const getDeviceTemplate = ({ deviceTemplateId }) => {
  return fetch.get(BASE_URI + '/api/DeviceTemplate/GetDeviceTemplate', {
    params: {
      deviceTemplateId
    }
  })
}
// #endregion 获取模板信息 end

// #region 获取模板下分享的用户下拉框（Extend 分享用户头像） start
export const getDeviceTemplateShareUserDropdown = ({ deviceTemplateId }) => {
  return fetch.get(
    BASE_URI + '/api/DeviceTemplate/GetDeviceTemplateShareUserDropdown',
    {
      params: {
        deviceTemplateId
      }
    }
  )
}
// #endregion 获取模板下分享的用户下拉框（Extend 分享用户头像） end

// #region 添加或更新网关模块 start
export const addOrUpdateDeviceTemplate = ({
  DeviceTemplateId,
  DeviceTemplateName,
  Device_Template_ModuleList,
  ShareAble = true
}) => {
  return fetch.post(
    BASE_URI + '/api/DeviceTemplate/AddOrUpdateDeviceTemplate',
    {
      DeviceTemplateId,
      DeviceTemplateName,
      Device_Template_ModuleList
    },
    {
      params: {
        ShareAble
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加或更新网关模块 end

// #region 删除模板 start
export const deleteDeviceTemplate = ({ deviceTemplateId }) => {
  return fetch.post(
    BASE_URI + '/api/DeviceTemplate/DeleteDeviceTemplate',
    null,
    {
      params: {
        deviceTemplateId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 删除模板 end

// #region 获取模板页 start
export const getDeviceTemplatePage = ({
  DeviceTemplateName,
  ShareUserIdList,
  SortType,
  IsAsc,
  pageIndex,
  pageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/DeviceTemplate/GetDeviceTemplatePage',
    {
      DeviceTemplateName,
      ShareUserIdList,
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
// #endregion 获取模板页 end

// #region 复制网关模板 start
export const copyDeviceTemplate = ({
  deviceTemplateId,
  deviceTemplateName
}) => {
  return fetch.post(BASE_URI + '/api/DeviceTemplate/CopyDeviceTemplate', null, {
    params: {
      deviceTemplateId,
      deviceTemplateName
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 复制网关模板 end

// #region 分享网关模板 start
export const shareDeviceTemplate = ({
  deviceTemplateId,
  permission,
  userIdList
}) => {
  return fetch.post(
    BASE_URI + '/api/DeviceTemplate/ShareDeviceTemplate',
    userIdList,
    {
      params: {
        deviceTemplateId,
        permission
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 分享网关模板 end
