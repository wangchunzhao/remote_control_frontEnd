<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="5" v-for="item in applications" :key="item.ApplicationId">
        <div class="application">
          <img class="application-logo" :src="item.Icon" alt="" />
          <div class="application-info">
            <div class="application-name">{{ item.ApplicationName }}</div>
            <div class="application-creator">{{ item.Remark }}</div>
          </div>
        </div>
      </el-col>
      <el-col
        :span="5"
        v-for="item in list"
        :key="item.VideoMonitorApplicationId"
      >
        <div class="video-application" @click="openEditFormDialog(item)">
          <img class="application-logo" :src="logoMap[item.Type]" alt="" />
          <div class="application-info">
            <div class="application-name">
              {{ item.VideoMonitorApplicationName }}
            </div>
            <div
              class="application-creator"
              v-if="applicationCreator[item.Type]"
            >
              由{{ applicationCreator[item.Type].label }}提供
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="video-application-add" @click="openEditFormDialog">
          <i class="el-icon-plus"></i>
          <span class="video-application-add-text">添加更多应用</span>
        </div>
      </el-col>
    </el-row>
    <EditFormDialog @refresh="fetchList" ref="editFormDialog" />
  </div>
</template>

<script>
import EditFormDialog from './EditFormDialog'
import {
  getCompanyApplication,
  getVideoMonitorApplicationList
} from '@/api/videoMonitorApplication'
export default {
  components: {
    EditFormDialog
  },
  data() {
    return {
      applications: [],
      list: [],
      typeOptions: [],
      logoMap: {
        0: 'https://cdn.sinocold.net/images/ys_logo.png',
        1: 'https://cdn.sinocold.net/images/imou_logo.png'
      },
      applicationCreator: {
        Yingshi: {
          label: '海康萤石'
        },
        Lechange: {
          label: '乐橙'
        }
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    openEditFormDialog(payload) {
      this.$refs.editFormDialog.openDialog(payload)
    },
    async fetchList() {
      let res = await getCompanyApplication({
        companyId: this.companyId
      })
      if (res.data.Code === 200) {
        this.applications = res.data.Data
      }
      let res1 = await getVideoMonitorApplicationList({
        companyId: this.companyId
      })
      if (res1.data.Code === 200) {
        this.list = res1.data.Data
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.application {
  display: flex;
  align-items: center;
  padding: 25px 16px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #e1e6eb;
  box-sizing: border-box;
}
.video-application {
  display: flex;
  align-items: center;
  padding: 25px 16px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #e1e6eb;
  cursor: pointer;
  box-sizing: border-box;
}
.application-logo {
  width: 64px;
  height: 64px;
  margin-right: 20px;
  float: left;
}
.application-info {
}
.application-name {
  font-size: 20px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #000000;
  line-height: 28px;
  margin-bottom: 6px;
}
.application-creator {
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #8fa2b5;
  line-height: 22px;
}
.video-application-add {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  border-radius: 2px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  cursor: pointer;
  box-sizing: border-box;
  box-shadow: 0px 2px 10px 4px rgba(143, 162, 181, 0.1);
  i {
    font-size: 20px;
    color: rgba(0, 0, 0, 0.1);
  }
}
.video-application-add-text {
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #8fa2b5;
  line-height: 22px;
  margin-left: 38px;
}
</style>
