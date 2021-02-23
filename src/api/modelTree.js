import fetch from '@/utils/service'

// #region 设置星标设备 start
export const setModelTreeAsterisk = data => {
  return fetch.post(
    global.HC_BASE_URI + '/api/ModelTree/SetModelTreeAsterisk',
    data,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 设置星标设备 end

// #region 取消星标设备 start
export const cancelModelTreeAsterisk = data => {
  return fetch.post(
    global.HC_BASE_URI + '/api/ModelTree/CancelModelTreeAsterisk',
    data,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 取消星标设备 end
