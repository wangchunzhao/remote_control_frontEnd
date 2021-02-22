<template>
  <div class="content-box dashboard-chicken">
    <div class="title-wrap" style="padding-top: 0;">
      <span class="title" style="font-size: 20px;font-weight: bold;">
        区域汇总
      </span>
      <span style="font-size: 14px;color: rgba(0,0,0,0.45);"
        >数据更新时间：{{ date }}</span
      >
    </div>
    <el-row :gutter="24" type="flex">
      <el-col :span="6">
        <OverviewBox1 />
      </el-col>
      <el-col :span="6">
        <OverviewBox2 />
      </el-col>
      <el-col :span="6">
        <OverviewBox3 />
      </el-col>
      <el-col :span="6">
        <WeatherBox />
      </el-col>
    </el-row>
    <div style="position: relative;">
      <div
        style="position: absolute;top: 10px;font-size: 20px;font-weight: bold;"
      >
        车间看板
      </div>
      <el-tabs v-model="activeName" type="card" style="margin-top: 30px;">
        <el-tab-pane
          :key="device.mtid"
          v-for="device in deviceList"
          :label="device.mname"
          :name="device.mtid + device.mname"
        >
          <div slot="label">
            {{ device.mname }}
            <c-svg
              style="margin-left: 12px;color: #FA8C16;"
              name="star-fill"
            ></c-svg>
            <span style="color: #FA8C16;">
              {{ device.Score }}
            </span>
          </div>
          <div class="alert-wrap">
            <span>
              <c-svg name="info-circle-fill"></c-svg>
              {{
                `${device.mname} 本周评分为 ${
                  device.Score === null ? '-' : device.Score
                } 分，${statusTextFactory(device.Score)}`
              }}
            </span>
            <el-link :underline="false" type="primary">查看详情</el-link>
          </div>
          <div class="title-wrap">
            <span class="title">车间实时数据</span>
          </div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-row :gutter="24" style="margin-bottom: 12px;">
                <el-col :span="12">
                  <StatusBox1
                    :deviceId="device.mtid"
                    :projectId="project.id"
                    :sidebarStatus="sidebarStatus"
                    :is-active="device.mtid + device.mname === activeName"
                  />
                </el-col>
                <el-col :span="12">
                  <StatusBox2
                    :deviceId="device.mtid"
                    :projectId="project.id"
                    :sidebarStatus="sidebarStatus"
                    :is-active="device.mtid + device.mname === activeName"
                  />
                </el-col>
              </el-row>
              <el-row :gutter="24" style="margin-bottom: 12px;">
                <el-col :span="12">
                  <StatusBox3
                    :deviceId="device.mtid"
                    :projectId="project.id"
                    :sidebarStatus="sidebarStatus"
                    :is-active="device.mtid + device.mname === activeName"
                  />
                </el-col>
                <el-col :span="12">
                  <StatusBox4
                    :deviceId="device.mtid"
                    :projectId="project.id"
                    :sidebarStatus="sidebarStatus"
                    :is-active="device.mtid + device.mname === activeName"
                  />
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="12">
                  <StatusBox5
                    :deviceId="device.mtid"
                    :projectId="project.id"
                    :sidebarStatus="sidebarStatus"
                    :is-active="device.mtid + device.mname === activeName"
                  />
                </el-col>
                <el-col :span="12">
                  <StatusBox6
                    :deviceId="device.mtid"
                    :projectId="project.id"
                    :sidebarStatus="sidebarStatus"
                    :is-active="device.mtid + device.mname === activeName"
                  />
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="12">
              <DeviceBox6
                :deviceId="device.mtid"
                :projectId="project.id"
                :sidebarStatus="sidebarStatus"
              />
            </el-col>
          </el-row>
          <div class="title-wrap">
            <span class="title">车间参数设置</span>
            <el-button icon="el-icon-setting" size="mini">修改设置</el-button>
          </div>
          <DeviceBox1 :deviceId="device.mtid" style="margin-top: 14px;" />
          <div class="title-wrap">
            <span class="title">生产数据统计</span>
          </div>
          <el-row :gutter="24" type="flex">
            <el-col :span="6">
              <DeviceBox2
                :deviceId="device.mtid"
                :projectId="project.id"
                :is-active="device.mtid + device.mname === activeName"
                :sidebarStatus="sidebarStatus"
              />
            </el-col>
            <el-col :span="6">
              <DeviceBox3
                :deviceId="device.mtid"
                :projectId="project.id"
                :is-active="device.mtid + device.mname === activeName"
                :sidebarStatus="sidebarStatus"
              />
            </el-col>
            <el-col :span="6">
              <DeviceBox4
                :deviceId="device.mtid"
                :projectId="project.id"
                :is-active="device.mtid + device.mname === activeName"
                :sidebarStatus="sidebarStatus"
              />
            </el-col>
            <el-col :span="6">
              <DeviceBox5 :deviceId="device.mtid" :projectId="project.id" />
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import OverviewBox1 from './components/OverviewBox1'
import OverviewBox2 from './components/OverviewBox2'
import OverviewBox3 from './components/OverviewBox3'
import WeatherBox from './components/WeatherBox'
import DeviceBox1 from './components/DeviceBox1'
import DeviceBox2 from './components/DeviceBox2'
import DeviceBox3 from './components/DeviceBox3'
import DeviceBox4 from './components/DeviceBox4'
import DeviceBox5 from './components/DeviceBox5'
import DeviceBox6 from './components/DeviceBox6'
import StatusBox1 from './components/StatusBox1'
import StatusBox2 from './components/StatusBox2'
import StatusBox3 from './components/StatusBox3'
import StatusBox4 from './components/StatusBox4'
import StatusBox5 from './components/StatusBox5'
import StatusBox6 from './components/StatusBox6'
import { queryDeviceInfo } from '@/api/model'
export default {
  name: 'DashboardChicken',
  components: {
    OverviewBox1,
    OverviewBox2,
    OverviewBox3,
    WeatherBox,
    DeviceBox1,
    DeviceBox2,
    DeviceBox3,
    DeviceBox4,
    DeviceBox5,
    DeviceBox6,
    StatusBox1,
    StatusBox2,
    StatusBox3,
    StatusBox4,
    StatusBox5,
    StatusBox6
  },
  data() {
    return {
      date: '',
      deviceList: [],
      activeName: ''
    }
  },
  computed: {
    project() {
      return this.$store.state.app.project
    },
    sidebarStatus() {
      return this.$store.state.app.sidebar
    }
  },
  watch: {
    project: {
      handler: function() {
        this.date = this._dateFormat(new Date(), 'YYYY-MM-DD HH:mm')
        this.fetchDevice()
      },
      immediate: true
    }
  },
  methods: {
    fetchDevice() {
      queryDeviceInfo({
        ProjectId: this.project.id,
        BigTypeId: 319,
        SmallTypeId: 329,
        ModelTreeName: '',
        ModelTreeStatusList: undefined,
        PageIndex: undefined,
        PageSize: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.deviceList = res.data.Data.Data
            if (this.deviceList.length) {
              this.activeName =
                this.deviceList[0].mtid + this.deviceList[0].mname
            }
          } else {
            this.deviceList = []
          }
        })
        .catch(err => {
          console.error(err)
          this.deviceList = []
        })
    },
    statusTextFactory(score) {
      if (score === null) {
        return ''
      }
      if (score <= 3.5) {
        return '车间运行状态需要优化'
      }
      if (score > 3.5) {
        return '车间运行状态良好'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
div.dashboard-chicken {
  padding: 0;
  background-color: transparent;
  .alert-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border-radius: 3px;
    border: 1px solid #ffe58f;
    background-color: #fffbe6;
    color: rgba(0, 0, 0, 0.65);
    .icon {
      color: #faad14;
      width: 18px;
      height: 18px;
      margin-right: 6px;
      transform: translateY(2px);
    }
  }
  .title-wrap {
    display: flex;
    align-items: center;
    margin: 18px 0 10px 0;
  }
  .title {
    margin: 0 8px;
  }
  .box-style {
    padding: 16px 20px;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    background-color: #fff;
  }
}
</style>

<style lang="scss">
div.dashboard-chicken {
  .el-tabs__item.is-active {
    background-color: #fff;
  }
  .el-tabs__header {
    margin-left: 108px;
  }
}
</style>
