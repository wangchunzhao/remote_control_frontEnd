<template>
  <el-dialog
    width="1050px"
    :title="currentDeviceName"
    :visible.sync="dialogVisible"
    @close="handleClose"
    class="device-point-dialog"
  >
    <el-button @click.native="handleClickEditProp" size="small" type="primary">
      变更点位属性
    </el-button>
    <el-button @click.native="handleClickRemove" size="small" type="danger">
      移除
    </el-button>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;margin-top: 15px;"
      @sort-change="sortChange"
      @filter-change="filterChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50px" />
      <el-table-column prop="name" sortable="custom" label="点位名称" />
      <el-table-column
        column-key="typeCn"
        prop="typeCn"
        :filters="typeOptions"
        label="点位类型"
      >
        <template slot-scope="{ row }">
          {{ row.typeCn }}
        </template>
      </el-table-column>
      <el-table-column
        column-key="PointStatus"
        prop="PointStatus"
        width="90"
        :filters="[
          { text: '在线', value: 2 },
          { text: '离线', value: 1 },
          { text: '报警', value: 3 }
        ]"
        label="连接状态"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="
              row.PointStatus === 2
                ? 'primary'
                : row.PointStatus === 1
                ? 'info'
                : 'danger'
            "
            size="small"
          >
            {{
              row.PointStatus === 2
                ? '在线'
                : row.PointStatus === 1
                ? '离线'
                : row.PointStatus === 3
                ? '报警'
                : '报警'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="valuename" width="115" label="最新值">
        <template slot-scope="{ row }">
          <el-link
            type="primary"
            :underline="false"
            @click.native="watchHistory(row.id)"
          >
            {{ row.valuename }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        width="135"
        prop="updateTime"
        sortable="custom"
        label="更新时间"
      >
        <template slot-scope="{ row }">
          {{ _dateFormat(row.updateTime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column
        column-key="level"
        prop="level"
        :filters="[
          { text: '一级', value: 1 },
          { text: '二级', value: 2 },
          { text: '三级', value: 3 }
        ]"
        label="参数级别"
        width="90"
      >
        <template slot-scope="{ row }">
          {{ row.level === 1 ? '一级' : row.level === 2 ? '二级' : '三级' }}
        </template>
      </el-table-column>
      <el-table-column label="报警配置" width="80" prop="">
        <template slot-scope="{ row }">
          <el-tag
            style="cursor: pointer;"
            :type="row.IsSetAlarm ? 'primary' : 'info'"
            size="mini"
            @click.native="() => handleWatchStorage(row)"
            >{{ row.IsSetAlarm ? '已配置' : '未配置' }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="关联参数" prop="">
        <template slot-scope="{ row }">
          <div class="associate-point-column">
            <span v-if="!row.editable">{{
              row.PointRelevanceList ? row.PointRelevanceList.length : 0
            }}</span>
            <el-select
              v-else
              v-model="row.pointRelevanceIds"
              size="mini"
              filterable
              clearable
              multiple
              placeholder="请选择"
            >
              <el-option
                v-for="item in pointOptions"
                :key="item.id"
                :disabled="item.id === row.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
            <el-link
              @click.native="() => handleRowEdit(row)"
              class="edit-btn"
              :underline="false"
            >
              <c-svg :name="row.editable ? 'true' : 'bianji'" />
            </el-link>
          </div>
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
    <span
      v-if="$route.name === 'alarmManageIndex'"
      slot="footer"
      class="dialog-footer"
    >
      <el-button type="primary" @click.native="handleWatchDevice"
        >查看设备</el-button
      >
    </span>
    <HistoryDialog
      appendToBody
      ref="historyDialog"
      :device-id="currentDeviceId"
      :point-ids="historyPoint"
    />
    <EditPropDialog
      @refresh="fetchTableData"
      :point-ids="multipleSelection.map(item => item.id)"
      ref="editPropDialog"
    />
    <AlarmStorageDialog ref="alarmStorageDialog" />
  </el-dialog>
</template>

<script>
import HistoryDialog from '@/components/HistoryDialog'
import EditPropDialog from '@/views/projectConfig/pointAssociate/EditPropDialog'
import { queryPoint, queryPointTypeInDmpListDropdownList } from '@/api/model'
import debounce from 'lodash/debounce'
import { pointCancelRelevance, addPointRelevance } from '@/api/point'
import AlarmStorageDialog from '../pointAssociate/AlarmStorageDialog'

export default {
  components: {
    HistoryDialog,
    EditPropDialog,
    AlarmStorageDialog
  },
  data() {
    return {
      dialogVisible: false,
      currentDeviceId: '',
      currentDeviceName: '',
      pointOptions: [],
      typeOptions: [],
      filterForm: {
        sortProp: undefined,
        isAsc: undefined,
        level: undefined,
        status: undefined,
        pointType: undefined
      },

      tableLoading: false,
      multipleSelection: [],
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      historyPoint: null
    }
  },
  methods: {
    openDialog({ id, name }) {
      this.dialogVisible = true
      this.currentDeviceId = id
      this.currentDeviceName = name
      this.fetchTableData()
      this.fetchPointOptions()
      queryPointTypeInDmpListDropdownList({
        mtid: id,
        LevelList: undefined,
        pointTypeIdList: undefined,
        PointStatusList: undefined
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          data.forEach(item => {
            item.text = item.Value
            item.value = item.Key
          })
          this.typeOptions = data
        }
      })
    },
    handleClickEditProp() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$refs.editPropDialog.openDialog()
    },
    handleClickRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$confirm('确认要将选中的点位取消与设备的关联?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          pointCancelRelevance({
            pointIdList: this.multipleSelection.map(item => item.id),
            modelTreeId: this.currentDeviceId
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('移除成功')
                this.$emit('refresh')
                this.fetchTableData()
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
            })
        })
        .catch(() => {})
    },
    handleWatchDevice() {
      this.dialogVisible = false
      const { name, path } = this.$route
      this.$router.push({
        name: 'devicePointList',
        query: {
          deviceName: this.currentDeviceName,
          mtid: this.currentDeviceId,
          from: name,
          path: path
        }
      })
    },
    // 表格内编辑
    handleRowEdit(row) {
      row.editable = !row.editable

      // 点击保存
      if (!row.editable) {
        let list = []
        list = row.pointRelevanceIds.map(id => {
          return {
            PointIdB: id,
            ModelTreeIdB: this.pointOptions.find(item => item.id === id)
              .ModelTreeId
          }
        })
        addPointRelevance({
          PointIdA: row.id,
          ModelTreeIdA: this.currentDeviceId,
          PointRelevanceList: list
        })
          .then(res => {
            if (res.data.Code === 200 && res.data.Data.IsSuccess) {
              this.$message.success('操作成功')
              this.fetchTableData()
            } else {
              this.$message.error(res.data.Message)
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('关联失败')
          })
      }
    },
    handleWatchStorage(row) {
      if (!row.IsSetAlarm) {
        this.$message('当前点位未配置报警策略')
        return false
      }
      this.$refs.alarmStorageDialog.openDialog(row.PointId)
    },
    handleClose() {
      this.pagination.currentPage = 1
      this.pagination.total = 0
      this.pagination.size = 10
      this.typeOptions = []
      this.dialogVisible = false
    },
    // 查看历史数据
    watchHistory(point) {
      this.historyPoint = [point]
      this.$refs.historyDialog.toggleDialog()
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'name') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'updateTime') {
        this.filterForm.sortProp = 1
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.level) {
        this.filterForm.level = filter.level
      } else if (filter.PointStatus) {
        this.filterForm.status = filter.PointStatus
      } else if (filter.typeCn) {
        this.filterForm.pointType = filter.typeCn
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
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { sortProp, isAsc, level, pointType, status } = this.filterForm
        const { currentPage, size } = this.pagination
        queryPoint({
          mtid: this.currentDeviceId,
          LevelList: level,
          PointStatusList: status,
          area: undefined,
          name: '',
          stime: undefined,
          etime: undefined,
          typeCn: undefined,
          PointTypeIdList: pointType,
          alarmLevel: undefined,
          IsGetPointRelevance: true,
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: currentPage,
          PageSize: size
        })
          .then(res => {
            if (res.data.Code === 200) {
              const data = res.data.Data
              data.Data.forEach(item => {
                item.editable = false
                item.pointRelevanceIds = []
                if (item.PointRelevanceList) {
                  item.pointRelevanceIds = item.PointRelevanceList.map(
                    item => item.PointIdB
                  )
                }
              })
              this.tableData = data.Data
              this.pagination.total = data.TotalCount
            } else {
              this.tableData = []
              this.total = 0
            }
          })
          .catch(err => {
            console.error(err)
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
    fetchPointOptions() {
      queryPoint({
        mtid: this.currentDeviceId,
        LevelList: undefined,
        PointStatusList: status,
        area: undefined,
        name: '',
        stime: undefined,
        etime: undefined,
        typeCn: undefined,
        PointTypeIdList: undefined,
        alarmLevel: undefined,
        SortType: undefined,
        IsAsc: undefined,
        PageIndex: 1,
        PageSize: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data.Data
            this.pointOptions = data
          } else {
            this.pointOptions = []
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss">
.device-point-dialog {
  .el-table__row {
    &:hover {
      .edit-btn {
        display: inline-block;
      }
    }
  }
  .associate-point-column {
    position: relative;
    padding-right: 15px;
    cursor: pointer;
    .edit-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      display: none;
    }
  }
}
</style>
