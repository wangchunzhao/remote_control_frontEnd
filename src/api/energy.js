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

// #region 获取多项目能耗数据 start
export const getMoreProjectEnergy = ({
  CompanyId,
  SubareaIdList,
  DateType,
  TimeQuantum,
  ClassifyList,
  TimeIntervalId
}) => {
  return fetch.post(
    HC_BASE_URI + `/api/Energy/GetMoreProjectEnergy`,
    {
      CompanyId,
      SubareaIdList,
      DateType,
      TimeQuantum,
      ClassifyList,
      TimeIntervalId
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取多项目能耗数据 end

// #region 获取多项目能耗表格,返回table 包含列（项目名称，合计，分类（T1,T2等...）） start
export const getMoreProjectEnergyTable = ({
  CompanyId,
  SubareaIdList,
  DateType,
  TimeQuantum,
  ClassifyList,
  TimeIntervalId,
  isExport
}) => {
  return fetch.post(
    HC_BASE_URI + `/api/Energy/GetMoreProjectEnergyTable`,
    {
      CompanyId,
      SubareaIdList,
      DateType,
      TimeQuantum,
      ClassifyList,
      TimeIntervalId
    },
    {
      params: {
        isExport
      },
      responseType: isExport ? 'blob' : undefined,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取多项目能耗表格,返回table 包含列（项目名称，合计，分类（T1,T2等...）） end
