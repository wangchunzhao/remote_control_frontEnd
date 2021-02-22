<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button size="small" plain @click="handleCreate">
        Add
      </el-button>
      <el-button
        :loading="downloadLoading"
        size="small"
        plain
        @click="handleDownload"
      >
        Export
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索"
        suffix-icon="el-icon-search"
      />
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
      <el-table-column type="selection" width="55" />
      <el-table-column label="Name" prop="Name" />
      <el-table-column label="ID" prop="id" sortable="custom">
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        column-key="name"
        prop="name"
        :filters="[{ text: 'Text1', value: 'Value1' }]"
        sortable="custom"
        label="Name"
      />
      <el-table-column label="Actions" width="230">
        <template slot-scope="{ row }">
          <el-link :underline="false" type="primary" size="mini">
            Edit
          </el-link>
          <el-link
            :underline="false"
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
          >
            Delete
          </el-link>
        </template>
      </el-table-column>
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
      multipleSelection: [],
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined
      },
      downloadLoading: false
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.page = 1
      this.fetchTableData()
    }
  },
  created() {
    this.fetchTableData()
  },
  methods: {
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
      if (filter.PROTOCOL) {
        this.filterForm.protocol = filter.PROTOCOL
      }
      this.pagination.page = 1
      this.fetchTableData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleCreate() {},
    handleDelete(row, index) {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return
      }
      this.$confirm('确认要删除选中的项?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {})
        .catch(() => {})
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/utils/export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.tableData.map(v =>
        filterVal.map(j => {
          if (j === 'timestamp') {
            return '2010-12-23 23：00'
          } else {
            return v[j]
          }
        })
      )
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        // this.tableLoading = true
        // const { text, sortProp, isAsc } = this.filterForm
        // const { page, limit } = this.pagination
        // getProjectPage({
        //   SubareaIdList: [],
        //   UserIdList: [],
        //   CreateTimeQuantum: undefined,
        //   ExpireTimeQuantum: undefined,
        //   ProjectStatusList: undefined,
        //   SortType: sortProp,
        //   IsAsc: isAsc,
        //   PageIndex: page,
        //   PageSize: limit
        // })
        //   .then(res => {
        //     if (page === this.pagination.page && text === this.filterForm.text) {
        //       if (res.data.Code === 200) {
        //         this.tableData = res.data.Data.Data
        //         this.pagination.total = res.data.Data.TotalCount
        //       } else {
        //         this.tableData = []
        //         this.pagination.total = 0
        //         this.$message.error('列表获取失败')
        //       }
        //     }
        //   })
        //   .catch(err => {
        //     console.error(err)
        //     if (page === this.pagination.page && text === this.filterForm.text) {
        //       this.tableData = []
        //       this.pagination.total = 0
        //       this.$message.error('列表获取失败')
        //     }
        //   })
        //   .finally(() => {
        //     this.tableLoading = false
        //   })
      },
      1000,
      {
        leading: true
      }
    )
  }
}
</script>
