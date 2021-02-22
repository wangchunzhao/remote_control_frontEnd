<template>
  <div class="device-container">
    <!-- <div class="el-tabs">
            <div class="el-tabs__header">
                <div class="el-tabs__nav-wrap">
                    <div class="el-tabs__nav-scroll bg-fff" style='padding-left: 40px;'>
                        <div class="el-tabs__nav">
                            <div class='el-tabs__active-bar' :style='translateX'></div>
                            <div class="el-tabs__item" style='padding-left:0' :class="{'is-active': $route.query.tabIndex == 1 || !$route.query.tabIndex}" @click="go(1)">客流统计</div>
                            <div class="el-tabs__item" :class="{'is-active': $route.query.tabIndex == 3}" @click="go(3)">热力图</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class='pdg'>
                <div class="el-tab-pane">
                    <router-view></router-view>
                </div>
            </div>
        </div> -->
    <nav-tabs
      :tab-list="tabList"
      style="padding-left: 40px;"
      @clickItem="clickItem"
    />
    <div class="pdg">
      <router-view />
    </div>
  </div>
</template>
<script>
import { storageName } from '@/utils/index'
export default {
  data() {
    return {
      sid: null,
      tabList: [
        {
          label: '客流统计',
          routePath: '/monitor/passenger/calendar'
        }
      ]
    }
  },
  mounted() {
    if (this.$route.query.sid) {
      this.sid = this.$route.query.sid
      sessionStorage.setItem(storageName('subsystemId'), this.$route.query.sid)
    } else {
      this.sid = sessionStorage.getItem(storageName('subsystemId'))
    }
  },
  methods: {
    clickItem(label) {
      switch (label) {
        case '客流统计':
          this.$router.push({ path: '/monitor/passenger/calendar' })
          break
        default:
          break
      }
    }
  }
}
</script>
