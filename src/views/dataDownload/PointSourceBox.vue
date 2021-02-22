<template>
  <div class="point-source-box">
    <div class="box-title">
      点位池
    </div>
    <div class="table-tool-box">
      <el-select
        v-model="filterForm.project"
        placeholder="请选择"
        size="small"
        v-if="platform === 'DATA_ANALYSIS'"
        filterable
        style="width: 180px;"
        @change="changeProject"
      >
        <el-option
          v-for="item in projectList"
          :key="item.id"
          :value="item.id"
          :label="item.label"
        />
      </el-select>
      <el-select
        v-model="filterForm.system"
        placeholder="请选择"
        size="small"
        clearable
        @change="changeSystem"
        filterable
        style="margin-left: 10px;width: 120px;"
      >
        <el-option
          v-for="item in systemOptions"
          :key="item.BigTypeId"
          :value="item.BigTypeId"
          :label="item.name"
        />
      </el-select>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        style="width: 120px;margin-left: 10px;"
        placeholder="点位名称"
        suffix-icon="el-icon-search"
      />
      <el-button
        @click.native="handleAdd"
        type="primary"
        style="float: right;"
        size="small"
      >
        添加至选中
      </el-button>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      ref="table"
      style="width: 100%;"
      row-key="id"
      @filter-change="filterChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column :reserve-selection="true" type="selection" width="55" />
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
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import {
  getModelListByProject,
  queryPoint,
  getModelTreeAndPointTypeDropdown
} from '@/api/model'
export default {
  data() {
    return {
      filterForm: {
        text: '',
        project: undefined,
        system: undefined,
        deviceIds: undefined,
        pointTypeIds: undefined,
        levels: undefined
      },
      systemOptions: [],
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
      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    projectList() {
      return [...this.$store.state.app.proList]
    },
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
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    'filterForm.project': {
      handler: function(val) {
        this.filterForm.system = undefined
        this.systemOptions = []
        this.fetchOptions()
        this.fetchTableData()
        getModelListByProject({
          projectId: val
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.systemOptions = res.data.Data
            } else {
              this.systemOptions = []
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    projectId: {
      handler: function(val) {
        // 赋值后会触发 watch-filterForm.project
        this.filterForm.project = val
      },
      immediate: true
    }
  },
  methods: {
    // 添加到选中
    handleAdd() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一个点位')
        return false
      }
      this.$emit('change', this.multipleSelection)
      this.$refs.table.clearSelection()
    },
    changeProject() {
      this.systemOptions = []
      this.$refs.table.clearSelection()
      this.filterForm.system = undefined
      this.filterForm.deviceIds = undefined
      this.filterForm.pointTypeIds = undefined
      this.$refs.table.clearFilter()
      this.deviceOptions = []
      this.pointTypeOptions = []
    },
    changeSystem() {
      this.pagination.currentPage = 1
      this.fetchTableData()
      this.$refs.table.clearSelection()
      this.fetchOptions()
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
    fetchTableData: debounce(function() {
      this.tableLoading = true
      const {
        text,
        system,
        project,
        pointTypeIds,
        deviceIds,
        levels
      } = this.filterForm
      const { currentPage, size } = this.pagination
      queryPoint({
        mtid: undefined,
        mtidList: deviceIds,
        BigTypeId: system,
        ProjectId: project,
        LevelList: levels,
        PointStatusList: undefined,
        PointTypeIdList: pointTypeIds,
        area: undefined,
        name: text,
        stime: undefined,
        etime: undefined,
        typeCn: undefined,
        alarmLevel: undefined,
        SortType: undefined,
        IsAsc: undefined,
        PageIndex: currentPage,
        PageSize: size
      })
        .then(res => {
          if (currentPage === this.pagination.currentPage) {
            let data = res.data
            if (data.Code === 200) {
              this.tableData = data.Data.Data
              this.pagination.total = data.Data.TotalCount
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
    }, 400),
    fetchOptions() {
      this.deviceOptions = []
      this.pointTypeOptions = []
      const { project, system } = this.filterForm
      getModelTreeAndPointTypeDropdown({
        projectId: project,
        bigTypeId: system
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            if (data === null) {
              this.pointTypeOptions = []
              return false
            }
            this.pointTypeOptions = data.PointTypeDropdown
            this.pointTypeOptions.forEach(item => {
              item.text = item.Value
              item.value = item.Key
            })
            this.deviceOptions = data.ModelTreeDropdown
            this.deviceOptions.forEach(item => {
              item.text = item.Value
              item.value = item.Key
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.point-source-box {
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
