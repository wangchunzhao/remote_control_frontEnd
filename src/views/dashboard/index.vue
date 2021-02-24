<template>
  <div class="company-dashboard" :key="reloadKey">
    <div class="company-dashboard-header">
      <div class="left-wrap">
        <img
          class="company-logo"
          :src="
            projectInfo.ProjectImage
              ? projectInfo.ProjectImage
              : 'https://front-end-assets.oss-cn-shanghai.aliyuncs.com/CoolCare_Prepayment_PC/%E5%95%86%E8%B6%85%E6%A0%87%E8%AF%86.png'
          "
          alt=""
        />
        <div>
          <h3 class="company-name">{{ projectInfo.ProjectName }}</h3>
          <div style="color: #8FA2B5;font-size: 15px">
            {{ projectInfo.SubareaName }} | {{ projectInfo.address }}
          </div>
        </div>
      </div>
      <div class="right-wrap" style="display: flex;align-items: center">
        <div class="right-wrap-item">
          <div style="font-size: 14px;color: rgba(0, 0, 0, 0.45);">
            设备数
          </div>
          <div class="project-total">{{ overview.ModelTreeTotal }}</div>
        </div>
        <div class="right-wrap-line"></div>
        <div class="right-wrap-item">
          <div style="font-size: 14px;color: rgba(0, 0, 0, 0.45);">
            企业内排名
          </div>
          <div class="project-total">
            {{ overview.ProjectRank ? overview.ProjectRank : '-' }}/
            <span style="font-size: 24px;color: rgba(0, 0, 0, 0.45);"
              >{{ overview.ProjectTotal ? overview.ProjectTotal : '-' }}
            </span>
          </div>
        </div>
        <div class="right-wrap-line"></div>
        <div class="right-wrap-item">
          <div style="font-size: 14px;color: rgba(0, 0, 0, 0.45);">
            运行天数
          </div>
          <div class="project-total">{{ overview.RunDays }}</div>
        </div>
      </div>
    </div>
    <div class="main-content content-box">
      <el-row :gutter="16">
        <el-col :span="16">
          <card-overview :overview="overview" />
        </el-col>
        <el-col :span="8">
          <card-quick-entry />
        </el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top: 16px;">
        <el-col :span="8">
          <card-alarm />
        </el-col>
        <el-col :span="8">
          <card-repair />
        </el-col>
        <el-col :span="8">
          <card-device @watchHistory="watchHistory" />
        </el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top: 16px;">
        <el-col :span="16">
          <card-trend />
        </el-col>
        <el-col :span="8">
          <card-qrcode />
        </el-col>
      </el-row>
      <el-row style="margin-top: 20px"></el-row>
    </div>
    <HistoryDialog
      ref="historyDialog"
      :point-ids="history.point"
      :device-id="history.deviceId"
    />
  </div>
</template>

<script>
import CardTrend from './CardTrend'
import CardQuickEntry from './CardQuickEntry'
import CardOverview from './CardOverview'
import CardAlarm from './CardAlarm'
import CardRepair from './CardRepair'
import CardDevice from './CardDevice'
import CardQrcode from './CardQrcode'
import HistoryDialog from '@/components/HistoryDialog'
import { GetProject } from '@/api/dashboard'
import { getProjectOverview } from '@/api/project'

export default {
  components: {
    HistoryDialog,
    CardQuickEntry,
    CardOverview,
    CardAlarm,
    CardRepair,
    CardDevice,
    CardTrend,
    CardQrcode
  },
  data() {
    return {
      reloadKey: 1,
      history: {
        point: null,
        deviceId: 0
      },
      overview: {},
      projectInfo: {}
    }
  },
  computed: {
    company() {
      return this.$store.state.app.company
    },
    project() {
      return this.$store.state.app.project
    }
  },
  watch: {
    project: {
      handler: function(val) {
        if (val) {
          this.fetchTableData()
          this.reloadKey++
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    //查看点位历史数据
    watchHistory(pointId, deviceId) {
      this.history.point = [pointId]
      this.history.deviceId = deviceId
      this.$refs.historyDialog.toggleDialog()
    },
    //获取数据
    fetchTableData() {
      GetProject({
        projectId: this.project.id
      }).then(res => {
        if (res.data.Code === 200) {
          this.projectInfo = res.data.Data
          this.projectInfo.address = this.projectAddressForMat(
            res.data.Data.Address
          )
        } else {
          this.$message.error(res.data.Message)
        }
      })
      getProjectOverview({
        ProjectId: this.project.id,
        CompanyId: this.company.id
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.overview = res.data.Data
          } else {
            this.$message.error('获取项目概览失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取项目概览失败')
        })
    }
  }
}
</script>

<style lang="scss">
.company-dashboard {
  .main-content {
    background-color: transparent;
    padding: 0;
  }
  .box-card {
    .el-card__header {
      font-weight: 500;
      color: #000;
    }
  }
  .card-title {
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 24px;
  }
}
.company-dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 24px 32px;
  .left-wrap {
    display: flex;
    & > div {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
  }
  .company-name {
    margin: 0;
    height: 28px;
    font-size: 20px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 28px;
  }
  .company-logo {
    width: 72px;
    height: 72px;
    border-radius: 4px;
    margin-right: 20px;
  }
  .project-total {
    font-size: 30px;
    font-family: DINPro-Medium, DINPro;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 38px;
  }
  .right-wrap-line {
    margin: 0 32px;
    width: 1px;
    height: 40px;
    background: #e9e9e9;
  }
}
</style>
