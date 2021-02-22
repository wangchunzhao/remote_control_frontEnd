<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        size="small"
        type="primary"
        v-permission="platform === PLATFORM.business ? [151] : [148]"
        icon="el-icon-plus"
        @click="onClickAdd"
      >
        注册
      </el-button>
      <el-button
        size="small"
        v-permission="platform === PLATFORM.business ? [152] : [149]"
        :loading="deleteLoading"
        type="danger"
        @click="handleDelete"
      >
        从项目中移除
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="查找编号"
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
      <el-table-column label="集中器编号" prop="ConcentratorNo" />
      <el-table-column label="所属项目" prop="ProjectName" />
      <el-table-column label="绑定电表数" prop="name">
        <template slot-scope="{ row }">
          <el-link
            @click.native="
              () =>
                row.MeterIdList && row.MeterIdList.length
                  ? $refs.dialogBindMeter.openDialog(row.MeterIdList)
                  : {}
            "
            type="primary"
            :underline="false"
            >{{ row.MeterIdList ? row.MeterIdList.length : 0 }}</el-link
          >
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
    <DialogAdd ref="dialogAdd" @refresh="fetchTableData" />
    <DialogBindMeter ref="dialogBindMeter" />
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import DialogAdd from './components/DialogAdd'
import DialogBindMeter from './components/DialogBindMeter'
import { getConcentratorPage, batchDeleteConcentrator } from '@/api/meter'

export default {
  components: { Pagination, DialogAdd, DialogBindMeter },
  data() {
    return {
      deleteLoading: false,
      tableData: [],
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
      downloadLoading: false,
      PLATFORM
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.page = 1
      this.fetchTableData()
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return (this.$store.state.app.project || {}).id
    },
    platform() {
      return this.$store.state.permissions.platform
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
    onClickAdd() {
      this.$refs.dialogAdd.openDialog()
    },
    handleDelete() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return
      }
      this.$confirm('确认要删除选中的项?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteLoading = true
          batchDeleteConcentrator({
            deviceIdList: this.multipleSelection.map(v => v.DeviceId)
          })
            .then(res => {
              if (res.data.Code === 200) {
                const data = res.data.Data
                if (!data.ErrList.length) {
                  this.$message.success('删除成功')
                } else {
                  let descText = ''
                  data.ErrList.forEach(item => {
                    descText += `
                        <div>集中器-${item.ErrKey} 删除失败，Message：${item.ErrMessage}</div>
                      `
                  })
                  this.$notify({
                    title: '错误提示',
                    duration: 10000,
                    dangerouslyUseHTMLString: true,
                    message: descText
                  })
                }
              } else {
                this.$message.error('删除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('删除失败')
            })
            .finally(() => {
              this.deleteLoading = false
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
        getConcentratorPage({
          CompanyId:
            this.platform === PLATFORM.business ? undefined : this.companyId,
          ProjectId:
            this.platform === PLATFORM.business ? this.projectId : undefined,
          ConcentratorNo: text,
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
