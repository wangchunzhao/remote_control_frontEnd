<template>
  <el-tabs class="page-tabs" v-model="activeName">
    <el-tab-pane label="维修工单（App）" name="first">
      <RepairAppOrder />
    </el-tab-pane>
    <el-tab-pane
      v-if="this.companyId === 2"
      label="设备维修记录表"
      name="second"
    >
      <SGMaintenanceOrder />
    </el-tab-pane>
    <el-tab-pane label="维修工单（微信）" name="thrid">
      <RepairWechatOrder />
    </el-tab-pane>
    <el-tab-pane label="保养工单" name="fourth">
      <MaintenanceOrder />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import MaintenanceOrder from './MaintenanceOrder'
import RepairAppOrder from '@/views/repair/repairApp/Index'
import RepairWechatOrder from './RepairWechatOrder'
import SGMaintenanceOrder from '@/views/repair/SGMaintenanceOrder/Index'
export default {
  name: 'MaintenanceManage_repairDetail',
  components: {
    MaintenanceOrder,
    RepairAppOrder,
    RepairWechatOrder,
    SGMaintenanceOrder
  },
  data() {
    return {
      activeName: 'first'
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  }
}
</script>
