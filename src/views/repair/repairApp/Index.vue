<template>
  <div class="repair-app content-box">
    <div class="table-tool-box">
      <el-button
        v-permission="[platform === PLATFORM.business ? 41 : '*']"
        @click.native="$refs.repairAddForm.toggleDialog()"
        size="small"
        icon="el-icon-plus"
        type="primary"
      >
        新建工单
      </el-button>
      <el-button size="small" plain @click.native="handleExport">
        <c-svg name="xiazai1"></c-svg>
        导出
      </el-button>
      <div class="right">
        <span style="margin-right: 6px;">只看我参与的</span>
        <el-switch
          @change="
            () => {
              pagination.currentPage = 1
              fetchTableData()
            }
          "
          v-model="filterForm.isRelateMe"
        >
        </el-switch>
        <el-badge
          :hidden="
            !filterForm.deviceTypeIds.length &&
              !filterForm.createDateRange &&
              !filterForm.statusIds.length &&
              !filterForm.repairCompanyIds.length &&
              !filterForm.repairUserIds.length &&
              !filterForm.maintenanceCompanyIds.length &&
              !filterForm.maintenanceUserIds.length
          "
          is-dot
          class="item"
          style="margin-left: 25px; "
        >
          <el-button
            @click.native="() => $refs.filterForm.openDialog()"
            type="text"
            style="padding: 0;"
            >筛选<i class="el-icon-arrow-down"></i
          ></el-button>
        </el-badge>
        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="margin-left: 25px;"
          class="filter-input"
          placeholder="搜索报修内容/工单号"
          suffix-icon="el-icon-search"
        />
      </div>
    </div>

    <div class="table-wrap">
      <el-popover
        :visible-arrow="false"
        placement="bottom"
        width="250"
        ref="popover"
        popper-class="repair-table_config-popper"
        trigger="click"
      >
        <TableConfig :list="tableFieldMap" @change="handleTableFieldChange" />
      </el-popover>
      <el-tooltip class="item" effect="dark" content="表头设置" placement="top">
        <el-link v-popover:popover class="config-trigger" :underline="false">
          <c-svg name="config"></c-svg>
        </el-link>
      </el-tooltip>

      <el-table
        v-loading="tableLoading"
        :data="tableData"
        ref="table"
        style="width: 100%;"
        @sort-change="sortChange"
      >
        <template v-for="column in tableFieldMap">
          <el-table-column
            :key="column.uuid"
            v-if="!column.hidden"
            :fixed="column.key === 'FaultContent' ? 'left' : null"
            :min-width="column.width || null"
            :prop="column.key"
            :show-overflow-tooltip="isChromeAndGreater80 ? false : true"
            :sortable="column.sortable"
            :label="column.label"
          >
            <template slot-scope="{ row }">
              <template v-if="column.key === 'FaultContent'">
                <div class="repair-content">
                  <div
                    :style="{ backgroundColor: row.IconBgColor }"
                    class="brand-wrap"
                  >
                    <img
                      v-if="row.FaultPhotos && row.FaultPhotos.length"
                      :src="row.FaultPhotos[0]"
                      alt=""
                    />
                    <c-svg
                      :style="{ color: row.IconColor }"
                      class="brand-icon"
                      v-else
                      :name="row.IconName"
                    ></c-svg>
                  </div>
                  <!-- <div class="line-clamp2">
                    {{ row.Remarks || row.FaultContent }}
                  </div> -->
                  <EllipsisTooltip
                    :row="2"
                    :content="row.Remarks || row.FaultContent"
                  />
                </div>
              </template>

              <template v-else-if="column.key === 'Status'">
                <el-tag
                  size="small"
                  :style="{ ...repairTagFactory(row.Status).style }"
                >
                  {{ repairTagFactory(row.Status).text }}
                </el-tag>
              </template>

              <template v-else-if="column.key === 'RepairUserName'">
                <div class="user-info">
                  <img :src="row.RepairUserImg" alt="" class="user-avatar" />
                  <span style="vertical-align: middle">{{
                    row.RepairUserName
                  }}</span>
                </div>
              </template>

              <template v-else-if="column.key === 'InspectedUserName'">
                <div v-if="row.Status > 6" class="user-info">
                  <img :src="row.ApplicantUserImg" alt="" class="user-avatar" />
                  <span style="vertical-align: middle">{{
                    row.InspectedUserName
                  }}</span>
                </div>
                <span v-else>-</span>
              </template>

              <template v-else-if="column.key === 'ApplicantName'">
                <div class="user-info">
                  <img :src="row.ApplicantUserImg" alt="" class="user-avatar" />
                  <span style="vertical-align: middle">{{
                    row.ApplicantName
                  }}</span>
                </div>
              </template>

              <template v-else-if="column.key === 'CreateTime'">
                {{ _dateFormat(row.CreateTime, 'YYYY-MM-DD HH:mm') }}
              </template>

              <template v-else-if="column.key === 'UpdateTime'">
                <span v-if="row.UpdateTime">
                  {{ _dateFormat(row.UpdateTime, 'YYYY-MM-DD HH:mm') }}
                </span>
                <span v-else>-</span>
              </template>

              <template v-else-if="column.key === 'CompleteTime'">
                <span v-if="row.CompleteTime">
                  {{ _dateFormat(row.CompleteTime, 'YYYY-MM-DD HH:mm') }}
                </span>
                <span v-else>-</span>
              </template>

              <template v-else-if="column.key === 'ReceiptTime'">
                <span v-if="row.ReceiptTime">
                  {{ _dateFormat(row.ReceiptTime, 'YYYY-MM-DD HH:mm') }}
                </span>
                <span v-else>-</span>
              </template>

              <template v-else-if="column.key === 'InspectedTime'">
                <span v-if="row.InspectedTime">
                  {{ _dateFormat(row.InspectedTime, 'YYYY-MM-DD HH:mm') }}
                </span>
                <span v-else>-</span>
              </template>

              <template v-else-if="column.key === 'PdfUrl'">
                <el-link
                  v-if="row.PdfUrl"
                  @click.native="() => handleWatchReport(row.PdfUrl)"
                  :underline="false"
                  type="primary"
                  >查看</el-link
                >
                <span v-else>-</span>
              </template>

              <template v-else-if="column.key === 'Score'">
                <el-rate v-if="row.Score" v-model="row.Score" disabled />
                <span v-else>-</span>
              </template>

              <template
                v-else-if="
                  column.key === 'FaultReason' ||
                    column.key === 'FaultMeasures' ||
                    column.key === 'InspectedRemarks' ||
                    column.key === 'ProjectName' ||
                    column.key === 'MaintenanceUnitName'
                "
              >
                <EllipsisTooltip
                  v-if="row[column.key]"
                  :row="2"
                  :content="row[column.key]"
                />
                <span v-else>-</span>
              </template>

              <template v-else>
                {{ row[column.key] }}
              </template>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>

    <div class="pagination-wrap">
      <el-pagination
        background
        v-show="pagination.total > 0"
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <RepairAddApp ref="repairAddForm" @complete="fetchTableData" />
    <FilterForm ref="filterForm" @change="handleFilterChange" />
    <ExportConfig
      :filter-condition="filterForm"
      :list="tableFieldMap"
      ref="exportConfig"
    />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { getNewRepairActivePage } from '@/api/newRepairActive'
