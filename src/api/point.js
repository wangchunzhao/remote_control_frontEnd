import fetch from '@/utils/service'

// #region 获取点位页 start
export const getPointPage = ({
  ProjectId,
  PointName,
  DeviceIdList,
  NameList,
  PointTypeIdList,
  LevelList,
  ModelTreeIdList,
  LocationIdList,
  IsSetAlarm,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Point/GetPointPage',
    {
      ProjectId,
      PointName,
      DeviceIdList,
      NameList,
      PointTypeIdList,
      LevelList,
      ModelTreeIdList,
      LocationIdList,
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
// #endregion 获取点位页 end

// #region 获取大类-&gt;小类-&gt;设备 start
export const getSubsystemAndModelTreeDropdownList = ({ projectId }) => {
  return fetch.get('/api/Point/GetSubsystemAndModelTreeDropdownList', {
    params: {
      projectId
    }
  })
}
// #endregion 获取大类-&gt;小类-&gt;设备 end

// #region 点位关联点位 start
export const addPointRelevance = ({
  PointIdA,
  ModelTreeIdA,
  PointRelevanceList
}) => {
  return fetch.post(
    '/api/Point/AddPointRelevance',
    {
      PointIdA,
      ModelTreeIdA,
      PointRelevanceList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 点位关联点位 end

// #region 获取点位关联的点位 start
export const getPointRelevance = ({ modelTreeId, pointId }) => {
  return fetch.post('/api/Point/GetPointRelevance', null, {
    params: {
      modelTreeId,
      pointId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取点位关联的点位 end

// #region 批量添加设备 start
export const batchAddModelTree = ({
  ProjectId,
  BigTypeId,
  SmallTypeId,
  LocationId,
  ModelTreeInfoList,
  OperateType
}) => {
  return fetch.post(
    '/api/Point/BatchAddModelTree',
    {
      ProjectId,
      BigTypeId,
      SmallTypeId,
      LocationId,
      ModelTreeInfoList,
      OperateType
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量添加设备 end

// #region 取消点位关联所有设备或区域 start
export const pointCancelRelevanceModelTreeOrLocation = ({
  pointIdList,
  cancelType
}) => {
  return fetch.post(
    '/api/Point/PointCancelRelevanceModelTreeOrLocation',
    pointIdList,
    {
      params: {
        cancelType
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 取消点位关联所有设备或区域 end

// #region 取消点位关联设备或区域 start
export const pointCancelRelevance = ({ pointIdList, modelTreeId }) => {
  return fetch.post('/api/Point/PointCancelRelevance', pointIdList, {
    params: {
      modelTreeId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 取消点位关联设备或区域 end

// #region 批量修改设备属性 start
export const batchUpdateModelTree = ({
  BigTypeId,
  SmallTypeId,
  LocationId,
  ModelTreeIdList,
  MName
}) => {
  return fetch.post(
    '/api/Point/BatchUpdateModelTree',
    {
      BigTypeId,
      SmallTypeId,
      LocationId,
      ModelTreeIdList,
      MName
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量修改设备属性 end

// #region 点位关联设备和位置 start
export const pointRelevanceModelTreeAndLocation = ({
  PointIdList,
  ModelTreeOrLocationIdList
}) => {
  return fetch.post(
    '/api/Point/PointRelevanceModelTreeAndLocation',
    {
      PointIdList,
      ModelTreeOrLocationIdList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 点位关联设备和位置 end

// #region 导入设备 start
export const importModelTree = ({ industry, formData }) => {
  return fetch.post('/api/Point/ImportModelTree', formData, {
    params: {
      industry
    },
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// #endregion 导入设备 end

// #region 批量更新点位 start
export const batchUpdatePoint = ({
  UpdatePointType,
  PointIdList,
  PointName = undefined,
  FindPointName,
  PointTypeId = undefined,
  Unit = undefined,
  Level = undefined,
  ProjectId,
  StorageSpaceExtendList
}) => {
  return fetch.post(
    '/api/Point/batchUpdatePoint',
    {
      UpdatePointType,
      PointIdList,
      PointName,
      FindPointName,
      PointTypeId,
      Unit,
      Level,
      ProjectId,
      StorageSpaceExtendList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量更新点位 end

// #region 获取点位页下拉框数据 start
export const getPointPageDropdownList = ({ projectId }) => {
  return fetch.get('/api/Point/GetPointPageDropdownList', {
    params: {
      projectId
    }
  })
}
// #endregion 获取点位页下拉框数据 end

// #region 根据点位ID获取关联设备与系统 start
export const getPointModelTreeSysInfo = ({ pointId }) => {
  return fetch.get('/api/Point/GetPointModelTreeSysInfo', {
    params: {
      pointId
    }
  })
}
// #endregion 根据点位ID获取关联设备与系统 end
