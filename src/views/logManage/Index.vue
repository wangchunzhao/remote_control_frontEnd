<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        :loading="exportLoading"
        @click.native="downTable"
        size="small"
        v-permission="[platform === 'BUSINESS' ? 79 : '*']"
        type="primary"
      >
        导出
      </el-button>
      <el-date-picker
        v-model="filterForm.timeRange"
        type="daterange"
        size="small"
        style="width: 250px;margin-left: 15px;"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      >
      </el-date-picker>
      <el-select
        v-model="filterForm.user"
        size="small"
        @change="fetchTableData"
        clearable
        filterable
        style="margin-left: 15px;"
        placeholder="所有成员"
      >
        <el-option
          v-for="item in userOptions"
          :key="item.Key"
          :label="item.Value"
          :value="item.Key"
        >
        </el-option>
      </el-select>
      <el-select
        v-model="filterForm.operationType"
        size="small"
        clearable
        @change="fetchTableData"
        multiple
        filterable
        collapse-tags
        style="margin-left: 15px;"
        placeholder="全部操作类型"
      >
        <el-option-group
          v-for="group in actionOptions"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="item in group.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-option-group>
      </el-select>
    </div>

    <el-table v-loading="tableLoading" :data="tableData" style="width: 100%;">
      <el-table-column min-width="60" prop="UserName" label="用户" />
      <el-table-column min-width="100" prop="Ip" label="IP" />
      <el-table-column min-width="70" prop="IpAddress" label="属地" />
      <el-table-column min-width="100" prop="LogModelActionName" label="操作" />
      <el-table-column
        min-width="160"
        show-overflow-tooltip
        prop="Content"
        label="内容"
      >
        <template slot-scope="{ row }">
          <el-link
            v-if="row.Url"
            @click.native="() => downloadSnopShot(row.Url)"
            :underline="false"
            type="primary"
            >{{ row.Content }}</el-link
          >
          <span v-else>{{ row.Content }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100" prop="ProjectName" label="项目" />
      <el-table-column min-width="100" prop="CreateTime" label="时间" />
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
import { getLogModelAndActionList, getLogPage, exportLogPage } from '@/api/log'
import { getCompanyUserDropdown } from '@/api/userSubarea'
import debounce from 'lodash/debounce'
import filesaver from 'file-saver'

export default {
  data() {
    return {
      filterForm: {
        timeRange: [
          new Date(Date.now() - 30 * 24 * 3600 * 1000) + 6000,
          new Date()
        ],
        user: undefined,
        operationType: [],
        sortProp: undefined,
        isAsc: undefined
      },
      exportLoading: false,
      userOptions: [],
      actionOptions: [],

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
    'filterForm.timeRange'() {
      this.fetchTableData()
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  mounted() {
    this.fetchTableData()

    getCompanyUserDropdown({
      companyId: this.companyId
    }).then(res => {
      if (res.data.Code === 200) {
        this.userOptions = res.data.Data
      }
    })
    getLogModelAndActionList().then(res => {
      if (res.data.Code === 200) {
        const options = []
        res.data.Data.forEach((item1, index1) => {
          options.push({
            label: item1.LogModelName,
            value: item1.LogModelId,
            options: []
          })
          item1.LogModelActionList.forEach(item2 => {
            options[index1].options.push({
              label: item2.LogModelActionName,
              value: item2.LogModelActionId
            })
          })
        })
        this.actionOptions = options
      }
    })
  },

  methods: {
    downTable() {
      this.exportLoading = true
      const { user, operationType, timeRange } = this.filterForm
      const { currentPage, size } = this.pagination

      let startTime = undefined
      let endTime = undefined
      if (timeRange) {
        startTime = this._dateFormat(timeRange[0], 'YYYY-MM-DD HH:mm')
        endTime = this._dateFormat(timeRange[1], 'YYYY-MM-DD HH:mm')
      }

      exportLogPage({
        CompanyId: this.companyId,
        StartTime: startTime,
        EndTime: endTime,
        UserId: user,
        LogModelId: undefined,
        LogModelActionId: operationType,
        PageSize: size,
        PageIndex: currentPage
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
          filesaver.saveAs(blob, '操作日志.xls')
        })
        .catch(err => {
          console.error(err)
          this.$message.error('日志导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },

    downloadSnopShot(urlString) {
      const urls = urlString.split(',')
      urls.forEach(url => {
        filesaver.saveAs(url)
      })
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
        const { user, operationType, timeRange } = this.filterForm
        const { currentPage, size } = this.pagination

        let startTime = undefined
        let endTime = undefined
        if (timeRange) {
          startTime = this._dateFormat(timeRange[0], 'YYYY-MM-DD HH:mm:ss')
          endTime = this._dateFormat(timeRange[1], 'YYYY-MM-DD HH:mm:ss')
        }

        getLogPage({
          CompanyId: this.companyId,
          StartTime: startTime,
          EndTime: endTime,
          UserId: user,
          LogModelId: undefined,
          ProjectId: this.platform === 'BUSINESS' ? this.projectId : undefined,
          LogModelActionId: operationType,
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
      1000,
      {
        leading: true
      }
    )
  }
}
</script>

<style lang="scss" scoped></style>
