<template>
  <div class="app-wrapper">
    <!--头部-->
    <Header />
    <!--主体-->
    <div class="main thin-scroll" :class="{ hideSidebar: !sidebar }">
      <Sidebar />
      <!--内容部分-->
      <section class="content-container">
        <div class="content-wrapper">
          <!-- <Breadcrumb v-if="$route.name !== 'home' && $route.path !=='/map/index'"></Breadcrumb> -->
          <div v-if="!$route.meta.customHeader" class="content-header">
            <div class="content-header-title">
              <el-button
                v-if="$route.meta.showBackButton"
                type="text"
                style="padding: 0;"
                @click.native="$router.go(-1)"
              >
                <c-svg
                  name="jiantou"
                  style="font-size: 20px;margin-right: 10px;"
                />
              </el-button>
              {{ header }}
            </div>
          </div>
          <transition name="el-fade-in" mode="out-in">
            <keep-alive
              :include="[
                'MonitorDashboard',
                'AnalysisDashboard',
                'GatewayIndex',
                'AlarmManageIndex',
                'RecorderIndex',
                'CollectorIndex',
                'SensorIndex',
                'TransportManage',
                'MaintenanceManage_repairDetail'
              ]"
            >
              <router-view />
            </keep-alive>
          </transition>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// import Breadcrumb from '@/components/layout/Breadcrumb'
import Sidebar from '@/views/layout/Sidebar'
import Header from '@/views/layout/Header'
export default {
  components: {
    // Breadcrumb,
    Sidebar,
    Header
  },
  data() {
    return {
      mapWidth: null
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    header() {
      if (this.$route.meta.title === '列表展示') {
        return this.$store.state.app.header
      } else {
        return this.$route.meta.title
      }
    }
  },
  mounted() {
    // 监听窗口大小调节侧边栏开关
    let media = window.matchMedia('(max-width: 1367px)')
    media.matches && this.$store.dispatch('CloseSideBar')
    window.onresize = () => {
      media.matches && this.$store.dispatch('CloseSideBar')
      if (this.sidebar) {
        this.mapWidth = window.innerWidth - 160
      } else {
        this.mapWidth = window.innerWidth - 60
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.notifyTimer)
  }
}
</script>
<style scoped lang="scss">
.app-wrapper {
  position: relative;
  width: 100%;
  font-size: 13px;
  height: 100%;
  background: #f5f5f5;
  .main {
    position: absolute;
    top: 50px;
    bottom: 0px;
    min-width: 600px;
    transition: top 0.6s;
    overflow-y: auto;
    width: 100%;
    .content-container {
      transition: margin-left 0.28s ease-out;
      margin-left: 160px;
      height: 100%;
      box-sizing: border-box;
      min-width: 1000px;
    }
    .el-breadcrumb {
      margin-bottom: 15px;
    }
    .content-header {
      box-sizing: border-box;
      background: #fff;
      padding: 16px 32px 0;
      .content-header-title {
        font-size: 20px;
        font-weight: 500;
        padding: 0 0 20px 10px;
        color: #3c3c3c;
      }
    }
    .content-container .content-wrapper {
      box-sizing: border-box;
      height: 100%;
    }
    .sidebar-container {
      // overflow: auto;
      transition: width 0.28s ease-out;
      width: 160px;
      // height: 100%;
      position: fixed;
      top: 50px;
      bottom: 0;
      left: 0;
      z-index: 1001;
    }
  }
  .hideSidebar .sidebar-container {
    width: 56px;
  }
  .hideSidebar .content-container {
    margin-left: 56px;
  }
}

.video-wrapper_footer {
  text-align: right;
  border-top: 1px solid #dedfe0;
}
</style>
<style lang="scss">
.alarm-video-dialog {
  width: 900px;
  .el-dialog__header {
    padding: 0;
  }
  .el-dialog__body {
    padding: 0;
    height: 500px;
  }
}
</style>
