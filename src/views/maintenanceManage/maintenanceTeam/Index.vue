<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        @click.native="handleClickAdd"
        icon="el-icon-plus"
        size="small"
        type="primary"
      >
        新增
      </el-button>
      <div class="right-wrap">
        <el-badge
          :hidden="hideFilterNotice()"
          is-dot
          style="margin-right: 20px;"
        >
          <el-button
            @click.native="() => $refs.filterFormDialog.openDialog()"
            type="text"
            style="padding: 0;"
            >筛选<i class="el-icon-arrow-down"></i
          ></el-button>
        </el-badge>
        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="width: 200px;float: right;"
          class="filter-input"
          placeholder="搜索维保团队名称"
          suffix-icon="el-icon-search"
        />
      </div>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column prop="MaintenanceName" label="团队名称">
        <template slot-scope="{ row }">
          <el-link
            @click.native="() => $refs.teamEditDialog.openDialog(row)"
            type="primary"
            :underline="false"
            >{{ row.MaintenanceName }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column prop="MaintenanceUserCount" label="成员数量" />
      <el-table-column column-key="name" prop="name" label="维保片区">
        <template slot-scope="{ row }">
          {{ row.SubareaList.map(v => v.Value).join('，') }}
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        column-key="name"
        prop="name"
        label="维保类型"
      >
        <template slot-scope="{ row }">
          {{ row.SubsystemList.map(v => v.Value).join('，') }}
        </template>
      </el-table-column>
      <el-table-column prop="Status" width="90" label="状态">
        <template slot-scope="{ row }">
          <el-tag :type="row.Status === 0 ? 'success' : 'info'" size="small">{{
            row.Status === 0 ? '正常' : '停用'
          }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
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
    <FilterFormDialog
      :maintenanceTypeOptions="maintenanceTypeOptions"
      @change="handleFilterFormChange"
      ref="filterFormDialog"
    />
    <TeamAddDialog
      :maintenanceTypeOptions="maintenanceTypeOptions"
      ref="teamAddDialog"
      @refresh="handleTeamEditComplete"
    />
    <TeamEditDialog
      :maintenanceTypeOptions="maintenanceTypeOptions"
      @refresh="handleTeamEditComplete"
      ref="teamEditDialog"
    />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import FilterFormDialog from './FilterFormDialog'
import TeamAddDialog from './TeamAddDialog'
import TeamEditDialog from './TeamEditDialog'
import { getMaintenancePage } from '@/api/maintenance'
import { getModelList } from '@/api/maintenanceUnit'
export default {
  components: {
    FilterFormDialog,
    TeamAddDialog,
    TeamEditDialog
  },
  data() {
    return {
      filterForm: {
        typeIds: [],
        areaIds: [],
        statusIds: [],
        userIds: [],
        text: '',
        sortProp: undefined,
        isAsc: undefined
      },
      maintenanceTypeOptions: [],

      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.fetchTableData()
    this.fetchMaintenanceTypeOptions()
  },
  methods: {
    handleClickAdd() {
      this.$refs.teamAddDialog.openDialog()
    },
    hideFilterNotice() {
      const { typeIds, areaIds, statusIds, userIds } = this.filterForm
      return (
        !typeIds.length &&
        !areaIds.length &&
        !statusIds.length &&
        !userIds.length
      )
    },

    handleFilterFormChange(form) {
      Object.assign(this.filterForm, form)
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleTeamEditComplete() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'CREATE_TIME') {
        this.filterForm.sortProp = 0
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.PROTOCOL) {
        this.filterForm.protocol = filter.PROTOCOL
      }
      this.pagination.currentPage = 1
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
        const { text, userIds, typeIds, statusIds, areaIds } = this.filterForm
        const { currentPage, size } = this.pagination
        getMaintenancePage({
          CompanyId: this.companyId,
          MaintenanceName: text,
          UserIdList: userIds,
          SubareaIdList: areaIds,
          SubsystemIdList: typeIds,
          StatusList: statusIds,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            if (
              currentPage === this.pagination.currentPage &&
              text === this.filterForm.text
            ) {
              let data = res.data
              if (data.Code === 200 && data.Data) {
                this.tableData = data.Data.Data
                this.pagination.total = data.Data.TotalCount
              } else {
                this.tableData = []
                this.pagination.total = 0
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
          })
      },
      1000,
      {
        leading: true
      }
    ),
    fetchMaintenanceTypeOptions() {
      getModelList({
        Industry: 0 // 传 0 是获取所有的类型
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.maintenanceTypeOptions = data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
