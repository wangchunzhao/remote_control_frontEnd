<template>
  <el-dialog
    title="历史曲线"
    :visible.sync="dialogVisible"
    width="1300px"
    top="10vh"
    :append-to-body="appendToBody"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="history-dialog-wrap">
      <div>
        <el-form
          ref="form"
          :model="form"
          :rules="formRules"
          style="margin-left: 45px;"
          inline
          size="medium"
          :hide-required-asterisk="true"
        >
          <el-form-item label="时间范围：" prop="startTime">
            <el-date-picker
              v-model="form.startTime"
              @change="() => (rangeType = undefined)"
              :disabled="startTimeDisable"
              format="yyyy-MM-dd HH:mm"
              :editable="false"
              type="datetime"
              placeholder="选择日期"
              style="width: 175px;"
            />
          </el-form-item>
          <span style="margin-right: 10px;position: relative;">-</span>
          <el-form-item prop="endTime">
            <el-date-picker
              v-model="form.endTime"
              @change="() => (rangeType = undefined)"
              :disabled="endTimeDisable"
              format="yyyy-MM-dd HH:mm"
              :editable="false"
              type="datetime"
              placeholder="选择日期"
              style="width: 175px;"
            />
          </el-form-item>
          <el-form-item
            label="时间间隔："
            prop="interval"
            style="margin-left: 15px;"
            :rules="[
              {
                required: true,
                message: '超过查询数量限制，请修改起止时间或时间间隔',
                min: intervalMin,
                type: 'number',
                trigger: 'blur'
              }
            ]"
          >
            <el-input
              clearable
              v-model.trim.number="form.interval"
              style="width: 90px;"
              placeholder="分钟"
            />
          </el-form-item>
          <el-radio-group
            v-model="rangeType"
            size="medium"
            @change="changeRangeType"
            style="margin-left: 10px;"
          >
            <el-radio-button label="近1天"></el-radio-button>
            <el-radio-button label="近1周"></el-radio-button>
            <el-radio-button label="近1月"></el-radio-button>
          </el-radio-group>
          <el-form-item style="margin-left: 20px;">
            <el-button
              :loading="chartLoading"
              size="medium"
              type="primary"
              @click.native="search('form')"
            >
              查看数据
            </el-button>
          </el-form-item>
          <div>
            <el-form-item label="数据操作：">
              <el-button size="medium" @click.native="downImg">
                下载图表
              </el-button>
            </el-form-item>
            <el-form-item label="显示统计" style="margin-left: 15px;">
              <el-switch
                v-model="showStatistical"
                :disabled="pointType === 1"
                style="margin-left: 10px;position: relative;top: -3px;"
                @change="statisticalChange"
              />
            </el-form-item>
            <el-form-item label="显示阈值" style="margin-left: 15px;">
              <el-switch
                v-model="showThreshold"
                :disabled="pointType === 1"
                style="margin-left: 10px;position: relative;top: -3px;"
                @change="thresholdChang"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <div v-nodata="isNoData" class="history-chart">
        <div
          :id="chartWrapId"
          v-loading="chartLoading"
          element-loading-text="加载中..."
          style="min-width:400px;height:450px"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getHistoryData } from '@/api/device_new'
import { saveAs } from 'file-saver'
import { dataURItoBlob } from '@/utils/index'

const twoYearTime = 2 * 365 * 3600 * 1000 * 24
const oneYearTime = 365 * 3600 * 1000 * 24
const halfYearTime = 182 * 3600 * 1000 * 24
const oneSeasonTime = 90 * 3600 * 1000 * 24
const oneMonthTime = 31 * 3600 * 1000 * 24
const oneWeekTime = 7 * 3600 * 1000 * 24

