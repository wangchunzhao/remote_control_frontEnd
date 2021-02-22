import fetch from '@/utils/service'

// 分类配置

// 新增资产分类
export const assetsTypeAdd = form => {
  return fetch.post('/api/AssetsType/AssetsTypeAdd', form)
}

// 删除资产分类
export const assetsTypeDelete = form => {
  return fetch.post('/api/AssetsType/AssetsTypeDelete', form)
}

// 修改资产分类
export const assetsTypeUpdate = form => {
  return fetch.post('/api/AssetsType/AssetsTypeUpdate', form)
}

// 复制资产分类
// export const assetsTypeCopy = (projectId, projectIdNew) => {
//   return fetch.get('/api/AssetsType/AssetsTypeCopy', {
//     params: {
//       projectId,
//       projectIdNew
//     }
//   })
// }

// 新增监测分类
export const monitorTypeAdd = form => {
  return fetch.post('/api/MonitorType/MonitorTypeAdd', form)
}

// 删除监测分类
export const monitorTypeDelete = form => {
  return fetch.post('/api/MonitorType/MonitorTypeDelete', form)
}

// 修改监测分类
export const monitorTypeUpdate = form => {
  return fetch.post('/api/MonitorType/MonitorTypeUpdate', form)
}

// 复制资产分类
export const monitorTypeCopy = (projectId, projectIdNew) => {
  return fetch.get('/api/MonitorType/MonitorTypeCopy', {
    params: {
      projectId,
      projectIdNew
    }
  })
}

// 导入监控分类
export const monitorTypeExport = form => {
  return fetch.post('/api/MonitorType/MonitorTypeExport', form)
}
