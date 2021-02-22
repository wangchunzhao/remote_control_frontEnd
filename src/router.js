import Vue from 'vue'
import Router from 'vue-router'
import VueAnalytics from 'vue-analytics'
let _import = file => () => import('@/views/' + file + '.vue')

Vue.use(Router)

// ============ 路由配置说明 end =============
//          hidden: true        // 当设置 true 的时候该路由不会在侧边栏出现
//          singleMenu: true    // 当设置 true 的时候在侧边栏只显示根路由，不显示子路由
//          meta : {
//              title: 'title'              // 设置该路由在侧边栏和面包屑中展示的名字
//              icon: 'svg-name'            // 设置该路由的图标
//              projectPermissionId: [3]           // 项目权限id，如果有的话说明进入该页面需要权限
//              companyPermissionId: [23]           // 项目权限id，如果有的话说明进入该页面需要权限
//              companyIds: [1]                // 公司id，当前页面是否是只有特定公司才有
//              industry: [1]                 // 行业id 2是商超、1是冷链、3是养殖业
//              customHeader: false         // 是否自定义头部
//              showBackButton: true        // 是否显示返回按钮
//          }
// ============ 路由配置说明 start =============

// 公共部分
import layout from '@/views/layout/Index_'

// #region 登录 start
const login = {
  path: '/login',
  component: _import('user/LoginIndex'),
  name: 'login',
  hidden: true
}
// #endregion 登录 end

// #region 邀请 start
const invite = {
  path: '/invite',
  component: _import('user/invite/Index'),
  name: 'invite',
  hidden: true
}
// #endregion 邀请 end

// #region 邀请成功后显示 的页面 start
const inviteSuccess = {
  path: '/inviteSuccess',
  component: _import('user/invite/InviteSuccess'),
  name: 'inviteSuccess',
  hidden: true
}
// #endregion 邀请成功后显示 的页面 end

const other = {
  path: '/other',
  component: _import('others/AvatarFactory'),
  hidden: true
}

const err403 = {
  path: '/403',
  component: layout,
  redirect: '/403/index',
  hidden: true,
  children: [
    {
      path: 'index',
      component: _import('errorPage/403'),
      name: 'err403',
      hidden: true,
      meta: { customHeader: true }
    }
  ]
}

// #region 企业注册 start
const companyRegister = {
  path: '/companyRegister',
  component: _import('user/CompanyRegister'),
  name: 'companyRegister',
  hidden: true
}
// #endregion 企业注册 end

// #region 测试页面 start
const Test = {
  path: '/test',
  component: _import('others/Test'),
  name: 'Test',
  hidden: true
}
// #endregion 测试页面 end

// #region 忘记密码 start
const forgetPwd = {
  path: '/forgetPwd',
  component: _import('user/ForgetPwd'),
  name: 'forgetPwd',
  hidden: true
}
// #endregion 忘记密码 end

// #region 平面图 start
const plan = {
  path: '/plan',
  component: _import('plan/Plan'),
  name: 'plan',
  meta: {
    title: '平面图V2'
  }
}
// #endregion 平面图 end

// #region 重定向 start
const redirect = {
  path: '/redirect',
  component: layout,
  hidden: true,
  children: [
    {
      path: '/redirect/:path*',
      name: 'redirect',
      component: _import('redirect/Index')
    }
  ]
}
// #endregion 重定向 end

// #region 触发全局路由卫士 start
const triggerRouterGuard = {
  path: '/triggerRouterGuard',
  name: 'triggerRouterGuard',
  component: _import('other/TriggerRouterGuard')
}
// #endregion 触发全局路由卫士 end

// #region 地图 start
const map = {
  path: '/map',
  hidden: true,
  component: _import('layout/MapLoyout'),
  redirect: 'index',
  children: [
    {
      path: 'index',
      name: 'mapIndex',
      component: _import('map/index'),
      meta: { title: '地图', customHeader: true }
    }
  ]
}
// #endregion 地图 end

// #region 数据下载 start
const dataDownload = {
  path: '/dataDownload',
  component: layout,
  name: 'dataDownloadIndex',
  redirect: '/dataDownload/index',
  singleMenu: true,
  meta: {
    title: '数据下载',
    icon: 'excelshujuxiazai',
    companyPermissionId: [102]
  },
  children: [
    {
      path: 'index',
      component: _import('dataDownload/Index'),
      name: 'dataDownload',
      meta: { title: '数据下载', companyPermissionId: [102] }
    }
  ]
}
// #endregion 数据下载 end

