import fetch from '@/utils/service'

// #region 获取车辆列表 start
export const getCarList = form => {
  return fetch.post(`/api/car/getCarList`, form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取车辆列表 end

// #region 获取车辆信息 start
export const getCarInfo = ({ carId }) => {
  return fetch.get('/api/Car/GetCarInfo', {
    params: {
      carId
    }
  })
}
// #endregion 获取车辆信息 end

// #region 冷藏车的数据信息 start
export const carDataInfo = ({ carId }) => {
  return fetch.get('/api/Car/CarDataInfo', {
    params: {
      carId
    }
  })
}
// #endregion 冷藏车的数据信息 end

// #region 更新车辆信息 start
export const updateCarInfo = ({
  CarId,
  Company,
  Contact,
  Mobile,
  Brand,
  Refriger,
  Type,
  AType
}) => {
  return fetch.post(
    '/api/Car/UpdateCarInfo',
    {
      CarId,
      Company,
      Contact,
      Mobile,
      Brand,
      Refriger,
      Type,
      AType
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新车辆信息 end
