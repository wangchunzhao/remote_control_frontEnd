<template>
  <div
    class="map-sidebar"
    v-loading="loading"
    :style="{
      transform: `translateX(${visible ? '0' : -sidebarWidth + 'px'})`,
      width: sidebarWidth + 'px'
    }"
  >
    <div class="gutter-horizontal"></div>
    <el-input
      v-model="filterText"
      class="filter-input"
      clearable
      placeholder="搜索项目名称"
      size="small"
      prefix-icon="el-icon-search"
    ></el-input>
    <div class="main-wrap thin-scroll">
      <div class="title">
        星标项目
      </div>
      <div v-if="projectStartList" class="start-project-list">
        <div
          v-for="item in projectStartList"
          :key="item.ProjectId"
          class="project-box"
          @click="() => handleClickProject(item)"
        >
          <div class="project-box-main">
            <c-svg
              name="star-fill"
              @click.native.stop="() => handleStart(item)"
              :class="item.Asterisk ? 'start-icon-active' : 'start-icon'"
            ></c-svg>
            <EllipsisTooltip class="project-name" :content="item.ProjectName" />
            <!-- <span class="project-name">{{ item.ProjectName }}</span> -->
            <span v-if="item.AlarmNum > 0" class="alarm-num">{{
              item.AlarmNum
            }}</span>
            <c-svg
              class="position-icon"
              @click.native.stop="() => handleClick(item)"
              name="coordinates_fill"
            ></c-svg>
          </div>
          <CProgress :data="handleProgressData(item)" />
        </div>
      </div>
      <div v-if="projectStartList && !projectStartList.length" class="no-data">
        <c-svg
          style="font-size: 18px;padding-bottom: 6px;"
          name="fuwuchuangb"
        ></c-svg>
        <div>暂无星标项目</div>
      </div>
      <div class="title" style="margin-top: 20px;">
        所有项目
        <el-dropdown style="float: right;" @command="filterBySubarea">
          <el-button type="text" style="padding: 0;font-weight: normal;">
            {{
              subareaOptions.length
                ? subareaOptions.find(item => item.Id === subareaId).Name
                : ''
            }}
            <i class="el-icon-arrow-down"></i
          ></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :command="item.Id"
              v-for="item in subareaOptions"
              :key="item.Id"
              >{{ item.Name }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div v-if="projectList" class="all-project-list">
        <div
          v-for="item in projectList"
          :key="item.ProjectId"
          class="project-box"
          @click="() => handleClickProject(item)"
        >
          <div class="project-box-main">
            <c-svg
              name="star-fill"
              @click.native.stop="() => handleStart(item)"
              :class="item.Asterisk ? 'start-icon-active' : 'start-icon'"
            ></c-svg>
            <EllipsisTooltip class="project-name" :content="item.ProjectName" />
            <!-- <span :title="item.ProjectName" class="project-name">{{
              item.ProjectName
            }}</span> -->
            <span v-if="item.AlarmNum > 0" class="alarm-num">{{
              item.AlarmNum
            }}</span>
            <c-svg
              class="position-icon"
              @click.native.stop="() => handleClick(item)"
              name="coordinates_fill"
            ></c-svg>
          </div>
          <CProgress :data="handleProgressData(item)" />
        </div>
      </div>
      <div
        v-if="checkPermission([6]) || isEmptyAccount"
        class="add-project-box"
        id="add-project-box"
        @click="() => (projectDialogVisible = true)"
      >
        <i class="el-icon-plus"></i>
        <div>创建项目</div>
      </div>
    </div>
    <div class="indicator" @click="() => (visible = !visible)">
      <c-svg :name="visible ? 'doubleleft' : 'doubleright'" />
    </div>
    <div class="data-panel-wrap" :style="{ left: sidebarWidth + 25 + 'px' }">
      <div v-if="showAlarm" class="alarm-panel">
        <div class="alarm-panel-header panel-header">
          报警统计
          <span
            class="link-btn"
            v-permission="[116]"
            @click="() => $router.push({ name: 'alarmManageWithAllProject' })"
          >
            查看全部
            <i class="el-icon-arrow-right"></i>
          </span>
        </div>
        <div class="panel-body">
          <div>
            <div class="label">
              今日新增
            </div>
            <div class="value">
              {{
                alarmNums.AlarmNum !== undefined
                  ? alarmNums.AlarmNum.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label">
              本月报警
            </div>
            <div class="value">
              {{
                alarmNums.MonthAlarmNum !== undefined
                  ? alarmNums.MonthAlarmNum.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label">
              上月报警
            </div>
            <div class="value">
              {{
                alarmNums.LastMonthAlarmNum !== undefined
                  ? alarmNums.LastMonthAlarmNum.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="showRepair" class="repair-panel">
        <div class="panel-header">
          维修统计
          <!-- <span class="link-btn">
            查看全部
            <i class="el-icon-arrow-right"></i>
          </span> -->
        </div>
        <div class="panel-body">
          <div>
            <div class="label">
              待接单
            </div>
            <div class="value">
              {{
                repairNums.WaitOrderTotal !== undefined
                  ? repairNums.WaitOrderTotal.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label">
              待签到
            </div>
            <div class="value">
              {{
                repairNums.WaitSignTotal !== undefined
                  ? repairNums.WaitSignTotal.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label">
              维修中
            </div>
            <div class="value">
              {{
                repairNums.RepairingTotal !== undefined
                  ? repairNums.RepairingTotal.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label">
              待验收
            </div>
            <div class="value">
              {{
                repairNums.WaitAcceptanceTotal !== undefined
                  ? repairNums.WaitAcceptanceTotal.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="showMaintenance" class="maintenance-panel">
        <div class="alarm-panel-header panel-header">
          保养统计
          <!-- <span class="link-btn">
            查看全部
            <i class="el-icon-arrow-right"></i>
          </span> -->
        </div>
        <div class="panel-body">
          <div>
            <div class="label">
              本月保养任务
            </div>
            <div class="value">
              {{
                maintenanceNums.NoMaintenanceTotal !== undefined
                  ? maintenanceNums.NoMaintenanceTotal.toLocaleString('en-US')
                  : '-'
              }}
              /
              {{
                maintenanceNums.MaintenanceTotal !== undefined
                  ? maintenanceNums.MaintenanceTotal.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      title="添加项目"
      width="580px"
      append-to-body
      @close="
        () => {
          $refs.projectEditForm.resetForm()
        }
      "
      :visible.sync="projectDialogVisible"
    >
      <ProjectEditForm
        :isRefresh="false"
        :companyIdProp="companyId"
        :subareaOptionsProp="
          isEmptyAccount
            ? [{ SubareaName: '秦骏（上海）实业有限公司', SubareaId: 1 }]
            : null
        "
        :gatewayOptions="userGatewayList || []"
        ref="projectEditForm"
        @complete="afterAddProject"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getUserProjectAlarm, getUserSubareaList } from '@/api/subarea'
import { addProjectAsterisk, deleteProjectAsterisk } from '@/api/project'
import { getAlarmOverNum } from '@/api/alarmActive'
import { mapGetters } from 'vuex'
import {
  getMaintenanceOverview,
  getRepairOverview
} from '@/api/maintenanceStatistical'
import CProgress from './CProgress'
import { getPathById } from '@/utils/index'
import ProjectEditForm from '@/components/ProjectEditForm'
import { checkPermission } from '@/utils/permissions'
import Driver from 'driver.js' // import driver.js
import EllipsisTooltip from '@/components/EllipsisTooltip'
import 'driver.js/dist/driver.min.css' // import driver.js css

import dayjs from 'dayjs'
export default {
  props: {
    showAlarm: Boolean,
    showRepair: Boolean,
    showMaintenance: Boolean,
    handleClick: Function,
    userGatewayList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  components: {
    CProgress,
    ProjectEditForm,
    EllipsisTooltip
  },
  data() {
    return {
      visible: true,
      sidebarWidth: 240,
      loading: false,
      projectDialogVisible: false,
      filterText: '',
      subareaOptions: [],
      subareaId: 0,
      projectListSource: [],
      projectStartList: [],

      alarmNums: {},
      maintenanceNums: {},
      repairNums: {},
      checkPermission
    }
  },
  computed: {
    subarea() {
      return this.$store.state.app.subarea
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    projectList() {
      return this.projectListSource.filter(
        item =>
          item.ProjectName.toLowerCase().indexOf(
            this.filterText.toLowerCase()
          ) > -1
      )
    },
    isEmptyAccount() {
      return this.$store.state.app.isEmptyAccount
    },
    proList() {
      return this.$store.state.app.proList
    },
    ...mapGetters(['preference'])
  },
  watch: {
    proList: {
      handler: function(list) {
        this.projectListSource = JSON.parse(JSON.stringify(list))
        this.projectListSource.forEach(item => {
          item.adresss = item.adresss.split(';')[1] + item.adresss.split(';')[2]
        })
        this.projectStartList = this.projectListSource.filter(
          item => item.Asterisk
        )
      },
      immediate: true
    },
    companyId() {
      this.fetchOverviewData()
      this.fetchSubareaOptions()
    },
    userGatewayList(val) {
      // 如果是空白账号，且账号下有网关，提示添加项目
      if (this.isEmptyAccount && val.length) {
        this.driver = new Driver({
          animate: false, // Animate while changing highlighted element
          opacity: 0.75, // Background opacity (0 means only popovers and without overlay)
          padding: 10, // Distance of element from around the edges
          allowClose: false, // Whether clicking on overlay should close or not
          overlayClickNext: false // Should it move to next step on overlay click
          // Called when moving to next step on any step
        })
        this.driver.defineSteps([
          {
            element: '#add-project-box',
            popover: {
              title: '创建项目',
              description: '点击 「+创建项目」 解锁更多功能',
              closeBtnText: '立即体验',
              position: 'right'
            }
          }
        ])
        setTimeout(() => {
          this.driver.start()
        }, 300)
      }
    }
  },
  mounted() {
    this.fetchSubareaOptions()
    this.fetchOverviewData()
    this.fetchProjectList()

    this.handleResize()
    if (this.preference.previewSidebarWidth) {
      this.sidebarWidth = this.preference.previewSidebarWidth
    }
  },
  methods: {
    // 点击项目
    handleClickProject(data) {
      this.$store.dispatch(
        'ChangeProject',
        this.proList.find(item => item.ProjectId === data.ProjectId)
      )
      let projectPath = []
      this.subarea.forEach(item => {
        getPathById(data.ProjectId, item, val => {
          projectPath = val
        })
      })
      this.$store.commit('UPDATE_PROJECT_PATH', projectPath)
      this.$router.push({ name: 'triggerRouterGuard' })
    },
    handleStart(item) {
      if (item.Asterisk) {
        deleteProjectAsterisk({
          projectId: item.ProjectId
        }).then(res => {
          if (res.data.Code !== 200) {
            this.$message.error('删除星标失败')
          }
          this.projectStartList = this.projectStartList.filter(
            project => project.ProjectId !== item.ProjectId
          )
        })
      } else {
        addProjectAsterisk({
          projectId: item.ProjectId
        }).then(res => {
          if (res.data.Code !== 200) {
            this.$message.error('添加星标失败')
          }
        })
        this.projectStartList.push(item)
      }
      this.$set(item, 'Asterisk', !item.Asterisk)
    },
    filterBySubarea(id) {
      this.subareaId = id
      this.fetchProjectList()
    },
    fetchProjectList() {
      this.loading = true
      getUserProjectAlarm({
        companyId: this.companyId,
        SubareaId: this.subareaId,
        IsShow: true
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.forEach(item => {
              item.adresss =
                item.adresss.split(';')[1] + item.adresss.split(';')[2]
            })
            this.projectListSource = data
          } else {
            this.$message.error('项目列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    fetchSubareaOptions() {
      getUserSubareaList({
        companyId: this.companyId
      }).then(res => {
        if (res.data.Code === 200) {
          this.subareaOptions = res.data.Data
          this.subareaId = this.subareaOptions[0].Id
        }
      })
    },
    fetchOverviewData() {
      getAlarmOverNum({
        companyId: this.companyId
      }).then(res => {
        if (res.data.Code === 200) {
          this.alarmNums = res.data.Data
        }
      })

      getMaintenanceOverview({
        // 这里的传参没错，233
        projectId: this.companyId,
        startDate: dayjs()
          .startOf('month')
          .format('YYYY-MM-DD HH:mm'),
        endDate: this._dateFormat(new Date(), 'YYYY-MM-DD HH:mm'),
        idType: 1
      }).then(res => {
        if (res.data.Code === 200) {
          this.maintenanceNums = res.data.Data
        }
      })
      getRepairOverview({
        projectId: this.companyId,
        idType: 1
      }).then(res => {
        if (res.data.Code === 200) {
          this.repairNums = res.data.Data
        }
      })
    },
    // 组合progress组件需要的数据
    handleProgressData(item) {
      const total =
        item.OfflineModelTreeNum +
        item.AlarmModelTreeNum +
        item.OnlineModelTreeNum

      const onlinePercent = (item.OnlineModelTreeNum / total).toFixed(2) * 100
      const alarmPercent = (item.AlarmModelTreeNum / total).toFixed(2) * 100
      const offlinePercent = (item.OfflineModelTreeNum / total).toFixed(2) * 100
      return [
        {
          color: '#73D13D',
          width: onlinePercent + '%'
        },
        {
          color: '#FF4D4F',
          width: alarmPercent + '%'
        },
        {
          color: '#F5F5F5',
          width: offlinePercent + '%'
        }
      ]
    },
    afterAddProject() {
      this.projectDialogVisible = false
      if (this.isEmptyAccount) {
        this.$store.dispatch('fetchCompanyList').then(() => {
          this.$store.dispatch('fetchProject')
          this.$store.dispatch('fetchUserOwnSubareaTree')
        })
      } else {
        this.fetchProjectList()
        this.$store.dispatch('fetchCompanyStruct')
        this.$store.dispatch('fetchProject')
        this.$store.dispatch('fetchUserOwnSubareaTree')
      }
    },
    handleResize() {
      const sidebar = document.querySelector('.map-sidebar')
      const that = this
      document
        .querySelector('.gutter-horizontal')
        .addEventListener('mousedown', initDrag)
      let startX, startWidth
      function initDrag(e) {
        startX = e.clientX
        console.log(e.clientX)
        startWidth = parseInt(
          document.defaultView.getComputedStyle(sidebar).width,
          10
        )
        document.documentElement.addEventListener('mousemove', doDrag, false)
        document.documentElement.addEventListener('mouseup', stopDrag, false)
      }
      function doDrag(e) {
        // sidebar.style.width = startWidth + e.clientX - startX + 'px'

        const width = startWidth + e.clientX - startX
        if (width < 400 && width > 240) {
          // sidebar.style.width = width + 'px'
          that.sidebarWidth = width
        }
      }

      function stopDrag() {
        that.$store.dispatch(
          'updateUserPreference',
          Object.assign({
            ...that.preference,
            previewSidebarWidth: that.sidebarWidth
          })
        )
        document.documentElement.removeEventListener('mousemove', doDrag, false)
        document.documentElement.removeEventListener('mouseup', stopDrag, false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.map-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  margin-top: 50px;
  transition: transform 210ms;
  background-color: #f0f2f5;
  .main-wrap {
    overflow-y: auto;
    padding: 16px;
    height: calc(100vh - 82px);
    box-shadow: 4px 0 11px rgba(0, 0, 0, 0.2);
  }
  .gutter-horizontal {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 1px;
    cursor: ew-resize;
    &:hover {
      background-color: #1890ff;
    }
    &:after {
      content: '';
      display: block;
      height: 100%;
      width: 8px;
      position: absolute;
      left: -4px;
      z-index: 10;
    }
  }
  .title {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 20px;
    position: relative;
  }
  .indicator {
    position: absolute;
    top: 32px;
    right: -17px;
    padding: 5px 2px;
    background-color: #fff;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    cursor: pointer;
    &:hover {
      svg {
        color: #409eff;
      }
    }
    svg {
      color: rgba(0, 0, 0, 0.65);
    }
  }
  .project-box {
    position: relative;
    padding: 14px 10px 8px 10px;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.16);
    border-radius: 5px;
    margin-bottom: 10px;
    cursor: pointer;
    .project-box-main {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .project-name {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
      // overflow: hidden;
      // white-space: nowrap;
      // text-overflow: ellipsis;
      margin: 0 5px;
      color: rgba(0, 0, 0, 0.8);
    }
    .alarm-num {
      height: 17px;
      line-height: 17px;
      padding: 0 5px;
      border-radius: 10px;
      background-color: #f5222d;
      color: #fff;
      font-size: 12px;
    }
    .position-icon {
      cursor: default;
      color: rgba(0, 0, 0, 0.15);

      font-size: 18px;
      padding: 4px;
      padding-right: 0;

      &:hover {
        cursor: pointer;
        color: #409eff;
      }
    }
  }
  .start-icon-active {
    font-size: 15px;
    color: #faad14;
    &:hover {
      color: rgba(0, 0, 0, 0.15);
    }
  }
  .start-icon {
    font-size: 15px;
    color: rgba(0, 0, 0, 0.15);
    &:hover {
      color: #faad14;
    }
  }
  .add-project-box {
    padding: 15px 0;
    margin-bottom: 20px;
    text-align: center;
    background: rgba(0, 0, 0, 0.05);
    border: 1px dashed rgba(0, 0, 0, 0.15);
    color: rgba(0, 0, 0, 0.45);
    border-radius: 5px;
    cursor: pointer;
    & > i {
      font-size: 18px;
      padding-bottom: 10px;
    }
  }
  .no-data {
    text-align: center;
    padding: 20px 0 35px 0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
  .data-panel-wrap {
    position: absolute;
    top: 10px;
    display: flex;
  }
  .alarm-panel {
    width: 270px;
    .panel-header {
      background: linear-gradient(
        90deg,
        rgba(207, 19, 34, 1) 0%,
        rgba(207, 19, 34, 0.65) 100%
      );
    }
  }
  .repair-panel {
    width: 270px;
    .panel-header {
      background: linear-gradient(
        90deg,
        rgba(250, 140, 22, 1) 0%,
        rgba(250, 140, 22, 0.65) 100%
      );
    }
  }
  .maintenance-panel {
    width: 200px;
    .panel-header {
      background: linear-gradient(
        90deg,
        rgba(24, 144, 255, 1) 0%,
        rgba(24, 144, 255, 0.65) 100%
      );
    }
  }
  .alarm-panel,
  .repair-panel,
  .maintenance-panel {
    box-shadow: 0 0 11px rgba(0, 0, 0, 0.2);
    margin-right: 25px;
    border-radius: 4px;
    overflow: hidden;
    .panel-header {
      padding: 10px 12px 10px 16px;
      color: #fff;
      font-size: 16px;
    }

    .link-btn {
      float: right;
      font-size: 14px;
      cursor: pointer;
    }
    .panel-body {
      padding: 20px 0 24px 0;
      display: flex;
      align-items: center;
      background-color: #fff;
      & > div {
        flex: 1;
        text-align: center;
      }
      .label {
        margin-bottom: 8px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }
      .value {
        font-size: 20px;
        font-weight: 500;
      }
    }
  }
}
</style>

<style lang="scss">
.map-sidebar {
  .filter-input {
    .el-input__inner {
      border: none;
      border-radius: 0;
    }
  }
}
</style>
