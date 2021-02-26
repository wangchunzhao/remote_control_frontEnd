import fetch from '@/utils/service'

// #region 获取项目设备监测信息详情 start
export const getModelInfo = ({ projectId, modelId }) => {
  return fetch.get('/api/ModelInfo/GetModelinfo', {
    params: { projectId, modelId }
  })
}
// #endregion 获取项目设备监测信息详情 end

// #region 更新设备监测信息 start
export const updateModelInfo = ({
  ReferencePictures = undefined,
  Drawing = undefined,
  Address = undefined,
  modelInfoId = undefined,
  projectId = undefined,
  modelId = undefined,
  times = undefined,
  type = undefined,
  user = undefined,
  ownership = undefined,
  protectionLevel = undefined,
  managementOrganization = undefined,
  briefIntroduction = undefined,
  culturalEnvironment = undefined,
  statusOfCulturalRelics = undefined,
  historicalEvolution = undefined,
  valueAssessment = undefined,
  workSituation = undefined,
  fourWorkSituation = undefined,
  securityGuard = undefined
}) => {
  return fetch.post(
    '/api/ModelInfo/UpdateModelInfo',
    {
      ReferencePictures,
      Drawing,
      Address,
      modelInfoId,
      projectId,
      modelId,
      times,
      type,
      user,
      ownership,
      protectionLevel,
      managementOrganization,
      briefIntroduction,
      culturalEnvironment,
      statusOfCulturalRelics,
      historicalEvolution,
      valueAssessment,
      workSituation,
      fourWorkSituation,
      securityGuard
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新设备监测信息 end
