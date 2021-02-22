<template>
  <div class="point-connect">
    <el-tabs v-model="tabsActive">
      <el-tab-pane v-if="checkPermission([98])" label="点位配置" name="first">
        <point-config :visible="tabsActive === 'first'" />
      </el-tab-pane>
      <el-tab-pane v-if="checkPermission([100])" label="点位类型" name="second">
        <point-type />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import PointConfig from './Index'
import PointType from './PointType'
import { checkPermission } from '@/utils/permissions'
export default {
  components: {
    PointConfig,
    PointType
  },
  data() {
    return {
      tabsActive: 'first',
      checkPermission
    }
  },
  mounted() {
    this.tabsActive = checkPermission([98]) ? 'first' : 'second'
  }
}
</script>

<style lang="scss">
.point-connect {
  .el-tabs__header {
    margin-bottom: 0;
  }
  .el-tabs__nav-scroll {
    padding-left: 40px;
    background: #fff;
  }
}
</style>
