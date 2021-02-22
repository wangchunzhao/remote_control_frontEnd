<template>
  <div class="tab-content">
    <div class="toolBox">
      <el-radio-group v-model="type" size="small" @change="handletimerange">
        <el-radio-button :label="1">
          日
        </el-radio-button>
        <el-radio-button :label="2">
          周
        </el-radio-button>
        <el-radio-button :label="3">
          月
        </el-radio-button>
        <el-radio-button :label="4">
          年
        </el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-if="type === 1"
        v-model="day"
        type="date"
        placeholder="选择日期"
        value-format="yyyy-MM-dd"
        :picker-options="pickerOptions1"
        size="small"
        @change="handleformatTime"
      />
      <el-date-picker
        v-else-if="type === 2"
        v-model="week"
        :picker-options="pickerOptions"
        type="week"
        size="small"
        format="yyyy 第 WW 周"
        placeholder="选择周"
        @change="handleformatTime"
      />
      <el-date-picker
        v-else-if="type === 3"
        v-model="month"
        type="month"
        size="small"
        value-format="yyyy-M"
        :picker-options="pickerOptions1"
        placeholder="选择月"
        @change="handleformatTime"
      />
      <el-date-picker
        v-else
        v-model="year"
        type="year"
        size="small"
        placeholder="选择年"
        :picker-options="pickerOptions1"
        value-format="yyyy"
        @change="handleformatTime"
      />
      <!-- <el-button type="primary" @click="handleChart" size="small" class="check">查询</el-button> -->
      <el-button
        size="small"
        class="check"
        style="float:right"
        @click.native="comparison"
      >
        {{
          type === 1
            ? '对比昨日'
            : type === 2
            ? '对比上周'
            : type === 3
            ? '对比上月'
            : '对比去年'
        }}
      </el-button>
    </div>
    <div class="chart-wrapper">
      <div class="line-wrapper bg-fff">
        <div id="chartLine" />
      </div>
      <div />
      <div class="pie-wrapper bg-fff">
        <div id="chartPie" />
        <div class="quantity-wrapper">
          <div class="quantity-container">
            <div class="quantity-title">
              总客流(人)
            </div>
            <div class="quantity-total">
              {{ currentTotal }}
            </div>
            <div style="margin-bottom: 20px;">
              <span class="quantity-subtitle"
                >{{
                  type === 1
                    ? '昨日'
                    : type === 2
                    ? '上周'
                    : type === 3
                    ? '上月'
                    : '去年'
                }}客流：</span
              ><span class="quantity-lastday">{{ lastTotal }}</span>
            </div>
            <div>
              <span class="quantity-subtitle">环比：</span
              ><span class="quantity-circleradio">{{ circleRadio }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { storageName } from '@/utils/index'
import { getAreaList, getDmpList, getPersonList } from '@/api/model'

export default {
  data() {
    return {
      isActive: 1,
      startTime: null,
      endTime: null,
      pid: null,
      sid: null,
      chartLine: null,
      chartPie: null,
      linechartData: [],
      type: 1,
      finalType: 1,
      day: '',
      week: '',
      month: '',
      year: '',
      isTouch: false,
      currentTime: '',
      currentYear: null,
      currentTotal: 0,
      lastTotal: 0,
      circleRadio: 0,
      dayxAxislabel: [
        '00:00',
        '01:00',
        '02:00',
        '03:00',
        '04:00',
        '05:00',
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00'
      ],
      dayFixedlabel: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ],
      weekxAxislabel: [
        '星期一',
        '星期二',
        '星期三',
        '星期四',
        '星期五',
        '星期六',
        '星期日'
      ],
      weekFixedlabel: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      monthxAxislabel: [
        '1日',
        '2日',
        '3日',
        '4日',
        '5日',
        '6日',
        '7日',
        '8日',
        '9日',
        '10日',
        '11日',
        '12日',
        '13日',
        '14日',
        '15日',
        '16日',
        '17日',
        '18日',
        '19日',
        '20日',
        '21日',
        '22日',
        '23日',
        '24日',
        '25日',
        '26日',
        '27日',
        '28日',
        '29日',
        '30日',
        '31日'
      ],
      monthFixedlabel: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31
      ],
      currentmonthDays: null,
      lastmonthDays: null,
      yearxAxislabel: [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月'
      ],
      yearFixedlabel: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      pickerOptions: {
        firstDayOfWeek: 1, // 改变周起始日为星期一
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e6
        }
      },
      // 限制选择未来日期
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e6
        }
      }
    }
  },
  mounted() {
    this.pid = JSON.parse(sessionStorage.getItem(storageName('project'))).id
    // 如果有页面参数中有sid则使用 如果没有则使用本地存储中sid
    if (this.$route.query.sid) {
      this.sid = this.$route.query.sid
    } else {
      this.sid = sessionStorage.getItem(storageName('subsystemId'))
    }
    this.chartLine = echarts.init(document.getElementById('chartLine'))
    this.chartPie = echarts.init(document.getElementById('chartPie'))
    const currentTime = new Date().format('yyyy-MM-dd')
    this.startTime = currentTime + ' 00:00:00'
    this.endTime = new Date().format('yyyy-MM-dd hh:mm:ss')
    this.day = new Date()
    this.fetchDmplist()
    this.fetchArealist()
    this.fetchTotalpassenger()
    this.$nextTick(() => {
      window.onresize = () => {
        this.chartLine.resize()
        this.chartPie.resize()
      }
    })
  },
  methods: {
    // 获取折线图数据
    fetchDmplist() {
      getDmpList(
        this.pid,
        this.sid,
        this.startTime,
        this.endTime,
        this.finalType
      ).then(res => {
        // eslint-disable-next-line no-unused-vars
        let lineLabel = []
        // eslint-disable-next-line no-unused-vars
        let lineinitData = []
        if (res.data.Code === 200) {
          const data = res.data.Data
          // 根据日周月年进行匹配
          if (this.finalType === 1) {
            this.handlesuccessBack(
              this.dayxAxislabel,
              data,
              this.dayFixedlabel,
              '当日',
              '昨日'
            )
          } else if (this.finalType === 2) {
            this.handlesuccessBack(
              this.weekxAxislabel,
              data,
              this.weekFixedlabel,
              '本周',
              '上周'
            )
          } else if (this.finalType === 3) {
            this.handlesuccessBack(
              this.monthxAxislabel,
              data,
              this.monthFixedlabel,
              '本月',
              '上月'
            )
          } else {
            this.handlesuccessBack(
              this.yearxAxislabel,
              data,
              this.yearFixedlabel,
              '本年',
              '去年'
            )
          }
        } else {
          this.handlerrorBack()
        }
      })
    },
    // 获取门店客流统计总趋势数据
    fetchArealist() {
      getAreaList(this.pid, this.sid, this.startTime, this.endTime).then(
        res => {
          let pieLabel = []
          let pieData = []
          if (res.data.Code === 200) {
            res.data.Data.forEach(item => {
              const itemData = {
                name: item.area,
                value: item.val
              }
              pieData.push(itemData)
              pieLabel.push(item.area)
              this.handlepieChart(pieLabel, pieData)
            })
          } else {
            this.handlepieChart(pieLabel, pieData)
          }
        }
      )
    },
    // 获取门店分区域客流统计数据
    fetchTotalpassenger() {
      getPersonList(
        this.pid,
        this.sid,
        this.startTime,
        this.endTime,
        this.finalType
      ).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          this.currentTotal = data.total
          this.lastTotal = data.oldtotal
          this.circleRadio = data.avgval
        }
      })
    },
    handlelineChart(label, data) {
      this.chartLine.setOption({
        title: {
          text: data.length ? '门店总客流趋势' : '暂无数据',
          x: 'center',
          top: 10,
          textStyle: {
            fontSize: 14
          }
        },
        color: [
          '#2297E8',
          '#48CE38',
          '#F8D156',
          '#FD9827',
          '#9764DC',
          '#339999',
          '#50c2c2',
          '#abd4dd',
          '#7b98c1',
          '#84b5ef',
          '#ffc281',
          '#ff8080'
        ],
        tooltip: {
          trigger: 'axis'
        },
        calculable: true,
        legend: {
          show: true,
          right: 100,
          top: 5
        },
        toolbox: {
          right: 40,
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: label,
            show: data.length
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '单位/人',
            axisLabel: {
              formatter(value) {
                if (value > 1000) {
                  return value / 1000 + 'k'
                } else {
                  return value
                }
              }
            },
            show: data.length
          }
        ],
        grid: {
          x: 60,
          y: 60,
          x2: 40,
          y2: 40
        },
        series: data
      })
    },
    handlepieChart(label, data) {
      this.chartPie.setOption({
        title: {
          text: data.length ? '门店分区域客流' : '暂无数据',
          x: 'center',
          top: 10,
          textStyle: {
            fontSize: 14
          }
        },
        color: [
          '#2297E8',
          '#48CE38',
          '#F8D156',
          '#FD9827',
          '#9764DC',
          '#339999',
          '#50c2c2',
          '#abd4dd',
          '#7b98c1',
          '#84b5ef',
          '#ffc281',
          '#ff8080'
        ],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          data: label,
          show: true
        },
        toolbox: {
          right: 40,
          feature: {
            saveAsImage: {}
          }
        },
        calculable: true,
        series: [
          {
            name: '占比',
            type: 'pie',
            radius: '50%',
            center: ['50%', '50%'],
            data: data,
            itemStyle: {
              normal: {
                label: {
                  formatter: '{b} ({c}，{d}%)'
                },
                labelLine: {
                  length: 0
                }
              }
            }
          }
        ]
      })
    },
    // 切换日周月年
    handletimerange(val) {
      this.chartLine.clear()
      this.linechartData = []
      this.lineinitLabel = []
      this.isTouch = false
      if (val === 1) {
        const currentTime = new Date().format('yyyy-MM-dd')
        this.startTime = currentTime + ' 00:00:00'
        this.endTime = new Date().format('yyyy-MM-dd hh:mm:ss')
        this.day = new Date()
      } else if (val === 2) {
        const day = new Date().getDay() === 0 ? 7 : new Date().getDay()
        const now = new Date().getTime()
        const Monday = new Date(now - (day - 1) * 24 * 60 * 60 * 1000).format(
          'yyyy-MM-dd'
        )
        this.startTime = Monday + ' 00:00:00'
        this.endTime = new Date().format('yyyy-MM-dd hh:mm:ss')
        this.week = new Date()
      } else if (val === 3) {
        this.currentTime = new Date().format('yyyy-M') // 当月时间
        const currentMonth = new Date().format('yyyy-MM')
        this.startTime = currentMonth + '-01 00:00:00'
        this.endTime = new Date().format('yyyy-MM-dd hh:mm:ss')
        this.month = new Date()
        this.currentmonthDays = new Date(
          this.currentTime.split('-')[0],
          this.currentTime.split('-')[1],
          0
        ).getDate() // 当月总天数
      } else {
        const currentYear = new Date().format('yyyy')
        this.currentYear = currentYear
        this.startTime = currentYear + '-01-01 00:00:00'
        this.endTime = new Date().format('yyyy-MM-dd hh:mm:ss')
        this.year = new Date()
      }
      this.finalType = val
      this.fetchDmplist()
      this.fetchArealist()
      this.fetchTotalpassenger()
    },
    // 时间选择处理
    handleformatTime(val) {
      if (this.finalType === 1) {
        const selectedTime = new Date(val).format('yyyy-MM-dd')
        // eslint-disable-next-line no-unused-vars
        const currentTime = new Date().format('yyyy-MM-dd')
        this.startTime = selectedTime + ' 00:00:00'
        this.endTime = new Date(
          new Date(this.startTime).getTime() + 24 * 60 * 60 * 1000
        ).format('yyyy-MM-dd hh:mm:ss')
      } else if (this.finalType === 2) {
        this.startTime = new Date(
          new Date(val).getTime() - 24 * 60 * 60 * 1000
        ).format('yyyy-MM-dd hh:mm:ss')
        this.endTime = new Date(
          new Date(val).getTime() + 24 * 60 * 60 * 1000 * 6
        ).format('yyyy-MM-dd hh:mm:ss')
      } else if (this.finalType === 3) {
        this.currentTime = val
        const year = val.split('-')[0]
        const month = val.split('-')[1]
        var d = new Date(year, month, 0)
        this.currentmonthDays = d.getDate()
        this.startTime = val + '-01 00:00:00'
        this.endTime = new Date(
          new Date(this.startTime).getTime() +
            24 * 60 * 60 * this.currentmonthDays * 1000
        ).format('yyyy-MM-dd hh:mm:ss')
      } else {
        // 如果选择时间为本年则结束时间为当前时间
        const currentYear = new Date().format('yyyy')
        if (currentYear === val) {
          this.currentYear = val
          this.startTime = val + '-01-01 00:00:00'
          this.endTime = new Date().format('yyyy-MM-dd hh:mm:ss')
        } else {
          this.currentYear = val
          this.startTime = val + '-01-01 00:00:00'
          this.endTime = +val + 1 + '-01-01 00:00:00'
        }
      }
      this.linechartData = []
      this.chartLine.clear()
      this.isTouch = false
      this.fetchDmplist()
      this.fetchArealist()
      this.fetchTotalpassenger()
    },
    // 对比操作
    comparison() {
      // this.isTouch=true
      this.isTouch = !this.isTouch
      if (this.isTouch) {
        if (this.finalType === 1) {
          this.endTime = this.startTime
          this.startTime = new Date(
            new Date(this.startTime).getTime() - 24 * 60 * 60 * 1000
          ).format('yyyy-MM-dd hh:mm:ss')
        } else if (this.finalType === 2) {
          this.endTime = this.startTime
          this.startTime = new Date(
            new Date(this.startTime).getTime() - 24 * 60 * 60 * 1000 * 7
          ).format('yyyy-MM-dd hh:mm:ss')
        } else if (this.finalType === 3) {
          const year = +this.currentTime.split('-')[0]
          const month = +this.currentTime.split('-')[1]
          const lastmonth = month === 1 ? 12 : month - 1
          const lastyear = month === 1 ? year - 1 : year
          this.lastmonthDays = new Date(lastyear, lastmonth, 0).getDate() // 上月总天数
          this.endTime = this.startTime
          this.startTime = lastyear + '-' + lastmonth + '-01 00:00:00'
        } else {
          this.endTime = this.startTime
          this.startTime = this.currentYear - 1 + '-01-01 00:00:00'
        }
        this.fetchDmplist()
      } else {
        this.chartLine.clear()
        this.startTime = this.endTime
        this.endTime = new Date(
          new Date(this.startTime).getTime() + 24 * 60 * 60 * 1000 * 7
        ).format('yyyy-MM-dd hh:mm:ss')
        this.linechartData.splice(1, 1)
        if (this.finalType === 1) {
          this.handlelineChart(this.dayxAxislabel, this.linechartData)
        } else if (this.finalType === 2) {
          this.handlelineChart(this.weekxAxislabel, this.linechartData)
        } else if (this.finalType === 3) {
          this.handlelineChart(this.monthxAxislabel, this.linechartData)
        } else {
          this.handlelineChart(this.yearxAxislabel, this.linechartData)
        }
      }
    },
    handledayxLabel(data, Fixedlabel) {
      let dayExistlabel = []
      let dayExistdata = []
      // 构建已存在时间数据
      data.forEach(item => {
        if (this.finalType !== 2) {
          dayExistlabel.push(+item.time)
        } else {
          dayExistlabel.push(item.time)
        }
      })
      // 构建已存在时间下数据，不存在的时间补为空
      Fixedlabel.forEach(item => {
        if (dayExistlabel.indexOf(item) === -1) {
          dayExistdata.push('')
        } else {
          data.forEach(cell => {
            if (this.finalType !== 2) {
              if (+cell.time === item) {
                dayExistdata.push(+cell.val)
              }
            } else {
              if (cell.time === item) {
                dayExistdata.push(+cell.val)
              }
            }
          })
        }
      })
      return dayExistdata
    },
    // 折线图成功回调
    handlesuccessBack(xAxislabel, data, Fixedlabel, current, last) {
      // isTouch判断用户是否点击过对比按钮
      if (this.isTouch) {
        // ("点击过")
        const comparsion = {
          name: last,
          type: 'line',
          itemStyle: { normal: { areaStyle: { type: 'default' } } },
          data: this.handledayxLabel(data, Fixedlabel)
        }
        this.linechartData.push(comparsion)
        this.handlelineChart(xAxislabel, this.linechartData)
      } else {
        const initdata = {
          name: current,
          type: 'line',
          itemStyle: { normal: { areaStyle: { type: 'default' } } },
          data: this.handledayxLabel(data, Fixedlabel)
        }
        this.linechartData.push(initdata)
        this.handlelineChart(xAxislabel, this.linechartData)
      }
    },
    // 折线图失败回调
    handlerrorBack() {
      // isTouch判断用户是否点击过对比按钮
      if (this.isTouch) {
        if (this.finalType === 1) {
          this.handlelineChart(this.dayxAxislabel, this.linechartData)
        } else if (this.finalType === 2) {
          this.handlelineChart(this.weekxAxislabel, this.linechartData)
        } else if (this.finalType === 3) {
          this.handlelineChart(this.monthxAxislabel, this.linechartData)
        } else {
          this.handlelineChart(this.yearxAxislabel, this.linechartData)
        }
      } else {
        this.handlelineChart([], [])
      }
    }
  }
}
</script>
<style lang="scss" scoped>
// .tab-content{
//     padding: 0 20px;
// }
.toolBox {
  .check,
  .timeselect {
    vertical-align: middle;
  }
}
.chart-wrapper {
  margin-top: 10px;
  .line-wrapper,
  .pie-wrapper {
    // padding: 10px;
    border-radius: 4px;
    // border: 1px solid #D8D8D8;
    #chartLine {
      height: 320px;
      width: 100%;
    }
    #chartPie {
      height: 330px;
      width: 50%;
      padding-bottom: 10px;
      float: right;
    }
    .quantity-wrapper {
      width: 50%;
      height: 330px;
      padding: 20px 0;
      box-sizing: border-box;
      .quantity-container {
        height: 100%;
        border-right: 1px solid #bbbbbb;
        .quantity-title {
          font-size: 15px;
          color: #949494;
          padding: 70px 0 15px 0;
          text-align: center;
        }
        .quantity-total {
          font-size: 30px;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }
        .quantity-subtitle {
          font-size: 15px;
          color: #949494;
          display: inline-block;
          width: 50%;
          text-align: right;
          margin-right: 10px;
        }
        .quantity-lastday {
          font-weight: 600;
          font-size: 15px;
        }
        .quantity-circleradio {
          font-weight: 600;
          color: red;
          font-size: 15px;
        }
      }
    }
  }
  .pie-wrapper {
    margin-top: 15px;
  }
}
</style>
<style lang="scss">
.tab-content {
  .toolBox {
    .el-date-editor {
      vertical-align: -1.5px;
    }
  }
  .el-picker-panel {
    position: absolute;
    z-index: 100;
  }
}
</style>
