<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button size="small" type="primary" @click="releaseFun">
        批量发布
      </el-button>
      <div style="float: right;display: flex;align-items: center">
        <el-switch
          v-model="filterForm.type"
          active-text="仅显示待诊断"
          style="margin-left: 20px;"
        >
        </el-switch>
        <el-switch
          v-model="filterForm.type"
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
      @filter-change="filterChange"
      @selection-change="val => (multipleSelection = val)"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column min-width="150" prop="Nickname" label="项目名称" />
      <el-table-column min-width="150" prop="Nickname" label="报告名称" />
      <el-table-column prop="Acttime" label="生成时间" min-width="120">
        <template slot-scope="{ row }">
          {{ _dateFormat(row.Acttime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column
        prop="Acttime"
        label="发布时间"
        min-width="120"
        sortable="custom"
      >
        <template slot-scope="{ row }">
          {{ _dateFormat(row.Acttime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column min-width="80" prop="Nickname" label="报告策略" />
      <el-table-column label="操作" width="100">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="handleEdit(row.Id)">
            编辑
          </el-button>
          <el-button type="text" @click.native="releaseFun(row.Id)">
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
export default {
  name: 'Index',
  data() {
    return {
      tableLoading: false,
      tableData: [],
      multipleSelection: [],
      filterForm: {
        text: '',
        type: false,
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
  methods: {
    handleEdit(id) {},
    releaseFun() {},
    // 表格排序
    sortChange(val) {
      if (val.prop === 'Nickname') {
        this.filterForm.sortProp = 0
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.Flag) {
        this.filterForm.status = filter.Flag[0]
      } else if (filter.CompanyRoleName) {
        this.filterForm.companyRoleId = filter.CompanyRoleName[0]
      } else if (filter.ProjectRoleName) {
        this.filterForm.projectRoleId = filter.ProjectRoleName[0]
      }
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
    }
  }
}
</script>

<style scoped></style>
