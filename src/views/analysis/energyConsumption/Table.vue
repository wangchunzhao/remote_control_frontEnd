<template>
  <div>
    <div class="table-tool-box">
      <el-button size="small" type="primary" @click="handleExport">
        导出
      </el-button>
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
    >
      <el-table-column label="Name" prop="Name" />
      <el-table-column label="Name" prop="Name" />
    </el-table>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  data() {
    return {
      tableData: null,
      tableLoading: false,
      downloadLoading: false
    }
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleExport() {},
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
