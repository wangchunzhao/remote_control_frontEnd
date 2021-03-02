<template>
  <div class="header">
    <div class="logo">
      <div class="hamburger-container" @click="toggleSideBar">
        <c-svg
          name="liebiao"
          class="wscn-icon hamburger"
          :class="{ 'is-active': !sidebar }"
        />
      </div>
      <div class="Platform">
        <span
          v-if="
            host === 'yun.ikold.com.cn' ||
              host === 'ikold.com.cn' ||
              host === 'cloud.ikold.com.cn'
          "
        >
          CRYOTEK
        </span>
        <c-svg
          v-else-if="host === 'service.haiercarrier.com'"
          style="width: 110px;"
          name="HaierCarrier-white-logo"
        />
        <span v-else>
          CoolCare
        </span>
      </div>
    </div>
    <el-menu
      class="horizontal-menu thin-scroll"
      mode="horizontal"
      background-color="#152c73"
      text-color="rgba(255, 255, 255, 0.85)"
      active-text-color="#fff"
      menu-trigger="click"
    >
      <el-menu-item index="01">
        <el-link
          :underline="false"
          @click.native="platformChange(PLATFORM.business)"
          class="menu-link"
          :class="platform === PLATFORM.business ? 'active-link' : ''"
        >
          <c-svg name="yewuyunying" style="width: 16px;height: 16px;" />
          业务运营
        </el-link>
      </el-menu-item>
      <el-menu-item index="02" v-permission="[2]">
        <el-link
          :underline="false"
          @click.native="platformChange('DATA_SCREEN')"
          class="menu-link"
        >
          <c-svg name="shujudaping" style="width: 16px;height: 16px;" />
          数据大屏
        </el-link>
      </el-menu-item>
      <el-menu-item index="03" v-if="dataAnalysisStatus">
        <el-link
          :underline="false"
          @click.native="platformChange(PLATFORM.dataAnalysis)"
          class="menu-link"
          :class="platform === PLATFORM.dataAnalysis ? 'active-link' : ''"
        >
          <c-svg name="shujufenxi" style="width: 16px;height: 16px;" />
          数据分析
        </el-link>
      </el-menu-item>
      <el-menu-item index="04" v-if="deviceConnectStatus">
        <el-link
          :underline="false"
          @click.native="platformChange(PLATFORM.deviceConnect)"
          class="menu-link"
          :class="platform === PLATFORM.deviceConnect ? 'active-link' : ''"
        >
          <c-svg name="shebeilianjie" style="width: 16px;height: 16px;" />
          设备连接
        </el-link>
      </el-menu-item>
      <el-menu-item index="05" v-if="systemManageStatus">
        <el-link
          :underline="false"
          @click.native="platformChange(PLATFORM.systemManage)"
          class="menu-link"
          :class="platform === PLATFORM.systemManage ? 'active-link' : ''"
        >
          <c-svg name="qiyeguanli" style="width: 16px;height: 16px;" />
          企业管理
        </el-link>
      </el-menu-item>
    </el-menu>
    <div class="header-right">
      <el-menu
        class="horizontal-menu thin-scroll"
        mode="horizontal"
        background-color="#152c73"
        text-color="rgba(255, 255, 255, 0.85)"
        active-text-color="#fff"
        menu-trigger="click"
      >
        <el-menu-item v-if="showMapMenu" index="06">
          <router-link
            to="/map/index"
            class="menu-link"
            :class="$route.path === '/map/index' ? 'active-link' : ''"
          >
            <c-svg name="location" style="width: 16px;height: 16px;" />
            总览
          </router-link>
        </el-menu-item>
        <el-menu-item index="07">
          <LangSelect
            :iconStyle="{ padding: '0 20px', transform: 'translateY(-2px)' }"
          />
        </el-menu-item>
        <div v-if="isShowProjectSelect()" class="subarea-cascader-wrap">
          <c-svg name="appstore" style="width: 16px;height: 16px;" />
          <div class="subarea-cascader-search" @click="cascaderSearchFun">
            <i
              class="el-icon-search"
              style="width: 20px;height: 20px;font-size: 16px;background: #152c73;"
            ></i>
          </div>
          <el-cascader
            v-model="path"
            :props="{
              expandTrigger: 'hover',
              children: 'Children',
              value: 'SubareaId',
              label: 'SubareaName'
            }"
            ref="cascader"
            @focus="cascaderFocus"
            @visible-change="cascaderVisible"
            popper-class="subarea-cascader-popper"
            :show-all-levels="false"
            placeholder="搜索项目名称"
            filterable
            class="subarea-cascader"
            :options="subareaOptions"
            @change="changeProject"
          />
        </div>
      </el-menu>
      <el-tooltip
        v-if="industryId === 1"
        content="CoolCare 帮助文档"
        placement="bottom"
        effect="light"
      >
        <div class="nav-right-item" @click="goHelp">
          <c-svg name="bangzhuzhongxin" />
        </div>
      </el-tooltip>
      <msg-center v-if="isShowMsgCenter()" class="msg-center" />
      <div class="userinfo">
        <el-dropdown trigger="click" style="display: block;">
          <div class="el-dropdown-link userinfo-inner">
            <img
              class="user-logo"
              :src="
                userInfo.avatar ||
                  'http://front-end-assets.oss-cn-shanghai.aliyuncs.com/%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F/1.png'
              "
            />
            {{ userInfo.nickname }}
          </div>
          <el-dropdown-menu slot="dropdown" class="system-dropdown">
            <div class="project-list_JKSDF23432fsd thin-scroll">
              <template v-if="companyList.length > 1">
                <el-dropdown-item
                  v-for="item in companyList"
                  :key="item.CompanyId"
                  @click.native="changeCompany(item)"
                >
                  {{ item.CompanyName }}
                  <i
                    v-if="company.id === item.CompanyId"
                    class="el-icon-check system-dropdown-check"
                  />
                </el-dropdown-item>
              </template>
            </div>
            <el-dropdown-item
              :divided="true"
              @click.native="$router.push('/userSet/myInformation')"
            >
              个人设置
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="logout">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import timeago from 'timeago.js'
import MsgCenter from './component/MsgCenter'
import { setCookie } from '@/utils/auth'
import { getUserBigScreen } from '@/api/user'
import { resetRouter } from '@/router'
import { updatePreferences } from '@/api/preferences'
import { PLATFORM } from '@/utils/enum'
import LangSelect from '@/components/LangSelect'

