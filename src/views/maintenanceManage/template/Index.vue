<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button size="small" @click.native="handleClickAdd" type="primary">
        创建模板
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索模板名称"
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
      <el-table-column
        prop="MaintenanceTemplateName"
        sortable="custom"
        label="模板名称"
      />
      <el-table-column
        column-key="BigTypeName"
        prop="BigTypeName"
        :filters="deviceTypes"
        label="类型"
      />
      <el-table-column
        prop="MaintenanceTemplateItemCount"
        sortable="custom"
        label="维保项数量"
      />
      <el-table-column
        column-key="MaintenanceCycle"
        prop="MaintenanceCycle"
        :filters="[
          { text: '周', value: 0 },
          { text: '半月', value: 2 },
          { text: '月', value: 4 },
          { text: '季度', value: 6 },
          { text: '半年', value: 7 },
          { text: '年', value: 8 }
        ]"
        label="周期"
      >
        <template slot-scope="{ row }">
          {{
            row.MaintenanceCycle === 0
              ? '周'
              : row.MaintenanceCycle === 2
              ? '半月'
              : row.MaintenanceCycle === 4
              ? '月'
              : row.MaintenanceCycle === 6
              ? '季度'
              : row.MaintenanceCycle === 7
              ? '半年'
              : row.MaintenanceCycle === 8
              ? '年'
              : ''
          }}
        </template>
      </el-table-column>
      <el-table-column prop="MaintenanceType" label="保养类型">
        <template slot-scope="{ row }">
          {{ row.MaintenanceType === 0 ? '现场保养' : '远程保养' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="UpdateTime"
        sortable="custom"
        label="最后修订时间"
      />
      <el-table-column prop="OperateUName" label="修订人" />

      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="watch(row)">
            查看
          </el-button>
          <!-- <el-button type="text" class="btn-danger">
            删除
          </el-button> -->
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
    <TemplateAddForm ref="templateAddForm" />
  </div>
</template>

<script>
import TemplateAddForm from './TemplateAddForm'
import { getModelList } from '@/api/maintenanceUnit'

import { getMaintenanceTemplatePage } from '@/api/maintenanceTemplate'
export default {
  components: {
    TemplateAddForm
  },
  data() {
    return {
      deviceTypes: [],
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        deviceTypes: undefined,
        cycle: undefined
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
    getModelList({
      Industry: 0
    })
      .then(res => {
        const data = res.data
        if (data.Code === 200) {
          data.Data.forEach(item => {
            item.text = item.mname
            item.value = item.id
          })
          this.deviceTypes = data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    handleClickAdd() {
      this.$refs.templateAddForm.openDialog()
    },
    watch(row) {
      this.$router.push({
        name: 'maintenanceTemplateDetail',
        query: { data: JSON.stringify(row) }
      })
    },
    // 表格排序
    sortChange(val) {
      // UpdateTime, MaintenanceTemplateName, MaintenanceTemplateItemCount
      if (val.prop === 'UpdateTime') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'MaintenanceTemplateName') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'MaintenanceTemplateItemCount') {
        this.filterForm.sortProp = 2
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.BigTypeName) {
        this.filterForm.deviceType = filter.BigTypeName
      } else if (filter.MaintenanceCycle) {
        this.filterForm.cycle = filter.MaintenanceCycle
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
      const { currentPage, size } = this.pagination
      const { isAsc, sortProp, text, cycle, deviceType } = this.filterForm
      getMaintenanceTemplatePage({
        CompanyId: this.companyId,
        MaintenanceTemplateName: text,
        BigTypeIdList: deviceType,
        MaintenanceCycleList: cycle,
        SortType: sortProp,
        IsAsc: isAsc,
        PageIndex: currentPage,
        PageSize: size
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
