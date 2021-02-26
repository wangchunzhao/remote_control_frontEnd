import fetch from '@/utils/service'

// repair.vue 内的接口

// 根据手机号查询成员
export const queryrepairuser = mobile => {
  return fetch.get(_host + `/api/Maintenance_team/QueryRepair_user`, {
    params: {
      mobile
    }
  })
}

// 添加维修成员
export const addrepairuser = query => {
  return fetch.post(_host + `/api/Maintenance_team/AddRepair_user`, query)
}

// 注册邀请
export const registersms = (username, phone) => {
  return fetch.get(_host + `/api/SystemMsg/Register_sms`, {
    params: {
      username,
      phone
    }
  })
}

// 添加维修成员
export const invitationrepairuser = query => {
  return fetch.post(
    _host + `/api/Maintenance_team/InvitationRepair_user`,
    query
  )
}

// 上传图片
export const uploadRepairimg = query => {
  return fetch.post(_host + `/api/Upload_File/Upload_Repairimg`, query, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 根据设备集合查询设备列表
export const getDeviceByMtid = (name, mtid, project) => {
  return fetch.get(_host + `/api/DeviceInfo/getDeviceByMtid`, {
    params: {
      name,
      mtid,
      project
    }
  })
}

// 发起报修
export const addRepairorder = query => {
  return fetch.post(_host + `/api/Repair_order/AddRepair_order`, query)
}

// repairAnalysis.vue 内的接口

// 维修单统计
export const getRepairOrderStatistics = () => {
  return fetch.get(
    _host + `/api/Repair_Statistical_Analysis/GetRepair_Order_Statistics`
  )
}

// 维修费用统计
export const getRepairCostStatistics = (starttime, endtime) => {
  return fetch.get(
    _host + `/api/Repair_Statistical_Analysis/GetRepair_Cost_Statistics`,
    {
      params: {
        starttime,
        endtime
      }
    }
  )
}

// repairDetails.vue 内的接口

// 删除
export const repairDelete = ID => {
  return fetch.get(_host + `/api/Repair_order/Repair_Delete`, {
    params: {
      ID
    }
  })
}

// 报修受理
export const repairAcceptance = query => {
  return fetch.post(_host + `/api/Repair_order/Repair_Acceptance`, query)
}

// 报修派工
export const repairDispatching = query => {
  return fetch.post(_host + `/api/Repair_order/Repair_Dispatching`, query)
}

// 接单/拒单
export const repairDispatchingAcceptance = query => {
  return fetch.post(
    _host + `/api/Repair_order/Repair_Dispatching_Acceptance`,
    query
  )
}

// 维修主页添加远程维修
export const remoteRepairprocessdetails = query => {
  return fetch.post(
    _host + `/api/Repair_order/RemoteRepair_process_details`,
    query
  )
}

// 更新维修单验收状态
// export const repairCheck = (query) =>{
//     return fetch.post(`/api/Repair_order/Repair_Check`,query)
// }

// 维修单评价
// export const repairEvaluate = (query) =>{
//     return fetch.post(`/api/Repair_order/Repair_Evaluate`,query)
// }

// 查询维修报告
// export const queryRepairorderReport = (Repair_Orderno) =>{
//     return fetch.get(`/api/Repair_order/QueryRepair_orderReport`,{
//         params:{
//             Repair_Orderno
//         }
//     })
// }

// 维修进度
export const repairScheduleWebNew = repair_orderno => {
  return fetch.get(_host + `/api/Repair_order/Repair_ScheduleWebNew`, {
    params: {
      repair_orderno
    }
  })
}

// 维修操作日志列表数据
export const repairScheduleLogWebNew = repair_orderno => {
  return fetch.get(_host + `/api/Repair_order/Repair_ScheduleLogWebNew`, {
    params: {
      repair_orderno
    }
  })
}

// repairIndex.vue 内的接口

// 根据用户查询维修成员列表
export const repairuserList = () => {
  return fetch.get(_host + `/api/Maintenance_team/Repair_userList`)
}

// 添加备件
export const addRepairsparepart = query => {
  return fetch.post(_host + `/api/Repair_order/AddRepair_sparepart`, query)
}

// 添加工具
export const addRepairtool = query => {
  return fetch.post(_host + `/api/Repair_order/AddRepair_tool`, query)
}

// 修改备件
export const updateRepairspareparts = query => {
  return fetch.post(_host + `/api/Repair_order/UpdateRepair_spareparts`, query)
}

// 修改工具
export const updateRepairtool = query => {
  return fetch.post(_host + `/api/Repair_order/UpdateRepair_tool`, query)
}

// 删除备件
export const deleteRepairspareparts = ID => {
  return fetch.get(_host + `/api/Repair_order/DeleteRepair_spareparts`, {
    params: {
      ID
    }
  })
}

// 报修受理
// export const repairAcceptance = (query) =>{
//     return fetch.post(`/api/Repair_order/Repair_Acceptance`,query)
// }

// 报修派工
// export const repairDispatching = (query) =>{
//     return fetch.post(`/api/Repair_order/Repair_Dispatching`,query)
// }

// 维修主页添加远程维修
// export const remoteRepairprocessdetails = (query) =>{
//     return fetch.post(`/api/Repair_order/RemoteRepair_process_details`,query)
// }

// 更新维修单验收状态
export const repairCheck = query => {
  return fetch.post(_host + `/api/Repair_order/Repair_Check`, query)
}

// 查询设备
export const getRepairProjectDevice = (modelid, projectid) => {
  return fetch.get(_host + `/api/Repair_order/GetRepair_ProjectDevice`, {
    params: {
      modelid,
      projectid
    }
  })
}

// 获取维保大类
export const getBigInfofetch = () => {
  return fetch.get(_host + `/api/DeviceInfo/getBigInfo`)
}

// 获取维保小类
export const getSmallInfofetch = bid => {
  return fetch.get(_host + `/api/DeviceInfo/getSmallInfo`, {
    params: {
      bid
    }
  })
}

// 查询维修工
export const getRepairUser = companyid => {
  return fetch.get(_host + `/api/Repair_order/GetRepair_User`, {
    params: {
      companyid
    }
  })
}

// 查询
export const queryRepairorder = query => {
  return fetch.post(_host + `/api/Repair_order/QueryRepair_order`, query)
}

// 查询维修备件
// export const repairsparepartList = (Repair_Orderno) =>{
//     return fetch.get(`/api/Repair_order/Repair_sparepartList`,{
//         params:{
//             Repair_Orderno
//         }
//     })
// }

// 查询维修工具
// export const repairtoolList = (Repair_Orderno) =>{
//     return fetch.get(`/api/Repair_order/Repair_toolList`,{
//         params:{
//             Repair_Orderno
//         }
//     })
// }

// repairRank.vue 内的接口

// 维修效率排名
export const getRepairStatisticalTimeList = time => {
  return fetch.get(
    _host + `/api/Repair_Statistical_Analysis/GetRepair_Statistical_TimeList`,
    {
      params: {
        time
      }
    }
  )
}

// 维修评价排名
export const getRepairStatisticalEvaluateList = time => {
  return fetch.get(
    _host +
      `/api/Repair_Statistical_Analysis/GetRepair_Statistical_EvaluateList`,
    {
      params: {
        time
      }
    }
  )
}

// repairReport.vue 内的接口

// 更新维修单状态
export const repairStatus = query => {
  return fetch.post(_host + `/api/Repair_order/Repair_Status`, query)
}

// 保存
export const addRepairprocessdetails = query => {
  return fetch.post(
    _host + `/api/Repair_order/AddRepair_process_details`,
    query
  )
}

// 更新维修详情远程维修
export const updateRepairremote = query => {
  return fetch.post(_host + `/api/Repair_order/UpdateRepair_remote`, query)
}

// 更新维修详情现场情况
export const updateRepairScene = query => {
  return fetch.post(_host + `/api/Repair_order/UpdateRepair_Scene`, query)
}

// 更新维修详情过程
export const updateRepairprocess = query => {
  return fetch.post(_host + `/api/Repair_order/UpdateRepair_process`, query)
}

// 更新维修结果
export const updateRepairresult = query => {
  return fetch.post(_host + `/api/Repair_order/UpdateRepair_result`, query)
}

// 更换备件存草稿/保存
export const updateRepairsparepart = query => {
  return fetch.post(_host + `/api/Repair_order/UpdateRepair_sparepart`, query)
}

// 点击更新按钮执行记录更新
export const updateRepairreplacesparepart = query => {
  return fetch.post(
    _host + `/api/Repair_order/UpdateRepair_replace_sparepart`,
    query
  )
}

// 点击删除按钮执行删除操作
export const deleteRepairreplacesparepart = ID => {
  return fetch.get(_host + `/api/Repair_order/DeleteRepair_replace_sparepart`, {
    params: {
      ID
    }
  })
}

// 点击保存按钮新增一条备件
export const addRepairreplacesparepart = query => {
  return fetch.post(
    _host + `/api/Repair_order/AddRepair_replace_sparepart`,
    query
  )
}

// 上传图片
// export const uploadRepairimg = (query) =>{
//     return fetch.post(`/api/Upload_File/Upload_Repairimg`,query)
// }

// 查询维修报告
export const queryRepairorderReport = Repair_Orderno => {
  return fetch.get(_host + `/api/Repair_order/QueryRepair_orderReport`, {
    params: {
      Repair_Orderno
    }
  })
}

// 查询维修备件
export const repairsparepartList = Repair_Orderno => {
  return fetch.get(_host + `/api/Repair_order/Repair_sparepartList`, {
    params: {
      Repair_Orderno
    }
  })
}

// 查询维修工具
export const repairtoolList = Repair_Orderno => {
  return fetch.get(_host + `/api/Repair_order/Repair_toolList`, {
    params: {
      Repair_Orderno
    }
  })
}

// 查询维修单进度
export const repairScheduleS = Repair_Orderno => {
  return fetch.get(_host + `/api/Repair_order/Repair_ScheduleS`, {
    params: {
      Repair_Orderno
    }
  })
}

//
export const repairScheduleList = Repair_Orderno => {
  return fetch.get(_host + `/api/Repair_order/Repair_ScheduleList`, {
    params: {
      Repair_Orderno
    }
  })
}

// 查询维修详情
export const repairsceneList = Repair_Orderno => {
  return fetch.get(_host + `/api/Repair_order/Repair_sceneList`, {
    params: {
      Repair_Orderno
    }
  })
}

//
export const repairremoteList = Repair_Orderno => {
  return fetch.get(_host + `/api/Repair_order/Repair_remoteList`, {
    params: {
      Repair_Orderno
    }
  })
}
// 删除工具
export const deleteRepairtool = id => {
  return fetch.get(_host + `/api/Repair_order/DeleteRepair_tool?ID=${id}`)
}
// 维修单评价
export const repairEvaluate = query => {
  return fetch.post(_host + `/api/Repair_order/Repair_Evaluate`, query)
}

// 查询维修更换备件
export const repairreplacesparepartList = Repair_process_details_id => {
  return fetch.get(_host + `/api/Repair_order/Repair_replace_sparepartList`, {
    params: {
      Repair_process_details_id
    }
  })
}

// repairTeam.vue 内的接口

// 解除维修团队关系
export const deleteRepairuser = id => {
  return fetch.get(_host + `/api/Maintenance_team/DeleteRepair_user`, {
    params: {
      id
    }
  })
}

// 更新维修成员描述信息
export const updateRepairuser = query => {
  return fetch.post(_host + `/api/Maintenance_team/UpdateRepair_user`, query)
}

// 根据手机号查询成员
// export const queryrepairuser = (mobile) =>{
//     return fetch.get(`/api/Maintenance_team/QueryRepair_user`,{
//         params:{
//             mobile
//         }
//     })
// }

// 添加维修成员
// export const addrepairuser = (query) =>{
//     return fetch.post(`/api/Maintenance_team/AddRepair_user`,query)
// }

// 根据用户查询维修成员列表
// export const repairuserList = () =>{
//     return fetch.get(`/api/Maintenance_team/Repair_userList`)
// }

// 根据用户id查询所属维修团队
export const userRepairList = id => {
  return fetch.get(_host + `/api/Maintenance_team/User_RepairList`, {
    params: {
      id
    }
  })
}

// 注册邀请
// export const registersms = (username,phone) =>{
//     return fetch.get(`/api/SystemMsg/Register_sms`,{
//         params:{
//             username,
//             phone
//         }
//     })
// }

// 添加维修成员
// export const invitationrepairuser = (query) =>{
//     return fetch.post(`/api/Maintenance_team/InvitationRepair_user`,query)
// }

// 获取大类小类数据
export const getClassList = () => {
  return fetch.get(_host + `/api/DeviceInfo/getClassList`)
}
