<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button icon="el-icon-plus" size="small" type="primary">
        新增
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
      style="width: 100%;"
      @sort-change="sortChange"
      @filter-change="filterChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" label="#" width="50px" />
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" sortable="custom" label="Name" />
      <el-table-column prop="name" sortable="custom" label="Name" />
      <el-table-column
        column-key="name"
        prop="name"
        :filters="[{ text: 'Text1', value: 'Value1' }]"
        sortable="custom"
        label="Name"
      />
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="watch(row)">
            查看
          </el-button>
          <el-button type="text" class="btn-danger">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        v-show="pagination.total > 0"
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

export default {
  data() {
    return {
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined
      },

      multipleSelection: [],
      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  methods: {
    watch(row) {
      console.log('%c--', 'color:rgb(38, 139, 210)', row)
    },
    /**
     * 表格排序
     */
    sortChange(val) {
      if (val.prop === 'CREATE_TIME') {
        this.filterForm.sortProp = 0
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    /**
     * 表格筛选
     */
    filterChange(filter) {
      if (filter.PROTOCOL) {
        this.filterForm.protocol = filter.PROTOCOL
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    /**
     * 表格多选
     */
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    /**
     * 分页
     */
    handleCurrentChange() {
      this.fetchTableData()
    },
    /**
     * 表格每页数量
     */
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        // this.tableLoading = true
        // const { text, sortProp, isAsc } = this.filterForm
        // const { currentPage, size } = this.pagination
        // getSubareaList({
        // SortType: sortProp,
        // IsAsc: isAsc,
        // PageSize: size,
        // PageIndex: currentPage
        // })
        //   .then(res => {
        // if (currentPage === this.pagination.currentPage && text === this.filterForm.text) {
        //     let data = res.data
        //     if (data.Code === 200) {
        //       this.tableData = data.Data.Data
        //       this.pagination.total = data.Data.TotalCount
        //     } else {
        //       this.tableData = []
        //       this.pagination.total = 0
        //       this.$message.error('列表获取失败')
        //     }
        // }
        //   })
        //   .catch(err => {
        //     console.error(err)
        // if (currentPage === this.pagination.currentPage) {
        //     this.tableData = []
        //     this.pagination.total = 0
        //     this.$message.error('列表获取失败')
        // }
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

<style lang="scss" scoped>
div {
}
</style>
