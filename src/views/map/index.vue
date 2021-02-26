<template>
  <div id="amap-cointainer" class="mymap" v-loading="loading">
    <div id="map-container" />
    <Sidebar :handleClick="setCenter" :userGatewayList="userGatewayList" />
    <OverviewPanel />
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
import OverviewPanel from './OverviewPanel'
import { maintainContractList } from '@/api/maintainContract'
import PactSignDialog from './PactSignDialog'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { storageName } from '@/utils'
import { getDataScreenCookie, removeDataScreenCookie } from '@/utils/auth'
import DialogAddGateway from '@/views/terminalManage/gateway/gatewayList/DialogAdd'
import { showDeviceList } from '@/api/device_new'
import { updatePreferences } from '@/api/preferences'
import { resetRouter } from '@/router'
import mapConfigJson from '@/assets/json/custom_map_config.json'

export default {
  components: {
    Sidebar,
    PactSignDialog,
    DialogAddGateway,
    OverviewPanel
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
          const showNotification = data => {
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
    // 初始化地图信息
    mapInit(list) {
      this.map = new BMap.Map('map-container', { enableMapClick: false }) // 创建地图实例
      const point = new BMap.Point(121.429116, 31.153208) // 创建点坐标
      this.map.centerAndZoom(point, 12) // 初始化地图，设置中心点坐标和地图级别
      this.map.setMapStyleV2({ styleJson: mapConfigJson })
      this.map.enableScrollWheelZoom(true) // 开启鼠标滚轮缩放

      this.map.clearOverlays()

      let markers = []
      let marker = null
      let points = []
      this.$nextTick(() => {
        const myGeo = new BMap.Geocoder()
        // 将地址解析结果显示在地图上，并调整地图视野r

        list.forEach(item => {
          const address =
            item.adresss.split(';')[1] + item.adresss.split(';')[2]
          item.adresss = item.adresss.split(';')[1] + item.adresss.split(';')[2]
          myGeo.getPoint(address, point => {
            points.push(point)
            if (point) {
              if (Number(item.AlarmNum) > 0) {
                const alarmIcon = new BMap.Icon(
                  'https://cdn.sinocold.net/Carrier_PC/%E5%AE%9A%E4%BD%8D2.png',
                  new BMap.Size(25, 30)
                )
                marker = new BMap.Marker(point, { icon: alarmIcon })
                this.map.addOverlay(marker)
                markers.push(marker)
              } else {
                const normalIcon = new BMap.Icon(
                  'https://cdn.sinocold.net/Carrier_PC/%E5%AE%9A%E4%BD%8D.png',
                  new BMap.Size(25, 30)
                )
                marker = new BMap.Marker(point, { icon: normalIcon })
                this.map.addOverlay(marker)
                markers.push(marker)
              }
              this.addClickHandler(
                {
                  projectId: item.id,
                  projectName: item.ProjectName,
                  alarmNum: item.AlarmNum,
                  address
                },
                marker
              )
            }
          })
        })
      })

      setTimeout(() => {
        // 将所有定位点放在可视区域内
        const view = this.map.getViewport(eval(points))
        const mapZoom = view.zoom
        const centerPoint = view.center
        this.map.centerAndZoom(centerPoint, mapZoom)
        // 设置定位点聚合
        // eslint-disable-next-line no-unused-vars
        new BMapLib.MarkerClusterer(this.map, {
          markers: markers
        })
      }, 1000)
    },
    // 给 marker 绑定点击事件， 点击出现信息窗体
    addClickHandler(content, marker) {
      marker.addEventListener('click', e => {
        this.openInfoWindow(
          content,
          new BMap.Point(e.target.getPosition().lng, e.target.getPosition().lat)
        )
      })
    },
    // 显示项目信息窗体
    openInfoWindow(info, point) {
      const html = `
          <div class="project-info-window" data-project="${info.projectId}">
            <div class="project-name ellipsis">${info.projectName}</div>
            <div class="info-row ellipsis" style="color: ${
              info.alarmNum > 0 ? '#FF3F0D' : '#fff'
            }">
              <svg t="1614052837772" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="39581" xmlns:xlink="http://www.w3.org/1999/xlink" width="46" height="46"><defs><style type="text/css"></style></defs><path d="M816 768h-24V428c0-141.1-104.3-257.8-240-277.2V112c0-22.1-17.9-40-40-40s-40 17.9-40 40v38.8C336.3 170.2 232 286.9 232 428v340h-24c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h216c0 61.8 50.2 112 112 112s112-50.2 112-112h216c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM512 888c-26.5 0-48-21.5-48-48h96c0 26.5-21.5 48-48 48z" p-id="39582"></path></svg>
              当前报警 ${info.alarmNum}
            </div>
            <div class="info-row">
              <svg t="1614052917375" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="39989" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40"><defs><style type="text/css"></style></defs><path d="M512 327c-29.9 0-58 11.6-79.2 32.8C411.7 381 400 409.1 400 439c0 29.9 11.7 58 32.8 79.2C454 539.3 482.1 551 512 551c29.9 0 58-11.7 79.2-32.8C612.4 497 624 468.9 624 439c0-29.9-11.6-58-32.8-79.2S541.9 327 512 327z" p-id="39990"></path><path d="M854.6 289.1c-18.8-43.4-45.7-82.3-79.9-115.7-34.2-33.4-73.9-59.5-118.2-77.8C610.7 76.6 562.1 67 512 67c-50.1 0-98.7 9.6-144.5 28.5-44.3 18.3-84 44.5-118.2 77.8-34.2 33.4-61.1 72.4-79.9 115.7-19.5 45-29.4 92.8-29.4 142 0 70.6 16.9 140.9 50.1 208.7 26.7 54.5 64 107.6 111 158.1 80.3 86.2 164.5 138.9 188.4 153 6.9 4.1 14.7 6.1 22.4 6.1 7.8 0 15.5-2 22.4-6.1 23.9-14.1 108.1-66.8 188.4-153 47-50.4 84.3-103.6 111-158.1C867.1 572 884 501.8 884 431.1c0-49.2-9.9-97-29.4-142zM512 615c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176z" p-id="39991"></path></svg>
              ${info.address}
            </div>
          </div>
      `
      if (this.trackInfoBox) {
        // 关闭之前已打开的 infoWindow
        this.trackInfoBox.close()
      }
      this.trackInfoBox = new BMapLib.InfoBox(this.map, html, {
        closeIconMargin: '-40px -20px 0 0',
        alignBottom: false,
        closeIconUrl:
          'https://cdn.sinocold.net/images/baiduMap/closeinfowindow.png'
      })
      this.trackInfoBox.open(point)
      // 延时加载, 等 dom 加载完成， 点击门店进入当前门店的实时监测页面
      setTimeout(() => {
        const infoWindow = document.querySelector('.project-info-window')
        infoWindow.addEventListener('click', e => {
          const pid = Number(e.currentTarget.getAttribute('data-project'))
          this.$store.dispatch(
            'ChangeProject',
            this.proList.find(item => item.ProjectId === pid)
          )
          let projectPath = []
          this.subarea.forEach(item => {
            getPathById(pid, item, val => {
              projectPath = val
            })
          })
          this.$store.commit('UPDATE_PROJECT_PATH', projectPath)
          this.$router.push({ name: 'triggerRouterGuard' })
        })
      }, 100)
    },
    // 设置中心点
    setCenter(item) {
      const myGeo = new BMap.Geocoder()
      myGeo.getPoint(item.adresss, point => {
        if (point) {
          this.map.setCenter(point)
          this.openInfoWindow(
            {
              projectId: item.id || item.ProjectId,
              projectName: item.ProjectName,
              alarmNum: item.AlarmNum,
              address: item.adresss || ''
            },
            new BMap.Point(point.lng, point.lat)
          )
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
  .project-info-window {
    color: #fff;
    background: rgba(0, 0, 0, 0.75);
    box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
      0px 6px 16px 0px rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    padding: 10px;
    cursor: pointer;
    .project-name {
      font-size: 14px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 22px;
    }
    .info-row {
      font-size: 12px;
      line-height: 1.5;
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
</style>

<style lang="scss">
#amap-cointainer {
  .project-info-window {
    transform: translateY(-25px);
    position: relative;
    width: 200px;
    color: #fff;
    background: rgba(0, 0, 0, 0.75);
    box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
      0px 6px 16px 0px rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    padding: 10px;
    &::after {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top: 6px solid rgba(0, 0, 0, 0.75);
    }
    .project-name {
      font-size: 14px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 22px;
      margin-bottom: 5px;
    }
    .info-row {
      font-size: 12px;
      line-height: 1.8;
    }
  }
}
.maintenance-notify {
  padding: 14px 13px 14px 13px;
  .el-notification__group {
    flex: 1;
  }
}
</style>
