import fetch from '@/utils/service'

// #region 批量添加采集器 start
export const batchAddCollector = ({
  ProjectId,
  CollectorType,
  CollectorNumberList
}) => {
  return fetch.post(
    BASE_URI + '/api/Collector/BatchAddCollector',
    {
      ProjectId,
      CollectorType,
      CollectorNumberList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量添加采集器 end

// #region 验证采集器是否存在 true:已存在 start
export const collectorIsExists = ({ collectorNumber }) => {
  return fetch.get(BASE_URI + '/api/Collector/CollectorIsExists', {
    params: {
      collectorNumber
    }
  })
}
// #endregion 验证采集器是否存在 true:已存在 end

// #region 获取可绑定采集器车辆 start
export const getCollectorIsBinding = ({ projectID }) => {
  return fetch.get(BASE_URI + '/api/Collector/GetCollectorIsBinding', {
    params: {
      projectID
    }
  })
}
// #endregion 获取可绑定采集器车辆 end

// #region 采集器绑定 start
export const collectorBinding = ({
  CollectorID,
  mtid,
  NumberPlates,
  ProjectId
}) => {
  return fetch.post(
    BASE_URI + '/api/Collector/CollectorBinding',
    {
      CollectorID,
      mtid,
      ProjectId,
      NumberPlates
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 采集器绑定 end

// #region 获取可绑定采集器车辆 start
export const collectorList = ({
  CollectorNumber,
  projectId,
  collectorType,
  isgps,
  userID,
  companyId,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    BASE_URI + '/api/Collector/GetCollectorList',
    {
      CollectorNumber,
      projectId,
      collectorType,
      isgps,
      userID,
      companyId,
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
// #endregion 获取可绑定采集器车辆 end

// #region 批量删除采集器 start
export const batchDeleteCollector = ({ collectorIDList }) => {
  return fetch.post(
    BASE_URI + '/api/Collector/BatchDeleteCollector',
    collectorIDList,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量删除采集器 end

// #region 获取可绑定采集器车辆 start
export const getSimMonthInfo = ({ sim }) => {
  return fetch.get(BASE_URI + '/api/Collector/GetSimMonthInfo', {
    params: {
      sim
    }
  })
}
// #endregion 获取可绑定采集器车辆 end

// #region 获取可绑定采集器车辆 start
export const collectorUntying = ({ CollectorID }) => {
  return fetch.post(
    BASE_URI + '/api/Collector/CollectorUntying',
    {
      CollectorID
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取可绑定采集器车辆 end

// #region 采集器绑定SIM卡号 start
export const collectorSIMBinding = ({ CollectorSIM, CollectorID }) => {
  return fetch.post(
    BASE_URI + '/api/Collector/CollectorSIMBinding',
    {
      CollectorSIM,
      CollectorID
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 采集器绑定SIM卡号 end
