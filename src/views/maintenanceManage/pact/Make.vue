<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button @click.native="handleClickAdd" size="small" type="primary">
        新增合同
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索合同名称"
        suffix-icon="el-icon-search"
      />
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column prop="contractName" sortable="custom" label="合同名称" />
      <el-table-column
        prop="contractNumber"
        sortable="custom"
        label="合同编号"
      />
      <el-table-column
        column-key="maintainTypeName"
        prop="maintainTypeName"
        :filters="deviceTypeOptions"
        label="设备类型"
      />
      <el-table-column
        column-key="contractStatus"
        prop="contractStatus"
        :filters="[
          { text: '待签约', value: 0 },
          { text: '执行中', value: 1 },
          { text: '已到期', value: 2 }
        ]"
        label="合同状态"
      >
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :type="
              row.contractStatus === 0
                ? 'warning'
                : row.contractStatus === 1
                ? 'success'
                : row.contractStatus === 2
                ? 'info'
                : ''
            "
          >
            {{
              row.contractStatus === 0
                ? '待签约'
                : row.contractStatus === 1
                ? '执行中'
                : row.contractStatus === 2
                ? '已到期'
                : ''
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        column-key="partyB"
        prop="partyBName"
        :filters="companyOptions"
        label="维保单位"
      />
      <el-table-column prop="startDate" sortable="custom" label="开始日期" />
      <el-table-column prop="endDate" sortable="custom" label="结束日期" />

      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button
            v-if="row.contractStatus === 0"
            type="text"
            @click.native="handleEdit(row)"
          >
            修改
          </el-button>
          <el-button v-else type="text" @click.native="watch(row)">
            查看
          </el-button>
          <el-button
            type="text"
            v-if="row.contractStatus === 0"
            class="btn-danger"
            @click.native="handleDelete(row)"
          >
            删除
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
    <PactForm ref="pactForm" type="add" @refresh="fetchTableData" />
    <PactDetail ref="pactDetail" />
  </div>
</template>

<script>
import PactForm from './PactForm'
import PactDetail from './PactDetail'
import { getModelList } from '@/api/maintenanceUnit'

import {
  maintainContractList,
  deleteMaintainContract,
  getPartyBCompany
} from '@/api/maintainContract'

export default {
  components: {
    PactForm,
    PactDetail
  },
  data() {
    return {
      deviceTypeOptions: [],
      companyOptions: [],

      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        deviceTypes: undefined,
        status: undefined,
        unitIds: undefined
      },

      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  mounted() {
    this.fetchTableData()

    getPartyBCompany({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          res.data.Data.forEach(item => {
            item.value = item.Key
            item.text = item.Value
          })
          this.companyOptions = res.data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
    getModelList({
      Industry: 0
    })
      .then(res => {
        const data = res.data
        if (data.Code === 200) {
          data.Data.forEach(item => {
            item.value = item.id
            item.text = item.mname
          })
          this.deviceTypeOptions = data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
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
  methods: {
    // 点击新增按钮
    handleClickAdd() {
      this.$refs.pactForm.openDialog()
    },
    // 查看合同
    watch(row) {
      this.$refs.pactDetail.openDialog(row.contractID)
    },
    handleEdit(row) {
      this.$refs.pactForm.openDialog(row.contractID)
    },
    // 删除合同
    handleDelete(row) {
      this.$confirm('确认要删除该合同？', '提示', { type: 'warning' })
        .then(() => {
          deleteMaintainContract({
            contractIDList: [row.contractID]
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('删除成功')
                this.fetchTableData()
              } else {
                this.$message.error('删除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'contractName') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'contractNumber') {
        this.filterForm.sortProp = 2
      } else if (val.prop === 'startDate') {
        this.filterForm.sortProp = 3
      } else if (val.prop === 'endDate') {
        this.filterForm.sortProp = 4
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.contractStatus) {
        this.filterForm.status = filter.contractStatus
      } else if (filter.maintainTypeName) {
        this.filterForm.deviceTypes = filter.maintainTypeName
      } else if (filter.partyB) {
        this.filterForm.unitIds = filter.partyB
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
      const { text, sortProp, isAsc, status, unitIds } = this.filterForm
      const { currentPage, size } = this.pagination
      maintainContractList({
        QueryType: 0,
        PartyA: [this.companyId],
        PartyB: unitIds,
        ContractNumber: undefined,
        Status: status,
        ContractName: text,
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
