<template>
  <div class="device-analysis">
    <page-header
      :title="$route.meta.title"
      showBack
      :onClickBack="() => $router.push('/analysis/home')"
    >
      <template v-slot:right>
        <div style="flex: 1;display: flex;justify-content: flex-end">
          <el-button
            @click.native="$refs.timeIntervalSetDialog.openDialog()"
            style="margin-left: 15px;"
            size="mini"
          >
            <c-svg name="time-circle" style="font-size: 13px;"></c-svg>
            时段设置
          </el-button>
        </div>
      </template>
    </page-header>
    <div
      class="device-analysis content-box"
      style="padding: 0;background-color: transparent"
    >
      <div style="background-color: #fff;display: flex">
        <div style="flex: 1">
          <el-card shadow="never" style="border-bottom: none">
            <!--图-->
            <div class="line-chart-wrap" v-if="keyPointList.length">
              <div
                class="content-box key-point-box"
                v-for="(item, index) in keyPointList"
                :key="index"
              >
                <LineChart
                  :ref="'keyPointHistoryDialog' + index"
                  :info="item"
                  @requestReg="KeyPointRequestReg"
                  @requestChart="KeyPointRequestChart"
                  :Index="index"
                ></LineChart>
              </div>
            </div>
            <!--表格-->
            <div style="margin-top: 36px" v-if="tableData.length">
              <div>
                <el-button
                  icon="el-icon-download"
                  type="primary"
                  size="mini"
                  :loading="exportLoading"
                  @click.native="downloadExcel"
                >
                  导出
                </el-button>
                <!--                <el-input-->
                <!--                  v-model="projectNameFilter"-->
                <!--                  placeholder="请输入项目名称"-->
                <!--                  size="small"-->
                <!--                  clearable-->
                <!--                  style="width: 200px;float: right;"-->
                <!--                />-->
              </div>
              <el-table
                v-loading="tableLoading"
                :data="tableData"
                style="width: 100%;margin-top: 20px;"
              >
                <el-table-column type="index" label="排名" width="50px" />

                <el-table-column
                  v-for="item in Object.keys(tableData[0])"
                  :key="item"
                  :prop="item"
                  :label="item"
                />
              </el-table>
              <el-pagination
                background
                :current-page.sync="pagination.currentPage"
                :page-size.sync="pagination.size"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pagination.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
            <!--缺省页-->
            <div
              class="content-box no-data"
              v-if="!tableData.length && !keyPointList.length"
            >
              <img
                style="width: 80px;"
                src="
          https://cdn.sinocold.net/images/empty.png"
                alt="暂无数据"
              />
              <div class="no-data-text">暂无数据</div>
              <div class="no-data-remark">您可通过右边「筛选条件」添加</div>
            </div>
          </el-card>
        </div>
        <!--        筛选条件-->
        <div style="width: 346px">
          <el-card shadow="never" style="border-bottom: none">
            <div slot="header" class="clearfix">
              <span class="card-title">筛选条件</span>
              <!--              <el-button-->
              <!--                type="text"-->
              <!--                style="float: right;padding: 0;"-->
              <!--                @click.native="resetForm"-->
              <!--              >-->
              <!--                清除筛选-->
              <!--              </el-button>-->
            </div>
            <el-form
              ref="filterForm"
              :model="form"
              size="medium"
              label-position="top"
              class="thin-scroll"
            >
              <el-form-item label="日期">
                <CustomDatePicker
                  :typeArr="['day', 'month', 'year', 'custom']"
                  @timeChange="timeChange"
                  @typeChange="timeTypeChange"
                  size="small"
                  ref="customDatePicker"
                ></CustomDatePicker>
              </el-form-item>
              <el-form-item label="时段">
                <CustomTimeIntervalPicker
                  :company-id="companyId"
                  @typeChange="timeIntervalTypeChange"
                  @chooseChange="timeIntervalChange"
                  size="small"
                  ref="customTimeIntervalPicker"
                ></CustomTimeIntervalPicker>
              </el-form-item>
              <el-form-item label="选择项目范围">
                <el-cascader
                  :options="companyStruct"
                  ref="cascader"
                  collapse-tags
                  :show-all-levels="false"
                  clearable
                  filterable
                  style="width: 300px;"
                  :props="cascaderProps"
                  @change="areaChange"
                >
                  <template slot="empty">
                    暂无数据
                  </template>
                  <template slot-scope="{ node, data }">
                    <c-svg
                      :name="
                        data.Remark === '项目'
                          ? 'location-fill'
                          : 'folder-open-fill'
                      "
                      :style="{
                        color: data.Remark === '项目' ? '#909399' : '#5AC8FA'
                      }"
                    />
                    <span>&nbsp;{{ data.SubareaName }}</span>
                    <c-svg
                      v-if="data.IsSummary"
                      style="color: #909399; margin-left: 5px"
                      name="zong"
                    ></c-svg>
                  </template>
                </el-cascader>
              </el-form-item>
              <el-form-item label="选择设备" style="margin-bottom: 18px;">
                <el-select
                  v-model="chooseDeviceIdList"
                  :disabled="!projectIdList.length"
                  placeholder="搜索设备温区/标签/名称"
                  popper-class="device-selector-JSDKF38924"
                  style="width:100%;"
                  multiple
                  filterable
                  clearable
                  :filter-method="filterDeviceListFun"
                  @change="deviceChanage"
                >
                  <el-option
                    v-for="item in filterDeviceList"
                    :key="item.ModelTreeId"
                    :label="item.ModelTreeName"
                    :value="item.ModelTreeId"
                  >
                    <div
                      class="option-item"
                      :class="
                        chooseDeviceIdList.includes(item.ModelTreeId)
                          ? 'choose-option-item'
                          : ''
                      "
                    >
                      <div>
                        <div class="option-title">
                          {{ item.ModelTreeName }}
                        </div>
                        <div class="option-text">
                          {{ item.ProjectName }}
                        </div>
                      </div>
                      <div
                        v-show="chooseDeviceIdList.includes(item.ModelTreeId)"
                      >
                        <i
                          class="el-icon-check"
                          style="width: 16px;height: 16px;color: #1890FF"
                        ></i>
                      </div>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="选择点位" style="margin-bottom: 18px;">
                <el-select
                  v-model="form.PointIdList"
                  :disabled="!chooseDeviceIdList.length"
                  placeholder="搜索点位名称/类型"
                  style="width:100%;"
                  popper-class="device-selector-JSDKF38924"
                  multiple
                  filterable
                  clearable
                  :filter-method="filterPointListFun"
                  @change="pointVisibleChange"
                >
                  <el-option
                    v-for="item in filterPointList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <div
                      class="option-item"
                      :class="
                        form.PointIdList.includes(item.id)
                          ? 'choose-option-item'
                          : ''
                      "
                    >
                      <div>
                        <div class="option-title">{{ item.name }}</div>
                        <div class="option-text">
                          {{ item.ModelTreeName }}
                        </div>
                        <div class="option-text">{{ item.ProjectName }}</div>
                      </div>
                      <div v-show="form.PointIdList.includes(item.id)">
                        <i
                          class="el-icon-check"
                          style="width: 16px;height: 16px;color: #1890FF"
                        ></i>
                      </div>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
    <TimeIntervalSetDialog
      :companyId="companyId"
      ref="timeIntervalSetDialog"
    ></TimeIntervalSetDialog>
  </div>
