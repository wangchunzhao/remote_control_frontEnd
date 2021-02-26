import fetch from '@/utils/service.js'

// #region 获取能耗统计 start
export const getEnergyTotal = ({ CompanyId, SubareaIdList }) => {
  return fetch.post(
    HC_BASE_URI + `/api/Energy/GetEnergyTotal`,
    {
      SubareaIdList,
      CompanyId
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取能耗统计 end
