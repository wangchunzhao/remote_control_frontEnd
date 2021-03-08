import fetch from '@/utils/service'

// #region 设置报告联系人 start
export const setReportContact = data => {
  return fetch.post(HC_BASE_URI + '/api/ReportContact/SetReportContact', data, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 设置报告联系人 end

// #region 获取报告联系人 start
export const getProjectReportContactUser = ({ projectId }) => {
  return fetch.get(
    HC_BASE_URI + '/api/ReportContact/GetProjectReportContactUser',
    {
      params: {
        projectId
      }
    }
  )
}
// #endregion 获取报告联系人 end

// #region 获取报告通知方式 start
export const getReportContact = ({ projectId, reportContactId }) => {
  return fetch.get(HC_BASE_URI + '/api/ReportContact/GetReportContact', {
    params: {
      projectId,
      reportContactId
    }
  })
}
// #endregion 获取报告通知方式 end
