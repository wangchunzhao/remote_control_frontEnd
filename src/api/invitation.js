import fetch from '@/utils/service'

// #region 获取邀请信息 start
export const getInvitationInfo = ({ invitationId }) => {
  return fetch.get(BASE_URI + '/api/Invitation/GetInvitationInfo', {
    params: {
      invitationId
    }
  })
}
// #endregion 获取邀请信息 end

// #region 添加邀请信息 start
export const addInvitation = ({ subareaId }) => {
  return fetch.get(BASE_URI + '/api/Invitation/AddInvitation', {
    params: {
      subareaId
    }
  })
}
// #endregion 添加邀请信息 end

// #region 登录并邀请 start
export const loginAndInvitation = ({ account, pwd, invitationId }) => {
  return fetch.post(BASE_URI + '/api/Invitation/LoginAndInvitation', null, {
    params: {
      account,
      pwd,
      invitationId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 登录并邀请 end

// #region 注册并邀请 start
export const registerAndInvitation = ({
  Mobile,
  Pwd,
  Nickname,
  Avatar,
  invitationId,
  SmsCode
}) => {
  return fetch.post(
    BASE_URI + '/api/Invitation/RegisterAndInvitation',
    { Mobile, Pwd, Nickname, Avatar, SmsCode },
    {
      params: {
        invitationId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 注册并邀请 end
