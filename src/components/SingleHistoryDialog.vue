<template>
  <el-dialog
    :title="
      this.type && dialogType[this.type]
        ? dialogType[this.type] + '历史数据'
        : '历史数据'
    "
    :visible.sync="dialogVisible"
    width="1300px"
    top="10vh"
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
          <el-form-item label="时间范围：" prop="dateRange">
            <el-date-picker
              v-model="form.dateRange"
              size="small"
              :clearable="false"
              type="datetimerange"
              value-format="yyyy-MM-dd HH:mm"
              format="yyyy-MM-dd HH:mm"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 310px"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item
            label="间隔："
            prop="interval"
            style="margin-left: 15px;"
          >
            <el-input
              clearable
              v-model.trim.number="form.interval"
              placeholder="分钟"
            />
          </el-form-item>
          <span style="position: relative;top: 9px">分钟</span>
          <el-form-item style="margin-left: 20px;">
            <el-button
              :loading="loading"
              size="medium"
              type="primary"
              @click.native="search('form')"
            >
              查看数据
            </el-button>
            <el-button
              :loading="downloadLoading"
              size="medium"
              type="primary"
              @click.native="downExcel('form')"
            >
              导出excel
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-radio-group size="small" v-model="model" style="margin-left: 50px;">
        <el-radio-button label="chart">图表</el-radio-button>
        <el-radio-button label="table">表格</el-radio-button>
      </el-radio-group>
      <div v-show="model === 'chart'" v-nodata="isNoData" class="history-chart">
        <div
          :id="chartWrapId"
          v-loading="loading"
          element-loading-text="加载中..."
          style="min-width:400px;height:450px"
        />
      </div>
      <div
        v-show="model === 'table'"
        empty-text="暂无数据"
        style="margin: 15px 30px 0 30px;"
        v-loading="loading"
      >
        <el-table :data="tableData" style="width: 100%" :height="435">
          <el-table-column
            align="center"
            v-for="(item, index) in tableCols"
            min-width="120"
            :prop="item"
            :label="item"
            :key="item + index"
          >
            <template slot-scope="{ row }">
              {{ row[item] || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getSensorHistList, downSensorHistoryData } from '@/api/device_new'
import { saveAs } from 'file-saver'
import { dataURItoBlob } from '@/utils/index'
import debounce from 'lodash/debounce'

export default {
  props: {
    name: {
      type: String,
      default: function() {
        return ''
      }
    },
    type: {
      type: String,
      default: function() {
        return ''
      }
    },
    id: {
      type: String,
      default: function() {
        return null
      }
    },
    interval: {
      type: Number,
      default: function() {
        return 1
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        interval: this.interval,
        dateRange: ''
      },
      formRules: {
        interval: [
          {
            required: true,
            message: '输入时间间隔(最小为0的整数)',
            min: 0,
            type: 'number',
            trigger: 'blur'
          }
        ]
      },
      model: 'chart',
      tableData: [],
      tableCols: [],
      chartWrapId: '',
      isNoData: false,
      loading: false,
      downloadLoading: false,
      dialogType: {
        Battery: '电量',
        Voltage: '电压',
        TValue: '温度',
        HValue: '湿度',
        Rssi: '信号强度'
      }
    }
  },
  watch: {
    interval(val) {
      this.form.interval = val
    },
    'form.interval'(val) {
      if (val === '') {
        return
      }
      this.fetchChartSeries()
    },
    dialogVisible(e) {
      if (e) {
        this.$nextTick(() => {
          this.myChart = echarts.init(document.getElementById(this.chartWrapId))
        })
      }
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
      this.form.dateRange = [new Date(new Date().getTime() - 864e5), new Date()]
      this.dialogVisible = !this.dialogVisible
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
    downExcel(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) {
          return false
        }
        this.downloadLoading = true
        const { dateRange } = this.form
        downSensorHistoryData({
          startTime: this._dateFormat(dateRange[0], 'YYYY-MM-DD HH:mm'),
          endTime: this._dateFormat(dateRange[1], 'YYYY-MM-DD HH:mm'),
          sensorId: this.id,
          ts: this.form.interval,
          type: this.type
        })
          .then(res => {
            if (
              res.headers['content-type'] === 'application/json; charset=utf-8'
            ) {
              // blob转json
              var reader = new FileReader()
              reader.onload = e => {
                const temp = JSON.parse(e.target.result)
                this.$message(temp.Message)
              }
              reader.readAsText(res.data)
              return false
            }
            const blob = new Blob([res.data])
            saveAs(blob, `${this.id}传感器历史数据.xls`)
          })
          .catch(err => {
            console.error(err)
            this.$message.error('导出失败')
          })
          .finally(() => {
            this.downloadLoading = false
          })
      })
    },
    downImg() {
      saveAs(dataURItoBlob(this.myChart.getDataURL()), 'chart.jpg')
    },
    downloadExcel(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let temp = ''
          this.pointIds.forEach(item => {
            temp += `pointIdList=${item}&`
          })
          const { dateRange } = this.form
          let start = this._dateFormat(dateRange[0], 'YYYY-MM-DD HH:mm')
          let end = this._dateFormat(dateRange[1], 'YYYY-MM-DD HH:mm')
          window.open(
            `${BASE_URI}/api/Device/DownHistoryData?start=${start}&end=${end}&tmes=${this.form.interval}&${temp}`,
            '_blank'
          )
        }
      })
    },
    fetchChartSeries: debounce(function() {
      this.loading = true
      const { dateRange } = this.form
      getSensorHistList({
        startTime: this._dateFormat(dateRange[0], 'YYYY-MM-DD HH:mm'),
        endTime: this._dateFormat(dateRange[1], 'YYYY-MM-DD HH:mm'),
        sensorId: this.id,
        ts: this.form.interval,
        type: this.type
      })
        .then(res => {
          if (200 === res.data.Code) {
            const data = res.data.Data
            if (!data) {
              this.isNoData = true
              this.$message('无历史数据')
              return
            }
            let seriesData = []

            let tableCols = ['时间', '数值']
            let tableData = []

            data.forEach(item => {
              seriesData.push([item.Time, item.Value])
              tableData.push({
                时间: item.Time,
                数值: item.Value
              })
            })
            this.tableData = tableData
            this.tableCols = tableCols

            this.chartSeries = [
              {
                animation: false,
                name: this.id,
                type: 'line',
                smooth: false,
                data: seriesData
              }
            ]
            this.drawChart()
          } else {
            if (500 === res.data.Code) {
              this.$message(res.data.Message)
              this.isNoData = true
            } else {
              this.$message.error('历史数据查询失败')
            }
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('历史数据查询失败')
        })
        .finally(() => {
          this.loading = false
        })
    }, 500),
    drawChart() {
      this.myChart && this.myChart.clear()
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
          top: 40
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
          show: true
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
            formatter: t => {
              return this._dateFormat(t, 'YYYY-MM-DD HH:mm:ss')
            }
          },
          splitLine: {
            show: false
          }
        },
        series: this.chartSeries
      }
      let yAxisOption = {
        yAxis: {
          type: 'value',
          name:
            'TValue' === this.type
              ? '°C'
              : 'HValue' === this.type
              ? '%'
              : 'Voltage' === this.type
              ? 'V'
              : '%',
          scale: !1,
          boundaryGap: ['20%', '20%']
        }
      }
      option.dataZoom.push({
        type: 'slider',
        yAxisIndex: 0,
        filterMode: 'empty',
        handleIcon:
          'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '90%'
      }),
        this.myChart.setOption(Object.assign(option, yAxisOption))
    },
    handleOpen() {
      this.id && this.id.length && this.fetchChartSeries()
    },
    handleClose() {
      this.myChart && this.myChart.clear()
      this.chartSeries = []
      this.form.interval = this.interval
      this.form.dateRange = [new Date(new Date().getTime() - 864e5), new Date()]
      this.isNoData = false
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
