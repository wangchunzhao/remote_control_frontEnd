<template>
  <div class="analysis-home content-box">
    <div>
      <div class="part-title-box">
        <div class="part-big-title">昨日概览</div>
        <div class="part-big-time">
          数据更新至{{
            dayjs()
              .subtract(1, 'day')
              .format('YYYY-MM-DD')
          }}
        </div>
      </div>
      <div style="display: flex;align-items: center;margin-bottom: 25px">
        <div
          style="flex: 1;margin-right: 10px"
          @mouseenter="() => (storeCardShow = true)"
          @mouseleave="() => (storeCardShow = false)"
        >
          <el-card shadow="hover">
            <div class="part-item">
              <div class="part-top">
                <div class="part-title">总门店数</div>
              </div>
              <div class="part-center">
                <div class="part-value">
                  {{ overviewData.ProjectNum ? overviewData.ProjectNum : 0 }}
                </div>
              </div>
              <div class="part-step">
                <div id="totalNumStoreEchart" class="part-value-step"></div>
              </div>
              <div v-show="storeCardShow" class="part-item-hover-box">
                <div class="part-item-hover-item">
                  在线：
                  {{
                    overviewData.OnlineProjectNum
                      ? overviewData.OnlineProjectNum
                      : 0
                  }}
                </div>
                <div class="part-item-hover-item">
                  离线：
                  {{
                    overviewData.ProjectNum
                      ? overviewData.ProjectNum - overviewData.OnlineProjectNum
                      : 0
                  }}
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div
          style="flex: 1;margin:0 10px"
          @mouseenter="() => (deviceCardShow = true)"
          @mouseleave="() => (deviceCardShow = false)"
        >
          <el-card shadow="hover">
            <div class="part-item">
              <div class="part-top">
                <div class="part-title">总设备数</div>
                <el-button
                  type="text"
                  class="part-entry"
                  @click.native="$router.push({ path: '/analysis/device' })"
                >
                  跨项目对比
                  <i class="el-icon-arrow-right"></i>
                </el-button>
              </div>
              <div class="part-center">
                <div class="part-value">
                  {{ overviewData.DeviceNum ? overviewData.DeviceNum : 0 }}
                </div>
              </div>
              <div class="part-step">
                <div id="totalNumDeviceEchart" class="part-value-step"></div>
              </div>
              <div v-show="deviceCardShow" class="part-item-hover-box">
                <div class="part-item-hover-item">
                  在线：
                  {{
                    overviewData.OnlineDeviceNum
                      ? overviewData.OnlineDeviceNum
                      : 0
                  }}
                </div>
                <div class="part-item-hover-item">
                  离线：
                  {{
                    overviewData.DeviceNum
                      ? overviewData.DeviceNum - overviewData.OnlineDeviceNum
                      : 0
                  }}
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div style="flex: 1;margin:0 10px">
          <el-card shadow="never">
            <div class="part-item">
              <div class="part-top">
                <div class="part-title">总报警数</div>
              </div>
              <div class="part-center">
                <div class="part-value">
                  {{ overviewData.AlarmNum ? overviewData.AlarmNum : 0 }}
                </div>
              </div>
              <div class="part-line"></div>
              <div class="part-bottom">
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">日</div>
                  <div
                    :class="[
                      overviewData.DayAlarmIncrease > 0
                        ? 'red-font'
                        : overviewData.DayAlarmIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.DayAlarmIncrease !== 0"
                      :class="[
                        overviewData.DayAlarmIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.DayAlarmIncrease }}%
                  </div>
                </div>
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">周</div>
                  <div
                    :class="[
                      overviewData.WeekAlarmIncrease > 0
                        ? 'red-font'
                        : overviewData.WeekAlarmIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.WeekAlarmIncrease !== 0"
                      :class="[
                        overviewData.WeekAlarmIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.WeekAlarmIncrease }}%
                  </div>
                </div>
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">月</div>
                  <div
                    :class="[
                      overviewData.MonthAlarmIncrease > 0
                        ? 'red-font'
                        : overviewData.MonthAlarmIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.MonthAlarmIncrease !== 0"
                      :class="[
                        overviewData.MonthAlarmIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.MonthAlarmIncrease }}%
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div style="flex: 1;margin:0 10px">
          <el-card shadow="never">
            <div class="part-item">
              <div class="part-top">
                <div class="part-title">总能耗</div>
                <el-button
                  @click.native="
                    () => $router.push('/analysis/energyConsumption')
                  "
                  type="text"
                  class="part-entry"
                >
                  跨项目对比
                  <i class="el-icon-arrow-right"></i>
                </el-button>
              </div>
              <div class="part-center">
                <div class="part-value">
                  {{
                    overviewData.EnergySum !== undefined
                      ? (overviewData.EnergySum / 10000).toFixed(1)
                      : 0
                  }}
                </div>
                <div class="part-unit">万度</div>
              </div>
              <div class="part-line"></div>
              <div class="part-bottom">
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">日</div>
                  <div
                    :class="[
                      overviewData.DayEnergyIncrease > 0
                        ? 'red-font'
                        : overviewData.DayEnergyIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.DayEnergyIncrease !== 0"
                      :class="[
                        overviewData.DayEnergyIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.DayEnergyIncrease }}%
                  </div>
                </div>
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">周</div>
                  <div
                    :class="[
                      overviewData.WeekEnergyIncrease > 0
                        ? 'red-font'
                        : overviewData.WeekEnergyIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.WeekEnergyIncrease !== 0"
                      :class="[
                        overviewData.WeekEnergyIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.WeekEnergyIncrease }}%
                  </div>
                </div>
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">月</div>
                  <div
                    :class="[
                      overviewData.MonthEnergyIncrease > 0
                        ? 'red-font'
                        : overviewData.MonthEnergyIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.MonthEnergyIncrease !== 0"
                      :class="[
                        overviewData.MonthEnergyIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.MonthEnergyIncrease }}%
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div style="flex: 1;margin-left:10px">
          <el-card shadow="never">
            <div class="part-item">
              <div class="part-top">
                <div class="part-title">总维修数</div>
              </div>
              <div class="part-center">
                <div class="part-value">
                  {{ overviewData.RepairSum ? overviewData.RepairSum : 0 }}
                </div>
              </div>
              <div class="part-line"></div>
              <div class="part-bottom">
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">日</div>
                  <div
                    :class="[
                      overviewData.DayRepairIncrease > 0
                        ? 'red-font'
                        : overviewData.DayRepairIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.DayRepairIncrease !== 0"
                      :class="[
                        overviewData.DayRepairIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.DayRepairIncrease }}%
                  </div>
                </div>
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">周</div>
                  <div
                    :class="[
                      overviewData.WeekRepairIncrease > 0
                        ? 'red-font'
                        : overviewData.WeekRepairIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.WeekRepairIncrease !== 0"
                      :class="[
                        overviewData.WeekRepairIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.WeekRepairIncrease }}%
                  </div>
                </div>
                <div class="part-bottom-item">
                  <div class="part-bottom-item-title">月</div>
                  <div
                    :class="[
                      overviewData.MonthRepairIncrease > 0
                        ? 'red-font'
                        : overviewData.MonthRepairIncrease < 0
                        ? 'green-font'
                        : 'light-font'
                    ]"
                  >
                    <i
                      v-if="overviewData.MonthRepairIncrease !== 0"
                      :class="[
                        overviewData.MonthRepairIncrease > 0
                          ? 'el-icon-caret-top'
                          : 'el-icon-caret-bottom'
                      ]"
                    />
                  </div>
                  <div class="part-bottom-item-value">
                    {{ overviewData.MonthRepairIncrease }}%
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <el-row type="flex" :gutter="25" style="flex-wrap: wrap;">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报警数量趋势</span>
            <el-select
              v-model="chart1_2Select"
              size="mini"
              style="width: 80px;margin-left: 15px;"
              @change="renderChart1_2"
            >
              <el-option label="昨日" value="lastDay" />
              <el-option label="上周" value="lastWeek" />
              <el-option label="上月" value="lastMonth" />
            </el-select>
            <el-button
              type="text"
              style="float: right;margin-top: 6px;"
              @click.native="$router.push({ path: '/analysis/alarm' })"
            >
              报警数量统计报告
              <i class="el-icon-arrow-right el-icon--right" />
            </el-button>
          </div>
          <div>
            <line-chart
              :data="chart1_2Data"
              :date-type="chart1_2Select"
              :loading="chart1_2Loading"
              dom-id="chart1_2"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">用电量趋势</span>
            <el-select
              v-model="chart2_1Select"
              size="mini"
              style="width: 80px;margin-left: 15px;"
              @change="renderChart2_1()"
            >
              <el-option label="昨日" value="lastDay" />
              <el-option label="上周" value="lastWeek" />
              <el-option label="上月" value="lastMonth" />
            </el-select>
            <el-button
              type="text"
              style="float: right;margin-top: 6px;"
              @click.native="$router.push({ path: '/analysis/electricity' })"
            >
              用电量统计报告
              <i class="el-icon-arrow-right el-icon--right" />
            </el-button>
          </div>
          <div>
            <line-chart
              :data="chart2_1Data"
              :date-type="chart2_1Select"
              :loading="chart2_1Loading"
              dom-id="chart2_1"
            />
          </div>
        </el-card>
      </el-col>
      <!-- 苏果公司才有 商户用电趋势 -->
      <el-col v-if="companyId === 2" :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">商户用电趋势</span>
            <el-select
              v-model="chartStoreElectricitySelect"
              size="mini"
              style="width: 80px;margin-left: 15px;"
              @change="renderChartStoreElectricity()"
            >
              <el-option label="昨日" value="lastDay" />
              <el-option label="上周" value="lastWeek" />
              <el-option label="上月" value="lastMonth" />
            </el-select>
            <el-button
              type="text"
              style="float: right;margin-top: 6px;"
              @click.native="$router.push({ name: 'analysisStoreElectricity' })"
            >
              商户用电统计报告
              <i class="el-icon-arrow-right el-icon--right" />
            </el-button>
          </div>
          <div>
            <line-chart
              :data="chartStoreElectricityData"
              :date-type="chartStoreElectricitySelect"
              :loading="chartStoreElectricityLoading"
              dom-id="chartStoreElectricity"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报警响应分布</span>
            <el-select
              v-model="chart4_1Select"
              size="mini"
              style="width: 80px;margin-left: 15px;"
              @change="renderChart4_1"
            >
              <el-option label="昨日" value="lastDay" />
              <el-option label="上周" value="lastWeek" />
              <el-option label="上月" value="lastMonth" />
            </el-select>
          </div>
          <div>
            <pie-chart
              :data="chart4_1Data"
              :loading="chart4_1Loading"
              dom-id="chart4_1"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报警等级分布</span>
            <el-select
              v-model="chart3_2Select"
              size="mini"
              style="width: 80px;margin-left: 15px;"
              @change="renderChart3_2"
            >
              <el-option label="昨日" value="lastDay" />
              <el-option label="上周" value="lastWeek" />
              <el-option label="上月" value="lastMonth" />
            </el-select>
          </div>
          <div>
            <pie-chart
              :data="chart3_2Data"
              :loading="chart3_2Loading"
              dom-id="chart3_2"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报修趋势</span>
            <el-select
              v-model="chart2_2Select"
              size="mini"
              style="width: 80px;margin-left: 15px;"
              @change="renderChart2_2"
            >
              <el-option label="昨日" value="lastDay" />
              <el-option label="上周" value="lastWeek" />
              <el-option label="上月" value="lastMonth" />
            </el-select>
            <el-button
              type="text"
              style="float: right;margin-top: 6px;"
              @click.native="$router.push({ path: '/analysis/repair' })"
            >
              报修数量统计报告
              <i class="el-icon-arrow-right el-icon--right" />
            </el-button>
          </div>
          <div>
            <line-chart
              :data="chart2_2Data"
              :date-type="chart2_2Select"
              :loading="chart2_2Loading"
              dom-id="chart2_2"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title">报修故障原因前10</span>
            <el-select
              v-model="chart4_2Select"
              size="mini"
              style="width: 80px;margin-left: 15px;"
              @change="renderChart4_2"
            >
              <el-option label="昨日" value="lastDay" />
              <el-option label="上周" value="lastWeek" />
              <el-option label="上月" value="lastMonth" />
            </el-select>
          </div>
          <div>
            <bar-chart
              :data="chart4_2Data"
              :loading="chart4_2Loading"
              dom-id="chart4_2"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LineChart from './component/LineChart'
