import fetch from '@/utils/service'
import qs from 'qs'

// #region 添加资产信息 start
export const addAssetsDevice = form => {
  return fetch.post('/api/Assets/AddAssetsDevice', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 添加资产信息 end

// #region 添加资产信息 start
export const addAssetsDeviceNew = form => {
  return fetch.post('/api/Assets/AddAssetsDeviceNew', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 添加资产信息 end

// #region 获取设备扩展信息 start
export const getModelTreeExtend = ({ modelTreeId, assetsCode }) => {
  return fetch.get('/api/Assets/GetModelTreeExtend', {
    params: {
      modelTreeId,
      assetsCode
    }
  })
}
// #endregion 获取设备扩展信息 end

// #region 获取经销商列表 start
export const getDealerDropdownList = ({ companyId }) => {
  return fetch.get('/api/Assets/GetDealerDropdownList', {
    params: {
      companyId
    }
  })
}
// #endregion 获取经销商列表 end

// #region 资产信息更新 start
export const updateAssets = form => {
  return fetch.post('/api/Assets/UpdateAssets_mdtree', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 资产信息更新 end

// #region 删除资产 start
export const deleteAssetsInfo = ({
  storageSpaceExtendList,
  modelTreeIdList,
  operateType
}) => {
  return fetch.post('/api/Assets/DeleteAssetsInfo', storageSpaceExtendList, {
    params: {
      modelTreeIdList,
      operateType
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 删除资产 end

// #region 导入资产 start
export const uploadAssetsExcel = formData => {
  return fetch.post('/api/Assets/Upload_AssetsExcel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// #endregion 导入资产 end

// #region 资产存放位置列表。 start
export const getAssetsAddress = ({ projectId }) => {
  return fetch.get('/api/Assets/GetAssetsAddress', {
    params: {
      projectId
    }
  })
}
// #endregion 资产存放位置列表。 end

// #region 修改资产状态 start
export const updateAssetsInfo = ({ modelTreeIdList, status, userName }) => {
  return fetch.post('/api/Assets/UpdateAssetsInfo', modelTreeIdList, {
    params: {
      status,
      userName
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改资产状态 end

// #region 根据项目获取资产列表 start
export const getAssetsList = ({
  userID = undefined,
  project,
  orderfield,
  orderfunc,
  deviceName,
  assets_typeID,
  locationZ,
  monitorID,
  devtypeID,
  status,
  InstallDateTimeQuantum = undefined,
  CreateTimeQuantum = undefined,
  companyId = undefined,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Assets/GetAssetsList',
    {
      userID,
      project,
      orderfield,
      orderfunc,
      deviceName,
      assets_typeID,
      locationZ,
      monitorID,
      devtypeID,
      status,
      companyId,
      InstallDateTimeQuantum,
      CreateTimeQuantum,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 根据项目获取资产列表 end

// #region 获取资产的状态变更纪录 start
export const getAssetsStatusLog = ({ modelTreeId }) => {
  return fetch.get('/api/Assets/GetAssets_StatusLog', {
    params: {
      modelTreeId
    }
  })
}
// #endregion 获取资产的状态变更纪录 end

// #region 获取资产的维保记录 start
export const getAssetsMaintenance = ({ modelTreeId }) => {
  return fetch.get('/api/Assets/GetAssets_Maintenance', {
    params: {
      modelTreeId
    }
  })
}
// #endregion 获取资产的维保记录 end

// #region 获取资产信息 start
export const getAssetsInfo = ({ modelTreeId }) => {
  return fetch.get('/api/Assets/GetAssets_Info', {
    params: {
      modelTreeId
    }
  })
}
// #endregion 获取资产信息 end

// #region 如果用户自定义编号的话， 要判断编号是否已经存在 start
export const existCode = ({ assetsCode }) => {
  return fetch.get('/api/Assets/ExistsAssetsCode', {
    params: {
      assetsCode
    }
  })
}
// #endregion 如果用户自定义编号的话， 要判断编号是否已经存在 end

// #region 批量修改资产属性 start
// ListID			//选中资产ID（,分割）
// projectID		//项目（项目ID）
// assets_typeID	//资产类型
// locationZ		//所在位置
// ismonitor		//监控状态
// monitorID		//监控分类ID（大类）
// devtypeID
export const updateAssetProp = form => {
  return fetch.post('/api/Assets/UpModel_TreeS', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 批量修改资产属性 end

// #region 根据项目获取资产列表 start
export const getAssetsListApp = ({
  ProjectIdList,
  DeviceNameOrAssetsCode,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Assets/GetAssetsListApp',
    {
      ProjectIdList,
      DeviceNameOrAssetsCode,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 根据项目获取资产列表 end

// #region 根据项目导出资产列表 start
export const exportAssetsList = ({
  userID,
  project,
  orderfield,
  orderfunc,
  deviceName,
  assets_typeID,
  locationZ,
  monitorID,
  devtypeID,
  status,
  companyId
}) => {
  return fetch.post(
    '/api/Assets/ExportAssetsList',
    {
      userID,
      project,
      orderfield,
      orderfunc,
      deviceName,
      assets_typeID,
      locationZ,
      monitorID,
      devtypeID,
      status,
      companyId
    },
    {
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      },
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 根据项目导出资产列表 end

// #region 资产标签导出 start
export const exportAssetsLabel = ({
  userID,
  project,
  orderfield,
  orderfunc,
  deviceName,
  assets_typeID,
  locationZ,
  monitorID,
  devtypeID,
  status,
  companyId
}) => {
  return fetch.post(
    '/api/Assets/Export_AssetsLabel',
    {
      userID,
      project,
      orderfield,
      orderfunc,
      deviceName,
      assets_typeID,
      locationZ,
      monitorID,
      devtypeID,
      status,
      companyId
    },
    {
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      },
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 资产标签导出 end

// #region 导入资产 start
export const importAssetsExcel = (formData, companyId) => {
  return fetch.post('/api/Assets/ImportAssetsExcel', formData, {
    params: {
      companyId
    },
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// #endregion 导入资产 end

// #region 根据项目导出资产列表(新版) start
export const exportAssetsListNew = ({
  userID = undefined,
  project,
  orderfield,
  orderfunc,
  deviceName,
  assets_typeID,
  locationZ,
  monitorID,
  devtypeID,
  status,
  InstallDateTimeQuantum = undefined,
  CreateTimeQuantum = undefined,
  companyId,
  ModelTreeIdList
}) => {
  return fetch.post(
    '/api/Assets/ExportAssetsListNew',
    {
      userID,
      project,
      orderfield,
      orderfunc,
      deviceName,
      assets_typeID,
      locationZ,
      monitorID,
      devtypeID,
      status,
      companyId,
      InstallDateTimeQuantum,
      CreateTimeQuantum,
      ModelTreeIdList
    },
    {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 根据项目导出资产列表(新版) end

// #region 批量修改资产属性 start
export const batchUpdateAssetsProperty = form => {
  return fetch.post('/api/Assets/BatchUpdateAssetsProperty', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 批量修改资产属性(新版) end

// #region 批量修改资产属性 start
export const updateAssetsDeviceNew = ({
  ModelTreeId,
  AssetsCode,
  AssetsType,
  ModelTreeName,
  Type,
  SerialNumber,
  ProjectId,
  Status,
  InstallDate,
  ContractNo,
  DealerId,
  CustomerName,
  StorageSpaceExtendList
}) => {
  return fetch.post(
    '/api/Assets/UpdateAssetsDeviceNew',
    {
      ModelTreeId,
      AssetsCode,
      AssetsType,
      ModelTreeName,
      Type,
      SerialNumber,
      ProjectId,
      Status,
      InstallDate,
      ContractNo,
      DealerId,
      CustomerName,
      StorageSpaceExtendList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量修改资产属性 end
