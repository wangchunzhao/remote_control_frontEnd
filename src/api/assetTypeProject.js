import fetch from '@/utils/service'

// #region 获取项目资产类型树 start
export const assetsTypeList = ({ projectId }) => {
  return fetch.get('/api/AssetsTypeProject/AssetsTypeList', {
    params: {
      projectId
    }
  })
}
// #endregion 获取项目资产类型树 end

// #region 资产类型选项 start
export const fetchFilterAssetTypeOptions = ({ projectIdList, companyId }) => {
  return fetch.post('/api/AssetsTypeProject/AssetsListUser', projectIdList, {
    params: {
      companyId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 资产类型选项 end

// #region 列表筛选所有资产位置信息 start
export const fetchFilterLocationOption = ({ projectIdList, companyId }) => {
  return fetch.post(
    '/api/AssetsTypeProject/AssetsLocationUser',
    projectIdList,
    {
      params: {
        companyId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 列表筛选所有资产位置信息 end

// #region 列表筛选所有资产监控类型 start
export const fetchFilterSystemTypes = ({ projectIdList, companyId }) => {
  return fetch.post('/api/AssetsTypeProject/AssetsMonitorUser', projectIdList, {
    params: {
      companyId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 列表筛选所有资产监控类型 end

// #region 列表筛选所有资产设备类型 start
export const fetchFilterDeviceTypes = ({ projectIdList, companyId }) => {
  return fetch.post('/api/AssetsTypeProject/AssetsDevTypeUser', projectIdList, {
    params: {
      companyId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 列表筛选所有资产设备类型 end

// #region 复制资产分类 start
export const assetsTypeCopy = (projectId, projectIdNew) => {
  return fetch.post('/api/AssetsTypeProject/AssetsTypeCopy', null, {
    params: {
      projectId,
      projectIdNew
    }
  })
}
// #endregion 复制资产分类 end

// 导入资产分类
export const assetsTypeExport = form => {
  return fetch.post('/api/AssetsTypeProject/AssetsTypeExport', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}

// #region 获取公司下的资产分类 start
export const getCompanyAssetsTypeList = ({ companyId }) => {
  return fetch.get('/api/AssetsTypeProject/GetCompanyAssetsTypeList', {
    params: {
      companyId
    }
  })
}
// #endregion 获取公司下的资产分类 end