// #region 数据下载 start
const dataDownloadInBusiness = {
  path: '/dataDownload',
  component: layout,
  name: 'dataDownloadIndex',
  redirect: '/dataDownload/index',
  singleMenu: true,
  meta: {
    title: '数据下载',
    icon: 'excelshujuxiazai',
    projectPermissionId: [110]
  },
  children: [
    {
      path: 'index',
      component: _import('dataDownload/Index'),
      name: 'dataDownload',
      meta: { title: '数据下载' }
    }
  ]
}
// #endregion 数据下载 end

// #region 用户设置 start
const userSet = {
  path: '/userSet',
  component: layout,
  name: 'userSet',
  redirect: '/userSet/myInformation',
  hidden: true,
  meta: { title: '用户配置' },
  children: [
    {
      path: 'myInformation',
      component: _import('role/myInformation'),
      name: 'myInformation',
      hidden: true,
      meta: { title: '我的信息' }
    }
  ]
}
// #endregion 用户设置 end

// #region 业务看板 start
const dashboard = {
  path: '/dashboard',
  component: layout,
  singleMenu: true,
  redirect: '/dashboard/index',
  meta: {
    icon: 'outline',
    title: '业务看板'
  },
  children: [
    {
      path: 'index',
      name: 'Dashboard',
      component: _import('dashboard/index'),
      meta: { title: '业务看板', icon: 'outline', customHeader: true }
    }
  ]
}
// #endregion 业务看板 end

// #region 能耗管理 start
const energyManage = {
  path: '/energyManage',
  component: layout,
  name: 'energyManage',
  meta: {
    title: '能耗管理',
    icon: 'piechart-circle-fil',
    projectPermissionId: [119],
    industry: [2]
  },
  children: [
    {
      path: 'preview',
      component: _import('energyManage/preview/Index'),
      name: 'energyManage_Preview',
      meta: { title: '能耗概览', projectPermissionId: [120] }
    },
    {
      path: 'analyze',
      component: _import('energyManage/analyze/Index'),
      name: 'energyManage_Analyze',
      meta: { title: '用能分析', projectPermissionId: [120] }
    },
    {
      path: 'electricityLoad',
      component: _import('energyManage/electricityLoad/Index'),
      name: 'energyManage_ElectricityLoad',
      meta: { title: '用电负荷', projectPermissionId: [120] }
    },
    {
      path: 'dataConfig',
      component: _import('energyManage/dataConfig/Index'),
      name: 'dataConfig',
      meta: { title: '数据设置', projectPermissionId: [120] }
    },
    {
      path: 'storeElectricity',
      component: _import('energyManage/storeElectricity/Index'),
      name: 'storeElectricity',
      meta: {
        title: '商户用电',
        companyIds: [2],
        projectPermissionId: [153, 155]
      }
    },
    {
      path: 'dataEnter',
      component: _import('energyManage/dataEnter/Index'),
      name: 'energyManage_DataEnter',
      meta: { title: '数据录入', projectPermissionId: [122] }
    }
  ]
}
// #endregion 能耗管理 end

// #region 维修保养 start
const repairMaintain = {
  path: '/repairMaintain',
  component: layout,
  name: 'repairMaintain',
  redirect: '/repairMaintain/repairOrder',
  meta: { title: '维修保养', icon: 'wrench-fill', projectPermissionId: [39] },
  children: [
    {
      path: 'repairOrder',
      name: 'repairOrder',
      component: _import('repair/RepairIndex'),
      meta: { title: '维修工单', projectPermissionId: [40] }
    },
    {
      path: 'pointEntry',
      component: _import('keep/pointEntry'),
      name: 'pointEntry',
      meta: { title: '点检计划', permissionsId: 19 }
    },
    {
      path: 'repairDetails',
      component: _import('repair/repairDetails'),
      name: 'repairDetails',
      hidden: true,
      meta: { title: '维修详情', showBackButton: true }
    }
  ]
}
// #endregion 维修保养 end

