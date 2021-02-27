import fetch from '@/utils/service'

// #region 添加或更新视频监控应用 start
export const addOrUpdateVideoMonitorApplication = ({
  VideoMonitorApplicationId,
  CompanyId,
  VideoMonitorApplicationName,
  Type,
  AppKey,
  Secret,
  AccessToken,
  AccessTokenExpiredTime,
  VideoMonitorPointList
}) => {
  return fetch.post(
    '/api/VideoMonitorApplication/AddOrUpdateVideoMonitorApplication',
    {
      VideoMonitorApplicationId,
      CompanyId,
      VideoMonitorApplicationName,
      Type,
      AppKey,
      Secret,
      AccessToken,
      AccessTokenExpiredTime,
      VideoMonitorPointList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加或更新视频监控应用 end

// #region 删除视频监控应用 start
export const deleteVideoMonitorApplication = ({
  videoMonitorApplicationId
}) => {
  return fetch.post(
    '/api/VideoMonitorApplication/DeleteVideoMonitorApplication',
    null,
    {
      params: {
        videoMonitorApplicationId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 删除视频监控应用 end

// #region 获取公司的应用 start
export const getCompanyApplication = ({ companyId }) => {
  return fetch.get('/api/Application/GetCompanyApplication', {
    params: {
      companyId
    }
  })
}
// #endregion 获取公司的应用 end

// #region 获取视频监控应用列表 start
export const getVideoMonitorApplicationList = ({ companyId }) => {
  return fetch.get(
    '/api/VideoMonitorApplication/GetVideoMonitorApplicationList',
    {
      params: {
        companyId
      }
    }
  )
}
// #endregion 获取视频监控应用列表 end

// #region 获取视频监控应用下拉框 start
export const getVideoMonitorApplicationDropdown = ({ companyId }) => {
  return fetch.get(
    '/api/VideoMonitorApplication/GetVideoMonitorApplicationDropdown',
    {
      params: {
        companyId
      }
    }
  )
}
// #endregion 获取视频监控应用下拉框 end

// #region 获取视频监控应用下拉框 start
export const getTokenByVideoMonitorApplicationId = ({
  videoMonitorApplicationId
}) => {
  return fetch.get(
    '/api/VideoMonitorApplication/GetTokenByVideoMonitorApplicationId',
    {
      params: {
        videoMonitorApplicationId
      }
    }
  )
}
// #endregion 获取视频监控应用下拉框 end

// #region 获取视频监控地址 start
export const getDeviceAddress = ({
  videoMonitorApplicationId,
  deviceSerial
}) => {
  return fetch.get('/api/VideoMonitorApplication/GetDeviceAddress', {
    params: {
      videoMonitorApplicationId,
      deviceSerial
    }
  })
}
// #endregion 获取视频监控地址 end
