import fetch from '@/utils/service'

// #region 获取维修详情 start
export const getQueryRepairAcitve = data => {
  return fetch.get('/api/NewRepairActive/QueryRepairAcitve', {
    params: data
  })
}
// #endregion 获取维修详情 end

// #region 获取维修详情 start
export const getRepairSchedule = data => {
  return fetch.get('/api/NewRepairActive/GetRepairSchedule', {
    params: data
  })
}
// #endregion 获取维修详情 end

// #region 获取新版维修单页 start
export const getNewRepairActivePage = ({
  CompanyId,
  Status,
  StartCreateTime,
  EndCreateTime,
  ProjectIdList,
  ApplicantIdList,
  ProjectName,
  BigTypeIdList,
  BigTypeId,
  SmallTypeId,
  EquipmentId,
  MaintenanceUnitIdList,
  RepairUserIdList,
  AcceptanceTime,
  FaultContent,
  ApplicantNameOrPhone,
  FaultContentOrOrder = '',
  IsApp,
  IsMy,
  SortType,
  IsAsc,
  FieldList,
  pageIndex,
  pageSize
}) => {
  return fetch.post(
    '/api/NewRepairActive/GetNewRepairActivePage',
    {
      CompanyId,
      Status,
      StartCreateTime,
      EndCreateTime,
      ProjectIdList,
      ApplicantIdList,
      ProjectName,
      BigTypeIdList,
      BigTypeId,
      SmallTypeId,
      EquipmentId,
      MaintenanceUnitIdList,
      RepairUserIdList,
      AcceptanceTime,
      FaultContent,
      ApplicantNameOrPhone,
      FaultContentOrOrder,
      SortType,
      IsAsc,
      IsApp,
      IsMy,
      FieldList
    },
    {
      params: {
        pageSize,
        pageIndex
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取新版维修单页 end

// #region 获取新版维修单页查询参数 start
export const getNewRepairActivePageQueryParameter = ({
  companyId,
  projectIdList
}) => {
  return fetch.post(
    `/api/NewRepairActive/GetNewRepairActivePageQueryParameter`,
    projectIdList,
    {
      params: {
        companyId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// #region 获取新版未完成维修单消息页 start
export const getNewRepairActiveMessagePage = ({
  pageIndex,
  pageSize,
  companyId
}) => {
  return fetch.post(
    '/api/NewRepairActive/GetNewRepairActiveMessagePage',
    null,
    {
      params: {
        companyId,
        pageIndex,
        pageSize
      }
    }
  )
}
// #endregion 获取新版未完成维修单消息页 end

// #region 导出新版维修单 start
export const exportNewRepairActivePage = ({
  CompanyId,
  Status,
  StartCreateTime,
  EndCreateTime,
  ProjectIdList,
  ApplicantIdList,
  ProjectName,
  BigTypeIdList,
  BigTypeId,
  SmallTypeId,
  EquipmentId,
  MaintenanceUnitIdList,
  RepairUserIdList,
  AcceptanceTime,
  FaultContent,
  ApplicantNameOrPhone,
  FaultContentOrOrder = '',
  IsApp,
  IsMy,
  SortType,
  IsAsc,
  FieldList
}) => {
  console.log('%c--', 'color:rgb(38, 139, 210)', Status)
  return fetch.post(
    '/api/NewRepairActive/ExportNewRepairActivePage',
    {
      CompanyId,
      Status,
      StartCreateTime,
      EndCreateTime,
      ProjectIdList,
      ApplicantIdList,
      ProjectName,
      BigTypeIdList,
      BigTypeId,
      SmallTypeId,
      EquipmentId,
      MaintenanceUnitIdList,
      RepairUserIdList,
      AcceptanceTime,
      FaultContent,
      ApplicantNameOrPhone,
      FaultContentOrOrder,
      SortType,
      IsAsc,
      IsApp,
      IsMy,
      FieldList
    },
    {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'blob'
    }
  )
}
// #endregion 导出新版维修单 end
