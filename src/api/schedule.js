import fetch from '@/utils/service'

// #region 添加日程 start
export const addSchedule = ({
  ProjectId,
  Content,
  Type,
  WorkDate,
  Remind,
  CreateUser,
  Member,
  Resources,
  Files
}) => {
  return fetch.post(
    BASE_URI + '/api/Schedule/AddSchedule',
    {
      ProjectId,
      Type,
      Content,
      WorkDate,
      Remind,
      CreateUser,
      Status: 0, // 新增修改不传默认为0
      Member,
      Resources,
      Files
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加日程 end

// #region 获取日程列表 start
export const getScheduleList = ({
  ProjectId,
  Content,
  Type,
  Status,
  Resources,
  PageIndex,
  PageSize,
  Orderby
}) => {
  return fetch.post(
    BASE_URI + '/api/Schedule/GetScheduleList',
    {
      ProjectId,
      Type,
      Content,
      Status,
      Resources,
      PageIndex,
      PageSize,
      Orderby
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取日程列表 end

// #region 修改日程 start
export const updateSchedule = ({
  ID,
  ProjectId,
  Content,
  Type,
  WorkDate,
  Remind,
  CreateUser,
  Member,
  Resources,
  Files
}) => {
  return fetch.post(
    BASE_URI + '/api/Schedule/UpdateSchedule',
    {
      ID,
      ProjectId,
      Type,
      Content,
      WorkDate,
      Remind,
      CreateUser,
      Status: 0, // 新增修改不传默认为0
      Member,
      Resources,
      Files
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 修改日程 end

// #region 获取日程详情 start
export const getScheduleQuery = ({ ID }) => {
  return fetch.get(BASE_URI + '/api/Schedule/GetScheduleQuery', {
    params: {
      ID
    }
  })
}
// #endregion 获取日程详情 end

// #region 根据用户公司 获取日程列表(消息中心) start
export const getScheduleMsg = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/Schedule/GetScheduleMsg', {
    params: {
      companyId
    }
  })
}
// #endregion 根据用户公司 获取日程列表(消息中心) end