export default {
  components: {
    MsgCenter,
    LangSelect
  },
  data() {
    return {
      dataAnalysisStatus: false, //数据分析菜单
      deviceConnectStatus: false, //设备连接菜单
      systemManageStatus: false, //企业管理菜单
      path: this.$store.state.app.projectPath,
      prePath: '',
      avatar: '',
      host: window.location.host,
      PLATFORM
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'proList', 'project', 'pid']),
    userInfo() {
      return this.$store.state.app.userInfo
    },
    projectPath() {
      return this.$store.state.app.projectPath
    },
    company() {
      return this.$store.state.app.company
    },
    industryId() {
      return (this.$store.state.app.project || {}).Industry
    },
    companyList() {
      return this.$store.state.app.companyList
    },
    platform() {
      return this.$store.state.permissions.platform
    },
    subareaOptions() {
      return this.$store.state.app.subarea || []
    },
    projectPermissions() {
      return this.$store.state.permissions.projectPermissions
    },
    companyPermissions() {
      return this.$store.state.permissions.companyPermissions
    },
    showMapMenu() {
      return this.platform === PLATFORM.business
    }
  },
  watch: {
    projectPath(val) {
      if (val) {
        this.path = val
      }
    },
    company: {
      handler: function(val) {
        getUserBigScreen({
          companyId: val.id
        })
          .then(res => {
            this.dataScreenURI = res.data.Data
          })
          .catch(err => {
            console.error(err)
          })
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.dataAnalysisStatus = this.handleShowPlatform(PLATFORM.dataAnalysis)
    this.deviceConnectStatus = this.handleShowPlatform(PLATFORM.deviceConnect)
    this.systemManageStatus = this.handleShowPlatform(PLATFORM.systemManage)
  },
  methods: {
    cascaderSearchFun() {
      this.cascaderFocus()
      this.$refs.cascader.$children[0].focus()
      let _this = this
      setTimeout(() => {
        _this.$refs.cascader.toggleDropDownVisible()
      })
    },
    cascaderFocus() {
      this.prePath = this.path ? this.path : this.prePath ? this.prePath : ''
      this.path = ''
    },
    cascaderVisible(bol) {
      let _this = this
      setTimeout(() => {
        if (!bol && !_this.path) {
          _this.path = _this.prePath
        }
      })
    },
    handleShowPlatform(platform) {
      if (!this.projectPermissions || !this.companyPermissions) {
        return false
      }
      // 80 报警策略模块
      // 终端管理模块
      const DEVICE_CONNECT_PAGE = [80]
      // 3 统计分析模块
      // 102 数据下载模块
      const DATA_ANALYSIS_PAGE = [3, 102]
      // 26 设备监控模块
      // 33 报警管理模块
      // 39 维修保养模块
      // 42 设备资产模块
      // 48 项目配置模块
      // 60 数据导入模块
      // 77 操作日志模块
      const BUSINESS_PAGE = [26, 33, 39, 42, 48, 60, 77]
      // 4 项目管理模块
      // 11 成员管理模块
      // 16 权限管理模块
      // 23 维保管理模块
      // 24 应用管理模块
      // 140 设备管理
      // 141 资产管理
      const SYSTEM_MANAGE_PAGE = [4, 11, 16, 23, 24, 140, 141]
      switch (platform) {
        case PLATFORM.business:
          return BUSINESS_PAGE.some(item => {
            return this.projectPermissions.includes(item)
          })
        case PLATFORM.systemManage:
          return SYSTEM_MANAGE_PAGE.some(item => {
            return this.companyPermissions.includes(item)
          })
        case PLATFORM.dataAnalysis:
          return DATA_ANALYSIS_PAGE.some(item => {
            return this.companyPermissions.includes(item)
          })
        case PLATFORM.deviceConnect:
          return DEVICE_CONNECT_PAGE.some(item => {
            return this.companyPermissions.includes(item)
          })
        default:
          return false
      }
    },
    isShowProjectSelect() {
      const { name } = this.$route
      const hideList = [
        'mapIndex',
        'allParams',
        'alarmManageWithAllProject',
        'eventNoticeEdit'
      ]
      return (
        this.platform === PLATFORM.business && hideList.indexOf(name) === -1
      )
    },
    isShowMsgCenter() {
      return this.platform === PLATFORM.business
    },
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
          this.$router.push({
            name: 'triggerRouterGuard',
            query: {
              goPage: '/map/index'
            }
          })
          resetRouter()
        })
    },
    goHelp() {
      window.open('http://wiki.sinocold.net', 'target')
    },
    // 改变项目
    changeProject(val) {
      const project = this.proList.find(item => item.id === val[val.length - 1])
      if (project) {
        this.$store.dispatch('ChangeProject', project)
        this.$store.commit('UPDATE_PROJECT_PATH', val)
        // 更新结构树
        this.$store.dispatch('fetchStructTree')
        const { fullPath, name } = this.$route
        this.$router.push({
          name: 'triggerRouterGuard',
          query: { fullPath: name === 'err403' ? undefined : fullPath }
        })
      } else {
        this.$message('选中的节点并不是项目节点')
      }
    },
    // 平台跳转
    platformChange(platform) {
      if (this.platform === platform) {
        // 如果已经在当前平台了，那么点击无效
        return
      }
      if (platform !== 'DATA_SCREEN') {
        this.$store.commit('UPDATE_PLATFORM', platform)
      }

      if (platform !== 'DATA_SCREEN') {
        this.$store.commit('UPDATE_PROJECT_PERMISSIONS', null)
        this.$store.commit('UPDATE_COMPANY_PERMISSIONS', null)
        if (platform === PLATFORM.business) {
          this.$router.push({
            name: 'triggerRouterGuard',
            query: {
              goPage: '/map/index'
            }
          })
        } else {
          this.$router.push({
            name: 'triggerRouterGuard'
          })
        }
        resetRouter()
      } else if (this.company.id === 64 || this.company.id === 55) {
        // 定制大屏
        let info = {
          UId: this.userInfo.uid,
          CId: this.company.id
        }
        setCookie('coolcare_prepayment_to_dataScreen', JSON.stringify(info))
        let link = global.DATAV_PROJECT_URL
        window.open(link)
      } else {
        const link = this.dataScreenURI
        if (link && link.indexOf('http') > -1) {
          window.open(link)
        } else {
          this.$notify.info({
            title: '消息',
            message: '您所属的企业并没有定制数据化大屏'
          })
        }
      }
    },
    // 折叠侧边栏
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
      if (this.sidebar) {
        this.mapWidth = window.innerWidth - 180
      } else {
        this.mapWidth = window.innerWidth - 70
      }
    },
    // 退出登录
    logout() {
      this.$confirm('确认退出吗?', '提示', {
        type: 'warning',
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.$router.push('/login')
        this.$store.dispatch('LOG_OUT')
        location.reload()
      })
    },
    format(time) {
      var timeagoInstance = timeago()
      return timeagoInstance.format(time, 'zh_CN')
    }
  }
}
</script>
<style lang="scss" scoped>
.horizontal-menu {
  height: 50px;
  float: left;
  .el-menu-item {
    height: 50px;
    line-height: 50px;
    padding: 0;
    text-align: center;
    border: 0;
    .menu-link {
      display: flex;
      align-items: center;
      height: 50px;
      padding: 0 20px;
      .icon {
        margin-right: 10px;
      }
    }
  }
  .active-link {
    color: #fff;
    background: rgba(0, 0, 0, 0.34);
  }
  .el-submenu .el-submenu__title {
    height: 50px;
    line-height: 50px;
    border-bottom: 0;
  }
  .svg-icon {
    vertical-align: -0.3em;
  }
  .el-dropdown {
    font-size: 14px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.85);
    height: 49px;
    &:hover {
      background-color: #292929;
    }
    .icon {
      margin-right: 10px;
    }
    .el-dropdown-link {
      display: inline-block;
      padding: 0 30px;
      i {
        color: #909399;
      }
    }
  }
}

