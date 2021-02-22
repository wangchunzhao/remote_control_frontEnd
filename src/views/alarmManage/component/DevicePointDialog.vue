<template>
  <el-dialog
    width="850px"
    :title="currentDeviceName"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @filter-change="filterChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column prop="name" sortable="custom" label="点位名称" />
      <el-table-column
        column-key="typeCn"
        prop="typeCn"
        :filters="typeOptions"
        label="点位类型"
      >
        <template slot-scope="{ row }">
          {{ row.typeCn }}
        </template>
      </el-table-column>
      <el-table-column
        column-key="PointStatus"
        prop="PointStatus"
        :filters="[
          { text: '在线', value: 2 },
          { text: '离线', value: 1 },
          { text: '报警', value: 3 }
        ]"
        label="连接状态"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="
              row.PointStatus === 2
                ? 'primary'
                : row.PointStatus === 1
                ? 'info'
                : 'danger'
            "
            size="small"
          >
            {{
              row.PointStatus === 2
                ? '在线'
                : row.PointStatus === 1
                ? '离线'
                : row.PointStatus === 3
                ? '报警'
                : '报警'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="valuename" label="最新值">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="watchHistory(row)">
            {{ row.valuename }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        width="150"
        prop="updateTime"
        sortable="custom"
        label="更新时间"
      >
        <template slot-scope="{ row }">
          {{ _dateFormat(row.updateTime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column
        column-key="level"
        prop="level"
        :filters="[
          { text: '一级', value: 1 },
          { text: '二级', value: 2 },
          { text: '三级', value: 3 }
        ]"
        label="参数级别"
        width="100"
      >
        <template slot-scope="{ row }">
          {{ row.level === 1 ? '一级' : row.level === 2 ? '二级' : '三级' }}
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
    <span
      v-if="$route.name === 'alarmManageIndex'"
      slot="footer"
      class="dialog-footer"
    >
      <el-button type="primary" @click.native="handleWatchDevice"
        >查看设备</el-button
      >
    </span>
    <HistoryDialog
      appendToBody
      ref="historyDialog"
      :device-id="history.deviceId"
      :point-ids="history.point"
    />
  </el-dialog>
</template>

<script>
import HistoryDialog from '@/components/HistoryDialog'
import { queryPoint, queryPointTypeInDmpListDropdownList } from '@/api/model'
import debounce from 'lodash/debounce'
export default {
  components: {
    HistoryDialog
  },
  data() {
    return {
      dialogVisible: false,
      currentDeviceId: '',
      currentDeviceName: '',
      typeOptions: [],
      filterForm: {
        sortProp: undefined,
        isAsc: undefined,
        level: undefined,
        status: undefined,
        pointType: undefined
      },

      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      history: {
        point: null,
        deviceId: 0
      }
    }
  },
  methods: {
    openDialog({ id, name }) {
      this.dialogVisible = true
      this.currentDeviceId = id
      this.currentDeviceName = name
      this.fetchTableData()
      queryPointTypeInDmpListDropdownList({
        mtid: id,
        LevelList: undefined,
        pointTypeIdList: undefined,
        PointStatusList: undefined
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          data.forEach(item => {
            item.text = item.Value
            item.value = item.Key
          })
          this.typeOptions = data
        }
      })
    },
    handleWatchDevice() {
      this.dialogVisible = false
      const { name, path } = this.$route
      this.$router.push({
        name: 'devicePointList',
        query: {
          deviceName: this.currentDeviceName,
          mtid: this.currentDeviceId,
          from: name,
          path: path
        }
      })
    },
    handleClose() {
      this.pagination.currentPage = 1
      this.pagination.total = 0
      this.pagination.size = 10
      this.typeOptions = []
      this.dialogVisible = false
    },
    // 查看历史数据
    watchHistory(row) {
      this.history.point = [row.id]
      this.history.deviceId = row.ModelTreeId
      this.$refs.historyDialog.toggleDialog()
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'name') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'updateTime') {
        this.filterForm.sortProp = 1
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.level) {
        this.filterForm.level = filter.level
      } else if (filter.PointStatus) {
        this.filterForm.status = filter.PointStatus
      } else if (filter.typeCn) {
        this.filterForm.pointType = filter.typeCn
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
        const { sortProp, isAsc, level, pointType, status } = this.filterForm
        const { currentPage, size } = this.pagination
        queryPoint({
          mtid: this.currentDeviceId,
          LevelList: level,
          PointStatusList: status,
          area: undefined,
          name: '',
          stime: undefined,
          etime: undefined,
          typeCn: undefined,
          PointTypeIdList: pointType,
          alarmLevel: undefined,
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: currentPage,
          PageSize: size
        })
          .then(res => {
            if (res.data.Code === 200) {
              const data = res.data.Data
              this.tableData = data.Data
              this.pagination.total = data.TotalCount
            } else {
              this.tableData = []
              this.total = 0
            }
          })
          .catch(err => {
            console.error(err)
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
    //     let data = res.data
    //     if (data.Code === 200) {
    //       this.tableData = data.Data.Data
    //       this.pagination.total = data.Data.TotalCount
    //     } else {
    //       this.tableData = []
    //       this.pagination.total = 0
    //       this.$message.error('列表获取失败')
    //     }
    //   })
    //   .catch(err => {
    //     console.error(err)
    //     this.tableData = []
    //     this.pagination.total = 0
    //     this.$message.error('列表获取失败')
    //   })
    //   .finally(() => {
    //     this.tableLoading = false
    //   })
  }
}
</script>
