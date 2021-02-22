<template>
  <div style="width:1300px">
    <div class="custom-history-dialog-wrap">
      <div v-nodata="isNoData" class="history-chart">
        <div
          :id="chartWrapId"
          v-loading="chartLoading"
          element-loading-text="加载中..."
          style="min-width:400px;height:450px"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getHistoryData } from '@/api/device_new'

const twoYearTime = 2 * 365 * 3600 * 1000 * 24

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
    groupList: {
      type: Array,
      default: function() {
        return []
      }
    },
    interval: {
      type: Number,
      default: function() {
        return 30
      }
    },
    canvasIndex: {
      type: Number,
      default: function() {
        return 1
      }
    },
    rangeType: {
      default: function() {
        return '昨天'
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
      isJustDownload: false, // 是否是导出（PDF导出）
      intervalMin: 0,
      form: {
        interval: 30,
        startTime: this.startTime,
        endTime: this.endTime
      },

      chartWrapId: '',

      pointIdList: [], // id数组
      dataList: [], // 数据数组

      pointType: 0, // 0 是 模拟量（如：温度、湿度）， 1 是状态量（如：开、关）

      showStatistical: false,
      showThreshold: false,

      timeRangeTye: '昨天',
      isNoData: false,
      chartLoading: false,
      canvasDataNum: 10 // 每个曲线图最多折线数量
    }
  },
  watch: {
    startTime(val) {
      this.chartLoading = false
      this.form.startTime = val
    },
    endTime(val) {
      this.chartLoading = false
      this.form.endTime = val
    },
    interval(val) {
      this.form.interval = val
    }
  },
  beforeDestroy() {
    // this.myChart && window.removeEventListener('resize', this.myChart.resize)
  },
  methods: {
    customDialog() {
      // window.addEventListener('resize', this.myChart.resize)
      this.showThreshold = true
      this.isJustDownload = true
      this.chartLoading = false
      this.chartWrapId = `chart-wrap${Math.ceil(Math.random() * 10000)}`
      this.chartSeries = null
      setTimeout(() => {
        this.myChart = echarts.init(document.getElementById(this.chartWrapId))
        // this.fetchChartSeries()
      })
    },
    downImg() {
      this.$emit('dramImgCallback', {
        img: this.myChart.getDataURL({
          backgroundColor: '#fff',
          excludeComponents: ['dataZoom']
        })
          ? this.myChart.getDataURL({
              backgroundColor: '#fff',
              excludeComponents: ['dataZoom']
            })
          : '',
        canvasIndex: this.canvasIndex - 1,
        finished: true,
        data: this.dataList,
        idList: this.pointIdList
      })
    },
    fetchChartSeries() {
      if (this.chartLoading) {
        return
      }
      this.myChart && this.myChart.clear()
      this.chartSeries = []
      const { startTime, endTime } = this.form
      if (
        new Date(endTime).getTime() - new Date(startTime).getTime() >
        twoYearTime
      ) {
        this.$message('历史数据最大查询范围是两年')
        return false
      }
      this.chartLoading = true

      let groupList = JSON.parse(JSON.stringify(this.groupList)) // 点位分组
      let canvasIndex = JSON.parse(JSON.stringify(this.canvasIndex)) // 当前Canvas排序位置
      let pointIdList = [] // 该曲线的ID列表
      let dataList = [] // 该曲线对应的数据列表
      // 从点位分组中筛选出对应数据（最多this.canvasDataNum条）
      for (let i = 0; i < groupList.length; i++) {
        let item = groupList[i]
        if (canvasIndex <= item.canvasNum) {
          pointIdList = item.idList.splice((canvasIndex - 1) * this.canvasDataNum, this.canvasDataNum)
          dataList = item.data.splice((canvasIndex - 1) * this.canvasDataNum, this.canvasDataNum)
          break
        } else {
          canvasIndex = canvasIndex - item.canvasNum
        }
      }
      this.pointIdList = pointIdList
      this.dataList = dataList

      getHistoryData({
        start: this._dateFormat(startTime, 'YYYY-MM-DD HH:mm'),
        end: this._dateFormat(endTime, 'YYYY-MM-DD HH:mm'),
        pointIdList,
        tmes: 30
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
                symbol: 'none',
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
                        position: 'end',
                        formatter: () => {
                          return `下下限(${item.PointName2}) \n ${item.SuperLowerLimit}`
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
                        position: 'start',
                        formatter: () => {
                          return `上上限(${item.PointName2}) \n ${item.SuperUpperLimit}`
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
                        position: 'start',
                        formatter: () => {
                          return `上限(${item.PointName2}) \n ${item.UpperLimit}`
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
                        position: 'end',
                        formatter: () => {
                          return `下限(${item.PointName2}) \n ${item.LowerLimit}`
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
          // this.chartLoading = false
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
              // this.$message('选中点位没有设置阈值')
            } else {
              // this.$message('存在点位没有设置阈值')
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
          left: 110,
          right: 110,
          bottom: 50,
          top: 100
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
          type: 'plain',
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
            offset: index > 1 ? (index - 1) * -80 : 0,
            zlevel: 5,
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
            offset: index > 1 ? (index - 1) * -80 : 0,
            zlevel: 5,
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
      this.downImg()
    },
    handleClose() {
      this.myChart && this.myChart.clear()
      this.chartSeries = []
    }
  }
}
</script>

<style lang="scss">
.custom-history-dialog-wrap {
  .circlepoint {
    display: inline-block;
    width: 0.6em;
    height: 0.6em;
    margin-right: 5px;
    border-radius: 50%;
  }
}
</style>
