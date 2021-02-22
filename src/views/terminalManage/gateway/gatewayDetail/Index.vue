<template>
  <div class="gateway-detail">
    <page-header :showBack="true" :title="gatewayInfo.DeviceName || ''">
      <template v-slot:right>
        <el-button
          size="mini"
          v-if="permission.editable"
          style="padding: 5px 7px;margin-left: 15px;"
          @click.native="updateName"
        >
          <i class="el-icon-edit" />
          修改名称
        </el-button>
        <el-button
          v-if="gatewayInfo.PROTOCOL === 'Modbus RTU' && permission.maxable"
          size="mini"
          style="padding: 5px 7px;"
          @click.native="updateSN"
        >
          <c-svg name="qiehuan" />
          更换网关
        </el-button>
        <el-button
          size="mini"
          v-if="permission.maxable"
          style="padding: 5px 7px;"
          @click.native="() => $refs.dialogChangeProject.openDialog()"
        >
          <c-svg name="logout" />
          变更项目
        </el-button>
        <el-button
          size="mini"
          v-if="permission.maxable"
          style="padding: 5px 7px;"
          @click.native="() => $refs.dialogChangeCompany.openDialog()"
        >
          <c-svg name="logout" />
          变更企业
        </el-button>
        <el-button
          size="mini"
          :loading="refreshGatewayProjectLoading"
          v-if="permission.maxable"
          style="padding: 5px 7px;"
          @click.native="getewayChangeProject"
        >
          <c-svg name="undo" />
          刷新项目设备
        </el-button>
      </template>
      <template v-slot:bottom>
        <div class="info-table">
          <el-table
            :data="infoTableData"
            :show-header="false"
            style="width: 100%;margin-top: 15px;"
          >
            <el-table-column class-name="col-label" prop="col1" width="120">
            </el-table-column>
            <el-table-column prop="col2">
              <template slot-scope="{ row, $index }">
                <span v-if="$index === 0">{{ row.col2 }}</span>
                <span v-else-if="$index === 1 && row.col2 !== undefined">
                  <el-tag
                    :type="connectStatusMap[row.col2].tagType"
                    size="small"
                  >
                    {{ connectStatusMap[row.col2].text }}
                  </el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column class-name="col-label" prop="col3" width="120">
            </el-table-column>
            <el-table-column prop="col4"> </el-table-column>
            <el-table-column class-name="col-label" prop="col5" width="120">
            </el-table-column>
            <el-table-column prop="col6"> </el-table-column>
            <el-table-column class-name="col-label" prop="col7" width="120">
            </el-table-column>
            <el-table-column show-overflow-tooltip prop="col8">
            </el-table-column>
          </el-table>
        </div>
      </template>
    </page-header>
    <el-tabs v-model="activeName">
      <el-tab-pane
        label="点位数据"
        v-if="
          checkPermission(
            platform === 'DEVICE_CONNECT'
              ? [248, 249, 250, 251]
              : [243, 244, 245, 246]
          )
        "
        key="first"
        name="first"
      >
        <point-list
          :writePermission="permission.writeable"
          :gateway-info="gatewayInfo"
        />
      </el-tab-pane>
      <el-tab-pane
        key="second"
        label="从站配置"
        v-if="gatewayInfo.PROTOCOL === 'Modbus RTU' && permission.editable"
        name="second"
      >
        <ModbusConfig
          :gateway-info="gatewayInfo"
          @change="gatewayConfigChange"
        />
      </el-tab-pane>
      <el-tab-pane
        label="点位配置"
        v-if="gatewayInfo.DeviceType !== 1 && permission.editable"
        key="thrid"
        name="thrid"
      >
        <MQTTConfig
          v-if="gatewayInfo.PROTOCOL === 'MQTT'"
          :gateway-info="gatewayInfo"
        />
        <ModbusConfigOld
          :gateway-info="gatewayInfo"
          v-if="
            gatewayInfo.PROTOCOL === 'Modbus RTU' &&
              gatewayInfo.DeviceType === 0
          "
        />
        <TCPConfig
          v-if="gatewayInfo.PROTOCOL === 'TCP RTU'"
          :gateway-info="gatewayInfo"
          @change="gatewayConfigChange"
        />
      </el-tab-pane>
      <el-tab-pane key="fourth" name="fourth">
        <el-badge slot="label" :hidden="isBindSimCard" class="flow-badge" is-dot
          ><span>流量管理</span></el-badge
        >
        <div class="content-box">
          <traffic-manage
            @updateBindState="val => (isBindSimCard = val)"
            :device-id="gatewayInfo.id"
            :editPermission="permission.editable"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane
        key="fitth"
        name="fifth"
        label="网关授权"
        v-if="permission.maxable"
      >
        <GatewayAuthorization
          ref="gatewayAuthorization"
          @permissionReg="getUserGetewayPermissionFun"
          :device-id="gatewayInfo.id"
        />
      </el-tab-pane>
    </el-tabs>
    <DialogChangeCompany
      @complete="
        () => {
          getUserGetewayPermissionFun()
          $refs.gatewayAuthorization.fetchTableData()
        }
      "
      :deviceId="gatewayInfo.id"
      ref="dialogChangeCompany"
    />
    <DialogChangeProject
      :deviceId="gatewayInfo.id"
      @complete="
        () =>
          $router.push({
            name: 'gatewayIndex',
            query: { refresh: true }
          })
      "
      ref="dialogChangeProject"
    />
  </div>