</template>

<script>
import LineChart from './component/LineChart'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // load on demand
dayjs.locale('zh-cn')
import {
  getModelTreePage,
  queryPointRead,
  getModelTreeShowPoint
} from '@/api/model_new'
import { getMoreProjectPointTable } from '@/api/deviceMonitoryPoint'
import CustomDatePicker from '@/components/CustomDatePicker'
import CustomTimeIntervalPicker from '@/components/CustomTimeIntervalPicker'
import TimeIntervalSetDialog from '@components/TimeIntervalSetDialog/TimeIntervalSetDialog'
import saveAs from 'file-saver'

export default {
  components: {
    LineChart,
    Treeselect,
    CustomDatePicker,
    CustomTimeIntervalPicker,
    TimeIntervalSetDialog
  },
  data() {
    return {
      cascaderProps: {
        multiple: true,
        children: 'Children',
        label: 'SubareaName',
        value: 'ProjectId'
      },

      filterLoading: false, //筛选区域loading
      projectIdList: [], //选择的项目ID列表
      filterDeviceList: [], // 筛选后的设备列表
      deviceList: [], // 设备列表
      filterPointList: [], // 筛选后的点位列表
      pointList: [], //点位列表
      chooseDeviceIdList: [], // 已选择的设备ID列表
      keyPointList: [], //图列表
      keyPointChartList: [], //图实例列表

      form: {
        PointIdList: [],
        DateType: undefined,
        TimeQuantum: {
          StartDate: undefined,
          EndDate: undefined
        },
        TimeIntervalId: undefined,
        ClassifyList: []
      },

      projectNameFilter: '', // 表格 项目名称筛选值
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      tableData: [],
      tableLoading: false,
      exportLoading: false,

      dayjs
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    companyStruct() {
      return this.$store.state.app.subarea
    }
  },
  watch: {
    projectNameFilter() {
      this.fetchTableData()
    }
  },
  mounted() {
    this.$refs.customDatePicker.init('day', true)
    this.$refs.customTimeIntervalPicker.init('default', true)
  },
  methods: {
    // 获取图标实例
    KeyPointRequestChart({ chart, index }) {
      this.keyPointChartList[index] = chart
      if (this.keyPointChartList.length === this.keyPointList.length) {
        for (let i = 0; i < this.keyPointChartList.length; i++) {
          if (!this.keyPointChartList[i]) {
            return
          }
        }
        // 图标联动
        echarts.connect('deviceRunningAnalysisCharts')
      }
    },
    KeyPointRequestReg() {},
    // 设备列表筛选
    filterDeviceListFun(v) {
      if (v) {
        this.filterDeviceList = this.deviceList.filter(
          item =>
            (item.ModelTreeName &&
              item.ModelTreeName.indexOf &&
              item.ModelTreeName.indexOf(v) >= 0) ||
            (item.ModelTreePropertyList.length &&
              item.ModelTreePropertyList.filter(
                item1 =>
                  item1.Key === '温区' &&
                  item1.Value &&
                  item1.Value.indexOf &&
                  item1.Value.indexOf(v) >= 0
              ).length) ||
            (item.Tag && item.Tag.indexOf && item.Tag.indexOf(v) >= 0)
        )
      } else {
        this.filterDeviceList = this.deviceList
      }
    },
    // 点位列表筛选
    filterPointListFun(v) {
      if (v) {
        this.filterPointList = this.pointList.filter(
          item =>
            (item.ModelTreeName &&
              item.ModelTreeName.indexOf &&
              item.ModelTreeName.indexOf(v) >= 0) ||
            (item.name && item.name.indexOf && item.name.indexOf(v) >= 0)
        )
      } else {
        this.filterPointList = this.pointList
      }
    },
    // 清除筛选
    resetForm() {
      this.form = {
        PointIdList: [],
        DateType: undefined,
        TimeQuantum: {
          StartDate: undefined,
          EndDate: undefined
        },
        TimeIntervalId: undefined,
        ClassifyList: []
      }
    },
    // 清除图表数据
    resertReviewList() {
      this.pagination.currentPage = 1
      this.tableData = []
      this.keyPointList = []
      this.keyPointChartList = []
      this.form.PointIdList = []
    },
    // 更换时间类型
    timeTypeChange(val) {
      let DateType = ''
      switch (val) {
        case 'day':
          DateType = 'Day'
          break
        case 'week':
          DateType = 'Week'
          break
        case 'month':
          DateType = 'Month'
          break
        case 'year':
          DateType = 'Year'
          break
        case 'custom':
          DateType = 'Custom'
          break
        default:
          DateType = 'Day'
          break
      }
      this.form.DateType = DateType
    },
    // 更换时间
    timeChange(val) {
      if (val.type === 'custom' && (!val.dateRange || !val.dateRange.length)) {
        return
      }
      let DateType = ''
      switch (val.type) {
        case 'day':
          DateType = 'Day'
          break
        case 'week':
          DateType = 'Week'
          break
        case 'month':
          DateType = 'Month'
          break
        case 'year':
          DateType = 'Year'
          break
        case 'custom':
          DateType = 'Custom'
          break
        default:
          DateType = 'Day'
          break
      }
      this.form.DateType = DateType
      this.form.TimeQuantum.StartDate =
        val.dateRange.length > 1 ? val.dateRange[0] : ''
      this.form.TimeQuantum.EndDate =
        val.dateRange.length > 1 ? val.dateRange[1] : ''
      this.renderChart()
    },
    // 更换时段类型
    timeIntervalTypeChange(val) {
      if (val !== 'default') {
        this.form.TimeIntervalId = undefined
        this.form.ClassifyList = []
      }
      // this.timeIntervalType = val
    },
    // 更换时段
    timeIntervalChange(val) {
      if (val.type === 'custom' && (!val.dateRange || !val.dateRange.length)) {
        return
      }
      let ClassifyList = []
      if (val.type === 'default') {
        ClassifyList =
          val.timeInterval === 'all' ? undefined : [val.timeInterval]
      } else if (val.dateRange && val.dateRange.length) {
        ClassifyList = [val.dateRange[0], val.dateRange[1]]
      } else {
        ClassifyList = undefined
      }
      this.form.TimeIntervalId = val.timeIntervalId
      this.form.ClassifyList = ClassifyList
      this.renderChart()
    },
    // 更换项目
    areaChange(val) {
      if (!val.length) {
        this.projectIdList = []
        this.chooseDeviceIdList = []
        this.form.PointIdList = []
        this.pointList = []
        this.filterPointList = []
        this.resertReviewList()
        return
      }
      let nodeList = this.$refs.cascader.getCheckedNodes()
      let projectIdList = []
      projectIdList = nodeList
        .filter(item => item.data.Remark === '项目')
        .map(item => item.data.ProjectId)
      this.projectIdList = projectIdList
      if (this.projectIdList.length) {
        getModelTreePage({
          ProjectIdList: this.projectIdList,
          IsGetStaticProperty: true,
          PageIndex: 1,
          PageSize: 9999
        })
          .then(res => {
            if (res.data.Code === 200) {
              let List = res.data.Data.Data
              this.filterDeviceList = List
              this.deviceList = List
            } else {
              this.filterDeviceList = []
              this.deviceList = []
            }
          })
          .catch(err => {
            console.error(err)
            this.filterDeviceList = []
            this.deviceList = []
          })
          .finally(() => {
            this.chooseDeviceIdList = []
            this.form.PointIdList = []
            this.pointList = []
            this.filterPointList = []
            this.resertReviewList()
          })
      } else {
        this.chooseDeviceIdList = []
        this.form.PointIdList = []
        this.pointList = []
        this.filterPointList = []
        this.resertReviewList()
      }
    },
    // 更换设备
    deviceChanage() {
      queryPointRead({
        mtidList: this.chooseDeviceIdList,
        ProjectIdList: this.projectIdList,
        BigTypeId: undefined,
        LevelList: [],
        area: undefined,
        stime: undefined,
        etime: undefined,
        typeCn: undefined,
        alarmLevel: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.pointList = res.data.Data.Data
            this.filterPointList = res.data.Data.Data
          } else {
            this.$message.error('获取点位列表失败')
            this.form.PointIdList = []
            this.pointList = []
            this.filterPointList = []
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取点位列表失败')
          this.form.PointIdList = []
          this.pointList = []
          this.filterPointList = []
        })
        .finally(() => {
          this.resertReviewList()
          getModelTreeShowPoint({
            modelTreeId: this.chooseDeviceIdList
          })
            .then(res => {
              if (res.data.Code === 200) {
                let data = res.data.Data
                this.form.PointIdList = data.length
                  ? data.map(item => item.Key)
                  : []
              } else {
                this.form.PointIdList = []
                this.$message.error('获取默认选中点位列表失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('获取默认选中点位列表失败')
            })
            .finally(() => {
              this.pointVisibleChange()
            })
        })
    },
    // 更换点位
    pointVisibleChange() {
      if (this.form.PointIdList.length) {
        this.renderChart(true)
      } else {
        this.resertReviewList()
      }
    },
    // 图表更新验证
    renderChart(init = false) {
      if (
        this.form.PointIdList.length &&
        this.form.DateType &&
        this.form.TimeQuantum.StartDate &&
        this.form.TimeQuantum.EndDate &&
        this.form.TimeQuantum.EndDate &&
        (this.form.TimeIntervalId || this.form.ClassifyList.length)
      ) {
        let val = JSON.parse(JSON.stringify(this.form.PointIdList))
        let keyPointList = []
        if (val && val.length) {
          let PointList = this.pointList.filter(
            item => val.indexOf(item.id) >= 0
          )
          PointList.map(item => {
            let flag = false
            for (let i = 0; i < keyPointList.length; i++) {
              if (
                item.ModelTreeId === keyPointList[i].ModelTreeId &&
                item.ProjectId === keyPointList[i].ProjectId
              ) {
                flag = true
                keyPointList[i].data.push(item.id)
                break
              }
            }
            if (!flag) {
              keyPointList.push({
                ProjectId: item.ProjectId,
                ProjectName: item.ProjectName,
                ModelTreeId: item.ModelTreeId,
                name: item.name,
                ModelTreeName: item.ModelTreeName,
                data: [item.id]
              })
            }
          })
        }
        this.keyPointList = keyPointList
        this.handleSizeChange()
        this.$nextTick(() => {
          for (let i = 0; i < this.keyPointList.length; i++) {
            if (init) {
              this.$refs[`keyPointHistoryDialog${i}`][0].toggleDialog(this.form)
            } else {
              this.$refs[`keyPointHistoryDialog${i}`][0].updateDialog(this.form)
            }
          }
        })
      } else {
        this.resertReviewList()
      }
    },
    async downloadExcel() {
      try {
        this.exportLoading = true
        const res = await getMoreProjectPointTable({
          ...this.form,
          isExport: true
        })

        if (res.headers['content-type'] === 'application/json; charset=utf-8') {
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
        saveAs(blob, `设备运行分析.xls`)
        this.exportLoading = false
      } catch (error) {
        this.exportLoading = false
        console.error(error)
        this.$message.error('表格导出失败')
      }
    },
    fetchTableData() {
      this.tableLoading = true
      getMoreProjectPointTable(this.form)
        .then(res => {
          if (res.data.Code === 200) {
            this.tableData = res.data.Data
            this.pagination.total = res.data.Data.length
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 删除空的Children
    walk(arr) {
      arr.forEach(item => {
        if (item.Children) {
          if (!item.Children.length) {
            delete item.Children
          } else {
            this.walk(item.Children)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.device-analysis {
  .el-card {
    overflow: visible;
  }
  .el-row--flex {
    margin-bottom: 25px;
  }
  .row1 {
    display: flex;
    margin-bottom: 25px;
    .line-chart {
      flex: 1;
      margin-right: 25px;
    }
    .chart-form {
      flex: 0 0 350px;
    }
  }
  .el-pagination {
    text-align: center;
    margin-top: 25px;
  }
  .line-chart-wrap {
    position: relative;
  }
  .line-chart-right {
    position: absolute;
    top: 60px;
    right: 15px;
    text-align: center;
  }
  .option-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }
  .choose-option-item {
    background: #e6f7ff;
  }
  .option-title {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
  }
  .option-text {
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #8fa2b5;
    line-height: 22px;
  }
  .no-data {
    margin-top: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .no-data-text {
    margin-top: 10px;
    text-align: center;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 22px;
  }
  .no-data-remark {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #1890ff;
    line-height: 22px;
  }
}
</style>

<style lang="scss">
.device-analysis {
  .el-form-item--medium .el-form-item__label {
    padding: 0;
    line-height: 31px;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    background-color: #fff;
    color: #1890ff;
  }
  .el-card__header {
    border: none;
    padding-bottom: 0;
  }
}
.device-selector-JSDKF38924 {
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    background: #e6f7ff !important;
  }
  .el-select-dropdown__item {
    height: auto;
    line-height: auto;
    margin-bottom: 6px;
    .option-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .choose-option-item {
      background: #e6f7ff !important;
    }
    .option-title {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 22px;
    }
    .option-text {
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #8fa2b5;
      line-height: 22px;
    }
  }
  .el-select-dropdown__item.selected {
    background: #e6f7ff !important;
    .option-item {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }
    .choose-option-item {
      background: #e6f7ff;
    }
    .option-title {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 22px;
    }
    .option-text {
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #8fa2b5;
      line-height: 22px;
    }
  }
}
</style>
