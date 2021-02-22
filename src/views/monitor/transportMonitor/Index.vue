<template>
  <div class="transport-monitor">
    <el-tabs v-model="activeName">
      <el-tab-pane label="出库运单" name="first">
        <WaybillOutbound />
      </el-tab-pane>
      <el-tab-pane label="车辆管理" name="second">
        <CarManage />
      </el-tab-pane>
      <el-tab-pane label="导入运单记录" name="thrid">
        <WaybillComplete />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import CarManage from './CarManage'
import WaybillComplete from './WaybillComplete'
import WaybillOutbound from './waybillOutbound/Index'
export default {
  name: 'TransportManage',
  components: {
    WaybillComplete,
    WaybillOutbound,
    CarManage
  },
  data() {
    return {
      activeName: 'first'
    }
  }
}
</script>

<style lang="scss">
.transport-monitor {
  .el-tabs__nav-scroll {
    padding-left: 40px;
    background: #fff;
  }
  .el-tabs__header {
    margin: 0;
  }
}
</style>
