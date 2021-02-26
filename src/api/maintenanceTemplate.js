import fetch from '@/utils/service'

// #region 添加或更新维保模板 start
export const addOrUpdateMaintenanceTemplate = ({
  MaintenanceTemplateId,
  CompanyId,
  BigTypeId,
  BigTypeName,
  MaintenanceTemplateName,
  MaintenanceCycle,
  MaintenanceType
}) => {
  return fetch.post(
    '/api/MaintenanceTemplate/AddOrUpdateMaintenanceTemplate',
    {
      MaintenanceTemplateId,
      CompanyId,
      BigTypeId,
      BigTypeName,
      MaintenanceTemplateName,
      MaintenanceCycle,
      MaintenanceType
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加或更新维保模板 end

// #region 获取维保模板页 start
export const getMaintenanceTemplatePage = ({
  CompanyId,
  MaintenanceTemplateName,
  BigTypeIdList,
  MaintenanceCycleList,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/MaintenanceTemplate/GetMaintenanceTemplatePage',
    {
      CompanyId,
      MaintenanceTemplateName,
      BigTypeIdList,
      MaintenanceCycleList,
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
// #endregion 获取维保模板页 end

// #region 添加换更新维保模板项 start
export const addOrUpdateMaintenanceTemplateItem = ({
  MaintenanceTemplateItemId,
  MaintenanceTemplateItemName,
  MaintenanceTemplateId,
  GroupName,
  TemplateType,
  TemplateContent,
  Order
}) => {
  return fetch.post(
    '/api/MaintenanceTemplate/AddOrUpdateMaintenanceTemplateItem',
    {
      MaintenanceTemplateItemId,
      MaintenanceTemplateItemName,
      MaintenanceTemplateId,
      GroupName,
      TemplateType,
      TemplateContent,
      Order
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加换更新维保模板项 end

// #region 删除维保模板 start
export const deleteMaintenanceTemplate = ({ maintenanceTemplateId }) => {
  return fetch.get('/api/MaintenanceTemplate/DeleteMaintenanceTemplate', {
    params: {
      maintenanceTemplateId
    }
  })
}
// #endregion 删除维保模板 end

// #region 获取维保模板项字典（通过GroupName分组之后的字典） start
export const getMaintenanceTemplateItemList = ({ maintenanceTemplateId }) => {
  return fetch.get('/api/MaintenanceTemplate/GetMaintenanceTemplateItemList', {
    params: {
      maintenanceTemplateId
    }
  })
}
// #endregion 获取维保模板项字典（通过GroupName分组之后的字典） end

// #region 删除维保模板项 start
export const deleteMaintenanceTemplateItem = ({
  maintenanceTemplateItemId
}) => {
  return fetch.get('/api/MaintenanceTemplate/DeleteMaintenanceTemplateItem', {
    params: {
      maintenanceTemplateItemId
    }
  })
}
// #endregion 删除维保模板项 end

// #region 删除分组 start
export const deleteMaintenanceTemplateItemByGroupName = ({
  maintenanceTemplateId,
  oldGroupName
}) => {
  return fetch.get(
    BASE_URI +
      '/api/MaintenanceTemplate/DeleteMaintenanceTemplateItemByGroupName',
    {
      params: {
        maintenanceTemplateId,
        oldGroupName
      }
    }
  )
}
// #endregion 删除分组 end

// #region 修改分组名称 start
export const UpdateMaintenanceTemplateGroupName = ({
  maintenanceTemplateId,
  oldGroupName,
  newGroupName
}) => {
  return fetch.get(
    '/api/MaintenanceTemplate/UpdateMaintenanceTemplateGroupName',
    {
      params: {
        maintenanceTemplateId,
        oldGroupName,
        newGroupName
      }
    }
  )
}
// #endregion 修改分组名称 end

// #region 更改维保项排序 start
export const maintenanceTemplateItemOrder = form => {
  return fetch.post(
    '/api/MaintenanceTemplate/MaintenanceTemplateItemOrder',
    form,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更改维保项排序 end

// #region 生成维保模板pdf start
export const updateMaintenanceTemplateUrl = ({
  maintenanceTemplateId,
  htmlText
}) => {
  return fetch.post(
    '/api/MaintenanceTemplate/UpdateMaintenanceTemplateUrl',
    htmlText,
    {
      params: {
        maintenanceTemplateId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 生成维保模板pdf end

// #region 获取维保模板公司分组下拉框 start
export const getMaintenanceTemplateDropdownList = ({
  companyIdList,
  bigTypeId
}) => {
  return fetch.post(
    '/api/MaintenanceTemplate/GetMaintenanceTemplateDropdownList',
    companyIdList,
    {
      params: {
        bigTypeId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取维保模板公司分组下拉框 end

// #region 获取维保模板信息 start
export const getMaintenanceTemplateInfo = ({ maintenanceTemplateId }) => {
  return fetch.get('/api/MaintenanceTemplate/GetMaintenanceTemplateInfo', {
    params: {
      maintenanceTemplateId
    }
  })
}
// #endregion 获取维保模板信息 end

// #region 复制模板 start
export const CopyMaintenanceTemplate = ({
  MaintenanceTemplateId,
  CompanyId,
  BigTypeId,
  BigTypeName,
  MaintenanceTemplateName,
  MaintenanceCycle
}) => {
  return fetch.post(
    '/api/MaintenanceTemplate/CopyMaintenanceTemplate',
    {
      MaintenanceTemplateId,
      CompanyId,
      BigTypeId,
      BigTypeName,
      MaintenanceTemplateName,
      MaintenanceCycle
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 复制模板 end

// #region 获取维保关联合同列表 start
export const getTemplateRelateContractListGetTemplateRelateContractList = ({
  maintenanceTemplateId
}) => {
  return fetch.get('/api/MaintenanceTemplate/GetTemplateRelateContractList', {
    params: {
      maintenanceTemplateId
    }
  })
}
// #endregion 获取维保关联合同列表 end
