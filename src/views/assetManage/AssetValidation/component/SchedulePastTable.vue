<template>
  <div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
      element-loading-text="加载中..."
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column
        label="类型"
        column-key="Type"
        prop="Type"
        :filters="[
          { text: '验证日程', value: 1 },
          { text: '校验日程', value: 2 }
        ]"
      >
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :style="
              row.Type === 2
                ? {
                    background: 'rgba(24,144,255,0.1)',
                    borderColor: 'rgba(24,144,255,0.45)',
                    color: 'rgba(24,144,255,1)'
                  }
                : {
                    background: 'rgba(47,84,235,0.1)',
                    borderColor: 'rgba(47,84,235,0.45)',
                    color: 'rgba(47,84,235,1)'
                  }
            "
          >
            {{ row.Type === 2 ? '校验日程' : '验证日程' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="日期" sortable="custom" prop="WorkDate">
        <template slot-scope="{ row }">
          {{ _dateFormat(row.WorkDate, 'YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column label="负责人" prop="CreateUserName" />
      <el-table-column label="内容" prop="Content" />
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button
            class="test-watch-btn"
            type="text"
            @click.native="handleWatch(row)"
          >
            查看
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
    <ScheduleDetail :editable="false" ref="scheduleDetailDialog" />
  </div>
</template>

<script>
import { getScheduleList } from '@/api/schedule'
import ScheduleDetail from './ScheduleDetail'

export default {
  components: {
    ScheduleDetail
  },
  data() {
    return {
      filterForm: {
        text: undefined,
        type: undefined,
        orderBy: undefined
      },

      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    sortChange(val) {
      this.filterForm.orderBy = val.order === 'ascending' ? 'asc' : 'desc'
      this.fetchTableData()
    },
    filterChange(filter) {
      if (filter.Type) {
        this.filterForm.type = filter.Type
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 查看日程
    handleWatch(row) {
      this.$refs.scheduleDetailDialog.openDialog(row.ID, row.CreateUser)
    },
    // 获取日程列表
    fetchTableData() {
      this.tableLoading = true
      const { text, type, orderBy } = this.filterForm
      getScheduleList({
        ProjectId: this.projectId,
        Type: type,
        Content: text,
        Status: -1,
        Orderby: orderBy,
        Resources: undefined,
        PageIndex: this.pagination.currentPage,
        PageSize: this.pagination.size
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.tableData = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.tableData = []
            this.$message.error('列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('列表获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>
