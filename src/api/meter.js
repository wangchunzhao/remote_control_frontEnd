import fetch from '@/utils/service'

// #region 电表拉合闸 start
export const meterSwitch = ({ meterIdList, isSwitch }) => {
  return fetch.post('/api/Meter/MeterSwitch', meterIdList, {
    params: {
      isSwitch
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 电表拉合闸 end

// #region 获取电表页 start
export const getMeterPage = ({
  ProjectId,
  ShopName,
  MeterUsageStatusList,
  ConnectStatusList,
  SwitchList,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Meter/GetMeterPage',
    {
      ProjectId,
      ShopName,
      MeterUsageStatusList,
      ConnectStatusList,
      SwitchList,
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
// #endregion 获取电表页 end

// #region 获取电表用电记录 start
export const getMeterPayPage = ({ MeterId, Month, PageIndex, PageSize }) => {
  return fetch.post(
    '/api/Meter/GetMeterPayPage',
    {
      MeterId,
      Month,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取电表用电记录 end

// #region 获取电表月份用电记录 start
export const getMeterPayDetailPage = ({
  MeterId,
  Month,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Meter/GetMeterPayDetailPage',
    {
      MeterId,
      Month,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取电表月份用电记录 end

// #region 获取订单分页 start
export const getMeterOrderPage = ({
  ProjectId,
  ShopId,
  OperatorIdList,
  MeterOrderType,
  MeterIdList,
  ExternalOrderNo,
  OrderNo,
  ShopName,
  CreateTimeQuantum,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Meter/GetMeterOrderPage',
    {
      ProjectId,
      ShopId,
      OperatorIdList,
      MeterOrderType,
      MeterIdList,
      ExternalOrderNo,
      OrderNo,
      ShopName,
      CreateTimeQuantum,
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
// #endregion 获取订单分页 end

// #region 导出充值记录 start
export const exportMeterOrder = ({
  ProjectId,
  ShopId,
  OperatorIdList,
  MeterOrderType,
  MeterIdList,
  ExternalOrderNo,
  OrderNo,
  ShopName,
  CreateTimeQuantum,
  SortType,
  IsAsc
}) => {
  return fetch.post(
    '/api/Meter/ExportMeterOrder',
    {
      ProjectId,
      ShopId,
      OperatorIdList,
      MeterOrderType,
      MeterIdList,
      ExternalOrderNo,
      OrderNo,
      ShopName,
      CreateTimeQuantum,
      SortType,
      IsAsc
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出充值记录 end

// #region 获取项目下商户列表 start
export const getShopDropdownList = ({ projectId }) => {
  return fetch.get('/api/Meter/GetShopDropdownList', {
    params: {
      projectId
    }
  })
}
// #endregion 获取项目下商户列表 end

// #region 获取订单分页参数 start
export const getMeterOrderPageParameter = ({ projectId }) => {
  return fetch.get('/api/Meter/GetMeterOrderPageParameter', {
    params: {
      projectId
    }
  })
}
// #endregion 获取订单分页参数 end

// #region 获取电表分区统计数量 start
export const getMeterStatisticsTotal = ({
  ProjectIdList,
  Month,
  IsStatisticsShop
}) => {
  return fetch.post(
    '/api/Meter/GetMeterStatisticsTotal',
    {
      ProjectIdList,
      Month,
      IsStatisticsShop
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取电表分区统计数量 end

// #region 获取电表分区统计信息 start
export const getMeterSubareaStatisticsPage = ({
  ProjectIdList,
  Month,
  IsStatisticsShop,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Meter/GetMeterSubareaStatisticsPage',
    {
      ProjectIdList,
      Month,
      IsStatisticsShop,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取电表分区统计信息 end

// #region 导出电表分区统计信息 start
export const exportMeterSubareaStatistics = ({
  ProjectIdList,
  Month,
  IsStatisticsShop
}) => {
  return fetch.post(
    '/api/Meter/ExportMeterSubareaStatistics',
    {
      ProjectIdList,
      Month,
      IsStatisticsShop
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出电表分区统计信息 end

// #region 导出商户进销存报表 start
export const exportMeterShopStatistics = ({
  ProjectIdList,
  Month,
  IsStatisticsShop
}) => {
  return fetch.post(
    '/api/Meter/ExportMeterShopStatistics',
    {
      ProjectIdList,
      Month,
      IsStatisticsShop
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 导出商户进销存报表 end

// #region 获取公司电表结算截止日期 start
export const getCompanyDeadline = ({ companyId }) => {
  return fetch.get('/api/Meter/GetCompanyDeadline', {
    params: {
      companyId
    }
  })
}
// #endregion 获取公司电表结算截止日期 end

// #region 批量添加集中器 start
export const batchAddConcentrator = ({ ProjectId, ConcentratorNoList }) => {
  return fetch.post(
    '/api/Meter/BatchAddConcentrator',
    {
      ProjectId,
      ConcentratorNoList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量添加集中器 end

// #region 批量删除采集器 start
export const batchDeleteConcentrator = ({ deviceIdList }) => {
  return fetch.post('/api/Meter/BatchDeleteConcentrator', deviceIdList, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 批量删除采集器 end

// #region 获取采集器列表 start
export const getConcentratorPage = ({
  CompanyId,
  ProjectId,
  ConcentratorNo,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Meter/GetConcentratorPage',
    {
      CompanyId,
      ProjectId,
      ConcentratorNo,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取采集器列表 end