import PieChart from './component/PieChart'
import BarChart from './component/BarChart'
import {
  getAlarmLevelPie,
  getAlarmTimePie,
  getAlarmNumBrokenLine
} from '@/api/alarmStatistical'
import {
  getMaintenanceBrokenLine,
  getElectricBrokenLine
} from '@/api/maintenanceStatistical'
import {
  getYesterDayOverview,
  getPassengerBrokenLine,
  getFaultDescribeRanking
} from '@/api/overviewStatistical'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // load on demand
import {
  totalNumDeviceEchartOptions,
  totalNumStoreEchartOptions
} from './component/echartsOption'
dayjs.locale('zh-cn')

const timeMap = {
  lastDay: {
    start: dayjs()
      .subtract(1, 'day')
      .format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
    dateType: 1
  },
  lastWeek: {
    start: dayjs()
      .subtract(1, 'week')
      .startOf('week')
      .format('YYYY-MM-DD'),
    end: dayjs()
      .startOf('week')
      .format('YYYY-MM-DD'),
    dateType: 2
  },
  lastMonth: {
    start: dayjs()
      .subtract(1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD'),
    end: dayjs()
      .startOf('month')
      .format('YYYY-MM-DD'),
    dateType: 3
  }
}

export default {
  name: 'AnalysisDashboard',
  components: {
    LineChart,
    PieChart,
    BarChart
  },
  data() {
    return {
      totalNumStoreEchartOptions,
      totalNumDeviceEchartOptions,
      totalNumStoreChart: null,
      totalNumDeviceChart: null,

      overviewLoading: false,
      storeCardShow: false,
      deviceCardShow: false,
      overviewData: {},

      chart1_2Loading: true,
      chart1_2Data: null,
      chart1_2Select: 'lastWeek',

      chart2_1Loading: true,
      chart2_1Data: null,
      chart2_1Select: 'lastWeek',

      chartStoreElectricityLoading: true,
      chartStoreElectricityData: null,
      chartStoreElectricitySelect: 'lastWeek',

      chart2_2Loading: true,
      chart2_2Data: null,
      chart2_2Select: 'lastWeek',

      chart3_1Loading: true,
      chart3_1Data: null,
      chart3_1Select: 'lastWeek',

      chart3_2Loading: true,
      chart3_2Data: null,
      chart3_2Select: 'lastWeek',

      chart4_1Loading: true,
      chart4_1Data: null,
      chart4_1Select: 'lastWeek',

      chart4_2Loading: true,
      chart4_2Data: null,
      chart4_2Select: 'lastWeek',

      dayjs
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.renderChart1_2()
    this.renderChart2_1()
    this.renderChartStoreElectricity()
    this.renderChart2_2()
    // this.renderChart3_1()
    this.renderChart3_2()
    this.renderChart4_1()
    this.renderChart4_2()
    this.totalNumStoreChart = echarts.init(
      document.getElementById('totalNumStoreEchart')
    )
    this.totalNumDeviceChart = echarts.init(
      document.getElementById('totalNumDeviceEchart')
    )
    this.overviewLoading = true
    getYesterDayOverview({
      industry: this.$store.state.app.company.industry,
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          this.overviewData = res.data.Data
          this.totalNumStoreEchartOptions.series[0].data = [
            this.overviewData.OnlineProjectNum
              ? this.overviewData.OnlineProjectNum
              : 0
          ]
          this.totalNumStoreEchartOptions.series[1].data = [
            this.overviewData.ProjectNum ? this.overviewData.ProjectNum : 1
          ]
          this.totalNumDeviceEchartOptions.series[0].data = [
            this.overviewData.OnlineDeviceNum
              ? this.overviewData.OnlineDeviceNum
              : 0
          ]
          this.totalNumDeviceEchartOptions.series[1].data = [
            this.overviewData.DeviceNum ? this.overviewData.DeviceNum : 1
          ]
        } else {
          this.totalNumStoreEchartOptions.series[0].data = []
          this.totalNumStoreEchartOptions.series[1].data = [1]
          this.totalNumDeviceEchartOptions.series[0].data = []
          this.totalNumDeviceEchartOptions.series[1].data = [1]
        }
      })
      .catch(err => {
        console.error(err)
        this.totalNumStoreEchartOptions.series[0].data = []
        this.totalNumStoreEchartOptions.series[1].data = [1]
        this.totalNumDeviceEchartOptions.series[0].data = []
        this.totalNumDeviceEchartOptions.series[1].data = [1]
      })
      .finally(() => {
        this.overviewLoading = false
        this.totalNumStoreChart.setOption(this.totalNumStoreEchartOptions)
        this.totalNumDeviceChart.setOption(this.totalNumDeviceEchartOptions)
      })
  },
  methods: {
    renderChart1_2() {
      this.chart1_2Loading = true
      getAlarmNumBrokenLine({
        companyId: this.companyId,
        dateType: timeMap[this.chart1_2Select].dateType,
        startTime: timeMap[this.chart1_2Select].start,
        endTime: timeMap[this.chart1_2Select].end,
        subareaId: undefined,
        modelBigId: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.TimeList = data.TimeList.map(item =>
              dayjs(item).format('YYYY-MM-DD')
            )
            this.chart1_2Data = {
              list1: data.DataList[0],
              list2: data.DataList[1],
              scopeType: timeMap[this.chart1_2Select].dateType,
              xAxis: data.TimeList,
              yAxisName: '报警数量'
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart1_2Loading = false
        })
    },
    renderChartStoreElectricity() {
      this.chartStoreElectricityLoading = true
      getElectricBrokenLine({
        dateType: timeMap[this.chartStoreElectricitySelect].dateType,
        startDate: timeMap[this.chartStoreElectricitySelect].start,
        endDate: timeMap[this.chartStoreElectricitySelect].end,
        subareaIds: undefined,
        electricType: undefined,
        isShopMeter: true,
        companyId: this.companyId,
        meterType: 1
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.TimeList = data.TimeList.map(item =>
              dayjs(item).format('YYYY-MM-DD')
            )
            this.chartStoreElectricityData = {
              list1: data.DataList[0],
              list2: data.DataList[1],
              scopeType: timeMap[this.chartStoreElectricitySelect].dateType,
              xAxis: data.TimeList,
              yAxisName: '用电量 /kWh'
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chartStoreElectricityLoading = false
        })
    },
    renderChart2_1() {
      this.chart2_1Loading = true
      getElectricBrokenLine({
        dateType: timeMap[this.chart2_1Select].dateType,
        startDate: timeMap[this.chart2_1Select].start,
        endDate: timeMap[this.chart2_1Select].end,
        subareaIds: undefined,
        electricType: undefined,
        companyId: this.companyId,
        meterType: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.TimeList = data.TimeList.map(item =>
              dayjs(item).format('YYYY-MM-DD')
            )
            this.chart2_1Data = {
              list1: data.DataList[0],
              list2: data.DataList[1],
              scopeType: timeMap[this.chart2_1Select].dateType,
              xAxis: data.TimeList,
              yAxisName: '用电量 /kWh'
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart2_1Loading = false
        })
    },
    renderChart2_2() {
      this.chart2_2Loading = true
      getMaintenanceBrokenLine({
        dateType: timeMap[this.chart2_2Select].dateType,
        startDate: timeMap[this.chart2_2Select].start,
        endDate: timeMap[this.chart2_2Select].end,
        subareaId: undefined,
        industry: this.$store.state.app.company.industry,
        modelBigId: undefined,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.TimeList = data.TimeList.map(item =>
              dayjs(item).format('YYYY-MM-DD')
            )
            this.chart2_2Data = {
              list1: data.DataList[0],
              list2: data.DataList[1],
              scopeType: timeMap[this.chart2_2Select].dateType,
              xAxis: data.TimeList,
              yAxisName: '报修数量'
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart2_2Loading = false
        })
    },
    renderChart3_1() {
      this.chart3_1Loading = true
      getPassengerBrokenLine({
        startTime: timeMap[this.chart3_1Select].start,
        endTime: timeMap[this.chart3_1Select].end,
        dateType: timeMap[this.chart3_1Select].dateType,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.TimeList = data.TimeList.map(item =>
              dayjs(item).format('YYYY-MM-DD')
            )
            this.chart3_1Data = {
              list1: data.DataList[0],
              list2: data.DataList[1],
              scopeType: timeMap[this.chart3_1Select].dateType,
              xAxis: data.TimeList,
              yAxisName: '客流量'
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart3_1Loading = false
        })
    },
    renderChart3_2() {
      this.chart3_2Loading = true
      getAlarmLevelPie({
        companyId: this.companyId,
        startTime: timeMap[this.chart3_2Select].start,
        endTime: timeMap[this.chart3_2Select].end,
        industry: this.$store.state.app.company.industry
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.chart3_2Data = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart3_2Loading = false
        })
    },
    renderChart4_1() {
      this.chart4_1Loading = true
      getAlarmTimePie({
        companyId: this.companyId,
        startTime: timeMap[this.chart4_1Select].start,
        endTime: timeMap[this.chart4_1Select].end,
        industry: this.$store.state.app.company.industry
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.chart4_1Data = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart4_1Loading = false
        })
    },
    renderChart4_2() {
      this.chart4_2Loading = true
      getFaultDescribeRanking({
        startTime: timeMap[this.chart4_2Select].start,
        endTime: timeMap[this.chart4_2Select].end,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.chart4_2Data = {
              xAxis: data[1].reverse(),
              data: data[0].reverse()
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.chart4_2Loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.analysis-home {
  .bold-font {
    font-size: 24px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.85);
  }
  .light-font {
    color: rgba(0, 0, 0, 0.45);
  }
  .red-font {
    color: rgba(245, 34, 45, 1);
  }
  .green-font {
    color: rgba(47, 194, 91, 1);
  }
  .part-item {
    height: 95px;
    position: relative;
  }
  .part-item-hover-box {
    position: absolute;
    top: 30px;
    right: 0px;
  }
  .part-item-hover-item {
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 20px;
  }
  .part-title-box {
    margin: 25px 0 11px 0;
    display: flex;
    align-items: center;
  }
  .part-big-title {
    font-size: 18px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 25px;
  }
  .part-big-time {
    margin-left: 12px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 20px;
  }
  .part-top {
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .part-title {
    flex: 1;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 22px;
  }
  .part-entry {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #1890ff;
    line-height: 22px;
    padding: 0;
    span {
      display: flex;
      align-items: center;
    }
  }
  .part-center {
    margin-bottom: 15px;
    display: flex;
    align-items: flex-end;
  }
  .part-value {
    font-size: 30px;
    font-family: HelveticaNeue;
    color: rgba(0, 0, 0, 0.85);
    line-height: 38px;
  }
  .part-unit {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 28px;
    margin-left: 8px;
  }
  .part-line {
    height: 1px;
    background: #e8e8e8;
    margin-bottom: 9px;
  }
  .part-step {
    height: 8px;
    background: #f0f2f5;
    border-radius: 1px;
    width: 100%;
    display: flex;
  }
  .part-value-step {
    flex: 1;
    height: 8px;
  }
  .part-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .part-bottom-item {
    display: flex;
    align-items: center;
  }
  .part-bottom-item-title {
    color: rgba(0, 0, 0, 0.65);
  }
  .part-bottom-item-value {
    color: rgba(0, 0, 0, 0.85);
  }
}
</style>

<style lang="scss">
.analysis-home {
  background-color: transparent;
  padding: 0;
  .el-row--flex {
    flex-wrap: wrap;
    & > * {
      margin-bottom: 25px;
    }
  }
  .el-card__header {
    height: 55px;
    line-height: 55px;
    padding: 0 20px;
  }
}
</style>
