import fetch from '@/utils/service'

// #region 添加运单存储 start
export const addWaybillStorage = ({ waybillNumber, CompanyId }) => {
  return fetch.post('/api/WaybillStorage/AddWaybillStorage', null, {
    params: {
      waybillNumber,
      CompanyId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 添加运单存储 end

// #region 批量添加运单存储文件 存在则覆盖 start
export const batchAddWaybillStorageFile = formData => {
  return fetch.post(
    '/api/WaybillStorage/BatchAddWaybillStorageFile',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
}
// #endregion 批量添加运单存储文件 存在则覆盖 end

// #region 获取运单存储页 start
export const getWaybillStoragePage = ({
  CompanyId,
  WaybillNumber,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/WaybillStorage/GetWaybillStoragePage',
    {
      CompanyId,
      WaybillNumber,
      SortType,
      IsAsc,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取运单存储页 end
