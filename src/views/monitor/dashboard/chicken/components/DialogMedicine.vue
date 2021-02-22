<template>
  <el-dialog
    width="700px"
    :title="type === 'drinkMedicine' ? '饮药记录' : '免疫记录'"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div class="table-tool-box">
      <el-date-picker
        v-model="filterForm.dateRange"
        type="daterange"
        @change="fetchTableData"
        size="small"
        unlink-panels
        range-separator="至"
        style="width: 240px;"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
      >
      </el-date-picker>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      :max-height="300"
    >
      <el-table-column width="160" prop="date" sortable label="日期" />
      <el-table-column prop="content" label="内容">
        <template slot-scope="{ row }">
          <div v-html="row.content"></div>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
import { getHenhouseStrPointData } from '@/api/breed'
import dayjs from 'dayjs'

export default {
  props: {
    projectId: Number,
    deviceId: Number
  },
  data() {
    return {
      dialogVisible: false,
      type: '', // 'drinkMedicine' | 'immune'
      filterForm: {
        dateRange: [
          new Date(
            dayjs()
              .subtract(7, 'day')
              .format('YYYY-MM-DD')
          ),
          new Date()
        ]
      },

      tableLoading: false,
      tableData: [],

      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  methods: {
    openDialog(type) {
      this.dialogVisible = true
      this.type = type
      this.fetchTableData()
    },
    handleClose() {
      this.dialogVisible = false
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { dateRange } = this.filterForm
        getHenhouseStrPointData({
          projectId: this.projectId,
          mtid: this.deviceId,
          start: dayjs(dateRange[0]).format('YYYY-MM-DD'),
          end: dayjs(dateRange[1]).format('YYYY-MM-DD'),
          pointType: this.type
        })
          .then(res => {
            if (res.data.Code === 200 && res.data.Data) {
              let data = []
              res.data.Data.forEach(v => {
                data.push({
                  date: v.Key,
                  content: v.Value.replace(/\\n/g, '<br />')
                })
              })
              this.tableData = data
            } else {
              this.tableData = []
            }
          })
          .catch(err => {
            console.error(err)
            this.tableData = []
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
