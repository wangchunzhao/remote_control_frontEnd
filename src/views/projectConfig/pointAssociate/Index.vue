<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        @click.native="handleClickEditProp"
        size="small"
        type="primary"
        v-permission="[99]"
      >
        变更点位属性
      </el-button>
      <el-button
        @click.native="handleClickAssociate"
        size="small"
        type="primary"
        v-permission="[99]"
      >
        点位关联
      </el-button>
      <el-tooltip class="item" effect="dark" placement="top">
        <div slot="content" style="line-height: 18px;">
          选择未关联设备的点位，由<br />
          系统自动生成设备并关联
        </div>
        <el-button
          @click.native="handleClickGenerageDevice"
          size="small"
          type="primary"
          v-permission="[99]"
        >
          批量生成设备
        </el-button>
      </el-tooltip>
      <el-button
        @click.native="() => handleCancelAssociate('device')"
        size="small"
        :loading="deviceCancelLoading"
        v-permission="[99]"
      >
        取消设备关联
      </el-button>
      <el-button
        @click.native="() => handleCancelAssociate('area')"
        :loading="areaCancelLoading"
        size="small"
        v-permission="[99]"
      >
        取消区域关联
      </el-button>

      <div style="float: right;">
        <el-badge
          :hidden="
            !filterForm.source.length &&
              !filterForm.devices.length &&
              !filterForm.types.length &&
              !filterForm.levels.length &&
              !filterForm.associateDevices.length &&
              !filterForm.associateArea.length &&
              !filterForm.isAlarmConfig
          "
          is-dot
          class="item"
          style="margin-top: 10px;"
        >
          <el-button
            @click.native="() => $refs.filterDialog.openDialog()"
            type="text"
            style="padding: 0;"
            >筛选<i class="el-icon-arrow-down"></i
          ></el-button>
        </el-badge>

        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="margin-left: 25px;"
          class="filter-input"
          placeholder="搜索点位名称"
          suffix-icon="el-icon-search"
        />
      </div>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="DeviceName" label="数据网关" />
      <el-table-column prop="Name" label="原始设备名称" />
      <el-table-column prop="PointName" label="点位名称" />
      <el-table-column prop="PointTypeName" label="类型" width="130" />
      <el-table-column prop="Unit" label="单位" width="70">
        <template slot-scope="{ row }">
          {{ row.Unit || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="Level" label="等级" width="60">
        <template slot-scope="{ row }">
          {{ levelOptions[row.Level] }}
        </template>
      </el-table-column>
      <el-table-column prop="ValueName" label="最新值" width="70">
        <template slot-scope="{ row }">
          <el-link
            @click.native="handleWatchHistory(row)"
            type="primary"
            :underline="false"
            >{{ row.ValueName }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="UpdateDateTime"
        sortable="custom"
        width="140"
        label="更新时间"
      >
        <template slot-scope="{ row }">
          {{ _dateFormat(row.UpdateDateTime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column prop="ModelTreeList" label="已关联设备">
        <template slot-scope="{ row }">
          {{ row.ModelTreeList.map(item => item.Value).join(',') }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="已关联区域">
        <template slot-scope="{ row }">
          {{ row.LocationTreeList.map(item => item.Value).join(',') }}
        </template>
      </el-table-column>
      <el-table-column prop="IsSetAlarm" width="85" label="报警配置">
        <template slot-scope="{ row }">
          <el-tag
            @click.native="handleWatchStorage(row)"
            size="mini"
            style="cursor: pointer;"
            :type="row.IsSetAlarm ? 'success' : 'info'"
          >
            {{ row.IsSetAlarm ? '已配置' : '未配置' }}
          </el-tag>
        </template>
      </el-table-column>
      <template slot="empty">
        <div style="padding: 50px;line-height: 25px;">
          <div>点击池暂无点位</div>
          <div
            style="display: flex;align-item: center;justify-content: center;"
          >
            前往&nbsp;<el-link
              type="primary"
              style="font-weight: normal;"
              @click="() => $router.push('/terminalManage/gateway')"
              :underline="false"
            >
              终端管理 </el-link
            >&nbsp;配置数据导入
          </div>
        </div>
      </template>
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
    <FilterDialog @change="handleFilter" ref="filterDialog" />
    <EditPropDialog
      @refresh="fetchTableData"
      :point-ids="multipleSelection.map(item => item.PointId)"
      ref="editPropDialog"
    />
    <PointAssociateDialog
      @refresh="fetchTableData"
      :point-ids="multipleSelection.map(item => item.PointId)"
      ref="pointAssociateDialog"
    />
    <GenerateDeviceDialog
      @refresh="fetchTableData"
      :points="multipleSelection"
      ref="generateDeviceDialog"
    />
    <AlarmStorageDialog ref="alarmStorageDialog" />
    <HistoryDialog
      :pointIds="history.point"
      :showRelatePointDisabled="true"
      :device-id="history.deviceId"
      ref="historyDialog"
    />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import FilterDialog from './FilterDialog'
import EditPropDialog from './EditPropDialog'
import PointAssociateDialog from './PointAssociateDialog'
import GenerateDeviceDialog from './generateDeviceDialog/Index'
import HistoryDialog from '@/components/HistoryDialog'
import AlarmStorageDialog from './AlarmStorageDialog'
import {
  getPointPage,
  pointCancelRelevanceModelTreeOrLocation
} from '@/api/point'

export default {
  name: 'ProjectConfig_PointAssociate',
  components: {
    FilterDialog,
    EditPropDialog,
    PointAssociateDialog,
    GenerateDeviceDialog,
    AlarmStorageDialog,
    HistoryDialog
  },
  data() {
    return {
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        source: [],
        devices: [],
        types: [],
        levels: [],
        associateDevices: [],
        associateArea: [],
        isAlarmConfig: undefined
      },

      multipleSelection: [],
      deviceCancelLoading: false,
      areaCancelLoading: false,
      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      history: {
        deviceId: 0,
        point: null
      },
      levelOptions: {
        1: '一级',
        2: '二级',
        3: '三级'
      }
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    handleClickEditProp() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$refs.editPropDialog.openDialog()
    },
    handleClickAssociate() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$refs.pointAssociateDialog.openDialog()
    },
    handleClickGenerageDevice() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      if (
        this.multipleSelection.filter(item => item.ModelTreeList.length).length
      ) {
        this.$message('所选点位中包含已关联设备的点位，请重新选择')
        return false
      }
      this.$refs.generateDeviceDialog.openDialog()
    },
    // 取消关联
    handleCancelAssociate(type) {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return
      }

      if (type === 'device') {
        this.deviceCancelLoading = true
      } else {
        this.areaCancelLoading = true
      }
      pointCancelRelevanceModelTreeOrLocation({
        pointIdList: this.multipleSelection.map(item => item.PointId),
        cancelType: type === 'device' ? 0 : 1
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('操作成功')
            this.fetchTableData()
          } else {
            this.$message.error(res.data.Message)
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.deviceCancelLoading = false
          this.areaCancelLoading = false
        })
    },
    handleWatchStorage(row) {
      if (!row.IsSetAlarm) {
        this.$message('当前点位未配置报警策略')
        return false
      }
      this.$refs.alarmStorageDialog.openDialog(row.PointId)
    },
    handleWatchHistory(row) {
      this.history.point = [row.PointId]
      this.$refs.historyDialog.toggleDialog()
    },
    handleFilter(filters) {
      Object.assign(this.filterForm, filters)
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'UpdateDateTime') {
        this.filterForm.sortProp = 0
      }
      this.filterForm.isAsc = val.order === 'ascending'
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
        const {
          text,
          sortProp,
          isAsc,
          source,
          devices,
          types,
          levels,
          associateDevices,
          associateArea,
          isAlarmConfig
        } = this.filterForm
        const { currentPage, size } = this.pagination
        getPointPage({
          ProjectId: this.projectId,
          PointName: text,
          DeviceIdList: source,
          NameList: devices,
          PointTypeIdList: types,
          LevelList: levels,
          ModelTreeIdList: associateDevices,
          LocationIdList: associateArea,
          IsSetAlarm: isAlarmConfig,
          SortType: sortProp,
          IsAsc: isAsc,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            if (
              this.pagination.currentPage !== currentPage ||
              this.pagination.size !== size ||
              this.filterForm.text !== text
            ) {
              return
            }
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
            if (
              this.pagination.currentPage !== currentPage ||
              this.pagination.size !== size ||
              this.filterForm.text !== text
            ) {
              return
            }
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
