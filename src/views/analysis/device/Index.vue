<template>
  <div class="device-analysis">
    <div class="pdg" style="padding: 25px;">
      <el-row style="background-color: #fff">
        <el-col :span="16">
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
                  @requestReg="KeyPointRequestReg"
                  @requestChart="KeyPointRequestChart"
                  :keyPointIndex="index"
                  :point-ids="item.point"
                  :device-id="item.deviceId"
                ></LineChart>
              </div>
            </div>
            <!--表格-->
            <div style="margin-top: 36px" v-if="tableData.length">
              <div>
                <el-button
                  icon="el-icon-download"
                  type="primary"
                  size="small"
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
        </el-col>
        <!--        筛选条件-->
        <el-col :span="8">
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
              :model="filterForm"
              size="medium"
              label-position="top"
              class="thin-scroll"
            >
              <el-form-item label="日期">
                <CustomDatePicker
                  :typeArr="['day', 'month', 'year', 'custom']"
                  @timeChange="timeChange"
                  @typeChange="scopeChange"
                  ref="customDatePicker"
                ></CustomDatePicker>
              </el-form-item>
              <el-form-item label="时段">
                <el-radio-group
                  v-model="filterForm.timeIntervalType"
                  @change="scopeChange"
                  size="small"
                  border
                >
                  <el-radio-button label="dateRangeDefault">
                    已设置时段
                  </el-radio-button>
                  <el-radio-button label="dateRangeCustom">
                    自定义时段
                  </el-radio-button>
                </el-radio-group>
                <el-select
                  v-show="filterForm.timeIntervalType === 'default'"
                  v-model="filterForm.timeInterval"
                  placeholder=""
                  style="width:100%;margin-top: 5px"
                  clearable
                  @change="typeChanage"
                >
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.Id"
                    :label="item.Name"
                    :value="item.Id"
                  />
                </el-select>
                <div v-show="filterForm.timeIntervalType === 'custom'">
                  <el-time-select
                    placeholder="起始时间"
                    v-model="filterForm.startTimeInterval"
                    :picker-options="{
                      start: '00:00',
                      step: '0:30',
                      end: '23:30'
                    }"
                  >
                  </el-time-select>
                  <el-time-select
                    placeholder="结束时间"
                    v-model="filterForm.endTimeInterval"
                    :picker-options="{
                      start: '00:00',
                      step: '0:30',
                      end: '23:30'
                    }"
                  >
                  </el-time-select>
                </div>
              </el-form-item>
              <el-form-item label="选择项目范围">
                <treeselect
                  v-model="filterForm.area"
                  :default-expand-level="1"
                  :append-to-body="true"
                  :multiple="true"
                  :options="treeOptions"
                  style="line-height: 20px;"
                  placeholder=""
                  :show-count="true"
                  :normalizer="normalizer"
                  @close="areaChange"
                />
              </el-form-item>
              <el-form-item label="选择设备" style="margin-bottom: 18px;">
                <el-select
                  v-model="chooseDeviceIdList"
                  :disabled="!filterForm.area.length"
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
                        <div class="option-title">{{ item.ModelTreeName }}</div>
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
                  v-model="choosePointIdList"
                  :disabled="!chooseDeviceIdList.length"
                  placeholder="搜索点位名称/类型"
                  style="width:100%;"
                  popper-class="device-selector-JSDKF38924"
                  multiple
                  filterable
                  clearable
                  :filter-method="filterPointListFun"
                  @visible-change="pointVisibleChange"
                >
                  <el-option
                    v-for="item in filterPointList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <div
                      class="option-item"
                      :class="item.choose ? 'choose-option-item' : ''"
                    >
                      <div>
                        <div class="option-title">CLT10.2双面岛柜(无盖）</div>
                        <div class="option-text">
                          QHC-CLT12.1双面岛柜(无盖）P
                        </div>
                        <div class="option-text">QHC-美团优选郑州仓</div>
                      </div>
                      <div v-show="item.choose">
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
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import LineChart from './component/LineChart'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // load on demand
dayjs.locale('zh-cn')
import { getUserOwnSubareaTree } from '@/api/subarea'
import {
  getElectricTypeList,
  getElectricStatisticalDetailList
} from '@/api/maintenanceStatistical'
import { getModelTreePage, queryPointRead } from '@/api/model_new'
import CustomDatePicker from '@/components/CustomDatePicker'

export default {
  components: {
    LineChart,
    Treeselect,
    CustomDatePicker
  },
  data() {
    return {
      dataRange: [],
      treeOptions: [],
      typeOptions: [],
      normalizer(node) {
        return {
          id: node.SubareaId,
          label: node.SubareaName,
          children: node.Children
        }
      },

      filterLoading: false, //筛选
      filterDeviceList: [],
      deviceList: [],
      filterPointList: [],
      pointList: [],
      chooseDeviceIdList: [],
      choosePointIdList: [],
      keyPointList: [], //关键点位列表
      keyPointChartList: [], //关键点位实例列表

      filterForm: {
        scope: 'day', // 日期 默认日
        time: dayjs().subtract(1, 'week'), //选中日期
        start: dayjs().format('YYYY-MM-DD'),
        end: dayjs()
          .add(1, 'day')
          .format('YYYY-MM-DD'),
        timeIntervalType: 'default', //时段类型 默认已设置时段
        timeInterval: '', //已有时段
        startTimeInterval: '', //开始时段
        endTimeInterval: '', //结束时段
        area: [] //项目范围
      },

      form: {
        interval: 2,
        startTime: new Date(new Date().getTime() - 24 * 3600 * 1000),
        endTime: new Date(),
        pointIds: [],
        pointIdsByAdd: [], // 用户自己添加的点位
        dateRange: [
          new Date(new Date().getTime() - 24 * 3600 * 1000),
          new Date()
        ],
        showRelatePoint: false, // 是否显示关联点位
        model: 'chart',
        showStatistical: false, // 显示统计
        showThreshold: false // 显示阈值
      },

      projectNameFilter: '',
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      tableData: [],
      tableLoading: false,

      dayjs
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  watch: {
    dateRange(val) {
      if (val) {
        console.log(val, 'val')
      }
    },
    'filterForm.time'(time) {
      if (time) {
        switch (this.filterForm.scope) {
          case 'day':
            this.filterForm.start = dayjs(time).format('YYYY-MM-DD')
            this.filterForm.end = dayjs(time)
              .add(1, 'day')
              .format('YYYY-MM-DD')
            break
          case 'week':
            this.filterForm.start = dayjs(time)
              .startOf('week')
              .format('YYYY-MM-DD')
            this.filterForm.end = dayjs(time)
              .endOf('week')
              .add(1, 'millisecond')
              .format('YYYY-MM-DD')
            break
          case 'month':
            this.filterForm.start = dayjs(time)
              .startOf('month')
              .format('YYYY-MM-DD')
            this.filterForm.end = dayjs(time)
              .endOf('month')
              .add(1, 'millisecond')
              .format('YYYY-MM-DD')
            break
          default:
            break
        }
      }
    },
    projectNameFilter() {
      this.fetchTableData()
    }
  },
  mounted() {
    this.$refs.customDatePicker.init('day', true)
    // 获取项目树
    getUserOwnSubareaTree({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          let tree = [res.data.Data]
          this.walk(tree)
          this.treeOptions = tree
          this.$nextTick(() => {
            this.filterForm.area = [this.treeOptions[0].SubareaId]
            this.areaChange()
          })
        }
      })
      .catch(err => {
        console.error(err)
      })

    getElectricTypeList({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          res.data.Data.unshift({
            Id: '',
            Name: '全部分类'
          })
          this.typeOptions = res.data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
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
        echarts.connect('keyPoint')
      }
    },
    KeyPointRequestReg() {},
    filterDeviceListFun(v) {
      if (v) {
        this.filterDeviceList = this.deviceList.filter(
          item =>
            item.ModelTreeName &&
            item.ModelTreeName.indexOf &&
            item.ModelTreeName.indexOf(v) >= 0
        )
      } else {
        this.filterDeviceList = this.deviceList
      }
    },
    filterPointListFun(v) {
      if (v) {
        this.filterPointList = this.pointList.filter(
          item => item.name && item.name.indexOf && item.name.indexOf(v) >= 0
        )
      } else {
        this.filterPointList = this.pointList
      }
    },
    // 清除筛选
    resetForm() {
      this.filterForm.scope = 'day'
      this.filterForm.area = [this.treeOptions[0].SubareaId]
      this.filterForm.timeInterval = ''
      this.filterForm.time = dayjs().subtract(1, 'day')
      this.filterForm.start = dayjs()
        .subtract(1, 'day')
        .format('YYYY-MM-DD')
      this.filterForm.end = dayjs().format('YYYY-MM-DD')
    },
    scopeChange(val) {
      console.log(val, 'scopeChange')
      if (val === 'day') {
        this.filterForm.time = dayjs().subtract(1, 'day')
        this.filterForm.start = dayjs()
          .subtract(1, 'day')
          .format('YYYY-MM-DD')
        this.filterForm.end = dayjs().format('YYYY-MM-DD')
      } else if (val === 'week') {
        this.filterForm.time = dayjs().subtract(1, 'week')
        this.filterForm.start = dayjs()
          .subtract(1, 'week')
          .startOf('week')
          .format('YYYY-MM-DD')
        this.filterForm.end = dayjs()
          .subtract(1, 'week')
          .startOf('week')
          .add(7, 'day')
          .format('YYYY-MM-DD')
      } else if (val === 'month') {
        this.filterForm.time = dayjs().subtract(1, 'month')
        this.filterForm.start = dayjs()
          .subtract(1, 'month')
          .startOf('month')
          .format('YYYY-MM-DD')
        this.filterForm.end = dayjs()
          .startOf('month')
          .format('YYYY-MM-DD')
      } else if (val === 'year') {
        this.filterForm.time = dayjs().subtract(1, 'year')
        this.filterForm.start = dayjs()
          .subtract(1, 'month')
          .startOf('month')
          .format('YYYY-MM-DD')
        this.filterForm.end = dayjs()
          .startOf('month')
          .format('YYYY-MM-DD')
      } else if (val === 'timeCustom') {
      } else if (val === 'dateRangeDefault') {
      } else if (val === 'dateRangeCustom') {
      }
      this.renderChart()
    },
    resertReviewList() {
      this.tableData = []
      this.keyPointList = []
      this.keyPointChartList = []
    },
    // 更换项目
    areaChange() {
      if (this.filterForm.area.length) {
        getModelTreePage({
          SubareaIdList: this.filterForm.area,
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
            this.choosePointIdList = []
            this.pointList = []
            this.filterPointList = []
            this.resertReviewList()
          })
      }
    },
    // 更换设备
    deviceChanage() {
      queryPointRead({
        mtidList: this.chooseDeviceIdList,
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
            this.choosePointIdList = []
            this.pointList = []
            this.filterPointList = []
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取点位列表失败')
          this.choosePointIdList = []
          this.pointList = []
          this.filterPointList = []
        })
        .finally(() => {
          this.resertReviewList()
          this.pointVisibleChange(false)
        })
    },
    // 更换点位
    pointVisibleChange(v) {
      if (!v && this.choosePointIdList) {
        for (let i = 0; i < this.keyPointList.length; i++) {
          this.$refs[`keyPointHistoryDialog${i}`][0].toggleDialog(this.form)
        }
        this.fetchTableData()
      } else {
        this.resertReviewList()
      }
    },
    timeChange(val) {
      console.log(val, 'timeChange')
      // this.renderChart()
    },
    typeChanage() {
      this.renderChart()
    },
    renderChart() {
      if (this.choosePointIdList) {
        this.fetchTableData()
        for (let i = 0; i < this.keyPointList.length; i++) {
          this.$refs[`keyPointHistoryDialog${i}`][0].updateDialog(this.form)
        }
      }
    },
    downloadExcel() {
      let query = ''
      this.filterForm.area.forEach(item => {
        query += `&subareaId=${item}`
      })
      window.location = `${BASE_URI}/api/MaintenanceStatistical/ExportElectricStatisticalDetailList?startDate=${this.filterForm.start}&endDate=${this.filterForm.end}&industry=${this.$store.state.app.company.industry}&companyId=${this.companyId}&projectName=${this.projectNameFilter}&userId=${this.$store.state.app.userInfo.uid}&pageIndex=-1${query}`
    },
    fetchTableData() {
      this.tableLoading = true
      getElectricStatisticalDetailList({
        startDate: this.filterForm.start,
        endDate: this.filterForm.end,
        subareaId: this.filterForm.area,
        industry: this.$store.state.app.company.industry,
        pageIndex: this.pagination.currentPage,
        pageSize: this.pagination.size,
        projectName: this.projectNameFilter,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tableData = res.data.Data.Data
            this.pagination.total = res.data.Data.TotalCount
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
