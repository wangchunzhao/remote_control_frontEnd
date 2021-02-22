import fetch from '@/utils/service'

// ============pointEntry
// 点检计划删除
export const deletespotcheckplan = planID => {
  return fetch.get(`/api/Spotcheck/DeleteSpotcheck_plan`, {
    params: {
      planID
    }
  })
}

// 点检计划详情
export const getspotcheckplan = planID => {
  return fetch.get(`/api/Spotcheck/GetSpotcheckPlan`, {
    params: {
      planID
    }
  })
}
// 点检计划状态变更
export const statusspotcheckplan = planID => {
  return fetch.get(`/api/Spotcheck/StatusSpotcheck_plan`, {
    params: {
      planID
    }
  })
}

// 保存点检计划
export const updatespotcheckplan = query => {
  return fetch.post(`/api/Spotcheck/UpdateSpotcheckPlan`, query)
}

// 新增点检计划（导入）
export const inserspotcheckplan = query => {
  return fetch.post(`/api/Spotcheck/InserSpotcheckPlan`, query)
}

// 点检计划列表
export const queryspotcheckplan = query => {
  return fetch.post(`/api/Spotcheck/QuerySpotcheckPlan`, query)
}
// 点检计划列表总数
export const queryspotcheckplanrow = query => {
  return fetch.post(`/api/Spotcheck/QuerySpotcheckPlanRow`, query)
}
