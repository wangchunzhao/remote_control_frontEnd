import fetch from '@/utils/service'

// #region 添加模型 start
export const addModel = ({ name, mtid }) => {
  return fetch.post('/api/LocationTree/AddModel', null, {
    params: {
      name,
      mtid
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 添加模型 end

// #region 删除模型 start
export const deleteModel = mtid => {
  return fetch.post('/api/LocationTree/DeleteModel', null, {
    params: {
      mtid
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 删除模型 end

// #region 修改模型 start
export const updateModel = ({ name, mtid }) => {
  return fetch.post('/api/LocationTree/UpdateModel', null, {
    params: {
      name,
      mtid
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改模型 end
