<template>
  <div class="table-wrap content-box">
    <div class="table-tool-box">
      <el-button
        :loading="exportLoading"
        size="small"
        type="primary"
        @click="handleExport"
      >
        导出
      </el-button>
      <el-date-picker
        v-model="filterForm.dateRange"
        type="daterange"
        range-separator="至"
        size="small"
        style="margin-left: 15px; width: 250px;"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      >
      </el-date-picker>
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
      @filter-change="filterChange"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column label="报修日期" prop="CreateTime" sortable="custom">
        <template slot-scope="{ row }">
          {{ _dateFormat(row.CreateTime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>

      <el-table-column
        v-if="platform !== PLATFORM.business"
        label="所属项目"
        prop="ProjectName"
      />

      <el-table-column label="设备分类" prop="AssetsTypeName" />
      <el-table-column label="设备名称" prop="ModelTreeName" />
      <el-table-column label="故障描述" prop="FaultDescribe" />
      <el-table-column
        column-key="IsUseSparePart"
        prop="IsUseSparePart"
        :filter-multiple="false"
        :filters="[{ text: '是', value: true }, { text: '否', value: false }]"
        label="是否更换零配件"
      >
        <template slot-scope="{ row }">
          {{ row.IsUseSparePart ? '是' : '否' }}
        </template>
      </el-table-column>

      <el-table-column label="解决方案（使用区域）" prop="RepairSparePart" />
      <el-table-column
        column-key="IsRepair"
        prop="IsRepair"
        :filter-multiple="false"
        :filters="[{ text: '已修复', value: 2 }, { text: '未修复', value: 1 }]"
        label="故障是否解决"
      >
        <template slot-scope="{ row }">
          {{ row.IsRepair === 2 ? '已修复' : '未修复' }}
        </template>
      </el-table-column>
      <el-table-column label="维修费" prop="Cost" />
      <el-table-column
        column-key="RepairUserName"
        prop="RepairUserName"
        :filters="repairUserOptions"
        label="维修人员"
      />
      <el-table-column
        column-key="ApplicantName"
        prop="ApplicantName"
        :filters="applicantOptions"
        label="支持部负责人"
      />
    </el-table>

    <pagination
      v-show="pagination.total > 0"
      :total="pagination.total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      @pagination="fetchTableData"
    />
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import {
  getRepairLogPage,
  exportRepairLogPage,
  getRepairLogPageParameter
} from '@/api/repairActive'
import { saveAs } from 'file-saver'
export default {
  components: { Pagination },
  data() {
    return {
      tableData: null,
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      filterForm: {
        dateRange: '',
        isUseSparePart: undefined,
        isRepair: undefined,
        repairUserList: [],
        applicantList: [],
        sortProp: undefined,
        isAsc: undefined
      },
      repairUserOptions: [],
      applicantOptions: [],
      exportLoading: false,
      PLATFORM
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.page = 1
      this.fetchTableData()
    },
    'filterForm.dateRange'() {
      this.onDateRangeChange()
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
    }
  },
  created() {
    this.fetchTableData()
    this.fetchParameter()
  },
  methods: {
    onDateRangeChange() {
      this.pagination.page = 1
      this.fetchTableData()
    },
    /**
     * 表格排序
     */
    sortChange(val) {
      const { prop, order } = val
      this.filterForm.sortProp = prop
      this.filterForm.isAsc = order === 'ascending'
      this.fetchTableData()
    },
    /**
     * 表格筛选
     */
    filterChange(filter) {
      if (filter.IsRepair) {
        this.filterForm.isRepair = filter.IsRepair[0]
      } else if (filter.IsUseSparePart) {
        this.filterForm.isUseSparePart = filter.IsUseSparePart[0]
      } else if (filter.ApplicantName) {
        this.filterForm.applicantList = filter.ApplicantName
      } else if (filter.RepairUserName) {
        this.filterForm.repairUserList = filter.RepairUserName
      }
      this.pagination.page = 1
      this.fetchTableData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleExport() {
      this.exportLoading = true
      const {
        dateRange,
        repairUserList,
        isRepair,
        isUseSparePart,
        applicantList
      } = this.filterForm

      let companyId = undefined
      let projectIds = []
      if (this.platform === PLATFORM.business) {
        projectIds = [this.projectId]
      } else if (!projectIds.length) {
        companyId = this.companyId
      }
      exportRepairLogPage({
        CompanyId: companyId,
        ProjectIdList: projectIds,
        TimeQuantum: dateRange
          ? {
              StartDate: this._dateFormat(dateRange[0], 'YYYY-MM-DD HH:mm'),
              EndDate: this._dateFormat(dateRange[1], 'YYYY-MM-DD HH:mm')
            }
          : undefined,
        IsUseSparePart: isUseSparePart,
        IsRepair: isRepair,
        RepairUserList: repairUserList,
        ApplicantList: applicantList
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
          saveAs(blob, '维修记录列表.xls')
        })
        .catch(err => {
          console.error(err)
          this.$message.error('导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const {
          sortProp,
          isAsc,
          dateRange,
          repairUserList,
          isRepair,
          isUseSparePart,
          applicantList
        } = this.filterForm
        const { page, limit } = this.pagination

        let companyId = undefined
        let projectIds = []
        if (this.platform === PLATFORM.business) {
          projectIds = [this.projectId]
        } else if (!projectIds.length) {
          companyId = this.companyId
        }

        getRepairLogPage({
          CompanyId: companyId,
          ProjectIdList: projectIds,
          TimeQuantum: dateRange
            ? {
                StartDate: this._dateFormat(dateRange[0], 'YYYY-MM-DD HH:mm'),
                EndDate: this._dateFormat(dateRange[1], 'YYYY-MM-DD HH:mm')
              }
            : undefined,
          IsUseSparePart: isUseSparePart,
          IsRepair: isRepair,
          RepairUserList: repairUserList,
          ApplicantList: applicantList,
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: page,
          PageSize: limit
        })
          .then(res => {
            if (page === this.pagination.page) {
              if (res.data.Code === 200) {
                this.tableData = res.data.Data.Data
                this.pagination.total = res.data.Data.TotalCount
              } else {
                this.tableData = []
                this.pagination.total = 0
                this.$message.error('列表获取失败')
              }
            }
          })
          .catch(err => {
            console.error(err)
            if (page === this.pagination.page) {
              this.tableData = []
              this.pagination.total = 0
              this.$message.error('列表获取失败')
            }
          })
          .finally(() => {
            this.tableLoading = false
          })
      },
      1000,
      {
        leading: true
      }
    ),
    fetchParameter() {
      let companyId = undefined
      let projectIds = []
      if (this.platform === PLATFORM.business) {
        projectIds = [this.projectId]
      } else if (!projectIds.length) {
        companyId = this.companyId
      }
      getRepairLogPageParameter({
        CompanyId: companyId,
        ProjectIdList: [this.projectId]
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.applicantOptions = data.ApplicantDropdown.map(v => {
              return {
                text: v.Value,
                value: v.Key
              }
            })
            this.repairUserOptions = data.RepairDropdown.map(v => {
              return {
                text: v.Value,
                value: v.Key
              }
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
