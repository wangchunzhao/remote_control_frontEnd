import fetch from '@/utils/service'

// #region 用户信息验证 start
export const exists = form => {
  return fetch.post(_host + `/api/user/Exists`, form)
}
// #endregion 用户信息验证 end

// #region 用户注册 start
export const addUser = form => {
  return fetch.post(_host + '/api/user/AddUser', form)
}
// #endregion 用户注册 end

// #region 手机接收验证码 start
export const mobileCode = mobile => {
  return fetch.get(_host + '/api/user/MobileCode', {
    params: {
      mobile
    }
  })
}
// #endregion 手机接收验证码 end

// #region 忘记密码页面中的修改密码 start
export const changePwd = form => {
  return fetch.post(_host + '/api/user/ForgetPwd', form)
}
// #endregion 忘记密码页面中的修改密码 end

// #region 邀请时自动注册帐号 start
export const invitationUser = mobile => {
  return fetch.get(_host + '/api/user/InvitationUser', {
    params: {
      mobile
    }
  })
}
// #endregion 邀请时自动注册帐号 end
