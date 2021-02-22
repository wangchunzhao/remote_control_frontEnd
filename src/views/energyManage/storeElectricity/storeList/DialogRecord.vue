<template>
  <el-dialog
    width="800"
    title="用电记录"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div style="margin-bottom: 16px;">电表ID：{{ this.currentId }}</div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
      row-key="id"
      lazy
      :load="loadDetailRecord"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="使用月份" prop="Month">
        <template slot-scope="{ row }">
          {{ dateFormat(row.Month) }}
        </template>
      </el-table-column>
      <el-table-column label="商户名称" prop="ShopName" />
      <el-table-column label="电量/度" prop="Energy" />
      <el-table-column label="电费/元" prop="Cost" />
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
import { getMeterPayPage, getMeterPayDetailPage } from '@/api/meter'
import { randomString } from '@/utils/index'
export default {
  components: { Pagination },
  data() {
    return {
      dialogVisible: false,
      tableData: null,
      currentId: undefined,
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      }
    }
  },
  methods: {
    openDialog(id) {
      this.currentId = id
      this.dialogVisible = true
      this.fetchTableData()
    },
    handleClose() {
      this.dialogVisible = false
    },
    loadDetailRecord(tree, treeNode, resolve) {
      getMeterPayDetailPage({
        MeterId: this.currentId,
        Month: tree.Month,
        PageIndex: 1,
        PageSize: 1000
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data.Data
            data.forEach(v => {
              v.id = randomString(10)
            })
            resolve(data)
          } else {
            resolve([])
          }
        })
        .catch(err => {
          console.error(err)
          resolve([])
        })
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { page, limit } = this.pagination
        getMeterPayPage({
          MeterId: this.currentId,
          Month: undefined,
          PageIndex: page,
          PageSize: limit
        })
          .then(res => {
            if (page === this.pagination.page) {
              if (res.data.Code === 200) {
                res.data.Data.Data.forEach(v => {
                  v.id = randomString(10)
                  v.hasChildren = v.ShopName.indexOf(',') > -1
                  if (v.hasChild) {
                    v.hasChildren = []
                  }
                })
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
    dateFormat(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}年${date.getMonth()}月`
    }
  }
}
</script>