// #region 报警管理 start
const alarmManage = {
  path: '/alarmManage',
  component: layout,
  singleMenu: true,
  redirect: '/alarmManage/index',
  meta: {
    icon: 'bell-fill',
    title: '报警管理',
    projectPermissionId: [34]
  },
  children: [
    {
      path: 'index',
      name: 'alarmManageIndex',
      component: _import('alarmManage/Index'),
      meta: { title: '报警管理', projectPermissionId: [34], customHeader: true }
    },
    {
      path: 'thresholdAlarmEdit',
      component: _import('alarmStrategy/thresholdAlarm/StrategyEdit'),
      name: 'thresholdAlarmEditInBusiness',
      hidden: true,
      meta: {
        title: '报警策略配置',
        showBackButton: true,
        projectPermissionId: [38]
      }
    },
    {
      path: 'alarmPushStatistical',
      name: 'alarmPushStatistical',
      component: _import('alarmManage/alarmPushStatistical/Index'),
      meta: {
        title: '推送统计',
        showBackButton: true,
        projectPermissionId: [131]
      }
    }
  ]
}
// #endregion 报警管理 end

// #region 事件中心 start
const eventCenter = {
  path: '/eventCenter',
  component: layout,
  singleMenu: true,
  redirect: '/eventCenter/index',
  meta: {
    icon: 'file-copy-fill',
    title: '事件中心',
    projectPermissionId: [123]
  },
  children: [
    {
      path: 'index',
      name: 'eventCenterIndex',
      component: _import('eventCenter/Index'),
      meta: {
        title: '事件中心',
        customHeader: true,
        projectPermissionId: [123]
      }
    },
    {
      path: 'eventNoticeEdit',
      component: _import('alarmStrategy/eventNotice/EventNoticeEdit'),
      name: 'eventNoticeEdit',
      hidden: true,
      meta: {
        title: '配置事件通知',
        showBackButton: true,
        projectPermissionId: [126]
      }
    }
  ]
}
// #endregion 事件中心 end

// #region 报警管理 start
const alarmManageWithAllProject = {
  path: '/alarmManageWithAllProject',
  component: _import('layout/MapLoyout'),
  hidden: true,
  redirect: '/alarmManageWithAllProject/index',
  meta: { title: '报警管理', companyPermissionId: [114] },
  children: [
    {
      path: 'index',
      name: 'alarmManageWithAllProject',
      component: _import('alarmManage/Index'),
      meta: {
        title: '报警管理',
        customHeader: true,
        showBackButton: true,
        companyPermissionId: [114]
      }
    }
  ]
}
// #endregion 报警管理 end

