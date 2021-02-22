<template>
  <div id="amap-cointainer" class="mymap" v-loading="loading">
    <div id="map-container" />
    <Sidebar
      :handleClick="setCenter"
      :show-alarm="showAlarm"
      :show-repair="showRepair"
      :userGatewayList="userGatewayList"
      :show-maintenance="showMaintenance"
    />
    <ConfigDialog ref="configDialog" @change="handleSetChange" />

    <div
      v-permission="[130]"
      @click="handleOpenSetDialog"
      class="setting-handle-button"
    >
      <c-svg name="setting-fill"> </c-svg>
    </div>
    <PactSignDialog @refresh="handlePactSign" ref="pactSignDialog" />
    <div
      class="empty-gateway"
      v-if="isEmptyAccount && (userGatewayList && !userGatewayList.length)"
    >
      <div style="text-align: center">
        <img
          src="https://cdn.sinocold.net/images_app/%E7%A9%BA%E9%A1%B5%E9%9D%A2.png"
          alt=""
        />
        <div class="desc">暂无网关数据</div>
        <el-button
          @click.native="() => $refs.dialogAddGateway.openDialog()"
          type="primary"
          style="width: 240px;"
          >添 加</el-button
        >
      </div>
      <DialogAddGateway
        projectDisabled
        :showSuccess="false"
        ref="dialogAddGateway"
        @refresh="afterGatewayAdd"
      />
    </div>
  </div>
</template>
<script>
import { getPathById } from '@/utils/index'
import Sidebar from './Sidebar'
import ConfigDialog from './ConfigDialog'
import { getCompanyTotalList } from '@/api/companyTotal'
import { maintainContractList } from '@/api/maintainContract'
import PactSignDialog from './PactSignDialog'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { storageName } from '@/utils/index'
import { getDataScreenCookie, removeDataScreenCookie } from '@/utils/auth'
import DialogAddGateway from '@/views/terminalManage/gateway/gatewayList/DialogAdd'
import { showDeviceList } from '@/api/device_new'
import { updatePreferences } from '@/api/preferences'
import { resetRouter } from '@/router'

