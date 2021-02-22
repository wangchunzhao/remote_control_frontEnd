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
      <el-table-column min-width="110" prop="PointName" label="点位" />
      <el-table-column prop="Level" min-width="80" label="报警等级">
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :type="
              row.Level === 3
                ? 'primary'
                : row.Level === 4
                ? 'info'
                : row.Level === 2
                ? 'warning'
                : 'danger'
            "
          >
            {{
              row.Level === 1
                ? '紧急'
                : row.Level === 2
                ? '重要'
                : row.Level === 3
                ? '一般'
                : '记录'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="AlarmType" min-width="90" label="报警类型" />
      <el-table-column
        prop="Acttime"
        min-width="135"
        label="触发时间"
      >
        <template slot-scope="{ row }">
          {{ _dateFormat(row.Acttime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
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
import { getAlarmClear } from '@/api/alarmActive'

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
      getAlarmClear({
        companyId: this.companyId,
        Mtid: this.id,
        page: currentPage,
        num: pageSize
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.List = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.$message.error('报警列表加载失败')
          }
        })
        .catch(err => {
          this.$message.error('报警列表加载失败')
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
