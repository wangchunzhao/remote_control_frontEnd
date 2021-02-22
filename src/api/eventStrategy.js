import fetch from '@/utils/service'

// #region 获取事件类型列表 start
export const getEventTypeList = ({ parentId, projectId, isupdate }) => {
  return fetch.get(BASE_URI + '/api/EventStrategy/GetEvent_typeList', {
    params: {
      parentId,
      projectId,
      isupdate
    }
  })
}
// #endregion 获取事件类型列表 end

// #region 新增事件通知策略 start
export const addEventStrategy = ({
  name,
  project,
  remark,
  resourcesType,
  eventType,
  recovery,
  notice,
  repeatCheck,
  repeatTime,
  Operator,
  ConcatsList,
  StorageSpaceExtendList
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/AddEvent_strategy',
    {
      name,
      project,
      remark,
      resourcesType,
      eventType,
      recovery,
      notice,
      repeatCheck,
      repeatTime,
      Operator,
      ConcatsList,
      StorageSpaceExtendList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 新增事件通知策略 end

// #region 新增事件通知策略 start
export const updateEventStrategy = ({
  ID,
  name,
  project,
  ProjectId,
  remark,
  resourcesType,
  eventType,
  recovery,
  notice,
  repeatCheck,
  repeatTime,
  Operator,
  ConcatsList,
  StorageSpaceExtendList
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/UpdateEvent_strategy',
    {
      ID,
      name,
      project,
      ProjectId,
      remark,
      resourcesType,
      eventType,
      recovery,
      notice,
      repeatCheck,
      repeatTime,
      Operator,
      ConcatsList,
      StorageSpaceExtendList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 新增事件通知策略 end

// #region 获取当前项目下面的所有成员 start
export const queryProjectConcats = ({ project, strategyID }) => {
  return fetch.get(BASE_URI + '/api/EventStrategy/Query_Project_concats', {
    params: {
      project,
      strategyID
    }
  })
}
// #endregion 获取当前项目下面的所有成员 end

// #region 删除事件策略 start
export const deleteEventStrategy = ({ strategyId }) => {
  return fetch.get(BASE_URI + '/api/EventStrategy/DeleteEvent_strategy', {
    params: {
      strategyId
    }
  })
}
// #endregion 删除事件策略 end

// #region 开启关闭事件策略 start
export const eventStrategyRun = ({ ID }) => {
  return fetch.get(BASE_URI + '/api/EventStrategy/Event_strategyRun', {
    params: {
      ID
    }
  })
}
// #endregion 开启关闭事件策略 end

// #region 根据策略ID获取详情 start
export const queryEventStrategy = ({ ID }) => {
  return fetch.get(BASE_URI + '/api/EventStrategy/QueryEvent_strategy', {
    params: {
      ID
    }
  })
}
// #endregion 根据策略ID获取详情 end

// #region 事件策略列表 start
export const getEventStrategyList = ({
  companyId,
  projectId,
  EventTypeId,
  Run,
  eventName,
  PageIndex,
  PageSize,
  OrderByField,
  IsDesc
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetEvent_strategyList',
    {
      companyId,
      projectId,
      EventTypeId,
      Run,
      eventName,
      PageIndex,
      PageSize,
      OrderByField,
      IsDesc
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 事件策略列表 end

// #region 事件策略列表筛选条件 start
export const getEventStrategyScreen = ({
  companyId,
  projectId,
  EventTypeId,
  Run,
  eventName,
  PageIndex,
  PageSize,
  OrderByField,
  IsDesc
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetEvent_strategyScreen',
    {
      companyId,
      projectId,
      EventTypeId,
      Run,
      eventName,
      PageIndex,
      PageSize,
      OrderByField,
      IsDesc
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 事件策略列表筛选条件 end

// #region 获取事件类型列表 start
export const getEventTypeAll = () => {
  return fetch.get(BASE_URI + '/api/EventStrategy/GetEvent_typeAll')
}
// #endregion 获取事件类型列表 end

// #region 触发事件列表 start
export const getEventList = ({
  companyId,
  projectId,
  nameTypeId,
  eventTypeId,
  Status,
  triggerStartTime,
  triggerEndTime,
  sourceTypeId,
  sourceName,
  PageIndex,
  PageSize,
  OrderByField,
  IsDesc
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetEventList',
    {
      companyId,
      projectId,
      nameTypeId,
      eventTypeId,
      Status,
      triggerStartTime,
      triggerEndTime,
      sourceTypeId,
      sourceName,
      PageIndex,
      PageSize,
      OrderByField,
      IsDesc
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 触发事件列表 end

// #region 触发事件列表筛选条件 start
export const getEventListScreen = ({
  companyId,
  projectId,
  nameTypeId,
  Status,
  eventTypeId,
  triggerStartTime,
  triggerEndTime,
  sourceName,
  PageIndex,
  PageSize,
  OrderByField,
  IsDesc
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetEventListScreen',
    {
      companyId,
      projectId,
      nameTypeId,
      Status,
      eventTypeId,
      triggerStartTime,
      triggerEndTime,
      sourceName,
      PageIndex,
      PageSize,
      OrderByField,
      IsDesc
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 触发事件列表筛选条件 end

// #region 导出事件数据 start
export const exportEvent = ({
  companyId,
  projectId,
  nameTypeId,
  Status,
  eventTypeId,
  triggerStartTime,
  triggerEndTime,
  sourceName
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/ExportEvent',
    {
      companyId,
      projectId,
      nameTypeId,
      Status,
      eventTypeId,
      triggerStartTime,
      triggerEndTime,
      sourceName
    },
    {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出事件数据 end

// #region 获取项目离线间隔 start
export const getProjectoffLineInterval = ({ projectId }) => {
  return fetch.get(BASE_URI + '/api/EventStrategy/GetProjectoffLineInterval', {
    params: {
      projectId
    }
  })
}
// #endregion 获取项目离线间隔 end

// #region 更新项目离线间隔 start
export const updateoffLineInterval = ({ projectId, offLineInterval }) => {
  return fetch.get(BASE_URI + '/api/EventStrategy/UpdateoffLineInterval', {
    params: {
      projectId,
      offLineInterval
    }
  })
}
// #endregion 更新项目离线间隔 end

// #region 获取短信推送记录页 start
export const getSmsPushLogPage = ({
  EventId,
  UserIdList,
  SendStatus,
  PushTypeList,
  ReceiptStatus,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetSmsPushLogPage',
    {
      EventId,
      UserIdList,
      SendStatus,
      PushTypeList,
      ReceiptStatus,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取短信推送记录页 end

// #region 获取短信推送记录用户下拉框 start
export const getSmsPushLogUserDropdownList = ({
  EventId,
  UserIdList = undefined,
  SendStatus = undefined,
  PushTypeList = undefined,
  ReceiptStatus = undefined,
  PageIndex = undefined,
  PageSize = undefined
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetSmsPushLogUserDropdownList',
    {
      EventId,
      UserIdList,
      SendStatus,
      PushTypeList,
      ReceiptStatus,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取短信推送记录用户下拉框 end

// #region 获取语音推送记录页 start
export const getCallPushLogPage = ({
  EventId,
  UserIdList,
  SendStatus,
  PushTypeList,
  ReceiptStatus,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetCallPushLogPage',
    {
      EventId,
      UserIdList,
      SendStatus,
      PushTypeList,
      ReceiptStatus,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取语音推送记录页 end

// #region 获取语音推送记录用户下拉框 start
export const getCallPushLogUserDropdownList = ({
  EventId,
  UserIdList = undefined,
  PushTypeList = undefined,
  SendStatus = undefined,
  ReceiptStatus = undefined,
  PageIndex = undefined,
  PageSize = undefined
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetCallPushLogUserDropdownList',
    {
      EventId,
      UserIdList,
      PushTypeList,
      SendStatus,
      ReceiptStatus,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取语音推送记录用户下拉框 end

// #region 获取App推送记录页 start
export const getAppPushLogPage = ({
  EventId,
  UserIdList,
  SendStatus,
  PushTypeList,
  IsRead,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/getAppPushLogPage',
    {
      EventId,
      UserIdList,
      SendStatus,
      PushTypeList,
      IsRead,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取App推送记录页 end

// #region 获取App推送记录用户下拉框 start
export const getAppPushLogUserDropdownList = ({
  EventId,
  UserIdList,
  SendStatus,
  PushTypeList,
  IsRead,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/EventStrategy/GetAppPushLogUserDropdownList',
    {
      EventId,
      UserIdList,
      SendStatus,
      PushTypeList,
      IsRead,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取App推送记录用户下拉框 end
