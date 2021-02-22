<template>
  <el-dialog
    width="380px"
    title="绑定电表"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
    >
      <el-table-column label="序号" width="100px" type="index" />
      <el-table-column label="电表ID" prop="meterId" />
    </el-table>
    <pagination
      v-show="pagination.total > 0"
      :total="pagination.total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      @pagination="fetchTableData"
    />
  </el-dialog>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
export default {
  components: {
    Pagination
  },
  data() {
    return {
      dialogVisible: false,
      tableData: [],
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      }
    }
  },
  methods: {
    openDialog(meterIds) {
      this.dialogVisible = true
      this.tableData = meterIds.map(v => ({
        meterId: v
      }))
    },
    handleClose() {
      this.dialogVisible = false
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
        //       if (res.Code === 200) {
        //         this.tableData = res.Data.Data
        //         this.pagination.total = res.Data.TotalCount
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
