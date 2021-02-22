import fetch from '@/utils/service'
import qs from 'qs'

// #region 获取能耗监测数量信息 start
export const getEnergyNum = ({ projectId }) => {
  return fetch.get(BASE_URI + '/api/EnergyStatistical/GetEnergyNum', {
    params: {
      projectId
    }
  })
}
// #endregion 获取能耗监测数量信息 end

// #region 获取用电量柱状图 start
export const getEnergyContrastColumnare = ({
  dateType,
  startDate,
  endDate,
  modelTreeIdList
}) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/GetEnergyContrastColumnare',
    modelTreeIdList,
    {
      params: {
        dateType,
        startDate,
        endDate
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取用电量柱状图 end

// #region 获取能耗对比柱状图 start
export const getEnergySubentryColumnare = ({
  dateType,
  startDate,
  endDate,
  modelTreeIdList,
  subentryId
}) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/GetEnergySubentryColumnare',
    modelTreeIdList,
    {
      params: {
        dateType,
        startDate,
        endDate,
        subentryId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取能耗对比柱状图 end

// #region 获取能耗分项多时段柱状图 start
export const getEnergyTimeContrastColumnare = ({
  dateType,
  timeQuantumList,
  modelTreeIdList
}) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/GetEnergyTimeContrastColumnare',
    timeQuantumList,
    {
      params: {
        dateType,
        modelTreeIdList
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取能耗分项多时段柱状图 end

// #region 获取能耗折线图 start
export const getEnergyTimeContrastBrokenLine = ({
  dateType,
  timeQuantumList,
  modelTreeIdList,
  isGetSummary = false
}) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/GetEnergyTimeContrastBrokenLine',
    timeQuantumList,
    {
      params: {
        dateType,
        modelTreeIdList,
        isGetSummary
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取能耗折线图 end

// #region 获取能耗指标 start
export const getEnergyQuota = ({ projectId, subentryId, modelTreeIdList }) => {
  return fetch.post(BASE_URI + '/api/EnergyStatistical/GetEnergyQuota', null, {
    params: {
      projectId,
      subentryId,
      modelTreeIdList
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取能耗指标 end

// #region 导出能耗指标 start
export const exportEnergyQuota = ({
  projectId,
  subentryId,
  modelTreeIdList
}) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/ExportEnergyQuota',
    null,
    {
      params: {
        projectId,
        subentryId,
        modelTreeIdList
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      },
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出能耗指标 end

// #region 功率需量列表 start
export const getPowerEnergyDemandList = ({ projectId, modelTreeIdList }) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/GetPowerEnergy_demandList',
    modelTreeIdList,
    {
      params: {
        projectId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 功率需量列表 end

// #region 更新能耗需量 start
export const updateEnergyDemand = ({ list }) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/UpdateEnergy_demand',
    list,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新能耗需量 end

// #region 导出需量数据 start
export const exportEnergyDemand = ({ projectId, modelTreeIdList }) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/ExportEnergy_demand',
    modelTreeIdList,
    {
      params: {
        projectId
      },
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出需量数据 end

// #region 获取用电量功率折线图 start
export const getEnergyPowerBrokenLine = ({
  IsYesterday,
  startDate,
  endDate,
  modelTreeList
}) => {
  return fetch.post(
    BASE_URI + '/api/EnergyStatistical/GetEnergyPowerBrokenLine',
    {
      modelTreeList,
      IsYesterday,
      startDate,
      endDate
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取用电量功率折线图 end

// #region 获取用电量功率散点图 start
export const getProjectEnergyPowerScatterPlot = ({
  projectId,
  startDate,
  endDate
}) => {
  return fetch.get(
    BASE_URI + '/api/EnergyStatistical/GetProjectEnergyPowerScatterPlot',
    {
      params: {
        startDate,
        endDate,
        projectId
      }
    }
  )
}
// #endregion 获取用电量功率散点图 end
