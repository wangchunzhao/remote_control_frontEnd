<template>
  <el-row :gutter="20" class="repair">
    <el-col :span="24">
      <div class="left">
        <el-button
          :class="isactive === 1 ? 'el-button--primary changeBtn' : 'btncolor'"
          size="small"
          @click="handleEfficiency(1)"
        >
          工单统计
        </el-button>
        <el-button
          :class="isactive === 2 ? 'el-button--primary changeBtn' : 'btncolor'"
          size="small"
          @click="handleEfficiency(2)"
        >
          维修项目分析
        </el-button>
      </div>
      <div v-show="isactive === 1 ? true : false" class="right">
        <el-col :span="24" class="commonWrapper">
          <div class="commonBox clearfix bg-fff">
            <el-col :span="24" class="commonHeader">
              <c-svg name="table" class-name="commonImg" />
              <span class="commonTitle">工单统计</span>
            </el-col>
            <el-col :span="24">
              <div class="clearfix" style="padding:15px 5px;">
                <el-table :data="data" highlight-current-row>
                  <el-table-column prop="Time" label="时间" />
                  <el-table-column prop="SumCount" label="全部" align="right" />
                  <el-table-column
                    prop="Acceptance"
                    label="待受理"
                    align="right"
                  />
                  <el-table-column
                    prop="Dispatching"
                    label="待派工"
                    align="right"
                  />
                  <el-table-column prop="Orders" label="待接单" align="right" />
                  <el-table-column
                    prop="Maintenance"
                    label="待完工"
                    align="right"
                  />
                  <el-table-column
                    prop="Completed"
                    label="已完工"
                    align="right"
                  />
                  <el-table-column prop="Check" label="已验收" align="right" />
                  <el-table-column
                    prop="Evaluate"
                    label="已评价"
                    align="right"
                  />
                </el-table>
              </div>
            </el-col>
          </div>
        </el-col>
      </div>
      <div v-show="isactive === 2 ? true : false" class="right">
        <el-col :span="24" class="commonWrapper">
          <div class="commonBox clearfix bg-fff">
            <el-col :span="24" class="commonHeader">
              <c-svg name="table" class-name="commonImg" />
              <span class="commonTitle">维修项目统计</span>
              <div class="groupBtns">
                <el-button
                  size="small"
                  :class="{ 'el-button--primary': timeselect == 0 }"
                  plain
                  @click="timeSelect(0)"
                >
                  本年
                </el-button>
                <el-button
                  size="small"
                  :class="{ 'el-button--primary': timeselect == 1 }"
                  plain
                  @click="timeSelect(1)"
                >
                  上月
                </el-button>
                <el-button
                  size="small"
                  :class="{ 'el-button--primary': timeselect == 2 }"
                  plain
                  @click="timeSelect(2)"
                >
                  本月
                </el-button>
                <span>自定义:</span>
                <el-date-picker
                  v-model="timerange"
                  class="timeRangeBtn"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="dateOptions"
                  size="small"
                  @change="handeltimeselect"
                />
              </div>
            </el-col>
            <el-col :span="24">
              <div class="clearfix" style="padding:15px 5px;">
                <el-table :data="datas" highlight-current-row max-height="290">
                  <el-table-column type="index" label="序号" width="80" />
                  <el-table-column
                    prop="pname"
                    label="维修项目"
                    min-width="180"
                  />
                  <el-table-column
                    prop="Repair_Count"
                    label="工作总量（次）"
                    min-width="150"
                    align="right"
                  />
                  <el-table-column
                    prop="SumCost"
                    label="维修费总额（元）"
                    min-width="150"
                    align="right"
                  />
                  <el-table-column
                    prop="PaidCount"
                    label="有偿（次）"
                    min-width="150"
                    align="right"
                  />
                  <el-table-column
                    prop="SumCost"
                    label="维修费（元）"
                    min-width="150"
                    align="right"
                  />
                  <el-table-column
                    prop="FreeCount"
                    label="无偿（次）"
                    min-width="150"
                    align="right"
                  />
                  <el-table-column
                    label="维修费（元）"
                    min-width="150"
                    align="right"
                  >
                    <template>
                      <div>0.00</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>
          </div>
        </el-col>
        <el-col :span="24" class="commonWrapper">
          <div class="commonBox clearfix bg-fff">
            <el-col :span="24" class="commonHeader">
              <c-svg name="table" class-name="commonImg" />
              <span class="commonTitle">项目分析</span>
              <select v-model="type" class="changeBtn1">
                <option
                  v-for="item in list"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </select>
            </el-col>
            <el-col :span="24">
              <div class="clearfix" style="padding:15px 5px;">
                <div class="groupBtn">
                  <span>报修时间:</span>
                  <el-button
                    size="small"
                    :class="{ 'el-button--primary': timeselects == 0 }"
                    plain
                    @click="timeSelects(0)"
                  >
                    本年
                  </el-button>
                  <el-button
                    size="small"
                    :class="{ 'el-button--primary': timeselects == 1 }"
                    plain
                    @click="timeSelects(1)"
                  >
                    本月
                  </el-button>
                  <el-button
                    size="small"
                    :class="{ 'el-button--primary': timeselects == 2 }"
                    plain
                    @click="timeSelects(2)"
                  >
                    本周
                  </el-button>
                  <el-button
                    size="small"
                    :class="{ 'el-button--primary': timeselects == 3 }"
                    plain
                    @click="timeSelects(3)"
                  >
                    昨天
                  </el-button>
                  <el-button
                    size="small"
                    :class="{ 'el-button--primary': timeselects == 4 }"
                    plain
                    @click="timeSelects(4)"
                  >
                    今天
                  </el-button>
                  <div style="display:inline-block;">
                    <span>自定义:</span>
                    <el-date-picker
                      v-model="timeranges"
                      class="timeRangeBtn"
                      type="daterange"
                      align="right"
                      unlink-panels
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      :picker-options="dateOptions"
                      size="small"
                      @change="handeltimeselects"
                    />
                  </div>
                </div>
              </div>
              <el-col :span="12" style="height:200px">
                <div id="pieChart" style="height:200px;" />
              </el-col>
              <el-col :span="12">
                <el-table :data="table" highlight-current-row max-height="176">
                  <el-table-column prop="name" label="维修项目" />
                  <el-table-column prop="value" label="维修数量" />
                </el-table>
              </el-col>
            </el-col>
          </div>
        </el-col>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import { getRepairOrderStatistics, getRepairCostStatistics } from '@/api/repair'
