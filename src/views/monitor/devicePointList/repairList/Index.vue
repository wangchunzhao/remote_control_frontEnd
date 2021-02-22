<template>
  <div class="page-box">
    <el-table
      ref="table"
      v-loading="Loading"
      :data="List"
      class="asset-table"
      style="width: 100%"
      show-overflow-tooltip
    >
      <el-table-column label="维修单号" min-width="170" prop="RepairOrder" />
      <el-table-column label="状态" min-width="100">
        <template slot-scope="scope">
          <el-tag
            size="small"
            :style="{ ...repairTagFactory(scope.row.Status).style }"
          >
            {{ repairTagFactory(scope.row.Status).text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="FaultContent" min-width="200" label="报修内容" />
      <el-table-column prop="ApplicantName" label="报修人" min-width="100" />
      <el-table-column prop="CreateTime" label="报修时间" min-width="180" />
      <el-table-column prop="RepairUserName" label="受理人" min-width="100" />
      <el-table-column fixed="right" label="操作" min-width="200">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            @click.native="$emit('showRepairDetailDialog', row.RepairOrder)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
    <FilterFormDialog @change="filterFormChange" ref="filterFormDialog" />
  </div>
</template>

<script>
import { getNewRepairActivePage } from '@/api/newRepairActive'
import FilterFormDialog from './FilterForm'

export default {
  name: 'AlarmList',
  components: { FilterFormDialog },
  data() {
    return {
      id: '',
      Loading: false,
      filterForm: {
        text: '',
        deviceTypeIds: [],
        timeRange: [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()],
        startTime: this._dateFormat(
          new Date(Date.now() - 7 * 24 * 3600 * 1000),
          'YYYY-MM-DD HH:mm'
        ),
        endTime: this._dateFormat(new Date(), 'YYYY-MM-DD HH:mm'),
        statusIds: [],
        repairCompanyIds: [],
        repairUserIds: [],
        maintenanceCompanyIds: [],
        maintenanceUserIds: [],
        sortProp: 'CreateTime',
        isAsc: false,
        isRelateMe: false
      },
      List: [],
      pagination: {
        currentPage: 1,
        total: 0,
        pageSize: 10
      }
    }
  },
  watch: {
    'filterForm.timeRange'(range) {
      if (range) {
        this.filterForm.startTime = this._dateFormat(
          range[0],
          'YYYY-MM-DD HH:mm'
        )
        this.filterForm.endTime = this._dateFormat(range[1], 'YYYY-MM-DD HH:mm')
        this.pagination.currentPage = 1
        this.fetchTableData()
      }
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
  mounted() {
    this.fetchTableData()
  },
  methods: {
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
    updateTimeRange(range) {
      this.filterForm.timeRange = range
    },
    filterFormChange(form) {
      Object.assign(this.filterForm, form)
      this.pagination.currentPage = 1
      this.fetchTableData()
      this.$emit('showFilterNotice', this.showFilterNotice())
    },
    // 页面跳转
    handleCurrentChange() {
      this.fetchTableData()
    },
    // 修改每页显示的数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    fetchTableData() {
      this.Loading = true
      const {
        text,
        sortProp,
        isAsc,
        isRelateMe,
        // deviceTypeIds,
        startTime,
        endTime,
        statusIds,
        // repairCompanyIds,
        repairUserIds,
        maintenanceCompanyIds,
        maintenanceUserIds
      } = this.filterForm
      const ids = []
      statusIds.forEach(v => {
        ids.push(...v)
      })
      const { currentPage, pageSize } = this.pagination
      getNewRepairActivePage({
        CompanyId: this.companyId,
        Status: ids,
        StartCreateTime: startTime ? startTime : undefined,
        EndCreateTime: endTime ? endTime : undefined,
        ProjectIdList: this.projectId ? [this.projectId] : [],
        ApplicantIdList: repairUserIds,
        ProjectName: '',
        // BigTypeIdList: deviceTypeIds,
        EquipmentId: this.$route.query.mtid - 0,
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
        pageSize: pageSize,
        pageIndex: currentPage
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.List = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.$message.error('维修列表加载失败')
          }
        })
        .catch(err => {
          this.$message.error('维修列表加载失败')
          console.error(err)
        })
        .finally(() => {
          this.Loading = false
        })
    },
    showFilterNotice() {
      const {
        deviceTypeIds,
        statusIds,
        repairCompanyIds,
        repairUserIds,
        maintenanceCompanyIds,
        maintenanceUserIds
      } = this.filterForm
      return !(
        deviceTypeIds.length ||
        statusIds.length ||
        repairCompanyIds.length ||
        repairUserIds.length ||
        maintenanceCompanyIds.length ||
        maintenanceUserIds.length
      )
    }
  }
}
</script>

<style scoped>
.page-box {
  max-width: 1710px;
  background: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
