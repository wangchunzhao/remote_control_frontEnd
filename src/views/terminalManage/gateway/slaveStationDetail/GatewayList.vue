<template>
  <div name="first" class="gatewayList content-box">
    <el-table
      v-loading="loading"
      :data="gatewayData"
      style="width: 100%;"
      element-loading-text="加载中..."
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column
        sortable="custom"
        fixed
        label="网关名称"
        min-width="125"
        prop="NAME"
      />
      <el-table-column
        label="所属项目"
        min-width="125"
        sortable="custom"
        prop="pname"
      />
      <el-table-column
        sortable="custom"
        min-width="155"
        label="序列号"
        prop="DESCRIBES"
      />
      <el-table-column
        label="连接状态"
        min-width="115"
        column-key="connectStatus"
        prop="connectStatus"
        :filters="[{ text: '在线', value: 0 }, { text: '离线', value: -1 }]"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="connectStatusMap[row.ConnectStatus].tagType"
            size="small"
          >
            {{ connectStatusMap[row.ConnectStatus].text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="数据更新状态" min-width="105" prop="SystemStatus">
        <template slot-scope="{ row }">
          <el-tag
            :type="updateStatusMap[row.SystemStatus].tagType"
            size="small"
          >
            {{ updateStatusMap[row.SystemStatus].text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :filters="
          Object.keys(SIMStatusMap).map(v => ({
            text: SIMStatusMap[v].text,
            value: SIMStatusMap[v].value
          }))
        "
        label="通讯卡状态"
        min-width="105"
        column-key="account_status"
        prop="account_status"
      >
        <template slot-scope="{ row }">
          <span v-if="row.account_status === null">-</span>
          <el-tag
            v-else
            :type="SIMStatusMap[row.account_status].tagType"
            size="small"
          >
            {{ SIMStatusMap[row.account_status].text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        min-width="155"
        sortable="custom"
        prop="CREATE_TIME"
      >
        <template slot-scope="{ row }">
          {{
            row.CREATE_TIME === '2000/01/01 00:00:00' ? '-' : row.CREATE_TIME
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="数据更新时间"
        min-width="155"
        sortable="custom"
        prop="DataUpdateDateTime"
      >
        <template slot-scope="{ row }">
          {{
            row.DataUpdateDateTime === '2000/01/01 00:00:00'
              ? '-'
              : row.DataUpdateDateTime
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="点位数量"
        min-width="105"
        sortable="custom"
        prop="pointCount"
      />
      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="{ row }">
          <el-link
            type="primary"
            :underline="false"
            v-if="row.IsLook"
            @click.native="
              $router.push({
                name: 'gatewayDetail',
                query: { data: JSON.stringify(row) }
              })
            "
          >
            查看
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="pagination.currentPage"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>
<script>
import { showDeviceList } from '@/api/device_new'
const connectStatusMap = {
  0: {
    text: '在线',
    tagType: 'success'
  },
  '-1': {
    text: '离线',
    tagType: 'info'
  },
  1: {
    text: '异常',
    tagType: 'danger'
  }
}
const updateStatusMap = {
  0: {
    text: '在线',
    tagType: 'success'
  },
  '-1': {
    text: '离线',
    tagType: 'info'
  },
  1: {
    text: '报警',
    tagType: 'danger'
  }
}
const SIMStatusMap = {
  0: {
    text: '正使用',
    tagType: 'success',
    value: 0
  },
  2: {
    text: '停机',
    tagType: 'danger',
    value: 2
  },
  3: {
    text: '预销号',
    tagType: 'warning',
    value: 3
  },
  4: {
    text: '销号',
    tagType: 'danger',
    value: 4
  },
  10: {
    text: '测试期',
    tagType: 'info',
    value: 10
  },
  11: {
    text: '沉默期',
    tagType: 'warning',
    value: 11
  },
  12: {
    text: '停机保号',
    tagType: 'danger',
    value: 12
  },
  99: {
    text: '未知',
    tagType: 'info',
    value: 99
  }
}
export default {
  name: 'ModuleWidthGateway',
  props: {
    moduleInfo: Object
  },
  data() {
    return {
      loading: false,
      gatewayData: [],
      gatewayFilterForm: {
        connectStatusIds: [], // 1: 全部， 0：在线 -1：离线
        updateStatusIds: [],
        simStatusIds: [],
        sortProp: undefined,
        isAsc: undefined
      },
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10
      },
      connectStatusMap,
      SIMStatusMap,
      updateStatusMap
    }
  },
  watch: {
    'moduleInfo.DeviceModuleId'(val) {
      if (val) {
        this.fetchTableData()
      }
    }
  },
  methods: {
    // 网关表格排序
    sortChange(val) {
      // 0:创建时间 1:网关名称 2:序列号 3:数据更新时间 4:项目名称 5：点位数量
      if (val.prop === 'CREATE_TIME') {
        this.gatewayFilterForm.sortProp = 0
      } else if (val.prop === 'NAME') {
        this.gatewayFilterForm.sortProp = 1
      } else if (val.prop === 'DataUpdateDateTime') {
        this.gatewayFilterForm.sortProp = 3
      } else if (val.prop === 'DESCRIBES') {
        this.gatewayFilterForm.sortProp = 2
      } else if (val.prop === 'pname') {
        this.gatewayFilterForm.sortProp = 4
      } else if (val.prop === 'pointCount') {
        this.gatewayFilterForm.sortProp = 5
      }
      this.gatewayFilterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 网关表格筛选
    filterChange(filter) {
      if (filter.PROTOCOL) {
        this.gatewayFilterForm.protocol = filter.PROTOCOL
      } else if (filter.connectStatus) {
        this.gatewayFilterForm.connectStatusIds = filter.connectStatus
      } else if (filter.account_status) {
        this.gatewayFilterForm.simStatusIds = filter.account_status
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 分页
    handleCurrentChange(val) {
      this.fetchTableData(val)
    },
    // 修改每页显示的数量
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.fetchTableData(0)
    },
    // 查询设备信息
    fetchTableData() {
      const {
        text,
        connectStatusIds,
        updateStatusIds,
        simStatusIds,
        sortProp,
        isAsc
      } = this.gatewayFilterForm
      const { currentPage, pageSize } = this.pagination
      this.loading = true
      showDeviceList({
        DeviceModuleId: this.moduleInfo.DeviceModuleId,
        ConnectStatusList: connectStatusIds,
        CompanyId: undefined, // 如果传公司id，会把未分配项目的网关也查出来
        IsQueryCreator: false,
        ProjectIdList: undefined,
        SimStatus: simStatusIds,
        NameOrDESCRIBES: text,
        IsQueryLook: true,
        PROTOCOLList: undefined,
        CreateTime: undefined,
        SortType: sortProp,
        IsAsc: isAsc,
        QueryAll: false,
        SystemStatusList: updateStatusIds,
        SimFlowStatusList: undefined,
        PageIndex: currentPage,
        PageSize: pageSize
      })
        .then(res => {
          const data = res.data.Data
          if (res.data.Code === 200) {
            this.gatewayData = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.gatewayData = []
            this.$message.error('网关列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('网关列表获取失败')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss">
.gatewayList {
  & > .table-tool {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    .el-alert {
      display: inline !important;
      background-color: #e6f7ff;
      border: 1px solid rgba(145, 213, 255, 1);
      margin-left: 10px;
      padding-right: 75px;
      color: rgba(0, 0, 0, 0.65);
    }
    .el-alert__icon {
      color: #1890ff;
    }
    i.el-alert__closebtn {
      color: #1890ff;
    }
  }
}
</style>
