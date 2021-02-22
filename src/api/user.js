import fetch from '@/utils/service'

// #region 登录 start
export const login = ({ account, pwd }) => {
  return fetch.get(BASE_URI + '/api/User/login', {
    params: {
      account,
      pwd
    }
  })
}
// #endregion 登录 end

// #region 企业申请 start
export const addCompanyApply = ({
  Code,
  companyName,
  industry,
  fullname,
  mobile
}) => {
  return fetch.post(
    BASE_URI + '/api/User/AddCompany_Apply',
    {
      Code,
      companyName,
      industry,
      fullname,
      mobile
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 企业申请 end

// #region 根据用户公司获大屏信息 start
export const getUserBigScreen = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/User/GetUserBigScreen', {
    params: {
      companyId
    }
  })
}
// #endregion 根据用户公司获大屏信息 end

// #region 根据用户id得到用户信息 start
export const getUserInfo = () => {
  return fetch.get(BASE_URI + '/api/User/GetUserInfo')
}
// #endregion 根据用户id得到用户信息 end

// #region 手机接收验证码【修改】 start
export const mobileCodeUP = ({ mobile, region, title }) => {
  return fetch.get(BASE_URI + '/api/User/MobileCodeUP', {
    params: {
      mobile,
      title,
      region
    }
  })
}
// #endregion 手机接收验证码【修改】 end

// #region 手机接收验证码注册】 start
export const mobileCode = ({ mobile, region, title }) => {
  return fetch.get(BASE_URI + '/api/User/MobileCode', {
    params: {
      mobile,
      title,
      region
    }
  })
}
// #endregion 手机接收验证码注册】 end

// #region 忘记密码验证手机号码后修改密码 start
export const changePwd = ({ Mobile, Code, Pwd }) => {
  return fetch.post(
    BASE_URI + '/api/User/ForgetPwd',
    {
      Mobile,
      Code,
      Pwd
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 忘记密码验证手机号码后修改密码 end

// #region 更新用户信息 start
export const updateUserInfo = ({ Nickname, CompanyName, Depart }) => {
  return fetch.post(
    BASE_URI + '/api/User/UpdateUserInfo',
    {
      Nickname,
      CompanyName,
      Depart
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新用户信息 end

// #region 判断是否重复 start
export const exists = form => {
  return fetch.post(BASE_URI + '/api/User/Exists', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 判断是否重复 end

// #region 修改用户头像 start
export const updateAvatar = url => {
  return fetch.post(BASE_URI + '/api/User/UpdateAvatar', null, {
    params: {
      url
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改用户头像 end

// #region 修改密码 start
export const updatePwd = ({ pwd, newPwd }) => {
  return fetch.post(BASE_URI + '/api/User/UpdatePwd', null, {
    params: {
      pwd,
      newPwd
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改密码 end

// #region 解除微信绑定 start
export const updateWChart = ({ pwd }) => {
  return fetch.post(BASE_URI + '/api/User/UpdateWChart', null, {
    params: {
      pwd
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 解除微信绑定 end

// #region 解除微信绑定 starts
export const updateEmail = ({ pwd, email }) => {
  return fetch.post(BASE_URI + '/api/User/UpdateEmail', null, {
    params: {
      pwd,
      email
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 解除微信绑定 end

// #region 解除微信绑定 starts
export const updateMobile = ({ pwd, mobile, code }) => {
  return fetch.post(BASE_URI + '/api/User/UpdateMobile', null, {
    params: {
      pwd,
      mobile,
      code
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 解除微信绑定 end

// #region 通过手机号或用户名称获取用户下拉框带头像 start
export const getUserDropdownByMobileOrName = ({ mobileOrName }) => {
  return fetch.get(BASE_URI + '/api/User/GetUserDropdownByMobileOrName', {
    params: {
      mobileOrName
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 通过手机号或用户名称获取用户下拉框带头像 end

// #region 查询可添加的联系人 start
export const queryContact = mobileOrName => {
  return fetch.get(BASE_URI + '/api/User/QueryUser', {
    params: {
      mobileOrName
    }
  })
}
// #endregion 查询可添加的联系人 end

// #region 查询可添加的联系人 start
export const refreshToken = ({ refreshToken }) => {
  return fetch.get(BASE_URI + '/api/User/RefreshToken', {
    params: {
      refreshToken
    }
  })
}
// #endregion 查询可添加的联系人 end

// #region 获取登录或者注册验证码 start
export const loginOrRegisterSMSCode = ({ mobile, region }) => {
  return fetch.get(BASE_URI + '/api/User/LoginOrRegisterSMSCode', {
    params: {
      mobile,
      region
    }
  })
}
// #endregion 获取登录或者注册验证码 end

// #region 登录或者注册 starts
export const loginOrRegister = ({ Mobile, Avatar, SMSCode }) => {
  return fetch.post(
    BASE_URI + '/api/User/LoginOrRegister',
    {
      Mobile,
      Avatar,
      SMSCode,
      UserSource: 2
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 登录或者注册 end

// #region 更新用户偏好设置 starts
export const UpdateUserPreferences = ({ Preferences }) => {
  return fetch.post(
    BASE_URI + '/api/User/UpdateUserPreferences',
    {
      Preferences
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新用户偏好设置 end

// #region 获取用户偏好设置 starts
export const getUserPreferences = () => {
  return fetch.get(BASE_URI + '/api/User/GetUserPreferences')
}
// #endregion 获取用户偏好设置 end
