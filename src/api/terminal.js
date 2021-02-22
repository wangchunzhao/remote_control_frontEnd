import fetch from '@/utils/service'

// #region 批量删除一体机 start
export const batchDeleteTerminal = ({ terminalIDList }) => {
  return fetch.post(
    BASE_URI + '/api/Terminal/BatchDeleteTerminal',
    terminalIDList,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量删除一体机 end

// #region 终端列表 start
/**
 * @description 终端列表
 * @param terminalNumber {int} 终端编号
 * @param {projectId} 项目ID
 * @param {status} 在线状态（1-离线；2-在线）
 * @param {userID} 用户ID
 * @param {companyId} 公司ID
 * @param {SortType} 排序类型 Enum： update_time, terminalNumber, amount, temperature, humidity
 * @param {IsAsc} 是否升序 默认降序
 * @param {PageIndex} 公司ID
 * @param {PageSize} 公司ID
 * @return
 * @author utopia
 **/
export function getTerminalList({
  terminalNumber,
  terminalType,
  projectId,
  status,
  userID,
  companyId,
  SortType,
  IsAsc,
  PageIndex,
  PageSize
}) {
  return fetch.post(
    BASE_URI + '/api/Terminal/TerminalList',
    {
      terminalNumber,
      terminalType,
      projectId,
      status,
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
// #endregion 终端列表 end

/**
 *
 * @description 批量添加终端
 * @export
 * @param {*} { ProjectId, TerminalNumberList }
 * @returns
 */
export function batchAddTerminal({
  ProjectId,
  TerminalNumberList,
  TerminalType
}) {
  return fetch.post(
    BASE_URI + '/api/Terminal/BatchAddTerminal',
    {
      ProjectId,
      TerminalType,
      TerminalNumberList
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 批量添加终端 end

// #region 验证终端是否存在 true:已存在 start
export const terminalIsExists = ({ terminalNumber }) => {
  return fetch.get(BASE_URI + '/api/Terminal/TerminalIsExists', {
    params: {
      terminalNumber
    }
  })
}
// #endregion 验证终端是否存在 true:已存在 end

// #region 导入采集器 start
export const importTerminal = formData => {
  return fetch.post(BASE_URI + '/api/Terminal/ImportTerminal', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// #endregion 导入采集器 end

// #region  start
export const terminalSIMBinding = ({ terminalID, terminalSIM }) => {
  return fetch.post(
    BASE_URI + '/api/Terminal/TerminalSIMBinding',
    {
      terminalID,
      terminalSIM
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
// #endregion 终端 记录仪绑定sim end
