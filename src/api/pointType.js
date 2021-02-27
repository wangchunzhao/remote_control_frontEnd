import fetch from '@/utils/service'
import qs from 'qs'

// #region 新增点位类型 start
export const addPointType = form => {
  return fetch.post('/api/PointTypeLabel/PointTypeInsert', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 新增点位类型 end

// #region 点位类型列表 start
export const fetchPointTypeList = (projectId, TypeName = '') => {
  return fetch.get('/api/PointTypeLabel/PointTypeList', {
    params: {
      projectId,
      TypeName
    }
  })
}
// #endregion 点位类型列表 end

// #region 删除点位类型 start
export const delPointType = ({ projectId, ID }) => {
  return fetch.get('/api/PointTypeLabel/PointTypeDelete', {
    params: {
      projectId,
      ID
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 删除点位类型 end

// #region 查询点位类型详情 start
export const queryPointType = (ID, projectId) => {
  return fetch.get('/api/PointTypeLabel/PointTypeQuery', {
    params: {
      ID,
      projectId
    }
  })
}
// #endregion 查询点位类型详情 end

// #region 修改点位类型 start
export const updatePointType = form => {
  return fetch.post('/api/PointTypeLabel/PointTypeUpdate', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改点位类型 end
