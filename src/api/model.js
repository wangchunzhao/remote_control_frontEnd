import fetch from '@/utils/service'

// #region 获取大类小类 start
export const getBigSmallType = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/Model/GetBigSmallType', {
    params: {
      companyId
    }
  })
}
// #endregion 获取大类小类 end

// #region 获取设备状态统计 start
export const getModelTreeStatusTotal = ({ subareaIdList }) => {
  return fetch.post(
    BASE_URI + '/api/Model/GetModelTreeStatusTotal',
    subareaIdList,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取设备状态统计 end

// #region 获取设备分组统计 start
export const getModelTreeGroupStatistics = ({ subareaIdList, Type }) => {
  return fetch.post(
    BASE_URI + '/api/Model/GetModelTreeGroupStatistics',
    { subareaIdList, Type },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取设备分组统计 end

// #region 获取设备项目统计 start
export const getModelTreeProjectStatistics = ({
  subareaIdList,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/Model/GetModelTreeProjectStatistics',
    {
      subareaIdList,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取设备项目统计 end

// #region 导出设备项目统计 start
export const exportModelTreeProjectStatistics = ({ subareaIdList }) => {
  return fetch.post(
    BASE_URI + '/api/Model/ExportModelTreeProjectStatistics',
    {
      subareaIdList
    },
    {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'blob'
    }
  )
}
// #endregion 导出设备项目统计 end

// #region 获取设备页 start
export const getModelTreePage = ({
  SubareaIdList,
  ProjectId,
  BigTypeIdList,
  SmallTypeIdList,
  ModelTreeName,
  LocationIdList,
  ModelTreeStatus,
  IsEnabledPermission,
  IsMonitor,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + `/api/Model/GetModelTreePage`,
    {
      SubareaIdList,
      ProjectId,
      BigTypeIdList,
      SmallTypeIdList,
      ModelTreeName,
      LocationIdList,
      ModelTreeStatus,
      IsEnabledPermission,
      IsMonitor,
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
// #endregion 获取设备页 end

// #region 导出设备页 start
export const exportModelTreePage = ({
  SubareaIdList,
  ProjectId,
  BigTypeIdList,
  SmallTypeIdList,
  ModelTreeName,
  LocationIdList,
  ModelTreeStatus,
  IsEnabledPermission,
  IsMonitor
}) => {
  return fetch.post(
    BASE_URI + `/api/Model/ExportModelTreePage`,
    {
      SubareaIdList,
      ProjectId,
      BigTypeIdList,
      SmallTypeIdList,
      ModelTreeName,
      LocationIdList,
      ModelTreeStatus,
      IsEnabledPermission,
      IsMonitor
    },
    {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'blob'
    }
  )
}
// #endregion 导出设备页 end

// #region 根据项目得到子系统 start
export const getModelListByProject = ({ projectId }) => {
  return fetch.get(BASE_URI + '/api/Model/GetChild', {
    params: {
      projectId
    }
  })
}
// #endregion 根据项目得到子系统 end

// #region 获取用户拥有的设备权限 start
export const getUserModel = ({ projectId, userId }) => {
  return fetch.get(BASE_URI + '/api/Model/GetUserModel', {
    params: {
      projectId,
      userId
    }
  })
}
// #endregion 获取用户拥有的设备权限 end

// #region 获取子系统下的小类 start
export const getTab = ({ projectId, bigTypeId }) => {
  return fetch.get(BASE_URI + `/api/Model/getTab`, {
    params: {
      projectId,
      bigTypeId
    }
  })
}
// #endregion 获取子系统下的小类 end

// #region 获取表格显示读写状态 start
export const getTableListRead = ({
  ProjectId,
  BigTypeId,
  ModelTreeName,
  SmallTypeId,
  PointName,
  ConnectStatusList,
  PointStatusList,
  ReadWrite,
  IsSetAlarm,
  PointTypeList,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + `/api/Model/GetTableListRead`,
    {
      ProjectId,
      BigTypeId,
      ModelTreeName,
      SmallTypeId,
      PointName,
      ConnectStatusList,
      PointStatusList,
      ReadWrite,
      IsSetAlarm,
      PointTypeList,
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
// #endregion 获取表格显示读写状态 end

// #region 获取表格筛选条件点位类型 start
export const getTableListReadScreen = ({
  ProjectId,
  BigTypeId,
  ModelTreeName,
  SmallTypeId,
  PointName,
  ConnectStatusList,
  PointStatusList,
  ReadWrite,
  IsSetAlarm,
  PointTypeList,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + `/api/Model/GetTableListReadScreen`,
    {
      ProjectId,
      BigTypeId,
      ModelTreeName,
      SmallTypeId,
      PointName,
      ConnectStatusList,
      PointStatusList,
      ReadWrite,
      IsSetAlarm,
      PointTypeList,
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
// #endregion 获取表格筛选条件点位类型 end

// #region 获取测点级数据 start
export const queryPoint = ({
  mtid,
  mtidList = undefined,
  BigTypeId = undefined,
  ProjectId = undefined,
  LevelList,
  PointStatusList,
  PointTypeIdList,
  area,
  name,
  stime,
  etime,
  typeCn,
  alarmLevel,
  IsGetPointRelevance = false,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + `/api/Model/QueryPoint`,
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
      IsGetPointRelevance,
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
// #endregion 获取测点级数据 end

// #region 获取参数点位卡片数据 start
export const queryDeviceInfo = ({
  ProjectId,
  BigTypeId,
  SmallTypeId,
  ModelTreeName,
  ModelTreeStatusList,
  PageIndex,
  IsGetAsteriskModelTree,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + `/api/Model/QueryDeviceInfo`,
    {
      ProjectId,
      BigTypeId,
      SmallTypeId,
      ModelTreeName,
      IsGetAsteriskModelTree,
      ModelTreeStatusList,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取参数点位卡片数据 end

// #region 重新设置用户设备权限 start
export const resetUserModel = ({
  UserModelList,
  ProjectId,
  UserId,
  StorageSpaceExtendList
}) => {
  return fetch.post(
    BASE_URI + `/api/Model/ResetUserModel`,
    {
      UserModelList,
      ProjectId,
      UserId,
      StorageSpaceExtendList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 重新设置用户设备权限 end

// #region 获取设备和点位类型下拉框 start
export const getModelTreeAndPointTypeDropdown = ({ bigTypeId, projectId }) => {
  return fetch.post(
    BASE_URI + `/api/Model/GetModelTreeAndPointTypeDropdown`,
    null,
    {
      params: {
        bigTypeId,
        projectId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取设备和点位类型下拉框 end

// #region 获取参数点位表格数据 start
export const getTableList = ({
  ProjectId,
  BigTypeId,
  ModelTreeName,
  SmallTypeId,
  PageIndex,
  PageSize,
  PointName,
  ConnectStatusList,
  SortType,
  IsAsc,
  UId = undefined
}) => {
  return fetch.post(
    BASE_URI + `/api/model/getTableList`,
    {
      ProjectId,
      BigTypeId,
      ModelTreeName,
      SmallTypeId,
      PageIndex,
      PageSize,
      PointName,
      ConnectStatusList,
      SortType,
      IsAsc,
      UId
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取参数点位表格数据 end

// #region 获取点位id列表下的点位类型下拉框 start
export const queryPointTypeInDmpListDropdownList = ({
  mtid,
  LevelList,
  pointTypeIdList,
  PointStatusList
}) => {
  return fetch.post(
    BASE_URI + `/api/Model/QueryPointTypeInDmpListDropdownList`,
    {
      mtid,
      LevelList,
      pointTypeIdList,
      PointStatusList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取点位id列表下的点位类型下拉框 end

// #region  start
export const getMtIdList = ({ projectId, bigTypeId, smallTypeId }) => {
  return fetch.get(BASE_URI + `/api/Model/GetMtIdList`, {
    params: {
      projectId,
      bigTypeId,
      smallTypeId
    }
  })
}

// #endregion  end

// #region 设备信息 start
export const deviceInfo = modelTreeId => {
  return fetch.get(BASE_URI + '/api/Model/DeviceInfo', {
    params: {
      modelTreeId
    }
  })
}
// #endregion 设备信息 end

// 获取供配电卡片显示
export const getCard = (project, sid, model, inp, page, num) => {
  return fetch.post(
    BASE_URI + `/api/Model/getCard`,
    {
      ProjectId: project,
      BigTypeId: sid,
      SmallTypeId: model,
      ModelTreeName: inp,
      PageIndex: page,
      PageSize: num
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// 获取区域历史数据
export const getAreaList = (projectId, bigTypeId, startTime, endTime) => {
  return fetch.get(BASE_URI + `/api/model/GetArealist`, {
    params: {
      projectId,
      bigTypeId,
      startTime,
      endTime
    }
  })
}

// 客流统计获取历史数据
export const getDmpList = (projectId, bigTypeId, startTime, endTime, type) => {
  return fetch.get(BASE_URI + `/api/model/GetDmpList`, {
    params: {
      projectId,
      bigTypeId,
      startTime,
      endTime,
      type
    }
  })
}

// 获取总客流
export const getPersonList = (
  projectId,
  bigTypeId,
  startTime,
  endTime,
  type
) => {
  return fetch.get(BASE_URI + `/api/model/GetPersonList`, {
    params: {
      projectId,
      bigTypeId,
      startTime,
      endTime,
      type
    }
  })
}
