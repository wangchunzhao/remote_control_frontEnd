<template>
  <div class="gateway-page">
    <page-header title="网关">
      <template v-slot:right>
        <div class="right-wrap">
          <div class="statistical-item">
            总数
            <span class="statistical-num">
              {{ previewData ? previewData.Total : '-' }}
            </span>
          </div>
          <div class="statistical-item">
            离线
            <span class="statistical-num">
              {{ previewData ? previewData.OfflineTotal : '-' }}
            </span>
          </div>
          <div class="statistical-item">
            数据不更新
            <span class="statistical-num">
              {{ previewData ? previewData.NoUpdateTotal : '-' }}
            </span>
          </div>
        </div>
      </template>
    </page-header>
    <el-tabs class="page-tabs" v-model="activeName">
      <el-tab-pane label="网关列表" name="first">
        <GatewayList />
      </el-tab-pane>
      <el-tab-pane label="从站设备" name="second">
        <SlaveStationList />
      </el-tab-pane>
      <el-tab-pane label="组合模板" name="thrid">
        <TemplateList />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import GatewayList from './gatewayList/Index'
import SlaveStationList from './slaveStationList/Index'
import TemplateList from './templateList/Index'
import { getDeviceTotal } from '@/api/device_new'
export default {
  name: 'GatewayIndex',
  components: {
    GatewayList,
    SlaveStationList,
    TemplateList
  },
  data() {
    return {
      activeName: 'first',
      previewData: null
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return (this.$store.state.app.project || {}).id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  created() {
    this.fetchPreviewData()
  },
  beforeRouteEnter(to, from, next) {
    console.log(222222)
    next(vm => {})
  },
  methods: {
    fetchPreviewData() {
      getDeviceTotal({
        CompanyId:
          this.platform === PLATFORM.business ? undefined : this.companyId,
        IsQueryCreator: false,
        ProjectIdList:
          this.platform === PLATFORM.business ? [this.projectId] : undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.previewData = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (from.name === 'slaveStationDetail') {
        vm.activeName = 'second'
      }
    })
  }
}
</script>

<style lang="scss">
.gateway-page {
  .right-wrap {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
  .statistical-item {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    border-right: 1px solid #e8e8e8;
    padding: 3px 16px;
    &:last-of-type {
      border-right: none;
    }
  }
  .statistical-num {
    font-size: 20px;
    color: rgba(0, 0, 0, 0.85);
    margin-left: 10px;
  }
}
</style>
