<template>
  <div class="store-electricity">
    <el-tabs class="page-tabs" v-model="activeName">
      <el-tab-pane v-if="checkPermission([153])" label="电表列表" name="first">
        <StoreList />
      </el-tab-pane>
      <el-tab-pane v-if="checkPermission([155])" label="充值记录" name="second">
        <RechargeRecord />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import StoreList from './storeList/Index'
import RechargeRecord from './rechargeRecord/Index'
import { checkPermission } from '@/utils/permissions'

export default {
  components: {
    StoreList,
    RechargeRecord
  },
  data() {
    return {
      activeName: 'first',
      checkPermission
    }
  },
  mounted() {
    if (!checkPermission([153])) {
      this.activeName = 'second'
    }
  }
}
</script>

<style lang="scss">
.store-electricity {
}
</style>
