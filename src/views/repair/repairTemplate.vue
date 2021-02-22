<template>
  <div class="repair-wrapper">
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
export default {
  data() {
    return {
      tabList: [
        {
          label: '维修主页',
          routePath: '/repairMaintain/repairTemplate/repairIndex'
        },
        {
          label: '数据分析',
          routePath: '/repairMaintain/repairTemplate/repairAnalysis'
        },
        {
          label: '维修排名',
          routePath: '/repairMaintain/repairTemplate/repairRank'
        },
        {
          label: '维修队伍',
          routePath: '/repairMaintain/repairTemplate/repairTeam'
        }
      ]
    }
  },
  methods: {
    clickItem(label) {
      switch (label) {
        case '维修主页':
          this.$router.push({ path: 'repairIndex' })
          break
        case '数据分析':
          this.$router.push({ path: 'repairAnalysis' })
          break
        case '维修排名':
          this.$router.push({ path: 'repairRank' })
          break
        case '维修队伍':
          this.$router.push({ path: 'repairTeam' })
          break
        default:
          break
      }
    }
  }
}
</script>
<style lang="scss">
@import 'src/assets/style/repair.scss';
</style>
