<template>
  <div class="content-box alarm-push-statistical">
    <ChartBox :date-range="dateRange" />
    <TableBox @change="val => (dateRange = val)" />
  </div>
</template>

<script>
import ChartBox from './ChartBox'
import TableBox from './TableBox'
export default {
  components: {
    ChartBox,
    TableBox
  },
  data() {
    return {
      dateRange: undefined
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-push-statistical {
  background-color: transparent;
  padding: 0;
  .box {
    padding: 24px;
    background-color: #fff;
    border-radius: 4px;
  }
}
</style>
