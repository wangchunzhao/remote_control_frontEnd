// <!-- 编辑网关时的相关功能函数 -->
export const parseSN = (
  sn,
  { baudRateOptions = [], dataCheckStopBitOptions = [] }
) => {
  // 规则说明： https://www.teambition.com/project/5c35d33ba097c80018d9ec4a/sprint/section/5ebb5c94458cfd0021a96941/task/5ef01ab278804c0022ba5739
  const vendor = sn.substring(0, 2) // 厂商标识
  const deviceType = sn.substring(2, 5) // 设备类型
  const version = sn.substring(5, 6) // 版本
  const serialParams = sn.substring(6, 8) // 串口参数
  const standby = sn.substring(8, 9)
  const date = sn.substring(9, 13) // 年份 + 周次
  const serialNumber = sn.substring(13, 16)
  let baudRate = ''
  if (serialParams !== '0') {
    baudRate = (baudRateOptions.find(v => v.Key === serialParams[0]) || {})
      .Value
  }

  let dataBit = ''
  let checkBit = ''
  let stopBit = ''
  if (serialParams[1] !== '0') {
    const group = (
      dataCheckStopBitOptions.find(v => v.Key === serialParams[1]) || {}
    ).Value
    if (group) {
      const params = group.split('-')
      dataBit = params[0]
      checkBit = params[1]
      stopBit = params[2]
    }
  }
  // 是否是 CG100 系列网关
  let isCG100 = false
  if (deviceType[0] === '1' && deviceType[1] === '0') {
    isCG100 = true
  }

  /** 网关类型 */
  let gatewayType = ''
  if (deviceType[0] === '1' && deviceType[1] === '0') {
    gatewayType = 'Modbus RTU'
  }
  if (
    deviceType[0] === '1' &&
    (deviceType[1] === '1' || deviceType[1] === '3')
  ) {
    gatewayType = 'Modbus TCP'
  }
  if (deviceType[0] === '2' && deviceType[1] === '0') {
    gatewayType = 'MQTT'
  }
  return {
    vendor,
    deviceType,
    version,
    serialParams,
    date,
    serialNumber,
    standby,
    dataBit,
    checkBit,
    stopBit,
    baudRate,
    isCG100,
    gatewayType
  }
}

// 校验 modbus 网关序列号
export const checkModbusGatewaySN = sn => {
  if (typeof sn !== 'string') {
    return false
  }
  if (sn.length !== 16) {
    // console.log('长度应该等于16')
    return false
  }
  // 序列号规则说明 https://www.teambition.com/project/5c35d33ba097c80018d9ec4a/works/5c3842797a1e9d001850f251/work/5f07d2f74213ff0022d84c8a
  const vendor = sn.substring(0, 2) // 厂商标识
  const deviceType = sn.substring(2, 5) // 设备类型
  const version = sn.substring(5, 6) // 版本
  const serialParams = sn.substring(6, 8) // 串口参数
  const standby = sn.substring(8, 9)
  const date = sn.substring(9, 13) // 年份 + 周次
  const serialNumber = sn.substring(13, 16)
  if (
    !/[A-Z0-9]{2}/.test(vendor) ||
    !/[A-Z0-9]{3}/.test(deviceType) ||
    !/[A-Z0-9]{1}/.test(version) ||
    !/[A-Z0-9]{2}/.test(serialParams) ||
    !/[A-F0-9]{4}/.test(date) ||
    !/[A-F0-9]{3}/.test(serialNumber) ||
    !/[A-F0-9]{1}/.test(standby)
  ) {
    return false
  }
  return true
}

import { Notification } from 'element-ui'

