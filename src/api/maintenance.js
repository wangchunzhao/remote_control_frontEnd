import fetch from '@/utils/service'

// #region 添加或更新维保团队 start
export const addOrUpdateMaintenance = ({
  MaintenanceId,
  CompanyId,
  MaintenanceName,
  Status = undefined,
  UserIdList = undefined,
  SubareaIdList = undefined,
  SubsystemIdList = undefined
}) => {
  return fetch.post(
    '/api/Maintenance/AddOrUpdateMaintenance',
    {
      MaintenanceId,
      CompanyId,
      MaintenanceName,
      Status,
      UserIdList,
      SubareaIdList,
      SubsystemIdList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加或更新维保团队 end

// #region 批量删除维保团队 start
export const deleteMaintenance = ({ ids }) => {
  return fetch.post('/api/Maintenance/DeleteMaintenance', ids, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 批量删除维保团队 end

// #region 获取公司所有维保团队成员 start
export const getMaintenancePageParameter = ({ companyId, maintenanceId }) => {
  return fetch.get('/api/Maintenance/GetMaintenancePageParameter', {
    params: {
      companyId,
      maintenanceId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取公司所有维保团队成员 end

// #region 获取维保团队页 start
export const getMaintenancePage = ({
  CompanyId,
  MaintenanceName,
  UserIdList,
  SubareaIdList,
  SubsystemIdList,
  StatusList,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Maintenance/GetMaintenancePage',
    {
      CompanyId,
      MaintenanceName,
      UserIdList,
      SubareaIdList,
      SubsystemIdList,
      StatusList,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取维保团队页 end

// #region 通过子系统id获取维保团队下拉框 start
export const getMaintenanceDropdownBySubsystemId = ({
  projectId,
  subsystemId
}) => {
  return fetch.get('/api/Maintenance/GetMaintenanceDropdownBySubsystemId', {
    params: {
      projectId,
      subsystemId
    }
  })
}
// #endregion 通过子系统id获取维保团队下拉框 end

// #region 设置维保管理员 start
export const setMaintenanceAdmin = ({ maintenanceId, userId }) => {
  return fetch.get('/api/Maintenance/SetMaintenanceAdmin', {
    params: {
      maintenanceId,
      userId
    }
  })
}
// #endregion 设置维保管理员 end
