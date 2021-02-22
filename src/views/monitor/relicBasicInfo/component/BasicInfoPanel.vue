<template>
  <div class="reliceBasicInfo-basicInfo">
    <div class="left-body">
      <div class="panel-header">
        <span class="title">
          {{ title }}
        </span>
        <el-button
          style="padding: 3px 8px;"
          @click.native="handleClick"
          size="mini"
          plain
          v-permission="[28]"
        >
          <c-svg :name="editable ? 'save' : 'bianji'"></c-svg>
          {{ editable ? '保存' : '编辑' }}</el-button
        >
      </div>
      <div style="border: 1px solid rgba(0, 0, 0, 0.09);border-bottom: 0;">
        <div class="row-2column">
          <div class="field-row">
            <div class="field-label">
              时代
            </div>
            <div class="field-value">
              <span v-if="!editable">{{ form.times }}</span>
              <el-input
                style="width: 100%;"
                v-else
                v-model="form.times"
                size="mini"
                clearable
              ></el-input>
            </div>
          </div>
          <div class="field-row">
            <div class="field-label">
              类别
            </div>
            <div class="field-value">
              <span v-if="!editable">{{ form.type }}</span>
              <el-input
                style="width: 100%;"
                v-else
                v-model="form.type"
                size="mini"
                clearable
              ></el-input>
            </div>
          </div>
        </div>
        <div class="row-2column">
          <div class="field-row">
            <div class="field-label">
              所有权
            </div>
            <div class="field-value">
              <span v-if="!editable">{{ form.ownership }}</span>
              <el-input
                style="width: 100%;"
                v-else
                v-model="form.ownership"
                size="mini"
                clearable
              ></el-input>
            </div>
          </div>
          <div class="field-row">
            <div class="field-label">
              使用人
            </div>
            <div class="field-value">
              <span v-if="!editable">{{ form.user }}</span>
              <el-input
                style="width: 100%;"
                v-else
                v-model="form.user"
                size="mini"
                clearable
              ></el-input>
            </div>
          </div>
        </div>
        <div class="field-row">
          <div class="field-label">
            所在地
          </div>
          <div class="field-value">
            <span v-if="!editable">{{ form.Address }}</span>
            <el-input
              style="width: 100%;"
              v-else
              v-model="form.Address"
              size="mini"
              clearable
            ></el-input>
          </div>
        </div>
        <div class="field-row">
          <div class="field-label">
            保护级别
          </div>
          <div class="field-value">
            <span v-if="!editable">{{ form.protectionLevel }}</span>
            <el-input
              style="width: 100%;"
              v-else
              v-model="form.protectionLevel"
              size="mini"
              clearable
            ></el-input>
          </div>
        </div>
        <div class="field-row">
          <div class="field-label">
            管理机构
          </div>
          <div class="field-value">
            <span v-if="!editable">{{ form.managementOrganization }}</span>
            <el-input
              style="width: 100%;"
              v-else
              v-model="form.managementOrganization"
              size="mini"
              clearable
            ></el-input>
          </div>
        </div>
      </div>
    </div>
    <div class="right-body">
      <div id="relic-map" style="height: 258px;"></div>
    </div>
  </div>
</template>

<script>
import { updateModelInfo } from '@/api/modelInfo'
export default {
  props: {
    title: String,
    systemId: String,
    content: Object,
    projectId: Number
  },
  data() {
    return {
      editable: false,
      form: {
        times: '',
        type: '',
        user: '',
        ownership: '',
        protectionLevel: '',
        managementOrganization: '',
        Address: ''
      }
    }
  },
  watch: {
    content(val) {
      Object.assign(this.form, val)
      if (this.form.Address) {
        this.handleMapPosition(this.form.Address)
      }
    }
  },
  mounted() {
    this.map = new BMap.Map('relic-map')
    const point = new BMap.Point(116.331398, 39.897445)
    this.map.centerAndZoom(point, 11)
  },
  methods: {
    handleClick() {
      this.editable = !this.editable
      if (this.editable === false) {
        const {
          times,
          type,
          user,
          ownership,
          protectionLevel,
          managementOrganization,
          Address
        } = this.form
        updateModelInfo({
          projectId: this.projectId,
          modelId: this.systemId,
          times,
          type,
          user,
          ownership,
          protectionLevel,
          managementOrganization,
          Address
        })
          .then(res => {
            if (res.data.Code !== 200 || res.data.Data.IsSuccess !== true) {
              this.$message.error('更新失败')
            } else {
              if (Address) {
                this.handleMapPosition(Address)
              }
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('更新失败')
          })
      }
    },
    handleMapPosition(address) {
      const myGeo = new BMap.Geocoder()
      // 将地址解析结果显示在地图上,并调整地图视野
      myGeo.getPoint(address, point => {
        if (point) {
          this.map.centerAndZoom(point, 16)
          this.map.addOverlay(new BMap.Marker(point))
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.reliceBasicInfo-basicInfo {
  display: flex;
  margin-bottom: 24px;
  background-color: transparent;

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
  .left-body {
    flex: 1;
    margin-right: 16px;
    background-color: #fff;
    border-radius: 4px;
    padding: 16px 30px;
  }
  .right-body {
    flex: 0 0 410px;
    padding: 8px;
    border-radius: 4px;
    background-color: #fff;
  }
  .row-2column {
    display: flex;
  }
  .field-row {
    display: flex;
    flex: 1;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  }
  .field-label {
    background-color: #fafafc;
    width: 120px;
    text-align: center;
    height: 40px;
    line-height: 40px;
    font-weight: 500;
  }
  .field-value {
    flex: 1;
    padding: 0 10px;
  }
}
</style>
