<template>
  <div class="schedule-list">
    <div class="content-box">
      <div style="margin-bottom: 16px;">
        <el-button
          type="primary"
          size="small"
          class="test-add-button"
          @click.native="addScheduleDialogVisible = true"
        >
          新增日程
        </el-button>
        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          placeholder="查找日程内容"
          style="width: 200px;float: right;"
          suffix-icon="el-icon-search"
        />
      </div>

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
    </div>

    <div class="content-box">
      <el-collapse accordion style="margin: -20px;">
        <el-collapse-item>
          <template slot="title">
            <span style="font-size: 15px;">过去的日程</span>
          </template>
          <SchedulePastTable style="margin: 20px;" />
        </el-collapse-item>
      </el-collapse>
    </div>

    <el-dialog
      title="新增日程"
      :visible.sync="addScheduleDialogVisible"
      width="650px"
      @close="handleAddDialogClose"
    >
      <ScheduleAddForm ref="addForm" />
      <span slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button size="medium" @click="addScheduleDialogVisible = false"
          >取 消</el-button
        >
        <el-button
          :loading="addFormLoading"
          size="medium"
          type="primary"
          @click="submitAddForm"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <ScheduleDetail :editable="true" ref="scheduleDetailDialog" />
  </div>
</template>

<script>
import ScheduleAddForm from './component/ScheduleAddForm'
import ScheduleDetail from './component/ScheduleDetail'
import { getScheduleList, addSchedule } from '@/api/schedule'
import SchedulePastTable from './component/SchedulePastTable'
import debounce from 'lodash/debounce'

export default {
  components: {
    ScheduleAddForm,
    ScheduleDetail,
    SchedulePastTable
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
      },

      addScheduleDialogVisible: false,
      addFormLoading: false,

      scheduleDetailDialogVisible: false
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
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
    // 添加日程弹窗关闭
    handleAddDialogClose() {
      this.$refs.addForm.resetForm()
    },
    // 提交添加日程表单
    submitAddForm() {
      this.addFormLoading = true
      this.$refs.addForm
        .validate()
        .then(res => {
          if (res.valid) {
            addSchedule(res.data)
              .then(res => {
                if (res.data.Code === 200) {
                  this.$message.success('日程新增成功')
                  this.fetchTableData()
                  this.addScheduleDialogVisible = false
                } else {
                  this.$message.error('新增失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('新增失败')
              })
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.addFormLoading = false
        })
    },
    // 获取日程列表
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { text, type, orderBy } = this.filterForm
        getScheduleList({
          ProjectId: this.projectId,
          Type: type,
          Content: text,
          Status: 0,
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
      },
      1000,
      {
        leading: true
      }
    )
  }
}
</script>

<style lang="scss">
.schedule-list {
  .el-dialog__footer {
    text-align: right;
  }
  .schedule-info-dialog {
    .el-dialog__body {
      padding: 20px;
      background-color: #f5f5f5;
    }
  }
}
</style>
