import fetch from '@/utils/service'

// #region 获取模型全部信息 start
export const modelTrees = ({ projectId, isGetModelTree = true }) => {
  return fetch.get(BASE_URI + '/api/Model/Model_trees', {
    params: {
      projectId,
      isGetModelTree
    }
  })
}
// #endregion 获取模型全部信息 end

// #region 得到子系统仪表盘信息 start
export const getChildPlan = ({ project }) => {
  return fetch.get(BASE_URI + '/api/Model/getchildPlan', {
    params: {
      project
    }
  })
}
// #endregion 得到子系统仪表盘信息 end

// #region 根据项目得到子系统 start
export const getChild = ({ projectId }) => {
  return fetch.get(BASE_URI + '/api/Model/GetChild', {
    params: {
      projectId
    }
  })
}
// #endregion 根据项目得到子系统 end

// #region 获取视频监控页 start
export const getVideoMonitorPage = ({
  BigTypeId,
  ProjectId,
  PointName,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/Model/GetVideoMonitorPage',
    {
      BigTypeId,
      ProjectId,
      PointName,
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
// #endregion 获取视频监控页 end

// #region 获取设备页 start
export const getModelTreePage = ({
  ProjectId,
  SubareaIdList,
  BigTypeId,
  BigTypeIdList,
  SmallTypeId,
  SmallTypeIdList,
  LocationIdList,
  ModelTreeName,
  ModelTreeStatus,
  IsEnabledPermission = true,
  IsGetStaticProperty,
  SortType,
  IsMonitor = null,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/Model/GetModelTreePage',
    {
      ProjectId,
      SubareaIdList,
      BigTypeId,
      BigTypeIdList,
      SmallTypeId,
      SmallTypeIdList,
      LocationIdList,
      ModelTreeName,
      ModelTreeStatus,
      IsEnabledPermission,
      IsGetStaticProperty,
      SortType,
      IsMonitor,
      IsAsc,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取设备页 end

// #region 获取设备下显示的点位 start
export const getModelTreeShowPoint = data => {
  return fetch.get(BASE_URI + '/api/ModelTree/GetModelTreeShowPoint', {
    params: data
  })
}
// #endregion 获取设备下显示的点位 end

// #region 获取小类动态属性 start
export const getModelPropertyList = data => {
  return fetch.get(BASE_URI + '/api/Model/GetModelPropertyList', {
    params: data
  })
}
// #endregion 获取小类动态属性 end

// #region 编辑设备显示点位 start
export const editModelTreeShowPoint = ({ modelTreeId, pointIdList }) => {
  return fetch.post(
    BASE_URI +
      `/api/ModelTree/EditModelTreeShowPoint?modelTreeId=${modelTreeId}`,
    pointIdList,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 编辑设备显示点位 end

// #region 测点级数据读写状态 start
export const queryPointRead = ({
  mtid,
  mtidList = undefined,
  BigTypeId = undefined,
  ProjectId,
  LevelList = undefined,
  PointStatusList = undefined,
  PointTypeIdList = undefined,
  area,
  name,
  stime,
  etime,
  typeCn,
  alarmLevel,
  ReadWrite,
  IsSetAlarm,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/Model/QueryPointRead',
    {
      mtid,
      mtidList,
      BigTypeId,
      ProjectId,
      LevelList,
      PointStatusList,
      PointTypeIdList,
      area,
      name,
      stime,
      etime,
      typeCn,
      alarmLevel,
      ReadWrite,
      IsSetAlarm,
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
// #endregion 测点级数据读写状态 end
