<template>
  <el-dialog
    width="1100px"
    title="原始数据"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div class="table-tool-box">
      <el-date-picker
        v-model="filterForm.dateRange"
        size="small"
        :clearable="false"
        type="datetimerange"
        value-format="yyyy-MM-dd HH:mm"
        format="yyyy-MM-dd HH:mm"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleDateChange"
        style="margin-right: 15px;width: 310px"
      >
      </el-date-picker>
      <el-button
        :loading="exportLoading"
        @click.native="handleExport"
        size="small"
        type="primary"
      >
        导 出
      </el-button>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      @sort-change="sortChange"
      style="width: 100%;"
    >
      <el-table-column width="130" prop="id" label="编号" />
      <el-table-column
        width="160"
        sortable="custom"
        prop="rTime"
        label="记录时间"
      >
        <template slot-scope="{ row }">
          {{ row.rTime ? _dateFormat(row.rTime, 'YYYY-MM-DD HH:mm:ss') : '-' }}
        </template>
      </el-table-column>
      <el-table-column width="160" prop="uTime" label="上传时间">
        <template slot-scope="{ row }">
          {{ row.uTime ? _dateFormat(row.uTime, 'YYYY-MM-DD HH:mm:ss') : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="tValue" label="温度°C" />
      <el-table-column prop="hValue" label="湿度%" />
      <el-table-column prop="voltage" label="电压V" />
      <el-table-column prop="battery" label="电量%" />
      <el-table-column width="120" prop="mac" label="MAC地址" />
      <el-table-column prop="rssi" label="信号强度" />
      <el-table-column prop="cycle" label="续传间隔" />
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
  </el-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
import { saveAs } from 'file-saver'
import {
  getOriginalSensorHistList,
  downOriginalSensorHistList
} from '@/api/device_new'
import dayjs from 'dayjs'
export default {
  data() {
    return {
      dialogVisible: false,
      exportLoading: false,

      filterForm: {
        id: '',
        isAsc: undefined,
        dateRange: ''
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
  methods: {
    openDialog(row) {
      this.dialogVisible = true
      this.filterForm.id = row.Sensor && row.Sensor.id ? row.Sensor.id : ''
      this.filterForm.dateRange = [
        dayjs()
          .subtract(1, 'day')
          .format('YYYY-MM-DD HH:mm'),
        dayjs().format('YYYY-MM-DD HH:mm')
      ]
      this.fetchTableData()
    },
    handleClose() {
      this.dialogVisible = false
      this.pagination.total = 0
      this.pagination.currentPage = 1
    },
    handleDateChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格排序
    sortChange(t) {
      this.filterForm.isAsc = 'ascending' === t.order
      this.fetchTableData()
    },
    handleExport() {
      if (this.pagination.total === 0) {
        this.$message.error('暂无数据可导出')
        return
      }
      this.exportLoading = true
      const { dateRange, id, isAsc } = this.filterForm
      downOriginalSensorHistList({
        SensorId: id,
        StartTime: dateRange[0],
        EndTime: dateRange[1],
        PageSize: 1000,
        IsAsc: isAsc,
        PageIndex: 1,
        Export: {
          IsExport: true,
          ColumnList: [
            {
              Title: '编号',
              Field: 'id'
            },
            {
              Title: '记录时间',
              DateTimeFormat: 'yyyy-MM-dd HH:mm',
              Field: 'rTime'
            },
            {
              Title: '上传时间',
              DateTimeFormat: 'yyyy-MM-dd HH:mm',
              Field: 'uTime'
            },
            {
              Title: '温度°C',
              Field: 'tValue'
            },
            {
              Title: '湿度%',
              Field: 'hValue'
            },
            {
              Title: '电压V',
              Field: 'voltage'
            },
            {
              Title: '电量%',
              Field: 'battery'
            },
            {
              Title: 'MAC地址',
              Field: 'mac'
            },
            {
              Title: '信号强度',
              Field: 'rssi'
            },
            {
              Title: '续传间隔',
              Field: 'cycle'
            }
          ]
        }
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
          saveAs(blob, `${id}传感器原始数据.xls`)
        })
        .catch(err => {
          console.error(err)
          this.$message.error('导出失败')
        })
        .finally(() => {
          this.exportLoading = false
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
        const { dateRange, isAsc, id } = this.filterForm
        const { currentPage, size } = this.pagination
        getOriginalSensorHistList({
          SensorId: id,
          StartTime: dateRange[0],
          EndTime: dateRange[1],
          IsAsc: isAsc,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            if (currentPage === this.pagination.currentPage) {
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
            if (currentPage === this.pagination.currentPage) {
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
