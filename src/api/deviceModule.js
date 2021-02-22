import fetch from '@/utils/service'

// #region 获取模块下拉框（IsSelect 0：自定义模块 1：系统模块） start
export const getDeviceModuleDropdown = ({ companyId, projectId }) => {
  return fetch.get(BASE_URI + '/api/DeviceModule/GetDeviceModuleDropdown', {
    params: {
      companyId,
      projectId
    }
  })
}
// #endregion 获取模块下拉框（IsSelect 0：自定义模块 1：系统模块） end

// #region 获取模块信息 start
/**
 * 获取模块信息
 */
export const getDeviceModule = ({ deviceModuleId }) => {
  return fetch.get(BASE_URI + '/api/DeviceModule/GetDeviceModule', {
    params: {
      deviceModuleId
    }
  })
}
// #endregion 获取模块信息 end

// #region 获取模块页 start
export const getDeviceModulePage = ({
  DeviceModuleId, // 网关模块id(该参数会使其他条件失效)
  DeviceModuleName,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/DeviceModule/GetDeviceModulePage',
    {
      DeviceModuleId,
      DeviceModuleName,
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
// #endregion 获取模块页 end

// #region 更新网关模块所属品类 start
export const updateDeviceModuleModel = data => {
  return fetch.get(BASE_URI + '/api/DeviceModule/UpdateDeviceModuleModel', {
    params: data
  })
}
// #endregion 更新网关模块所属品类 end

// #region 添加或更新网关模块 start
export const addOrUpdateDeviceModule = ({
  DeviceModuleId,
  UserId,
  DeviceModuleName,
                                          SmallTypeId,
  PointNum,
  BaudRate,
  DataBit,
  CheckBit,
  StopBit,
  DeviceModulePointList,
  IsUpdateDevice = false
}) => {
  return fetch.post(
    BASE_URI + '/api/DeviceModule/AddOrUpdateDeviceModule',
    {
      DeviceModuleId,
      UserId,
      DeviceModuleName,
      PointNum,
      BaudRate,
      DataBit,
      CheckBit,
      StopBit,
      DeviceModulePointList
    },
    {
      params: {
        IsUpdateDevice,
        smallTypeId: SmallTypeId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加或更新网关模块 end

// #region 删除模块 start
export const deleteDeviceModule = ({ deviceModuleId }) => {
  return fetch.post(BASE_URI + '/api/DeviceModule/DeleteDeviceModule', null, {
    params: {
      deviceModuleId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 删除模块 end

// #region 获取网关模块下的点位 start
export const getDeviceModulePointList = ({ deviceModuleId, isGetAll }) => {
  return fetch.get(BASE_URI + '/api/DeviceModule/GetDeviceModulePointList', {
    params: {
      isGetAll,
      deviceModuleId
    }
  })
}
// #endregion 获取网关模块下的点位 end

// #region 更新网关模块串口参数 start
export const updateDeviceModuleGorgeParameter = ({
  deviceModuleId,
  deviceModuleGorgeParameter
}) => {
  return fetch.post(
    BASE_URI + '/api/DeviceModule/UpdateDeviceModuleGorgeParameter',
    deviceModuleGorgeParameter,
    {
      params: {
        deviceModuleId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新网关模块串口参数 end

// #region 获取网关模块下的点位 start
export const updateDeviceModuleName = ({
  deviceModuleId,
  deviceModuleName
}) => {
  return fetch.get(BASE_URI + '/api/DeviceModule/UpdateDeviceModuleName', {
    params: {
      deviceModuleName,
      deviceModuleId
    }
  })
}
// #endregion 获取网关模块下的点位 end

// #region 更新网关模块权限范围 start
export const updateDeviceModulePermissionScope = ({
  deviceModuleId,
  permissionType,
  permissionId
}) => {
  return fetch.get(
    BASE_URI + '/api/DeviceModule/UpdateDeviceModulePermissionScope',
    {
      params: {
        permissionType,
        deviceModuleId,
        permissionId
      }
    }
  )
}
// #endregion 更新网关模块权限范围 end
