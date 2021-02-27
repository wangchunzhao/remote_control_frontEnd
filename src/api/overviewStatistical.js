import fetch from '@/utils/service'

// #region 获取昨日统计总览 start
export const getYesterDayOverview = ({ industry, companyId }) => {
  return fetch.get('/api/OverviewStatistical/GetYesterDayOverview', {
    params: {
      industry,
      companyId
    }
  })
}
// #endregion 获取昨日统计总览 end

// #region 客流趋势折线图 start
export const getPassengerBrokenLine = ({
  startTime,
  endTime,
  dateType,
  companyId
}) => {
  return fetch.get('/api/OverviewStatistical/GetPassengerBrokenLine', {
    params: {
      startTime,
      endTime,
      dateType,
      companyId
    }
  })
}
// #endregion 客流趋势折线图 end

// #region 报修故障原因前10 start
export const getFaultDescribeRanking = ({ startTime, endTime, companyId }) => {
  return fetch.get('/api/OverviewStatistical/GetFaultDescribeRanking', {
    params: {
      startTime,
      endTime,
      companyId
    }
  })
}
// #endregion 报修故障原因前10 end