// #region 设备监测 start
const monitor = {
  path: '/monitor',
  component: layout,
  name: 'monitor',
  // singleMenu: true,
  meta: {
    title: '设备监测',
    icon: 'dashboard-fill',
    projectPermissionId: [26]
  },
  children: [
    {
      path: 'dashboard',
      component: _import('monitor/dashboard/Index'),
      name: 'monitorDashboard',
      meta: {
        title: '仪表盘',
        icon: 'jiankongcopy',
        projectPermissionId: [27],
        industry: [2, 3, 4]
      }
    },
    {
      path: 'transportMonitor',
      component: _import('monitor/transportMonitor/Index'),
      name: 'transportMonitor',
      hidden: true,
      meta: { title: '运输监测' }
    },
    {
      path: 'warehouse',
      component: _import('monitor/Warehouse'),
      name: 'warehouse',
      hidden: true,
      meta: {
        title: '仓库监测',
        projectPermissionId: [27],
        customHeader: true
      }
    },
    {
      path: 'passenger',
      component: _import('monitor/passengerStatistics/index'),
      name: 'passenger',
      redirect: '/monitor/passenger/statisticsMap',
      hidden: true,
      meta: { title: '客流统计', projectPermissionId: [27] },
      children: [
        {
          path: 'calendar',
          component: _import('monitor/passengerStatistics/passenger_count'),
          name: 'calendar',
          meta: { title: '客流日历' }
        },
        {
          path: 'heatmap',
          component: _import('monitor/passengerStatistics/passenger_heatmap'),
          name: 'heatmap',
          meta: { title: '热力图' }
        },
        {
          path: 'statisticsMap',
          component: _import('monitor/passengerStatistics/passenger_count'),
          name: 'statisticsMap',
          meta: { title: '统计图' }
        }
      ]
    },
    {
      path: 'cold',
      component: _import('monitor/refrigerationSystem/Index'),
      name: 'refrigerationSystem',
      hidden: true,
      meta: {
        title: '冷冻冷藏',
        customHeader: true,
        projectPermissionId: [27],
        from: 'monitor',
        to: 'cold'
      }
    },
    {
      path: 'air',
      component: _import('monitor/Common'),
      name: 'air',
      hidden: true,
      meta: {
        title: '暖通空调',
        projectPermissionId: [27],
        customHeader: true
      }
    },
    {
      path: 'freshbaked',
      component: _import('monitor/Common'),
      name: 'freshbaked',
      hidden: true,
      meta: {
        title: '生鲜烘焙',
        customHeader: true,
        projectPermissionId: [27]
      }
    },
    {
      path: 'elevatormonitor',
      component: _import('monitor/Common'),
      name: 'elevatormonitor',
      hidden: true,
      meta: {
        title: '电梯监控',
        customHeader: true,
        projectPermissionId: [27]
      }
    },
    {
      path: 'firesystem',
      component: _import('monitor/Common'),
      name: 'firesystem',
      hidden: true,
      meta: {
        title: '消防系统',
        customHeader: true,
        projectPermissionId: [27]
      }
    },
    {
      path: 'relicBasicInfo',
      component: _import('monitor/relicBasicInfo/Index'),
      name: 'relicBasicInfo',
      hidden: true,
      meta: {
        title: '基本信息'
      }
    },
    {
      path: 'devicePointList',
      component: _import('monitor/devicePointList/Index'),
      name: 'devicePointList',
      hidden: true,
      meta: {
        title: '所有参数',
        customHeader: true
      }
    },
    {
      path: 'carTrack',
      component: _import('monitor/transportMonitor/CarTrack'),
      name: 'carTrack',
      hidden: true,
      meta: { title: '车辆轨迹', showBackButton: true }
    },
    {
      path: 'waybillTrack',
      component: _import('monitor/transportMonitor/WaybillTrack'),
      name: 'waybillTrack',
      hidden: true,
      meta: { title: '运单轨迹', showBackButton: true }
    },
    {
      path: 'carDetail',
      component: _import('monitor/transportMonitor/CarDetail'),
      name: 'carDetail',
      hidden: true,
      meta: { title: '车辆详情', from: 'monitor', showBackButton: true }
    },
    {
      path: 'unit',
      component: _import('monitor/Common'),
      name: 'unit',
      hidden: true,
      meta: { title: '机组', from: 'monitor', to: 'unit', customHeader: true }
    },
    {
      path: 'videoMonitor',
      component: _import('monitor/videoMonitorSystem/Index'),
      name: 'videoMonitor',
      hidden: true,
      meta: {
        title: '视频监控',
        from: 'monitor',
        projectPermissionId: [27],
        customHeader: true
      }
    },
    // pageQuery为以下三个页面title显示的判断依据
    {
      path: 'security',
      component: _import('monitor/Common'),
      name: 'security',
      hidden: true,
      meta: {
        title: '防盗报警',
        pagequery: 1,
        projectPermissionId: [27],
        from: 'monitor',
        customHeader: true
      }
    },
    {
      path: 'supplypower',
      component: _import('monitor/Common'),
      name: 'supplypower',
      hidden: true,
      meta: {
        title: '配电质量',
        projectPermissionId: [27],
        pagequery: 2,
        from: 'monitor',
        customHeader: true
      }
    },
    {
      path: 'lightsystem',
      component: _import('monitor/Common'),
      name: 'lightsystem',
      hidden: true,
      meta: {
        title: '照明系统',
        projectPermissionId: [27],
        pagequery: 3,
        from: 'monitor',
        customHeader: true
      }
    },
    {
      path: 'environmentMonitor',
      component: _import('monitor/Common'),
      name: 'environmentMonitor',
      hidden: true,
      meta: {
        title: '环境监控',
        from: 'monitor',
        customHeader: true,
        projectPermissionId: [27]
      }
    },
    {
      path: 'ontologyMonitor',
      component: _import('monitor/Common'),
      name: 'ontologyMonitor',
      hidden: true,
      meta: {
        title: '本体监测',
        customHeader: true,
        projectPermissionId: [27]
      }
    },
    {
      path: 'infomationPublish',
      component: _import('monitor/infomationPublish/Index'),
      name: 'infomationPublish',
      hidden: true,
      meta: {
        title: '信息发布',
        projectPermissionId: [27]
      }
    },
    {
      path: 'parkManage',
      component: _import('monitor/parkManage/Index'),
      name: 'parkManage',
      hidden: true,
      meta: {
        title: '停车管理',
        // customHeader: true,
        projectPermissionId: [27]
      }
    },
    {
      path: 'commonTable',
      component: _import('monitor/Common'),
      name: 'commonTable',
      hidden: true,
      meta: { title: '列表展示', customHeader: true }
    },
    {
      path: 'audio',
      component: _import('monitor/audio'),
      name: 'audio',
      hidden: true,
      meta: { title: '音响广播', from: 'monitor', projectPermissionId: [27] }
    },
    {
      path: 'repairSystem',
      component: _import('others/RepairSystem'),
      name: 'repairSystem',
      hidden: true,
      meta: { title: '平台运维', icon: 'jiankongcopy' }
    },
    {
      path: 'configuration',
      hidden: true,
      component: _import('configuration/Index'),
      name: 'planShow',
      meta: { title: '组态', customHeader: true }
    },
    {
      path: 'planShow',
      component: _import('plan/planShow'),
      name: 'planShow',
      meta: { title: '平面图', projectPermissionId: [27], industry: [2, 3, 4] }
    },
    {
      path: 'planCreate',
      component: _import('plan/planCreate'),
      name: 'planCreate',
      hidden: true,
      meta: { title: '平面图编辑', projectPermissionId: [32] }
    }
  ]
}
// #endregion 设备监测 end