// import echarts from 'echarts'
export default {
  data() {
    return {
      dateOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      timerange: '',
      timeranges: '',
      list: [
        {
          id: 1,
          name: '报修总量'
        },
        {
          id: 2,
          name: '维修总额'
        },
        {
          id: 3,
          name: '有偿次数'
        },
        {
          id: 4,
          name: '有偿费用'
        },
        {
          id: 5,
          name: '无偿次数'
        },
        {
          id: 6,
          name: '无偿费用'
        }
      ],
      type: 1,
      data: [],
      datas: [],
      isactive: 1,
      timeselect: 0,
      timeselects: 0,
      table: []
    }
  },
  mounted() {
    // 获取‘工单统计’列表数据
    getRepairOrderStatistics()
      .then(res => {
        this.data = JSON.parse(res.data)
      })
      .catch(err => {
        console.error(err)
      })
    this.startTime = new Date().getFullYear() + '/1/1'
    this.endTime = new Date().getFullYear() + '/12/31' + ' 23:59:59'
    this.count_GetRepair_Cost_Statistics()
    this.analysis_GetRepair_Cost_Statistics()
  },
  methods: {
    handeltimeselect() {
      var time = this.timerange
      this.startTime = time[0].format('yyyy/MM/dd')
      this.endTime = time[1].format('yyyy/MM/dd')
      this.count_GetRepair_Cost_Statistics()
    },
    handeltimeselects() {
      var times = this.timeranges
      this.startTime = times[0].format('yyyy/MM/dd')
      this.endTime = times[1].format('yyyy/MM/dd')
      this.analysis_GetRepair_Cost_Statistics()
    },
    timeSelect(val) {
      this.timeselect = val
      switch (val) {
        case 0:
          this.startTime = new Date().getFullYear() + '/1/1'
          this.endTime = new Date().getFullYear() + '/12/31' + ' 23:59:59'
          break
        case 1:
          this.startTime = this.showPreviousMonthFirstDay()
          this.endTime = this.showPreviousMonthLasttDay() + ' 23:59:59'
          break
        case 2:
          this.startTime = this.showMonthFirstDay()
          this.endTime = this.showMonthLastDay() + ' 23:59:59'
          break
      }
      this.count_GetRepair_Cost_Statistics()
    },
    timeSelects(val) {
      this.timeselects = val
      switch (val) {
        case 0:
          this.startTime = new Date().getFullYear() + '/1/1'
          this.endTime = new Date().getFullYear() + '/12/31' + ' 23:59:59'
          break
        case 1:
          this.startTime = this.showMonthFirstDay()
          this.endTime = this.showMonthLastDay() + ' 23:59:59'
          break
        case 2:
          this.startTime = this.showWeekFirstDay()
          this.endTime = this.showWeekLastDay() + ' 23:59:59'
          break
        case 3:
          this.startTime = this.showYestoday()
          this.endTime = new Date().format('yyyy/MM/dd') + ' 23:59:59'
          break
        case 4:
          this.startTime = new Date().format('yyyy/MM/dd')
          this.endTime = this.startTime + ' 23:59:59'
      }
      this.analysis_GetRepair_Cost_Statistics()
    },
    // 获取维修项目统计list
    count_GetRepair_Cost_Statistics() {
      getRepairCostStatistics(this.startTime, this.endTime)
        .then(res => {
          this.datas = JSON.parse(res.data).data
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取项目分析
    analysis_GetRepair_Cost_Statistics() {
      getRepairCostStatistics(this.startTime, this.endTime)
        .then(res => {
          var chartData = []
          for (var i = 0; i < JSON.parse(res.data).Chart.length; i++) {
            chartData.push({
              name: JSON.parse(res.data).Chart[i][0],
              value: JSON.parse(res.data).Chart[i][1]
            })
          }
          this.table = chartData
          this.drawPieChart(chartData)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 昨天
    showYestoday() {
      var tom = new Date()
      tom.setDate(tom.getDate() - 1)
      var M = Number(tom.getMonth()) + 1
      return tom.getFullYear() + '/' + M + '/' + tom.getDate()
    },
    // 本周的第一天
    showWeekFirstDay() {
      var Nowdate = new Date()
      var WeekFirstDay = new Date(Nowdate - (Nowdate.getDay() - 1) * 86400000)
      var M = Number(WeekFirstDay.getMonth()) + 1
      return WeekFirstDay.getFullYear() + '/' + M + '/' + WeekFirstDay.getDate()
    },
    // 本周的最后一天
    showWeekLastDay() {
      var Nowdate = new Date()
      var WeekFirstDay = new Date(Nowdate - (Nowdate.getDay() - 1) * 86400000)
      var WeekLastDay = new Date((WeekFirstDay / 1000 + 6 * 86400) * 1000)
      var M = Number(WeekLastDay.getMonth()) + 1
      return WeekLastDay.getFullYear() + '/' + M + '/' + WeekLastDay.getDate()
    },
    // 上个月的第一天
    showPreviousMonthFirstDay() {
      var Nowdate = new Date()
      var previousMonthFirstDay = new Date(
        Nowdate.getFullYear(),
        Nowdate.getMonth(),
        1
      )
      var M = Number(previousMonthFirstDay.getMonth())
      return (
        previousMonthFirstDay.getFullYear() +
        '/' +
        M +
        '/' +
        previousMonthFirstDay.getDate()
      )
    },
    // 上个月的最后一天
    showPreviousMonthLasttDay() {
      var Nowdate = new Date()
      var MonthFirstDay = new Date(Nowdate.getFullYear(), Nowdate.getMonth(), 1)
      var previousMonthLastDay = new Date(MonthFirstDay - 86400000)
      var M = Number(previousMonthLastDay.getMonth() + 1)
      return (
        previousMonthLastDay.getFullYear() +
        '/' +
        M +
        '/' +
        previousMonthLastDay.getDate()
      )
    },
    // 本月的第一天
    showMonthFirstDay() {
      var Nowdate = new Date()
      var MonthFirstDay = new Date(Nowdate.getFullYear(), Nowdate.getMonth(), 1)
      var M = Number(MonthFirstDay.getMonth()) + 1
      return (
        MonthFirstDay.getFullYear() + '/' + M + '/' + MonthFirstDay.getDate()
      )
    },
    // 本月的最后一天
    showMonthLastDay() {
      var Nowdate = new Date()
      var MonthNextFirstDay = new Date(
        Nowdate.getFullYear(),
        Nowdate.getMonth() + 1,
        1
      )
      var MonthLastDay = new Date(MonthNextFirstDay - 86400000)
      var M = Number(MonthLastDay.getMonth()) + 1
      return MonthLastDay.getFullYear() + '/' + M + '/' + MonthLastDay.getDate()
    },
    drawPieChart(data) {
      let legendName = []
      for (let i = 0; i < data.length; i++) {
        legendName.push(data[i].name)
      }
      let chart = echarts.init(document.getElementById('pieChart'))
      let option = {
        color: [
          '#2297E8',
          '#48CE38',
          '#F8D156',
          '#FD9827',
          '#9764DC',
          '#1FCA6A'
        ],
        title: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          show: false
        },
        series: [
          {
            name: data.length ? '报修量占比' : '查无数据',
            type: 'pie',
            radius: '60%',
            center: ['50%', '50%'],
            labelLine: {
              // 标识线第一段的长度
              normal: {
                length: 1
              }
            },
            data: data,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chart.setOption(option, true)
      window.addEventListener('resize', chart.resize)
    },
    handleEfficiency(val) {
      setTimeout(function() {
        window.dispatchEvent(new Event('resize'))
      }, 1)
      this.isactive = val
    }
  }
}
</script>
<style lang="scss">
.groupBtns {
  margin-top: -4px;
  float: right;
}
.groupBtn {
  width: 90%;
  text-align: center;
  display: inline-block;
}
.groupBtns .timeRangeBtn,
.groupBtn .timeRangeBtn {
  height: 33px;
}
@import 'src/assets/style/repair.scss';
</style>
