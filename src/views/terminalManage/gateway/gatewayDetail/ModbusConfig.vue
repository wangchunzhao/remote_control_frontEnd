<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        @click.native="() => $refs.moduleAddDialog.openDialog()"
        type="primary"
        size="small"
      >
        添加从站设备
      </el-button>
      <el-button
        @click.native="() => $refs.dialogCreateModule.openDialog()"
        size="small"
        plain
      >
        创建从站设备
      </el-button>
      <el-button
        size="small"
        @click.native="() => $refs.templateAddDialog.openDialog()"
        plain
      >
        添加组合模板
      </el-button>
      <el-button
        size="small"
        @click.native="() => $refs.dialogSaveAsTemplate.openDialog()"
        plain
      >
        保存为组合模板
      </el-button>
      <el-button
        @click.native="handleBatchDelete"
        size="small"
        type="danger"
        plain
      >
        批量删除
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="查找从站设备名称"
        suffix-icon="el-icon-search"
      />
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
      @filter-change="filterChange"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="设备名称"
        prop="DeviceModuleName"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column label="从站地址" prop="Address" sortable="custom">
      </el-table-column>
      <el-table-column
        column-key="ModuleType"
        prop="ModuleType"
        :filters="[{ text: '自定义', value: 0 }, { text: '系统', value: 1 }]"
        label="模板类型"
      >
        <template slot-scope="{ row }">
          {{ row.ModuleType === 0 ? '自定义' : '系统' }}
        </template>
      </el-table-column>
      <el-table-column label="最近更新时间" prop="UpdateTime" sortable="custom">
        <template slot-scope="{ row }">
          {{ _dateFormat(row.UpdateTime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column label="点位数量" prop="PointNum" sortable="custom">
      </el-table-column>
      <el-table-column label="操作" width="230">
        <template slot-scope="{ row }">
          <el-link
            @click.native="() => $refs.dialogModuleDetail.openDialog(row)"
            :underline="false"
            type="primary"
            size="mini"
          >
            查看
          </el-link>
          <el-link
            :underline="false"
            @click.native="() => handleDelete(row)"
            size="mini"
            type="danger"
          >
            删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="pagination.total > 0"
      :total="pagination.total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      @pagination="fetchTableData"
    />
    <ModuleAddDialog
      @change="list => addByModule(list)"
      ref="moduleAddDialog"
      :projectId="gatewayInfo.ProjectID"
      :exist-modules="tableData"
    />
    <TemplateAddDialog
      @change="list => addByTemplate(list)"
      ref="templateAddDialog"
    />
    <DialogSaveAsTemplate :list="tableData" ref="dialogSaveAsTemplate" />
    <DialogCreateModule
      @change="list => addByModule(list)"
      :gatewayInfo="gatewayInfo"
      ref="dialogCreateModule"
    />
    <DialogModuleDetail ref="dialogModuleDetail" />
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import ModuleAddDialog from '../component/ModuleAddDialog'
import TemplateAddDialog from '../component/TemplateAddDialog'
import DialogSaveAsTemplate from './component/DialogSaveAsTemplate'
import DialogCreateModule from './component/DialogCreateModule'
import DialogModuleDetail from './component/DialogModuleDetail'
import {
  getModbusDeviceModulePage,
  updateDevicesNEWModbus
} from '@/api/device_new'
export default {
  props: {
    gatewayInfo: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  components: {
    DialogCreateModule,
    Pagination,
    ModuleAddDialog,
    TemplateAddDialog,
    DialogSaveAsTemplate,
    DialogModuleDetail
  },
  data() {
    return {
      tableData: [],
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      multipleSelection: [],
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        typeIds: []
      },
      downloadLoading: false
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.page = 1
      this.fetchTableData()
    },
    'gatewayInfo.id': {
      handler: function() {
        this.fetchTableData()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 表格排序
     */
    sortChange(val) {
      const { prop, order } = val
      this.filterForm.sortProp = prop
      this.filterForm.isAsc = order === 'ascending'
      this.fetchTableData()
    },
    /**
     * 表格筛选
     */
    filterChange(filter) {
      if (filter.ModuleType) {
        this.filterForm.typeIds = filter.ModuleType
      }
      this.fetchTableData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleBatchDelete() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项要删除的从站设备')
        return
      }
      this.$confirm(`确认要删除选中的从站设备?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const selected = this.multipleSelection.map(
            v => `${v.Address}-${v.DeviceModuleId}`
          )
          this.updateConfig(
            this.tableData.filter(
              v =>
                !selected.find(vv => `${v.Address}-${v.DeviceModuleId}` === vv)
            )
          )
        })
        .catch(() => {})
    },
    handleDelete(row) {
      this.$confirm(`确认要删除从站设备：${row.DeviceModuleName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.updateConfig(
            this.tableData.filter(
              v =>
                `${v.Address}-${v.DeviceModuleId}` !==
                `${row.Address}-${row.DeviceModuleId}`
            )
          )
        })
        .catch(() => {})
    },
    async addByModule(list) {
      try {
        const beforeList = await this.getAllModuleList()
        this.updateConfig([...list, ...beforeList])
      } catch (err) {
        console.error(err)
        this.$message.error('添加失败')
      }
    },
    async addByTemplate(list) {
      try {
        const beforeList = await this.getAllModuleList()
        this.updateConfig([...list, ...beforeList])
      } catch (err) {
        console.error(err)
        this.$message.error('添加失败')
      }
    },
    /** 获取所有 ModuleList */
    getAllModuleList() {
      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await getModbusDeviceModulePage({
            DeviceId: this.gatewayInfo.id,
            DeviceModuleName: '',
            ModuleTypeList: undefined,
            SortType: undefined,
            IsAsc: undefined,
            PageIndex: 1,
            PageSize: undefined
          })
          if (data.Code === 200) {
            resolve(data.Data.Data)
          } else {
            reject(new Error('列表获取失败'))
          }
        } catch (err) {
          console.error(err)
          reject(err)
        }
      })
    },
    updateConfig(list) {
      if (
        Array.from(new Set(list.map(v => `${v.Address}-${v.DeviceModuleId}`)))
          .length !== list.length
      ) {
        this.$message('同一从站设备不可以有相同的从站地址, 请修改')
        return
      }
      this.tableLoading = true
      const { DeviceId, DESCRIBES, DeviceName } = this.gatewayInfo
      updateDevicesNEWModbus({
        DeviceModuleAndAddressList: list,
        DeletePointIdList: [],
        CustomPointIdList: [],
        // 添加或者修改类型 0:自定义点位添加 1:模块添加
        AddOrUpdateModbusDeviceType: 1,
        deviceId: DeviceId,
        remark: DESCRIBES,
        deviceName: DeviceName
      })
        .then(res => {
          if (res.data.Code === 200 && res.data.Data.IsSuccess) {
            this.$message.success('网关配置成功')
            this.fetchTableData()
          } else {
            this.$message.error('网关配置失败')
            this.tableLoading = false
          }
        })
        .catch(err => {
          console.error(err)
          this.tableLoading = false
        })
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { text, sortProp, isAsc, typeIds } = this.filterForm
        const { page, limit } = this.pagination
        getModbusDeviceModulePage({
          DeviceId: this.gatewayInfo.id,
          DeviceModuleName: text,
          ModuleTypeList: typeIds,
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: page,
          PageSize: limit
        })
          .then(res => {
            if (
              page === this.pagination.page &&
              text === this.filterForm.text
            ) {
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
            if (
              page === this.pagination.page &&
              text === this.filterForm.text
            ) {
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
