<template>
  <div class="gateway-pointlist content-box">
    <div style="margin-bottom: 25px;">
      <span
        style="font-size: 14px;margin-right: 5px;color: #797878;vertical-align: middle;"
        >实时刷新</span
      >
      <el-tooltip
        class="item"
        effect="dark"
        content="开启后以10秒为周期刷新最新数据"
        placement="top"
      >
        <el-switch
          v-model="isRefresh"
          :disabled="gatewayInfo.PROTOCOL === 'MQTT'"
        />
      </el-tooltip>
      <el-input
        v-model="filterForm.PointName"
        size="small"
        clearable
        placeholder="查找名称"
        style="width: 200px;float: right;"
        suffix-icon="el-icon-search"
      />
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
      element-loading-text="加载中..."
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column label="序号" width="100" type="index" />
      <el-table-column sortable="custom" label="名称" prop="PointName" />
      <el-table-column
        label="连接状态"
        column-key="isLine"
        prop="isLine"
        :filters="[{ text: '在线', value: 1 }, { text: '离线', value: 0 }]"
      >
        <template slot-scope="{ row }">
          <el-tag size="mini" :type="row.isLine === 1 ? 'success' : 'info'">
            {{ row.isLine === 1 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="读写权限"
        column-key="IsWrite"
        prop="IsWrite"
        :filters="[{ text: '读写', value: 1 }, { text: '只读', value: 0 }]"
      >
        <template slot-scope="{ row }">
          {{ row.IsWrite === 1 ? '读写' : '只读' }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        label="更新时间"
        prop="updateDateTime"
      />
      <el-table-column sortable="custom" label="最新值" prop="value" />
      <el-table-column label="单位" prop="unit" />
      <!-- <el-table-column sortable label="单位" prop="unit" /> -->
      <el-table-column label="操作" width="280">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="showHistryData(row.PointId)">
            查看数据
          </el-button>
          <Write-Popover
            v-if="row.editable && writePermission"
            :id="row.PointId"
            :project="gatewayInfo.PID"
            :pointInfo="{
              pname: row.PointName,
              mname: gatewayInfo.NAME
            }"
            :type="gatewayInfo.PROTOCOL"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      :current-page.sync="pagination.currentPage"
      :page-size.sync="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
    <HistoryDialog
      ref="historyDialog"
      :showRelatePointDisabled="true"
      :point-ids="searchId"
    />
  </div>
</template>

<script>
import { getDevicePointPage, getPointRealTimeData } from '@/api/device_new'
import HistoryDialog from '@/components/HistoryDialog'
import mqtt from 'mqtt'
import WritePopover from '@/views/monitor/component/WritePopover'

export default {
  components: {
    HistoryDialog,
    WritePopover
  },
  props: {
    writePermission: Boolean,
    gatewayInfo: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      isRefresh: true,

      tableLoading: false,
      tableData: [],
      filterForm: {
        PointName: '',
        isLine: undefined, // 是否在线 1在线 0离线
        IsWrite: undefined, // 1读写 0只读
        SortType: null, // enum [ updateDateTime, PointName, VALUE ]
        IsAsc: undefined
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      searchId: null
    }
  },
  computed: {
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  watch: {
    gatewayInfo: {
      handler() {
        this.fetchTableData()
        if (this.gatewayInfo.PROTOCOL === 'MQTT') {
          // 说明是mqtt网关
          this.mqttClient = mqtt.connect('wss:mqtt.coolcare.link:8084/mqtt', {
            connectTimeout: 40000, // 超时时间
            // 认证信息
            clientId: `mqttjs_${Math.random()
              .toString(16)
              .substr(2, 10)}_${this.$store.state.app.userInfo.uid}`,
            username: 'webclient',
            password: 'webclient.coolcare@Sinocold'
          })
          this.mqttClient.on('error', error => {
            this.$message.error('与服务器连接失败')
            console.error('连接失败:', error)
          })
          this.mqttClient.on('connect', () => {
            // 订阅一个主题(点位实时数据)
            this.mqttClient.subscribe(
              `gw/mq/${this.gatewayInfo.DESCRIBES}/realtime/#`,
              { qos: 1 },
              error => {
                if (!error) {
                  // ('订阅成功')
                } else {
                  this.mqttClient.end()
                }
              }
            )
            this.mqttClient.subscribe(
              `gw/mq/${this.gatewayInfo.DESCRIBES}/response`,
              { qos: 1 },
              error => {
                if (error) {
                  console.error(error)
                }
              }
            )
            this.mqttClient.on('message', (topic, message) => {
              const res = JSON.parse(message.toString())
              if (topic.includes('/realtime')) {
                // 实时数据刷新
                let time = ''
                if (res.time) {
                  time = this._dateFormat(
                    res.time * 1000,
                    'YYYY-MM-DD HH:mm:ss'
                  )
                  this.tableData.forEach(item => {
                    let temp
                    temp = res[item.prop1] && res[item.prop1][item.prop2]
                    if (temp !== undefined) {
                      item.updateDateTime = time
                      if (temp !== item.value) {
                        item.value = temp
                      }
                    }
                  })
                }
              }
            })
          })
        }
      },
      deep: true
    },
    'filterForm.PointName': function() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    isRefresh: {
      handler: function(val) {
        if (val) {
          const timer = setInterval(() => {
            getPointRealTimeData(this.tableData.map(item => item.PointId))
              .then(res => {
                if (res.data.Code === 200) {
                  const data = res.data.Data
                  this.tableData.forEach(item => {
                    const temp = data.find(
                      item2 => item.PointId === item2.PointId
                    )
                    item.updateDateTime = temp.updateDateTime
                    item.value = temp.value
                    item.isLine = temp.isLine
                  })
                }
              })
              .catch(err => {
                console.error(err)
              })
          }, 10 * 1000)
          if (!this.timers) {
            this.timers = []
          }
          this.timers.push(timer)
        } else {
          this.timers.forEach(timer => {
            clearInterval(timer)
          })
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    if (this.timers) {
      this.timers.forEach(timer => {
        clearInterval(timer)
      })
    }
    // 如果是mqtt网关，关闭websocket连接
    this.mqttClient && this.mqttClient.end()
  },
  methods: {
    sortChange(val) {
      // updateDateTime, PointName, VALUE
      if (val.prop === 'updateDateTime') {
        this.filterForm.SortType = 0
      } else if (val.prop === 'PointName') {
        this.filterForm.SortType = 1
      } else if (val.prop === 'value') {
        this.filterForm.SortType = 2
      }
      this.filterForm.IsAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    filterChange(filter) {
      this.filterForm.isLine = filter.isLine
      this.filterForm.IsWrite = filter.IsWrite
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    showHistryData(id) {
      this.$refs.historyDialog.toggleDialog()
      this.searchId = [id]
    },
    fetchTableData() {
      this.tableLoading = true
      getDevicePointPage({
        DeviceId: this.gatewayInfo.id, // integer($int32) 网关id
        isLine: this.filterForm.isLine, // integer($int32) 是否在线 1在线 0离线
        IsWrite: this.filterForm.IsWrite, // integer($int32) 1读写 0只读
        PointName: this.filterForm.PointName, // string 点位名称
        SortType: this.filterForm.SortType, // string 网关点位列表排序类型 默认更新时间
        IsAsc: this.filterForm.IsAsc, // boolean 是否升序 默认false降序
        PageIndex: this.pagination.currentPage, // integer($int32)
        PageSize: this.pagination.pageSize // integer($int32)
      })
        .then(res => {
          const data = res.data.Data
          if (res.data.Code === 200) {
            data.Data.forEach(item => {
              if (this.gatewayInfo.PROTOCOL === 'MQTT') {
                const props = item.PointName.split('.')
                item.prop1 = props[0]
                item.prop2 = item.PointName.replace(props[0] + '.', '')
              }
              item.show = false
              item.editable =
                item.function === 1 ||
                item.function === 3 ||
                this.gatewayInfo.PROTOCOL === 'MQTT'
              item.writeValue = null
              item.writeLoading = false
            })
            this.tableData = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.tableData = []
            this.$message.error('点位列表加载错误')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('点位列表加载错误')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    isNumber(num) {
      var re = /^-?[0-9]+.?[0-9]*$/ // 判断字符串是否为数字 （判断正整数 /^[1-9]+[0-9]*]*$/）
      if (!re.test(num)) {
        return false
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.gateway-pointlist {
  .el-pagination {
    text-align: center;
    margin-top: 25px;
  }
  .online {
    &:before {
      content: '';
      display: inline-block;
      width: 0.6em;
      height: 0.6em;
      margin-right: 6px;
      border-radius: 50%;
      background: green;
    }
  }
  .offline {
    &:before {
      content: '';
      display: inline-block;
      width: 0.6em;
      height: 0.6em;
      margin-right: 6px;
      border-radius: 50%;
      background: #dbdbdb;
    }
  }
}
</style>
