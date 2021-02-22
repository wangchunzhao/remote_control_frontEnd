import fetch from '@/utils/service.js'

// #region 获取企业统计开关列表 未返回的类型默认未开启 start
export const getCompanyTotalList = ({ companyId }) => {
  return fetch.get(BASE_URI + '/api/CompanyTotal/GetCompanyTotalList', {
    params: {
      companyId
    }
  })
}
// #endregion 获取企业统计开关列表 未返回的类型默认未开启 end

// #region 设置公司统计开关 start
export const setCompanyTotal = ({ CompanyId, TotalType, IsEnabled }) => {
  return fetch.post(BASE_URI + '/api/CompanyTotal/SetCompanyTotal', null, {
    params: {
      CompanyId,
      TotalType,
      IsEnabled
    }
  })
}
// #endregion 设置公司统计开关 end