// 验证表格数据方法
export const checkData = (data, pageSize, type) => {
  let errRows = []
  let errPages = []
  // type为undefined就是验证modbus网关
  if (!type) {
    const sensorCollection = data.map(
      item => `${item.address.value}/${item.sensorName.value}`
    ) // 所有点位 从站地址
    for (let i = 0; i < data.length; i++) {
      let error = false // 判断当前行是否有错误的标记
      if (
        sensorCollection.filter(
          item =>
            item ===
            `${data[i]['address'].value}/${data[i]['sensorName'].value}`
        ).length > 1
      ) {
        data[i]['sensorName'].msg =
          '不可同时存在一个以上具有相同从站地址、点位名称的点位，请修改完成后再校验一次'
        error = true
      } else {
        data[i]['sensorName'].msg = ''
      }
      if (
        !data[i]['sensorName'].value ||
        data[i]['sensorName'].value === 'Error'
      ) {
        data[i]['sensorName'].msg = '请输入点位名称'
        error = true
      }
      if (!data[i]['sensorTypeId'].value) {
        data[i]['sensorTypeId'].msg = '请选择点位类型'
        error = true
      }

      if (isInteger(data[i].address.value)) {
        if (
          Number(data[i]['address'].value) < 1 ||
          Number(data[i]['address'].value) > 255
        ) {
          data[i]['address'].msg = '请输入一个 1-255 之间的整数'
          error = true
        }
      } else {
        data[i]['address'].msg = '请输入一个 1-255 之间的整数'
        error = true
      }

      if (isInteger(data[i]['cycle'].value)) {
        if (
          data[i]['cycle'].value != 10 &&
          data[i]['cycle'].value != 30 &&
          data[i]['cycle'].value % 60 != 0
        ) {
          data[i]['cycle'].msg =
            '可选择 10s/30s/60s/120s 或自定义(输入60的倍数)'
          error = true
        }
      } else {
        data[i]['cycle'].msg = '可选择 10s/30s/60s/120s 或自定义(输入60的倍数)'
        error = true
      }

      // pointType === '2' 不可编辑和查看映射、功能码、寄存器地址、数据格式、字节顺序、地址位 ， pointType === '1' 正好相反
      if (data[i].pointType !== '2') {
        if (
          data[i]['field1'].value ||
          data[i]['field2'].value ||
          data[i]['field3'].value ||
          data[i]['field4'].value
        ) {
          if (
            !(
              isInteger(data[i]['field1'].value) &&
              isInteger(data[i]['field2'].value) &&
              isInteger(data[i]['field3'].value) &&
              isInteger(data[i]['field4'].value)
            )
          ) {
            data[i]['field1'].msg =
              '映射参数由4个数{x1,x2,x3,x4}组成,如: -1000~1000 -> -100 ~ 100'
            error = true
          } else {
            if (data[i]['field1'].value === data[i]['field2'].value) {
              data[i]['field1'].msg = '映射参数 x1 不能等于 x2'
              error = true
            }
          }
        }
        if (isInteger(data[i]['bias'].value)) {
          if (
            Number(data[i]['bias'].value) <= 0 ||
            Number(data[i]['bias'].value) >= 65535
          ) {
            data[i]['bias'].msg = '请输入一个 0-65535 之间的整数'
            error = true
          }
        } else {
          data[i]['bias'].msg = '请输入一个 0-65535 之间的整数'
          error = true
        }
        if (!data[i]['funcode'].value) {
          data[i]['funcode'].msg = '功能码不能为空'
          error = true
        }
        if (data[i]['funcode'].value === 1 || data[i]['funcode'].value === 2) {
          if (data[i]['datatype'].value !== 7) {
            data[i]['datatype'].msg =
              '当功能码为 01读写 / 02只读 时，数据格式应该为 bit'
            error = true
          }
        } else {
          if (data[i]['datatype'].value === 7) {
            data[i]['datatype'].msg =
              '当功能码为 03读写 / 04只读 时，数据格式不能为 bit'
            error = true
          }
        }
        if (!data[i]['datatype'].value) {
          data[i]['datatype'].msg = '数据格式不能为空'
          error = true
        }
        if (data[i]['orderStr'].value) {
          if (
            data[i]['datatype'].value === 1 ||
            data[i]['datatype'].value === 2 ||
            data[i]['datatype'].value === 6
          ) {
            if (
              data[i]['orderStr'].value !== 'AB' &&
              data[i]['orderStr'].value !== 'BA'
            ) {
              data[i]['orderStr'].msg =
                '当数据格式为 16位有符号数 / 16位无符号数 / 16位按位读取，字节顺序应该为 AB / BA'
              error = true
            }
          }
          if (
            data[i]['datatype'].value === 3 ||
            data[i]['datatype'].value === 4 ||
            data[i]['datatype'].value === 5
          ) {
            if (
              data[i]['orderStr'].value === 'AB' ||
              data[i]['orderStr'].value === 'BA' ||
              data[i]['orderStr'].value === ''
            ) {
              data[i]['orderStr'].msg =
                '当数据格式为 32位有符号数 / 32位无符号数 / 32位浮点型数 时，字节顺序应该为 ABCD / CDAB / BADC / DCAB'
              error = true
            }
          }
          if (
            data[i]['datatype'].value === 7 &&
            data[i]['orderStr'].value !== ''
          ) {
            data[i]['orderStr'].msg = '当数据格式为 bit 时，字节顺序应该为 空'
            error = true
          }
        } else if (data[i]['datatype'].value !== 7) {
          data[i]['orderStr'].msg = '当数据格式不为 bit 时，字节顺序不能为 空'
          error = true
        }
        if (data[i]['datas'].value) {
          if (data[i]['datatype'].value !== 6) {
            data[i]['datas'].msg = '当数据格式不为 16位按位读取 时，值应该为 空'
            error = true
          }
        } else {
          if (data[i]['datatype'].value === 6) {
            data[i]['datas'].msg = '当数据格式为 16位按位读取 时，值不能为 空'
            error = true
          }
        }
      }

      if (error) {
        errRows.push(i + 1)
        data[i].editable = true
      } else {
        data[i].editable = false
      }
    }
  } else {
    for (let i = 0; i < data.length; i++) {
      let error = false // 判断当前行是否有错误的标记
      if (
        !data[i]['sensorName'].value ||
        data[i]['sensorName'].value === 'Error'
      ) {
        data[i]['sensorName'].msg = '请输入点位名称'
        error = true
      }
      if (!data[i]['sensorTypeId'].value) {
        data[i]['sensorTypeId'].msg = '请选择点位类型'
        error = true
      }
      if (
        data[i]['field1'].value ||
        data[i]['field2'].value ||
        data[i]['field3'].value ||
        data[i]['field4'].value
      ) {
        if (
          !(
            isInteger(data[i]['field1'].value) &&
            isInteger(data[i]['field2'].value) &&
            isInteger(data[i]['field3'].value) &&
            isInteger(data[i]['field4'].value)
          )
        ) {
          data[i]['field1'].msg =
            '映射参数由4个数{x1,x2,x3,x4}组成,如: -1000~1000 -> -100 ~ 100'
          error = true
        } else {
          if (data[i]['field1'].value === data[i]['field2'].value) {
            data[i]['field1'].msg = '映射参数 x1 不能等于 x2'
            error = true
          }
        }
      }
      if (error) {
        errRows.push(i + 1)
        data[i].editable = true
      } else {
        data[i].editable = false
      }
    }
  }
  errRows.forEach(rowIndex => {
    errPages.push(handlePage(rowIndex, pageSize))
  })
  return { data, errPages: Array.from(new Set(errPages)) }
}
// 点检计划录入格式化数据
export const pointEntryDataTransform = (data, type) => {
  if (type === 'fromExcel') {
    try {
      for (let i = 0; i < data.length; i++) {
        data[i]['type'] = data[i]['点检类型']
        data[i]['content'] = data[i]['点检项']
        data[i]['mobile'] = data[i]['点检人账号']
        data[i]['cycle'] = data[i]['点检周期']
        data[i].editable = false
        delete data[i]['点检类型']
        delete data[i]['点检项']
        delete data[i]['点检人账号']
        delete data[i]['点检周期']
      }
    } catch (error) {
      this.$message('无法识别的内容，请参照模板文件生成文件')
      return
    }
  }
  return data
}

