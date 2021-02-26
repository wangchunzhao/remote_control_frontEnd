import fetch from '@/utils/service'

// #region 获取今日鸡舍统计信息 start
export const getTodayHenhouse = ({ projectId, mtid, queryPoint }) => {
  return fetch.get('/api/Breed/GetTodayHenhouse', {
    params: {
      projectId,
      mtid,
      queryPoint
    }
  })
}
// #endregion 获取今日鸡舍统计信息 end

// #region 获取鸡舍今日详细信息 start
export const getHenhouseInfo = ({ projectId, mtid, queryPoint }) => {
  return fetch.get('/api/Breed/GetHenhouseInfo', {
    params: {
      projectId,
      mtid,
      queryPoint
    }
  })
}
// #endregion 获取鸡舍今日详细信息 end

// #region 获取7日鸡舍统计信息 start
export const getWeekHenhouse = ({ projectId, mtid, queryPoint }) => {
  return fetch.get('/api/Breed/GetWeekHenhouse', {
    params: {
      projectId,
      mtid,
      queryPoint
    }
  })
}
// #endregion 获取7日鸡舍统计信息 end

// #region 获取鸡舍设置参数 start
export const getHenhouseSetting = ({ mtid }) => {
  return fetch.get('/api/Breed/GetHenhouseSetting', {
    params: {
      mtid
    }
  })
}
// #endregion 获取鸡舍设置参数 end

// #region 获取鸡舍鸡只当前日龄信息 start
export const getHenhouseAgeOfDayData = ({ projectId, mtid }) => {
  return fetch.get('/api/Breed/GetHenhouseAgeOfDayData', {
    params: {
      projectId,
      mtid
    }
  })
}
// #endregion 获取鸡舍鸡只当前日龄信息 end

// #region 获取鸡舍点位历史数据 start
export const getHenhousePointData = ({
  projectId,
  mtid,
  start,
  end,
  pointType
}) => {
  return fetch.get('/api/Breed/GetHenhousePointData', {
    params: {
      projectId,
      mtid,
      start,
      end,
      pointType
    }
  })
}
// #endregion 获取鸡舍点位历史数据 end

// #region 获取鸡舍点位字符串数据 start
export const getHenhouseStrPointData = ({
  projectId,
  mtid,
  start,
  end,
  pointType
}) => {
  return fetch.get('/api/Breed/GetHenhouseStrPointData', {
    params: {
      projectId,
      mtid,
      start,
      end,
      pointType
    }
  })
}
// #endregion 获取鸡舍点位字符串数据 end

// #region 获取鸡舍通风点位数据 start
export const getHenhouseVentilatePointData = ({ projectId, mtid }) => {
  return fetch.get('/api/Breed/GetHenhouseVentilatePointData', {
    params: {
      projectId,
      mtid
    }
  })
}
// #endregion 获取鸡舍通风点位数据 end
