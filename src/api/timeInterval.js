import fetch from '@/utils/service.js'
import qs from 'qs'

// #region 设置时段 start
export const setTimeInterval = data => {
  return fetch.post(
    global.HC_BASE_URI + '/api/TimeInterval/SetTimeInterval',
    data,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 设置时段 end

// #region 获取时段 start
export const getTimeInterval = data => {
  return fetch.get(global.HC_BASE_URI + '/api/TimeInterval/GetTimeInterval', {
    params: data
  })
}
// #endregion 获取时段 end
