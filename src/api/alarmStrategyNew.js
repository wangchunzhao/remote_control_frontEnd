import fetch from '@/utils/service'

// #region 获取项目下某一类型未配置点位信息 start
export const queryProjectPoint = ({ projectID, typeID, systemTypeId }) => {
  return fetch.get('/api/AlarmStrategy/Query_Project_point', {
    params: {
      projectID,
      typeID,
      systemTypeId
    }
  })
}
// #endregion 获取项目下某一类型未配置点位信息 end

// #region 获取当前项目下面的所有成员 start
export const queryProjectConcats = ({ project, strategyID }) => {
  return fetch.get('/api/AlarmStrategy/Query_Project_concats', {
    params: {
      project,
      strategyID
    }
  })
}
// #endregion 获取当前项目下面的所有成员 end

// #region 报警策略列表 start
export const getAlarmStrategyList = ({
  projectId,
  typeID,
  strategyName,
  companyId,
  pageIndex,
  pageSize
}) => {
  return fetch.post(
    '/api/AlarmStrategy/GetAlarm_Strategy_List',
    {
      projectId,
      typeID,
      strategyName,
      companyId,
      pageIndex,
      pageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 报警策略列表 end

// #region 报警策略列表筛选条件 start
export const getAlarmStrategyScreen = ({
  projectIdList,
  companyId,
  typeIDList,
  RunList,
  PointId,
  strategyName
}) => {
  return fetch.post(
    '/api/AlarmStrategy/GetAlarm_Strategy_screen',
    {
      projectIdList,
      companyId,
      typeIDList,
      RunList,
      PointId,
      strategyName
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 报警策略列表筛选条件 end

// #region 报警策略列表类型选择器 start
export const getAlarmStrategyListType = ({ projectId }) => {
  return fetch.get('/api/AlarmStrategy/GetAlarm_Strategy_List_Type', {
    params: {
      projectId
    }
  })
}
// #endregion 报警策略列表类型选择器 end

// #region 新增报警策略 start
export const alarmStrategyAdd = form => {
  return fetch.post('/api/AlarmStrategy/Alarm_strategyAdd', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 新增报警策略 end

// #region 获取点位类型关联报警类型 start
export const getAlarmTypes = ({ SystemId }) => {
  return fetch.get('/api/AlarmStrategy/GetAlarmClass', {
    params: {
      SystemId
    }
  })
}
// #endregion 获取点位类型关联报警类型 end

// #region 报警策略删除 start
export const alarmStrategyDel = ({ ID, storageSpaceExtendList }) => {
  return fetch.post(
    '/api/AlarmStrategy/Alarm_strategyDelete',
    storageSpaceExtendList,
    {
      params: {
        ID
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 报警策略删除 end

// #region 报警策略列表 start
export const getAlarmStrategyListView = ({
  projectId,
  projectIdList = undefined,
  companyId,
  PointId = undefined,
  userID,
  typeID,
  typeIDList,
  strategyName,
  RunList = undefined,
  pageIndex,
  pageSize,
  OrderByField,
  IsDesc
}) => {
  return fetch.post(
    '/api/AlarmStrategy/GetAlarm_Strategy_ListView',
    {
      projectId,
      projectIdList,
      companyId,
      PointId,
      userID,
      typeID,
      typeIDList,
      strategyName,
      RunList,
      pageIndex,
      pageSize,
      OrderByField,
      IsDesc
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 报警策略列表 end

// #region 报警策略开启关闭 start
export const alarmStrategyRun = ({ ID }) => {
  return fetch.get('/api/AlarmStrategy/Alarm_strategyRun', {
    params: {
      ID
    }
  })
}
// #endregion 报警策略开启关闭 end

// #region 获取策略配置点位列表 start
export const getAlarmStrategyPoint = ({
  ID,
  pointName,
  PageSize,
  PageIndex
}) => {
  return fetch.get('/api/AlarmStrategy/GetAlarm_strategyPoint', {
    params: {
      ID,
      pointName,
      PageSize,
      PageIndex
    }
  })
}
// #endregion 获取策略配置点位列表 end

// #region 查询策略详情 start
export const queryAlarmStrategy = ({ ID }) => {
  return fetch.get('/api/AlarmStrategy/QueryAlarm_strategy', {
    params: {
      ID
    }
  })
}
// #endregion 查询策略详情 end

// #region 修改报警策略 start
export const alarmStrategyUpdate = form => {
  return fetch.post('/api/AlarmStrategy/Alarm_strategyUpdate', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改报警策略 end

// #region 获取策略下点位正在报警信息 start
export const getAlarmStrategyNum = ({ id }) => {
  return fetch.get('/api/AlarmStrategy/GetAlarm_StrategyNum', {
    params: {
      id
    }
  })
}
// #endregion 获取策略下点位正在报警信息 end
