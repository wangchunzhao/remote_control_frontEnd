export const PLATFORM = {
  business: 'BUSINESS', // 业务运营
  deviceConnect: 'DEVICE_CONNECT', // 设备连接
  systemManage: 'SYSTEM_MANAGE', // 系统管理
  dataAnalysis: 'DATA_ANALYSIS' // 数据分析
}

export const industryOptions = [
  {
    label: '冷链物流',
    value: 1
  },
  {
    label: '商超连锁',
    value: 2
  },
  {
    label: '农业养殖',
    value: 3
  },
  {
    label: '文物监测',
    value: 4
  }
]

// 网关波特率选项
export const baudRateOptions = [
  {
    value: '75',
    label: '75'
  },
  {
    value: '110',
    label: '110'
  },
  {
    value: '300',
    label: '300'
  },
  {
    value: '600',
    label: '600'
  },
  {
    value: '1200',
    label: '1200'
  },
  {
    value: '2400',
    label: '2400'
  },
  {
    value: '6',
    label: '4800'
  },
  {
    value: '9600',
    label: '9600'
  },
  {
    value: '14400',
    label: '14400'
  },
  {
    value: '19200',
    label: '19200'
  },
  {
    value: '38400',
    label: '38400'
  },
  {
    value: '56000',
    label: '56000'
  },
  {
    value: '57600',
    label: '57600'
  },
  {
    value: '115200',
    label: '115200'
  },
  {
    value: '128000',
    label: '128000'
  }
]
// 网关数据位选项
export const dataBitOptions = [
  {
    value: 5,
    label: '5'
  },
  {
    value: 6,
    label: '6'
  },
  {
    value: 7,
    label: '7'
  },
  {
    value: 8,
    label: '8'
  }
]

// 网关校验位选项
export const checkBitOptions = [
  {
    value: 'N',
    label: 'N'
  },
  {
    value: 'O',
    label: 'O'
  },
  {
    value: 'E',
    label: 'E'
  }
]

// 网关停止位选项
export const stopBitOptions = [
  {
    value: '1',
    label: '1'
  },
  {
    value: '0.5',
    label: '0.5'
  },
  {
    value: '1.5',
    label: '1.5'
  },
  {
    value: '2',
    label: '2'
  }
]
