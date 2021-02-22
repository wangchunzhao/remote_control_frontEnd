import fetch from '@/utils/service'

// #region 获取维保工单页 start
export const getMaintenanceOrderPage = ({
  CompanyId,
  ContractName,
  MaintenanceName,
  ProjectIdList,
  MaintenanceStatusList,
  ContractIdList,
  SortType,
  IsAsc,
  PageSize,
  PageIndex
}) => {
  return fetch.post(
    BASE_URI + '/api/MaintenanceOrder/GetMaintenanceOrderPage',
    {
      CompanyId,
      ContractName,
      MaintenanceName,
      ProjectIdList,
      MaintenanceStatusList,
      ContractIdList,
      SortType,
      IsAsc,
      PageSize,
      PageIndex
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取维保工单页 end

// #region 批量修改保养单保养日期和负责人 start
export const batchUpdateMaintenanceOrderTime = ({
  maintenanceOrderIdList,
  maintenanceDays,
  acceptanceUserId
}) => {
  return fetch.post(
    BASE_URI + '/api/MaintenanceOrder/BatchUpdateMaintenanceOrderTime',
    maintenanceOrderIdList,
    {
      params: {
        maintenanceDays,
        acceptanceUserId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量修改保养单保养日期和负责人 end

// #region 获取维保工单项目下拉框 start
export const getMaintenanceOrderProjectDropdownList = ({ companyId }) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceOrder/GetMaintenanceOrderProjectDropdownList',
    {
      params: {
        companyId
      }
    }
  )
}
// #endregion 获取维保工单项目下拉框 end

// #region 获取维保工单中的合同下拉框 start
export const getMaintenanceContractDropdownList = ({
  CompanyId,
  ContractName,
  MaintenanceName,
  ProjectIdList,
  MaintenanceStatusList,
  SortType,
  IsAsc,
  PageSize,
  PageIndex
}) => {
  return fetch.post(
    BASE_URI + '/api/MaintenanceOrder/GetMaintenanceContractDropdownList',
    {
      CompanyId,
      ContractName,
      MaintenanceName,
      ProjectIdList,
      MaintenanceStatusList,
      SortType,
      IsAsc,
      PageSize,
      PageIndex
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取维保工单中的合同下拉框 end

// #region 获取保养概览信息 start
export const getMaintenanceOrderOverview = ({
  companyId,
  startTime,
  endTime
}) => {
  return fetch.get(
    BASE_URI + '/api/MaintenanceOrder/GetMaintenanceOrderOverview',
    {
      params: {
        companyId,
        startTime,
        endTime
      }
    }
  )
}
// #endregion 获取保养概览信息 end
