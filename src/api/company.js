import fetch from '@/utils/service.js'

// #region 根据公司名称查询公司 start
export const getCompanyList = ({ companyName }) => {
  return fetch.get('/api/Company/GetCompanyName', {
    params: {
      companyName
    }
  })
}
// #endregion 根据公司名称查询公司 end