export default {
  components: {
    Sidebar,
    ConfigDialog,
    PactSignDialog,
    DialogAddGateway
  },
  data() {
    return {
      map: '',
      loading: true,
      opts: {
        width: 250, // 信息窗口宽度
        height: 122, // 信息窗口高度
        enableMessage: true // 设置允许信息窗发送短息
      },
      gatewayId: undefined,
      showAlarm: false,
      showRepair: false,
      showMaintenance: false,
      dataScreen: null,

      userGatewayList: null,
      notificationInstanceList: []
    }
  },
  computed: {
    subarea() {
      return this.$store.state.app.subarea
    },
    userInfo() {
      return this.$store.state.app.userInfo
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    companyList() {
      return this.$store.state.app.companyList
    },
    proList() {
      return this.$store.state.app.proList
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    },
    isEmptyAccount() {
      return this.$store.state.app.isEmptyAccount
    }
  },
  watch: {
    proList: {
      handler: function(list) {
        this.$nextTick(() => {
          this.mapInit(JSON.parse(JSON.stringify(list)))
        })
      },
      immediate: true
    },
    isEmptyAccount: {
      handler: function(val) {
        if (val) {
          this.fetchUserGatewayList()
        }
      },
      immediate: true
    }
  },
  created() {
    let dataScreen = getDataScreenCookie()
    let CompanyId = dataScreen.CompanyId - 0
    let ProjectId = dataScreen.ProjectId - 0
    // 从数据大屏点击项目进入
    if (CompanyId || ProjectId) {
      this.loading = true
      this.dataScreen = dataScreen
      // 未切换公司
      if (CompanyId === this.companyId) {
        this.changeProject(ProjectId)
      } else if (this.companyList.length) {
        // 切换了公司
        for (let i = 0; i < this.companyList.length; i++) {
          if (this.companyList[i].CompanyId === CompanyId) {
            this.changeCompany(this.companyList[i])
            break
          }
        }
      }
    } else {
      this.loading = false
    }
  },
  mounted() {
    getCompanyTotalList({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          data.forEach(v => {
            if (v.TotalType === 0) {
              this.showAlarm = v.IsEnabled
            } else if (v.TotalType === 1) {
              this.showRepair = v.IsEnabled
            } else if (v.TotalType === 2) {
              this.showMaintenance = v.IsEnabled
            }
          })
        }
      })
      .catch(err => {
        console.error(err)
      })

    maintainContractList({
      QueryType: 1,
      PartyA: undefined,
      PartyB: undefined,
      ContractNumber: undefined,
      Status: [0],
      ContractName: undefined,
      SortType: undefined,
      IsAsc: undefined,
      PageSize: 1000,
      PageIndex: 1
    })
      .then(res => {
        if (res.data.Code === 200) {
          let data = res.data.Data.Data
          var showNotification = data => {
            return new Promise(resolve => {
              const instance = this.$notify({
                title: `维保合同：（${data.contractNumber}）`,
                dangerouslyUseHTMLString: true,
                duration: 0,
                showClose: false,
                customClass: 'maintenance-notify',
                offset: 60,
                message: `
                  <div>
                    <div>
                      甲方企业：${data.partyAName} <br />
                      维保团队：${data.partyBName} <br />
                      维保合同：${data.contractName}
                    </div>
                    <div style="text-align: right;margin-top: 15px;">
                      <button id="notify-button-cancel-${data.contractID}" data-id=${data.contractID} type="button" class="notify-button-JKSDSD322 el-button el-button--mini el-button--text">今天不再提示</button>
                      <button id="notify-button-sign-${data.contractID}" data-id=${data.contractID} type="button" class="el-button el-button--primary el-button--mini">签约</button>
                    </div>
                  </div>
                `
              })
              this.notificationInstanceList.push({
                key: data.contractID,
                instance
              })
              this.$nextTick(() => {
                document
                  .querySelector(`#notify-button-sign-${data.contractID}`)
                  .addEventListener('click', e => {
                    const id = e.target.getAttribute('data-id')
                    this.$refs.pactSignDialog.openDialog(id)
                  })
                document
                  .querySelector(`#notify-button-cancel-${data.contractID}`)
                  .addEventListener('click', e => {
                    const id = e.target.getAttribute('data-id')
                    Cookies.set(
                      storageName(`maintenance-pact-${this.userId}-${id}`),
                      'hide',
                      {
                        expires: new Date(
                          dayjs()
                            .endOf('day')
                            .format('YYYY-MM-DD HH:mm:ss')
                        )
                      }
                    )
                    instance.close()
                  })
                resolve()
              })
            })
          }

          const loop = async () => {
            for (let i = 0; i < data.length; i++) {
              const element = data[i]
              if (
                Cookies.get(
                  storageName(
                    `maintenance-pact-${this.userId}-${element.contractID}`
                  )
                ) !== 'hide'
              ) {
                await showNotification(element)
              }
            }
          }
          loop()
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  beforeDestroy() {
    this.notificationInstanceList.forEach(v => {
      v.instance.close()
    })
  },
  methods: {
    // 切换企业
    changeCompany(company) {
      const { CompanyId, Industry, CompanyName } = company
      this.$store.commit('UPDATE_COMPANY', {
        id: CompanyId,
        label: CompanyName,
        industry: Industry
      })
      // 保存当前用户切换的项目
      updatePreferences({
        TableType: 'RememberCompany',
        Field: JSON.stringify({
          id: CompanyId,
          label: CompanyName,
          industry: Industry
        }),
        ForeignId: this.userInfo.uid
      })
      this.$store.dispatch('fetchCompanyStruct')

      this.$store.commit('UPDATE_PROJECT_PERMISSIONS', null)
      this.$store.commit('UPDATE_COMPANY_PERMISSIONS', null)
      this.$store.commit('UPDATE_PLATFORM', '')
      this.$store.commit('CHANGE_PROJECT', null)
      this.$store
        .dispatch('fetchProject', {
          uid: this.userInfo.uid,
          companyId: CompanyId
        })
        .then(() => {
          resetRouter()
          this.changeProject(this.dataScreen.ProjectId - 0)
        })
    },
    // 改变项目
    changeProject(id) {
      this.$store.dispatch(
        'ChangeProject',
        this.proList.find(item => item.ProjectId === id)
      )
      let projectPath = []
      this.subarea.forEach(item => {
        getPathById(id, item, val => {
          projectPath = val
        })
      })
      removeDataScreenCookie()
      this.$store.commit('UPDATE_PROJECT_PATH', projectPath)
      this.$router.push({ name: 'triggerRouterGuard' })
    },
    afterGatewayAdd() {
      this.fetchUserGatewayList()
    },
    // 获取登录用户下未关联项目的网关数量
    fetchUserGatewayList() {
      showDeviceList({
        IsQueryCreator: true,
        PageIndex: 1,
        PageSize: 50
      })
        .then(res => {
          if (res.data.Code === 200) {
            if (this.isEmptyAccount) {
              this.userGatewayList = res.data.Data.Data
            } else {
              this.userGatewayList = []
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    handlePactSign(id) {
      const { instance } = this.notificationInstanceList.find(v => v.key === id)
      if (instance) {
        instance.close()
      }
    },
    handleOpenSetDialog() {
      this.$refs.configDialog.openDialog({
        showAlarm: this.showAlarm,
        showRepair: this.showRepair,
        showMaintenance: this.showMaintenance
      })
    },
    handleSetChange(payload) {
      // 下面代码类似：this['showAlarm'] = true
      this[payload.type] = payload.val
    },
    // 初始化地图信息
    mapInit(list) {
      this.map = new BMap.Map('map-container', { enableMapClick: false }) // 创建地图实例
      this.map.setMapStyle({ style: 'googlelite' })
      var point = new BMap.Point(121.429116, 31.153208) // 创建点坐标
      this.map.centerAndZoom(point, 12) // 初始化地图，设置中心点坐标和地图级别
      this.map.enableScrollWheelZoom(true) // 开启鼠标滚轮缩放

      this.map.clearOverlays()

      let self = this
      let markers = []
      let marker = null
      let points = []
      this.$nextTick(() => {
        var myGeo = new BMap.Geocoder()
        // 将地址解析结果显示在地图上，并调整地图视野

        list.forEach(item => {
          const address =
            item.adresss.split(';')[1] + item.adresss.split(';')[2]
          item.adresss = item.adresss.split(';')[1] + item.adresss.split(';')[2]
          myGeo.getPoint(address, function(point) {
            points.push(point)
            if (point) {
              if (Number(item.AlarmNum) > 0) {
                const alarmIcon = new BMap.Icon(
                  'https://webapi.amap.com/theme/v1.3/markers/n/mark_rs.png',
                  new BMap.Size(23, 30)
                )
                marker = new BMap.Marker(point, { icon: alarmIcon })
                self.map.addOverlay(marker)
                markers.push(marker)
              } else {
                const normalIcon = new BMap.Icon(
                  'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png',
                  new BMap.Size(23, 30)
                )
                marker = new BMap.Marker(point, { icon: normalIcon })
                self.map.addOverlay(marker)
                markers.push(marker)
              }
              const content = `<div style="position:relative;box-sizing:border-box;cursor:pointer;z-index: 1000" class="goStore" siteId='${
                item.id
              }'>
                                <p style="padding:0;margin-bottom:5px;color:#184B8D;font-size:16px;margin-top:0;font-weight:bold;text-overflow:ellipsis;overflow:hidden;white-space:nowrap">${
                                  item.ProjectName
                                }</p>
                                <p class="showAlarm" style="color:#F76464;margin-bottom:7px;display:flex;align-items:center;"><img src="https://cdn.sinocold.net/images/monitorDashboard/alarm.png" style="margin-right:5px"><span class="alarmNum">当前报警&nbsp;${
                                  item.AlarmNum
                                }</span></p>
                                <p style="padding:0;margin:0 0 7px 0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap">
                                <img src="https://cdn.sinocold.net/images/monitorDashboard/marker.png" style="float:left;margin-right:5px;">${address}</p>
                                <p style="margin:0 0 7px 0;height:20px;"><img src="https://cdn.sinocold.net/images/monitorDashboard/man.png" style="float:left;margin-right:5px;">${item.cname ||
                                  ''}</p>
                                <p style="margin:0;"><img src="https://cdn.sinocold.net/images/monitorDashboard/phone.png" style="float:left;margin-right:5px;">${item.mobile ||
                                  ''}</p>
                                <div siteId='${
                                  item.ProjectId
                                }' class="goStore-cover" style="position: absolute;top:0;left: 0; bottom:0;right:0;"></div>
                              </div>`
              self.addClickHandler(content, marker)
            }
          })
        })
      })

      setTimeout(() => {
        // 将所有定位点放在可视区域内
        var view = this.map.getViewport(eval(points))
        var mapZoom = view.zoom
        var centerPoint = view.center
        this.map.centerAndZoom(centerPoint, mapZoom)
        // 设置定位点聚合
        // eslint-disable-next-line no-unused-vars
        let markerClusterer = new BMapLib.MarkerClusterer(this.map, {
          markers: markers
        })
      }, 1000)
    },
    // 点击位置出现信息窗体
    addClickHandler(content, marker) {
      let _this = this
      marker.addEventListener('click', function(e) {
        _this.openInfo(content, e)
      })
    },
    // 信息窗体
    openInfo(content, e) {
      const div = document.createElement('div')
      div.innerHTML = content
      // 判断门店报警是否为0 为0则不显示报警框
      if (div.querySelector('.alarmNum').innerHTML === 0) {
        div.querySelector('.showAlarm').style.cssText = 'display:none'
      } else {
        div.querySelector('.showAlarm').style.cssText =
          'display:inline;color:#F76464'
      }
      var p = e.target
      var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat)
      var infoWindow = new BMap.InfoWindow(content, this.opts) // 创建信息窗口对象
      this.map.openInfoWindow(infoWindow, point) // 开启信息窗口
      const self = this
      // 延时加载 点击门店进入当前门店的实时监测页面
      setTimeout(function() {
        const store = document.querySelector('.goStore-cover')
        store.addEventListener('click', e => {
          const pid = Number(e.target.getAttribute('siteId'))
          self.$store.dispatch(
            'ChangeProject',
            self.proList.find(item => item.ProjectId === pid)
          )
          let projectPath = []
          self.subarea.forEach(item => {
            getPathById(pid, item, val => {
              projectPath = val
            })
          })
          self.$store.commit('UPDATE_PROJECT_PATH', projectPath)
          self.$router.push({ name: 'triggerRouterGuard' })
        })
      }, 100)
    },
    // 设置中心点
    setCenter(item) {
      const myGeo = new BMap.Geocoder()
      let _this = this
      myGeo.getPoint(item.adresss, function(point) {
        if (point) {
          _this.map.setCenter(point)
          const div = `<div style="position:relative;box-sizing:border-box;cursor:pointer" class="goStore" siteId='${
            item.id
          }'>
                    <p style="padding:0;margin-bottom:5px;color:#184B8D;font-size:16px;margin-top:0;font-weight:bold;text-overflow:ellipsis;overflow:hidden;white-space:nowrap">${
                      item.ProjectName
                    }</p>
                    <p class="showAlarm" style="color:#F76464;margin-bottom:7px;display:flex;align-items:center;"><img src="https://cdn.sinocold.net/images/monitorDashboard/alarm.png" style="margin-right:5px"><span class="alarmNum">当前报警&nbsp;${
                      item.AlarmNum
                    }</span></p>
                    <p style="padding:0;margin:0 0 7px 0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap">
                        <img src="https://cdn.sinocold.net/images/monitorDashboard/marker.png" style="float:left;margin-right:5px;">${item.adresss ||
                          ''}</p>
                        <p style="margin:0 0 7px 0;height:20px;"><img src="https://cdn.sinocold.net/images/monitorDashboard/man.png" style="float:left;margin-right:5px;">${item.cname ||
                          ''}</p>
                        <p style="margin:0;"><img src="https://cdn.sinocold.net/images/monitorDashboard/phone.png" style="float:left;margin-right:5px;">${item.mobile ||
                          ''}</p>
                        <div siteId='${
                          item.ProjectId
                        }' class="goStore-cover" style="position: absolute;top:0;left: 0; bottom:0;right:0;"></div>
                      </div>`
          const infoWindow = new BMap.InfoWindow(div, _this.opts)
          // 延时加载 点击门店进入当前门店的实时监测页面
          setTimeout(function() {
            const store = document.querySelector('.goStore-cover')
            store.addEventListener('click', e => {
              const pid = Number(e.target.getAttribute('siteid'))
              _this.$store.dispatch(
                'ChangeProject',
                _this.proList.find(item => item.ProjectId === pid)
              )
              let projectPath = []
              _this.subarea.forEach(item => {
                getPathById(pid, item, val => {
                  projectPath = val
                })
              })
              _this.$store.commit('UPDATE_PROJECT_PATH', projectPath)
              _this.$router.push({ name: 'triggerRouterGuard' })
            })
          }, 100)
          _this.map.openInfoWindow(infoWindow, point) // 开启信息窗口
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
#amap-cointainer {
  height: 100%;
  position: relative;
  .empty-gateway {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 140px;
      height: 140px;
    }
    .desc {
      color: rgba(0, 0, 0, 0.65);
      padding-top: 20px;
      padding-bottom: 25px;
    }
  }
}
#map-container {
  width: 100%;
  height: 100%;
}
.project-wrapper {
  height: 90%;
  position: absolute;
  top: 50px;
  left: 50px;
  border-radius: 10px;
  background-color: rgba(74, 74, 74, 0.9);
  width: 18%;
  min-width: 230px;
  .search {
    margin: 5%;
    width: 90%;
  }
  .project-list {
    height: 87%;
    width: 90%;
    margin-left: 5%;
    overflow: auto;
    border-top: 2px solid #999;
    .project-item {
      border-bottom: 1px solid #999;
      padding: 20px 0;
      .has-alarm {
        background: #ff8757;
        border-color: #ff8757;
      }
      .project-name {
        overflow: hidden;
        .el-button {
          float: left;
        }
        .project-alarm {
          float: left;
          color: #fff;
          margin: 12px 0 0 12px;
          .icon {
            margin-right: 4px;
            color: #fff;
            width: 17px;
            height: 17px;
            vertical-align: -0.3em;
          }
        }
      }
      .project-address {
        margin-top: 20px;
        .svg-icon {
          color: red;
          width: 17px;
          height: 17px;
          margin-right: 5px;
          vertical-align: -0.3em;
        }
      }
      .project-message {
        font-size: 13px;
        color: #fff;
        line-height: 20px;
      }
      .project-phone {
        margin-top: 10px;
        .svg-icon {
          color: #fff;
          width: 15px;
          height: 15px;
          margin-right: 7px;
          vertical-align: -0.3em;
        }
      }
    }
  }
}
.setting-handle-button {
  z-index: 1000;
  position: fixed;
  right: 0;
  top: 100px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  cursor: pointer;
  background-color: rgba(132, 132, 132, 0.8);
  .icon {
    color: #fff;
    font-size: 24px;
  }
}
</style>

<style lang="scss">
.maintenance-notify {
  padding: 14px 13px 14px 13px;
  .el-notification__group {
    flex: 1;
  }
}
</style>
