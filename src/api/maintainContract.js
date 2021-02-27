import fetch from '@/utils/service'

// #region 添加维保合同 start
export const addMaintainContract = ({
  contractNumber,
  contractName,
  maintainType,
  partyA,
  partyB,
  startDate,
  endDate,
  MaintenanceTemplate,
  projectList
}) => {
  return fetch.post(
    '/api/MaintainContract/AddMaintainContract',
    {
      contractNumber,
      contractName,
      maintainType,
      partyA,
      partyB,
      startDate,
      endDate,
      MaintenanceTemplate,
      projectList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加维保合同 end

// #region 删除维保合同 start
export const deleteMaintainContract = ({ contractIDList }) => {
  return fetch.post(
    '/api/MaintainContract/DeleteMaintainContract',
    contractIDList,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 删除维保合同 end

// #region 获取维保合同页 start
export const maintainContractList = ({
  QueryType,
  PartyA,
  PartyB,
  ContractName,
  ContractNumber,
  Status,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/MaintainContract/MaintainContractList',
    {
      QueryType,
      PartyA,
      PartyB,
      ContractName,
      ContractNumber,
      Status,
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
// #endregion 获取维保合同页 end

// #region 获取合同最后一个编号 start
export const getContractNumber = () => {
  return fetch.get('/api/MaintainContract/GetContractNumber')
}
// #endregion 获取合同最后一个编号 end

// #region 获取维保合同详情 start
export const getMaintainContractQuery = ({ contractID }) => {
  return fetch.get('/api/MaintainContract/GetMaintainContractQuery', {
    params: {
      contractID
    }
  })
}
// #endregion 获取维保合同详情 end

// #region 编辑维保合同 start
export const updateMaintainContract = ({
  contractID,
  contractNumber,
  contractName,
  maintainType,
  partyA,
  partyB,
  startDate,
  endDate,
  MaintenanceTemplate,
  projectList
}) => {
  return fetch.post(
    '/api/MaintainContract/UpdateMaintainContract',
    {
      contractID,
      contractNumber,
      contractName,
      maintainType,
      partyA,
      partyB,
      startDate,
      endDate,
      MaintenanceTemplate,
      projectList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 编辑维保合同 end

// #region 合同签约 start
export const signingMaintainContract = ({
  contractID,
  partyA,
  partyB,
  MaintenanceTemplate
}) => {
  return fetch.post(
    '/api/MaintainContract/SigningMaintainContract',
    {
      contractID,
      partyA,
      partyB,
      MaintenanceTemplate
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 合同签约 end

// #region 修改保养时间 start
export const updateMaintainTime = form => {
  return fetch.post('/api/MaintainContract/UpdateMaintainTime', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改保养时间 end

// #region 获取甲方企业 start
export const getPartyACompany = ({ companyId }) => {
  return fetch.get('/api/MaintainContract/GetPartyACompany', {
    params: {
      companyId
    }
  })
}
// #endregion 获取甲方企业 end

// #region 获取甲方维保单位 start
export const getPartyBCompany = ({ companyId }) => {
  return fetch.get('/api/MaintainContract/GetPartyBCompany', {
    params: {
      companyId
    }
  })
}
// #endregion 获取甲方维保单位 end
