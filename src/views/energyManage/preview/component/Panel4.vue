<template>
  <div class="energy_manage-panel energy_manage-preview-panel4">
    <div class="panel-header">
      <div>
        <span class="title">月用能趋势</span>
        <el-link
          @click.native="() => (model = 'chart')"
          :underline="false"
          :type="model === 'chart' ? 'primary' : undefined"
          style="margin-left: 10px;"
        >
          <c-svg name="linechart" style="font-size: 17px;" />
        </el-link>
        <el-link
          @click.native="() => (model = 'table')"
          :underline="false"
          :type="model === 'table' ? 'primary' : undefined"
          style="margin-left: 10px"
        >
          <c-svg name="table1" style="font-size: 17px;" />
        </el-link>
      </div>
      <div>
        <span class="desc"
          >本月用量<span class="desc-bold">{{ currentMonthNum }}</span
          >{{ unitText }}</span
        ><span class="desc"
          >本月指标消耗<span class="desc-bold">{{ currentMonthPercent }}</span
          >%</span
        ><span class="desc"
          >上月用量<span class="desc-bold">{{ lastMonthNum }}</span
          >{{ unitText }}</span
        >
      </div>
    </div>
    <div v-loading="chartLoading">
      <div
        v-show="model === 'chart'"
        v-nodata="isNoData"
        :id="chartWrapId"
        class="chart-wrap"
      ></div>
      <div v-show="model === 'table'" v-nodata="isNoData" class="table-wrap">
        <el-table
          empty-text=" "
          :data="tableData"
          style="width: 100%"
          :height="270"
        >
          <el-table-column
            v-for="(item, index) in tableCols"
            :prop="item"
            :label="item"
            :key="item + index"
          >
          </el-table-column>
        </el-table>
        <el-link
          :underline="false"
          @click.native="handleExportExcel"
          v-permission="[121]"
          class="table-download-btn"
        >
          <c-svg name="xiazai1"></c-svg>
        </el-link>
      </div>
    </div>
    <div class="statistial_table-wrap">
      <div style="margin-bottom: 15px;">
        <el-button
          icon="el-icon-download"
          :loading="exportLoading"
          @click.native="handleClickExport"
          plain
          size="mini"
          >导出表格</el-button
        >
        <el-button
          icon="el-icon-edit"
          :loading="editLoading"
          @click.native="handleClickEdit"
          plain
          size="mini"
          >{{ editFlag ? '保存指标' : '编辑指标' }}</el-button
        >
      </div>
      <el-table
        v-loading="tableLoading"
        :data="statisticalTableData"
        style="width: 100%"
      >
        <el-table-column prop="desc" label="" width="125"> </el-table-column>
        <el-table-column prop="col1" label="1月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col1.demand"
            ></el-input>
            <span v-else>
              {{ (row.col1 && row.col1.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col2" label="2月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col2.demand"
            ></el-input>
            <span v-else>
              {{ (row.col2 && row.col2.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col3" label="3月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col3.demand"
            ></el-input>
            <span v-else>
              {{ (row.col3 && row.col3.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col4" label="4月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col4.demand"
            ></el-input>
            <span v-else>
              {{ (row.col4 && row.col4.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col5" label="5月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col5.demand"
            ></el-input>
            <span v-else>
              {{ (row.col5 && row.col5.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col6" label="6月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col6.demand"
            ></el-input>
            <span v-else>
              {{ (row.col6 && row.col6.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col7" label="7月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col7.demand"
            ></el-input>
            <span v-else>
              {{ (row.col7 && row.col7.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col8" label="8月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col8.demand"
            ></el-input>
            <span v-else>
              {{ (row.col8 && row.col8.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col9" label="9月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col9.demand"
            ></el-input>
            <span v-else>
              {{ (row.col9 && row.col9.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col10" label="10月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col10.demand"
            ></el-input>
            <span v-else>
              {{ (row.col10 && row.col10.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col11" label="11月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col11.demand"
            ></el-input>
            <span v-else>
              {{ (row.col11 && row.col11.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="col12" label="12月">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.rowEditable"
              size="mini"
              v-model="row.col12.demand"
            ></el-input>
            <span v-else>
              {{ (row.col12 && row.col12.demand) || '-' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import dayjs from 'dayjs'
import uuidv1 from 'uuid/v1'
const chartWrapId = uuidv1()
import filesaver from 'file-saver'
import {
  exportEnergyQuota,
  updateEnergyDemand,
  getEnergyQuota,
  getEnergyTimeContrastBrokenLine
} from '@/api/energyStatistical'
import { checkPermission } from '@/utils/permissions'

export default {
  data() {
    return {
      model: 'chart',
      filterForm: {
        branchId: undefined,
        deviceIds: []
      },
      chartLoading: false,
      exportLoading: false,
      isNoData: false,
      currentMonthNum: '-',
      currentMonthPercent: '-',
      lastMonthNum: '-',
      unitText: '',
      options: {
        color: [
          '#26A9FF',
          '#00C74C',
          '#FECC00',
          '#242F77',
          '#8F30E8',
          '#00C6C3',
          '#3E29CF',
          '#FD2E62'
        ],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          itemGap: 20,
          itemHeight: 10,
          itemWidth: 10,
          bottom: 5
        },
        toolbox: {
          feature: (() => {
            if (checkPermission([121])) {
              return {
                saveAsImage: {
                  name: '月用能趋势'
                }
              }
            } else {
              return {}
            }
          })(),
          right: 0,
          bottom: 0
        },
        grid: {
          top: 45,
          left: 35,
          right: 40,
          bottom: 40,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#f5f5f5']
            }
          },
          axisLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '',
          splitLine: {
            lineStyle: {
              color: ['#f5f5f5']
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        series: []
      },
      tableData: [],
      tableCols: [],
      editLoading: false,
      editFlag: false,
      tableLoading: false,
      statisticalTableData: [],
      chartWrapId
    }
  },
  computed: {
    sidebarStatus() {
      return this.$store.state.app.sidebar
    },
    structTree() {
      return this.$store.state.energy.energyStruct
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  watch: {
    projectId() {
      // this.fetchChartData()
      // this.fetchTableData()
    },
    'filterForm.branchId'(val) {
      this.filterForm.deviceIds = this.structTree
        .find(item => {
          return item.SubentryId === val
        })
        .ModelTreeList.map(item => {
          return item.ModelTreeId
        })
      this.fetchChartData()
      this.fetchTableData()
    },
    sidebarStatus() {
      setTimeout(() => {
        this.chart.resize()
      }, 500)
    },
    options: {
      handler: function(val) {
        this.chart.setOption(val, true)
      },
      deep: true
    }
  },
  mounted() {
    this.filterForm.branchId = this.structTree.find(item => {
      return '电量' === item.Name
    }).SubentryId
    this.initCharts()
    window.addEventListener('resize', () => {
      if (this.model === 'chart') {
        this.chart.resize()
      }
    })
  },
  methods: {
    handleExportExcel() {
      import('@/utils/export2Excel').then(excel => {
        const tHeader = this.tableCols
        const data = this.formatJson(this.tableCols, this.tableData)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '月用能趋势',
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    },
    handleClickExport() {
      const { branchId, deviceIds } = this.filterForm
      deviceIds.length
        ? ((this.exportLoading = true),
          exportEnergyQuota({
            projectId: this.projectId,
            subentryId: branchId,
            modelTreeIdList: deviceIds
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
              filesaver.saveAs(a, '能耗指标列表.xls')
            })
            .catch(err => {
              console.error(err)
              this.$message.error('导出失败')
            })
            .finally(() => {
              this.exportLoading = false
            }))
        : this.$message('选中的分项下面没有设备，无法查询')
    },
    handleClickEdit() {
      if (
        ((this.editFlag = !this.editFlag),
        (this.statisticalTableData[0].rowEditable = !this
          .statisticalTableData[0].rowEditable),
        !this.editFlag)
      ) {
        let list = []
        Object.keys(this.statisticalTableData[0]).forEach(n => {
          'desc' !== n &&
            'rowEditable' !== n &&
            list.push(this.statisticalTableData[0][n])
        })
        this.editLoading = true
        updateEnergyDemand({
          list
        })
          .then(res => {
            if (200 === res.data.Code) {
              this.fetchTableData()
              this.$message.success('更新成功')
            } else {
              this.$message.error('更新失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('更新失败')
          })
          .finally(() => {
            this.editLoading = false
          })
      }
    },
    initCharts() {
      this.chart = echarts.init(document.getElementById(chartWrapId))
      this.chart.setOption(this.options)
    },
    fetchChartData: debounce(
      function() {
        const { branchId, deviceIds } = this.filterForm
        if (!deviceIds.length) {
          this.$message('选中的分项下面没有设备，无法查询')
          this.isNoData = true
          // this.options.series = []
          this.tableData = []
          this.tableCols = []
          this.chart.clear()
          return
        }
        this.chartLoading = true
        const dates = []
        const now = new Date()
        dates.push({
          StartDate: dayjs(now)
            .startOf('month')
            .format('YYYY-MM-DD'),
          EndDate: dayjs(now)
            .endOf('month')
            .add(1, 's')
            .format('YYYY-MM-DD')
        }),
          dates.push({
            StartDate: dayjs(now)
              .subtract(1, 'month')
              .startOf('month')
              .format('YYYY-MM-DD'),
            EndDate: dayjs(now)
              .startOf('month')
              .format('YYYY-MM-DD')
          }),
          getEnergyTimeContrastBrokenLine({
            dateType: 3,
            timeQuantumList: dates,
            modelTreeIdList: deviceIds
          })
            .then(res => {
              if (branchId === this.filterForm.branchId)
                if (200 === res.data.Code) {
                  this.isNoData = false
                  var data = res.data.Data
                  let tableCols = ['日期']
                  data.DataList.forEach((item, index) => {
                    item.realName = item.name
                    tableCols.push(item.name)
                    if (0 === index) {
                      item.name = '本月'
                      this.currentMonthNum = item.Total
                      if (branchId === 1) {
                        // 如果选的分项是电量的话
                        this.$store.commit('UPDATE_PREVIEW_DATA', {
                          currentMonthElectricityUse: item.Total
                        })
                      }
                    } else {
                      item.name = '上月'
                      this.lastMonthNum = item.Total
                      if (branchId === 1) {
                        // 如果选的分项是电量的话
                        this.$store.commit('UPDATE_PREVIEW_DATA', {
                          lastMonthElectricityUse: item.Total
                        })
                      }
                    }

                    item.type = 'line'
                    item.areaStyle = {}
                    item.unitDesc = data.UnitAndDescription.UnitDesc
                    item.unit = data.UnitAndDescription.Unit
                  })
                  this.options.series = data.DataList
                  this.options.xAxis.data = data.XNameList
                  this.options.yAxis.name =
                    data.UnitAndDescription.UnitDesc +
                    '/' +
                    data.UnitAndDescription.Unit
                  this.unitText = data.UnitAndDescription.Unit
                  let tableData = []
                  data.XNameList.forEach((t, index) => {
                    var temp = {
                      日期: t
                    }
                    data.DataList.forEach(item => {
                      temp[item.realName] =
                        null === item.data[index] ? '-' : item.data[index]
                    })
                    this.tableCols = tableCols

                    tableData.push(temp)
                  })
                  this.tableData = tableData
                } else {
                  this.isNoData = false
                  this.options.series = []
                  this.tableData = []
                  this.tableCols = []
                  this.$message.error('数据获取失败')
                }
            })
            .catch(err => {
              this.isNoData = true
              console.error(err)
              this.$message.error('数据获取失败')
            })
            .finally(() => {
              branchId === this.filterForm.branchId &&
                (this.chartLoading = false)
            })
      },
      1000,
      {
        leading: true
      }
    ),
    fetchTableData() {
      var e = this,
        t = this.filterForm,
        n = t.branchId,
        a = t.deviceIds
      a.length
        ? ((this.tableLoading = true),
          getEnergyQuota({
            projectId: this.projectId,
            subentryId: n,
            modelTreeIdList: a
          })
            .then(t => {
              if (200 === t.data.Code) {
                var n = t.data.Data,
                  a = n.DataDic
                let row1 = {
                  desc: n.Description1,
                  rowEditable: false,
                  col1: {
                    id: a['1'].EnergyDemandId,
                    demand: a['1'].Quota
                  },
                  col2: {
                    id: a['2'].EnergyDemandId,
                    demand: a['2'].Quota
                  },
                  col3: {
                    id: a['3'].EnergyDemandId,
                    demand: a['3'].Quota
                  },
                  col4: {
                    id: a['4'].EnergyDemandId,
                    demand: a['4'].Quota
                  },
                  col5: {
                    id: a['5'].EnergyDemandId,
                    demand: a['5'].Quota
                  },
                  col6: {
                    id: a['6'].EnergyDemandId,
                    demand: a['6'].Quota
                  },
                  col7: {
                    id: a['7'].EnergyDemandId,
                    demand: a['7'].Quota
                  },
                  col8: {
                    id: a['8'].EnergyDemandId,
                    demand: a['8'].Quota
                  },
                  col9: {
                    id: a['9'].EnergyDemandId,
                    demand: a['9'].Quota
                  },
                  col10: {
                    id: a['10'].EnergyDemandId,
                    demand: a['10'].Quota
                  },
                  col11: {
                    id: a['11'].EnergyDemandId,
                    demand: a['11'].Quota
                  },
                  col12: {
                    id: a['12'].EnergyDemandId,
                    demand: a['12'].Quota
                  }
                }
                let row2 = {
                  desc: n.Description2,
                  col1: {
                    id: a['1'].EnergyDemandId,
                    demand: a['1'].RealityValue
                  },
                  col2: {
                    id: a['2'].EnergyDemandId,
                    demand: a['2'].RealityValue
                  },
                  col3: {
                    id: a['3'].EnergyDemandId,
                    demand: a['3'].RealityValue
                  },
                  col4: {
                    id: a['4'].EnergyDemandId,
                    demand: a['4'].RealityValue
                  },
                  col5: {
                    id: a['5'].EnergyDemandId,
                    demand: a['5'].RealityValue
                  },
                  col6: {
                    id: a['6'].EnergyDemandId,
                    demand: a['6'].RealityValue
                  },
                  col7: {
                    id: a['7'].EnergyDemandId,
                    demand: a['7'].RealityValue
                  },
                  col8: {
                    id: a['8'].EnergyDemandId,
                    demand: a['8'].RealityValue
                  },
                  col9: {
                    id: a['9'].EnergyDemandId,
                    demand: a['9'].RealityValue
                  },
                  col10: {
                    id: a['10'].EnergyDemandId,
                    demand: a['10'].RealityValue
                  },
                  col11: {
                    id: a['11'].EnergyDemandId,
                    demand: a['11'].RealityValue
                  },
                  col12: {
                    id: a['12'].EnergyDemandId,
                    demand: a['12'].RealityValue
                  }
                }
                let row3 = {
                    desc: n.Description3,
                    col1: {
                      id: a['1'].EnergyDemandId,
                      demand: a['1'].Ratio
                    },
                    col2: {
                      id: a['2'].EnergyDemandId,
                      demand: a['2'].Ratio
                    },
                    col3: {
                      id: a['3'].EnergyDemandId,
                      demand: a['3'].Ratio
                    },
                    col4: {
                      id: a['4'].EnergyDemandId,
                      demand: a['4'].Ratio
                    },
                    col5: {
                      id: a['5'].EnergyDemandId,
                      demand: a['5'].Ratio
                    },
                    col6: {
                      id: a['6'].EnergyDemandId,
                      demand: a['6'].Ratio
                    },
                    col7: {
                      id: a['7'].EnergyDemandId,
                      demand: a['7'].Ratio
                    },
                    col8: {
                      id: a['8'].EnergyDemandId,
                      demand: a['8'].Ratio
                    },
                    col9: {
                      id: a['9'].EnergyDemandId,
                      demand: a['9'].Ratio
                    },
                    col10: {
                      id: a['10'].EnergyDemandId,
                      demand: a['10'].Ratio
                    },
                    col11: {
                      id: a['11'].EnergyDemandId,
                      demand: a['11'].Ratio
                    },
                    col12: {
                      id: a['12'].EnergyDemandId,
                      demand: a['12'].Ratio
                    }
                  },
                  d = dayjs().month() + 1
                e.currentMonthPercent = a[d].Ratio
                  ? a[d].Ratio.replace('%', '')
                  : '-'
                e.statisticalTableData = [row1, row2, row3]
              } else e.$message.error('月用能趋势表查询失败')
            })
            .catch(function(e) {
              console.error(e)
            })
            .finally(function() {
              e.tableLoading = false
            }))
        : (this.statisticalTableData = [])
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          return v[j]
        })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.energy_manage-preview-panel4 {
  .chart-wrap {
    height: 320px;
  }
  .table-wrap {
    position: relative;
    box-sizing: border-box;
    height: 320px;
    padding: 20px 30px;
    .table-download-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      .icon {
        font-size: 16px;
      }
    }
  }
  .statistial_table-wrap {
    padding: 30px;
  }
  .desc {
    padding-left: 25px;
    color: #bfbfbf;
    font-size: 14px;
  }
  .desc-bold {
    padding: 0 12px;
    font-size: 20px;
    font-weight: 500;
    color: #000;
  }
}
</style>
