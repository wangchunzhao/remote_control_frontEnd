<template>
  <div class="HeaderBtn">
    <div>
      <router-link to="/repairMaintain/myrepair">
        <el-button
          size="small"
          type="primary"
          style="position:absolute;z-index:10;margin:4px 10px;top:80px;right:20px;"
        >
          <c-svg name="plus" />
          <span>我要报修</span>
        </el-button>
      </router-link>
      <div class="el-tabs">
        <div class="el-tabs__header">
          <div class="el-tabs__nav-wrap">
            <div class="el-tabs__nav-scroll bg-fff" style="padding-left: 40px;">
              <div class="el-tabs__nav">
                <div class="el-tabs__active-bar" :style="translateX" />
                <div
                  class="el-tabs__item"
                  style="padding-left:0"
                  :class="{
                    'is-active':
                      $route.path ===
                        '/repairMaintain/repairTemplate/repairIndex' ||
                      $route.path === '/repair'
                  }"
                  @click="go(1)"
                >
                  维修主页
                </div>
                <div
                  class="el-tabs__item"
                  :class="{
                    'is-active':
                      $route.path ===
                      '/repairMaintain/repairTemplate/repairAnalysis'
                  }"
                  @click="go(2)"
                >
                  数据分析
                </div>
                <div
                  class="el-tabs__item"
                  :class="{
                    'is-active':
                      $route.path ===
                      '/repairMaintain/repairTemplate/repairRank'
                  }"
                  @click="go(3)"
                >
                  维修排名
                </div>
                <div
                  class="el-tabs__item"
                  :class="{
                    'is-active':
                      $route.path ===
                      '/repairMaintain/repairTemplate/repairTeam'
                  }"
                  @click="go(4)"
                >
                  维保队伍
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pdg">
          <div class="el-tab-pane">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { storageName } from '@/utils/index'
export default {
  computed: {
    translateX() {
      const tabIndex = sessionStorage.getItem(storageName('tabIndex'))
      if (tabIndex) {
        if (tabIndex === '1') {
          return 'width: 56px;transform: translateX(0px)'
        } else if (tabIndex === '2') {
          return 'width: 56px;transform: translateX(98px)'
        } else if (tabIndex === '3') {
          return 'width: 56px;transform: translateX(198px)'
        } else {
          return 'width: 56px;transform: translateX(298px)'
        }
      } else {
        return 'width: 56px;transform: translateX(0px)'
      }
    }
  },
  methods: {
    go(val) {
      sessionStorage.setItem(storageName('tabIndex'), val)
      if (val === 1) {
        this.$router.push({
          path: '/repairMaintain/repairTemplate/repairIndex'
        })
      }
      if (val === 2) {
        this.$router.push({
          path: '/repairMaintain/repairTemplate/repairAnalysis'
        })
      }
      if (val === 3) {
        this.$router.push({ path: '/repairMaintain/repairTemplate/repairRank' })
      }
      if (val === 4) {
        this.$router.push({ path: '/repairMaintain/repairTemplate/repairTeam' })
      }
    }
  }
}
</script>

<style lang="scss">
@import 'src/assets/style/repair.scss';
</style>