// #region 项目管理 start
const projectManage = {
  path: '/projectManage',
  component: layout,
  name: 'projectManage',
  redirect: '/projectManage/index',
  meta: { title: '项目管理', icon: 'xiangmuguanli', companyPermissionId: [4] },
  singleMenu: true,
  children: [
    {
      path: 'index',
      component: _import('projectManage/Index'),
      name: 'projectManageIndex',
      meta: { title: '项目管理', companyPermissionId: [5] },
      hidden: true
    }
  ]
}
// #endregion 项目管理 end

// #region 权限管理 start
const permissions = {
  path: '/permissions',
  component: layout,
  name: 'permissions',
  redirect: '/permissions/index',
  meta: { title: '角色与权限', icon: 'lock', companyPermissionId: [16] },
  singleMenu: true,
  children: [
    {
      path: 'index',
      component: _import('permissions/Index'),
      name: 'permissionsIndex',
      meta: { title: '权限管理', companyPermissionId: [17] },
      hidden: true
    }
  ]
}
// #endregion 权限管理 end

// #region 成员管理 start
const personnelManage = {
  path: '/personnelManage',
  component: layout,
  name: 'personnelManage',
  singleMenu: true,
  redirect: '/personnelManage/member',
  meta: { title: '公司成员', icon: 'team1', companyPermissionId: [11] },
  children: [
    {
      path: 'member',
      component: _import('personnelManage/Member'),
      name: 'member',
      hidden: true,
      meta: { title: '公司成员', companyPermissionId: [12] }
    }
  ]
}
// #endregion 成员管理 end

// #region 资产管理 start
const assetManage = {
  path: '/assetManage',
  name: 'assetManage',
  component: layout,
  meta: { title: '资产管理', icon: 'database-fill', projectPermissionId: [42] },
  children: [
    {
      path: 'assetList',
      name: 'assetList',
      component: _import('assetManage/AssetList'),
      meta: { title: '资产列表', projectPermissionId: [43] }
    },
    {
      path: 'validation',
      name: 'assetValidation',
      component: _import('assetManage/AssetValidation/Index'),
      meta: { title: '验证校验', projectPermissionId: [105], industry: [1] }
    },
    {
      path: 'classifyDeploy',
      name: 'classifyDeploy',
      component: _import('assetManage/ClassifyDeploy'),
      meta: { title: '分类配置', projectPermissionId: [113] }
    }
  ]
}
// #endregion 资产管理 end

