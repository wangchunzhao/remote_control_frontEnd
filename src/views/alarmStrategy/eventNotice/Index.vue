<template>
  <div class="content-box event-notice">
    <div class="table-tool-box">
      <el-button
        v-if="
          platform === PLATFORM.deviceConnect
            ? checkPermission([128])
            : checkPermission([126])
        "
        @click.native="() => $router.push({ name: 'eventNoticeEdit' })"
        size="small"
        type="primary"
      >
        新增
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索策略名称"
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
      <el-table-column prop="Name" sortable="custom" label="策略名称">
        <template slot-scope="{ row }">
          <el-button
            v-if="
              platform === PLATFORM.deviceConnect
                ? checkPermission([128])
                : checkPermission([126])
            "
            @click.native="
              () =>
                $router.push({
                  name: 'eventNoticeEdit',
                  query: { id: row.strategyId }
                })
            "
            type="text"
            >{{ row.Name }}</el-button
          >
          <span v-else>{{ row.Name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="platform === PLATFORM.deviceConnect"
        column-key="ProjectName"
        prop="ProjectName"
        :filters="projectOptions"
        label="所属项目"
      />
      <el-table-column
        column-key="eventName"
        prop="eventName"
        :filters="eventTypeOptions"
        label="事件类型"
      />
      <!-- <el-table-column prop="ResourcesNum" sortable="custom" label="资源数量">
        <template slot-scope="{ row }">
          <el-button type="text">{{ row.ResourcesNum }}</el-button>
        </template>
      </el-table-column> -->
      <el-table-column prop="name" label="通知规则">
        <template slot-scope="{ row }">
          <div class="ellipsis">通知方式：{{ row.notice }}</div>
          <div class="ellipsis">
            清除时通知：{{ row.recovery ? '通知' : '不通知' }}
          </div>
          <div class="ellipsis">
            重复通知：{{ row.repeatCheck ? '重复' : '不重复' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="concatsNum" sortable="custom" label="通知人数" />
      <el-table-column
        prop="updateTime"
        sortable="custom"
        label="最后修改时间"
      />
      <el-table-column
        column-key="Run"
        prop="Run"
        width="100"
        :filters="[{ text: '开', value: 1 }, { text: '关', value: 0 }]"
        label="报警启停"
      >
        <template slot-scope="{ row }">
          <el-switch
            @change="() => handleToggle(row)"
            class="el-switch-innertext"
            v-model="row.Run"
            :disabled="
              platform === PLATFORM.deviceConnect
                ? !checkPermission([128])
                : !checkPermission([126])
            "
            :active-value="1"
            :inactive-value="0"
            active-text="开"
            inactive-text="关"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90">
        <template slot-scope="{ row }">
          <el-button
            v-if="
              platform === PLATFORM.deviceConnect
                ? checkPermission([128])
                : checkPermission([126])
            "
            type="text"
            @click.native="handleClickCopy(row)"
          >
            复制
          </el-button>
          <el-button
            @click.native="() => handleClickDelete(row)"
            type="text"
            class="btn-danger"
          >
            删除
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
import { checkPermission } from '@/utils/permissions'
import {
  getEventStrategyScreen,
  getEventStrategyList,
  deleteEventStrategy,
  eventStrategyRun,
  queryEventStrategy
} from '@/api/eventStrategy'

export default {
  data() {
    return {
      projectOptions: [],
      eventTypeOptions: [],
      filterForm: {
        text: '',
        projectIds: [],
        eventTypeIds: [],
        status: [],
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
      },
      PLATFORM,
      checkPermission
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    $route() {
      this.fetchTableData()
      this.fetchOptions()
    },
    projectId() {
      this.fetchTableData()
      this.fetchOptions()
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project
        ? this.$store.state.app.project.id
        : ''
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  mounted() {
    this.fetchTableData()
    this.fetchOptions()
  },
  methods: {
    // 点击复制
    handleClickCopy(row) {
      queryEventStrategy({
        ID: row.strategyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data

            const basicForm = {}
            basicForm.name = data.name + '-复制'
            basicForm.project = data.project
            basicForm.remark = data.remark
            basicForm.resourceType = data.resourcesType
            basicForm.eventType = data.eventType

            const noticeForm = {}
            noticeForm.ways = data.notice.split(',')
            noticeForm.recovery = data.recovery
            noticeForm.repeatCheck = data.repeatCheck
            noticeForm.repeatTime = data.repeatTime

            data.concats.forEach(item => {
              item.range[0] = this.stringToDate(item.range[0])
              item.range[1] = this.stringToDate(item.range[1])
            })
            let contactTableData = data.concats
            this.$router.push({
              name: 'eventNoticeEdit',
              params: { basicForm, noticeForm, contactTableData }
            })
          } else {
            this.$message.error('复制失败')
          }
        })
        .catch(err => {
          this.$message.error('复制失败')
          console.error(err)
        })
    },
    // 点击删除
    handleClickDelete(row) {
      this.$confirm('确认要删除选中策略？', '提示', { type: 'warning' }).then(
        () => {
          deleteEventStrategy({
            strategyId: row.strategyId
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                this.$message.success('策略删除成功')
                this.fetchTableData()
                this.fetchOptions()
              } else {
                this.$message.error('策略删除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('策略删除失败')
            })
        }
      )
    },
    handleToggle(item) {
      eventStrategyRun({
        ID: item.strategyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            if (!res.data.Data.IsSuccess) {
              this.$message.error('操作失败')
              item.Run = item.Run === 1 ? 0 : 1
            } else {
              if (item.Run) {
                this.$message.success('策略已成功开启')
              } else {
                this.$message.success('策略已成功关闭')
              }
            }
          }
        })
        .catch(err => {
          this.$message.error('操作失败')
          console.error(err)
        })
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'Name') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'ResourcesNum') {
        this.filterForm.sortProp = 2
      } else if (val.prop === 'concatsNum') {
        this.filterForm.sortProp = 3
      } else if (val.prop === 'updateTime') {
        this.filterForm.sortProp = 4
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.ProjectName) {
        this.filterForm.projectIds = filter.ProjectName
      } else if (filter.eventName) {
        this.filterForm.eventTypeIds = filter.eventName
      } else if (filter.Run) {
        this.filterForm.status = filter.Run
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
        const {
          text,
          projectIds,
          eventTypeIds,
          status,
          sortProp,
          isAsc
        } = this.filterForm
        const { currentPage, size } = this.pagination
        getEventStrategyList({
          companyId: this.companyId,
          projectId:
            this.platform === PLATFORM.deviceConnect
              ? projectIds
              : [this.projectId],
          EventTypeId: eventTypeIds,
          Run: status,
          eventName: text,
          OrderByField: sortProp,
          IsDesc: isAsc,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            if (currentPage !== this.pagination.currentPage) {
              return false
            }
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
            if (currentPage !== this.pagination.currentPage) {
              return false
            }
            this.tableData = []
            this.pagination.total = 0
            this.$message.error('列表获取失败')
          })
          .finally(() => {
            this.tableLoading = false
          })
      },
      500,
      {
        leading: true
      }
    ),
    fetchOptions() {
      const {
        text,
        projectIds,
        eventTypeIds,
        status,
        sortProp,
        isAsc
      } = this.filterForm
      getEventStrategyScreen({
        companyId: this.companyId,
        projectId:
          this.platform === PLATFORM.deviceConnect
            ? projectIds
            : [this.projectId],
        EventTypeId: eventTypeIds,
        Run: status,
        eventName: text,
        OrderByField: sortProp,
        IsDesc: isAsc,
        PageSize: undefined,
        PageIndex: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.eventTypeOptions = data.EventType.map(item => ({
              text: item.Name,
              value: item.Id
            }))
            this.projectOptions = data.Project.map(item => ({
              text: item.Name,
              value: item.Id
            }))
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    stringToDate(string) {
      return new Date('2018/8/30 ' + string)
    }
  }
}
</script>

<style lang="scss" scoped>
.event-notice {
  .hover-cursor {
    cursor: pointer;
  }
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }
}
</style>
