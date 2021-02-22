import fetch from '@/utils/service'

// #region 批量设备绑定摄像头 start
export const batchModelTreeBindVideoMonitorPoint = ({ modelTreeId, form }) => {
  return fetch.post(
    BASE_URI + '/api/VideoMonitorPoint/BatchModelTreeBindVideoMonitorPoint',
    form,
    {
      params: {
        modelTreeId
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量设备绑定摄像头 end

// #region 批量添加视频监控点 start
export const batchAddVideoMonitorPoint = ({ bigTypeId, form, industry }) => {
  return fetch.post(
    BASE_URI + '/api/VideoMonitorPoint/BatchAddVideoMonitorPoint',
    form,
    {
      params: {
        bigTypeId,
        industry
      },
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量添加视频监控点 end

// #region 获取项目下的摄像头点位下拉框 start
export const getVideoMonitorPointDropdownList = ({
  projectId,
  modelTreeId,
  industry
}) => {
  return fetch.get(
    BASE_URI + '/api/VideoMonitorPoint/GetVideoMonitorPointDropdownList',
    {
      params: {
        projectId,
        modelTreeId,
        industry
      }
    }
  )
}
// #endregion 获取项目下的摄像头点位下拉框 end

// #region 获取设备下摄像头列表 start
export const getModelTreeVideoMonitorPointList = ({
  modelTreeId,
  industry
}) => {
  return fetch.get(
    BASE_URI + '/api/VideoMonitorPoint/GetModelTreeVideoMonitorPointList',
    {
      params: {
        modelTreeId,
        industry
      }
    }
  )
}
// #endregion 获取设备下摄像头列表 end

// #region 获取摄像头页 start
export const getVideoMonitorPointPage = ({
  CompanyId,
  ProjectId,
  DeviceSerialOrName,
  VideoMonitorTypeList,
  Status,
  SortType,
  IsAsc,
  PageIndex,
  PageSize,
  VideoMonitorApplicationIdList
}) => {
  return fetch.post(
    BASE_URI + '/api/VideoMonitorPoint/GetVideoMonitorPointPage',
    {
      CompanyId,
      ProjectId,
      DeviceSerialOrName,
      VideoMonitorTypeList,
      Status,
      SortType,
      IsAsc,
      PageIndex,
      PageSize,
      VideoMonitorApplicationIdList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 获取摄像头页 end

// #region 批量设备绑定摄像头 start
export const batchDeleteVideoMonitorPoint = ({ pointIdList }) => {
  return fetch.post(
    BASE_URI + '/api/VideoMonitorPoint/BatchDeleteVideoMonitorPoint',
    pointIdList,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量设备绑定摄像头 end