// #region 设备连接平台下的终端管理 start
const terminalManage = {
  path: '/terminalManage',
  component: layout,
  name: 'terminalManage',
  redirect: '/terminalManage/index',
  meta: {
    title: '终端管理',
    icon: 'zhongduanguanli-mian',
    companyPermissionId: [81]
  },
  children: [
    {
      path: 'gateway',
      component: _import('terminalManage/gateway/Index'),
      name: 'gatewayIndex',
      meta: {
        title: '网关',
        customHeader: true
      }
    },
    {
      path: 'recorder',
      component: _import('terminalManage/Recorder'),
      name: 'recorderIndex',
      meta: { title: '记录仪', companyPermissionId: [88] }
    },
    {
      path: 'collector',
      component: _import('terminalManage/Collector'),
      name: 'collectorIndex',
      meta: { title: '采集器', companyPermissionId: [91] }
    },
    {
      path: 'sensor',
      component: _import('terminalManage/Sensor'),
      name: 'sensorIndex',
      meta: { title: '传感器', companyPermissionId: [95] }
    },
    {
      path: 'cameraManage',
      component: _import('terminalManage/cameraManage/Index'),
      name: 'collectorManageIndex',
      meta: { title: '摄像头', companyPermissionId: [135] }
    },
    {
      path: 'concentratorManage',
      component: _import('terminalManage/concentratorManage/Index'),
      name: 'concentrator',
      meta: { title: '集中器', companyIds: [2], companyPermissionId: [147] }
    },
    {
      path: 'terminalTrack',
      component: _import('terminalManage/Track'),
      name: 'terminalTrack',
      hidden: true,
      meta: { title: '轨迹查询', showBackButton: true }
    },
    {
      path: 'slaveStationDetail',
      component: _import('terminalManage/gateway/slaveStationDetail/Index'),
      name: 'slaveStationDetail',
      hidden: true,
      meta: { customHeader: true }
    },
    {
      path: 'gatewayDetail',
      component: _import('terminalManage/gateway/gatewayDetail/Index'),
      name: 'gatewayDetail',
      hidden: true,
      meta: { customHeader: true }
    }
  ]
}
// #endregion 设备连接平台下的终端管理 end

// #region 业务平台下的终端管理 start
const terminalManageInBusiness = {
  path: '/terminalManage',
  component: layout,
  name: 'terminalManage',
  redirect: '/terminalManage/index',
  meta: {
    title: '终端管理',
    icon: 'zhongduanguanli-mian',
    projectPermissionId: [60, 243, 244, 245, 246]
  },
  children: [
    {
      path: 'gateway',
      component: _import('terminalManage/gateway/Index'),
      name: 'gatewayIndex',
      meta: {
        title: '网关',
        projectPermissionId: [243, 244, 245, 246],
        customHeader: true
      }
    },
    {
      path: 'recorder',
      component: _import('terminalManage/Recorder'),
      name: 'recorderIndex',
      meta: { title: '记录仪', projectPermissionId: [67] }
    },
    {
      path: 'collector',
      component: _import('terminalManage/Collector'),
      name: 'collectorIndex',
      meta: { title: '采集器', projectPermissionId: [70] }
    },
    {
      path: 'sensor',
      component: _import('terminalManage/Sensor'),
      name: 'sensorIndex',
      meta: { title: '传感器', projectPermissionId: [74] }
    },
    {
      path: 'cameraManage',
      component: _import('terminalManage/cameraManage/Index'),
      name: 'collectorManageIndex',
      meta: { title: '摄像头', projectPermissionId: [132] }
    },
    {
      path: 'concentratorManage',
      component: _import('terminalManage/concentratorManage/Index'),
      name: 'concentrator',
      meta: { title: '集中器', companyIds: [2], projectPermissionId: [150] }
    },
    {
      path: 'terminalTrack',
      component: _import('terminalManage/Track'),
      name: 'terminalTrack',
      hidden: true,
      meta: { title: '轨迹查询', showBackButton: true }
    },
    {
      path: 'gatewayDetail',
      component: _import('terminalManage/gateway/gatewayDetail/Index'),
      name: 'gatewayDetail',
      hidden: true,
      meta: { customHeader: true }
    },
    {
      path: 'slaveStationDetail',
      component: _import('terminalManage/gateway/slaveStationDetail/Index'),
      name: 'slaveStationDetail',
      hidden: true,
      meta: { customHeader: true }
    }
  ]
}
// #endregion 业务平台下的终端管理 end

