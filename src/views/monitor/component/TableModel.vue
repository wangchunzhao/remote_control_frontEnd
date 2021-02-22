<template>
  <div>
    <el-table
      :data="tableData"
      style="width: 100%;"
      class="monitor-table-model"
      row-key="uuid"
      ref="table"
      v-loading="tableLoading"
      default-expand-all
      :row-class-name="handleRowClassName"
      @row-click="handleRowClick"
      :tree-props="{ children: 'ViewModel', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="MName" label="">
        <template slot-scope="{ row }">
          <el-link
            v-if="row.MName"
            class="deviceName_SDFk38294kls"
            @click.stop.native="handleClickDeviceName(row)"
            :underline="false"
          >
            {{ row.MName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="pname" label="点位名称"></el-table-column>
      <el-table-column label="最新值" prop="valuename">
        <template slot-scope="{ row }">
          <el-link
            @click.native="() => openHistoryDialog(row)"
            type="primary"
            :underline="false"
          >
            {{ row.valuename }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="utime" label="更新时间" />

      <el-table-column label="状态" prop="ConnectStatus">
        <template slot-scope="{ row }">
          <el-tag
            v-if="row.ConnectStatus !== undefined"
            :type="statusMap[row.ConnectStatus].type"
            size="mini"
            >{{ statusMap[row.ConnectStatus].label }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="报警配置" prop="">
        <template slot-scope="{ row }">
          <!--  -->
          <el-tag
            v-if="row.strategyId !== undefined"
            style="cursor: pointer;"
            @click.native="() => handleWatchStorage(row)"
            :type="row.strategyId !== 0 ? 'primary' : 'info'"
            size="mini"
            >{{ row.strategyId !== 0 ? '已配置' : '未配置' }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column width="160" label="操作">
        <template slot-scope="{ row }">
          <!-- // 1读写 2只读 3读写 4只读 -->
          <Write-Popover
            v-permission="[129]"
            v-if="row.rowType === 'Point' && (row.RW === 1 || row.RW === 3)"
            :id="row.point"
            :pointInfo="row"
            :type="gatewayTypeMap[row.DEVICE_TYPE]"
          />
          <el-popover
            popper-class="popover-KJ324JKSDFS"
            placement="left"
            width="420"
            :disabled="row.MStatus !== 3"
            trigger="hover"
          >
            <el-table
              :data="row.AlarmTable"
              :row-class-name="() => 'table-row_LKSJDF32908432'"
              @row-click="
                row => $refs.alarmDetailDialog.openDialog(row.AlarmId)
              "
            >
              <el-table-column prop="PointName" label="点位"></el-table-column>
              <el-table-column
                prop="ALARM_CLASS"
                label="报警类型"
                width="90"
              ></el-table-column>
              <el-table-column prop="ALARM_LEVEL" width="60" label="等级">
                <template slot-scope="{ row }">
                  <el-tag
                    size="mini"
                    :type="alarmLevelMap[row.ALARM_LEVEL].type"
                  >
                    {{ alarmLevelMap[row.ALARM_LEVEL].label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="ALARM_SETTING"
                label="报警规则"
              ></el-table-column>
            </el-table>
            <!-- MStatus: 1: 离线 2：正常 3：报警 -->
            <div
              :class="[
                'notice-btn',
                row.MStatus === 1 ? 'offline' : row.MStatus === 3 ? 'alarm' : ''
              ]"
              :style="{ cursor: row.MStatus === 3 ? 'pointer' : 'default' }"
              slot="reference"
              @click.stop
              v-if="row.rowType === 'Device' && row.MStatus !== 2"
            >
              <c-svg name="warning-circle-fill"></c-svg>
              {{
                row.MStatus === 1
                  ? '设备已离线'
                  : row.MStatus === 3
                  ? `有 ${row.AlarmNum} 条报警未处理`
                  : ''
              }}
            </div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        v-show="pagination.total > 0"
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <AlarmDetailDialog
      @open="payload => $refs.alarmMsgHistoryDialog.openDialog(payload)"
      ref="alarmDetailDialog"
    />
    <HistoryDialog
      ref="historyDialog"
      :point-ids="history.point"
      :device-id="history.deviceId"
    />
    <AlarmStorageDialog ref="alarmStorageDialog" />
    <AlarmMsgHistoryDialog ref="alarmMsgHistoryDialog" />
  </div>
</template>

<script>
import { getTableListRead } from '@/api/model'
import uuidv1 from 'uuid/v1'
import HistoryDialog from '@/components/HistoryDialog'
import AlarmStorageDialog from '@/views/projectConfig/pointAssociate/AlarmStorageDialog'
import WritePopover from '@/views/monitor/component/WritePopover'
import AlarmDetailDialog from '@/views/alarmManage/alarmHistory/AlarmDetailDialog'
import AlarmMsgHistoryDialog from '@/views/alarmManage/component/AlarmMsgHistoryDialog'

export default {
  components: {
    HistoryDialog,
    AlarmStorageDialog,
    WritePopover,
    AlarmDetailDialog,
    AlarmMsgHistoryDialog
  },
  props: {
    bigTypeId: Number,
    smallTypeId: Number,
    form: Object
  },
  data() {
    return {
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        deviceStatusIds: [],
        pointStatusIds: [],
        readWriteAccess: [],
        isSetAlarm: [],
        pointTypeIds: []
      },

      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },

      history: {
        point: null,
        deviceId: 0
      },
      gatewayTypeMap: {
        0: 'Other',
        1: 'Modbus RTU',
        2: 'MQTT'
      },
      alarmLevelMap: {
        1: {
          type: 'danger',
          label: '紧急'
        },
        2: {
          type: 'warning',
          label: '重要'
        },
        3: {
          type: 'primary',
          label: '一般'
        },
        4: {
          type: 'info',
          label: '记录'
        }
      },
      statusMap: {
        1: {
          type: 'info',
          label: '离线'
        },
        2: {
          type: 'success',
          label: '正常'
        },
        3: {
          type: 'danger',
          label: '报警'
        }
      }
    }
  },
  watch: {
    form: {
      handler: function(val) {
        Object.assign(this.filterForm, val)
        this.pagination.currentPage = 1
        this.fetchTableData()
      },
      deep: true
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    handleRowClick(row) {
      if (row.rowType === 'Device') {
        this.$refs.table.toggleRowExpansion(row)
      }
    },
    handleClickDeviceName(row) {
      this.$router.push({
        name: 'devicePointList',
        query: {
          deviceName: row.MName,
          mtid: row.Mtid,
          BigTypeId: this.bigTypeId,
          SmallTypeId: this.smallTypeId
        }
      })
    },
    handleRowClassName({ row }) {
      if (row.rowType === 'EmptyRow') {
        return 'empty-row'
      }
    },
    // 查看历史曲线对话框
    openHistoryDialog(row) {
      this.history.point = [row.point]
      this.history.deviceId = row.deviceId
      this.$refs.historyDialog.toggleDialog()
    },
    // 查看报警策略
    handleWatchStorage(row) {
      if (row.strategyId === 0) {
        this.$message('当前点位未配置报警策略')
        return false
      }
      this.$refs.alarmStorageDialog.openDialog(row.point)
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
    fetchTableData() {
      this.tableLoading = true
      const {
        text,
        sortProp,
        isAsc,
        deviceStatusIds,
        pointStatusIds,
        readWriteAccess,
        isSetAlarm,
        pointTypeIds
      } = this.filterForm
      const { currentPage, size } = this.pagination
      getTableListRead({
        ProjectId: this.projectId,
        BigTypeId: this.bigTypeId,
        ModelTreeName: text,
        SmallTypeId: this.smallTypeId,
        PointName: undefined,
        ConnectStatusList: deviceStatusIds,
        PointStatusList: pointStatusIds,
        ReadWrite: readWriteAccess,
        IsSetAlarm: isSetAlarm,
        PointTypeList: pointTypeIds,
        SortType: sortProp,
        IsAsc: isAsc,
        PageSize: size,
        PageIndex: currentPage
      })
        .then(res => {
          if (
            currentPage === this.pagination.currentPage &&
            text === this.filterForm.text
          ) {
            if (res.data.Code === 200) {
              this.pagination.total = res.data.Data.TotalCount
              let data = res.data.Data.Data

              let tempList = []
              data.forEach(v => {
                v.uuid = uuidv1()
                v.rowType = 'Device'
                v.ViewModel.forEach(vv => {
                  vv.uuid = uuidv1()
                  vv.mname = v.MName
                  vv.deviceId = v.Mtid
                  vv.rowType = 'Point'
                })
                // 数组元素间插入一个空行
                tempList.push({
                  rowType: 'EmptyRow'
                })
                tempList.push(v)
              })

              this.tableData = tempList
            } else {
              this.tableData = []
              this.pagination.total = 0
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
    }
  }
}
</script>

<style lang="scss">
.popover-KJ324JKSDFS {
  padding: 0;
}
.table-row_LKSJDF32908432 {
  cursor: pointer;
}
div.monitor-table-model {
  background-color: transparent;
  .notice-btn {
    display: inline-block;
    padding: 0px 8px;
    border-radius: 14px;
    background-color: #f5222d;
    color: #fff;
    font-size: 12px;
    &.alarm {
      background-color: #f5222d;
    }
    &.offline {
      background-color: #bfbfbf;
    }
  }
  .el-table__header-wrapper th {
    background-color: #fff;
  }
  .el-table__row--level-0 {
    &:hover {
      .deviceName_SDFk38294kls {
        color: $color;
      }
    }
  }
  .empty-row {
    background-color: transparent;
    td {
      padding: 0;
      background-color: transparent;
      &:hover {
        background-color: transparent;
      }
    }
  }
}
</style>
