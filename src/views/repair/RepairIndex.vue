<template>
  <el-tabs class="page-tabs" v-model="activeName">
    <el-tab-pane label="维修工单（App）" name="first">
      <RepairAppOrder />
    </el-tab-pane>
    <el-tab-pane label="维修工单（微信）" name="second">
      <RepairWechat />
    </el-tab-pane>
    <el-tab-pane
      v-if="this.companyId === 2"
      label="设备维修记录表"
      name="thrid"
    >
      <SGMaintenanceOrder />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import SGMaintenanceOrder from './SGMaintenanceOrder/Index'
import RepairAppOrder from './repairApp/Index'
import RepairWechat from './RepairWechat'
export default {
  name: 'MaintenanceManage_repairDetail',
  components: { SGMaintenanceOrder, RepairAppOrder, RepairWechat },
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