// #region 报警配置 start
const alarmConfig = {
  path: '/alarmConfig',
  component: layout,
  name: 'alarmConfig',
  redirect: '/alarmConfig/index',
  singleMenu: true,
  meta: { title: '报警配置', icon: 'baojingshezhi', companyPermissionId: [80] },
  children: [
    {
      path: 'index',
      component: _import('alarmStrategy/Index'),
      name: 'alarmStrategy',
      hidden: true,
      meta: { title: '报警策略', companyPermissionId: [80] }
    },
    {
      path: 'thresholdAlarmEdit',
      component: _import('alarmStrategy/thresholdAlarm/StrategyEdit'),
      name: 'thresholdAlarmEdit',
      hidden: true,
      meta: {
        title: '报警策略配置',
        showBackButton: true,
        companyPermissionId: [109]
      }
    },
    {
      path: 'eventNoticeEdit',
      component: _import('alarmStrategy/eventNotice/EventNoticeEdit'),
      name: 'eventNoticeEdit',
      hidden: true,
      meta: {
        title: '配置事件通知',
        showBackButton: true,
        companyPermissionId: [128]
      }
    }
  ]
}
// #endregion 报警配置 end

// #region 项目配置 start
const projectConfig = {
  path: '/projectConfig',
  component: layout,
  name: 'projectConfig',
  redirect: '/projectConfig/basicInfo',
  meta: { title: '项目配置', icon: 'setting-fill', projectPermissionId: [48] },
  children: [
    {
      path: 'basicInfo',
      component: _import('projectConfig/basicInfo/Index'),
      name: 'basicInfo',
      meta: { title: '基本信息', projectPermissionId: [49] }
    },
    {
      path: 'member',
      component: _import('projectConfig/projectMember/Index'),
      name: 'projectMember',
      meta: { title: '项目成员', projectPermissionId: [55] }
    },
    {
      path: 'deviceList',
      component: _import('projectConfig/deviceList/Index'),
      name: 'deviceList',
      meta: { title: '设备列表', projectPermissionId: [51] }
    },
    {
      path: 'pointAssociate',
      component: _import('projectConfig/pointAssociate/Template'),
      name: 'pointAssociate',
      meta: { title: '点位关联', projectPermissionId: [98, 100] }
    }
  ]
}
// #endregion 项目配置 end

// #region 维保管理 start
const maintenanceManage = {
  path: '/maintenanceManage',
  component: layout,
  name: 'maintenanceManage',
  meta: { title: '维保管理', icon: 'wrench-fill', companyPermissionId: [23] },
  children: [
    {
      path: 'maintenanceTeam',
      component: _import('maintenanceManage/maintenanceTeam/Index'),
      name: 'maintenanceTeam',
      meta: { title: '维保团队' }
    },
    {
      path: 'pact',
      component: _import('maintenanceManage/pact/Index'),
      name: 'maintenancePact',
      meta: { title: '维保合同' }
    },
    {
      path: 'template',
      component: _import('maintenanceManage/template/Index'),
      name: 'maintenanceTemplate',
      meta: { title: '保养模板' }
    },
    {
      path: 'templateDetail',
      component: _import('maintenanceManage/template/TemplateDetail'),
      name: 'maintenanceTemplateDetail',
      hidden: true,
      meta: { title: '保养模板详情', customHeader: true }
    },
    {
      path: 'order',
      component: _import('maintenanceManage/order/Index'),
      name: 'maintenanceOrder',
      meta: { title: '维保工单' }
    },
    {
      path: 'repairDetails',
      component: _import('maintenanceManage/order/RepairDetail'),
      name: 'maintenanceManage_repairDetail',
      hidden: true,
      meta: { title: '维修详情', showBackButton: true }
    }
  ]
}
// #endregion 维保管理 end

// #region 应用管理 start
const applicationManage = {
  path: '/applicationManage',
  component: layout,
  name: 'applicationManage',
  redirect: '/applicationManage/index',
  singleMenu: true,
  meta: {
    title: '应用管理',
    icon: 'appstore-fill',
    companyPermissionId: [24]
  },
  children: [
    {
      path: 'index',
      component: _import('applicationManage/Index'),
      name: 'applicationManageIndex',
      meta: { title: '应用管理' }
    }
  ]
}
// #endregion 应用管理 end

// #region 设备管理 start
const deviceManage = {
  path: '/deviceManage',
  component: layout,
  name: 'deviceManage',
  redirect: '/deviceManage/index',
  singleMenu: true,
  meta: {
    title: '设备管理',
    icon: 'asset',
    companyPermissionId: [140]
  },
  children: [
    {
      path: 'index',
      component: _import('deviceManage/Index'),
      name: 'deviceManageIndex',
      meta: { title: '设备管理' }
    }
  ]
}
// #endregion 设备管理 end
// #region 资产管理 start
const assetManagement = {
  path: '/assetManagement',
  name: 'assetManagement',
  component: layout,
  meta: {
    title: '资产管理',
    icon: 'database-fill',
    companyPermissionId: [141]
  },
  children: [
    {
      path: 'assetList',
      name: 'assetList',
      component: _import('assetManagement/assetList/Index'),
      meta: {
        title: '资产列表',
        customHeader: true,
        companyPermissionId: [142]
      }
    }
  ]
}
// #endregion 资产管理 end

