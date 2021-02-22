import fetch from '@/utils/service.js'

// #region 添加星标项目 start
export const addProjectAsterisk = ({ projectId }) => {
  return fetch.post(
    BASE_URI + '/api/Project/AddProjectAsterisk',
    {
      projectId
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加星标项目 end

// #region 删除星标项目 start
export const deleteProjectAsterisk = ({ projectId }) => {
  return fetch.get(BASE_URI + '/api/Project/DeleteProjectAsterisk', {
    params: {
      projectId
    }
  })
}
// #endregion 删除星标项目 end
