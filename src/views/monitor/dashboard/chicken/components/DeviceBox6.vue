<template>
  <div class="dashboardChicken-box-SKDJ8923DS344 box-style">
    <el-row :gutter="20">
      <el-col :span="6" class="info-item">
        <div class="label">
          通风模式
        </div>
        <div>
          <span class="value">{{ data.VentilatePattern || '-' }}</span>
        </div>
      </el-col>
      <el-col
        :span="8"
        class="info-item"
        style="border-right: 1px solid #e8e8e8;"
      >
        <div class="label">
          当前风量
        </div>
        <div>
          <span class="value">
            {{
              typeof data.VentilateVolume === 'number'
                ? data.VentilateVolume
                : '-'
            }}
            <span class="unit">m3/h</span>
          </span>
        </div>
      </el-col>
      <el-col :span="10" class="info-item" style="border-left: 0;">
        <el-row :gutter="20" class="fan-list">
          <el-col
            v-for="(item, index) in data.VentilateList"
            :key="item.PointId"
            :span="3"
            style="padding-top: 6; padding-bottom: 0"
          >
            <el-tooltip
              v-if="
                data.IntervalVentilate !== 0 &&
                  data.IntervalVentilate - 1 === index
              "
              effect="dark"
              placement="top"
            >
              <div slot="content" style="text-align: center;">
                <span style="line-height: 20px;"
                  >间歇周期：{{ data.VentilateIntervalCycle }} s</span
                >
                <br />
                需要运行时间：{{ data.VentilateRunTime }} s
              </div>
              <c-svg
                class="fan-icon fan-icon-yellow"
                name="m_ceiling_fan"
              ></c-svg>
            </el-tooltip>
            <c-svg
              v-else
              :class="['fan-icon', item.Value === 0 ? 'fan-icon-grey' : null]"
              name="m_ceiling_fan"
            ></c-svg>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="padding: 24.5px 0" type="flex">
      <el-col :span="6" class="info-item">
        <div class="label">
          通风等级
        </div>
        <div>
          <span class="value">{{ data.VentilateLevel }}</span>
        </div>
      </el-col>
      <el-col
        :span="18"
        class="info-item"
        style="padding-top: 0;padding-bottom: 20px;"
      >
        <BarChart
          :data="data.VentilateStageList || []"
          :tooltipPositionNumber="data.Temperature"
          :showTooltip="data.VentilatePercentage"
          :colors="['#fff', '#E6F7FF', '#91D5FF', '#40A9FF', '#096DD9']"
          :tooltipText="`总风量百分比: ${data.VentilatePercentage}%`"
        />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="6" class="info-item">
        <div class="label">
          导流板
        </div>
        <div>
          <span class="value">
            {{ typeof data.GuidePlate === 'number' ? data.GuidePlate : '-' }}
          </span>
          <span class="unit">%</span>
        </div>
      </el-col>
      <el-col :span="6" class="info-item">
        <div class="label">
          小窗
        </div>
        <div>
          <span class="value">
            {{ typeof data.Fenestella === 'number' ? data.Fenestella : '-' }}
          </span>
          <span class="unit">%</span>
        </div>
      </el-col>
      <el-col :span="6" class="info-item">
        <div class="label">
          水泵状态
        </div>
        <div>
          <span class="value">
            {{
              data.WaterPump === 0
                ? '关闭'
                : data.WaterPump === 1
                ? '打开'
                : '-'
            }}
          </span>
        </div>
      </el-col>
      <el-col :span="6" class="info-item">
        <div class="label">
          喷雾状态
        </div>
        <div>
          <span class="value">
            {{ data.Spray === 0 ? '关闭' : data.Spray === 1 ? '打开' : '-' }}
          </span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getHenhouseVentilatePointData } from '@/api/breed'
import BarChart from './BarChart'

export default {
  components: {
    BarChart
  },
  props: {
    sidebarStatus: Boolean,
    projectId: Number,
    deviceId: Number
  },
  data() {
    return {
      data: {}
    }
  },
  watch: {
    projectId() {
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.data = {}
      getHenhouseVentilatePointData({
        projectId: this.projectId,
        mtid: this.deviceId
      }).then(res => {
        if (res.data.Code === 200) {
          this.data = res.data.Data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboardChicken-box-SKDJ8923DS344 {
  .el-col {
    padding-top: 6px;
    padding-bottom: 6px;
  }
  .info-item + .info-item {
    border-left: 1px solid #e8e8e8;
    padding-left: 25px !important;
  }
  .label {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    margin-bottom: 10px;
  }
  .value {
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
    margin-right: 6px;
  }
  .unit {
    font-weight: normal;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
  }
  .fan-icon {
    font-size: 22px;
    color: #52c41a;
  }
  svg.fan-icon-yellow {
    color: #ffa940;
  }
  svg.fan-icon-grey {
    color: #d9d9d9;
  }
}
</style>
