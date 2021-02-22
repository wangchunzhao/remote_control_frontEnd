<template>
  <el-dialog
    v-loading="loading"
    element-loading-text="加载中..."
    :title="moduleName"
    :visible.sync="dialogVisible"
    width="1000px"
    :append-to-body="true"
    @close="dialogClose"
  >
    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" width="50" />
      <el-table-column label="点位名称">
        <template slot-scope="{ row }">
          {{ row.sensorName }}
        </template>
      </el-table-column>
      <el-table-column label="点位类型">
        <template slot-scope="{ row }">
          {{ getPointTypeLabel(row.sensorTypeId) }}
        </template>
      </el-table-column>
      <el-table-column label="小数位">
        <template slot-scope="{ row }">
          {{ row.decimal }}
        </template>
      </el-table-column>
      <el-table-column label="单位">
        <template slot-scope="{ row }">
          {{ row.unit }}
        </template>
      </el-table-column>
      <el-table-column label="采集周期/s">
        <template slot-scope="{ row }">
          {{ row.cycle }}
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
  </el-dialog>
</template>

<script>
import { getDeviceModule } from '@/api/deviceModule'
import { fetchPointTypeList } from '@/api/pointType'
import { Decrypt } from '@/utils/secret'

export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      moduleName: '',
      tableSource: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      pointTypeOptions: []
    }
  },
  computed: {
    tableData() {
      return this.tableSource.slice(
        (this.pagination.currentPage - 1) * this.pagination.size,
        (this.pagination.currentPage - 1) * this.pagination.size +
          this.pagination.size
      )
    }
  },
  mounted() {
    fetchPointTypeList(0)
      .then(res => {
        const data = res.data.Data
        this.pointTypeOptions = [
          {
            label: '状态量',
            options: data.State
          },
          {
            label: '模拟量',
            options: data.Analog
          }
        ]
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    openDialog(id) {
      this.dialogVisible = true
      this.loading = true
      getDeviceModule({
        deviceModuleId: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.moduleName = data.DeviceModuleName
            this.tableSource = JSON.parse(Decrypt(data.ModuleContent))
            this.pagination.total = this.tableSource.length
          } else {
            this.$message.error(res.data.Message)
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('模块信息获取失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 分页
    handleCurrentChange() {
      // this.fetchTableData()
    },
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
    },
    // 获取点位类型的文字描述
    getPointTypeLabel(id) {
      let label = ''
      this.pointTypeOptions[0].options.forEach(item => {
        if (item.ID === id) {
          label = item.TypeName
        }
      })
      this.pointTypeOptions[1].options.forEach(item => {
        if (item.ID === id) {
          label = item.TypeName
        }
      })
      return label
    },
    dialogClose() {
      this.tableSource = []
      this.moduleName = ''
    }
  }
}
</script>
