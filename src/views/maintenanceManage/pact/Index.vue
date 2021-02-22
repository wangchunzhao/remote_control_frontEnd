<template>
  <el-tabs class="page-tabs" v-model="activeName">
    <el-tab-pane label="合同订立" name="first">
      <Make />
    </el-tab-pane>
    <!-- <el-tab-pane label="合同签约" name="second">
      <Signing />
    </el-tab-pane> -->
  </el-tabs>
</template>

<script>
import Make from './Make'
// import Signing from './Signing'
export default {
  components: {
    Make
    // Signing
  },
  data() {
    return {
      activeName: undefined
    }
  },
  mounted() {
    this.activeName = this.$route.query.selectTab || 'first'
  }
}
</script>
