import fetch from '@/utils/service'

// #region 获取多项目折线图点位 start
export const getMoreProjectPointBrokenLine = (data = {}) => {
  return fetch.post(
    global.HC_BASE_URI +
      '/api/DeviceMonitoryPoint/GetMoreProjectPointBrokenLine',
    data,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取多项目折线图点位 end

// #region 获取多项目点位表格 start
export const getMoreProjectPointTable = ({
  PointIdList,
  DateType,
  TimeQuantum,
  ClassifyList,
  TimeIntervalId,
  isExport
}) => {
  return fetch.post(
    global.HC_BASE_URI + '/api/DeviceMonitoryPoint/GetMoreProjectPointTable',
    {
      PointIdList,
      DateType,
      TimeQuantum,
      ClassifyList,
      TimeIntervalId,
      isExport
    },
    {
      params: {
        isExport
      },
      responseType: isExport ? 'blob' : undefined,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取多项目点位表格 end
