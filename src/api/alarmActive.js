import fetch from '@/utils/service'

// #region 获取报警消息页 start
export const getAlarmMessageByUserId = ({ pageIndex, pageSize, companyId }) => {
  return fetch.get(BASE_URI + '/api/AlarmActive/GetAlarmMessageByUserId', {
    params: {
      pageIndex,
      pageSize,
      companyId
    }
  })
}
// #endregion 获取报警消息页 end

// #region 获取报警概览信息 start
export const getAlarmOverNum = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/AlarmActive/GetAlarmOverNum', {
    params: {
      companyId
    }
  })
}
// #endregion 获取报警概览信息 end

// #region 正在报警 确认报警 start
export const getAlarmAct = ({
  page,
  num,
  cstime,
  cetime,
  bstime,
  betime,
  area,
  child,
  acontent,
  level,
  IsRepair,
  AlarmClass,
  confirmUser,
  commentUser,
  type,
  companyId,
  status,
  OrderByField,
  IsDesc,
  ContinuedStartTime,
  ContinuedEndTime,
  MtName,
  Mtid
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetAlarmAct',
    {
      UID: undefined,
      OrderByField,
      IsDesc,
      PageIndex: page,
      PageSize: num,
      Cstime: cstime,
      Cetime: cetime,
      Bstime: bstime,
      Betime: betime,
      Area: area,
      Child: child,
      Acontent: acontent,
      Level: level,
      IsRepair,
      AlarmClass,
      confirmUser,
      commentUser,
      Type: type,
      ContinuedStartTime,
      ContinuedEndTime,
      MtName,
      Mtid
    },
    {
      params: {
        status,
        companyId: companyId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// #endregion 正在报警 确认报警 end

// #region 正在报警筛选条件 start
export const getAlarmActScreen = ({
  cstime,
  cetime,
  bstime,
  betime,
  area,
  child,
  acontent,
  level,
  AlarmClass,
  confirmUser,
  commentUser,
  type,
  companyId,
  status,
  ContinuedStartTime,
  ContinuedEndTime,
  MtName
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetAlarmActScreen',
    {
      UID: undefined,
      Cstime: cstime,
      Cetime: cetime,
      Bstime: bstime,
      Betime: betime,
      Area: area,
      Child: child,
      Acontent: acontent,
      Level: level,
      AlarmClass,
      confirmUser,
      commentUser,
      Type: type,
      ContinuedStartTime,
      ContinuedEndTime,
      MtName
    },
    {
      params: {
        status,
        companyId: companyId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 正在报警筛选条件 end

// #region 历史报警列表 start
export const getAlarmClear = ({
  page,
  num,
  cstime,
  cetime,
  bstime,
  betime,
  area,
  child,
  AlarmClass,
  confirmUser,
  commentUser,
  acontent,
  level,
  type,
  companyId,
  MtName,
  Mtid,
  ContinuedStartTime,
  ContinuedEndTime,
  ResponseTimeStartTime = undefined,
  ResponseTimeEndTime = undefined,
  OrderByField,
  IsDesc
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetAlarmClear',
    {
      PageIndex: page,
      PageSize: num,
      Cstime: cstime,
      Cetime: cetime,
      Bstime: bstime,
      Betime: betime,
      Area: area,
      Child: child,
      AlarmClass,
      confirmUser,
      commentUser,
      Acontent: acontent,
      Level: level,
      Type: type,
      MtName,
      Mtid,
      ContinuedStartTime,
      ContinuedEndTime,
      ResponseTimeStartTime,
      ResponseTimeEndTime,
      OrderByField,
      IsDesc
    },
    {
      params: {
        CompanyId: companyId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 历史报警列表 end

// #region 历史报警筛选数据 start
export const getAlarmClearScreen = ({
  cstime,
  cetime,
  bstime,
  betime,
  area,
  child,
  AlarmClass,
  confirmUser,
  commentUser,
  acontent,
  level,
  type,
  companyId,
  MtName,
  ContinuedStartTime,
  ContinuedEndTime,
  ResponseTimeStartTime,
  ResponseTimeEndTime
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetAlarmClearScreen',
    {
      UID: undefined,
      PageIndex: undefined,
      PageSize: undefined,
      Cstime: cstime,
      Cetime: cetime,
      Bstime: bstime,
      Betime: betime,
      Area: area,
      Child: child,
      AlarmClass,
      confirmUser,
      commentUser,
      Acontent: acontent,
      Level: level,
      Type: type,
      MtName,
      ContinuedStartTime,
      ContinuedEndTime,
      ResponseTimeStartTime,
      ResponseTimeEndTime
    },
    {
      params: {
        CompanyId: companyId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 历史报警筛选数据 end

// #region 根据id获取详细信息 start
export const queryDetail = id => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/queryDetail',
    { id },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 根据id获取详细信息 end

// #region 修改报警处理信息 start
export const upDetail = ({ AlarmIdList, COMMENT }) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/upDetail',
    { AlarmIdList, COMMENT },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 修改报警处理信息 end

// #region 获取报警进度 start
export const getAlarmSchedule = data => {
  return fetch.post(`${BASE_URI}/api/AlarmActive/GetAlarmSchedule`, data, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取报警进度 end

// #region 确认报警 start
export const updateStatus = ({ id }) => {
  return fetch.post(`${BASE_URI}/api/AlarmActive/updateStatus`, null, {
    params: {
      id
    }
  })
}
// #endregion 确认报警 end

// #region 通过报警id获取报警信息 start
export const getAlarmDetail = ({ alarmId }) => {
  return fetch.get(`${BASE_URI}/api/AlarmActive/GetAlarmDetail`, {
    params: {
      alarmId
    }
  })
}
// #endregion 通过报警id获取报警信息 end

// #region 获取短信推送记录页 start
export const getSmsPushLogPage = ({
  PointId,
  AlarmEpoch,
  UserIdList,
  SendStatus,
  PushTypeList,
  ReceiptStatus,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetSmsPushLogPage',
    {
      PointId,
      AlarmEpoch,
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
  PointId,
  AlarmEpoch,
  UserIdList = undefined,
  SendStatus = undefined,
  PushTypeList = undefined,
  ReceiptStatus = undefined,
  PageIndex = undefined,
  PageSize = undefined
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetSmsPushLogUserDropdownList',
    {
      PointId,
      AlarmEpoch,
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
  PointId,
  AlarmEpoch,
  UserIdList,
  SendStatus,
  PushTypeList,
  ReceiptStatus,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetCallPushLogPage',
    {
      PointId,
      AlarmEpoch,
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
  PointId,
  AlarmEpoch,
  UserIdList = undefined,
  PushTypeList = undefined,
  SendStatus = undefined,
  ReceiptStatus = undefined,
  PageIndex = undefined,
  PageSize = undefined
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetCallPushLogUserDropdownList',
    {
      PointId,
      AlarmEpoch,
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

// #region 导出报警数据 start
export const exportAlarm = ({
  CompanyId,
  Cstime,
  Cetime,
  Bstime,
  Betime,
  Area,
  Acontent,
  Child,
  Level,
  Mtid,
  AlarmClass,
  confirmUser,
  commentUser,
  OrderByField,
  Type,
  status,
  ContinuedStartTime,
  ContinuedEndTime,
  ResponseTimeStartTime,
  ResponseTimeEndTime,
  MtName
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/ExportAlarm',
    {
      CompanyId,
      Cstime,
      Cetime,
      Bstime,
      Betime,
      Area,
      Acontent,
      Child,
      Level,
      Mtid,
      AlarmClass,
      confirmUser,
      commentUser,
      OrderByField,
      Type,
      status,
      ContinuedStartTime,
      ContinuedEndTime,
      ResponseTimeStartTime,
      ResponseTimeEndTime,
      MtName
    },
    {
      params: {
        status,
        companyId: CompanyId
      },
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出报警数据 end

// #region 获取App推送记录页 start
export const getAppPushLogPage = ({
  PointId,
  AlarmEpoch,
  UserIdList,
  SendStatus,
  PushTypeList,
  IsRead,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/getAppPushLogPage',
    {
      PointId,
      AlarmEpoch,
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
  PointId,
  AlarmEpoch,
  UserIdList,
  SendStatus,
  PushTypeList,
  IsRead,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/AlarmActive/GetAppPushLogUserDropdownList',
    {
      PointId,
      AlarmEpoch,
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

// #region 报警app推送数量统计 start
export const getAlarmAppPushNum = ({ projectId, startTime, endTime }) => {
  return fetch.get(`${BASE_URI}/api/AlarmActive/GetAlarmAppPushNum`, {
    params: {
      projectId,
      startTime,
      endTime
    }
  })
}
// #endregion 报警app推送数量统计 end

// #region 报警推送状态统计 start
export const getAlarmPushStatus = ({ projectId, startTime, endTime }) => {
  return fetch.get(`${BASE_URI}/api/AlarmActive/GetAlarmPushStatus`, {
    params: {
      projectId,
      startTime,
      endTime
    }
  })
}
// #endregion 报警推送状态统计 end

// #region 导出推送列表详情 start
export const exportAlarmPushStatistical = ({
  projectId,
  startTime,
  endTime
}) => {
  return fetch.get(`${BASE_URI}/api/AlarmActive/ExportAlarmPushStatistical`, {
    params: {
      projectId,
      startTime,
      endTime
    },
    responseType: 'blob'
  })
}
// #endregion 导出推送列表详情 end
