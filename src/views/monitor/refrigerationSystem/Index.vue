<template>
  <div class="device-container">
    <page-header title="冷冻冷藏">
      <template v-slot:right>
        <el-button
          size="mini"
          type="primary"
          v-permission="[28]"
          @click.native="
            () => {
              $refs.addDialog.openDialog()
            }
          "
          style="padding: 5px 7px;margin-left: 15px;"
        >
          <i class="el-icon-plus"></i>
          添加设备
        </el-button>
        <el-button
          size="mini"
          @click.native="handleForScreen"
          style="padding: 5px 7px;margin-left: 10px;"
        >
          <c-svg name="computer"></c-svg>
          投屏展示
        </el-button>
        <el-button
          size="mini"
          v-if="(companyId === 55 && projectId === 1421) || companyId !== 55"
          @click.native="() => $router.push('/monitor/configuration')"
          style="padding: 5px 7px;margin-left: 10px;"
        >
          <c-svg name="computer"></c-svg>
          系统组态
        </el-button>
        <el-button
          size="mini"
          v-if="masterControlList.length"
          @click.native="handleOpenMasterControlPage"
          style="padding: 5px 7px;"
        >
          <c-svg name="export" />
          主控管理页面
        </el-button>
      </template>
    </page-header>
    <el-tabs v-model="tabActive" class="device-tab">
      <el-tab-pane
        v-for="item in tabList"
        :key="item.Key"
        :name="item.Key + ''"
        :label="item.Value"
        class="content-box"
        style="background-color: transparent; padding: 0;"
      >
        <Panel :bigTypeId="systemId" :smallTypeId="item.Key" />
      </el-tab-pane>
    </el-tabs>
    <ColdDataVSelect
      :project="projectId"
      :sid="systemId"
      ref="coldDataVSelect"
    />
    <DeviceAddDialog
      :systemId="Number($route.query.sid)"
      ref="addDialog"
      @refresh="handleRefreshPage()"
    />
  </div>
</template>
<script>
import { getTab } from '@/api/model'
import ColdDataVSelect from './ColdDataVSelect'
import Panel from '@/views/monitor/component/Panel'
import DeviceAddDialog from '@/views/projectConfig/deviceList/DeviceAddDialog'
import { getMasterControl } from '@/api/device_new'

export default {
  components: {
    ColdDataVSelect,
    DeviceAddDialog,
    Panel
  },
  data() {
    return {
      tabActive: null,
      systemId: null,
      tabList: [],
      masterControlList: []
    }
  },
  watch: {
    $route() {
      const { fullPath } = this.$route
      this.$router.replace({
        path: '/redirect' + fullPath
      })
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.systemId = Number(this.$route.query.sid)
    this.fetchtab()
    getMasterControl({
      proId: this.projectId
    })
      .then(res => {
        if (res.data.Code === 200) {
          this.masterControlList = res.data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    // 打开主控管理页面
    handleOpenMasterControlPage() {
      this.masterControlList.forEach(v => {
        window.open(v.Name, '_blank')
      })
    },
    // 点击投屏按钮
    handleForScreen() {
      this.$refs.coldDataVSelect.openDialog()
    },

    fetchtab() {
      getTab({
        projectId: this.projectId,
        bigTypeId: this.systemId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tabList = res.data.Data
            if (!this.tabList.length) {
              this.$message('当前系统下暂无设备，请添加')
              return
            }
            this.tabList.forEach(item => {
              item.id = item.Key.toString()
            })
            this.tabActive = this.tabList[0].id
          }
        })
        .catch(err => {
          console.error(err)
        })
    },

    handleRefreshPage() {
      const { fullPath } = this.$route
      this.$router.replace({
        path: '/redirect' + fullPath
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.cold-box {
  padding: 15px;
  .time {
    padding-top: 10px;
    font-size: 13px;
    color: #8d8d8d;
  }
  .box-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .icon {
      font-size: 20px;
      cursor: pointer;
      color: #8a8a8a;
    }
    .box-title {
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      white-space: nowrap;
      width: 75%;
      vertical-align: -3px;
    }
    @media (max-width: 1225px) {
      .box-title {
        width: 70%;
      }
    }
  }
  .simulator-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e8e8e8;
    padding: 14px 0;
    .icon {
      font-size: 18px;
      color: #52c41b;
    }
    span {
      font-size: 28px;
    }
    .alarm {
      color: #f84d50;
    }
    .gray {
      color: #cccccc;
    }
  }
  .state-wrap {
    display: flex;
  }
  .state {
    flex: 1;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    &::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #52c41b;
      vertical-align: middle;
      margin-right: 6px;
    }
    &.alarm {
      &::before {
        background: #f84d50;
      }
    }
    &.gray {
      color: #8d8d8d;
      &::before {
        background: #cccccc;
      }
    }
  }
  .state1 {
    &::before {
      background: #f09938;
    }
  }
}
@media (max-width: 1700px) {
  .el-col-lg-4 {
    width: 20%;
  }
}
@media (max-width: 1520px) {
  .el-col-lg-4 {
    width: 25%;
  }
}
.no-data {
  min-width: 400px;
  line-height: 400px;
  text-align: center;
}
</style>

<style lang="scss">
.circlepoint {
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-right: 5px;
  border-radius: 50%;
}
.device-container {
  .alarm-tag {
    font-size: 13px;
    background: #fff2e8;
    border: 1px solid #f84d50;
    color: #f84d50;
  }
  .offline-tag {
    font-size: 13px;
    background-color: rgba(144, 147, 153, 0.1);
    border-color: rgba(144, 147, 153, 0.2);
    color: #909399;
  }
  .normal-tag {
    font-size: 13px;
    background: #f6ffec;
    border: 1px solid #52c41b;
    color: #52c41b;
  }
}
@import 'src/assets/style/monitorCommon.scss';
</style>
