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
      <div class="title" style="margin-top: 20px;margin-bottom: 10px">
        所有项目
        <el-dropdown
          style="float: right;margin-right: 5px;"
          trigger="click"
          @command="changeGroupType"
        >
          <el-button type="text" style="padding: 0;font-weight: normal;">
            {{ groupTypes.find(v => v.value === projectGroupBy).label }}
            <i class="el-icon-arrow-down"></i
          ></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="item in groupTypes"
              :command="item.value"
              :key="item.value"
              >{{ item.label }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div v-if="projectGroup" class="all-project-list">
        <el-collapse
          :value="
            filterText && projectGroup
              ? projectGroup.map(v => v.groupTitle)
              : []
          "
        >
          <el-collapse-item
            v-for="(group, index) in projectGroup"
            :key="group.groupTitle + index"
            :name="group.groupTitle"
          >
            <template slot="title">
              {{ group.groupTitle }}
              ({{ group.list.length }})
            </template>
            <div
              v-for="item in group.list"
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
                <EllipsisTooltip
                  class="project-name"
                  :content="item.ProjectName"
                />
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
          </el-collapse-item>
        </el-collapse>
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
import { mapGetters } from 'vuex'
import CProgress from './CProgress'
import { getPathById } from '@/utils/index'
import ProjectEditForm from '@/components/ProjectEditForm'
import { checkPermission } from '@/utils/permissions'
import Driver from 'driver.js'
import EllipsisTooltip from '@/components/EllipsisTooltip'
import 'driver.js/dist/driver.min.css'

export default {
  props: {
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
      projectListSource: [],
      projectStartList: [],
      subareaIdNameMap: {},
      groupTypes: [
        {
          label: '按分区分组',
          value: 'subarea'
        },
        {
          label: '按标签分组',
          value: 'tag'
        },
        {
          label: '按地区分组',
          value: 'city'
        }
      ],
      // 默认按分区分组
      projectGroupBy: 'subarea',
      checkPermission
    }
  },
  computed: {
    subarea() {
      return this.$store.state.app.subarea
    },
    projectGroup() {
      const projectList = this.projectListSource.filter(
        item =>
          item.ProjectName.toLowerCase().indexOf(
            this.filterText.toLowerCase()
          ) > -1
      )
      if (this.projectGroupBy === 'subarea') {
        return this.orderProjectBySubarea(projectList)
      } else if (this.projectGroupBy === 'city') {
        return this.orderProjectByCity(projectList)
      } else if (this.projectGroupBy === 'tag') {
        return this.orderProjectByTag(projectList)
      }
      return []
    },
    ...mapGetters([
      'preference',
      'proList',
      'companyId',
      'isEmptyAccount',
      'mapOverviewHeaderVisible'
    ])
  },
  watch: {
    proList: {
      handler: async function(list) {
        await this.fetchSubareaOptions()
        this.projectListSource = JSON.parse(JSON.stringify(list))
        this.projectListSource.forEach(item => {
          try {
            const addressItems = item.adresss.split(';')
            item.adresss = `${addressItems[1]};${addressItems[2]}`
            item.city = addressItems[1].split('/')[1]
          } catch (err) {
            console.error(err)
          }
        })
        this.projectStartList = this.projectListSource.filter(
          item => item.Asterisk
        )
      },
      immediate: true
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
    this.$store.dispatch('fetchProject')
    this.handleResize()

    // 用户自定义了侧边栏的宽度
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
    changeGroupType(type) {
      this.projectGroupBy = type
    },
    fetchProjectList() {
      this.loading = true
      getUserProjectAlarm({
        companyId: this.companyId,
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
    /** 项目按分区分组 */
    orderProjectBySubarea(list) {
      const unGroupItem = {
        groupTitle: '未分组',
        list: []
      }
      const group = {}
      list.forEach(v => {
        if (group[v.ParentSubareaId]) {
          group[v.ParentSubareaId].push(v)
        } else {
          group[v.ParentSubareaId] = [v]
        }
      })

      const groupList = []
      Object.keys(group).forEach(key => {
        if (this.subareaIdNameMap[key]) {
          groupList.push({
            groupTitle: this.subareaIdNameMap[key],
            list: group[key]
          })
        } else {
          unGroupItem.list.push(...group[key])
        }
      })
      if (unGroupItem.list.length) {
        groupList.push(unGroupItem)
      }
      return groupList
    },
    /** 项目按市区分组 */
    orderProjectByCity(list) {
      const unGroupItem = {
        groupTitle: '未分组',
        list: []
      }
      const group = {
        无市区: []
      }
      list.forEach(v => {
        if (!v.city) {
          // 存在项目没有地址的情况
          group['无市区'].push(v)
          return
        }
        if (group[v.city]) {
          group[v.city].push(v)
        } else {
          group[v.city] = [v]
        }
      })
      const groupList = []
      Object.keys(group).forEach(key => {
        if (key !== '无市区') {
          groupList.push({
            groupTitle: key,
            list: group[key]
          })
        } else {
          unGroupItem.list.push(...group[key])
        }
      })
      if (unGroupItem.list.length) {
        groupList.push(unGroupItem)
      }
      return groupList
    },
    /** 项目按 tag 分组 */
    orderProjectByTag(list) {
      const unGroupItem = {
        groupTitle: '未分组',
        list: []
      }

      // 二维数组扁平化之后去重
      const allTag = [
        ...new Set(
          list.map(v => v.TagList).reduce((acc, cur) => [...acc, ...cur], [])
        )
      ]
      const group = {
        无标签: []
      }
      allTag.forEach(tag => {
        group[tag] = []
      })
      list.forEach(v => {
        if (!v.TagList.length) {
          // 项目没有 tag 的情况
          group['无标签'].push(v)
          return
        }
        v.TagList.forEach(tag => {
          group[tag].push(v)
        })
      })
      const groupList = []
      Object.keys(group).forEach(key => {
        if (key !== '无标签') {
          groupList.push({
            groupTitle: key,
            list: group[key]
          })
        } else {
          unGroupItem.list.push(...group[key])
        }
      })
      if (unGroupItem.list.length) {
        groupList.push(unGroupItem)
      }
      return groupList
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
        this.$store.dispatch('fetchCompanyStruct')
        this.$store.dispatch('fetchProject')
        this.$store.dispatch('fetchUserOwnSubareaTree')
      }
    },
    fetchSubareaOptions() {
      return new Promise(resolve => {
        getUserSubareaList({
          companyId: this.companyId
        })
          .then(res => {
            if (res.data.Code === 200) {
              const list = res.data.Data
              const map = {}
              list.forEach(v => {
                map[v.Id] = v.Name
              })
              this.subareaIdNameMap = map
            }
          })
          .finally(() => {
            resolve()
          })
      })
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
        startWidth = parseInt(
          document.defaultView.getComputedStyle(sidebar).width,
          10
        )
        document.documentElement.addEventListener('mousemove', doDrag, false)
        document.documentElement.addEventListener('mouseup', stopDrag, false)
      }
      function doDrag(e) {
        const width = startWidth + e.clientX - startX
        if (width < 400 && width > 240) {
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
  position: absolute;
  left: 0;
  top: 0;
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
}
</style>

<style lang="scss">
.map-sidebar {
  .filter-input {
    .el-input__inner {
      height: 40px;
      line-height: 40px;
      border: none;
      border-radius: 0;
    }
  }
  .el-collapse {
    border: none;
  }
  .el-collapse-item__content {
    padding-bottom: 0px;
  }
  .el-collapse-item__header {
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    background-color: transparent;
  }
  .el-collapse-item__wrap {
    background-color: transparent;
  }
  .el-collapse-item__header {
    height: 40px;
    line-height: 40px;
  }
}
</style>
