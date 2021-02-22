<template>
  <div class="device-manage content-box">
    <el-popover
      v-model="cascaderVisible"
      placement="bottom-start"
      trigger="click"
    >
      <el-cascader-panel
        ref="cascader"
        style="width: 100%"
        :options="subareaOptions"
        :show-all-levels="false"
        @change="subareaChange"
        :props="{
          children: 'Children',
          label: 'SubareaName',
          value: 'SubareaId',
          emitPath: false,
          multiple: false,
          checkStrictly: true
        }"
      >
        <span slot-scope="{ data }" class="custom-tree-node">
          <c-svg
            :name="
              data.Remark === '项目' ? 'location-fill' : 'folder-open-fill'
            "
            :style="{
              color: data.Remark === '项目' ? '#909399' : '#5AC8FA'
            }"
          />
          {{ data.SubareaName }}
        </span>
      </el-cascader-panel>
      <div slot="reference" class="subarea-name">
        {{ activeSubarea.SubareaName }}
        <i class="el-icon-caret-bottom" style="font-size: 10px;"></i>
      </div>
    </el-popover>
    <div class="preview-wrap">
      <div class="preview-box" @click="() => onClickPreviewBox(undefined)">
        <div class="preview-label">设备总数</div>
        <div class="preview-value">
          {{ previewData ? previewData.Total : '-' }}
        </div>
      </div>
      <div class="preview-box" @click="() => onClickPreviewBox(2)">
        <div class="preview-label">在线</div>
        <div class="preview-value" style="color: #37C02A">
          {{ previewData ? previewData.OnLine : '-' }}
        </div>
      </div>
      <div class="preview-box" @click="() => onClickPreviewBox(3)">
        <div class="preview-label">报警中</div>
        <div class="preview-value" style="color: #FB9D39;">
          {{ previewData ? previewData.Alarm : '-' }}
        </div>
      </div>
      <div class="preview-box" @click="() => onClickPreviewBox(1)">
        <div class="preview-label">已离线</div>
        <div class="preview-value" style="color: #F5222D;">
          {{ previewData ? previewData.OffLine : '-' }}
        </div>
      </div>
    </div>
    <div class="table-tool-box">
      <el-button
        size="small"
        type="primary"
        @click="() => $refs.dialogRunCondition.openDialog()"
      >
        项目设备运行情况
      </el-button>
      <el-button
        :loading="exportLoading"
        size="small"
        plain
        v-if="!(typeof filterForm.groupType === 'number')"
        @click="handleExport"
      >
        导出
      </el-button>
      <div class="right-wrap">
        <el-badge
          :hidden="hideFilterNotice()"
          is-dot
          class="item"
          v-if="!(typeof filterForm.groupType === 'number')"
          style="margin-top: 0px;margin-right: 15px;"
        >
          <el-button
            @click.native="() => $refs.dialogFilterForm.openDialog()"
            type="text"
            style="padding: 0;"
            >筛选<i class="el-icon-arrow-down"></i
          ></el-button>
        </el-badge>
        <el-select
          v-model="filterForm.groupType"
          clearable
          size="small"
          style="width: 140px;"
          placeholder="分组统计"
        >
          <el-option
            v-for="item in groupOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      v-if="!(typeof filterForm.groupType === 'number')"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
    >
      <el-table-column label="设备名称" prop="ModelTreeName" />
      <el-table-column label="设备分类" prop="SmallTypeName" />
      <el-table-column label="子系统" prop="BigTypeName" />
      <el-table-column label="监控状态">
        <template slot-scope="{ row }">
          <el-tag
            :type="(statusMap[row.ModelTreeStatus] || { type: {} }).type"
            size="mini"
            >{{ (statusMap[row.ModelTreeStatus] || {}).label }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="项目名称" prop="ProjectName" />
      <el-table-column label="项目分区" prop="ParentSubareaName" />
    </el-table>

    <pagination
      v-if="!(typeof filterForm.groupType === 'number')"
      v-show="pagination.total > 0"
      :total="pagination.total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      @pagination="fetchTableData"
    />
    <el-table
      v-show="typeof filterForm.groupType === 'number'"
      :data="tableDataGroup"
      style="width: 100%"
      @expand-change="onTableExpandChange"
    >
      <el-table-column type="expand">
        <template slot-scope="{ row }">
          <el-table
            v-loading="row.loading"
            :data="row.tableData"
            fit
            element-loading-text="加载中..."
            style="width: 100%;"
          >
            <el-table-column label="设备名称" prop="ModelTreeName" />
            <el-table-column label="设备分类" prop="SmallTypeName" />
            <el-table-column label="子系统" prop="BigTypeName" />
            <el-table-column label="监控状态">
              <template slot-scope="{ row }">
                <el-tag
                  :type="(statusMap[row.ModelTreeStatus] || { type: {} }).type"
                  size="mini"
                  >{{ (statusMap[row.ModelTreeStatus] || {}).label }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column label="项目名称" prop="ProjectName" />
            <el-table-column label="项目分区" prop="ParentSubareaName" />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="分组统计">
        <template slot-scope="{ row }">
          {{ groupOptions.find(v => v.value === filterForm.groupType).label }}：
          {{ row.Value }}
          （条数 {{ row.Extend }}）
        </template>
      </el-table-column>
    </el-table>
    <DialogRunCondition
      :subareaId="this.activeSubarea.SubareaId"
      ref="dialogRunCondition"
    />
    <DialogFilterForm @change="filterFormChange" ref="dialogFilterForm" />
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import DialogRunCondition from './DialogRunCondition'
import DialogFilterForm from './DialogFilterForm'
import {
  getModelTreeStatusTotal,
  getModelTreePage,
  exportModelTreePage,
  getModelTreeGroupStatistics
} from '@/api/model'
import { saveAs } from 'file-saver'
export default {
  components: { Pagination, DialogRunCondition, DialogFilterForm },
  data() {
    return {
      activeSubarea: {},
      subareaOptions: [],
      cascaderVisible: false,
      previewData: null,
      tableData: null,
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      filterForm: {
        groupType: '',
        deviceName: '',
        statusIds: [],
        deviceTypeIds: [],
        systemIds: [],
        sortProp: undefined,
        isAsc: undefined
      },
      tableDataGroup: [],
      statusMap: {
        1: {
          type: 'info',
          label: '离线'
        },
        2: {
          type: 'success',
          label: '在线'
        },
        3: {
          type: 'warning',
          label: '报警'
        }
      },
      groupOptions: [
        {
          value: 1,
          label: '设备分类'
        },
        {
          value: 0,
          label: '子系统'
        },
        {
          value: 2,
          label: '项目分区'
        }
      ],
      exportLoading: false
    }
  },
  watch: {
    activeSubarea() {
      this.fetchPreview()
      if (this.filterForm.groupType) {
        this.fetchGroups()
      } else {
        this.pagination.page = 1
        this.fetchTableData()
      }
    },
    'filterForm.groupType'(val) {
      if (typeof val === 'number') {
        this.fetchGroups()
      } else {
        this.pagination.page = 1
        this.fetchTableData()
      }
    }
  },
  computed: {
    companyStruct() {
      return this.$store.state.app.companyStruct
    }
  },
  mounted() {
    this.subareaOptions = [this.companyStruct]
    this.walk(this.subareaOptions)
    this.activeSubarea = {
      SubareaName: this.companyStruct.SubareaName,
      SubareaId: this.companyStruct.SubareaId
    }
  },
  methods: {
    subareaChange() {
      this.cascaderVisible = false
      this.activeSubarea = this.$refs.cascader.getCheckedNodes()[0].data
    },
    hideFilterNotice() {
      const {
        deviceName,
        deviceTypeIds,
        systemIds,
        statusIds
      } = this.filterForm
      return (
        !deviceName &&
        !deviceTypeIds.length &&
        !systemIds.length &&
        !statusIds.length
      )
    },
    onClickPreviewBox(val) {
      let statusIds = val ? [val] : []
      this.filterForm.statusIds = statusIds
      this.$refs.dialogFilterForm.setForm({
        statusIds
      })
      this.pagination.page = 1
      this.fetchTableData()
    },
    handleExport() {
      this.exportLoading = true
      const {
        deviceName,
        systemIds,
        deviceTypeIds,
        statusIds
      } = this.filterForm
      exportModelTreePage({
        SubareaIdList: [this.activeSubarea.SubareaId],
        ProjectId: undefined,
        BigTypeIdList: systemIds,
        SmallTypeIdList: deviceTypeIds,
        ModelTreeName: deviceName,
        LocationIdList: undefined,
        ModelTreeStatus: statusIds,
        IsEnabledPermission: undefined,
        IsMonitor: undefined
      })
        .then(res => {
          if (
            'application/json; charset=utf-8' === res.headers['content-type']
          ) {
            const reader = new FileReader()

            reader.onload = t => {
              const data = JSON.parse(t.target.result)
              this.$message(data.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          var a = new Blob([res.data])
          saveAs(a, `设备列表.xls`)
        })
        .catch(err => {
          console.error(err)
          this.$message.error('导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    filterFormChange(form) {
      Object.assign(this.filterForm, form)
      this.pagination.page = 1
      this.fetchTableData()
    },
    fetchPreview() {
      getModelTreeStatusTotal({
        subareaIdList: [this.activeSubarea.SubareaId]
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.previewData = res.data.Data
          } else {
            this.previewData = null
            this.$message('统计数据获取失败')
          }
        })
        .catch(err => {
          this.previewData = null
          console.error(err)
          this.$message('统计数据获取失败')
        })
    },
    fetchGroups() {
      this.tableDataGroup = []
      getModelTreeGroupStatistics({
        subareaIdList: [this.activeSubarea.SubareaId],
        Type: this.filterForm.groupType
      })
        .then(res => {
          if (res.data.Code === 200) {
            res.data.Data.forEach(v => {
              v.loading = false
              v.tableData = []
            })
            this.tableDataGroup = res.data.Data
          } else {
            this.tableDataGroup = []
            this.$message.error('列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('列表获取失败')
        })
    },
    onTableExpandChange(row, expandedRows) {
      const { groupType } = this.filterForm

      if (expandedRows.length && !row.tableData.length) {
        const index = this.tableDataGroup.findIndex(v => v.Key === row.Key)
        this.$set(this.tableDataGroup[index], 'loading', true)
        const setData = data =>
          this.$set(this.tableDataGroup[index], 'tableData', data)
        // 打开操作
        getModelTreePage({
          SubareaIdList:
            groupType === 2 ? [row.Key] : [this.activeSubarea.SubareaId],
          ProjectId: undefined,
          BigTypeIdList: groupType === 0 ? [row.Key || -1] : undefined,
          SmallTypeIdList: groupType === 1 ? [row.Key || -1] : undefined,
          ModelTreeName: undefined,
          LocationIdList: undefined,
          ModelTreeStatus: undefined,
          IsEnabledPermission: undefined,
          IsMonitor: undefined,
          SortType: undefined,
          IsAsc: undefined,
          PageIndex: undefined,
          PageSize: undefined
        })
          .then(res => {
            if (res.data.Code === 200) {
              setData(res.data.Data.Data)
            } else {
              setData([])
              this.$message.error('列表获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            setData([])
            this.$message.error('列表获取失败')
          })
          .finally(() => {
            this.$set(this.tableDataGroup[index], 'loading', false)
          })
      }
    },
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const {
          text,
          sortProp,
          isAsc,
          deviceName,
          systemIds,
          deviceTypeIds,
          statusIds
        } = this.filterForm
        const { page, limit } = this.pagination
        getModelTreePage({
          SubareaIdList: [this.activeSubarea.SubareaId],
          ProjectId: undefined,
          BigTypeIdList: systemIds,
          SmallTypeIdList: deviceTypeIds,
          ModelTreeName: deviceName,
          LocationIdList: undefined,
          ModelTreeStatus: statusIds,
          IsEnabledPermission: undefined,
          IsMonitor: undefined,
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
    ),
    walk(arr) {
      arr.forEach(item => {
        item.Children && item.Children.length
          ? this.walk(item.Children)
          : delete item.Children
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.device-manage {
  .subarea-name {
    height: 24px;
    font-size: 16px;
    cursor: pointer;
    display: inline-block;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 1);
    line-height: 24px;
  }
  .preview-wrap {
    margin-bottom: 24px;
    margin-top: 16px;
  }
  .preview-box {
    width: 140px;
    height: 86px;
    padding: 10px 16px;
    display: inline-block;
    cursor: pointer;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 2px 8px 0px rgba(25, 59, 89, 0.12);
    box-sizing: border-box;
    border-radius: 4px;
    margin-right: 16px;
  }
  .preview-label {
    height: 22px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 22px;
    margin-bottom: 8px;
  }
  .preview-value {
    height: 32px;
    font-size: 30px;
    font-family: DINPro-Medium, DINPro;
    font-weight: 500;
    color: rgba(0, 0, 0, 1);
    line-height: 32px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

<style lang="scss">
div.device-manage {
  .el-table__expanded-cell {
    padding: 0;
    padding-left: 50px;
  }
}
</style>
