<template>
  <el-dialog
    width="650px"
    title="点位列表"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div class="table-tool-box">
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索点位名称"
        suffix-icon="el-icon-search"
      />
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @filter-change="filterChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column prop="pname" label="点位名称" />
      <el-table-column prop="DeviceName" label="设备名称" />
      <el-table-column prop="SysName" label="系统" />
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="prev, pager, next, sizes, jumper"
        :pager-count="5"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-dialog>
</template>

<script>
import { getAlarmStrategyPoint } from '@/api/alarmStrategyNew'
import debounce from 'lodash/debounce'

export default {
  data() {
    return {
      dialogVisible: false,
      currentId: '',
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined
      },

      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      historyPoint: null
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  methods: {
    openDialog(id) {
      this.dialogVisible = true
      this.currentId = id
      this.fetchTableData()
    },
    handleClose() {
      this.dialogVisible = false
      this.tableData = []
      this.pagination.currentPage = 1
      this.pagination.total = 0
    },
    // 查看历史数据
    watchHistory(point) {
      this.historyPoint = [point]
      this.$refs.historyDialog.toggleDialog()
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
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
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
        const { text } = this.filterForm
        const { currentPage, size } = this.pagination
        getAlarmStrategyPoint({
          ID: this.currentId,
          PageSize: size,
          PageIndex: currentPage,
          pointName: text
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
      },
      1000,
      {
        leading: true
      }
    )
  }
}
</script>
