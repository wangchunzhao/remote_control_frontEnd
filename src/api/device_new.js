import fetch from '@/utils/service'
import qs from 'qs'

// #region 网关列表 start
export const showDeviceList = ({
  DeviceModuleId,
  ConnectStatusList,
  CompanyId,
  IsQueryCreator,
  ProjectIdList,
  SimStatus,
  NameOrDESCRIBES,
  PROTOCOLList,
  CreateTime,
  IsQueryLook = false,
  SortType,
  IsAsc,
  QueryAll,
  SystemStatusList,
  SimFlowStatusList,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Device/ShowDevice_List',
    {
      DeviceModuleId,
      ConnectStatusList,
      CompanyId,
      IsQueryCreator,
      ProjectIdList,
      SimStatus,
      NameOrDESCRIBES,
      PROTOCOLList,
      CreateTime,
      IsQueryLook,
      SortType,
      IsAsc,
      QueryAll,
      SystemStatusList,
      SimFlowStatusList,
      PageIndex,
      PageSize
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 网关列表 end

// #region 网关点位列表 start
export const getDevicePointPage = ({
  DeviceId,
  isLine,
  IsWrite,
  PointName,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Device/GetDevicePointPage',
    {
      DeviceId, // integer($int32) 网关id
      isLine, // integer($int32) 是否在线 1在线 0离线
      IsWrite, // integer($int32) 1读写 0只读
      PointName, // string 点位名称
      SortType, // string 网关点位列表排序类型 默认更新时间
      IsAsc, // boolean 是否升序 默认false降序
      PageIndex, // integer($int32)
      PageSize // integer($int32)
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 网关点位列表 end

// #region 获取点位的实时数据 start
export const getPointRealTimeData = ids => {
  return fetch.post('/api/Device/GetPointRealTimeData', ids, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取点位的实时数据 end

// #region 运单列表查询 start
export const getWaybillPage = ({
  companyId,
  waybillNumOrTagId,
  pageIndex,
  pageSize
}) => {
  return fetch.get('/api/Device/GetWaybillPage', {
    params: {
      companyId,
      waybillNumOrTagId,
      pageIndex,
      pageSize
    }
  })
}
// #endregion 运单列表查询 end

// #region 运单点位历史数据导出excel start
export const exportWaybillTag = ({ start, end, pointId, ts }) => {
  return fetch.get('/api/Device/ExportWaybillTag', {
    params: {
      start,
      end,
      pointId,
      ts
    }
  })
}
// #endregion 运单点位历史数据导出excel end

// #region 查询点位历史数据 start
export const getHistoryData = ({ start, end, pointIdList, tmes }) => {
  return fetch.get('/api/Device/GetPointData', {
    params: {
      start,
      end,
      pointIdList,
      tmes
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 查询点位历史数据 end

// #region 获取点位的统计信息、最大值、最小值、平均值 start
export const getPointStatisticData = ({ start, end, pointIdList }) => {
  return fetch.get('/api/Device/getPointStatisticData', {
    params: {
      start,
      end,
      pointIdList
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 获取点位的统计信息、最大值、最小值、平均值 end

// #region 批量上传标签 start
export const batchAddSensorTag = ({
  projectId,
  CompanyId,
  tagList,
  tagType
}) => {
  return fetch.post('/api/Device/BatchAddSensorTag', tagList, {
    params: {
      projectId,
      CompanyId,
      tagType
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 批量上传标签 end

// #region 设备绑定序列号和点位 start
export const carModelTreeBindPoint = ({ modelTreeId, sn, carNo }) => {
  return fetch.get('/api/Device/CarModelTreeBindPoint', {
    params: {
      modelTreeId,
      sn,
      carNo
    }
  })
}
// #endregion 设备绑定序列号和点位 end

// #region 设备解绑序列号和点位 start
export const carModelTreeUnBindPoint = ({ modelTreeId }) => {
  return fetch.get('/api/Device/CarModelTreeUnBindPoint', {
    params: {
      modelTreeId
    }
  })
}
// #endregion 设备解绑序列号和点位 end

// #region 获取传感器标签列表 start
export const sensorTagList = ({
  projectId,
  CompanyId,
  SensorTagType,
  Tag,
  PageIndex,
  PageSize,
  SortType,
  IsAsc
}) => {
  return fetch.post(
    '/api/Device/SensorTagList',
    {
      projectId,
      SensorTagType,
      CompanyId,
      Tag,
      PageIndex,
      PageSize,
      SortType,
      IsAsc
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取传感器标签列表 end

// #region 更新传感器设置 start
export const updateSensor = ({
  SensorIdList,
  cycle,
  tOffset,
  hOffset,
  tAlarm
}) => {
  return fetch.post(
    '/api/Device/UpdateSensor',
    { SensorIdList, cycle, tOffset, hOffset, tAlarm },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 更新传感器设置 end

// #region 获取传感器历史数据 start
export const getSensorHistList = ({
  sensorId,
  startTime,
  endTime,
  ts,
  type
}) => {
  return fetch.get('/api/Device/GetSensor_HistList', {
    params: {
      sensorId,
      startTime,
      endTime,
      ts,
      type
    }
  })
}
// #endregion 获取传感器历史数据 end

// #region 查询传感器原始数据 start
export const getOriginalSensorHistList = ({
  SensorId,
  StartTime,
  EndTime,
  IsAsc,
  PageSize,
  PageIndex
}) => {
  return fetch.post(
    '/api/Device/GetOriginalSensor_HistList',
    {
      SensorId,
      StartTime,
      EndTime,
      IsAsc,
      PageSize,
      PageIndex
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 查询传感器原始数据 end

// #region 导出传感器原始数据 start
export const downOriginalSensorHistList = ({
  SensorId,
  StartTime,
  EndTime,
  IsAsc,
  PageSize,
  PageIndex,
  Export
}) => {
  return fetch.post(
    '/api/Device/GetOriginalSensor_HistList',
    {
      SensorId,
      StartTime,
      EndTime,
      IsAsc,
      PageSize,
      PageIndex,
      Export
    },
    {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'blob'
    }
  )
}
// #endregion 导出传感器原始数据 end

// #region 下载温度计历史数据 start
export const downSensorHistoryData = ({
  sensorId,
  startTime,
  endTime,
  ts,
  type
}) => {
  return fetch.get('/api/Device/DownSensorHistoryData', {
    params: {
      sensorId,
      startTime,
      endTime,
      ts,
      type
    },
    responseType: 'blob',
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 下载温度计历史数据 end

// #region 批量删除传感器 start
export const batchDeleteSensorTag = ({ sensorTagIdList }) => {
  return fetch.post('/api/Device/BatchDeleteSensorTag', sensorTagIdList, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 批量删除传感器 end

// #region 获取未被车辆和运单绑定的标签 start
export const getCarTagDropdownList = ({ projectId, carId }) => {
  return fetch.get('/api/Device/GetCarTagDropdownList', {
    params: {
      projectId,
      carId
    }
  })
}
// #endregion 获取未被车辆和运单绑定的标签 end

// #region 通过设备id获取该设备下绑定的监测点 start
export const getCarTagListByModelTreeIdSn = ({ modelTreeId }) => {
  return fetch.get('/api/Device/GetCarTagListByModelTreeIdSn', {
    params: {
      modelTreeId
    }
  })
}
// #endregion 通过设备id获取该设备下绑定的监测点 end

// #region 批量添加车辆标签 start
export const batchAddCarTag = ({ modelTreeId, tagList }) => {
  return fetch.post('/api/Device/BatchAddCarTag', tagList, {
    params: {
      modelTreeId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 批量添加车辆标签 end

// #region 获取车辆序列号绑定的点位信息 start
export const getCarSnPointInfo = ({ sn, start, end }) => {
  return fetch.get('/api/Device/GetCarSnPointInfo', {
    params: {
      sn,
      start,
      end
    }
  })
}
// #endregion 获取车辆序列号绑定的点位信息 end

// #region 修改网关名称 start
export const updateDevicesName = ({ deviceName, deviceID }) => {
  return fetch.post('/api/Device/UpdateDevicesName', null, {
    params: {
      deviceID,
      deviceName
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改网关名称 end

// #region 修改网关序列号 start
export const updateDevicesSN = ({ SN, deviceID }) => {
  return fetch.get('/api/Device/UpdateDevicesSN', {
    params: {
      SN,
      deviceID
    }
  })
}
// #endregion 修改网关序列号 end

// #region 设备绑定通讯卡 start
export const deviceBindICCID = ({ ICCID, deviceID }) => {
  return fetch.get('/api/Device/DeviceBindICCID', {
    params: {
      ICCID,
      deviceID
    }
  })
}
// #endregion 设备绑定通讯卡 end

// #region 设备解绑通讯卡 start
export const deviceUnBindICCID = deviceID => {
  return fetch.get('/api/Device/DeviceUnBindICCID', {
    params: {
      deviceID
    }
  })
}
// #endregion 设备解绑通讯卡 end

// #region 通过设备id获取通讯卡信息 start
export const cardUsageInfo = deviceID => {
  return fetch.get('/api/Device/Card_usage_info', {
    params: {
      deviceID
    }
  })
}
// #endregion 通过设备id获取通讯卡信息 end

// #region 删除MQTT设备 start
export const deviceDeleteMQTT = ({
  deviceNo,
  deviceUserName,
  deviceUserPwd
}) => {
  return fetch.post('/api/Device/DeviceDeleteMQTT', null, {
    params: {
      deviceNo,
      deviceUserName,
      deviceUserPwd
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 删除MQTT设备 end

// #region mqtt网关点位列表 start
export const getMQTTInfo = deviceNo => {
  return fetch.get('/api/Device/GetDeviceMQTT', {
    params: {
      deviceNo
    }
  })
}
// #endregion mqtt网关点位列表 end

// #region mqtt网关点位列表 start
export const getDeviceMQTTPointPage = ({ deviceID, pageIndex, pageSize }) => {
  return fetch.get('/api/Device/GetDeviceMQTTPointPage', {
    params: {
      deviceID,
      pageIndex,
      pageSize
    }
  })
}
// #endregion mqtt网关点位列表 end

// #region 修改Modbus网关 start
export const updateModbusDevice = form => {
  return fetch.post('/api/Device/UpdateModbusDevice', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改Modbus网关 end

// #region 导入传感器 start
export const importSensorTag = formData => {
  return fetch.post('/api/Device/ImportSensorTag', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// #endregion 导入传感器 end

// #region 获取项目下的车辆 start
export const getProjectForCarList = ({ projectId }) => {
  return fetch.get('/api/Device/GetProjectForCarList', {
    params: {
      projectId
    }
  })
}
// #endregion 获取项目下的车辆 end

// #region 通过项目id获取传感器和记录仪列表 start
export const getTerminalDropdow = ({ projectId }) => {
  return fetch.get('/api/Device/GetTerminalDropdow', {
    params: {
      projectId
    }
  })
}
// #endregion 通过项目id获取传感器和记录仪列表 end

// #region 获取运单管理详情 start
export const getWaybillManagement = ({ waybillManagementId }) => {
  return fetch.get('/api/Device/GetWaybillManagement', {
    params: {
      waybillManagementId
    }
  })
}
// #endregion 获取运单管理详情 end

// #region web运单绑定标签 start
export const waybillBindTagsV2Web = form => {
  return fetch.post('/api/Device/WaybillBindTagsV2Web', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion web运单绑定标签 end

// #region 运单列表 start
export const getWaybillPageV2 = ({
  ProjectId,
  WaybillNumber,
  TransportStatusList,
  CarIdList,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Device/GetWaybillPageV2',
    {
      ProjectId,
      WaybillNumber,
      TransportStatusList,
      CarIdList,
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
// #endregion 运单列表 end

// #region 运单解绑V2 start
export const waybillUnbindTagsWebV2 = ({ WaybillNumber, ProjectId }) => {
  return fetch.post(
    '/api/Device/WaybillUnbindTagsWebV2',
    {
      WaybillNumber,
      ProjectId
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 运单解绑V2 end

// #region 获取温度范围 Web start
export const getTempRangeWeb = ({ projectId, companyId }) => {
  return fetch.get('/api/Device/GetTempRangeWeb', {
    params: {
      projectId,
      companyId
    }
  })
}
// #endregion 获取温度范围 Web end

// #region 批量导入运单 需上传运单导入模板 start
export const batchImportWaybill = formData => {
  return fetch.post('/api/Device/BatchImportWaybill', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// #endregion 批量导入运单 需上传运单导入模板 end

// #region 通过车辆id获取车辆点位信息 start
export const getCarPointInfo = ({ carId, start, end }) => {
  return fetch.get('/api/Device/GetCarPointInfo', {
    params: {
      carId,
      start,
      end
    }
  })
}
// #endregion 通过车辆id获取车辆点位信息 end

// #region 通过位置树id获取图片url start
export const getLocationTreeImgById = ({ locationTreeId }) => {
  return fetch.get('/api/Device/GetLocationTreeImgById', {
    params: {
      locationTreeId
    }
  })
}
// #endregion 通过位置树id获取图片url end

// #region 配置点位类型（0测点级，1设备下的点） start
export const getPointsByMtid = ({ mtid, type }) => {
  return fetch.get('/api/Device/GetPointByMtid', {
    params: {
      mtid,
      type
    }
  })
}
// #endregion 配置点位类型（0测点级，1设备下的点） end

// #region 网关切换项目 start
export const updateProjectDevices = ({ deviceID, projectId }) => {
  return fetch.get('/api/Device/UpdateProjectDevices', {
    params: {
      deviceID,
      projectId
    }
  })
}
// #endregion 网关切换项目 end

// #region 获取不同的模板 start
export const getTempByType = ({ inp }) => {
  return fetch.get('/api/Device/getTempByType', {
    params: {
      inp
    }
  })
}
// #endregion 获取不同的模板 end

// #region 保存模板 start
export const addTemplate = ({
  id,
  name,
  value,
  num,
  TYPE,
  CREATETIME,
  FLAG
}) => {
  return fetch.post(
    '/api/Device/addTemplate',
    {
      id,
      name,
      value,
      num,
      TYPE,
      CREATETIME,
      FLAG
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 保存模板 end

// #region 根据用户获取相关的自定义模板 start
export const getTempByUid = () => {
  return fetch.get('/api/Device/getTempByUid')
}
// #endregion 根据用户获取相关的自定义模板 end

// #region 根据模板id获取用户信息 start
export const getUserInfo = ({ tid }) => {
  return fetch.get('/api/Device/getUserInfo', {
    params: {
      tid
    }
  })
}
// #endregion 根据模板id获取用户信息 end

// #region 删除模板 start
export const deleteTemplate = ({ tid }) => {
  return fetch.get('/api/Device/deleteTemplate', {
    params: {
      tid
    }
  })
}
// #endregion 删除模板 end

// #region 根据模板id获取模板内容 start
export const getTempById = ({ tids }) => {
  return fetch.get('/api/Device/getTempById', {
    params: {
      tids
    }
  })
}
// #endregion 根据模板id获取模板内容 end

// #region 分享模板 start
export const regionUser = ({ uids, tid }) => {
  return fetch.get('/api/Device/regionUser', {
    params: {
      uids,
      tid
    }
  })
}
// #endregion 分享模板 end

// #region 删除分享模板成员 start
export const deleteUser = ({ uids, tid }) => {
  return fetch.get('/api/Device/deleteUser', {
    params: {
      uids,
      tid
    }
  })
}
// #endregion 删除分享模板成员 end

// #region 修改模板信息 start
export const updateTemplate = ({
  id,
  name,
  value,
  num,
  TYPE,
  CREATETIME,
  FLAG
}) => {
  return fetch.post(
    '/api/Device/updateTemplate',
    {
      id,
      name,
      value,
      num,
      TYPE,
      CREATETIME,
      FLAG
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 修改模板信息 end

// #region 添加mqtt网关 start
export const deviceAddMQTT = ({
  deviceName,
  deviceNo,
  deviceUserName,
  deviceUserPwd,
  uid,
  pid,
  CompanyId
}) => {
  return fetch.post(
    '/api/Device/DeviceAddMQTT',
    {
      deviceName,
      deviceNo,
      deviceUserName,
      deviceUserPwd,
      uid,
      pid,
      CompanyId
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加mqtt网关 end

// #region 验证设备 start
export const verifyDevice = ({ deviceNo, deviceUserName, deviceUserPwd }) => {
  return fetch.get('/api/Device/VerifyDevice', {
    params: {
      deviceNo,
      deviceUserName,
      deviceUserPwd
    }
  })
}
// #endregion 验证设备 end

// #region 历史数据导出xlsx start
export const downHistoryData = ({ start, end, pointIdList, tmes }) => {
  return fetch.get('/api/Device/DownHistoryData', {
    params: {
      start,
      end,
      pointIdList,
      tmes
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 历史数据导出xlsx end

// #region 添加设备传感器 start
export const addDevices = ({ data }) => {
  return fetch.post(
    `/api/Device/addDevicesNew`,
    {
      data
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加设备传感器 end

// #region 新增tcp网关 start
export const addDevicePoint = form => {
  return fetch.post('/api/Device/AddDevicePoint', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 新增tcp网关 end

// #region 删除tcp网关 start
export const devDeleteTCP = id => {
  return fetch.get('/api/Device/devDeleteTCP', {
    params: {
      id
    }
  })
}
// #endregion 删除tcp网关 end

// #region 查询tcp网关配置 start
export const getTCPConfig = deviceID => {
  return fetch.get('/api/Device/GetDevice_TCPConfig', {
    params: {
      deviceID
    }
  })
}
// #endregion 查询tcp网关配置 end

// #region 删除传感器 start
export const delSensor = ({ SensorId }) => {
  return fetch.get('/api/Device/delSensorNEW', {
    params: {
      SensorId
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 删除传感器 end

// #region 根据网关id得到全部信息 start
export const getDeviceConfig = ({ deviceID }) => {
  return fetch.get('/api/Device/GetDevice_Config', {
    params: {
      deviceID
    }
  })
}
// #endregion 根据网关id得到全部信息 end

// #region 传感器写入数据 start
export const writeGateway = ({ pointID, writeData }) => {
  return fetch.get('/api/Device/ControlDown', {
    params: {
      pointID,
      writeData
    }
  })
}
// #endregion 传感器写入数据 end

// #region 删除设备 start
export const delDevices = ({ DeviceId }) => {
  return fetch.get('/api/Device/delDevicesNew', {
    params: {
      DeviceId
    }
  })
}
// #endregion 删除设备 end

// #region 查询网关序列号是否已经存在 start
export const ckDeviceNo = ({ deviceno }) => {
  return fetch.get('/api/Device/CkDeviceNo', {
    params: {
      deviceno
    }
  })
}
// #endregion 查询网关序列号是否已经存在 end

// #region 获取可配置用户 start
export const getUserbyPro = ({ tid, inp }) => {
  return fetch.get('/api/Device/getUserbyPro', {
    params: {
      tid,
      inp
    }
  })
}
// #endregion 获取可配置用户 end

// #region 添加modbus网关最新版 start
export const updateDevices = (form, SensorId) => {
  return fetch.post('/api/Device/updateDevicesNEW', form, {
    headers: { 'Content-Type': 'application/json' },
    params: {
      SensorId
    },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 添加modbus网关最新版 end

// #region 历史数据导出xlsx start
export const downHistoryDataToExcelOrPdf = ({
  start,
  end,
  pointIdList,
  tmes,
  fileType,
  isZip,
  isAlarmLacy,
  isMerge,
  zipFileList,
  responseType
}) => {
  return fetch.post('/api/Device/DownHistoryDataToExcelOrPdf', zipFileList, {
    params: {
      start,
      end,
      pointIdList,
      tmes,
      fileType,
      isZip,
      isAlarmLacy,
      isMerge
    },
    responseType,
    headers: { 'Content-Type': 'application/json' },
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false })
    }
  })
}
// #endregion 历史数据导出xlsx end

// #region 获取主控配置信息 start
export const getMasterControl = ({ proId }) => {
  return fetch.get('/api/Device/GetMasterControl', {
    params: {
      proId
    }
  })
}
// #endregion 获取主控配置信息 end

// #region 获取配置信息（返回点位对应网关配置信息） start
export const getDeviceInfo = ({ deviceId }) => {
  return fetch.get('/api/Device/GetDeviceInfo', {
    params: {
      deviceId
    }
  })
}
// #endregion 获取配置信息（返回点位对应网关配置信息） end

// #region 获取网关信息 start
export const getPointConfig = ({ pointID }) => {
  return fetch.get('/api/Device/GetPointConfig', {
    params: {
      pointID
    }
  })
}
// #endregion 获取网关信息 end

// #region 添加modbus网关最新版 start
export const addDevicesNewModbus = ({
  DeviceModuleAndAddressList,
  deviceId,
  /** remark: 序列号 */
  remark,
  deviceName,
  DeviceAddress,
  CompanyId,
  pid,
  BaudRate,
  DataBit,
  CheckBit,
  StopBit,
  DeviceTypeE
}) => {
  return fetch.post(
    '/api/Device/addDevicesNewModbus',
    {
      DeviceModuleAndAddressList,
      deviceId,
      remark,
      deviceName,
      DeviceAddress,
      CompanyId,
      pid,
      BaudRate,
      DataBit,
      CheckBit,
      StopBit,
      DeviceTypeE,
      type: 0
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 添加modbus网关最新版 end

// #region 修改modbus网关最新版 start
export const updateDevicesNEWModbus = ({
  DeviceModuleAndAddressList,
  DeletePointIdList,
  CustomPointIdList,
  // 添加或者修改类型 0:自定义点位添加 1:模块添加
  AddOrUpdateModbusDeviceType,
  deviceId,
  /** remark: 序列号 */
  remark,
  deviceName
}) => {
  return fetch.post(
    '/api/Device/updateDevicesNEWModbus',
    {
      DeviceModuleAndAddressList,
      DeletePointIdList,
      CustomPointIdList,
      // 添加或者修改类型 0:自定义点位添加 1:模块添加
      AddOrUpdateModbusDeviceType,
      deviceId,
      remark,
      deviceName
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 修改modbus网关最新版 end

// #region 获取网关序列号规则 start
export const getDeviceNumRule = ({ deviceTypeList }) => {
  return fetch.post('/api/Device/GetDeviceNumRule', deviceTypeList, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 获取网关序列号规则 end

// #region 获取modbus网关下模块信息 start
export const getModbusDeviceModulePage = ({
  DeviceId,
  DeviceModuleName,
  ModuleTypeList,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) => {
  return fetch.post(
    '/api/Device/GetModbusDeviceModulePage',
    {
      DeviceId,
      DeviceModuleName,
      ModuleTypeList,
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
// #endregion 获取modbus网关下模块信息 end

// #region 获取网关统计信息 start
export const getDeviceTotal = ({
  CompanyId,
  IsQueryCreator,
  ProjectIdList
}) => {
  return fetch.post(
    '/api/Device/GetDeviceTotal',
    {
      CompanyId,
      IsQueryCreator,
      ProjectIdList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取网关统计信息 end

// #region 获取设备基础信息 start
export const getModelTreeBaseInfo = data => {
  return fetch.get('/api/ModelTree/GetModelTreeBaseInfo', {
    params: data
  })
}
// #endregion 获取设备基础信息 end

// #region 获取设备静态属性 start
export const getModelTreeStaticProperty = data => {
  return fetch.get('/api/ModelTreeStaticProperty/GetModelTreeStaticProperty', {
    params: data
  })
}
// #endregion 获取设备静态属性 end

// #region 添加或更新设备 start
export const addOrUpdateModelTree = data => {
  return fetch.post('/api/ModelTree/AddOrUpdateModelTree', data, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 添加或更新设备 end

// #region 刷新网关设备 start
export const refreshDeviceModelTree = ({ deviceId, projectId }) => {
  return fetch.get('/api/Device/RefreshDeviceModelTree', {
    params: {
      deviceId,
      projectId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 刷新网关设备 end

// #region 网关切换企业 start
export const updateCompanyDevice = ({ deviceId, companyId }) => {
  return fetch.get('/api/Device/UpdateCompanyDevice', {
    params: {
      deviceId,
      companyId
    },
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 网关切换企业 end