import RepairAddApp from './component/RepairAddApp'
import FilterForm from './component/FilterForm'
import ExportConfig from './component/exportConfig'
import TableConfig from './component/TableConfig'
import { getPreferences } from '@/api/preferences'
import { BASE_URI } from '../../../config'
import { randomString } from '@/utils/index'
import EllipsisTooltip from '@/components/EllipsisTooltip'
export default {
  components: {
    RepairAddApp,
    FilterForm,
    TableConfig,
    ExportConfig,
    EllipsisTooltip
  },
  data() {
    return {
      isChromeAndGreater80: false,
      filterForm: {
        text: '',
        deviceTypeIds: [],
        createDateRange: '',
        statusIds: [],
        repairCompanyIds: [],
        repairUserIds: [],
        maintenanceCompanyIds: [],
        maintenanceUserIds: [],
        sortProp: 'CreateTime',
        isAsc: false,
        isRelateMe: false
      },
      tableFieldMap: [],
      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      PLATFORM
    }
  },
  watch: {
    tableFieldMap(val) {
      val.forEach(v => {
        v.uuid = randomString(10)
      })
    },
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    platform() {
      return this.$store.state.permissions.platform
    },
    projectList() {
      return this.$store.state.app.proList
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  async mounted() {
    this.getBroswer()
    this.tableLoading = true
    await getPreferences({
      type: 'Repair',
      foreignId: this.userId
    })
      .then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          if (data !== null) {
            // let a = b
            this.tableFieldMap = JSON.parse(data.Field)
          } else {
            this.tableFieldMap = defaultTableFieldMap
          }
        } else {
          this.tableFieldMap = defaultTableFieldMap
        }
      })
      .catch(err => {
        this.tableFieldMap = defaultTableFieldMap
        console.error(err)
      })
    this.fetchTableData()
  },
  methods: {
    // 点击导出
    handleExport() {
      this.$refs.exportConfig.openDialog()
    },
    handleWatchReport(url) {
      window.open(
        url.indexOf('https://') > -1 ? url : `${BASE_URI}/${url}`,
        '_blank'
      )
    },
    handleTableFieldChange(val) {
      this.tableFieldMap = JSON.parse(JSON.stringify(val))
      this.fetchTableData()
    },
    handleFilterChange(val) {
      this.filterForm = Object.assign(this.filterForm, val)
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格排序
    sortChange(val) {
      this.filterForm.sortProp = val.prop
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 分页
    handleCurrentChange() {
      this.fetchTableData()
    },
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 获取表格数据
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const {
          text,
          sortProp,
          isAsc,
          isRelateMe,
          deviceTypeIds,
          createDateRange,
          statusIds,
          repairCompanyIds,
          repairUserIds,
          maintenanceCompanyIds,
          maintenanceUserIds
        } = this.filterForm

        const ids = []
        statusIds.forEach(v => {
          ids.push(...v)
        })

        const { currentPage, size } = this.pagination

        const fieldList = this.tableFieldMap
          .filter(v => !v.hidden)
          .map(v => v.key)
        getNewRepairActivePage({
          CompanyId: this.companyId,
          Status: ids,
          StartCreateTime: createDateRange ? createDateRange[0] : undefined,
          EndCreateTime: createDateRange ? createDateRange[1] : undefined,
          ProjectIdList: repairCompanyIds.length
            ? repairCompanyIds
            : this.platform === PLATFORM.business
            ? [this.projectId]
            : this.projectList.map(v => v.id),
          ApplicantIdList: repairUserIds,
          ProjectName: '',
          BigTypeIdList: deviceTypeIds,
          BigTypeId: undefined,
          SmallTypeId: undefined,
          EquipmentId: undefined,
          MaintenanceUnitIdList: maintenanceCompanyIds,
          RepairUserIdList: maintenanceUserIds,
          AcceptanceTime: undefined,
          FaultContent: '',
          ApplicantNameOrPhone: '',
          FaultContentOrOrder: text,
          IsApp: false,
          IsMy: isRelateMe === true ? isRelateMe : undefined,
          SortType: sortProp,
          IsAsc: isAsc,
          FieldList: fieldList,
          pageSize: size,
          pageIndex: currentPage
        })
          .then(res => {
            if (
              currentPage === this.pagination.currentPage &&
              text === this.filterForm.text
            ) {
              let data = res.data
              if (data.Code === 200) {
                this.tableData = data.Data.Data
                this.tableData.forEach(v => {
                  v.ref_FaultContent = randomString(10)
                  if (v.FaultPhoto) {
                    v.FaultPhotos = v.FaultPhoto.split(',').map(vv =>
                      vv.indexOf('https://') > -1 ? vv : BASE_URI + vv
                    )
                  } else {
                    const icon = this.repairIconFactory(v.BigId)
                    v.IconName = icon.name
                    v.IconColor = icon.color
                    v.IconBgColor = icon.backgroundColor
                  }
                })
                this.pagination.total = data.Data.TotalCount
              } else {
                this.tableData = []
                this.pagination.total = 0
                this.$message.error('列表获取失败')
              }
            }
          })
          .catch(err => {
            console.error(err)
            if (currentPage === this.pagination.currentPage) {
              this.tableData = []
              this.pagination.total = 0
              this.$message.error('列表获取失败')
            }
          })
          .finally(() => {
            this.tableLoading = false
            this.$nextTick(() => {
              this.$refs.table.doLayout()
            })
          })
      },
      1000,
      {
        leading: true
      }
    ),
    handleColumnShow(prop) {
      if (!this.tableFieldMap.length) {
        return false
      }
      return !this.tableFieldMap.find(v => v.key === prop).hidden
    },
    repairTagFactory(status) {
      switch (status) {
        case 0:
          return {
            text: '已撤销',
            style: {
              backgroundColor: 'rgba(247,247,247,1)',
              borderColor: 'rgba(191,191,191,1)',
              color: 'rgba(191,191,191,1)'
            }
          }
        case 1:
          return {
            text: '待接单',
            style: {
              backgroundColor: 'rgba(255,241,240,1)',
              borderColor: 'rgba(255, 77, 79, 1)',
              color: 'rgba(255, 77, 79, 1)'
            }
          }
        case 2:
          return {
            text: '已接单',
            style: {
              backgroundColor: 'rgba(230,247,255,1)',
              borderColor: 'rgba(64,169,255,1)',
              color: 'rgba(64,169,255,1)'
            }
          }
        case 3:
        case 5:
          return {
            text: '已签到',
            style: {
              backgroundColor: 'rgba(230,255,251,1)',
              borderColor: 'rgba(54,207,201,1)',
              color: 'rgba(54,207,201,1)'
            }
          }
        case 4:
          return {
            text: '已驳回',
            style: {
              backgroundColor: 'rgba(249,240,255,1)',
              borderColor: 'rgba(146,84,222,1)',
              color: 'rgba(146,84,222,1)'
            }
          }
        case 6:
          return {
            text: '待确认',
            style: {
              backgroundColor: 'rgba(255,247,230,1)',
              borderColor: 'rgba(255,169,64,1)',
              color: 'rgba(255,169,64,1)'
            }
          }
        case 7:
          return {
            text: '已完成',
            style: {
              backgroundColor: 'rgba(246,255,237,1)',
              borderColor: 'rgba(115,209,61,1)',
              color: 'rgba(115,209,61,1)'
            }
          }
        default:
          return { text: '', type: '' }
      }
    },
    repairIconFactory(id) {
      switch (id) {
        case 41:
          return {
            // title: '冷冻冷藏',
            name: 'lengdong-copy',
            color: '#4492D8',
            backgroundColor: '#E6F7FF'
          }
        case 42:
          return {
            // title: '暖通空调',
            name: 's_air_conditionor',
            color: '#4492D8',
            backgroundColor: '#E6F7FF'
          }
        case 43:
          return {
            // title: '照明系统',
            name: 'shineizhaoming-copy',
            color: '#E49C4D',
            backgroundColor: '#FFF7E6'
          }
        case 39:
          return {
            // title: '视频监控',
            name: 'jiankong-copy',
            color: '#57A893',
            backgroundColor: '#F6FFED'
          }
        case 52:
          return {
            // title: '生鲜烘培',
            name: 's_fresh',
            color: '#DD6556',
            backgroundColor: '#FFF1F0'
          }
        case 47:
          return {
            // title: '供配电',
            name: 'gongdian-copy',
            color: '#E49C4D',
            backgroundColor: '#FFF7E6'
          }
        case 53:
          return {
            // title: '电梯监控',
            name: 'futi-copy',
            color: '#4492D8',
            backgroundColor: '#E6F7FF'
          }
        case 46:
          return {
            // title: '防盗报警',
            name: 'fangdaoxitong-copy',
            color: '#DD6556',
            backgroundColor: '#FFF1F0'
          }
        case 48:
          return {
            // title: '音响广播',
            name: 'yinxiangweixiu-copy',
            color: '#4492D8',
            backgroundColor: '#E6F7FF'
          }
        case 191:
          return {
            // title: '冷库监测',
            name: 'lengdong-copy',
            color: '#4492D8',
            backgroundColor: '#E6F7FF'
          }
        case 97:
          return {
            // title: '运单管理',
            name: 'lengcangche-copy',
            color: '#4492D8',
            backgroundColor: '#E6F7FF'
          }
        case 44:
          return {
            // title: '客流统计',
            name: 's_passenger_flow',
            color: '#4492D8',
            backgroundColor: '#E6F7FF'
          }
        default:
          return {
            // title: sys.TypeName,
            name: 'cube1',
            color: '#8C8C8C',
            backgroundColor: '#F5F5F5'
          }
      }
    },
    getBroswer() {
      const ua = navigator.userAgent.toLowerCase()
      let temp = ''
      // eslint-disable-next-line no-cond-assign
      const version = (temp = ua.match(/chrome\/([\d.]+)/)) ? temp[1] : ''
      if (version) {
        const bigVersion = version.split('.')[0] * 1
        if (bigVersion > 80) {
          this.isChromeAndGreater80 = true
        }
      }
    }
  }
}

