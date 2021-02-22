<template>
  <div class="slaveStation-detail">
    <page-header
      :showBack="true"
      :title="slaveStationInfo.DeviceModuleName || ''"
    >
      <template v-slot:right>
        <el-button
          size="mini"
          style="padding: 5px 7px;margin-left: 15px;"
          @click.native="updateName"
        >
          <i class="el-icon-edit" />
          修改名称
        </el-button>
        <el-button
          size="mini"
          style="padding: 5px 7px;"
          @click.native="() => $refs.dialogChangeImpower.openDialog()"
        >
          <c-svg name="logout" />
          变更授权范围
        </el-button>
      </template>
      <template v-slot:bottom>
        <div class="info-list">
          <div class="info-item">
            <span>创建时间：</span>
            <span>{{ slaveStationInfo.CreateTime }}</span>
          </div>
          <div class="info-item">
            <span>创建者：</span>
            <span>{{ slaveStationInfo.UserName }}</span>
          </div>
          <div class="info-item">
            <span>授权范围：</span>
            <span>{{ scopeString }}</span>
            &nbsp;&nbsp;
            <el-tooltip
              v-if="slaveStationInfo.PermissionType !== 0"
              placement="top"
            >
              <div slot="content" style="max-width: 300px;line-height: 22px;">
                {{ slaveStationInfo.PermissionScope }}
              </div>
              <el-link type="primary" :underline="false">查看</el-link>
            </el-tooltip>
          </div>
          <div class="info-item">
            <span>串口参数：</span>
            <span>{{
              `${slaveStationInfo.BaudRate ||
                '-'}，${slaveStationInfo.DataBit ||
                '-'}， ${slaveStationInfo.CheckBit ||
                '-'}，${slaveStationInfo.StopBit || '-'}`
            }}</span>
            &nbsp;&nbsp;
            <el-link
              @click.native="() => $refs.dialogChangeSerialParam.openDialog()"
              type="primary"
              :underline="false"
              >修改</el-link
            >
          </div>
          <div class="info-item">
            <span>所属品类：</span>
            <span>{{
              slaveStationInfo.BigTypeName
                ? `${slaveStationInfo.BigTypeName}/${slaveStationInfo.SmallTypeName}`
                : ''
            }}</span>
            &nbsp;&nbsp;
            <el-link
              @click.native="
                () =>
                  $refs.dialogChangeDeviceType.openDialog(
                    slaveStationInfo.DeviceModuleId
                  )
              "
              type="primary"
              :underline="false"
              >修改</el-link
            >
          </div>
        </div>
      </template>
    </page-header>
    <el-tabs class="page-tabs" v-model="activeName">
      <el-tab-pane label="点位列表" name="first">
        <PointList :info="slaveStationInfo" />
      </el-tab-pane>
      <el-tab-pane label="已接入网关" name="third">
        <GatewayList :module-info="slaveStationInfo" />
      </el-tab-pane>
    </el-tabs>
    <DialogChangeImpower
      :info="slaveStationInfo"
      @refresh="fetchInfo"
      ref="dialogChangeImpower"
    />
    <DialogChangeSerialParam
      @refresh="fetchInfo"
      :info="slaveStationInfo"
      ref="dialogChangeSerialParam"
    />
    <DialogChangeDeviceType
      @refresh="fetchInfo"
      ref="dialogChangeDeviceType"
    ></DialogChangeDeviceType>
  </div>
</template>

<script>
import DialogChangeImpower from './DialogChangeImpower'
import DialogChangeSerialParam from './DialogChangeSerialParam'
import DialogChangeDeviceType from './DialogChangeDeviceType'
import PointList from './PointList'
import GatewayList from './GatewayList'
import { getDeviceModulePage, updateDeviceModuleName } from '@/api/deviceModule'
export default {
  components: {
    DialogChangeImpower,
    DialogChangeSerialParam,
    DialogChangeDeviceType,
    PointList,
    GatewayList
  },
  data() {
    return {
      activeName: 'first',
      slaveStationInfo: {}
    }
  },
  computed: {
    scopeString() {
      if (
        this.slaveStationInfo.PermissionScope &&
        this.slaveStationInfo.PermissionScope.length > 10
      ) {
        return this.slaveStationInfo.PermissionScope.slice(0, 10) + '...'
      } else {
        return this.slaveStationInfo.PermissionScope
      }
    }
  },
  mounted() {
    this.slaveStationInfo = JSON.parse(this.$route.query.data)
    this.fetchInfo()
  },
  methods: {
    fetchInfo() {
      getDeviceModulePage({
        DeviceModuleId: this.slaveStationInfo.DeviceModuleId,
        DeviceModuleName: undefined,
        SortType: undefined,
        IsAsc: undefined,
        pageIndex: undefined,
        pageSize: undefined
      })
        .then(res => {
          if (res.data.Code == 200) {
            this.slaveStationInfo = res.data.Data.Data[0]
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    updateName() {
      this.$prompt('修改名称', '', {
        inputValue: this.slaveStationInfo.DeviceModuleName,
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
          updateDeviceModuleName({
            deviceModuleId: this.slaveStationInfo.DeviceModuleId,
            deviceModuleName: value
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('名称修改成功')
                this.fetchInfo()
              } else {
                this.$message.error('名称修改失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss">
.slaveStation-detail {
  .info-list {
    margin-top: 15px;
    color: #797878;
    font-size: 14px;
    line-height: 24px;
    .info-item {
      display: inline-flex;
      align-items: center;
      margin-right: 30px;
    }
  }
}
</style>
