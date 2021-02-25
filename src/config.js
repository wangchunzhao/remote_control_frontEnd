const hostProd = 'https://sinocold.net:8443'
// const hostProd = 'http://dev.sinocold.com:8092'
// const hostProd = 'http://192.168.6.194:2216'
// const hostProd = 'http://dev.sinocold.com:8090'
// const hostProd = 'http://localhost:2216'

const hostDev = 'http://dev.sinocold.com:8092'
// const hostDev = 'https://sinocold.net:8443'
// const hostDev = 'http://192.168.6.194:2216'
// const hostDev = 'http://192.168.6.180:2216'

// ===================================================

// 测试端口是8083，release是8081
const baseUriProd = 'https://yun.sinocold.net:5001'
// const baseUriProd = 'http://152.136.134.93:9183'
// const baseUriProd = 'http://192.168.6.13:30863'
// const baseUriProd = 'http://dev.sinocold.com:8083'
// const baseUriProd = 'http://localhost:9183'
// const baseUriProd = 'http://dev.sinocold.com:5003'
// const baseUriProd = 'http://192.168.6.180:5003'

// const baseUriDev = 'http://dev.sinocold.com:8083'
// const baseUriDev = 'http://152.136.134.93:9183'
// const baseUriDev = 'http://192.168.6.13:30863'
const baseUriDev = 'https://yun.sinocold.net:5001'
// const baseUriDev = 'http://192.168.6.180:5200'
// const baseUriDev = 'http://192.168.6.194:5003'

const HCBaseUriProd = 'http://192.168.6.180:5200'
const HCBaseUriDev = 'http://192.168.6.180:5200'

export const _host = process.env.NODE_ENV === 'production' ? hostProd : hostDev
export const BASE_URI =
  process.env.NODE_ENV === 'production' ? baseUriProd : baseUriDev

//海尔开利接口地址
export const HC_BASE_URI =
  process.env.NODE_ENV === 'production' ? HCBaseUriProd : HCBaseUriDev

export const PROJECT_NAME = 'CoolCare-PC'

// 数据大屏地址
// global.DATAV_PROJECT_URL =
//   process.env.NODE_ENV === 'production'
//     ? 'https://yun.sinocold.net/DataV'
//     : `http://dev.sinocold.com:30392` // 测试环境
global.DATAV_PROJECT_URL = `http://dev.sinocold.com:30392`

global._host = _host
global.BASE_URI = BASE_URI
global.HC_BASE_URI = HC_BASE_URI
global.PROJECT_URLPROD = baseUriProd

global.PLATFORM = {
  business: 'BUSINESS', // 业务运营
  deviceConnect: 'DEVICE_CONNECT', // 设备连接
  systemManage: 'SYSTEM_MANAGE', // 系统管理
  dataAnalysis: 'DATA_ANALYSIS' // 数据分析
}
