<template>
  <div class="msg-center">
    <audio
      id="audioPlay"
      ref="audio"
      src="https://cdn.sinocold.net/media_pc/BEOP.WAV"
      hidden
      loop
    />
    <el-popover
      v-model="visible"
      placement="bottom"
      width="350"
      trigger="click"
      :visible-arrow="false"
      popper-class="msg-center-popper"
      transition="el-zoom-in-top"
    >
      <el-tabs v-model="tabActive" :stretch="true">
        <el-tab-pane
          :label="
            '报警消息 ' +
              (alarmCount === 0
                ? ''
                : alarmCount > 99
                ? '(99+)'
                : `(${alarmCount})`)
          "
          name="alarm"
        >
          <div
            v-for="item in alarmList"
            :key="item.ID"
            :style="{ cursor: checkPermission([34]) ? 'cursor' : 'default' }"
            class="list-item"
            @click="goPage({ type: 'alarm', pid: item.ProjectID })"
          >
            <div class="header">
              <el-tag
                size="small"
                :type="
                  item.ALARM_LEVEL === 3
                    ? 'primary'
                    : item.ALARM_LEVEL === 4
                    ? 'info'
                    : item.ALARM_LEVEL === 2
                    ? 'warning'
                    : 'danger'
                "
              >
                {{
                  item.ALARM_LEVEL === 1
                    ? '紧急'
                    : item.ALARM_LEVEL === 2
                    ? '重要'
                    : item.ALARM_LEVEL === 3
                    ? '一般'
                    : '记录'
                }}
              </el-tag>
              <span class="time">{{ handleTimeAgo(item.ALARM_EPOCH) }}</span>
            </div>
            <div class="content">
              {{ item.ALARM_DESCRIBE }}
            </div>
          </div>
          <div v-if="!alarmList.length" class="no-msg">
            暂无消息
          </div>
        </el-tab-pane>
        <el-tab-pane
          :label="
            '维修消息 ' +
              (repairCount === 0
                ? ''
                : repairCount > 99
                ? '(99+)'
                : `(${repairCount})`)
          "
          name="repair"
        >
          <div
            v-for="item in repairList"
            :key="item.RepairOrder"
            :style="{ cursor: checkPermission([40]) ? 'cursor' : 'default' }"
            class="list-item"
            @click="goPage({ type: 'repair', pid: item.ProjectID })"
          >
            <div class="header">
              <span class="title">{{ item.RepairOrder }}</span>
              <span class="time">{{ handleTimeAgo(item.CreateTime) }}</span>
            </div>
            <div class="content">
              {{ item.RepairMessageContent }}
            </div>
          </div>
          <div v-if="!repairList.length" class="no-msg">
            暂无消息
          </div>
        </el-tab-pane>
        <el-tab-pane
          :label="
            '验证校验 ' +
              (scheduleCount === 0
                ? ''
                : scheduleCount > 99
                ? '(99+)'
                : `(${scheduleCount})`)
          "
          name="schedule"
        >
          <div
            v-for="item in scheduleList"
            :key="item.RepairOrder"
            class="list-item"
            style="cursor: default;"
            @click="goPage({ type: 'schedule', pid: item.ProjectID })"
          >
            <div class="header">
              <el-tag
                size="small"
                :style="
                  item.Type === 2
                    ? {
                        background: 'rgba(24,144,255,0.1)',
                        borderColor: 'rgba(24,144,255,0.45)',
                        color: 'rgba(24,144,255,1)'
                      }
                    : {
                        background: 'rgba(47,84,235,0.1)',
                        borderColor: 'rgba(47,84,235,0.45)',
                        color: 'rgba(47,84,235,1)'
                      }
                "
              >
                {{ item.Type === 2 ? '校验日程' : '验证日程' }}
              </el-tag>
              <span class="time">{{ handleTimeAgo(item.WorkDate) }}</span>
            </div>
            <div class="content">
              {{ item.Content }}
            </div>
          </div>
          <div v-if="!scheduleList.length" class="no-msg">
            暂无消息
          </div>
        </el-tab-pane>
      </el-tabs>
      <el-badge
        slot="reference"
        :hidden="total === 0"
        :value="total > 99 ? '99+' : total"
      >
        <c-svg name="xiaoxizhongxin" class-name="noticeicon" />
      </el-badge>
    </el-popover>
  </div>
</template>

<script>
import { getAlarmMessageByUserId } from '@/api/alarmActive'
import { getNewRepairActiveMessagePage } from '@/api/newRepairActive'
import { format } from 'timeago.js'
import { getPathById } from '@/utils/index'
import { getScheduleMsg } from '@/api/schedule'
import { checkPermission } from '@/utils/permissions'

