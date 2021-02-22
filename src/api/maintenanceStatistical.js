import fetch from '@/utils/service'
import qs from 'qs'

// #region 获取维保折线图 start
export const getMaintenanceBrokenLine = ({
  dateType,
  startDate,
  endDate,
  subareaId,
  modelBigId,
  industry,
  companyId
}) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceStatistical/GetMaintenanceBrokenLine',
    {
      params: {
        dateType,
        startDate,
        endDate,
        subareaId,
        modelBigId,
        industry,
        companyId
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      }
    }
  )
}
// #endregion 获取维保折线图 end

// #region 获取维保柱状图 start
export const getMaintenanceColumnare = ({
  dateType,
  startDate,
  endDate,
  subareaId,
  modelBigId,
  industry,
  companyId
}) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceStatistical/GetMaintenanceColumnare',
    {
      params: {
        dateType,
        startDate,
        endDate,
        subareaId,
        modelBigId,
        industry,
        companyId
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      }
    }
  )
}
// #endregion 获取维保柱状图 end

// #region 根据行业id获取设备大类 start
export const getModelBigList = ({ industry }) => {
  return fetch.get(BASE_URI + '/api/MaintenanceStatistical/GetModelBigList', {
    params: {
      industry
    }
  })
}
// #endregion 根据行业id获取设备大类 end

// #region 获取维保饼状图 start
export const getMaintenancePie = ({
  startDate,
  endDate,
  subareaId,
  industry,
  modelBigId,
  companyId
}) => {
  return fetch.get(BASE_URI + '/api/MaintenanceStatistical/GetMaintenancePie', {
    params: {
      startDate,
      endDate,
      subareaId,
      industry,
      modelBigId,
      companyId
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取维保饼状图 end

// #region 获取维修统计详细列表 start
export const getMaintenanceStatisticalDetailList = ({
  startDate,
  endDate,
  subareaId,
  pageIndex,
  pageSize,
  projectName,
  industry,
  companyId
}) => {
  return fetch.get(
    BASE_URI +
      '/api/MaintenanceStatistical/GetMaintenanceStatisticalDetailList',
    {
      params: {
        startDate,
        endDate,
        subareaId,
        industry,
        pageIndex,
        pageSize,
        projectName,
        companyId
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      }
    }
  )
}
// #endregion 获取维修统计详细列表 end

// #region 获取用电分项下拉框 start
export const getElectricTypeList = ({ companyId }) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceStatistical/GetElectricTypeList',
    {
      params: {
        companyId
      }
    }
  )
}
// #endregion 获取用电分项下拉框 end

// #region 获取用电量折线图 start
export const getElectricBrokenLine = ({
  dateType,
  startDate,
  endDate,
  subareaId,
  electricType,
  companyId,
  isShopMeter = false,
  meterType
}) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceStatistical/GetElectricBrokenLine',
    {
      params: {
        dateType,
        startDate,
        endDate,
        subareaId,
        electricType,
        companyId,
        isShopMeter,
        meterType
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      }
    }
  )
}
// #endregion 获取用电量折线图 end

// #region 获取用电量柱状图 start
export const getElectricColumnare = ({
  dateType,
  startDate,
  endDate,
  subareaId,
  electricType,
  companyId
}) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceStatistical/GetElectricColumnare',
    {
      params: {
        dateType,
        startDate,
        endDate,
        subareaId,
        electricType,
        companyId
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      }
    }
  )
}
// #endregion 获取用电量柱状图 end

// #region 获取用电量饼图 start
export const getElectricPie = ({
  startDate,
  endDate,
  subareaId,
  dateType,
  companyId
}) => {
  return fetch.get(BASE_URI + '/api/MaintenanceStatistical/GetElectricPie', {
    params: {
      dateType,
      startDate,
      endDate,
      subareaId,
      companyId
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取用电量饼图 end

// #region 获取用电量统计详细列表 start
export const getElectricStatisticalDetailList = ({
  startDate,
  endDate,
  subareaId,
  projectName,
  pageIndex,
  pageSize,
  companyId
}) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceStatistical/GetElectricStatisticalDetailList',
    {
      params: {
        startDate,
        endDate,
        subareaId,
        pageIndex,
        pageSize,
        projectName,
        companyId
      },
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false })
      }
    }
  )
}
// #endregion 获取用电量统计详细列表 end

// #region 获取项目下的保养概况 start
export const getMaintenanceOverview = ({
  projectId,
  startDate,
  endDate,
  idType
}) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceStatistical/GetMaintenanceOverview',
    {
      params: {
        projectId,
        startDate,
        endDate,
        idType
      }
    }
  )
}
// #endregion 获取项目下的保养概况 end

// #region 获取项目下的维修和报警概况 start
export const getRepairOverview = ({ projectId, idType }) => {
  return fetch.get(BASE_URI + '/api/MaintenanceStatistical/GetRepairOverview', {
    params: {
      projectId,
      idType
    }
  })
}
// #endregion 获取项目下的维修和报警概况 end
