import fetch from '@/utils/service'
import qs from 'qs'

// #region 根据行业获取维保类型 start
/**
 *{ Industry } 传 0 是获取类型，不分行业
 *
 */
export const getModelList = ({ Industry }) => {
  return fetch.get('/api/Maintenance_Unit/GetModel_List', {
    params: {
      Industry
    }
  })
}
// #endregion 根据行业获取维保类型 end

// #region 添加维保单位 start
export const addMaintenanceUnit = ({
  CompanyId,
  CompanyName,
  CustomerId,
  SubareaIdList,
  TypeID,
  Mobile,
  Nickname
}) => {
  return fetch.post(
    '/api/Maintenance_Unit/AddMaintenance_Unit',
    {
      CompanyId,
      CompanyName,
      CustomerId,
      SubareaIdList,
      TypeID,
      Mobile,
      Nickname
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加维保单位 end

// #region 添加维保单位 start
export const updateMaintenanceUnit = ({
  SubareaIdList,
  TypeID,
  Maintenance_UnitId
}) => {
  return fetch.put(
    '/api/Maintenance_Unit/UpdateMaintenance_Unit',
    {
      Maintenance_UnitId,
      SubareaIdList,
      TypeID
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加维保单位 end

// #region 根据公司ID与维保商ID 移除公司维保商 start
export const deleteMaintenanceUnit = ({ Maintenance_UnitId }) => {
  return fetch.delete('/api/Maintenance_Unit/DeleteMaintenance_Unit', {
    params: {
      Maintenance_UnitId
    }
  })
}
// #endregion 根据公司ID与维保商ID 移除公司维保商 end

// #region 维保商启用与停止 start
export const startStopMaintenanceUnit = ({ Maintenance_UnitId }) => {
  return fetch.get('/api/Maintenance_Unit/StartStopMaintenance_Unit', {
    params: {
      Maintenance_UnitId
    }
  })
}
// #endregion 维保商启用与停止 end

// #region 查询维保商详情 start
export const getMaintenanceUnit = ({ Maintenance_UnitId }) => {
  return fetch.get('/api/Maintenance_Unit/GetMaintenance_Unit', {
    params: {
      Maintenance_UnitId
    }
  })
}
// #endregion 查询维保商详情 end

// #region 根据公司ID与维修类型获取维保公司列表 start
export const getMaintenanceUnitList = ({
  companyId,
  typeId,
  pageIndex,
  pageSize,
  companyName,
  orderby,
  subareas
}) => {
  return fetch.get('/api/Maintenance_Unit/GetMaintenance_UnitList', {
    params: {
      companyId,
      typeId,
      pageIndex,
      pageSize,
      companyName,
      orderby,
      subareas
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 根据公司ID与维修类型获取维保公司列表 end
