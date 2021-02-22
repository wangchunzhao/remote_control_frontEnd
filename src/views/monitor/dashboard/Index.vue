<template>
  <component :is="'DashboardCommon'" />
  <!-- <component
    :is="'DashboardCommon"
  /> -->
</template>
<script>
import DashboardCommon from './common/Index'
import DashboardChicken from './chicken/Index'
export default {
  name: 'MonitorDashboard',
  components: {
    DashboardChicken,
    DashboardCommon
  },
  computed: {
    project() {
      return this.$store.state.app.project
    }
  }
}
</script>
