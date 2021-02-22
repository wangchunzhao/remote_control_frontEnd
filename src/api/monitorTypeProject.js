import fetch from '@/utils/service'

// #region 获取项目监控类型树(新版传入所属行业) start
export const monitorTypeList = ({ projectId, industry }) => {
  return fetch.get(BASE_URI + '/api/MonitorTypeProject/MonitorTypeList', {
    params: {
      projectId,
      industry
    }
  })
}
// #endregion 获取项目监控类型树(新版传入所属行业) end
