<template>
  <div class="page-box">
    <el-table
      ref="table"
      v-loading="Loading"
      :data="List"
      class="asset-table"
      style="width: 100%"
      show-overflow-tooltip
    >
      <el-table-column label="维修单号" min-width="270">
        <template slot-scope="scope">
          <span>{{ scope.row.RepairOrder }}</span>
          <el-tag
            style="margin-left: 10px;"
            :class="{
              noSubmit: scope.row.Status == -1,
              noAcceptance: scope.row.Status == 0,
              noDivision: scope.row.Status == 1,
              noAccept: scope.row.Status == 2,
              repairing: scope.row.Status == 3,
              noCheck: scope.row.Status == 4,
              haveDone: scope.row.Status > 4
            }"
            :type="
              scope.row.Status == -1
                ? 'warning'
                : scope.row.Status == 0
                ? 'danger'
                : scope.row.Status == 1
                ? 'warning'
                : scope.row.Status == 2
                ? ''
                : scope.row.Status == 3
                ? 'success'
                : scope.row.Status == 4
                ? 'warning'
                : ''
            "
            size="small"
          >
            {{
              scope.row.Status == -1
                ? '待提交'
                : scope.row.Status == 0
                ? '待受理'
                : scope.row.Status == 1
                ? '待派工'
                : scope.row.Status == 2
                ? '待接单'
                : scope.row.Status == 3
                ? '维修中'
                : scope.row.Status == 4
                ? '待验收'
                : '已维修'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="FaultContent" label="报修内容" />
      <el-table-column prop="ApplicantName" label="报修人" />
      <el-table-column prop="CreateTime" label="报修时间" width="180" />
      <el-table-column prop="RepairUserName" label="受理人" />
    </el-table>
    <el-pagination
      background
      :current-page.sync="pagination.currentPage"
      :page-size.sync="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script>
import { getNewRepairActivePage } from '@/api/newRepairActive'

export default {
  name: 'AlarmList',
  data() {
    return {
      id: '',
      Loading: false,
      List: [],
      pagination: {
        currentPage: 1,
        total: 0,
        pageSize: 10
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    fetchData(id) {
      this.id = id
      this.pagination = {
        currentPage: 1,
        total: 0,
        pageSize: 10
      }
      this.fetchAssetList()
    },
    // 页面跳转
    handleCurrentChange() {
      this.fetchAssetList()
    },
    // 修改每页显示的数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchAssetList()
    },
    fetchAssetList() {
      this.Loading = true
      const { currentPage, pageSize } = this.pagination
      getNewRepairActivePage({
        CompanyId: this.companyId,
        EquipmentId: this.id,
        pageSize: pageSize,
        pageIndex: currentPage
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.List = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.$message.error('维修列表加载失败')
          }
        })
        .catch(err => {
          this.$message.error('维修列表加载失败')
          console.error(err)
        })
        .finally(() => {
          this.Loading = false
        })
    }
  }
}
</script>

<style scoped>
.page-box {
  max-width: 1710px;
  margin: 24px auto 24px auto;
  background: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
