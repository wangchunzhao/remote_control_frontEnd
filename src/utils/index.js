import MD5 from 'crypto-js/md5'

import { PROJECT_NAME } from '@/config'

export const md5 = string => {
  return MD5(string).toString()
}

/**
 * @description 生成localstorage或sessionstorage的key
 * @param {key} 原始key (string)
 * @return 哈希后的key
 * @author utopia
 **/
export const storageName = key => {
  key = process.env.NODE_ENV === 'production' ? md5(key) : key // 只有生产环境下的key都要哈希
  return `${PROJECT_NAME}_${key}`
}

export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

export const throttle = function(func, wait, options) {
  var timeout, context, args, result
  var previous = 0
  if (!options) options = {}

  var later = function() {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null //显示地释放内存，防止内存泄漏
  }

  var throttled = function() {
    var now = Date.now()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  throttled.cancel = function() {
    clearTimeout(timeout)
    previous = 0
    timeout = context = args = null
  }

  return throttled
}

/**
 * 特殊字符转义，防止特殊字符导致json字符串转换成json对象出错
 * @param {*} string
 * @returns string
 */
export const transSpecialChar = string => {
  return string
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/ /g, '&nbsp;')
    .replace(/(")+/g, '"')
    .replace(/'/g, '&#39;')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\\/g, '\\\\')
}

/**
 * 生成随机字符串
 *
 * @param {*} length 指定长度
 * @param {*} chars 字符集
 * @returns
 */
export const randomString = (
  length,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) => {
  var result = ''
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

// 导出pdf模板

export const outputPDF = (chartImgUrl, pointName, unit, pointList) => {
  let table = `
    <div class="pdfWrapper" id="pdfWrapper">
      <div class="title-wrap">
        <h3>
          <span class="text">历史数据曲线</span>
        </h3>
      </div>
      <div id="pdf-chart" class='pdf-chart'>
        <img src="${chartImgUrl}" style='width:100%;height:100%'>
      </div>
      <div class="title-wrap" style="margin-top: 20px;">
        <h3>
          <span class="text">【${pointName}】&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;历史数据表</span>
        </h3>
      </div>
      <div class="pdf-table">
        <div class="pdf-table-item">
            <span class="point-date">时间</span>
            <span class="point-value">值（${unit}）</span>
        </div>`
  pointList.forEach(item => {
    table += `<div class="pdf-table-item">
        <span class="point-date">${item.date}</span>
        <span class="point-value">${item.val}</span>
      </div>`
  })
  table += '</div></div>'
  let downloadHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Document</title>
          <style>
          html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              max-width: 100%;
              -webkit-overflow-scrolling: touch;
              -webkit-user-select:none;
              user-select: none;
              -webkit-touch-callout: none;
          }
            .pdfWrapper {
              width: 100%;
              box-sizing: border-box;
              padding: 0 60px;
              background: #fff;
            }
            .pdf-chart{
                width: 100%;
                height: 460px;
            }
            .pdf-table {
                box-sizing: border-box;
                padding: 0 30px;
            }
            .point-date {
                float: left;
            }
            .point-value {
                float: right;
            }
            .pdf-table-item {
              line-height: 40px;
              overflow: hidden;
              border-bottom: 1px solid #E8E8E8;
            }
          .title-wrap {
              position: relative;
              padding: 9px 15px;
              border-bottom: 2px solid #DEDFE0;
              background: #fff;
          }
          h3 {
                  font-size: 16px;
                  font-weight: normal;
                  display: inline-block;
                  margin: 0;
          }
          .title-icon {
            vertical-align: middle;
            margin-right: 5px;
            width: 20px;
            height: 20px;
          }
          span.text {
            font-size: 15px;
              font-weight: bold;
              display: inline-block;
              transform: translateY(2px);
              color: #3c3c3c
            }
          </style>
      </head>
      <body>
      ${table}
      </body></html>`
  return downloadHTML
}

export const generateHTML = (chartImg, data) => {
  let statisticalTable = ''
  let dataTableTh = ''
  for (let i = 0; i < data.PointList.length; i++) {
    statisticalTable += `
      <tr>
        <th>${data.PointList[i].PointName}</th>
        <th>${data.PointList[i].Max}</th>
        <th>${data.PointList[i].Min}</th>
        <th>${data.PointList[i].Avg}</th>
      </tr>
    `
    dataTableTh += `
      <th>
        ${data.PointList[i].PointName}
      </th>
    `
  }
  let dataTableContent = ''
  for (let i = 0; i < data.PointList[0].DataList.length; i++) {
    let temp = ''
    for (let j = 0; j < data.PointList.length; j++) {
      let unitMap = null
      if (data.PointList[j].UnitMap) {
        unitMap = {}
        data.PointList[j].UnitMap.forEach(map => {
          unitMap[map.key] = map.value
        })
      }
      const valueFactory = (value, unitMap) => {
        if (unitMap) {
          return unitMap[value]
        }
        return value
      }
      temp += `
        <td>
          ${
            data.PointList[j].DataList[i] &&
            data.PointList[j].DataList[i][1] !== null
              ? valueFactory(data.PointList[j].DataList[i][1], unitMap)
              : ' '
          }
        </td>
      `
    }
    dataTableContent += `
      <tr>
        <td>${data.PointList[0].DataList[i][0]}</td>
        ${temp}
      </tr>
    `
  }
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
    </head>
    <style>
      .pdfWrapper {
        width: 100%;
        box-sizing: border-box;
        padding: 0 60px;
        background: #fff;
      }
      .pdf-chart{
        width: 100%;
        height: 300px;
      }
      table {
        border-collapse: collapse;
      }
      table, th, td {
        border: 1px solid #ccc;
        text-align: center;
      }
      th, td {
        padding: 6px 15px;
        font-weight: bold;
        color: #3c3c3c
      }
      .pdf-table {
        box-sizing: border-box;
        padding: 0 30px;
      }
      .point-date {
        float: left;
      }
      .point-value {
        float: right;
      }
      .pdf-table-item {
        line-height: 40px;
        overflow: hidden;
        border-bottom: 1px solid #E8E8E8;
      }
      .title-wrap {
        position: relative;
        padding: 9px 15px;
        border-bottom: 2px solid #DEDFE0;
        background: #fff;
      }
      h3 {
        font-size: 16px;
        font-weight: normal;
        display: inline-block;
        margin: 0;
      }
      .title-icon {
        vertical-align: middle;
        margin-right: 5px;
        width: 20px;
        height: 20px;
      }
      span.text {
        font-size: 15px;
        font-weight: bold;
        display: inline-block;
        transform: translateY(2px);
        color: #3c3c3c
      }
      .A4 {
        page-break-after: always;
        page-break-inside: avoid;
      }
      table { page-break-inside:auto }
      tr { page-break-inside:avoid; page-break-after:auto }
      thead { display:table-header-group }
      tfoot { display:table-footer-group }
    </style>
    <body>
      <div id="pdfWrapper" class="pdfWrapper">
        <div v-if="data.PointList[i]" style="text-align:center;margin: 25px 0;font-weight: bold;font-size: 16px;">
          ${data.ProjectName} (${data.startTime} 至 ${data.endTime}）
        </div>
        <div class="title-wrap">
          <h3>
            <span class="text">历史数据曲线</span>
          </h3>
        </div>
        <div id="pdf-chart" class="pdf-chart">
          <img src="${chartImg}" style="width:100%;height:100%">
        </div>
        <div class="title-wrap">
          <h3>
            <span class="text">历史数据统计</span>
          </h3>
        </div>
        <table v-if="data" border="1" style="margin-top: 20px;width: 100%;" class="A4">
          <tr>
            <th>点位</th>
            <th>最大值</th>
            <th>最小值</th>
            <th>平均值</th>
          </tr>
          ${statisticalTable}
        </table>
        <div class="title-wrap" style="margin-top: 20px;">
          <h3>
            <span class="text">历史数据表</span>
          </h3>
        </div>
        <table v-if="data" border="1" style="margin-top: 20px;width: 100%;">
          <tr>
            <th>时间</th>
            ${dataTableTh}
          </tr>
          ${dataTableContent}
        </table>
      </div>
    </body>
    </html>
  `
}

// base64 转 Blob
export const dataURItoBlob = dataURI => {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length)

  // create a view into the buffer
  var ia = new Uint8Array(ab)

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString })
  return blob
}

