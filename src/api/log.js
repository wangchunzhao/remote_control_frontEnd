import fetch from '@/utils/service'

// #region 获取日志模块以及模块下的操作列表 start
export const getLogModelAndActionList = () => {
  return fetch.get('/api/Log/GetLogModelAndActionList')
}
// #endregion 获取日志模块以及模块下的操作列表 end

// #region 获取日志页 start
export const getLogPage = ({
  CompanyId,
  StartTime,
  EndTime,
  UserId,
  LogModelId,
  ProjectId = undefined,
  LogModelActionId,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Log/GetLogPage',
    {
      CompanyId,
      StartTime,
      EndTime,
      UserId,
      LogModelId,
      ProjectId,
      LogModelActionId,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取日志页 end

// #region 导出操作日志 start
export const exportLogPage = ({
  CompanyId,
  StartTime,
  EndTime,
  UserId,
  LogModelId,
  LogModelActionId,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Log/ExportLogPage',
    {
      CompanyId,
      StartTime,
      EndTime,
      UserId,
      LogModelId,
      LogModelActionId,
      PageIndex,
      PageSize
    },
    {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出操作日志 end

// #region 添加日志 start
export const addLog = ({
  CompanyId,
  ProjectId,
  LogModelId,
  LogModelActionId,
  LogModelActionName,
  Content,
  RequestContent,
  Ip = undefined,
  IpAddress = undefined,
  Url = undefined
}) => {
  return fetch.post(
    '/api/Log/AddLog',
    {
      CompanyId,
      ProjectId,
      LogModelId,
      LogModelActionId,
      LogModelActionName,
      Ip,
      IpAddress,
      Content,
      RequestContent,
      Url
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加日志 end
