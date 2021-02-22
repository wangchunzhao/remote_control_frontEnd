<template>
  <el-dialog
    width="1048px"
    title="项目设备运行情况"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-button
      size="small"
      type="primary"
      @click.native="handleExport"
      :loading="exportLoading"
      >导出</el-button
    >
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;margin-top: 16px;"
    >
      <el-table-column label="项目名称" prop="ProjectName" />
      <el-table-column label="分区" prop="ParentSubareaName" />
      <el-table-column label="子系统数量" prop="BigTypeTotal" />
      <el-table-column label="设备数量" prop="Total" />
      <el-table-column label="离线设备数量" prop="OffLineTotal" />
      <el-table-column label="报警设备数量" prop="AlarmTotal" />
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
import debounce from 'lodash/debounce'
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import {
  getModelTreeProjectStatistics,
  exportModelTreeProjectStatistics
} from '@/api/model'
import { saveAs } from 'file-saver'

export default {
  props: {
    subareaId: {
      type: Number,
      require: true
    }
  },
  components: {
    Pagination
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      tableData: null,
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      exportLoading: false
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchTableData()
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleExport() {
      this.exportLoading = true
      exportModelTreeProjectStatistics({
        subareaIdList: [this.subareaId]
      })
        .then(res => {
          if (
            'application/json; charset=utf-8' === res.headers['content-type']
          ) {
            const reader = new FileReader()

            reader.onload = t => {
              const data = JSON.parse(t.target.result)
              this.$message(data.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          var a = new Blob([res.data])
          saveAs(
            a,
            `项目设备运行情况_${this._dateFormat(
              new Date(),
              'YYYY-MM-DD HH:mm'
            )}.xls`
          )
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
     * 表格排序
     */
    sortChange(val) {
      const { prop, order } = val
      this.filterForm.sortProp = prop
      this.filterForm.isAsc = order === 'ascending'
      this.fetchTableData()
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { page, limit } = this.pagination
        getModelTreeProjectStatistics({
          subareaIdList: [this.subareaId],
          PageIndex: page,
          PageSize: limit
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.tableData = res.data.Data.Data
              this.pagination.total = res.data.Data.TotalCount
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