// 根据id获取当前结点所在树的路径
export const getPathById = (id, tree, callback) => {
  // 定义变量保存当前结果路径
  var temppath = []
  try {
    /* eslint-disable no-inner-declarations */
    function getNodePath(node) {
      temppath.push(node.SubareaId)

      // 找到符合条件的节点，通过throw终止掉递归
      if (node.SubareaId === id) {
        /* eslint-disable no-throw-literal */
        throw 'GOT IT!'
      }
      if (node.Children && node.Children.length > 0) {
        for (var i = 0; i < node.Children.length; i++) {
          getNodePath(node.Children[i])
        }
        // 当前节点的子节点遍历完依旧没找到，则删除路径中的该节点
        temppath.pop()
      } else {
        // 找到叶子节点时，删除路径当中的该叶子节点
        temppath.pop()
      }
    }
    getNodePath(tree)
  } catch (e) {
    callback(temppath)
  }
}

// 预加载图片
export const preloadImg = imgs => {
  const promiseAll = imgs.map(uri => {
    return new Promise((resolve, rejects) => {
      const img = new Image()
      img.setAttribute('crossOrigin', 'anonymous')
      img.onload = () => {
        resolve(img)
      }
      img.onerror = () => {
        rejects(`图片：${uri}加载失败`)
      }
      img.src = uri
    })
  })
  return Promise.all(promiseAll)
}

/**
 * @description 复制文本至系统剪切板
 * @param {str} 要复制的文本
 * @return
 * @author utopia
 **/
export const copyToClipboard = str => {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  if (selected) {
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}
