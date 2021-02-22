<template>
  <div>
    <div class="history-dialog-wrap">
      <!--      <el-form-->
      <!--          ref="form"-->
      <!--          :model="form"-->
      <!--          :rules="formRules"-->
      <!--          style="margin-left: 45px;"-->
      <!--          inline-->
      <!--          size="medium"-->
      <!--          label-width="90px"-->
      <!--          :hide-required-asterisk="true"-->
      <!--      >-->
      <!--        <el-form-item label="时间范围:" prop="dateRange">-->
      <!--          <el-date-picker-->
      <!--              v-model="form.dateRange"-->
      <!--              type="datetimerange"-->
      <!--              :picker-options="pickerOptions"-->
      <!--              :disabled="dateRangeDisabled"-->
      <!--              format="yyyy-MM-dd HH:mm"-->
      <!--              range-separator="至"-->
      <!--              clearable-->
      <!--              style="width: 350px;"-->
      <!--              start-placeholder="开始日期"-->
      <!--              end-placeholder="结束日期"-->
      <!--              align="right"-->
      <!--              @change="handleDateRangeChange"-->
      <!--          >-->
      <!--          </el-date-picker>-->
      <!--        </el-form-item>-->
      <!--        <el-form-item-->
      <!--            label=""-->
      <!--            prop="interval"-->
      <!--            style="margin-left: 15px;"-->
      <!--            :rules="[-->
      <!--            {-->
      <!--              required: true,-->
      <!--              message: '超过查询限制，请修改起止时间或时间间隔',-->
      <!--              min: intervalMin,-->
      <!--              type: 'number',-->
      <!--              trigger: 'blur'-->
      <!--            }-->
      <!--          ]"-->
      <!--        >-->
      <!--          <el-input-->
      <!--              placeholder=""-->
      <!--              style="width: 225px;"-->
      <!--              clearable-->
      <!--              v-model.trim.number="form.interval"-->
      <!--          >-->
      <!--            <template slot="prepend">-->
      <!--              <span>间隔（分钟)</span>-->
      <!--            </template>-->
      <!--          </el-input>-->
      <!--        </el-form-item>-->
      <!--        <el-tooltip class="item" effect="dark" placement="bottom">-->
      <!--          <div slot="content" style="line-height: 20px;">-->
      <!--            <div>最大查询时间范围：2年</div>-->
      <!--            <div>时间间隔默认2分钟， 最小为0（查询原始数据）</div>-->
      <!--            <div>(1周,1月], 时间间隔最小为10分钟</div>-->
      <!--            <div>(1月,1季度], 时间间隔最小为30分钟</div>-->
      <!--            <div>(1季度,半年], 时间间隔最小为60分钟</div>-->
      <!--            <div>(半年,1年], 时间间隔最小为120分钟</div>-->
      <!--            <div>(1年以上,2年], 时间间隔最小为240分钟</div>-->
      <!--          </div>-->
      <!--          <i-->
      <!--              class="el-icon-question"-->
      <!--              style="color:#ccc;font-size: 16px;transform: translateY(10px);"-->
      <!--          ></i>-->
      <!--        </el-tooltip>-->

      <!--        <div>-->
      <!--          <el-form-item label="添加对比:" style="margin-right: 40px;">-->
      <!--            <template>-->
      <!--              <span>加载关联点位</span>-->
      <!--              <el-switch-->
      <!--                  :disabled="-->
      <!--                  form.showRelatePointDisabled ||-->
      <!--                    (pointIds && pointIds.length > 1)-->
      <!--                "-->
      <!--                  v-model="form.showRelatePoint"-->
      <!--                  style="margin: -5px 15px 0 10px;"-->
      <!--                  @change="thresholdChang"-->
      <!--              />-->
      <!--            </template>-->
      <!--            <el-button-->
      <!--                @click.native="() => $refs.pointSelectDialog.openDialog()"-->
      <!--                type="text"-->
      <!--            >添加点位</el-button-->
      <!--            >-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="数据操作:">-->
      <!--            &lt;!&ndash; 冷链行业不能下载excel &ndash;&gt;-->
      <!--            <el-button-->
      <!--                v-permission="[platform === 'BUSINESS' ? 31 : 104]"-->
      <!--                size="medium"-->
      <!--                :loading="excelLoading"-->
      <!--                plain-->
      <!--                @click.native="downloadExcel('form')"-->
      <!--            >-->
      <!--              下载excel-->
      <!--            </el-button>-->
      <!--            <el-button-->
      <!--                :loading="pdfLoading"-->
      <!--                v-permission="[platform === 'BUSINESS' ? 30 : 103]"-->
      <!--                size="medium"-->
      <!--                plain-->
      <!--                @click.native="downPDF('form')"-->
      <!--            >-->
      <!--              下载pdf-->
      <!--            </el-button>-->
      <!--            <el-button size="medium" plain @click.native="downImg">-->
      <!--              下载图表-->
      <!--            </el-button>-->
      <!--          </el-form-item>-->
      <!--        </div>-->
      <!--        <div>-->
      <!--          <el-form-item label="" style="margin-left: 15px;margin-right: 20px;">-->
      <!--            <el-radio-group v-model="form.model" size="small">-->
      <!--              <el-radio-button label="chart">图表</el-radio-button>-->
      <!--              <el-radio-button label="table">表格</el-radio-button>-->
      <!--            </el-radio-group>-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="显示统计:" style="margin-left: 15px;">-->
      <!--            <el-switch-->
      <!--                v-model="form.showStatistical"-->
      <!--                style="margin-left: 10px;"-->
      <!--                :disabled="form.model === 'table'"-->
      <!--                @change="statisticalChange"-->
      <!--            />-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="显示阈值:" style="margin-left: 15px;">-->
      <!--            <el-switch-->
      <!--                v-model="form.showThreshold"-->
      <!--                style="margin-left: 10px;"-->
      <!--                :disabled="form.model === 'table'"-->
      <!--                @change="thresholdChang"-->
      <!--            />-->
      <!--          </el-form-item>-->
      <!--        </div>-->
      <!--      </el-form>-->
      <div
        v-show="form.model === 'chart'"
        v-nodata="isNoData"
        class="history-chart"
      >
        <div
          :id="chartWrapId"
          v-loading="loading"
          style="min-width:400px;height:250px"
        />
      </div>
      <div
        v-show="form.model === 'table'"
        empty-text="暂无数据"
        style="margin: 0 20px;"
        v-loading="loading"
      >
        <el-table :data="tableData" style="width: 100%" :height="450">
          <el-table-column
            v-for="(item, index) in tableCols"
            min-width="120"
            :prop="item"
            :label="item"
            :key="item + index"
          >
            <template slot-scope="{ row }">
              {{ row[item] }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <PointSelectDialog
      :projectId="projectId"
      :pointIds="pointIds"
      @submit="handlePointChange"
      ref="pointSelectDialog"
    />
  </div>
</template>

<script>
import { getHistoryData } from '@/api/device_new'
import { getPointRelevance } from '@/api/point'
import { downHistoryDataToExcelOrPdf } from '@/api/device_new'
import { saveAs } from 'file-saver'
import { generateHTML, dataURItoBlob } from '@/utils/index'
import PointSelectDialog from '@/components/PointSelectDialog'
import { htmlToPdf } from '@/api/uploader'

const twoYearTime = 2 * 365 * 3600 * 1000 * 24
const oneYearTime = 365 * 3600 * 1000 * 24
const halfYearTime = 182 * 3600 * 1000 * 24
const oneSeasonTime = 90 * 3600 * 1000 * 24
const oneMonthTime = 31 * 3600 * 1000 * 24
const oneWeekTime = 7 * 3600 * 1000 * 24

export default {
  components: {
    PointSelectDialog
  },
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    projectId: {
      type: Number,
      default: function() {
        return (this.$store.state.app.project || {}).id
      }
    },
    keyPointIndex: {
      type: Number,
      default: function() {
        return 0
      }
    },
    deviceId: {
      type: Number
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
    dateRange: {
      type: Array,
      default: function() {
        return [new Date(new Date().getTime() - 24 * 3600 * 1000), new Date()]
      }
    },
    dateRangeDisabled: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    showRelatePointDisabled: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    showRelatePoint: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    isAlarmPoint: {
      // 是否是报警点位
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
        startTime: '',
        pointIds: [],
        pointIdsByAdd: [], // 用户自己添加的点位
        endTime: '',
        dateRange: '',
        showRelatePoint: false, // 是否显示关联点位
        model: 'chart',
        showStatistical: true, // 显示统计
        showThreshold: false // 显示阈值
      },
      formRules: {
        // dateRange: [
        //   {
        //     type: 'array',
        //     required: true,
        //     message: '请选择时间范围',
        //     trigger: 'change'
        //   }
        // ]
        // startTime: [
        //   {
        //     type: 'date',
        //     required: true,
        //     message: '选择开始时间',
        //     trigger: 'change'
        //   }
        // ],
        // endTime: [
        //   {
        //     type: 'date',
        //     required: true,
        //     message: '选择结束时间',
        //     trigger: 'change'
        //   }
        // ]
      },

      chartWrapId: '',

      tableCols: [],
      tableData: [],

      isNoData: false,
      excelLoading: false,
      pdfLoading: false,
      loading: false,

      pickerOptions: {
        disabledDate: time => {
          return time > Date.now()
        },
        shortcuts: [
          {
            text: '近一天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  watch: {
    interval(val) {
      this.form.interval = val
    },
    dateRange: {
      handler: function(val) {
        this.form.startTime = val[0]
        this.form.endTime = val[1]
        this.form.dateRange = val
      },
      immediate: true
    },
    pointIds(val) {
      this.form.pointIds = [...val]
    },
    showRelatePointDisabled(val) {
      this.form.showRelatePointDisabled = val
    },
    dialogVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.myChart = echarts.init(document.getElementById(this.chartWrapId))
          this.myChart.group = 'keyPoint'
          window.addEventListener('resize', this.myChart.resize())
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
    },
    'form.interval'(val) {
      if (val !== '' && this.form.startTime && this.form.endTime) {
        // this.fetchChartSeries()
      }
    },
    'form.showRelatePoint'(val) {
      if (!this.dialogVisible) {
        return
      }
      getPointRelevance({
        modelTreeId: this.deviceId,
        pointId: this.pointIds[0]
      })
        .then(res => {
          if (res.data.Code === 200) {
            const pointIds = res.data.Data.map(item => item.PointIdB)
            if (val) {
              // 查询点位历史数据
              if (!pointIds.length) {
                if (!this.isAlarmPoint) {
                  this.$message('当前点位没有关联的点位')
                } else {
                  // 如果点位是报警点位
                  this.form.showRelatePointDisabled = true
                  this.form.showRelatePoint = false
                }
                return
              }
              this.form.pointIds = [
                ...new Set([...this.form.pointIds, ...pointIds])
              ]
            } else {
              //  删除关联点位
              this.form.pointIds = this.form.pointIds.filter(
                item => !pointIds.includes(item)
              )
            }

            if (!pointIds.length) {
              return
            }
            this.$refs['form'].validate(valid => {
              if (valid) {
                this.fetchChartSeries()
              } else {
                return false
              }
            })
          } else {
            this.$message.error('关联点位查询失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('关联点位查询失败')
        })
    }
  },
  computed: {
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  mounted() {
    this.chartWrapId = `chart-wrap${Math.ceil(Math.random() * 10000)}`
    this.chartSeries = []
    this.chartYAxisData = []
  },
  beforeDestroy() {
    // this.myChart && window.removeEventListener('resize', this.myChart.resize)
  },
  methods: {
    toggleDialog(form) {
      Object.assign((this.form = form))
      this.dialogVisible = true
      //
      // if (this.showRelatePoint) {
      //   // 触发watch:form.showRelatePoint
      //   this.form.showRelatePoint = this.showRelatePoint
      // }
      this.fetchChartSeries()
    },
    updateDialog(form) {
      Object.assign((this.form = form))
      this.fetchChartSeries()
    },
    handleDateRangeChange(val) {
      if (val) {
        this.form.startTime = this._dateFormat(val[0], 'YYYY-MM-DD HH:mm')
        this.form.endTime = this._dateFormat(val[1], 'YYYY-MM-DD HH:mm')
        this.$refs['form'].validate(valid => {
          if (valid) {
            this.fetchChartSeries()
          } else {
            return false
          }
        })
      } else {
        this.form.startTime = ''
        this.form.endTime = ''
      }
    },
    thresholdChang() {
      this.drawChart()
    },
    statisticalChange() {
      this.drawChart()
    },
    handlePointChange(val) {
      this.form.pointIdsByAdd = val
      this.fetchChartSeries()
    },
    downPDF(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.pdfLoading = true
          this.fetchChartSeries()
        }
      })
    },
    downImg() {
      saveAs(
        dataURItoBlob(this.myChart.getDataURL({ backgroundColor: '#fff' })),
        'chart.jpg'
      )
    },
    downloadExcel(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const {
            pointIds,
            pointIdsByAdd,
            startTime,
            endTime,
            interval
          } = this.form
          const ids = [...pointIds, ...pointIdsByAdd]
          let start = this._dateFormat(startTime, 'YYYY-MM-DD HH:mm')
          let end = this._dateFormat(endTime, 'YYYY-MM-DD HH:mm')
          this.excelLoading = false
          downHistoryDataToExcelOrPdf({
            start,
            end,
            pointIdList: ids,
            tmes: interval,
            fileType: 1,
            isZip: true,
            isAlarmLacy: false,
            isMerge: false,
            zipFileList: [],
            responseType: 'blob'
          })
            .then(res => {
              if (
                'application/json; charset=utf-8' ===
                res.headers['content-type']
              ) {
                const reader = new FileReader()

                reader.onload = t => {
                  const data = JSON.parse(t.target.result)
                  this.$message(data.Message)
                }
                reader.readAsText(res.data)
                return false
              }
              var a = new Blob([res.data])
              saveAs(
                a,
                `history${this._dateFormat(new Date(), 'YYYYMMDDHHmmss')}.zip`
              )
            })
            .catch(err => {
              console.error(err)
              this.$message.error('导出失败')
            })
            .finally(() => {
              this.excelLoading = false
            })
        }
      })
    },
    fetchChartSeries() {
      if (!this.dialogVisible) {
        return
      }
      let { startTime, endTime, interval, pointIdsByAdd } = this.form
      if (interval === '' || !startTime || !endTime) {
        return
      }
      if (
        new Date(endTime).getTime() - new Date(startTime).getTime() >
        twoYearTime
      ) {
        this.$message('历史数据最大查询范围是两年')
        return false
      }
      this.loading = true
      getHistoryData({
        start: this._dateFormat(startTime, 'YYYY-MM-DD HH:mm'),
        end: this._dateFormat(endTime, 'YYYY-MM-DD HH:mm'),
        pointIdList: [...this.pointIds, ...pointIdsByAdd],
        tmes: interval
      })
        .then(res => {
          if (
            this.form.interval !== interval ||
            this.form.startTime !== startTime ||
            this.form.endTime !== endTime
          ) {
            return
          }
          if (res.data.Code === 200) {
            this.dataSource = res.data.Data
            let pointList = res.data.Data.PointList
            if (!pointList) {
              this.$message('无点位数据')
              return false
            }
            let series = []
            let yAxisData = []
            let tableCols = ['时间']
            let tableData = []
            pointList.forEach(item => {
              tableCols.push(item.PointName2)
              for (let i = 0, length = item.DataList.length; i < length; i++) {
                if (!tableData[i]) {
                  tableData[i] = {}
                }
                tableData[i]['时间'] = item.DataList[i].Time
                tableData[i][item.PointName2] = item.DataList[i].Value
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
              if (
                yAxisData.find(yAxis => yAxis.name === item.PointTypeName) ===
                undefined
              ) {
                let yAxis = {}
                if (item.PointType === 0) {
                  // 模拟量
                  yAxis = {
                    type: 'value',
                    name: item.PointTypeName,
                    scale: false,
                    boundaryGap: ['20%', '20%'],
                    position: yAxisData.length === 0 ? 'left' : 'right',
                    offset:
                      yAxisData.length > 1 ? (yAxisData.length - 1) * 70 : 0, // 如果y轴数量大于2，y轴要对应偏移
                    axisLabel: {
                      show: true,
                      formatter: value => {
                        return `${value} ${item.Unit}`
                      }
                    },
                    axisLine: {
                      show: false
                    },
                    splitLine: {
                      show: true
                    }
                  }
                } else if (item.PointType === 1) {
                  // 状态量
                  yAxis = {
                    type: 'value',
                    name: item.PointTypeName,
                    boundaryGap: ['20%', '20%'],
                    position: yAxisData.length === 0 ? 'left' : 'right',
                    offset:
                      yAxisData.length >= 1 ? (yAxisData.length - 1) * 70 : 0, // 如果y轴数量大于2，y轴要对应偏移
                    minInterval: 1,
                    axisLabel: {
                      show: true,
                      formatter: value => {
                        return item.unitMap[value]
                      }
                    },
                    axisLine: {
                      show: false
                    },
                    splitLine: {
                      show: true
                    }
                  }
                }
                yAxisData.push(yAxis)
              }
              series.push({
                animation: false,
                name: item.PointName2,
                type: 'line',
                unit: item.Unit,
                yAxisIndex: yAxisData.findIndex(
                  yAxis => yAxis.name === item.PointTypeName
                ),
                step: item.PointType === 1 ? 'start' : '',
                smooth: false,
                // yAxisData:
                //   item.PointType === 1
                //     ? Object.keys(item.unitMap).map(item => parseInt(item))
                //     : '',
                pointType: item.PointType,
                unitMap: item.unitMap,
                data: item.DataList,
                // data: [['2021-01-15 15:15', 100], ['2021-01-15 23:15', 300], ['2021-01-16 02:15', 120], ['2021-01-16 08:15', 230]],
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
                          return `下下限(${item.PointName2}): ${item.SuperLowerLimit}`
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
                          return `上上限(${item.PointName2}): ${item.SuperUpperLimit}`
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
                          return `上限(${item.PointName2}): ${item.UpperLimit}`
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
                          return `下限(${item.PointName2}): ${item.LowerLimit}`
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
                maxValue: item.Max,
                minValue: item.Min,
                superLowerLimit: item.SuperLowerLimit,
                superUpperLimit: item.SuperUpperLimit,
                upperLimit: item.UpperLimit,
                lowerLimit: item.LowerLimit
              })
            })
            this.tableData = tableData
            this.tableCols = tableCols
            this.chartSeries = series
            this.chartYAxisData = yAxisData
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
          if (
            this.form.interval !== interval ||
            this.form.startTime !== startTime ||
            this.form.endTime !== endTime
          ) {
            return
          }
          this.loading = false
          this.$emit('requestReg', this.keyPointIndex)
        })
    },
    drawChart() {
      this.myChart && this.myChart.clear() // 先清空表格
      const { showStatistical, showThreshold } = this.form

      let isShowMsg = false
      // visualMap 的配置可以参考： https://www.echartsjs.com/examples/zh/editor.html?c=line-aqi
      let visualMap = {
        top: 0,
        right: 50,
        pieces: []
      }
      const visualMapColors = [
        '#096',
        '#ffde33',
        '#ff9933',
        '#cc0033',
        '#660099',
        '#7e0023',
        '#48CE38'
      ]
      this.chartSeries.forEach((item, index) => {
        item.markLine.data = []
        if (showStatistical) {
          item.markPoint = item.markPointCopy
          item.markLine.data.push(...item.statisticalmarkLineData)
        } else {
          delete item.markPoint
        }
        if (showThreshold) {
          if (!item.ThresholdmarkLineData.length) {
            if (this.chartSeries.length === 1) {
              this.$message('选中点位没有设置阈值')
            } else {
              isShowMsg = true
            }
          }
          item.markLine.data.push(...item.ThresholdmarkLineData)
          if (index === 0) {
            // index === 0 的元素指的是当前初始显示的点位，而不是关联或额外添加的点位
            if (item.ThresholdmarkLineData.length) {
              let pieces = []
              let numbers = item.ThresholdmarkLineData.map(item => item.yAxis)
              numbers = [item.minValue, ...numbers, item.maxValue].sort(
                (a, b) => a - b
              )
              for (let i = 1; i < numbers.length; i++) {
                pieces.push({
                  gt: numbers[i - 1],
                  lte: numbers[i]
                })
              }
              pieces.forEach((item, index) => {
                // 因为pieces的长度一定小于6，所以可以用下标从取colors里面取值
                item.color = visualMapColors[index]
              })
              visualMap.pieces = pieces
            }
          }
        }
      })
      if (isShowMsg) {
        this.$message('存在点位没有设置阈值')
      }

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
          right:
            90 +
            (this.chartYAxisData.length > 2
              ? (this.chartYAxisData.length - 2) * 70
              : 0), // 如果y轴数量大于2，图表右侧要对应添加留白
          bottom: 30,
          top: 65
        },
        // dataZoom: [
        //   {
        //     type: 'slider',
        //     xAxisIndex: 0,
        //     filterMode: 'empty',
        //     handleIcon:
        //       'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        //     handleSize: '90%'
        //   },
        //   {
        //     type: 'inside',
        //     xAxisIndex: 0,
        //     filterMode: 'empty'
        //   }
        // ],
        legend: {
          show: true,
          type: 'plain',
          padding: [0, 50]
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const colorSpan = color =>
              `<i class="circlepoint" style="background: ${color}"></i>`
            let text =
              this._dateFormat(
                params[0].axisValue,
                this.form.interval < 1
                  ? 'YYYY-MM-DD HH:mm:ss'
                  : 'YYYY-MM-DD HH:mm'
              ) + '<br/>'
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
      // 暂时取消显示阈值时的分层显示功能
      // if (showThreshold && visualMap.pieces.length) {
      //   option.visualMap = visualMap
      // }

      // if (this.chartSeries.some(item => item.pointType === 0)) {
      //   // 如果包含模拟量类型的点位，就显示 y 轴的缩放组件
      //   option.dataZoom.push({
      //     type: 'slider',
      //     yAxisIndex: this.chartYAxisData.map((item, index) => index), // 控制所有y轴缩放
      //     filterMode: 'empty',
      //     handleIcon:
      //       'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      //     handleSize: '90%'
      //   })
      // }

      // 使用刚指定的配置项和数据显示图表。
      this.myChart.setOption(
        Object.assign(option, { yAxis: this.chartYAxisData })
      )
      this.$emit('requestChart', {
        chart: this.myChart,
        index: this.keyPointIndex,
        chartId: this.chartWrapId
      })
      // 说明点击的是下载pdf
      if (this.pdfLoading === true) {
        this.dataSource.startTime = this._dateFormat(
          this.form.startTime,
          'YYYY-MM-DD HH:mm'
        )
        this.dataSource.endTime = this._dateFormat(
          this.form.endTime,
          'YYYY-MM-DD HH:mm'
        )
        try {
          const htmlText = generateHTML(
            this.myChart.getDataURL({ backgroundColor: '#fff' }),
            this.dataSource
          )
          const formData = new FormData()
          formData.append('BucketName', 'back-end-assets')
          formData.append('ObjectName', 'Temp/')
          formData.append('htmlText', htmlText)
          htmlToPdf(formData)
            .then(({ data }) => {
              if (data.Code === 200) {
                window.open(data.Data, '_blank')
              } else {
                this.$message.error('导出失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('导出失败')
            })
            .finally(() => {
              this.pdfLoading = false
            })
        } catch (error) {
          console.error(error)
          this.pdfLoading = false
          this.$message.error('导出失败')
        }
      }
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
      this.$refs.pointSelectDialog.clearCache() // 清空『添加对比点位』弹窗中已选择的内容
      this.myChart && this.myChart.clear()
      this.chartSeries = []
      this.chartYAxisData = []
      this.form.pointIdsByAdd = []
      this.form.showRelatePoint = false
      this.form.showStatistical = true
      this.form.showThreshold = false
      this.form.startTime = new Date(new Date().getTime() - 24 * 3600 * 1000)
      this.form.endTime = new Date()
      this.form.dateRange = [
        new Date(new Date().getTime() - 24 * 3600 * 1000),
        new Date()
      ]
      this.form.interval = this.interval
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
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
