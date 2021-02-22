import fetch from '@/utils/service'

// #region 批量设置分项设备总表 start
export const setSubentryModelTreeSummary = ({
  subentryModelTreeList,
  isSummary
}) => {
  return fetch.post(
    BASE_URI + '/api/Subentry/SetSubentryModelTreeSummary',
    subentryModelTreeList,
    {
      params: {
        isSummary
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量设置分项设备总表 end

// #region 获取分项树 start
export const getSubentryTree = ({
  companyId,
  projectId,
  isGetModelTree,
  subentryId = undefined
}) => {
  return fetch.get(BASE_URI + '/api/Subentry/GetSubentryTree', {
    params: {
      companyId,
      projectId,
      isGetModelTree,
      subentryId
    }
  })
}
// #endregion 获取分项树 end

// #region 变更设备和分项的关联 start
export const updateSubentryModelTree = ({
  companyId,
  projectId,
  subentryId,
  modelTreeList
}) => {
  return fetch.post(
    BASE_URI + '/api/Subentry/UpdateSubentryModelTree',
    modelTreeList,
    {
      params: {
        companyId,
        projectId,
        subentryId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 变更设备和分项的关联 end
