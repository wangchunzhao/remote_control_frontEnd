<template>
  <div>
    <div class="table-tool-box">
      <div class="part-title" style="float: left;">点位数据</div>
      <div style="float: right;display: flex;align-items: center">
        <el-switch
          v-model="switchStatus"
          active-text="仅显示可控制点位"
          @change="switchChange"
        />
        <el-badge
          :hidden="showFilterNotice()"
          is-dot
          style="margin-left: 25px;"
        >
          <el-button
            @click.native="() => $refs.filterFormDialog.openDialog()"
            type="text"
            style="padding: 0;"
            >筛选<i class="el-icon-arrow-down"></i
          ></el-button>
        </el-badge>
        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="margin-left: 20px;"
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
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="typeCn" label="点位类型" />
      <el-table-column label="最新值" prop="valuename" sortable>
        <template slot-scope="{ row }">
          <el-link
            type="primary"
            :underline="false"
            @click.native="() => openHistoryDialog(row)"
            >{{ row.valuename }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" sortable />
      <el-table-column label="状态" prop="PointStatus">
        <template slot-scope="{ row }">
          <el-tag :type="statusMap[row.PointStatus].type" size="mini">{{
            statusMap[row.PointStatus].label
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报警配置" prop="">
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
      <el-table-column label="参数等级" prop="tag">
        <template slot-scope="{ row }">
          <span style="margin-left: 10px">{{ levelMap[row.level] }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" label="操作">
        <template slot-scope="{ row }">
          <!-- // 1读写 2只读 3读写 4只读 -->
          <Write-Popover
            v-permission="[129]"
            v-if="row.RW === 1 || row.RW === 3"
            :id="row.id"
            :point-info="{
              mname: row.ModelTreeName,
              pname: row.name
            }"
            :type="gatewayTypeMap[row.DEVICE_TYPE]"
          />
        </template>
      </el-table-column>
      <template slot="empty">
        <div style="padding: 50px;line-height: normal;">
          <div style="line-height: 30px;">设备下暂无点位</div>
          <div
            style="display: flex;align-item: center;justify-content: center;"
            v-if="!switchStatus"
          >
            <span>前往&nbsp;</span>
            <el-button
              type="text"
              style="padding: 0;"
              @click.native="$router.push({ name: 'pointAssociate' })"
            >
              点位关联
            </el-button>
            <span>&nbsp;配置</span>
          </div>
        </div>
      </template>
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
    <FilterFormDialog
      :typeOptions="typeOptions"
      @change="filterFormChange"
      ref="filterFormDialog"
    />
    <AlarmStorageDialog ref="alarmStorageDialog" />
    <HistoryDialog
      ref="historyDialog"
      :point-ids="history.point"
      :device-id="history.deviceId"
    />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import FilterFormDialog from './FilterFormDialog'
import AlarmStorageDialog from '@/views/projectConfig/pointAssociate/AlarmStorageDialog'
import HistoryDialog from '@components/HistoryDialog'
import { queryPointRead } from '@/api/model_new'
import WritePopover from '@/views/monitor/component/WritePopover'
import { queryPointTypeInDmpListDropdownList } from '@/api/model'
export default {
  name: 'PointDataList',
  components: {
    HistoryDialog,
    FilterFormDialog,
    AlarmStorageDialog,
    WritePopover
  },
  data() {
    return {
      filterForm: {
        text: '',
        levelIds: [],
        statusIds: [],
        readWriteAccess: [],
        isSetAlarm: [],
        typeIds: [],
        sortProp: undefined,
        isAsc: undefined
      },
      intervalMin: 0,

      multipleSelection: [],

      tableLoading: false,
      switchStatus: false, // 是否显示未配备点位
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

      levelMap: {
        1: '一级',
        2: '二级',
        3: '三级'
      },
      alarmLevelMap: {
        1: '紧急',
        2: '重要',
        3: '一般',
        4: '记录'
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
      },

      gatewayTypeMap: {
        0: 'Other',
        1: 'Modbus RTU',
        2: 'MQTT'
      },
      typeOptions: []
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
    }
  },
  mounted() {
    this.fetchTableData()
    queryPointTypeInDmpListDropdownList({
      mtid: this.$route.query.mtid,
      LevelList: undefined,
      pointTypeIdList: undefined,
      PointStatusList: undefined
    }).then(res => {
      if (res.data.Code === 200) {
        this.typeOptions = res.data.Data
      }
    })
  },
  methods: {
    switchChange() {
      this.pagination = {
        currentPage: 1,
        size: 10,
        total: 0
      }
      this.tableData = []
      this.fetchTableData()
    },
    showFilterNotice() {
      const {
        levelIds,
        statusIds,
        readWriteAccess,
        isSetAlarm,
        typeIds
      } = this.filterForm
      return (
        !levelIds.length &&
        !statusIds.length &&
        !readWriteAccess.length &&
        !isSetAlarm.length &&
        !typeIds.length
      )
    },
    filterFormChange({
      levelIds,
      statusIds,
      readWriteAccess,
      isSetAlarm,
      typeIds
    }) {
      this.filterForm.levelIds = levelIds
      this.filterForm.statusIds = statusIds
      this.filterForm.readWriteAccess = readWriteAccess
      this.filterForm.isSetAlarm = isSetAlarm
      this.filterForm.typeIds = typeIds

      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 查看报警策略
    handleWatchStorage(row) {
      if (!row.IsSetAlarm) {
        this.$message('当前点位未配置报警策略')
        return false
      }
      this.$refs.alarmStorageDialog.openDialog(row.id)
    },
    // 查看历史曲线对话框
    openHistoryDialog(row) {
      this.history.point = [row.id]
      this.history.deviceId = row.ModelTreeId
      this.$refs.historyDialog.toggleDialog()
    },
    // 表格排序
    sortChange(val) {
      // if (val.prop === 'CREATE_TIME') {
      //   this.filterForm.sortProp = 0
      // }
      this.filterForm.sortProp = val.prop
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
          levelIds,
          statusIds,
          readWriteAccess,
          isSetAlarm,
          typeIds
        } = this.filterForm
        const { currentPage, size } = this.pagination
        queryPointRead({
          mtid: this.$route.query.mtid,
          mtidList: undefined,
          BigTypeId: undefined,
          ProjectId: this.projectId,
          LevelList: levelIds,
          PointStatusList: statusIds,
          PointTypeIdList: typeIds,
          area: undefined,
          name: text,
          stime: undefined,
          etime: undefined,
          typeCn: undefined,
          alarmLevel: undefined,
          ReadWrite: this.switchStatus ? [3] : readWriteAccess,
          IsSetAlarm: isSetAlarm,
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
      },
      1000,
      {
        leading: true
      }
    )
  }
}
</script>

<style scoped lang="scss">
.part-title {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 24px;
}
</style>
