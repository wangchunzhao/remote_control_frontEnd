<template>
  <div class="point-target-box">
    <div class="box-title">
      已选中点位
    </div>
    <div class="table-tool-box">
      <el-button @click.native="handleClickWatchChart" size="small">
        查看曲线
      </el-button>
      <el-button
        v-if="handleDownloadPermisson()"
        @click.native="handleClickDownloadData"
        size="small"
      >
        数据下载
      </el-button>
      <el-button size="small" @click.native="handleClickDownloadStatistical">
        导出统计信息
      </el-button>
      <el-button
        @click.native="handleRemove"
        type="danger"
        style="float: right;"
        size="small"
      >
        移除选中
      </el-button>
    </div>

    <el-table
      :data="tableData"
      ref="table"
      style="width: 100%;"
      row-key="id"
      @filter-change="filterChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :reserve-selection="true" width="55" />
      <el-table-column
        column-key="ModelTreeName"
        prop="ModelTreeName"
        :filters="deviceOptions"
        label="设备"
      />
      <el-table-column prop="name" label="点位名称" />
      <el-table-column
        column-key="PointTypeId"
        prop="typeCn"
        :filters="pointTypeOptions"
        label="类型"
      />
      <el-table-column
        column-key="level"
        prop="level"
        :filters="levelOptions"
        label="等级"
      >
        <template slot-scope="{ row }">
          {{ levelMap[row.level] }}
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :pager-count="5"
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <DataDownloadDialog
      :pointIds="multipleSelection.map(item => item.id)"
      ref="dataDownloadDialog"
    />
    <HistoryDialog
      :pointIds="
        multipleSelection.length ? multipleSelection.map(item => item.id) : null
      "
      ref="historyDialog"
    />
    <StatisticalDialog
      :multipleSelection="multipleSelection"
      :pointIds="multipleSelection.map(item => item.id)"
      ref="statisticalDialog"
    />
  </div>
</template>

<script>
import DataDownloadDialog from './DataDownloadDialog'
import HistoryDialog from './HistoryDialog'
import StatisticalDialog from './StatisticalDialog'

export default {
  components: {
    DataDownloadDialog,
    HistoryDialog,
    StatisticalDialog
  },
  props: {
    listAdd: Array
  },
  data() {
    return {
      filterForm: {
        deviceIds: [],
        pointTypeIds: [],
        levels: []
      },
      deviceOptions: [],
      levelOptions: [
        { text: '一级测点', value: 1 },
        { text: '二级测点', value: 2 },
        { text: '三级测点', value: 3 }
      ],
      levelMap: {
        1: '一级测点',
        2: '二级测点',
        3: '三级测点'
      },
      pointTypeOptions: [],

      multipleSelection: [],
      tableSource: [],
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    platform() {
      return this.$store.state.permissions.platform
    },
    projectPermissions() {
      return this.$store.state.permissions.projectPermissions
    },
    companyPermissions() {
      return this.$store.state.permissions.companyPermissions
    }
  },
  watch: {
    listAdd(list) {
      const ids = this.tableSource.map(item => item.id)
      list = list.filter(item => !ids.includes(item.id))
      this.tableSource.unshift(...list)
      this.handleCurrentChange()

      // 选中刚添加的行
      this.$nextTick(() => {
        list.forEach(item => {
          this.$refs.table.toggleRowSelection(item, true)
        })
      })
    },
    tableSource(list) {
      let temp = []
      this.deviceOptions = []
      this.pointTypeOptions = []
      temp = uniqueArray(list, 'ModelTreeId')
      temp.forEach(item => {
        this.deviceOptions.push({
          text: item.ModelTreeName,
          value: item.ModelTreeId
        })
      })
      temp = uniqueArray(list, 'PointTypeId')
      temp.forEach(item => {
        this.pointTypeOptions.push({
          text: item.typeCn,
          value: item.PointTypeId
        })
      })
    }
  },
  methods: {
    // 查看曲线
    handleClickWatchChart() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一个点位')
        return false
      }
      if (this.multipleSelection.length > 10) {
        this.$message('最多可选10个点位')
        return false
      }
      const types = this.multipleSelection.map(item => item.PointTypeId)
      if ([...new Set(types)].length > 2) {
        this.$message('所选中的点位类型不能超过2种')
        return false
      }
      this.$refs.historyDialog.toggleDialog()
    },
    // 判断有没有下载数据的权限
    handleDownloadPermisson() {
      if (this.platform === PLATFORM.business) {
        return (
          this.projectPermissions.includes(111) ||
          this.projectPermissions.includes(112)
        )
      } else {
        return (
          this.companyPermissions.includes(103) ||
          this.companyPermissions.includes(104)
        )
      }
    },
    // 下载数据
    handleClickDownloadData() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一个点位')
        return false
      }
      if (this.multipleSelection.length > 100) {
        this.$message('最多可选100个点位')
        return false
      }
      this.$refs.dataDownloadDialog.openDialog()
    },
    // 导出统计数据
    handleClickDownloadStatistical() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一个点位')
        return false
      }
      if (this.multipleSelection.length > 100) {
        this.$message('最多可选100个点位')
        return false
      }
      this.$refs.statisticalDialog.openDialog()
    },
    // 删除选中
    handleRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一个点位')
        return false
      }
      const ids = this.multipleSelection.map(item => item.id)
      this.tableSource = this.tableSource.filter(item => !ids.includes(item.id))
      this.pagination.currentPage = 1
      this.handleCurrentChange()
      this.$refs.table.clearSelection()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.PointTypeId) {
        this.filterForm.pointTypeIds = filter.PointTypeId
      } else if (filter.ModelTreeName) {
        this.filterForm.deviceIds = filter.ModelTreeName
      } else if (filter.level) {
        this.filterForm.levels = filter.level
      }
      this.pagination.currentPage = 1
      this.handleCurrentChange()
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 分页
    handleCurrentChange() {
      const { size, currentPage } = this.pagination
      const { levels, pointTypeIds, deviceIds } = this.filterForm
      let list = []
      list = this.tableSource.filter(item => {
        let temp1 = true
        let temp2 = true
        let temp3 = true
        if (levels.length) {
          temp1 = levels.includes(item.level)
        }
        if (pointTypeIds.length) {
          temp2 = pointTypeIds.includes(item.PointTypeId)
        }
        if (deviceIds.length) {
          temp3 = deviceIds.includes(item.ModelTreeId)
        }
        return temp1 && temp2 && temp3
      })
      this.pagination.total = list.length
      this.tableData = list.slice(
        (currentPage - 1) * size,
        (currentPage - 1) * size + size
      )
    },
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.handleCurrentChange()
    }
  }
}
function uniqueArray(arr, prop) {
  let hash = {}
  return arr.reduce(function(item, next) {
    hash[next[prop]] ? '' : (hash[next[prop]] = true && item.push(next))
    return item
  }, [])
}
</script>

<style lang="scss" scoped>
.point-target-box {
  padding: 20px 16px;
  background-color: #fff;
  .box-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
    color: #3c3c3c;
  }
}
</style>