.el-dropdown-menu {
  // margin-top: 0;
  padding: 0;
}
.header {
  position: fixed;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  font-size: 22px;
  line-height: 49px;
  color: rgba(255, 255, 255, 0.85);
  background: #152c73;
  min-width: 600px;
  z-index: 100;
  .subarea-cascader .el-input__inner {
    background: #152c73 !important;
  }
  .logo {
    flex: 0 0 160px;
    height: 50px;
    display: flex;
    font-size: 22px;
    background: #152c73 !important;
    float: left;
    .Platform {
      flex: 1;
      text-align: center;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.85);
    }
    .hamburger-container {
      line-height: 45px;
      height: 50px;
      flex: 0 0 40px;
      box-sizing: border-box;
      .icon {
        margin: 0 10px 0 15px;
      }
      .hamburger {
        display: inline-block;
        cursor: pointer;
        transform: rotate(0deg);
        transition: 0.38s;
        transform-origin: 50% 50%;
        width: 16px;
        height: 16px;
      }
      .hamburger.is-active {
        transform: rotate(90deg);
      }
    }
  }
  .horizontal-menu {
    flex: 1;
    border-bottom: 0;
  }
  .header-right {
    display: flex;
    align-items: center;
    overflow: hidden;
  }
  .nav-right-item {
    display: inline-block;
    cursor: pointer;
    outline: none;
    padding: 0 20px;
    transform: translateY(2px);
    &:hover {
      background: #000000;
      opacity: 0.34;
    }
  }
  .msg-center {
    cursor: pointer;
    &:hover {
      background: #000000;
      opacity: 0.34;
    }
  }
  .userinfo {
    text-align: right;
    padding: 0 20px;
    display: inline-block;
    cursor: pointer;
    // height: 47px;
    &:hover {
      background: #000000;
      opacity: 0.34;
    }
    .el-dropdown-link {
      cursor: pointer;
      color: rgba(255, 255, 255, 0.85);
    }
    .user-logo {
      width: 30px;
      height: 30px;
      border-radius: 20px;
      margin: 10px 0px 7px 10px;
      float: right;
    }
  }
}
</style>
<style lang="scss">
.el-menu--horizontal .el-submenu .el-submenu__title {
  height: 50px;
  line-height: 50px;
  border-bottom: 0;
}
.el-menu--horizontal > .el-submenu.is-active .el-submenu__title {
  border: 0;
}
.horizontal-dropdown {
  left: 200px !important;
  background: #333 !important;
  color: #fff;
  max-height: 350px;
  overflow-y: auto;
  border: none !important;
  top: 42px !important;
  .el-dropdown-menu__item {
    color: #fff;
    padding: 0 35px;
  }
  .el-dropdown-menu__item:not(.is-disabled):hover {
    background: rgb(41, 41, 41);
  }
  .popper__arrow {
    display: none !important;
  }
}
.project-list_JKSDF23432fsd {
  max-height: 400px;
  overflow-y: auto;
}
</style>

