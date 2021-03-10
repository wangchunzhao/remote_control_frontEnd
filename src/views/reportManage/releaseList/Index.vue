<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button size="small" type="primary" @click="batchReleaseFun">
        批量发布
      </el-button>
      <div style="float: right;display: flex;align-items: center">
        <el-switch
          v-model="filterForm.DiagnosisStatus"
          active-text="仅显示待诊断"
          style="margin-left: 20px;"
        >
        </el-switch>
        <el-switch
          v-model="filterForm.IsRelease"
          active-text="仅显示待发布"
          style="margin-left: 20px;"
        >
        </el-switch>
        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="margin-left: 20px;"
          class="filter-input"
          placeholder="搜索项目名称"
          suffix-icon="el-icon-search"
        />
      </div>
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      class="member-table"
      ref="memberTable"
      style="width: 100%;margin-top: 20px;"
      @sort-change="sortChange"
      @selection-change="val => (multipleSelection = val)"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column min-width="150" prop="ProjectName" label="项目名称" />
      <el-table-column min-width="150" prop="ReportName" label="报告名称" />
      <el-table-column prop="Created" label="生成时间" min-width="120">
        <template slot-scope="{ row }">
          {{ _dateFormat(row.Created, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column
        prop="ReleaseTime"
        label="发布时间"
        min-width="120"
        sortable="custom"
      >
        <template slot-scope="{ row }">
          {{ _dateFormat(row.ReleaseTime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="80"
        prop="ReportStrategyName"
        label="报告策略"
      />
      <el-table-column label="操作" width="100">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="handleEdit(row.ReportId)">
            编辑
          </el-button>
          <el-button type="text" @click.native="releaseFun([row.ReportId])">
            发布
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
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { getReportPage } from '@/api/report'
import { getToken } from '@/utils/auth'

export default {
  name: 'Index',
  data() {
    return {
      tableLoading: false,
      tableData: [],
      multipleSelection: [],
      filterForm: {
        IsRelease: false,
        DiagnosisStatus: false,
        sortProp: undefined,
        isAsc: undefined
      },
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  watch: {
    'filterForm.text'() {
      this.fetchTableData()
    },
    'filterForm.IsRelease'() {
      this.fetchTableData()
    },
    'filterForm.DiagnosisStatus'() {
      this.fetchTableData()
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    // 编辑
    handleEdit(id) {
      window.open(
        `${global.REPORT_TEMPLATE_PROJECT_URL}/#/?id=${id}&token=${getToken()}`
      )
    },
    // 批量发布
    batchReleaseFun() {
      if (!this.multipleSelection.length) {
        this.$message.error('请至少选择一项')
        return
      }
      this.releaseFun(this.multipleSelection.map(item => item.ReportId))
    },
    // 发布
    releaseFun(ReportIdList) {},
    // 表格排序
    sortChange(val) {
      this.filterForm.isAsc = val.order === 'ascending'
      this.filterForm.sortProp = val.order ? val.prop : undefined
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 重置表格
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格换页
    handleCurrentChange() {
      this.fetchTableData()
    },
    // 获取表格数据
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { currentPage, size } = this.pagination
        const {
          sortProp,
          isAsc,
          IsRelease,
          DiagnosisStatus,
          text
        } = this.filterForm
        let data = {
          CompanyId: this.companyId,
          ProjectName: text,
          DiagnosisStatus: DiagnosisStatus ? 'ToDiagnose' : undefined,
          IsRelease: IsRelease ? 0 : undefined,
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: currentPage,
          PageSize: size
        }
        getReportPage(data)
          .then(res => {
            if (
              this.pagination.currentPage !== currentPage ||
              this.pagination.size !== size
            ) {
              return false
            }
            const data = res.data
            if (data.Code === 200) {
              if (data.Data === null) {
                this.tableData = []
                return false
              }
              this.tableData = data.Data.Data
              this.pagination.total = data.Data.TotalCount
            } else {
              this.tableData = []
              this.pagination.total = 0
              this.$message.error(res.data.Message)
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('报告列表获取失败')
            this.pagination.total = 0
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

<style scoped></style>
