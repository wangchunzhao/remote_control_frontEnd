<template>
  <el-dialog
    width="1300px"
    title="未分配项目网关"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
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
        label="网关类型"
        min-width="115"
        column-key="PROTOCOL"
        prop="PROTOCOL"
        :filters="[
          { text: 'Modbus网关', value: 'Modbus RTU' },
          { text: 'TCP网关', value: 'TCP RTU' },
          { text: 'MQTT网关', value: 'MQTT' }
        ]"
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
      <el-table-column
        :filters="
          Object.keys(updateStatusMap).map(v => ({
            text: updateStatusMap[v].text,
            value: v
          }))
        "
        column-key="SystemStatus"
        label="数据更新状态"
        min-width="125"
        prop="SystemStatus"
      >
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
            value: v
          }))
        "
        label="通讯卡状态"
        min-width="105"
        column-key="SimFlowStatus"
        prop="SimFlowStatus"
      >
        <template slot-scope="{ row }">
          <span v-if="row.SimFlowStatus === null">-</span>
          <el-tag
            v-else
            :type="SIMStatusMap[row.SimFlowStatus].tagType"
            size="small"
          >
            {{ SIMStatusMap[row.SimFlowStatus].text }}
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
      <el-table-column fixed="right" label="操作" width="160">
        <template slot-scope="{ row }">
          <el-link
            @click.native="
              $router.push({
                name: 'gatewayDetail',
                query: { data: JSON.stringify(row) }
              })
            "
            type="primary"
            :underline="false"
          >
            查看
          </el-link>
          <el-link
            type="primary"
            :underline="false"
            v-if="row.PROTOCOL === 'MQTT' && row.ConnectStatus === 0"
            @click.native="resetMQTT(row)"
          >
            重启
          </el-link>
          <el-link
            @click.native="
              () => {
                currentGateway = row
                $refs.dialogChangeProject.openDialog()
              }
            "
            type="primary"
            :underline="false"
          >
            分配项目
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
    <span slot="footer">
      <el-button
        size="medium"
        type="primary"
        @click.native="() => (dialogVisible = false)"
        >确 定</el-button
      >
    </span>
    <DialogChangeProject
      :deviceId="currentGateway.id"
      @complete="distributionComplete"
      ref="dialogChangeProject"
    />
  </el-dialog>
</template>

<script>
import { showDeviceList } from '@/api/device_new'
import mqtt from 'mqtt'
import { storageName } from '@/utils/index'
import DialogChangeProject from '../component/DialogChangeProject'

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
    text: '未绑定',
    tagType: 'info',
    value: 0
  },
  2: {
    text: '流量用完',
    tagType: 'warning',
    value: 2
  },
  1: {
    text: '流量正常',
    tagType: 'success',
    value: 1
  }
}
export default {
  components: {
    DialogChangeProject
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      currentGateway: {},
      unDistributionProjectCount: 0, // 未分配项目的网关数量
      gatewayData: [],
      gatewayFilterForm: {
        connectStatusIds: [], // 1: 全部， 0：在线 -1：离线
        updateStatusIds: [],
        simStatusIds: [],
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        protocol: []
      },
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10
      },
      connectStatusMap,
      SIMStatusMap,
      updateStatusMap,
      userId: JSON.parse(sessionStorage.getItem(storageName('userInfo'))).uid
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchTableData()
    },
    handleClose() {
      this.dialogVisible = false
    },
    fetchTableData() {
      const {
        text,
        connectStatusIds,
        updateStatusIds,
        simStatusIds,
        protocol,
        sortProp,
        isAsc
      } = this.gatewayFilterForm
      const { currentPage, pageSize } = this.pagination
      this.loading = true
      showDeviceList({
        DeviceModuleId: undefined,
        ConnectStatusList: connectStatusIds,
        CompanyId: undefined, // 如果传公司id，会把未分配项目的网关也查出来
        IsQueryCreator: true,
        ProjectIdList: undefined,
        SimStatus: undefined,
        NameOrDESCRIBES: text,
        PROTOCOLList: protocol,
        CreateTime: undefined,
        SortType: sortProp,
        IsAsc: isAsc,
        QueryAll: false,
        SystemStatusList: updateStatusIds,
        SimFlowStatusList: simStatusIds,
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
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    distributionComplete() {
      this.pagination.currentPage = 1
      this.pagination.currentPage = 1
      this.fetchTableData()
      this.$emit('refresh')
    },
    // 重启mqtt网关
    resetMQTT(row) {
      this.$confirm('确认要重启这个MQTT网关?', '提示', { type: 'warning' })
        .then(() => {
          const client = mqtt.connect('wss:mqtt.coolcare.link:8084/mqtt', {
            connectTimeout: 40000, // 超时时间
            // 认证信息
            clientId: `mqttjs_${Math.random()
              .toString(16)
              .substr(2, 10)}_${this.userId}`,
            username: 'webclient',
            password: 'webclient.coolcare@Sinocold'
          })
          client.on('error', error => {
            this.$message.error('与服务器连接失败')
            console.error('连接失败:', error)
          })
          client.on('connect', () => {
            // 订阅一个主题(配置/控制/重启指令的响应)
            client.subscribe(
              `gw/mq/${row.DESCRIBES}/response`,
              { qos: 1 },
              error => {
                if (!error) {
                  // ('订阅成功')
                  // 下发重启指令
                  client.publish(
                    `gw/mq/${row.DESCRIBES}/reboot`,
                    '{"operate": "reboot"}',
                    error => {
                      if (error) {
                        console.error(error)
                      }
                    }
                  )
                } else {
                  this.$message.error('重启指令下发失败')
                  client.end()
                }
              }
            )
            client.on('message', (topic, message) => {
              const res = JSON.parse(message.toString())
              if (res.status) {
                this.$message.success(`网关：${row.NAME} ${res.message}`)
              } else {
                this.$message.error(`网关：${row.NAME} ${res.message}`)
              }
              client.end()
            })
            // 连接后40秒自己断开连接
            setTimeout(() => {
              client.end()
            }, 40 * 1000)
          })
        })
        .catch(() => {})
    },
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
      } else if (filter.SimFlowStatus) {
        this.gatewayFilterForm.simStatusIds = filter.SimFlowStatus
      } else if (filter.SystemStatus) {
        this.gatewayFilterForm.updateStatusIds = filter.SystemStatus
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
    // 点击删除网关按钮
    clickDel(row) {
      this.currentGateway.id = row.id
      Object.assign(this.currentGateway, row)
      this.$confirm('确认要删除该网关？', '提示', { type: 'warning' }).then(
        () => {
          this.$refs.userConfirmDialog.openDialog()
        }
      )
    }
  }
}
</script>