<style lang="scss">
.header {
  .subarea-cascader-wrap {
    position: relative;
    float: left;
    margin-left: 15px;
    &:focus {
      outline: none;
    }
  }
  .subarea-cascader-search {
    position: absolute;
    right: 0;
    top: 0;
    background: #152c73;
    width: 30px;
    height: 50px;
    z-index: 101;
    cursor: pointer;
  }
  .subarea-cascader {
    &:focus {
      outline: none;
    }
    .el-input__inner {
      color: rgba(255, 255, 255, 0.85);
      &:focus {
        outline: none;
      }
    }
    .el-input {
      &:focus {
        outline: none;
      }
    }
    .el-input__suffix {
      z-index: 10;
    }
    .el-input__inner {
      background: #152c73;
      border: none;
    }
    .el-icon-arrow-down {
      color: rgba(255, 255, 255, 0.85);
    }
    .el-input.is-focus .el-input__inner {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}
div.subarea-cascader-popper {
  ul {
    background-color: #152c73;
  }
  li.el-cascader-node {
    color: rgba(255, 255, 255, 0.85);
    &:hover,
    &.in-active-path {
      background: #000000;
      opacity: 0.35;
    }
    &.is-active {
      color: rgb(24, 144, 255);
    }
  }
  .popper__arrow::after {
    border-bottom-color: #152c73 !important;
  }
  .el-cascader-menu__item.is-disabled {
    background-color: #152c73;
  }
  .el-cascader__suggestion-item {
    color: rgba(255, 255, 255, 0.85);
    &:hover {
      background: #000000;
      opacity: 0.35;
    }
  }
  .el-scrollbar__wrap {
    background-color: #152c73;
  }
  .el-cascader-menu__wrap {
    height: 350px !important;
  }
  .el-scrollbar__wrap {
    height: 350px !important;
  }
}
.system-dropdown {
  .system-dropdown-check {
    position: absolute;
    top: 10px;
    right: 5px;
  }
  .el-dropdown-menu__item {
    position: relative;
    padding-right: 40px;
  }
  .el-dropdown-menu__item--divided:before {
    display: none;
  }
  .el-dropdown-menu__item--divided {
    margin-top: 0;
  }
}
</style>
