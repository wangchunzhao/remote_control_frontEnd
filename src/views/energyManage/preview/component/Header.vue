<template>
  <div class="energy_manage-preview-header">
    <div class="item">
      <div class="label">今日用电(kWh)</div>
      <div class="value">{{ data.todayElectricityUse }}</div>
    </div>
    <div class="item">
      <div class="label">本周用电(kWh)</div>
      <div class="value">{{ data.currentWeekElectricityUse }}</div>
    </div>
    <div class="item">
      <div class="label">上周用电(kWh)</div>
      <div class="value">{{ data.lastWeekElectricityUse }}</div>
    </div>
    <div class="item">
      <div class="label">本月用电量(kWh)</div>
      <div class="value">{{ data.currentMonthElectricityUse }}</div>
    </div>
    <div class="item">
      <div class="label">上月用电量(kWh)</div>
      <div class="value">{{ data.lastMonthElectricityUse }}</div>
    </div>
  </div>
</template>

<script>
import { getEnergyTimeContrastBrokenLine } from '@/api/energyStatistical'
import dayjs from 'dayjs'
export default {
  computed: {
    sidebarStatus() {
      return this.$store.state.app.sidebar
    },
    structTree() {
      return this.$store.state.energy.energyStruct
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    data: function() {
      return this.$store.state.energy.previewData
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      const dates = []
      const now = new Date()
      dates.push({
        StartDate: dayjs(now)
          .startOf('week')
          .format('YYYY-MM-DD'),
        EndDate: dayjs(now)
          .endOf('week')
          .add(1, 's')
          .format('YYYY-MM-DD')
      })
      dates.push({
        StartDate: dayjs(now)
          .subtract(1, 'week')
          .startOf('week')
          .format('YYYY-MM-DD'),
        EndDate: dayjs(now)
          .startOf('week')
          .format('YYYY-MM-DD')
      })
      getEnergyTimeContrastBrokenLine({
        dateType: 2,
        timeQuantumList: dates,
        modelTreeIdList: this.structTree
          .find(item => {
            return item.SubentryId === 1
          })
          .ModelTreeList.map(item => {
            return item.ModelTreeId
          })
      })
        .then(res => {
          if (200 === res.data.Code) {
            let data = res.data.Data
            data.DataList.forEach((item, index) => {
              if (0 === index) {
                // 如果选的分项是电量的话
                this.$store.commit('UPDATE_PREVIEW_DATA', {
                  currentWeekElectricityUse: item.Total
                })
              } else {
                // 如果选的分项是电量的话
                this.$store.commit('UPDATE_PREVIEW_DATA', {
                  lastWeekElectricityUse: item.Total
                })
              }
            })
          } else {
            this.$message.error('数据获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('数据获取失败')
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