const defaultTableFieldMap = [
  {
    label: '报修内容',
    icon: 'file-text',
    key: 'FaultContent',
    hidden: false,
    width: 200,
    sortable: false,
    cannotHide: true,
    dragable: false
  },
  {
    label: '工单号',
    icon: 'unorderedlist',
    key: 'RepairOrder',
    hidden: false,
    width: 130,
    sortable: false,
    cannotHide: true,
    dragable: true
  },
  {
    label: '状态',
    icon: 'calendar-check',
    key: 'Status',
    hidden: false,
    width: 80,
    sortable: false,
    cannotHide: true,
    dragable: true
  },
  {
    label: '维保单位',
    icon: 'team1',
    key: 'MaintenanceUnitName',
    hidden: true,
    width: 130,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '维修人',
    icon: 'user1',
    key: 'RepairUserName',
    hidden: false,
    width: 130,
    sortable: false,
    cannotHide: true,
    dragable: true
  },
  {
    label: '关联设备',
    icon: 'appstore',
    key: 'ModelTreeName',
    hidden: false,
    width: 120,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '报修时间',
    icon: 'time-circle',
    key: 'CreateTime',
    hidden: false,
    width: 135,
    sortable: true,
    cannotHide: true,
    dragable: true
  },
  {
    label: '报修人',
    icon: 'time-circle',
    key: 'ApplicantName',
    hidden: false,
    width: 135,
    sortable: false,
    cannotHide: true,
    dragable: true
  },
  {
    label: '报修单位',
    icon: 'team1',
    key: 'ProjectName',
    hidden: false,
    width: 130,
    sortable: false,
    cannotHide: false,
    dragable: true
  },

  {
    label: '更新时间',
    icon: 'time-circle',
    key: 'UpdateTime',
    hidden: true,
    width: 135,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '工单报告链接',
    icon: 'link',
    key: 'PdfUrl',
    hidden: true,
    width: 110,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '完工时间',
    icon: 'time-circle',
    key: 'CompleteTime',
    hidden: true,
    width: 135,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '接单时间',
    icon: 'time-circle',
    key: 'ReceiptTime',
    hidden: true,
    width: 135,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '维修分类',
    icon: 'unorderedlist',
    key: 'RepairType',
    hidden: true,
    width: 130,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '故障原因',
    icon: 'file-text',
    key: 'FaultReason',
    hidden: true,
    width: 140,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '处理措施',
    icon: 'file-text',
    key: 'FaultMeasures',
    hidden: true,
    width: 140,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '人工收费',
    icon: 'moneycollect',
    key: 'Cost',
    hidden: true,
    width: 110,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '配件收费',
    icon: 'moneycollect',
    key: 'SparepartCost',
    hidden: true,
    width: 110,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '验收人',
    icon: 'user1',
    key: 'InspectedUserName',
    hidden: true,
    width: 135,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '验收时间',
    icon: 'time-circle',
    key: 'InspectedTime',
    hidden: true,
    width: 135,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '验收备注',
    icon: 'file-text',
    key: 'InspectedRemarks',
    hidden: true,
    width: 130,
    sortable: false,
    cannotHide: false,
    dragable: true
  },
  {
    label: '工单评价',
    icon: 'like',
    key: 'Score',
    hidden: true,
    width: 140,
    sortable: false,
    cannotHide: false,
    dragable: true
  }
]
</script>

<style lang="scss" scoped>
.repair-app {
  .table-tool-box {
    .right {
      display: flex;
      align-items: center;
      float: right;
    }
  }
  .table-wrap {
    position: relative;
  }
  .config-trigger {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    height: 59px;
    line-height: 59px;
    width: 59px;
    text-align: center;
  }
  .repair-content {
    display: flex;
    align-items: center;
    .brand-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      margin-right: 10px;
      border-radius: 4px;
      overflow: hidden;
    }
    .brand-icon {
      font-size: 22px;
    }
    img {
      height: 100%;
      width: 100%;
    }
  }
  .ellipsis-content {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .fault-content {
    cursor: pointer;
    &:hover {
      color: $color;
    }
  }
  .user-info {
    display: flex;
    align-items: center;
  }
  .user-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    margin-right: 5px;
  }
}
</style>

<style lang="scss">
.repair-table_config-popper {
  padding: 0;
}
</style>
