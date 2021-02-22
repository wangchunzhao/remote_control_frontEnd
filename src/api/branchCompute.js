import fetch from '@/utils/service'

// #region 删除支路 start
export const deleteBranch = ({ modelTreeId }) => {
  return fetch.get(BASE_URI + '/api/BranchCompute/DeleteBranch', {
    params: {
      modelTreeId
    }
  })
}
// #endregion 删除支路 end

// #region 获取支路页 start
export const getBranchPage = ({
  CompanyId,
  ProjectId,
  ModelTreeName,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/BranchCompute/GetBranchPage',
    {
      CompanyId,
      ProjectId,
      ModelTreeName,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取支路页 end

// #region 添加或更新支路 start
export const addOrUpdateBranch = ({
  ModelTreeId,
  CompanyId,
  ProjectId,
  ModelTreeName,
  SubentryId,
  IsSummary,
  IsCustomBranch,
  BranchComputeList
}) => {
  return fetch.post(
    BASE_URI + '/api/BranchCompute/AddOrUpdateBranch',
    {
      ModelTreeId,
      CompanyId,
      ProjectId,
      ModelTreeName,
      SubentryId,
      IsSummary,
      IsCustomBranch,
      BranchComputeList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加或更新支路 end

// #region 生成自定义支路能耗数据 start
export const generateBranchData = ({
  StartTime,
  EndTime,
  ModelTreeIdList,
  TimeTypeList
}) => {
  return fetch.post(
    BASE_URI + '/api/BranchCompute/GenerateBranchData',
    {
      StartTime,
      EndTime,
      ModelTreeIdList,
      TimeTypeList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 生成自定义支路能耗数据 end
