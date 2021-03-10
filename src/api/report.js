import fetch from '@/utils/service'

// #region 获取报告分页 start
export const getReportPage = data => {
  return fetch.post(HC_BASE_URI + '/api/Report/GetReportPage', data, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取报告分页 end

// #region 获取报告 start
export const getReport = ({ reportId }) => {
  return fetch.get(HC_BASE_URI + '/api/Report/GetReport', {
    params: {
      reportId
    }
  })
}
// #endregion 获取报告 end

// #region 更新报告 start
export const updateReport = data => {
  return fetch.post(HC_BASE_URI + '/api/Report/UpdateReport', data, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 更新报告 end
