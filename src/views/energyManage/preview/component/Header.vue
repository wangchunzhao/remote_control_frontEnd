<template>
  <div class="energy_manage-preview-header">
    <div class="item">
      <div class="label">监测点数量</div>
      <div class="value">{{ data.mointorPointNum }}</div>
    </div>
    <div class="item">
      <div class="label">区域数量</div>
      <div class="value">{{ data.areaNum }}</div>
    </div>
    <div class="item">
      <div class="label">今日用电(kWh)</div>
      <div class="value">{{ data.todayElectricityUse }}</div>
    </div>
    <div class="item">
      <div class="label">今日最大负荷(kW)</div>
      <div class="value">{{ data.todayElectricityLoad }}</div>
    </div>
    <div class="item">
      <div class="label">本月用电量(kWh)</div>
      <div class="value">{{ data.currentMonthElectricityUse }}</div>
    </div>
  </div>
</template>

<script>
import { getEnergyNum } from '@/api/energyStatistical'
export default {
  computed: {
    projectId: function() {
      return this.$store.state.app.project.id
    },
    data: function() {
      // mointorPointNum: '-',
      // areaNum: '-',
      // todayElectricityUse: '-',
      // todayElectricityLoad: '-',
      // currentMonthElectricityUse: '-'
      return this.$store.state.energy.previewData
    }
  },
  watch: {
    projectId: function() {
      // this.fetchData()
    }
  },
  mounted: function() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      getEnergyNum({
        projectId: this.projectId
      })
        .then(e => {
          if (200 === e.data.Code) {
            var data = e.data.Data
            this.$store.commit('UPDATE_PREVIEW_DATA', {
              mointorPointNum: data.Key,
              areaNum: data.Value
            })
          } else
            this.$store.commit('UPDATE_PREVIEW_DATA', {
              mointorPointNum: '-',
              areaNum: '-'
            })
        })
        .catch(function(err) {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.energy_manage-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96px;
  padding: 0 32px;
  background: #fff;
  border-radius: 4px;
  .item {
    text-align: center;
  }
  .value {
    font-size: 20px;
    margin-top: 8px;
  }
  .label {
    font-size: 12px;
    color: #c0c4cc;
  }
}
</style>
