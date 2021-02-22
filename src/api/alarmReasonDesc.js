import fetch from '@/utils/service'

// #region 通过点位类型id与行业获取报警原因 start
export const alarmReasonDescribe = ({ PointTypeID, Industry }) => {
  return fetch.get(BASE_URI + '/api/Alarm_Reason_Describe/GetAlarmByAlarmID', {
    params: {
      PointTypeID,
      Industry
    }
  })
}
// #endregion 通过点位类型id与行业获取报警原因 end
