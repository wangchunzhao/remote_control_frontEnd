<template>
  <div class="content-box eventList">
    <div class="table-tool-box">
      <el-radio-group
        v-model="filterForm.timeType"
        @change="timeTypeChange"
        size="small"
        style="transform: translateY(-2px);"
      >
        <el-radio-button label="近7天"></el-radio-button>
        <el-radio-button label="近30天"></el-radio-button>
        <el-radio-button label="自定义"></el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-model="filterForm.timeRange"
        type="daterange"
        :disabled="filterForm.timeType !== '自定义'"
        size="small"
        style="width: 250px;margin: 0 15px;"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      >
      </el-date-picker>
      <el-button
        @click.native="handleExport"
        :loading="exportLoading"
        type="primary"
        size="small"
        >导出</el-button
      >
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        style="width: 320px;"
        class="filter-input"
        placeholder="搜索影响对象名称"
      >
        <el-cascader
          size="small"
          slot="prepend"
          :show-all-levels="false"
          v-model="filterForm.eventTypeId"
          :props="props"
          style="width: 110px;"
          clearable
          placeholder="搜索事件类型"
        ></el-cascader>
        <el-button
          @click.native="handleClickSearch"
          slot="append"
          icon="el-icon-search"
        ></el-button>
      </el-input>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @filter-change="filterChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        column-key="eventName"
        prop="eventName"
        :filters="eventOptions"
        label="事件"
      />
      <el-table-column
        column-key="typeName"
        prop="typeName"
        :filters="typeOptions"
        label="类型"
      />
      <el-table-column prop="triggerTime" sortable="custom" label="触发时间" />
      <el-table-column prop="sourceName" label="影响对象" />
      <el-table-column
        column-key="status"
        prop="status"
        :filters="statusOptions"
        label="状态"
      >
        <template slot-scope="{ row }">
          <div v-if="row && row.status !== 0">
            <el-tag
              size="small"
              :type="
                statusOptions.find(item => item.value === row.status).tagType
              "
              >{{
                statusOptions.find(item => item.value === row.status).text
              }}</el-tag
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="concatsNum" sortable="custom" label="通知人数">
        <template slot-scope="{ row }">
          <el-tooltip
            v-if="row.concatsNum > 0"
            class="item"
            effect="dark"
            placement="top"
          >
            <div slot="content">
              <div
                style="line-height: 20px;"
                v-for="item in row.concatsUser.split(';')"
                :key="item"
              >
                {{ item }}
              </div>
            </div>
            <el-button
              @click.native="
                () => $refs.msgHistoryDialog.openDialog(row.eventId)
              "
              type="text"
            >
              {{ row.concatsNum }}
            </el-button>
          </el-tooltip>

          <span v-else>{{ row.concatsNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="事件通知">
        <template slot-scope="{ row }">
          <el-button type="text">
            {{ row.strategyName }}
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
    <MsgHistoryDialog ref="msgHistoryDialog" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import {
  getEventListScreen,
  getEventList,
  exportEvent
} from '@/api/eventStrategy'
import filesaver from 'file-saver'
import { getEventTypeList } from '@/api/eventStrategy'
import MsgHistoryDialog from './MsgHistoryDialog'

export default {
  components: {
    MsgHistoryDialog
  },
  data() {
    return {
      eventOptions: [],
      typeOptions: [],
      filterForm: {
        eventIds: [],
        typeIds: [],
        status: [],
        timeType: '近7天',
        timeRange: [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()],
        text: '',
        eventTypeId: undefined,
        startTime: this._dateFormat(
          new Date(Date.now() - 7 * 24 * 3600 * 1000),
          'YYYY-MM-DD HH:mm'
        ),
        endTime: this._dateFormat(new Date(), 'YYYY-MM-DD HH:mm'),
        sortProp: undefined,
        isAsc: undefined
      },
      multipleSelection: [],
      tableLoading: false,
      exportLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      statusOptions: [
        {
          text: '未恢复',
          value: -1,
          tagType: 'danger'
        },
        {
          text: '已恢复',
          value: 1,
          tagType: 'success'
        }
      ],
      props: {
        emitPath: false,
        lazy: true,
        lazyLoad(node, resolve) {
          const { level } = node
          getEventTypeList({
            projectId: level === 0 ? undefined : this.projectId,
            parentId: level === 0 ? undefined : node.value
          }).then(res => {
            let nodes = []
            if (res.data.Code === 200) {
              nodes = res.data.Data.map(v => ({
                value: v.eventTypeId,
                label: v.eventName,
                leaf: level >= 1
              }))
            }
            resolve(nodes)
          })
        }
      }
    }
  },
  watch: {
    projectId() {
      this.pagination.currentPage = 1
      this.fetchTableData()
      this.fetchOptions()
    },
    'filterForm.timeRange'(range) {
      if (range) {
        this.filterForm.startTime = this._dateFormat(
          range[0],
          'YYYY-MM-DD HH:mm'
        )
        this.filterForm.endTime = this._dateFormat(range[1], 'YYYY-MM-DD HH:mm')
        this.pagination.currentPage = 1
        this.fetchTableData()
        this.fetchOptions()
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchTableData()
    this.fetchOptions()
  },
  methods: {
    timeTypeChange(val) {
      if (val === '近7天') {
        this.filterForm.timeRange = [
          new Date(Date.now() - 7 * 24 * 3600 * 1000),
          new Date()
        ]
      } else if (val === '近30天') {
        this.filterForm.timeRange = [
          new Date(Date.now() - 30 * 24 * 3600 * 1000),
          new Date()
        ]
      } else {
        this.filterForm.timeRange = ''
      }
    },
    // 点击导出
    handleExport() {
      this.exportLoading = true
      const {
        text,
        startTime,
        endTime,
        eventIds,
        typeIds,
        status
      } = this.filterForm
      exportEvent({
        companyId: this.companyId,
        projectId: this.projectId,
        nameTypeId: eventIds,
        eventTypeId: typeIds,
        triggerStartTime: startTime,
        triggerEndTime: endTime,
        sourceName: text,
        Status: status
      })
        .then(res => {
          if (
            res.headers['content-type'] === 'application/json; charset=utf-8'
          ) {
            // blob转json
            var reader = new FileReader()
            reader.onload = e => {
              const temp = JSON.parse(e.target.result)
              this.$message(temp.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          const blob = new Blob([res.data])
          filesaver.saveAs(blob, '事件列表.xls')
        })
        .catch(err => {
          console.error(err)
          this.$message.error('导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    handleClickSearch() {
      if (!this.filterForm.eventTypeId) {
        this.$message('请选择事件类型')
        return
      }
      if (!this.filterForm.text) {
        this.$message('请填写影响对象名称')
        return
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'triggerTime') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'concatsNum') {
        this.filterForm.sortProp = 1
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.eventName) {
        this.filterForm.eventIds = filter.eventName
      } else if (filter.typeName) {
        this.filterForm.typeIds = filter.typeName
      } else if (filter.status) {
        this.filterForm.status = filter.status
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
          sortProp,
          isAsc,
          startTime,
          endTime,
          eventTypeId,
          eventIds,
          typeIds,
          status
        } = this.filterForm
        const { currentPage, size } = this.pagination
        getEventList({
          companyId: this.companyId,
          projectId: this.projectId,
          nameTypeId: eventIds,
          eventTypeId: typeIds,
          triggerStartTime: startTime,
          triggerEndTime: endTime,
          sourceName: text,
          sourceTypeId: eventTypeId, // 这里参数没错
          Status: status,
          OrderByField: sortProp,
          IsDesc: isAsc,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
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
            this.tableData = []
            this.pagination.total = 0
            this.$message.error('列表获取失败')
          })
          .finally(() => {
            this.tableLoading = false
          })
      },
      800,
      {
        leading: true
      }
    ),
    fetchOptions() {
      const { text, startTime, endTime } = this.filterForm
      getEventListScreen({
        companyId: this.companyId,
        projectId: this.projectId,
        nameTypeId: undefined,
        eventTypeId: undefined,
        triggerStartTime: startTime,
        triggerEndTime: endTime,
        sourceName: text,
        Status: undefined,
        OrderByField: undefined,
        IsDesc: undefined,
        PageSize: undefined,
        PageIndex: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            this.typeOptions = data.EventType.map(item => ({
              text: item.Name,
              value: item.Id
            }))
            this.eventOptions = data.NameType.map(item => ({
              text: item.Name,
              value: item.Id
            }))
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss">
.eventList {
  .el-input-group__append {
    background-color: #fff;
    padding: 0 10px;
  }
  .el-input-group__prepend {
    background-color: #fff;
    padding: 0 0px 0 15px;
    .el-cascader {
      line-height: 29px;
      .el-input__inner {
        padding: 0;
        border: none;
        height: 30px;
        line-height: 30px;
      }
    }
  }
}
</style>
