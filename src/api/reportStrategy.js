import fetch from '@/utils/service'

// #region 设置报告策略 start
export const setReportStrategy = data => {
  return fetch.post(
    HC_BASE_URI + '/api/ReportStrategy/SetReportStrategy',
    data,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 设置报告策略 end

// #region 获取报告策略页 start
export const getReportStrategyPage = data => {
  return fetch.post(
    HC_BASE_URI + '/api/ReportStrategy/GetReportStrategyPage',
    data,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取报告策略页 end

// #region 删除报告策略 start
export const deleteReportStrategy = ({ reportStrategyId }) => {
  return fetch.get(HC_BASE_URI + '/api/ReportStrategy/DeleteReportStrategy', {
    params: {
      reportStrategyId
    }
  })
}
// #endregion 删除报告策略 end