export default {
  data() {
    return {
      visible: false,
      tabActive: 'alarm',
      alarmCount: 0,
      alarmList: [],

      repairCount: 0,
      repairList: [],

      scheduleCount: 0,
      scheduleList: [],
      checkPermission
    }
  },
  computed: {
    total() {
      return this.alarmCount + this.repairCount + this.scheduleCount
    },
    pid() {
      return (this.$store.state.app.project || {}).id
    },
    projectList() {
      return this.$store.state.app.proList
    },
    subarea() {
      return this.$store.state.app.subarea
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    industry() {
      return (this.$store.state.app.project || {}).Industry
    }
  },
  watch: {
    pid(val) {
      if (!val) {
        return
      }
      const audio = document.getElementById('audioPlay')
      // 冷链行业
      if (this.industry === 1) {
        if (this.alarmCount > 0) {
          const playPromise = audio.play()
          playPromise.catch(err => {
            console.error(err)
          })
        } else {
          audio.pause()
        }
      } else {
        // 非冷链行业
        audio.pause()
      }
    }
  },
  beforeDestroy() {
    if (process.env.NODE_ENV === 'production') {
      clearInterval(this.intervalId1)
      clearInterval(this.intervalId2)
    }
    const audio = document.getElementById('audioPlay')
    audio && audio.pause()
  },
  mounted() {
    this.fetchAlarmList()
    this.fetchRepairList()
    this.fetchScheduleList()
    if (process.env.NODE_ENV === 'production') {
      // 定时刷新，获取报警列表和数量
      this.intervalId1 = setInterval(() => {
        this.fetchAlarmList()
        this.fetchRepairList()
        this.fetchScheduleList()
      }, 1000 * 30)
    }
  },
  methods: {
    fetchAlarmList() {
      const audio = document.getElementById('audioPlay')
      getAlarmMessageByUserId({
        pageSize: 99,
        pageIndex: 1,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data

            this.alarmCount = data.TotalCount
            audio.pause()
            // 冷链行业
            if (this.industry === 1) {
              if (this.alarmCount > 0) {
                const playPromise = audio.play()
                playPromise.catch(err => {
                  console.error(err)
                })
              } else {
                audio.pause()
              }
            }
            this.alarmList = data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchRepairList() {
      getNewRepairActiveMessagePage({
        pageSize: 99,
        pageIndex: 1,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.repairCount = data.TotalCount
            this.repairList = data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchScheduleList() {
      getScheduleMsg({
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.scheduleList = data
            this.scheduleCount = data.length
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    goPage({ type, pid }) {
      this.visible = false
      if (type === 'alarm') {
        if (!checkPermission([34])) {
          // 没有查看报警列表的权限
          return false
        }
        const project = this.projectList.find(item => item.id === pid)
        if (project) {
          this.$store.dispatch('ChangeProject', project)
          let projectPath = []
          this.subarea.forEach(item => {
            getPathById(pid, item, val => {
              projectPath = val
            })
          })
          this.$store.commit('UPDATE_PROJECT_PATH', projectPath)
          this.$router.push({
            name: 'alarmManageIndex',
            query: { t: Date.now() }
          })
        } else {
          this.$message('你没有当前消息对应项目的权限')
        }
      } else if (type === 'repair') {
        if (!checkPermission([40])) {
          // 没有查看工单列表的权限
          return false
        }
        const project = this.projectList.find(item => item.id === pid)
        if (project) {
          this.$store.dispatch('ChangeProject', project)
          let projectPath = []
          this.subarea.forEach(item => {
            getPathById(pid, item, val => {
              projectPath = val
            })
          })
          this.$store.commit('UPDATE_PROJECT_PATH', projectPath)
          this.$router.push({
            path: '/repairMaintain/repairTemplate/repairApp',
            query: { t: Date.now() }
          })
        } else {
          this.$message('你没有当前消息对应项目的权限')
        }
      } else if (type === 'schedule') {
        if (!checkPermission([105])) {
          // 没有查看验证校验列表的权限
          return false
        }
        const project = this.projectList.find(item => item.id === pid)
        if (project) {
          this.$store.dispatch('ChangeProject', project)
          let projectPath = []
          this.subarea.forEach(item => {
            getPathById(pid, item, val => {
              projectPath = val
            })
          })
          this.$store.commit('UPDATE_PROJECT_PATH', projectPath)
          this.$router.push({
            name: 'assetValidation',
            query: { t: Date.now() }
          })
        } else {
          this.$message('你没有当前消息对应项目的权限')
        }
      }
    },
    handleTimeAgo(time) {
      return format(time, 'zh_CN')
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-center {
  display: inline-block;
  cursor: pointer;
  .noticeicon {
    font-size: 20px;
    padding: 0 20px;
  }
}
</style>

<style lang="scss">
.msg-center {
  .el-badge__content.is-fixed {
    top: 14px;
    background: #f5222d;
    right: 35px;
  }
}
div.msg-center-popper {
  padding: 0;
  .list-item {
    padding: 12px 20px;
    overflow: hidden;
    cursor: pointer;
    border-bottom: 1px solid #e8e8e8;
    &:hover {
      background: #effaff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .time {
      color: rgba(0, 0, 0, 0.45);
    }
    .title {
      color: rgba(0, 0, 0, 0.65);
      font-size: 15px;
    }
    .content {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.45);
      line-height: 1.5;
    }
  }
  .no-msg {
    font-size: 15px;
    text-align: center;
    color: rgba(0, 0, 0, 0.45);
    padding: 60px;
  }
  .el-tabs__header {
    margin: 0;
  }
  .el-tabs__content {
    height: 400px;
    overflow: auto;
  }
  .el-tabs__active-bar {
    width: 88px !important;
  }
  .el-tabs__content::-webkit-scrollbar {
    width: 7px;
    height: 10px;
  }

  .el-tabs__content::-webkit-scrollbar-thumb {
    height: 16px;
    border-radius: 4px;
    background-color: #a6a6a6;
    border-left: 2px solid transparent;
  }

  .el-tabs__content::-webkit-scrollbar-track {
    background-color: #e5e5e5;
    border-left: 2px solid transparent;
  }
  .el-tabs__item {
    height: 45px;
    line-height: 45px;
    font-size: 15px;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.65);
    &.is-active {
      color: #409eff;
    }
  }
  .el-tabs__nav-wrap::after {
    height: 1px;
  }
}
</style>
