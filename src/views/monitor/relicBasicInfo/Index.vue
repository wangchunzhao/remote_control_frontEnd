<template>
  <div class="content-box reliceBasicInfo">
    <BasicInfoPanel
      :systemId="$route.query.sid"
      :projectId="projectId"
      :title="project.ProjectName"
      :content="{
        times: data.times,
        type: data.type,
        user: data.user,
        ownership: data.ownership,
        protectionLevel: data.protectionLevel,
        managementOrganization: data.managementOrganization,
        Address: data.Address
      }"
    />
    <SwiperPanel
      :systemId="$route.query.sid"
      :projectId="projectId"
      :imgList="data.ReferencePictures"
    />
    <TextPanel
      :projectId="projectId"
      :content="data.briefIntroduction"
      :systemId="$route.query.sid"
      title="简介"
      field="briefIntroduction"
    />
    <TextPanel
      :projectId="projectId"
      :content="data.culturalEnvironment"
      :systemId="$route.query.sid"
      title="自然与人文环境"
      field="culturalEnvironment"
    />
    <TextPanel
      :projectId="projectId"
      :content="data.statusOfCulturalRelics"
      :systemId="$route.query.sid"
      title="文物本体状况"
      field="statusOfCulturalRelics"
    />
    <TextPanel
      :projectId="projectId"
      :content="data.historicalEvolution"
      :systemId="$route.query.sid"
      title="历史沿革"
      field="historicalEvolution"
    />
    <TextPanel
      :projectId="projectId"
      :content="data.valueAssessment"
      :systemId="$route.query.sid"
      title="价值评估"
      field="valueAssessment"
    />
    <TextPanel
      :projectId="projectId"
      :content="data.workSituation"
      :systemId="$route.query.sid"
      title="调查、考古、保存、展示工作"
      field="workSituation"
    />
    <TextPanel
      :projectId="projectId"
      :content="data.fourWorkSituation"
      :systemId="$route.query.sid"
      title='"四有"工作情况'
      field="fourWorkSituation"
    />
    <TextPanel
      :projectId="projectId"
      :content="data.securityGuard"
      :systemId="$route.query.sid"
      title="安全保卫情况"
      field="securityGuard"
    />
    <DrawingPanel
      :systemId="$route.query.sid"
      :projectId="projectId"
      :imgList="data.Drawing"
    />
  </div>
</template>

<script>
import { getModelInfo } from '@/api/modelInfo'
import TextPanel from './component/TextPanel'
import BasicInfoPanel from './component/BasicInfoPanel'
import SwiperPanel from './component/SwiperPanel'
import DrawingPanel from './component/DrawingPanel'
export default {
  components: {
    TextPanel,
    BasicInfoPanel,
    SwiperPanel,
    DrawingPanel
  },
  data() {
    return {
      data: {
        ReferencePictures: undefined,
        Drawing: undefined,
        Address: undefined,
        modelInfoId: undefined,
        projectId: undefined,
        modelId: undefined,
        times: undefined,
        type: undefined,
        ownership: undefined,
        protectionLevel: undefined,
        managementOrganization: undefined,
        briefIntroduction: undefined,
        culturalEnvironment: undefined,
        statusOfCulturalRelics: undefined,
        valueAssessment: undefined,
        workSituation: undefined,
        fourWorkSituation: undefined,
        securityGuard: undefined
      }
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    project() {
      return this.$store.state.app.project
    }
  },
  mounted() {
    getModelInfo({
      projectId: this.project.id,
      modelId: this.$route.query.sid
    })
      .then(res => {
        if (res.data.Code === 200) {
          let data = res.data.Data
          if (!data) {
            data = {}
          }

          // 如果没有填写所在地，则默认使用项目地址使用
          if (!data.Address && this.project.adresss) {
            const temp = this.project.adresss.split(';')
            data.Address = temp[1] + temp[2]
          }
          Object.assign(this.data, data)
        }
      })
      .catch(err => {
        console.error(err)
        this.$message.error('项目基本信息获取失败')
      })
  }
}
</script>

<style lang="scss">
.reliceBasicInfo {
  padding: 0;
  background-color: transparent;
  .reliceBasicInfo-panel {
    margin-bottom: 24px;
    background-color: #fff;
    border-radius: 4px;
    padding: 16px 30px;
  }
  .panel-header {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
    .title {
      font-size: 16px;
      font-weight: 500;
      margin-right: 15px;
    }
  }
  .panel-body {
  }
}
</style>