// #region 系统管理平台下的日志管理 start
const logManage = {
  path: '/logManage',
  component: layout,
  name: 'logManage',
  redirect: '/logManage/index',
  singleMenu: true,
  meta: {
    title: '操作日志',
    icon: 'file-text-fill',
    companyPermissionId: [25]
  },
  children: [
    {
      path: 'index',
      component: _import('logManage/Index'),
      name: 'logManageIndex',
      meta: { title: '操作日志', companyPermissionId: [25] }
    }
  ]
}
// #endregion 系统管理平台下的日志管理 end

// #region 业务运营平台下的日志管理 start
const logManageInBusiness = {
  path: '/logManage',
  component: layout,
  name: 'logManage',
  redirect: '/logManage/index',
  singleMenu: true,
  meta: {
    title: '操作日志',
    icon: 'file-text-fill',
    projectPermissionId: [77]
  },
  children: [
    {
      path: 'index',
      component: _import('logManage/Index'),
      name: 'logManageIndex',
      meta: { title: '操作日志', projectPermissionId: [78] }
    }
  ]
}
// #endregion 业务运营平台下的日志管理 end

// #region 统计分析 start
const analysis = {
  path: '/analysis',
  component: layout,
  name: 'analysisDashboard',
  redirect: '/analysis/home',
  singleMenu: true,
  meta: { title: '统计分析', icon: 'count', companyPermissionId: [3] },
  children: [
    {
      path: 'home',
      component: _import('analysis/home/index'),
      name: 'analysisIndex',
      meta: { title: '统计分析' }
    },
    {
      path: 'alarm',
      component: _import('analysis/alarm/Index'),
      name: 'analysisAlarm',
      meta: { showBackButton: true, title: '报警数量统计报告' }
    },
    {
      path: 'repair',
      component: _import('analysis/repair/Index'),
      name: 'analysisRepair',
      meta: { showBackButton: true, title: '维修数量统计报告' }
    },
    {
      path: 'electricity',
      component: _import('analysis/electricity/Index'),
      name: 'analysisElectricity',
      meta: { showBackButton: true, title: '用电量统计报告' }
    },
    {
      path: 'storeElectricity',
      component: _import('analysis/storeElectricity/Index'),
      name: 'analysisStoreElectricity',
      meta: { showBackButton: true, title: '商户用电统计报告' }
    }
  ]
}
// #endregion 统计分析 end

export const constRouter = [
  login,
  invite,
  inviteSuccess,
  companyRegister,
  Test,
  forgetPwd,
  userSet,
  map,
  alarmManageWithAllProject,
  redirect,
  triggerRouterGuard,
  plan,
  other,
  err403
]

// 业务运营平台的路由
export const businessRouter = [
  dashboard,
  monitor,
  alarmManage,
  eventCenter,
  repairMaintain,
  energyManage,
  assetManage,
  projectConfig,
  terminalManageInBusiness,
  logManageInBusiness,
  dataDownloadInBusiness,
  { path: '*', redirect: '/403/index', hidden: true }
]

// 数据分析平台的路由
export const dataAnalysisRouter = [
  analysis,
  dataDownload,
  { path: '*', redirect: '/403/index', hidden: true }
]

// 系统管理平台的路由
export const systemManageRouter = [
  projectManage,
  personnelManage,
  permissions,
  assetManagement,
  maintenanceManage,
  applicationManage,
  deviceManage,
  logManage,
  { path: '*', redirect: '/403/index', hidden: true }
]

// 设备连接平台的路由
export const deviceConnectRouter = [
  alarmConfig,
  terminalManage,
  { path: '*', redirect: '/403/index', hidden: true }
]

const createRouter = () =>
  new Router({
    routes: [...constRouter]
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

Vue.use(VueAnalytics, {
  id: 'UA-153978473-1',
  checkDuplicatedScript: true,
  router
})

export default router
