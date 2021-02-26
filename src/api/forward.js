import fetch from '@/utils/service'

// #region 查询车辆轨迹 start
export const getBaiduAttactPoints = params => {
  return fetch.get('/api/Forward/ForwardBaidu', {
    params
  })
}
// #endregion 查询车辆轨迹 end

// #region 查询车辆最新的一个点位 start
export const forwardBaiduGetlatestpoint = ({ service_id, entity_name }) => {
  return fetch.get('/api/Forward/ForwardBaiduGetlatestpoint', {
    params: {
      service_id,
      entity_name
    }
  })
}
// #endregion 查询车辆最新的一个点位 end

// #region 转发百度地图请求 start
export const forwardBaiduRequest = ({ Url, QueryString }) => {
  return fetch.post(
    '/api/Forward/ForwardBaiduRequest',
    {
      Url,
      QueryString
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 转发百度地图请求 end
