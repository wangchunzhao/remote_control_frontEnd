<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button @click.native="handleBatchEdit" size="small" type="primary">
        批量修改
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索工单名称"
        suffix-icon="el-icon-search"
      />
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
      @filter-change="filterChange"
    >
      <el-table-column type="selection" label="#" width="50px" />
      <el-table-column
        prop="MaintenanceOrderNo"
        sortable="custom"
        label="保养单号"
      />
      <el-table-column prop="MaintenanceName" label="保养单名称" />
      <el-table-column
        prop="MaintenanceTime"
        sortable="custom"
        label="保养日期"
      />
      <el-table-column
        column-key="ProjectName"
        prop="ProjectName"
        :filters="projectOptions"
        label="项目"
      />
      <el-table-column
        column-key="contractName"
        :filters="pactOptions"
        prop="contractName"
        label="保养合同"
      >
        <template slot-scope="{ row }">
          <el-button
            type="text"
            @click.native="$refs.pactDetail.openDialog(row.ContractID)"
          >
            {{ row.ContractName }}
          </el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="MaintenanceContent" label="保养内容" /> -->
      <el-table-column
        prop="AcceptanceUserName"
        sortable="custom"
        label="负责人"
      />
      <el-table-column
        column-key="Status"
        prop="Status"
        :filters="[{ text: '未保养', value: 0 }, { text: '已保养', value: 2 }]"
        label="状态"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.Status === 0 ? '' : 'info'" size="small">
            {{ row.Status === 0 ? '未保养' : '已保养' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button
            v-if="row.MaintenanceFileUrl"
            type="text"
            @click.native="watch(row)"
          >
            查看报告
          </el-button>
          <el-button
            v-if="row.Status === 0 && companyId === row.PartyBId"
            type="text"
            @click.native="
              () => $refs.editForm.openDialog([row.MaintenanceOrderID])
            "
          >
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
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
    <EditForm ref="editForm" @refresh="fetchTableData" />
    <PactDetail ref="pactDetail" />
  </div>
</template>

<script>
import {
  getMaintenanceOrderPage,
  getMaintenanceOrderProjectDropdownList,
  getMaintenanceContractDropdownList
} from '@/api/maintenanceOrder'
import EditForm from './component/MaintenanceOrderEditForm'
import PactDetail from './component/PactDetail'

export default {
  components: {
    EditForm,
    PactDetail
  },
  data() {
    return {
      projectOptions: [],
      pactOptions: [],
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        projectIdList: undefined,
        statusList: undefined,
        pacts: undefined
      },

      multipleSelection: [],
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
    // projectOptions() {
    //   const list = this.$store.state.app.proList
    //   list.forEach(item => {
    //     item.text = item.label
    //     item.value = item.id
    //   })
    //   return list
    // },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.fetchTableData()
    getMaintenanceContractDropdownList({
      CompanyId: this.companyId,
      ContractName: undefined,
      MaintenanceName: undefined,
      ProjectIdList: undefined,
      MaintenanceStatusList: undefined,
      SortType: undefined,
      IsAsc: undefined,
      PageSize: undefined,
      PageIndex: undefined
    })
      .then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          data.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
          this.pactOptions = data
        }
      })
      .catch(err => {
        console.error(err)
      })
    getMaintenanceOrderProjectDropdownList({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          data.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
          this.projectOptions = data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    // 查看报告
    watch(row) {
      window.open(row.MaintenanceFileUrl, '_blank')
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 点击批量修改
    handleBatchEdit() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项保养工单')
        return false
      }
      const ids = this.multipleSelection.map(v => v.PartyBId)
      if ([...new Set(ids)].length > 1) {
        this.$message('请选择同一维保团队负责的保养工单')
        return false
      }
      this.$refs.editForm.openDialog({
        idList: this.multipleSelection.map(item => item.MaintenanceOrderID),
        teamId: ids[0]
      })
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'MaintenanceTime') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'MaintenanceOrderNo') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'AcceptanceUserName') {
        this.filterForm.sortProp = 2
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.ProjectName) {
        this.filterForm.projectIdList = filter.ProjectName
      } else if (filter.Status) {
        this.filterForm.statusList = filter.Status
      } else if (filter.contractName) {
        this.filterForm.pacts = filter.contractName
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
    fetchTableData() {
      this.tableLoading = true
      const {
        text,
        sortProp,
        isAsc,
        projectIdList,
        statusList,
        pacts
      } = this.filterForm
      const { currentPage, size } = this.pagination
      getMaintenanceOrderPage({
        CompanyId: this.companyId,
        ContractName: undefined,
        MaintenanceName: text,
        ProjectIdList: projectIdList,
        ContractIdList: pacts,
        MaintenanceStatusList: statusList,
        SortType: sortProp,
        IsAsc: isAsc,
        PageSize: size,
        PageIndex: currentPage
      })
        .then(res => {
          let data = res.data
          if (data.Code === 200) {
            this.tableData = data.Data.Data
            this.pagination.total = data.Data.TotalCount
          } else {
            this.tableData = []
            this.pagination.total = 0
            this.$message.error('列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.tableData = []
          this.pagination.total = 0
          this.$message.error('列表获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
