<template>
  <div class="company-dashboard">
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
          <div style="color: #8FA2B5;">
            {{ projectInfo.SubareaName }} | {{ projectInfo.address }}
          </div>
        </div>
      </div>
      <div class="right-wrap" style="display: flex;align-items: center">
        <div class="right-wrap-item">
          <div style="font-size: 14px;color: rgba(0, 0, 0, 0.45);">
            设备数
          </div>
          <div class="project-total">{{ projectInfo.RunDays }}</div>
        </div>
        <div class="right-wrap-line"></div>
        <div class="right-wrap-item">
          <div style="font-size: 14px;color: rgba(0, 0, 0, 0.45);">
            企业内排名
          </div>
          <div class="project-total">
            {{ ElectricOverview.Rank ? ElectricOverview.Rank : '-' }}/<span
              style="font-size: 24px;color: rgba(0, 0, 0, 0.45);"
              >{{
                ElectricOverview.RankTotal ? ElectricOverview.RankTotal : '-'
              }}</span
            >
          </div>
        </div>
        <div class="right-wrap-line"></div>
        <div class="right-wrap-item">
          <div style="font-size: 14px;color: rgba(0, 0, 0, 0.45);">
            运行天数
          </div>
          <div class="project-total">{{ projectInfo.RunDays }}</div>
        </div>
      </div>
    </div>
    <div class="main-content content-box">
      <el-row :gutter="16">
        <el-col :span="16">
          <card-overview />
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
          <card-device />
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
import { GetElectricOverview, GetProject } from '@/api/dashboard'
export default {
  components: {
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
      ElectricOverview: {},
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
  created() {
    this.fetchTableData()
  },
  methods: {
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
      GetElectricOverview({
        Type: 0,
        IsGetRank: true,
        DateType: 1,
        CompanyId: this.company.id,
        SubareaIdList: [this.project.SubareaId],
        TimeQuantum: {
          StartDate: this.timeForMat(1, 'YYYY-MM-DD hh:mm:ss')[0],
          EndDate: this.timeForMat(1, 'YYYY-MM-DD hh:mm:ss')[1]
        }
      }).then(res => {
        if (res.data.Code === 200) {
          this.ElectricOverview = res.data.Data
        } else {
          this.$message.error(res.data.Message)
        }
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
  .card-title{
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
  .right-wrap-line{
    margin: 0 32px;
    width: 1px;
    height: 40px;
    background: #E9E9E9;
  }
}
</style>
