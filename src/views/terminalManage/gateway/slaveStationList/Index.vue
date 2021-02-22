<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        size="small"
        type="primary"
        @click="() => $refs.dialogPointEdit.openDialog()"
      >
        创建从站设备
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="查找设备名称"
        suffix-icon="el-icon-search"
      />
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="设备名称"
        prop="DeviceModuleName"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column label="创建时间" prop="CreateTime" sortable="custom">
      </el-table-column>
      <el-table-column label="创建者" prop="UserName"> </el-table-column>
      <el-table-column
        show-overflow-tooltip
        label="授权范围"
        prop="PermissionScope"
      >
      </el-table-column>
      <el-table-column label="点位数量" prop="PointNum" sortable="custom">
      </el-table-column>
      <el-table-column label="已接入网关" prop="DeviceNum" sortable="custom">
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="{ row }">
          <el-link
            @click.native="handlePreview(row)"
            :underline="false"
            type="primary"
            size="mini"
          >
            查看
          </el-link>
          <el-link
            @click.native="
              () =>
                $router.push({
                  name: 'slaveStationDetail',
                  query: {
                    data: JSON.stringify(row)
                  }
                })
            "
            :underline="false"
            type="primary"
            size="mini"
          >
            管理
          </el-link>
          <el-link
            @click.native="() => handleDelete(row)"
            :underline="false"
            size="mini"
            type="danger"
          >
            删除
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
    <DialogPointEdit ref="dialogPointEdit" @refresh="fetchTableData" />
    <DialogPreviewPointList
      :list="previewPointList"
      ref="dialogPreviewPointList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import DialogPointEdit from '../component/DialogPointEdit'
import {
  getDeviceModulePage,
  deleteDeviceModule,
  getDeviceModulePointList
} from '@/api/deviceModule'
import { Decrypt } from '@/utils/secret'
import DialogPreviewPointList from '../component/DialogPreviewPointList'

export default {
  components: { Pagination, DialogPointEdit, DialogPreviewPointList },
  data() {
    return {
      tableData: [{}],
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      previewPointList: [],
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
  computed: {
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    handlePreview(row) {
      getDeviceModulePointList({
        deviceModuleId: row.DeviceModuleId,
        isGetAll: true
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.previewPointList = JSON.parse(Decrypt(res.data.Data))
            console.log('[155]-Index.vue', this.previewPointList)
            if (this.userId === row.UserId) {
              // 从站设备创建人就是当前登录用户
              this.previewPointList.forEach(v => (v.fullVisible = true))
            }
            this.$refs.dialogPreviewPointList.openDialog(row.DeviceModuleName)
          } else {
            this.$message.error('从站设备点位查询失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('从站设备点位查询失败')
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
    handleDelete(row) {
      if (row.DeviceNum > 0) {
        this.$message('从站设备已接入网关，无法删除')
        return
      }
      this.$confirm(`确认要删除从站设备 ${row.DeviceModuleName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteDeviceModule({
            deviceModuleId: row.DeviceModuleId
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('设备删除成功')
                this.pagination.page = 1
                this.fetchTableData()
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { text, sortProp, isAsc } = this.filterForm
        const { page, limit } = this.pagination
        getDeviceModulePage({
          DeviceModuleId: undefined, // 网关模块id(该参数会使其他条件失效)
          DeviceModuleName: text,
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: page,
          PageSize: limit
        })
          .then(res => {
            if (
              page === this.pagination.page &&
              text === this.filterForm.text
            ) {
              if (res.data.Code === 200) {
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
            if (
              page === this.pagination.page &&
              text === this.filterForm.text
            ) {
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
    )
  }
}
</script>
