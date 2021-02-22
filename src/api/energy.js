import fetch from '@/utils/service.js'

// 获取能耗类型列表
export const fetchEnergyTypeTopList = () => {
  return fetch.get(`/api/Energy/GetEnergyTypeTopList`)
}

// 获取区域位置的第二个下拉框列表
export const fetchEnergyTypeList = typeid => {
  return fetch.get(`/api/Energy/GetEnergyTypeList`, {
    params: {
      typeid
    }
  })
}

// 获取能耗业态功能树结构
export const fetchEnergy_type = (project, subid, typeid) => {
  return fetch.get(`/api/Energy/GetEnergy_type`, {
    params: {
      project,
      subid,
      typeid
    }
  })
}

// 获取能耗区域位置树结构
export const fetchEnergy_tree = (project, subid, typeid) => {
  return fetch.get(`/api/Energy/GetEnergy_tree`, {
    params: {
      project,
      subid,
      typeid
    }
  })
}

// 录入
export const addDataInput = query => {
  return fetch.post(`/api/Energy/Add_Data_Input`, query)
}

// 查询设备点位
export const queryPointsList = query => {
  return fetch.post(`/api/Energy/QueryPointsList`, query)
}

// 数据录入记录
export const queryData_InputList = query => {
  return fetch.post(`/api/Energy/QueryData_InputList`, query)
}

// 数据录入数量
export const queryData_InputCount = query => {
  return fetch.post(`/api/Energy/QueryData_InputCount`, query)
}