export default {
  props: {
    type: {
      type: String,
      default: function() {
        ''
      }
    },
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    pointIds: {
      type: Array,
      default: function() {
        return []
      }
    },
    interval: {
      type: Number,
      default: function() {
        return 2
      }
    },
    startTime: {
      type: Date,
      default: function() {
        return new Date(new Date().getTime() - 24 * 3600 * 1000)
      }
    },
    endTime: {
      type: Date,
      default: function() {
        return new Date()
      }
    },
    startTimeDisable: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    endTimeDisable: {
      type: Boolean,
      default: function() {
        return false
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      intervalMin: 0,
      form: {
        interval: this.interval,
        startTime: this.startTime,
        endTime: this.endTime
      },
      formRules: {
        startTime: [
          {
            type: 'date',
            required: true,
            message: '选择开始时间',
            trigger: 'change'
          }
        ],
        endTime: [
          {
            type: 'date',
            required: true,
            message: '选择结束时间',
            trigger: 'change'
          }
        ]
      },
      rangeType: '近1天',

      chartWrapId: '',

      pointType: 0, // 0 是 模拟量（如：温度、湿度）， 1 是状态量（如：开、关）

      showStatistical: false,
      showThreshold: false,

      isNoData: false,
      chartLoading: false
    }
  },
  watch: {
    startTime(val) {
      this.form.startTime = val
      this.rangeType = undefined
    },
    endTime(val) {
      this.form.endTime = val
      this.rangeType = undefined
    },
    interval(val) {
      this.form.interval = val
    },
    dialogVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.myChart = echarts.init(document.getElementById(this.chartWrapId))
          // window.addEventListener('resize', this.myChart.resize)
        })
      }
    },
    'form.startTime'() {
      this.handleInterval(
        new Date(this.form.endTime).getTime() -
          new Date(this.form.startTime).getTime()
      )
    },
    'form.endTime'() {
      this.handleInterval(
        new Date(this.form.endTime).getTime() -
          new Date(this.form.startTime).getTime()
      )
    }
  },
  mounted() {
    this.chartWrapId = `chart-wrap${Math.ceil(Math.random() * 10000)}`
    this.chartSeries = null
  },
  beforeDestroy() {
    // this.myChart && window.removeEventListener('resize', this.myChart.resize)
  },
  methods: {
    toggleDialog() {
      this.dialogVisible = !this.dialogVisible
    },
    changeRangeType(val) {
      switch (val) {
        case '近1天':
          this.form.startTime = new Date(
            new Date().getTime() - 24 * 3600 * 1000
          )
          this.form.endTime = new Date()
          break
        case '近1周':
          this.form.startTime = new Date(new Date().getTime() - oneWeekTime)
          this.form.endTime = new Date()
          break
        case '近1月':
          this.form.startTime = new Date(new Date().getTime() - oneMonthTime)
          this.form.endTime = new Date()
          break
        default:
          break
      }
    },
    thresholdChang() {
      this.drawChart()
    },
    statisticalChange() {
      this.drawChart()
    },
    search(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.fetchChartSeries()
        } else {
          return false
        }
      })
    },
    downImg() {
      saveAs(
        dataURItoBlob(this.myChart.getDataURL({ backgroundColor: '#fff' })),
        'chart.jpg'
      )
    },
    fetchChartSeries() {
      const { startTime, endTime, interval } = this.form
      if (
        new Date(endTime).getTime() - new Date(startTime).getTime() >
        twoYearTime
      ) {
        this.$message('历史数据最大查询范围是两年')
        return false
      }
      this.chartLoading = true
      getHistoryData({
        start: this._dateFormat(startTime, 'YYYY-MM-DD HH:mm'),
        end: this._dateFormat(endTime, 'YYYY-MM-DD HH:mm'),
        pointIdList: this.pointIds,
        tmes: interval
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.dataSource = res.data.Data
            let pointList = res.data.Data.PointList
            if (!pointList) {
              this.$message('无点位数据')
              return false
            }
            // let types = pointList.map(item => item.PointType)
            this.legends = pointList.map(item => item.PointName)
            // if ([...new Set(types)].length !== 1) {
            //   this.$message({
            //     message: '选中的多个点位不是同一类型，无法合理显示',
            //     type: 'info',
            //     duration: 5000
            //   })
            //   return false
            // } else {
            //   this.pointType = types[0]
            //   this.pointType === 0 && (this.showStatistical = true)
            // }
            let series = []
            pointList.forEach(item => {
              for (let i = 0, length = item.DataList.length; i < length; i++) {
                item.DataList[i] = [
                  item.DataList[i].Time,
                  item.DataList[i].Value
                ]
              }
              item.unitMap = {}
              item.UnitMap &&
                item.UnitMap.forEach(map => {
                  item.unitMap[map.key] = map.value
                })
              series.push({
                animation: false,
                name: item.PointName,
                type: 'line',
                unit: item.Unit,
                step: item.PointType === 1 ? 'start' : '',
                smooth: false,
                yAxisData:
                  item.PointType === 1
                    ? Object.keys(item.unitMap).map(item => parseInt(item))
                    : '',
                pointType: item.PointType,
                pointTypeId: item.PointTypeId,
                unitMap: item.unitMap,
                data: item.DataList,
                markLine: {
                  data: []
                },
                statisticalmarkLineData: [
                  // 统计对应的marklineData
                  {
                    type: 'average',
                    name: '', // 文字：平均
                    lineStyle: {
                      type: 'dashed'
                    },
                    label: {
                      // 标线的文本。
                      normal: {
                        formatter: params => {
                          return params.value.toFixed(1)
                        }
                      }
                    }
                  }
                ],
                ThresholdmarkLineData: (() => {
                  // 阈值对应的marklineData
                  let temp = []
                  if (item.SuperLowerLimit) {
                    temp.push({
                      yAxis: item.SuperLowerLimit,
                      lineStyle: {
                        color: '#B03A5B',
                        type: 'dotted'
                      },
                      label: {
                        show: true,
                        position: 'middle',
                        formatter: () => {
                          return `下下限(${item.PointName}): ${item.SuperLowerLimit}`
                        }
                      }
                    })
                  }
                  if (item.SuperUpperLimit) {
                    temp.push({
                      yAxis: item.SuperUpperLimit,
                      lineStyle: {
                        color: '#B03A5B',
                        type: 'dotted'
                      },
                      label: {
                        show: true,
                        position: 'middle',
                        formatter: () => {
                          return `上上限(${item.PointName}): ${item.SuperUpperLimit}`
                        }
                      }
                    })
                  }
                  if (item.UpperLimit) {
                    temp.push({
                      yAxis: item.UpperLimit,
                      lineStyle: {
                        color: '#B03A5B',
                        type: 'dotted'
                      },
                      label: {
                        show: true,
                        position: 'middle',
                        formatter: () => {
                          return `上限(${item.PointName}): ${item.UpperLimit}`
                        }
                      }
                    })
                  }
                  if (item.LowerLimit) {
                    temp.push({
                      yAxis: item.LowerLimit,
                      lineStyle: {
                        color: '#B03A5B',

                        type: 'dotted'
                      },
                      label: {
                        show: true,
                        position: 'middle',
                        formatter: () => {
                          return `下限(${item.PointName}): ${item.LowerLimit}`
                        }
                      }
                    })
                  }
                  return temp
                })(),
                markPointCopy: {
                  data: [
                    { type: 'max', name: '最大值' },
                    { type: 'min', name: '最小值' }
                  ]
                },
                superLowerLimit: item.SuperLowerLimit,
                superUpperLimit: item.SuperUpperLimit,
                upperLimit: item.UpperLimit,
                lowerLimit: item.LowerLimit
              })
            })
            this.chartSeries = series
            this.drawChart()
          } else if (res.data.Code === 500) {
            this.$message(res.data.Message)
            this.isNoData = true
          } else {
            this.$message.error('历史数据查询失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('历史数据查询失败')
        })
        .finally(() => {
          this.chartLoading = false
        })
    },
    drawChart() {
      this.myChart && this.myChart.clear()
      this.chartSeries.forEach(item => {
        item.markLine.data = []
        if (this.showStatistical) {
          item.markPoint = item.markPointCopy
          item.markLine.data.push(...item.statisticalmarkLineData)
        } else {
          delete item.markPoint
        }
        if (this.showThreshold) {
          if (!item.ThresholdmarkLineData.length) {
            // 如果只选中了一个点位
            if (this.chartSeries.length === 1) {
              this.$message('选中点位没有设置阈值')
            } else {
              this.$message('存在点位没有设置阈值')
            }
          }
          item.markLine.data.push(...item.ThresholdmarkLineData)
        }
      })

      let option = {
        color: [
          '#2297E8',
          '#48CE38',
          '#F8D156',
          '#FD9827',
          '#9764DC',
          '#1FCA6A'
        ],
        grid: {
          left: 60,
          right: 100,
          bottom: 80,
          top: 60
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'empty',
            handleIcon:
              'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '90%'
          },
          {
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'empty'
          }
        ],
        legend: {
          show: true,
          type: this.pointIds.length > 5 ? 'scroll' : 'plain',
          top: 0
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const colorSpan = color =>
              `<i class="circlepoint" style="background: ${color}"></i>`
            let text =
              this._dateFormat(params[0].axisValue, 'YYYY-MM-DD HH:mm') +
              '<br/>'
            for (let i = 0; i < params.length; i++) {
              text += `${colorSpan(params[i].color)} ${params[i].seriesName}：${
                params[i].value[1] === null ? '无数据' : params[i].value[1]
              } <br/>`
            }
            return text
          }
        },
        xAxis: {
          type: 'time',
          axisLabel: {
            formatter: value => {
              return this._dateFormat(value, 'YYYY-MM-DD HH:mm')
            }
          },
          splitLine: {
            show: false
          }
        },
        series: this.chartSeries
      }

      let yAxisOption = { yAxis: [] }
      const map = []
      this.chartSeries.forEach(item => {
        if (!map.find(item2 => item2.pointTypeId === item.pointTypeId)) {
          map.push({
            unit: item.unit,
            unitMap: item.unitMap,
            pointTypeId: item.pointTypeId,
            pointType: item.pointType
          })
        }
      })
      this.chartSeries.forEach(item => {
        map.forEach((item2, index) => {
          if (item2.pointTypeId === item.pointTypeId) {
            item.yAxisIndex = index
          }
        })
      })
      map.forEach((item, index) => {
        if (item.pointType === 1) {
          // 开关型
          yAxisOption.yAxis.push({
            type: 'value',
            name: '单位:' + item.unit,
            boundaryGap: ['20%', '20%'],
            minInterval: 1,
            position: index === 0 ? 'left' : 'right',
            axisLabel: {
              show: true,
              formatter: value => {
                if (item.unitMap[value]) {
                  return item.unitMap[value]
                }
              }
            }
          })
        } else {
          // 模拟量类型
          yAxisOption.yAxis.push({
            type: 'value',
            name: '单位:' + item.unit,
            scale: false,
            position: index === 0 ? 'left' : 'right',
            boundaryGap: ['20%', '20%']
          })
        }
      })
      if (map.find(item => item.pointType === 0)) {
        // 如果存在模拟量类型的点位，则显示右侧的缩放控件
        option.dataZoom.push({
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'empty',
          handleIcon:
            'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '90%'
        })
      }
      this.myChart.setOption(Object.assign(option, yAxisOption))
    },
    handleInterval(diff) {
      if (diff < oneWeekTime) {
        this.intervalMin = 0
      } else if (diff > oneWeekTime && diff <= oneMonthTime) {
        this.form.interval = 10
        this.intervalMin = 10
      } else if (diff > oneMonthTime && diff <= oneSeasonTime) {
        this.form.interval = 30
        this.intervalMin = 30
      } else if (diff > oneSeasonTime && diff <= halfYearTime) {
        this.form.interval = 60
        this.intervalMin = 60
      } else if (diff > halfYearTime && diff <= oneYearTime) {
        this.form.interval = 120
        this.intervalMin = 120
      } else if (diff > oneYearTime && diff <= twoYearTime) {
        this.form.interval = 240
        this.intervalMin = 240
      } else if (diff > twoYearTime) {
        this.$message('历史数据最大查询范围是两年')
      }
    },
    handleOpen() {
      if (this.pointIds && this.pointIds.length) {
        this.fetchChartSeries()
      }
    },
    handleClose() {
      this.myChart && this.myChart.clear()
      this.chartSeries = []
      // this.showStatistical = false
      // this.rangeType = '近1天'
      this.showThreshold = false
      // this.form.interval = this.interval
      // this.form.startTime = new Date(new Date().getTime() - 24 * 3600 * 1000)
      // this.form.endTime = new Date()
    }
  }
}
</script>

<style lang="scss">
.history-dialog-wrap {
  .circlepoint {
    display: inline-block;
    width: 0.6em;
    height: 0.6em;
    margin-right: 5px;
    border-radius: 50%;
  }
}
</style>
