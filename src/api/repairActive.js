import fetch from '@/utils/service'

// #region 获取设备绑定的维保方 start
export const getBindingMaintenanceUser = params => {
  return fetch.get(
    BASE_URI + `/api/NewRepairActive/GetBindingMaintenanceUser`,
    {
      params
    }
  )
}
// #endregion 获取设备绑定的维保方 end

// #region 获取单个设备对应的维保单位 start
export const getMaintenanceUnit = ({ projectID, typeID }) => {
  return fetch.get(BASE_URI + '/api/NewRepairActive/GetMaintenanceUnitList', {
    params: {
      projectID,
      typeID
    }
  })
}
// #endregion 获取单个设备对应的维保单位 end

// #region 获取维保单位下的维修人 start
export const getMaintenanceUserList = ({ maintenanceUnitID }) => {
  return fetch.get(BASE_URI + '/api/NewRepairActive/GetMaintenanceUserList', {
    params: {
      maintenanceUnitID
    }
  })
}
// #endregion 获取维保单位下的维修人 end

// #region 获取设备故障现在列表 start
export const getRepairFaultList = ({ devtypeID }) => {
  return fetch.get(BASE_URI + '/api/NewRepairActive/GetRepairFaultList', {
    params: {
      devtypeID
    }
  })
}
// #endregion 获取设备故障现在列表 end

// #region 添加报修工单 start
export const addRepair = ({
  ProjectID,
  ALARM_ACTIVE_ID,
  MaintenanceUnit,
  MaintenanceUser,
  FaultDescribe,
  Remarks,
  FaultPhoto,
  EquipmentID,
  Applicant
}) => {
  return fetch.post(
    BASE_URI + '/api/NewRepairActive/AddRepair',
    {
      ProjectID,
      ALARM_ACTIVE_ID,
      MaintenanceUnit,
      MaintenanceUser,
      FaultDescribe,
      Remarks,
      FaultPhoto,
      EquipmentID,
      Applicant
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加报修工单 end

// #region 获取维修记录页 start
export const getRepairLogPage = ({
  CompanyId,
  ProjectIdList,
  TimeQuantum,
  IsUseSparePart,
  IsRepair,
  RepairUserList,
  ApplicantList,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/NewRepairActive/GetRepairLogPage',
    {
      CompanyId,
      ProjectIdList,
      TimeQuantum,
      IsUseSparePart,
      IsRepair,
      RepairUserList,
      ApplicantList,
      SortType,
      IsAsc,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取维修记录页 end

// #region 导出新版维修单 start
export const exportRepairLogPage = ({
  CompanyId,
  ProjectIdList,
  TimeQuantum,
  IsUseSparePart,
  IsRepair,
  RepairUserList,
  ApplicantList,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/NewRepairActive/ExportRepairLogPage',
    {
      CompanyId,
      ProjectIdList,
      TimeQuantum,
      IsUseSparePart,
      IsRepair,
      RepairUserList,
      ApplicantList,
      SortType,
      IsAsc,
      PageIndex,
      PageSize
    },
    {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出新版维修单 end

// #region 获取维修记录页参数 start
export const getRepairLogPageParameter = ({ CompanyId, ProjectIdList }) => {
  return fetch.post(
    BASE_URI + '/api/NewRepairActive/GetRepairLogPageParameter',
    {
      CompanyId,
      ProjectIdList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取维修记录页参数 end
