import fetch from '@/utils/service'
import qs from 'qs'

// #region 获取报警总趋势折线图 start
export const getAlarmNumBrokenLine = ({
  startTime,
  endTime,
  dateType,
  subareaId,
  modelBigId,
  companyId
}) => {
  return fetch.get(BASE_URI + '/api/AlarmStatistical/GetAlarmNumBrokenLine', {
    params: {
      startTime,
      endTime,
      dateType,
      subareaId,
      modelBigId,
      companyId
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取报警总趋势折线图 end

// #region 获取报警柱状图 start
export const getAlarmNumColumnare = ({
  companyId,
  startTime,
  endTime,
  dateType,
  subareaId,
  modelBigId
}) => {
  return fetch.get(BASE_URI + '/api/AlarmStatistical/GetAlarmNumColumnare', {
    params: {
      companyId,
      startTime,
      endTime,
      dateType,
      subareaId,
      modelBigId
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取报警柱状图 end

// #region 获取报警饼图 start
export const getAlarmNumPie = ({
  companyId,
  startTime,
  endTime,
  industry,
  subareaId,
  modelBigId
}) => {
  return fetch.get(BASE_URI + '/api/AlarmStatistical/GetAlarmNumPie', {
    params: {
      companyId,
      startTime,
      endTime,
      subareaId,
      modelBigId,
      industry
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取报警饼图 end

// #region 获取项目各系统报警数量列表 start
export const getAlarmNumList = ({
  companyId,
  startTime,
  endTime,
  industry,
  subareaId,
  projectName,
  pageIndex,
  pageSize
}) => {
  return fetch.get(BASE_URI + '/api/AlarmStatistical/GetAlarmNumList', {
    params: {
      companyId,
      startTime,
      endTime,
      industry,
      subareaId,
      projectName,
      pageIndex,
      pageSize
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取项目各系统报警数量列表 end

// #region 获取报警时长饼图 start
export const getAlarmTimePie = ({
  companyId,
  startTime,
  endTime,
  industry
}) => {
  return fetch.get(BASE_URI + '/api/AlarmStatistical/GetAlarmTimePie', {
    params: {
      companyId,
      startTime,
      endTime,
      industry
    }
  })
}
// #endregion 获取报警时长饼图 end

// #region 获取报警等级饼图 start
export const getAlarmLevelPie = ({
  companyId,
  startTime,
  endTime,
  industry
}) => {
  return fetch.get(BASE_URI + '/api/AlarmStatistical/GetAlarmLevelPie', {
    params: {
      companyId,
      startTime,
      endTime,
      industry
    }
  })
}
// #endregion 获取报警等级饼图 end

// #region 根据项目与系统类型获取报警列表 start
export const getAlarmListStatistical = ({
  projectId,
  modelBigId,
  startTime,
  endTime,
  pageIndex,
  pageSize
}) => {
  return fetch.get(BASE_URI + '/api/AlarmStatistical/GetAlarmListStatistical', {
    params: {
      startTime,
      endTime,
      projectId,
      modelBigId,
      pageIndex,
      pageSize
    }
  })
}
// #endregion 根据项目与系统类型获取报警列表 end