</template>

<script>
import PointList from './PointList'
import TrafficManage from './TrafficManage'
import MQTTConfig from './MQTTConfig'
import ModbusConfig from './ModbusConfig'
import ModbusConfigOld from './ModbusConfigOld'
import TCPConfig from './TCPConfig'
import GatewayAuthorization from './GatewayAuthorization'
import {
  updateDevicesName,
  updateDevicesSN,
  ckDeviceNo,
  getDeviceInfo,
  refreshDeviceModelTree
} from '@/api/device_new'
import DialogChangeProject from '../component/DialogChangeProject'
import DialogChangeCompany from './component/DialogChangeCompany'
import { checkPermission } from '@/utils/permissions'
import { getUserGatewayPermission } from '@/api/userApply'
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
export default {
  components: {
    PointList,
    TrafficManage,
    MQTTConfig,
    ModbusConfig,
    ModbusConfigOld,
    TCPConfig,
    DialogChangeProject,
    DialogChangeCompany,
    GatewayAuthorization
  },
  data() {
    return {
      activeName: 'first',
      checkPermission,
      refreshGatewayProjectLoading: false,
      isBindSimCard: true,
      permission: {
        /** 只查看数据，无法操作写入 */
        readable: false,
        /** 可以远程写入，无法配置网关从站设备 */
        writeable: false,
        /** 可以编辑网关从站和基本信息 */
        editable: false,
        /** 最大权限 可以编辑、授权、转移网关 */
        maxable: false
      },
      gatewayInfo: {},
      infoTableData: [
        {
          col1: '序列号',
          col2: undefined,
          col3: '网关类型',
          col4: undefined,
          col5: '所属项目',
          col6: undefined,
          col7: '地址',
          col8: undefined
        },
        {
          col1: '连接状态',
          col2: undefined,
          col3: '数据更新时间',
          col4: undefined,
          col5: '创建时间',
          col6: undefined,
          col7: '创建者',
          col8: undefined
        }
      ],
      connectStatusMap
    }
  },
  computed: {
    platform() {
      return this.$store.state.permissions.platform
    },
    userInfo() {
      return this.$store.state.app.userInfo
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    if (this.platform === 'DEVICE_CONNECT') {
      this.activeName = checkPermission([248, 249, 250, 251])
        ? 'first'
        : checkPermission([250, 251])
        ? 'second'
        : 'third'
    } else {
      this.activeName = checkPermission([243, 244, 245, 246])
        ? 'first'
        : checkPermission([245, 246])
        ? 'second'
        : 'third'
    }
    this.activeName = this.$route.query.tabActiveName || 'first'
    this.gatewayInfo = JSON.parse(this.$route.query.data)
    this.fetchBasicInfo()
    this.getUserGetewayPermissionFun()
  },
  methods: {
    getewayChangeProject() {
      if (!this.gatewayInfo.ProjectID) {
        this.$message.error('当前网关没有所属项目')
        return
      }
      this.refreshGatewayProjectLoading = true
      refreshDeviceModelTree({
        deviceId: this.gatewayInfo.id,
        projectId: this.gatewayInfo.ProjectID
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200 && data.Data) {
            this.$message.success('刷新项目设备成功')
          } else {
            this.$message.error('刷新项目设备失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('刷新项目设备失败')
        })
        .finally(() => {
          this.refreshGatewayProjectLoading = false
        })
    },
    gatewayConfigChange() {
      // 随意修改gatewayInfo,触发pointList组件的watch，实现刷新
      this.$set(this.gatewayInfo, 'temp', new Date())
    },
    updateName() {
      this.$prompt('修改网关名称', '', {
        inputValue: this.gatewayInfo.DeviceName,
        confirmButtonText: '确定',
        inputValidator: function(value) {
          if (value.length > 1 && value.length < 25) {
            return true
          } else {
            return '名称长度（1至25之间）'
          }
        },
        inputErrorMessage: '',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          updateDevicesName({
            deviceID: this.gatewayInfo.id,
            deviceName: value
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('网关名称修改成功')
                this.fetchBasicInfo()
              } else {
                this.$message.error('网关名称修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('网关名称修改失败')
            })
        })
        .catch(() => {})
    },
    updateSN() {
      const _this = this
      this.$prompt('更换网关', '', {
        inputValue: this.gatewayInfo.DESCRIBES,
        inputPlaceholder: '请输入网关序列号',
        confirmButtonText: '确定',
        inputValidator: function(value) {
          if (_this.gatewayInfo.PROTOCOL === 'MQTT') {
            // mqtt网关序列号
            if (/^[A-Z][A-Z\d]{9}$/.test(value)) {
              return true
            } else {
              return '10位（由大写字母、数字组成，字母开头）'
            }
          } else {
            if (/^[A-Z][A-Z0-9]{15}$/.test(value)) {
              ckDeviceNo({
                deviceno: value
              }).then(res => {
                if (
                  res.data.Code === 2000 &&
                  res.data.Data.IsSuccess === true
                ) {
                  return '该序列号已存在'
                } else {
                  return true
                }
              })
            } else {
              return '16位（由大写字母、数字组成，字母开头）'
            }
          }
        },
        inputErrorMessage: '',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          updateDevicesSN({
            SN: value,
            deviceID: this.gatewayInfo.id
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('网关更换成功')
                this.gatewayInfo.DESCRIBES = value
              } else {
                this.$message.error('网关更换失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('网关更换失败')
            })
        })
        .catch(() => {})
    },
    fetchBasicInfo() {
      getDeviceInfo({
        deviceId: this.gatewayInfo.id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.id = data.DeviceId
            this.gatewayInfo = data
            this.infoTableData[0].col2 = data.DESCRIBES
            this.infoTableData[0].col4 = data.PROTOCOL
            this.infoTableData[0].col6 = data.ProjectName
            let address = ''
            if (data.DeviceAddress) {
              try {
                const obj = JSON.parse(data.DeviceAddress)
                address = obj.address
              } catch (error) {
                console.error(error)
              }
            }
            this.infoTableData[0].col8 = address
            this.infoTableData[1].col2 = data.ConnectStatus
            this.infoTableData[1].col4 = data.DataUpdateDateTime
            this.infoTableData[1].col6 = data.CreateDateTime
            this.infoTableData[1].col8 = data.UserName
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    //网关授权tab页权限判断
    getUserGetewayPermissionFun() {
      getUserGatewayPermission({
        deviceListId: [this.gatewayInfo.id],
        userId: this.userInfo.uid
      })
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            const funcGroupId = data[0].FuncGroupId
            this.permission = {
              readable: funcGroupId >= 1,
              writeable: funcGroupId >= 2,
              editable: funcGroupId >= 3,
              maxable: funcGroupId === 4
            }
          } else {
            this.$message.error('获取网关权限失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取网关权限失败')
        })
        .finally(() => {
          if (!this.permission.readable) {
            this.$message('您没有查看该网关详情的权限')
            this.$router.go(-1)
          }
        })
    }
  }
}
</script>

<style lang="scss">
.gateway-detail {
  .info-table {
    .el-table td {
      padding: 7px 0;
    }
    .col-label {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }
  .flow-badge {
    .el-badge__content {
      right: 0px;
      top: 13px;
      width: 5px;
      height: 5px;
    }
  }
  .el-tabs__nav-scroll {
    padding-left: 40px;
    background: #fff;
  }
  .el-tabs__header {
    margin: 0;
  }
}
</style>
