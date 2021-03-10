<template>
  <el-card shadow="never" class="box-card card-overview">
    <div slot="header" class="clearfix">
      <div class="card-title">运行概览</div>
    </div>
    <el-row :gutter="0">
      <!--      无-->
      <el-col :span="6" class="overview-box border">
        <div
          class="can-click-item"
          @click="
            checkJumpRoutingPermission({ name: 'energyManageIndex' }, [120])
          "
        >
          <div class="top">
            当月能耗
            <el-link :underline="false" type="primary" class="arrow">
              <i class="el-icon-right" />
            </el-link>
          </div>
          <div class="bottom">
            <span class="focus-num">{{ overview.CurrentMonthEnergy }}</span>
            kWh
          </div>
        </div>
      </el-col>
      <!--      无-->
      <el-col :span="6" class="overview-box border">
        <div
          class="can-click-item"
          @click="
            checkJumpRoutingPermission({ name: 'alarmManageIndex' }, [34])
          "
        >
          <div class="top">
            当月报警
            <el-link class="arrow" :underline="false" type="primary">
              <i class="el-icon-right" />
            </el-link>
          </div>
          <div class="bottom">
            <span class="focus-num">{{ overview.CurrentMonthAlarm }}</span>
          </div>
        </div>
      </el-col>
      <!--      无-->
      <el-col :span="6" class="overview-box border">
        <div
          class="can-click-item"
          @click="checkJumpRoutingPermission({ name: 'repairOrder' }, [40])"
        >
          <div class="top">
            当月工单
            <el-link class="arrow" :underline="false" type="primary">
              <i class="el-icon-right" />
            </el-link>
          </div>
          <div class="bottom">
            <span class="focus-num">{{ overview.CurrentMonthRepair }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6" class="overview-box border">
        <div
          class="can-click-item"
          @click="checkJumpRoutingPermission({ name: 'gatewayIndex' }, [81])"
        >
          <div class="top">
            当前在线网关
            <el-link :underline="false" type="primary" class="arrow">
              <i class="el-icon-right" />
            </el-link>
          </div>
          <div class="bottom">
            <span class="focus-num">{{ overview.OnlineDeviceList }}</span>
            / {{ overview.DeviceListTotal }}
          </div>
        </div>
      </el-col>
      <!--      无-->
      <el-col :span="6" class="overview-box border">
        <div
          class="can-click-item"
          @click="checkJumpRoutingPermission({ name: 'deviceList' }, [51])"
        >
          <div class="top">
            当前运行设备
            <el-link class="arrow" :underline="false" type="primary">
              <i class="el-icon-right" />
            </el-link>
          </div>
          <div class="bottom">
            <span class="focus-num">{{ overview.RunModelTree }}</span>
            / {{ overview.ModelTreeTotal }}
          </div>
        </div>
      </el-col>
      <!--      无-->
      <el-col :span="6" class="overview-box border">
        <div
          class="can-click-item"
          @click="
            checkJumpRoutingPermission(
              {
                path: '/monitor/cold',
                query: { sid: 41, routeType: 'monitorRoute', activeName: 54 }
              },
              ['*']
            )
          "
        >
          <div class="top">
            机组开启数
            <el-link class="arrow" :underline="false" type="primary">
              <i class="el-icon-right" />
            </el-link>
          </div>
          <div class="bottom">
            <span class="focus-num">{{ overview.OpenAircrew }}</span>
            / {{ overview.AircrewTotal }}
          </div>
        </div>
      </el-col>
      <!--      无-->
      <el-col :span="6" class="overview-box border">
        <div
          class="can-click-item"
          @click="
            checkJumpRoutingPermission(
              {
                path: '/monitor/cold',
                query: { sid: 41, routeType: 'monitorRoute', activeName: 8 }
              },
              ['*']
            )
          "
        >
          <div class="top">
            冷柜开启数
            <el-link class="arrow" :underline="false" type="primary">
              <i class="el-icon-right" />
            </el-link>
          </div>
          <div class="bottom">
            <span class="focus-num">{{ overview.OpenCooler }}</span>
            / {{ overview.CoolerTotal }}
          </div>
        </div>
      </el-col>
      <!--      无-->
      <el-col :span="6" class="overview-box border">
        <div
          class="can-click-item"
          @click="
            checkJumpRoutingPermission(
              {
                path: '/monitor/cold',
                query: { sid: 41, routeType: 'monitorRoute', activeName: 3 }
              },
              ['*']
            )
          "
        >
          <div class="top">
            冷库末端开启数
            <el-link class="arrow" :underline="false" type="primary">
              <i class="el-icon-right" />
            </el-link>
          </div>
          <div class="bottom">
            <span class="focus-num">{{ overview.OpenRefrigeratory }}</span>
            / {{ overview.RefrigeratoryTotal }}
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { checkPermission } from '@/utils/permissions'
export default {
  props: {
    overview: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  methods: {
    //校验权限
    checkJumpRoutingPermission(routerParmas = {}, permission = []) {
      if (checkPermission(permission)) {
        this.$router.push(routerParmas)
      } else {
        this.$message.error('当前账号暂无相关权限,请联系管理员')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.card-overview {
  ::v-deep {
    .overview-box {
      padding: 16px 32px;
      height: 88px;
      position: relative;
      &:hover {
        box-shadow: 0px 1px 5px 1px rgba(47, 73, 107, 0.1);
        .arrow {
          display: inline-block;
        }
        &.border::after {
          display: none;
        }
      }
      &.border::after {
        content: '';
        display: inline-block;
        width: 1px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 0;
        background-color: #ebeef5;
        height: 50px;
      }
    }
    .top {
      height: 22px;
      font-size: 16px;
      font-weight: 400;
      color: #8fa2b5;
      line-height: 22px;
      margin-bottom: 8px;
    }
    .bottom {
      color: #8fa2b5;
      font-size: 16px;
    }
    .arrow {
      display: none;
      font-size: 16px;
    }
    .focus-num {
      height: 28px;
      font-size: 22px;
      font-weight: 500;
      color: #000000;
      line-height: 28px;
    }
  }
}
</style>

<style lang="scss">
.card-overview {
  .el-card__body {
    padding: 0;
  }
}
</style>
