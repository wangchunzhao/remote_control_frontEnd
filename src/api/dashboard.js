import fetch from '@/utils/service'
import qs from 'qs'

// #region 获取项目详情 start
export const GetProject = (data = {}) => {
  return fetch.get(`/api/Subarea/GetProject`, {
    params: data,
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取项目详情 end

// #region 获取用电排行分页 start
export const GetElectricRankPage = (data = {}) => {
  return fetch.post('/api/MaintenanceStatistical/GetElectricRankPage', data, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取用电排行分页 end

// #region 获取用电概览 start
export const GetElectricOverview = (data = {}) => {
  return fetch.post('/api/MaintenanceStatistical/GetElectricOverview', data, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取用电概览 end
