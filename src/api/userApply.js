import fetch from '@/utils/service'
import qs from 'qs'

// #region 添加或更新用户权限组 start
export const addOrUpdateUserFuncGroup = form => {
  return fetch.post(
    BASE_URI + `/api/UserApply/AddOrUpdateUserFuncGroup`,
    form,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加或更新用户权限组 end

// #region 删除用户权限组 start
export const deleteUserFuncGroup = form => {
  return fetch.post(BASE_URI + `/api/UserApply/DeleteUserFuncGroup`, form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 删除用户权限组 end

// #region 获取用户网关权限 start
export const getUserGatewayPermission = data => {
  return fetch.get(BASE_URI + '/api/UserApply/GetUserGatewayPermission', {
    params: data,
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取用户网关权限 end

// #region 获取权限组列表 start
export const getFuncGroupList = data => {
  return fetch.get(BASE_URI + '/api/UserApply/GetFuncGroupList', {
    params: data
  })
}
// #endregion 获取权限组列表 end
