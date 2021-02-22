<template>
  <el-dialog
    width="600px"
    :title="title || '-'"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-table v-loading="tableLoading" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column label="点位名称">
        <template slot-scope="{ row }">
          {{ row.sensorName }}
        </template>
      </el-table-column>
      <el-table-column label="小数位">
        <template slot-scope="{ row }">
          {{ row.Decimal }}
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
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <span slot="footer">
      <el-button
        :disabled="moduleInfo.UserId !== this.userId"
        @click.native="handleEdit"
        size="medium"
        type="primary"
        >编辑从站设备</el-button
      >
    </span>
    <DialogPointEdit ref="dialogPointEdit" />
  </el-dialog>
</template>

<script>
import { getDeviceModulePointList } from '@/api/deviceModule'
import { Decrypt } from '@/utils/secret'
import DialogPointEdit from '../../component/DialogPointEdit'

export default {
  components: {
    DialogPointEdit
  },
  data() {
    return {
      tableLoading: false,
      tableDataSource: [],
      title: '',
      moduleInfo: {},
      dialogVisible: false,
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    tableData() {
      return this.tableDataSource.slice(
        (this.pagination.currentPage - 1) * this.pagination.size,
        (this.pagination.currentPage - 1) * this.pagination.size +
          this.pagination.size
      )
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  methods: {
    openDialog(info) {
      this.moduleInfo = info
      this.title = info.DeviceModuleName
      this.dialogVisible = true
      this.tableLoading = true
      this.fetchPointList()
    },
    handleEdit() {
      this.$refs.dialogPointEdit.openDialog({
        id: this.moduleInfo.DeviceModuleId,
        name: this.title
      })
    },
    // 分页
    handleCurrentChange() {},
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
    },
    handleClose() {
      this.dialogVisible = false
    },
    fetchPointList() {
      getDeviceModulePointList({
        deviceModuleId: this.moduleInfo.DeviceModuleId,
        isGetAll: false
      })
        .then(res => {
          if (res.data.Code == 200) {
            this.tableDataSource = JSON.parse(Decrypt(res.data.Data))
            this.pagination.total = this.tableDataSource.length
          } else {
            this.$message.error('从站设备点位获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('从站设备点位获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>
