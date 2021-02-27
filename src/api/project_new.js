import fetch from '@/utils/service'
// #region 获取项目资源 start
export const getProjectResources = ({ projectId, type }) => {
  return fetch.get('/api/Project/GetProjectResources', {
    params: {
      projectId,
      type
    }
  })
}
// #endregion 获取项目资源 end

// #region 获取设备树 start
export const getDeviceTree = ({ projectId }) => {
  return fetch.get('/api/Project/GetDeviceTree', {
    params: {
      projectId
    }
  })
}
// #endregion 获取设备树 end

// #region 获取用户项目拥有的设备id或者项目下的所有设备id start
export const getDevice = ({ projectId, userId }) => {
  return fetch.get('/api/Project/GetDevice', {
    params: {
      projectId,
      userId
    }
  })
}
// #endregion 获取用户项目拥有的设备id或者项目下的所有设备id end

// #region 更新用户在项目下的设备 start
export const updateDeviceOrPoint = ({ ProjectId, MtidList, userId }) => {
  return fetch.post(
    '/api/Project/UpdateDeviceOrPoint',
    {
      ProjectId,
      MtidList
    },
    {
      params: {
        userId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新用户在项目下的设备 end

// #region 查询项目信息 start
export const queryProjectInfo = ({ projectId }) => {
  return fetch.get('/api/Project/QueryProject', {
    params: {
      projectId
    }
  })
}
// #endregion 查询项目信息 end

// #region 更新项目 start
export const updateProject = form => {
  return fetch.post('/api/Project/UpdateProject', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 更新项目 end
