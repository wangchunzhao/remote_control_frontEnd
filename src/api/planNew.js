import fetch from '@/utils/service'

// #region 点位类型列表 start
export const getTypeList = ({ mtid }) => {
  return fetch.get(BASE_URI + '/api/Plan/GetTypeList', {
    params: {
      mtid
    }
  })
}
// #endregion 点位类型列表 end

// #region 平面图数据 start
export const getPlanItems = ({ mtid, sid = 0, typeId }) => {
  return fetch.get(BASE_URI + '/api/Plan/showInfo', {
    params: {
      mtid,
      sid,
      typeId
    }
  })
}
// #endregion 平面图数据 end

// #region 平面图结构树 start
export const getPlanStructTree = ({ project }) => {
  return fetch.get(BASE_URI + '/api/Plan/plantrees', {
    params: {
      project
    }
  })
}
// #endregion 平面图结构树 end

// #region 显示测点参数信息 start
export const showlevInfo = mtid => {
  return fetch.get(BASE_URI + '/api/Plan/showlevInfo', {
    params: {
      mtid
    }
  })
}
// #endregion 显示测点参数信息 end

// #region 删除设备或者删除点 start
export const deleteInfo = form => {
  return fetch.post(BASE_URI + '/api/Plan/deleteInfo', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 删除设备或者删除点 end

// #region 修改坐标位置 start
export const updateArea = form => {
  return fetch.post(BASE_URI + '/api/Plan/updateArea', form, {
    headers: { 'Content-Type': 'application/json' }
  })
}
// #endregion 修改坐标位置 end

// #region 上传图片 start
export const setPlanBg = ({ url, mtid }) => {
  return fetch.post(BASE_URI + '/api/Plan/uploadImg', null, {
    params: {
      url,
      mtid
    }
  })
}
// #endregion 上传图片 end

// #region 上传图片 start
export const uploadImg = ({ img, id, height, width }) => {
  return fetch.get(BASE_URI + '/api/Plan/uploadImg', {
    params: {
      img,
      id,
      height,
      width
    }
  })
}
// #endregion 上传图片 end

// #region 得到未分配的信息 start
export const getUndistr = mtid => {
  return fetch.get(BASE_URI + '/api/Plan/getUndistr', {
    params: {
      mtid,
      sid: ''
    }
  })
}
// #endregion 得到未分配的信息 end

// #region  start
export const getDistr = mtid => {
  return fetch.get(BASE_URI + '/api/Plan/getDistr', {
    params: {
      mtid,
      sid: ''
    }
  })
}
// #endregion  end

// #region  start
export const deleteImg = id => {
  return fetch.get(BASE_URI + '/api/Plan/deleteImg', {
    params: {
      id
    }
  })
}
// #endregion  end

// #region  start
export const existPlan = ({ mtid }) => {
  return fetch.get(BASE_URI + '/api/Plan/existImg', {
    params: {
      mtid
    }
  })
}
// #endregion  end
