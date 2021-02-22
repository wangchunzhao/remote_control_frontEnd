import { Notification } from 'element-ui'
import { randomString } from '@/utils/index'

// 验证表格数据方法
export const checkData = (data, pageSize) => {
  let errRows = []
  let errPages = []
  // funcode bias datas
  const sensorCollection = data.map(
    item => `${item.funcode.value}/${item.bias.value}/${item.datas.value}`
  ) // 所有点位 功能码、寄存器地址、地址位 合集
  for (let i = 0; i < data.length; i++) {
    let error = false // 判断当前行是否有错误的标记
    if (
      sensorCollection.filter(
        item =>
          item ===
          `${data[i]['funcode'].value}/${data[i]['bias'].value}/${data[i]['datas'].value}`
      ).length > 1
    ) {
      data[i]['sensorName'].msg =
        '不可同时存在两个以上具有相同从站地址、功能码、寄存器地址、地址位的点位，请修改完成后再校验一次'
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
    if (data[i]['sensorTypeId'].value) {
      // if (data[i]['sensorTypeId'].value !== 1 && data[i]['sensorTypeId'].value !== 2) {
      //     data[i]['sensorTypeId'].msg = '值只能为 开关型 / 数值型';
      //     error = true;
      // }
    } else {
      data[i]['sensorTypeId'].msg = '请选择点位类型'
      error = true
    }
    if (data[i]['unit'].value) {
      // if (data[i]['sensorTypeId'].value === 2) {
      //     data[i]['unit'].msg = '当点位类型为 开关型 时，单位应该为 空'
      //     error = true;
      // }
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
      if (data[i]['datatype'].value === 7 && data[i]['orderStr'].value !== '') {
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
    if (isInteger(data[i]['cycle'].value)) {
      if (
        data[i]['cycle'].value != 10 &&
        data[i]['cycle'].value != 30 &&
        data[i]['cycle'].value % 60 != 0
      ) {
        data[i]['cycle'].msg = '可选择 10s/30s/60s/120s 或自定义(输入60的倍数)'
        error = true
      }
    } else {
      data[i]['cycle'].msg = '可选择 10s/30s/60s/120s 或自定义(输入60的倍数)'
      error = true
    }
    if (error) {
      errRows.push(i + 1)
      data[i].editable = true
    } else {
      data[i].editable = false
    }
  }
  errRows.forEach(rowIndex => {
    errPages.push(handlePage(rowIndex, pageSize))
  })
  return { data, errPages: Array.from(new Set(errPages)) }
}

// 格式化数据
export const dataTransform = (data_, type, pointTypeOptions) => {
  let data = JSON.parse(JSON.stringify(data_))
  if (type === 'fromExcel') {
    try {
      for (let i = 0; i < data.length; i++) {
        if (data[i]['点位名称']) {
          data[i]['sensorName'] = {
            // 导入的 excel 中的点位名称可能是一个数字，
            value: data[i]['点位名称'].toString(),
            msg: ''
          }
        } else if (data[i]['传感器名称']) {
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
          console.log(temp)
          data[i]['field1'] = {
            value: temp[0] || '',
            msg: ''
          }
          data[i]['field2'] = {
            value: temp[1] || '',
            msg: ''
          }
          data[i]['field3'] = {
            value: temp[2] || '',
            msg: ''
          }
          data[i]['field4'] = {
            value: temp[3] || '',
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
        if (data[i]['功能码']) {
          data[i]['funcode'] = {
            value: data[i]['功能码'],
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
            value: data[i]['数据格式'],
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
          item.Value && (unitOptions = item.Value.split('|').map(v => v.trim()))
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
        value: data[i].typeSection === 'state' ? '' : data[i].Decimal,
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
  }
  return data
}

// 复制行
export const copy = (tableData, row) => {
  let temp = {}
  temp.sensorName = row.sensorName
  temp.sensorName.value =
    temp.sensorName.value +
    '-' +
    randomString(5, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  temp.sensorTypeId = row.sensorTypeId
  temp.decimal = row.decimal
  temp.unit = row.unit
  temp.field1 = row.field1
  temp.field2 = row.field2
  temp.field3 = row.field3
  temp.field4 = row.field4
  temp.funcode = row.funcode
  temp.bias = row.bias
  temp.datatype = row.datatype
  temp.orderStr = row.orderStr
  temp.datas = row.datas
  temp.cycle = row.cycle
  temp.editable = true
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
export const addRow = tableData => {
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