// 格式化数据
export const dataTransform = (data, type, pointTypeOptions) => {
  if (type === 'fromExcel') {
    try {
      for (let i = 0; i < data.length; i++) {
        if (data[i]['点位名称']) {
          data[i]['sensorName'] = {
            value: data[i]['点位名称'],
            msg: ''
          }
        } else if (data[i]['传感器名称']) {
          // 兼容之前的导入模板
          data[i]['sensorName'] = {
            value: data[i]['传感器名称'],
            msg: ''
          }
        } else {
          data[i]['sensorName'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['点位类型']) {
          pointTypeOptions[0].options.forEach(item => {
            if (item.TypeName === data[i]['点位类型']) {
              data[i].typeSection = 'state'
              // 如果是状态量，则清空小数位和单位
              data[i]['小数位'] = ''
              data[i]['单位'] = ''
              data[i]['sensorTypeId'] = {
                value: item.ID,
                msg: ''
              }
            }
          })
          pointTypeOptions[1].options.forEach(item => {
            if (item.TypeName === data[i]['点位类型']) {
              data[i].typeSection = 'simulate'
              data[i]['sensorTypeId'] = {
                value: item.ID,
                msg: ''
              }
              // 获取单位列表
              let unitOptions = []
              item.Value &&
                (unitOptions = item.Value.split('|').map(v => v.trim()))
              // 如果 excel 中的单位没有在当前类型中的可选单位中，则删除这个单位
              if (unitOptions.indexOf(data[i]['单位']) === -1) {
                data[i]['单位'] = ''
              }
              data[i].unitOptions = unitOptions
            }
          })
          if (!data[i]['sensorTypeId']) {
            // 说明上传的excel里面的点位类型没有找到对应的
            data[i]['sensorTypeId'] = {
              value: '',
              msg: ''
            }
          }
        } else {
          data[i]['sensorTypeId'] = {
            value: '',
            msg: ''
          }
        }
        if (
          data[i]['小数位'] !== '' ||
          data[i]['小数位'] !== undefined ||
          data[i]['小数位'] !== null
        ) {
          data[i]['decimal'] = {
            value: Number(data[i]['小数位']),
            msg: ''
          }
        } else {
          data[i]['decimal'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['单位']) {
          data[i]['unit'] = {
            value: data[i]['单位'],
            msg: ''
          }
        } else {
          data[i]['unit'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['映射']) {
          let temp = data[i]['映射'].split('/')
          data[i]['field1'] = {
            value: temp[0],
            msg: ''
          }
          data[i]['field2'] = {
            value: temp[1],
            msg: ''
          }
          data[i]['field3'] = {
            value: temp[2],
            msg: ''
          }
          data[i]['field4'] = {
            value: temp[3],
            msg: ''
          }
        } else {
          data[i]['field1'] = {
            value: '',
            msg: ''
          }
          data[i]['field2'] = {
            value: '',
            msg: ''
          }
          data[i]['field3'] = {
            value: '',
            msg: ''
          }
          data[i]['field4'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['从站地址']) {
          data[i]['address'] = {
            value: data[i]['从站地址'],
            msg: ''
          }
        } else {
          data[i]['address'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['功能码']) {
          data[i]['funcode'] = {
            value: data[i]['功能码'].trim(),
            msg: ''
          }
          switch (data[i]['funcode'].value) {
            case '01读写':
              data[i]['funcode'].value = 1
              break
            case '02只读':
              data[i]['funcode'].value = 2
              break
            case '03读写':
              data[i]['funcode'].value = 3
              break
            case '04只读':
              data[i]['funcode'].value = 4
              break
            default:
              break
          }
        } else {
          data[i]['funcode'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['寄存器地址']) {
          data[i]['bias'] = {
            value: data[i]['寄存器地址'],
            msg: ''
          }
        } else {
          data[i]['bias'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['数据格式']) {
          data[i]['datatype'] = {
            value: data[i]['数据格式'].trim(),
            msg: ''
          }
          switch (data[i]['datatype'].value) {
            case '16位有符号数':
              data[i]['datatype'].value = 1
              break
            case '16位无符号数':
              data[i]['datatype'].value = 2
              break
            case '32位有符号数':
              data[i]['datatype'].value = 3
              break
            case '32位无符号数':
              data[i]['datatype'].value = 4
              break
            case '32位浮点型数':
              data[i]['datatype'].value = 5
              break
            case '16位按位读取':
              data[i]['datatype'].value = 6
              break
            case 'bit':
              data[i]['datatype'].value = 7
              break
            default:
              break
          }
        } else {
          data[i]['datatype'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['字节顺序']) {
          data[i]['orderStr'] = {
            value: data[i]['字节顺序'],
            msg: ''
          }
        } else {
          data[i]['orderStr'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['地址位']) {
          data[i]['datas'] = {
            value: data[i]['地址位'],
            msg: ''
          }
        } else {
          data[i]['datas'] = {
            value: '',
            msg: ''
          }
        }
        if (data[i]['采集周期/s']) {
          data[i]['cycle'] = {
            value: data[i]['采集周期/s'],
            msg: ''
          }
        } else {
          data[i]['cycle'] = {
            value: '',
            msg: ''
          }
        }
        ;(data[i].pointType = '1'), (data[i].editable = false)
        data[i].flag = Math.random()
      }
    } catch (error) {
      Notification({
        title: '错误',
        message: '无法识别的内容，请参照模板文件生成文件',
        type: 'error'
      })
      return
    }
  } else if (type === 'fromServer') {
    for (let i = 0; i < data.length; i++) {
      // 点位名称
      data[i].sensorName = {
        value: data[i].NEW_NAME,
        msg: ''
      }
      // 点位类型
      data[i].sensorTypeId = {
        value: data[i].TYPE,
        msg: ''
      }
      // 单位
      data[i].unit = {
        value: data[i].UNIT,
        msg: ''
      }
      // 映射
      data[i].field1 = {
        value:
          data[i].field1 !== '' && data[i].field1 !== null
            ? data[i].field1
            : '',
        msg: ''
      }
      data[i].field2 = {
        value:
          data[i].field2 !== '' && data[i].field2 !== null
            ? data[i].field2
            : '',
        msg: ''
      }
      data[i].field3 = {
        value:
          data[i].field3 !== '' && data[i].field3 !== null
            ? data[i].field3
            : '',
        msg: ''
      }
      data[i].field4 = {
        value:
          data[i].field4 !== '' && data[i].field4 !== null
            ? data[i].field4
            : '',
        msg: ''
      }
      // 映射Id
      // data[i].fieldId = data[i].fieldId;
      // 功能码
      data[i].funcode = {
        value: data[i].function,
        msg: ''
      }
      // 寄存器地址
      data[i].bias = {
        value: data[i].address,
        msg: ''
      }
      // 数据格式
      data[i].datatype = {
        value: data[i].dataType,
        msg: ''
      }
      // 从站地址
      data[i].address = {
        value: data[i].slaveId,
        msg: ''
      }
      // 字节顺序
      data[i].orderStr = {
        value: data[i].orderStr,
        msg: ''
      }
      // 地址位
      data[i].datas = {
        value: data[i].bit ? data[i].bit : '',
        msg: ''
      }
      // 采集周期
      data[i].cycle = {
        value: data[i].cycle.toString(),
        msg: ''
      }
      // 判断当前点位是模拟量还是状态量,如果是模拟量的话，获取单位列表
      pointTypeOptions[0].options.forEach(item => {
        if (item.ID === data[i].TYPE) {
          data[i].typeSection = 'state'
        }
      })
      pointTypeOptions[1].options.forEach(item => {
        if (item.ID === data[i].TYPE) {
          data[i].typeSection = 'simulate'
          // 获取单位列表
          let unitOptions = []
          item.Value && (unitOptions = item.Value.split('|').map(v => v.trim()))
          data[i].unitOptions = unitOptions
        }
      })
      // 小数位
      data[i].decimal = {
        value: data[i].typeSection === 'state' ? '' : data[i].DECIMAL_POINT,
        msg: ''
      }
      data[i].editable = false
      data[i].flag = Math.random()
    }
  } else if (type === 'templateFromServer') {
    for (let i = 0; i < data.length; i++) {
      // 点位名称
      data[i].sensorName = {
        value: data[i].sensorName,
        msg: ''
      }
      pointTypeOptions[0].options.forEach(item => {
        if (item.ID === data[i].sensorTypeId) {
          data[i].typeSection = 'state'
        }
      })
      pointTypeOptions[1].options.forEach(item => {
        if (item.ID === data[i].sensorTypeId) {
          data[i].typeSection = 'simulate'
          // 获取单位列表
          let unitOptions = []
          item.Value && (unitOptions = item.Value.split('|'))
          data[i].unitOptions = unitOptions
        }
      })
      // 点位类型
      data[i].sensorTypeId = {
        value: data[i].sensorTypeId,
        msg: ''
      }
      // 小数位
      data[i].decimal = {
        value: data[i].typeSection === 'state' ? '' : data[i].decimal,
        msg: ''
      }
      // 单位
      data[i].unit = {
        value: data[i].unit,
        msg: ''
      }
      // 映射
      data[i].field1 = {
        value: data[i].field1,
        msg: ''
      }
      data[i].field2 = {
        value: data[i].field2,
        msg: ''
      }
      data[i].field3 = {
        value: data[i].field3,
        msg: ''
      }
      data[i].field4 = {
        value: data[i].field4,
        msg: ''
      }
      // 映射Id
      // eslint-disable-next-line no-self-assign
      data[i].fieldId = data[i].fieldId
      // 从站地址
      data[i].address = {
        value: data[i].address,
        msg: ''
      }
      // 功能码
      data[i].funcode = {
        value: data[i].funcode,
        msg: ''
      }
      // 寄存器地址
      data[i].bias = {
        value: data[i].bias,
        msg: ''
      }
      // 数据格式
      data[i].datatype = {
        value: data[i].datatype,
        msg: ''
      }
      // 字节顺序
      data[i].orderStr = {
        value: data[i].orderStr,
        msg: ''
      }
      // 地址位
      data[i].datas = {
        value: data[i].datas ? data[i].datas : '',
        msg: ''
      }
      // 采集周期
      data[i].cycle = {
        value: data[i].cycle,
        msg: ''
      }
      data[i].editable = false
      data[i].flag = Math.random()
    }
  } else if (type === 'tcpGateway') {
    for (let i = 0; i < data.length; i++) {
      data[i].channel = data[i].Channel
      // 点位名称
      data[i].sensorName = {
        value: data[i].NAME,
        msg: ''
      }
      // 点位类型
      data[i].sensorTypeId = {
        value: data[i].TYPE,
        msg: ''
      }
      // 小数位
      data[i].decimal = {
        value: data[i].DECIMAL_POINT,
        msg: ''
      }
      // 单位
      data[i].unit = {
        value: data[i].UNIT,
        msg: ''
      }
      // 映射
      let fieldList = data[i].Map ? data[i].Map.split(',') : []
      data[i].field1 = {
        value: fieldList.length ? fieldList[0] : '',
        msg: ''
      }
      data[i].field2 = {
        value: fieldList.length ? fieldList[1] : '',
        msg: ''
      }
      data[i].field3 = {
        value: fieldList.length ? fieldList[2] : '',
        msg: ''
      }
      data[i].field4 = {
        value: fieldList.length ? fieldList[3] : '',
        msg: ''
      }
      // 映射Id
      // data[i].fieldId = data[i].fieldId;
      // 判断当前点位是模拟量还是状态量,如果是模拟量的话，获取单位列表
      pointTypeOptions[0].options.forEach(item => {
        if (item.ID === data[i].TYPE) {
          data[i].typeSection = 'state'
        }
      })
      pointTypeOptions[1].options.forEach(item => {
        if (item.ID === data[i].TYPE) {
          data[i].typeSection = 'simulate'
          // 获取单位列表
          let unitOptions = []
          item.Value && (unitOptions = item.Value.split('|').map(v => v.trim()))
          data[i].unitOptions = unitOptions
        }
      })
      data[i].editable = false
    }
  }
  return data
}

// 复制行
export const copy = (tableData, row, type) => {
  let temp = {}
  temp.sensorName = row.sensorName
  temp.sensorName.value = temp.sensorName.value + '-copy'
  temp.sensorTypeId = row.sensorTypeId
  temp.decimal = row.decimal
  temp.unit = row.unit
  temp.field1 = row.field1
  temp.field2 = row.field2
  temp.field3 = row.field3
  temp.field4 = row.field4
  temp.editable = true
  if (!type) {
    temp.address = row.address
    temp.funcode = row.funcode
    temp.bias = row.bias
    temp.datatype = row.datatype
    temp.orderStr = row.orderStr
    temp.datas = row.datas
    temp.cycle = row.cycle
    temp.pointType = row.pointType
    temp.editable = true
    temp.flag = Math.random()
  }
  tableData.unshift(temp)
}

// 批量复制行
export const batchCopy = (tableData, rows) => {
  let temps = []
  rows.forEach(row => {
    let temp = {}
    temp.sensorName = row.sensorName
    temp.sensorName.value = temp.sensorName.value + '-copy'
    temp.sensorTypeId = row.sensorTypeId
    temp.decimal = row.decimal
    temp.unit = row.unit
    temp.field1 = row.field1
    temp.field2 = row.field2
    temp.field3 = row.field3
    temp.field4 = row.field4
    temp.address = row.address
    temp.funcode = row.funcode
    temp.bias = row.bias
    temp.datatype = row.datatype
    temp.orderStr = row.orderStr
    temp.datas = row.datas
    temp.cycle = row.cycle
    temp.pointType = row.pointType
    temp.editable = true
    temp.flag = Math.random()
    temps.push(temp)
  })
  tableData.unshift(...temps)
}

// 添加行 （点位列表）
export const addRow = (tableData, type, num) => {
  if (!type) {
    tableData.unshift({
      sensorName: {
        value: '',
        msg: ''
      },
      sensorTypeId: {
        value: '',
        msg: ''
      },
      decimal: {
        value: 0,
        msg: ''
      },
      unit: {
        value: '',
        msg: ''
      },
      field1: {
        value: '',
        msg: ''
      },
      field2: {
        value: '',
        msg: ''
      },
      field3: {
        value: '',
        msg: ''
      },
      field4: {
        value: '',
        msg: ''
      },
      address: {
        value: '',
        msg: ''
      },
      funcode: {
        value: '',
        msg: ''
      },
      bias: {
        value: '',
        msg: ''
      },
      datatype: {
        value: '',
        msg: ''
      },
      orderStr: {
        value: '',
        msg: ''
      },
      datas: {
        value: '',
        msg: ''
      },
      cycle: {
        value: '',
        msg: ''
      },
      pointType: '1',
      editable: true,
      flag: Math.random()
    })
  } else {
    if (num) {
      let temps = []
      for (let i = 1; i < num + 1; i++) {
        let temp = {
          sensorName: {
            value: '',
            msg: ''
          },
          sensorTypeId: {
            value: '',
            msg: ''
          },
          decimal: {
            value: 0,
            msg: ''
          },
          unit: {
            value: '',
            msg: ''
          },
          field1: {
            value: '',
            msg: ''
          },
          field2: {
            value: '',
            msg: ''
          },
          field3: {
            value: '',
            msg: ''
          },
          field4: {
            value: '',
            msg: ''
          },
          editable: true,
          channel: i
        }
        temps.push(temp)
      }
      tableData.unshift(...temps)
    } else {
      tableData.unshift({
        sensorName: {
          value: '',
          msg: ''
        },
        sensorTypeId: {
          value: '',
          msg: ''
        },
        decimal: {
          value: 0,
          msg: ''
        },
        unit: {
          value: '',
          msg: ''
        },
        field1: {
          value: '',
          msg: ''
        },
        field2: {
          value: '',
          msg: ''
        },
        field3: {
          value: '',
          msg: ''
        },
        field4: {
          value: '',
          msg: ''
        },
        editable: true,
        channel: ''
      })
    }
  }
}

export const isInteger = n => {
  if (n === '') {
    return false
  }
  return parseInt(n, 10) == n
}

// 判断某一行在第几页（每页20行）
function handlePage(rowIndex, pageSize) {
  let pageIndex = parseInt(rowIndex / pageSize)
  if (rowIndex % pageSize !== 0) {
    pageIndex = pageIndex + 1
  }
  return pageIndex
}
