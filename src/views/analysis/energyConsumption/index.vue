<template>
  <div class="energy-consumption-analysis content-box" style="padding: 0;">
    <div class="left-wrap">
      <div class="title">能耗趋势对比</div>
      <Echart :options="chartOptions" style="height: 320px" />
      <Table />
    </div>
    <div class="right-wrap">
      <div class="title">筛选条件</div>
      <div class="secondary-title">日期</div>
      <CustomDatePicker
        :typeArr="['day', 'month', 'year', 'custom']"
        @timeChange="timeChange"
        @typeChange="timeTypeChange"
        ref="customDatePicker"
      ></CustomDatePicker>
      <div class="secondary-title">项目</div>
      <StructTree @change="handleProjectChange" />
    </div>
  </div>
</template>

<script>
import Table from './Table'
import Echart from '@/components/Echart'
import StructTree from './StructTree'
import CustomDatePicker from '@/components/CustomDatePicker'
export default {
  components: {
    Table,
    Echart,
    StructTree,
    CustomDatePicker
  },
  data() {
    return {
      chartOptions: {
        color: ['#46B6FF', '#29CF67'],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          itemWidth: 11,
          itemHeight: 8,
          icon: 'rect',
          data: ['邮件营销', '联盟广告'],
          bottom: 0,
          textStyle: {
            color: '#8C8C8C'
          }
        },
        toolbox: {
          bottom: 0,
          right: 0,
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 40,
          top: 45,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisTick: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.45)'
            }
          },
          axisLabel: {
            color: 'rgba(0, 0, 0, 0.45)'
          },
          splitLine: {
            lineStyle: {
              color: ['rgba(0, 0, 0, 0.45)']
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.45)'
            },
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '用电量/kWh',
          nameTextStyle: {
            color: '#808080'
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: 'rgba(0, 0, 0, 0.45)'
          },
          axisLine: {
            show: false
          }
        },
        series: [
          {
            name: '邮件营销',
            type: 'line',
            symbol: 'none',
            areaStyle: {},
            // emphasis: {
            //   focus: 'series'
            // },
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: '联盟广告',
            type: 'line',
            symbol: 'none',
            areaStyle: {},
            // emphasis: {
            //   focus: 'series'
            // },
            data: [220, 182, 191, 234, 290, 330, 310]
          }
        ]
      }
    }
  },
  methods: {
    handleProjectChange(val) {
      console.log('[123]-index.vue', val)
    },
    timeChange(val) {
      console.log('[135]-index.vue', val)
    },
    timeTypeChange(val) {
      console.log('[138]-index.vue', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.energy-consumption-analysis {
  display: flex;
  .left-wrap {
    flex: 1;
    padding: 16px 24px;
  }
  .right-wrap {
    flex: 0 0 340px;
    box-sizing: border-box;
    padding: 16px 30px;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }
  .title {
    font-size: 16px;
    color: #000000;
    line-height: 24px;
  }
  .secondary-title {
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 8px;
    margin-top: 20px;
  }
}
</style>
