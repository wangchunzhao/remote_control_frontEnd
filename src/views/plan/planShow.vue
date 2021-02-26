<template>
  <div>
    <page-header class="planShow-page-header" title="平面图">
      <template v-slot:right>
        <div class="right-wrap">
          <el-popover
            v-model="structTreeVisible"
            placement="bottom-end"
            trigger="click"
            popper-class="planShow-sturctTree-popover"
          >
            <div
              v-loading="structLoading"
              class="struct-content thin-scroll"
              element-loading-text="加载中..."
            >
              <div style="margin-bottom: 10px;text-align: right;">
                <el-button
                  @click.native="handleAddArea"
                  v-permission="[32]"
                  style="padding: 0;"
                  type="text"
                  >添加区域</el-button
                >
              </div>

              <el-tree
                ref="tree"
                :data="structData"
                highlight-current
                node-key="mtid"
                :current-node-key="currentNode.mtid"
                :props="structTreeProps"
                :expand-on-click-node="false"
                :default-expanded-keys="
                  structData.length ? [structData[0].mtid] : []
                "
                @node-click="handleNodeClick"
              >
                <span slot-scope="{ node, data }" class="node-item">
                  <span>
                    <c-svg name="ceng"></c-svg>
                    &nbsp;
                    <span>{{ node.label }}</span>
                  </span>
                  <span class="node-btn-wrap">
                    <el-button
                      type="text"
                      v-permission="[32]"
                      v-if="node.level > 1"
                      @click.native.stop="handleEditArea(data)"
                    >
                      <i class="el-icon-setting" />
                    </el-button>
                    <el-button
                      type="text"
                      v-permission="[32]"
                      v-if="node.level > 1"
                      class="btn-danger"
                      @click.native.stop="removeArea(data)"
                    >
                      <i class="el-icon-delete" />
                    </el-button>
                    <i v-if="data.exist === true" class="el-icon-picture"></i>
                  </span>
                </span>
              </el-tree>
            </div>

            <div slot="reference" class="structTree-trigger">
              {{ currentNode.mname }}
              <i class="el-icon-caret-bottom" style="font-size: 10px;"></i>
            </div>
          </el-popover>
          <div>
            <el-select
              v-model="childSystems"
              multiple
              size="mini"
              placeholder="按类型筛选"
              class="filter-select"
              @visible-change="filterPlan"
            >
              <el-option
                v-for="item in childSystemOptions"
                :key="item.ID"
                :label="item.TypeName"
                :value="item.ID"
              />
            </el-select>
            <el-button
              v-permission="[32]"
              type="primary"
              size="mini"
              @click.native="
                $router.push({
                  path: 'planCreate',
                  query: {
                    mtid: currentNode.mtid,
                    tabIndex: $route.query.tabIndex
                  }
                })
              "
            >
              <i class="el-icon-edit" />
              编辑
            </el-button>
            <el-button type="primary" size="mini" @click.native="showAll">
              <i class="el-icon-view" />
              {{ isShowAll ? '关闭' : '展开' }}
            </el-button>
            <el-button
              type="primary"
              size="mini"
              @click.native="screenFull($event)"
            >
              <c-svg name="fullscreen" />
              {{ fullScreenStatus ? '退出' : '全屏' }}
            </el-button>
          </div>
        </div>
      </template>
    </page-header>
    <div class="planShow">
      <div v-loading="planLoading || structLoading" class="planShow-content">
        <div style="display:flex;">
          <div
            class="plan-wrap thin-scroll bg-fff"
            element-loading-text="加载中..."
          >
            <div v-show="treeVisible" class="tree-toggle" @click="toggleTree">
              <c-svg name="right1" />
            </div>
            <div v-show="planBgImg.url" style="background-color: #fff;">
              <div
                class="plan-content"
                :style="{
                  'background-image': planBgImg.url
                    ? `url(${planBgImg.url})`
                    : `url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)`
                }"
              >
                <div
                  v-for="(item, index) in deviceList"
                  :key="index"
                  :style="{
                    left: item.LocX,
                    top: item.LocY,
                    position: 'absolute'
                  }"
                  :data-mtid="item.Mtid"
                  :data-id="item.Id"
                  class="device-item"
                >
                  <!-- 摄像头 -->
                  <el-tooltip
                    v-if="!item.Child && item.Camera"
                    :value="item.show"
                    effect="light"
                    :content="item.Area + ': ' + item.Name"
                    placement="top"
                    popper-class="plan-tooltip"
                  >
                    <a
                      :class="{
                        inline: item.Status === 1,
                        'off-line': item.Status === 0,
                        alarm: item.Status === -1
                      }"
                      class="icon-wrap"
                      href="javascript:;"
                      :title="item.Area + ': ' + item.Name"
                      @click.stop="openVideoDialog(item)"
                    >
                      <c-svg :name="handleIcon(item)" />
                    </a>
                  </el-tooltip>
                  <!-- 点位 -->
                  <el-tooltip
                    v-if="!item.Child && !item.Camera"
                    :value="item.show"
                    :content="item.Name"
                    placement="top"
                    effect="light"
                    popper-class="plan-tooltip"
                  >
                    <a
                      :class="{
                        inline: item.Status === 1 || item.Valit === '开',
                        'off-line': item.Status === 0 || item.Valit === '关',
                        alarm: item.Status === -1
                      }"
                      class="icon-wrap"
                      href="javascript:;"
                      :title="item.Name"
                      @click.stop="showHistoryChart([item.PointId], item.Mtid)"
                    >
                      <c-svg :name="handleIcon(item)" />
                      <span class="point-value">{{ item.Valit }}</span>
                    </a>
                  </el-tooltip>
                  <!-- 设备，没有一级参数 -->
                  <el-tooltip
                    v-if="item.Child && !item.Child.length"
                    :value="item.show"
                    effect="light"
                    :content="item.Name"
                    placement="top"
                    popper-class="plan-tooltip"
                  >
                    <a
                      :class="{
                        inline: item.Status === 1,
                        'off-line': item.Status === 0,
                        alarm: item.Status === -1
                      }"
                      class="icon-wrap"
                      href="javascript:;"
                      :title="item.Name"
                      @click.stop="
                        openDialog(
                          item.Mtid,
                          item.Child,
                          item.Status,
                          item.Name,
                          item.PointId
                        )
                      "
                    >
                      <c-svg :name="handleIcon(item)" />
                    </a>
                  </el-tooltip>
                  <!-- 设备，带有一级参数 -->
                  <div
                    v-if="item.Child && item.Child.length"
                    class="plan-device"
                  >
                    <a
                      slot="reference"
                      :class="{
                        inline: item.Status === 1,
                        'off-line': item.Status === 0,
                        alarm: item.Status === -1
                      }"
                      class="icon-wrap"
                      href="javascript:;"
                      :title="item.Name"
                      @mouseout="handleMouseOut(item)"
                      @mouseover="handleMouseOver(item)"
                      @click.prevent="
                        openDialog(
                          item.Mtid,
                          item.Child,
                          item.Status,
                          item.Name,
                          item.PointId
                        )
                      "
                    >
                      <c-svg :name="handleIcon(item)" />
                    </a>
                    <div
                      v-show="item.show"
                      class="device-popover"
                      @click="item.show = false"
                    >
                      <div class="device-name">
                        {{ item.Name }}
                      </div>
                      <div
                        v-for="(item2, index) in item.Child"
                        :key="index"
                        style="white-space: nowrap;padding: 0 8px;"
                      >
                        <span>{{ item2.Name }}：&nbsp;</span>
                        <span
                          :class="{
                            inline: item2.Status === 1,
                            'off-line': item2.Status === 0,
                            alarm: item2.Status === -1
                          }"
                          >{{ item2.Valit }}</span
                        >
                      </div>
                      <div
                        class="mask"
                        style="position: absolute;top: 0;right: 0;bottom: 0; left: 0;z-index: 100;cursor: pointer"
                        @click="item.show = false"
                        @mousemove="popoverMouseOver($event)"
                        @mouseout="popoverMouseOut($event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-show="!planBgImg.url"
              style="text-align:center;margin-top: 250px;"
            >
              <c-svg name="cloud-upload" style="font-size: 60px;color: #999;" />
              <div style="font-size: 16px;color: #999;margin-top: 15px;">
                还没有创建平面图？马上
                <a
                  href="javascript:;"
                  style="color: #339999;font-size: 16px;"
                  @click="handleCreatePlan"
                  >创建
                </a>
              </div>
            </div>
            <el-dialog
              v-loading="dialogLoading"
              :visible.sync="dialogVisible"
              :show-close="false"
              element-loading-text="加载中..."
              custom-class="planShow-dialog"
              @close="dialogClose"
            >
              <div style="display: flex">
                <div class="planDialog-basic-info">
                  <div class="device-name">
                    {{ currentSelect.name }}
                    <el-tag
                      size="mini"
                      :type="
                        basicInfo.EConnectStatus === -1
                          ? 'info'
                          : basicInfo.EConnectStatus === 0
                          ? 'success'
                          : 'danger'
                      "
                    >
                      {{
                        basicInfo.EConnectStatus === -1
                          ? '离线'
                          : basicInfo.EConnectStatus === 0
                          ? '在线'
                          : '报警'
                      }}
                    </el-tag>
                  </div>
                  <ul class="basic-info-list">
                    <li>
                      <span class="label">设备编号：</span>
                      <span class="value">{{
                        basicInfo.assets_code || '-'
                      }}</span>
                    </li>
                    <li>
                      <span class="label">设备类型：</span>
                      <span class="value">{{ basicInfo.type || '-' }}</span>
                    </li>
                    <li>
                      <span class="label">关联区域：</span>
                      <span class="value">{{
                        basicInfo.LocationTreeName || '-'
                      }}</span>
                    </li>
                    <li>
                      <span class="label">SN 号：</span>
                      <span class="value">{{ basicInfo.sn || '-' }}</span>
                    </li>
                    <li>
                      <span class="label">品牌：</span>
                      <span class="value">{{ basicInfo.brand || '-' }}</span>
                    </li>

                    <li
                      v-for="item in basicInfo.ModelTreePropertyList"
                      :key="item.key"
                    >
                      <span class="label">{{ item.Key }}：</span>
                      <span class="value">{{ item.Value }}</span>
                    </li>
                    <li>
                      <span class="label">安装日期：</span>
                      <span class="value">{{
                        basicInfo.installdate ? basicInfo.installdate : ''
                      }}</span>
                    </li>
                    <li>
                      <span class="label">出产日期：</span>
                      <span class="value">{{ basicInfo.MFG || '-' }}</span>
                    </li>
                    <li
                      v-for="item in (basicInfo.Tag || '').split(';')"
                      :key="item"
                    >
                      <span class="label">设备标签：</span>
                      <el-tag v-if="item" size="mini">{{ item }}</el-tag>
                    </li>
                  </ul>
                </div>
                <div class="planDialog-level-info">
                  <div class="level-radio">
                    <el-radio-group v-model="level">
                      <el-radio-button label="1">
                        一级参数
                      </el-radio-button>
                      <el-radio-button label="2">
                        二级参数
                      </el-radio-button>
                      <el-radio-button label="3">
                        三级参数
                      </el-radio-button>
                    </el-radio-group>
                  </div>
                  <div style="padding: 10px 6px;overflow: auto">
                    <el-table
                      :data="tableData"
                      style="width: 720px;"
                      height="390"
                    >
                      <el-table-column prop="name" sortable label="名称" />
                      <el-table-column prop="area" sortable label="区域" />
                      <el-table-column prop="valit" sortable label="当前值" />
                      <el-table-column label="操作" width="70">
                        <template slot-scope="scope">
                          <el-button
                            type="text"
                            @click.native="
                              showHistoryChart(
                                [scope.row.pointId],
                                scope.row.mtid
                              )
                            "
                          >
                            <c-svg name="chart" />
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </div>
            </el-dialog>
            <HistoryDialog
              ref="historyDialog"
              :point-ids="history.point"
              :device-id="history.deviceId"
            />
          </div>
        </div>
      </div>
      <VideoPlayer :video="currentVideo" ref="videoPlayer" />
    </div>
  </div>
</template>
<script>
import { deviceInfo } from '@/api/model'
import { showlevInfo, existPlan } from '@/api/planNew'
import screenfull from 'screenfull'
import HistoryDialog from '@/components/HistoryDialog'
import { getTypeList, getPlanItems } from '@/api/planNew'
import { addModel, deleteModel, updateModel } from '@/api/locationTree'
import VideoPlayer from '@/components/VideoPlayer'
import { checkPermission } from '@/utils/permissions'
import { getPlanStructTree } from '@/api/planNew'

export default {
  components: {
    HistoryDialog,
    VideoPlayer
  },
  data() {
    return {
      structTreeVisible: false,
      structData: [],
      chartImgUrl: '',
      treeVisible: false,
      structLoading: false,
      structTreeProps: {
        children: 'Child',
        label: 'mname'
      },
      innerVisible: false,
      treeMtids: [],
      currentNode: {
        mtid: '',
        mname: '-'
      },
      planLoading: false,
      planBgImg: {
        url: '',
        width: '',
        height: ''
      },
      deviceList: [],
      pointName: '',
      childSystemOptions: [],
      childSystems: [],
      isShowAll: false,
      hackReset: true,
      fullScreenStatus: false,
      currentSelect: {
        type: '',
        status: '',
        name: '',
        mtid: ''
      },
      pointList: [],
      htmlTitle: '点位名称',
      dialogLoading: false,
      level: '1',
      basicInfo: {},
      level1Info: [],
      level2Info: [],
      level3Info: [],
      tableData: [],

      history: {
        point: null,
        deviceId: 0
      },
      unit: '',
      currentVideo: {},
      dialogVisible: false
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  watch: {
    projectId() {
      this.fetchStructTree()
    },
    level(val) {
      this.tableData = this[`level${val}Info`]
    },
    'currentNode.mtid'() {
      this.fetchChildSystem()
    }
  },
  mounted() {
    this.fetchStructTree()

    let mtid = this.$route.query.mtid ? this.$route.query.mtid : ''
    if (mtid) {
      // 如果是通过点击创建页面的预览按钮进入当前页
      this.currentNode.mtid = mtid
      this.$refs.tree.setCurrentKey(mtid)
      this.fetchPlan()
    }
    // 监听平面图是否处理全屏状态下。
    screenfull.on('change', () => {
      if (screenfull.isFullscreen) {
        this.fullScreenStatus = true
        document.body.classList.add('plan-fullscreen')
      } else {
        document.body.classList.remove('plan-fullscreen')
        this.fullScreenStatus = false
      }
      let vw = window.innerWidth
      let vh = vw / (this.planBgImg.width / this.planBgImg.height)
      let plan = document.querySelector('.plan-content')
      let backgroundImg = this.planBgImg.url
        ? `url(${this.planBgImg.url})`
        : `url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)`
      if (screenfull.isFullscreen) {
        plan.style.cssText = `width: ${vw}px;height: ${vh}px;background-image: ${backgroundImg};background-size: ${vw}px ${vh}px`
      } else {
        plan.style.cssText = `height: 768px;background-image: ${backgroundImg};background-size: auto 768px`
        this.initPlanWrapSize(this.planBgImg.width, this.planBgImg.height)
      }
    })
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
  },
  methods: {
    toggleTree() {
      this.treeVisible = !this.treeVisible
    },
    handleEditArea(data) {
      this.$prompt('请输入区域名', '', {
        confirmButtonText: '确定',
        inputValue: data.mname,
        inputValidator: val => {
          if (val.length > 20 || val.length < 1) {
            return '区域名长度（1至20之间）'
          }
        },
        inputErrorMessage: '',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          updateModel({
            name: value,
            mtid: data.mtid
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message.success('编辑成功')
                this.fetchStructTree()
              } else {
                this.$message.error('编辑失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('编辑失败')
            })
        })
        .catch(() => {})
    },
    removeArea(data) {
      this.$confirm('确认要删除该区域？', '提示', { type: 'warning' }).then(
        () => {
          deleteModel(data.mtid)
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message({
                  type: 'success',
                  message: '删除成功'
                })
                this.fetchStructTree()
              } else {
                this.$message.error('删除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('删除失败')
            })
        }
      )
    },
    handleAddArea() {
      if (!this.currentNode.mtid) {
        this.$message('请选中一个区域，才可以添加子区域')
        return false
      }
      this.$prompt('请输入区域名', '', {
        confirmButtonText: '确定',
        inputValue: '',
        inputValidator: val => {
          if (val.length > 20 || val.length < 1) {
            return '区域名长度（1至20之间）'
          }
        },
        inputErrorMessage: '',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          addModel({
            name: value,
            mtid: this.currentNode.mtid
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message.success('添加成功')
                this.fetchStructTree()
              } else {
                this.$message.error('添加失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('添加失败')
            })
        })
        .catch(() => {})
    },
    // 树结点点击事件
    handleNodeClick(obj, node) {
      this.currentNode.mtid = node.data.mtid
      this.currentNode.mname = node.data.mname
      this.planBgImg.url = ''
      this.fetchPlan()
      this.isShowAll = false
      this.structTreeVisible = false
    },
    handleCreatePlan() {
      if (!checkPermission([32])) {
        this.$message('你没有创建平面图的权限')
        return
      }
      this.$router.push({
        path: 'planCreate',
        query: {
          mtid: this.currentNode.mtid,
          tabIndex: this.$route.query.tabIndex
        }
      })
    },
    search(event) {
      event.stopPropagation()
      this.planBgImg.url = ''
      this.fetchPlan()
    },
    screenFull() {
      let wrap = document.querySelector('.plan-wrap')
      if (screenfull.enabled) {
        screenfull.toggle(wrap)
      }
    },
    filterPlan(visible) {
      // 筛选前先把所有已经打开的 popover 关闭
      this.isShowAll = false
      this.deviceList.forEach(item => {
        item.show = false
      })
      if (!visible) {
        this.fetchPlan(this.childSystems.join(','))
      }
    },
    showAll() {
      this.isShowAll = !this.isShowAll
      this.deviceList.forEach(item => {
        this.isShowAll && (item.show = true)
        !this.isShowAll && (item.show = false)
      })
    },
    handleMouseOut(item) {
      if (!this.isShowAll) {
        item.show = false
      }
    },
    handleMouseOver(item) {
      if (!this.isShowAll) {
        item.show = true
      }
    },
    // 当popover全展开时，鼠标悬浮在的哪个popover突显出来
    popoverMouseOver(e) {
      e.target.parentNode.style.zIndex = 233333333333
    },
    // 当popover全展开时，突显出来的popover隐藏
    popoverMouseOut(e) {
      e.target.parentNode.style.zIndex = 6000
    },
    openVideoDialog(item) {
      this.$refs.videoPlayer.openDialog()
      this.currentVideo = {
        type: item.AccessToken ? 1 : 0,
        url: item.Camera,
        token: item.AccessToken
      }
    },
    showHistoryChart(points, deviceId) {
      this.$refs.historyDialog.toggleDialog()
      this.history.point = points
      this.history.deviceId = deviceId
    },
    openDialog(mtid, child, status, name) {
      // 筛选前先把所有已经打开的 popover 关闭
      this.isShowAll = false
      this.deviceList.forEach(item => {
        item.show = false
      })
      this.currentSelect.type = child ? '1' : '2'
      this.currentSelect.mtid = mtid
      if (this.currentSelect.type === '1') {
        // 设备
        this.dialogVisible = true
        this.currentSelect.status = status
        this.currentSelect.name = name
        this.fetchDialogData(this.currentSelect.mtid)
      }
    },
    dialogClose() {
      this.level = '1'
      this.dialogVisible = false
    },
    // 获取平面图信息
    fetchPlan(typeId = '') {
      this.timer && clearInterval(this.timer)
      this.planLoading = true
      getPlanItems({
        mtid: this.currentNode.mtid,
        typeId
      })
        .then(res => {
          let data = res.data.Data
          if (res.data.Code === 200) {
            this.planBgImg.url = data.Img
              ? data.Img.indexOf('https://front-end-assets') > -1
                ? data.Img
                : global.PROJECT_URLPROD + data.Img
              : ''
            this.planBgImg.width = data.BgWidth
            this.planBgImg.height = data.BgHeight
            data.List.forEach(item => {
              item.show = false
            })
            this.deviceList = data.List
            if (screenfull.isFullscreen) {
              // 全屏状态下不用计算平面图的大小
              return false
            }
            this.initPlanWrapSize(data.BgWidth, data.BgHeight)
          } else {
            this.deviceList = []
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.planLoading = false
        })
      this.timer = setInterval(() => {
        getPlanItems({
          mtid: this.currentNode.mtid,
          typeId
        })
          .then(res => {
            if (res.data.Code === 200) {
              const data = res.data.Data
              data.List.forEach(item => {
                if (this.isShowAll) {
                  item.show = true
                } else {
                  item.show = false
                }
              })
              this.deviceList = data.List
            }
          })
          .catch(err => {
            console.error(err)
          })
      }, 60000)
    },
    // 判断每个结点有没有平面图，更新结构树，
    updateTreeData(treeData) {
      this.getMtid(treeData)
      existPlan({ mtid: this.treeMtids.join(',') })
        .then(res => {
          let data = JSON.parse(res.data)
          this.setTreeData(treeData, data)
          let planStructTree = JSON.parse(JSON.stringify(treeData))
          this.structData = planStructTree
          this.$refs.tree.setCurrentKey(this.currentNode.mtid)
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchDialogData(mtid) {
      this.dialogLoading = true
      deviceInfo(mtid)
        .then(res => {
          if (res.data.Code === 200) {
            this.basicInfo = res.data.Data[0]
          } else {
            this.basicInfo = []
          }
        })
        .catch(err => {
          console.error(err)
        })
      showlevInfo(mtid)
        .then(res => {
          this.dialogLoading = false
          let data = JSON.parse(res.data)
          if (data.success) {
            this.level1Info = data.listone
            this.level2Info = data.listtwo
            this.level3Info = data.listthree
            this.tableData = this.level1Info
          } else {
            this.level1Info = []
            this.level2Info = []
            this.level3Info = []
            this.tableData = []
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchStructTree() {
      this.structLoading = true
      getPlanStructTree({
        project: this.projectId
      })
        .then(res => {
          let data = JSON.parse(res.data)
          if (data.success) {
            this.structData = data.plist
            this.currentNode.mtid = this.structData[0].mtid
            this.currentNode.mname = this.structData[0].mname
            this.$nextTick(() => {
              this.$refs.tree.setCurrentKey(this.currentNode.mtid)
              this.fetchPlan()
              // 判断每个结点有没有平面图，更新结构树，
              this.updateTreeData(this.structData)
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.structLoading = false
        })
    },
    fetchChildSystem() {
      getTypeList({
        mtid: this.currentNode.mtid
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.childSystemOptions = res.data.Data
          } else {
            this.childSystemOptions = []
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    initPlanWrapSize(bgWidth, bgHeight) {
      let wrap = document.querySelector('.plan-content')
      wrap.style.width = bgWidth * (768 / bgHeight) + 'px'
    },
    // 遍历结构树，拿到所有的mtid
    getMtid(tree) {
      for (let i = 0, length = tree.length; i < length; i++) {
        this.treeMtids.push(tree[i].mtid)
        if (tree[i].Child) {
          this.getMtid(tree[i].Child)
        }
      }
    },
    // 遍历结构树，给所有结点添加 exist 属性（判断有没有平面图）
    setTreeData(tree, map) {
      for (let i = 0, length = tree.length; i < length; i++) {
        tree[i].exist = map[tree[i].mtid] === 'True' ? true : false
        if (tree[i].Child) {
          this.setTreeData(tree[i].Child, map)
        }
      }
    },
    // 如果图标是 defult 或 空字符，做处理判断是点还是设备
    handleIcon(item) {
      let icon = item.Icon
      if (icon === 'default' || icon === '') {
        item.Type === 1 && (icon = 'point')
        item.Type === 2 && (icon = 'cube1')
      }
      return icon
    }
  }
}
</script>
<style lang="scss">
.planShow-page-header {
  .right-wrap {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .structTree-trigger {
    border-radius: 2px;
    padding: 5px 15px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    margin-left: 15px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.65);
  }
  .filter-select {
    margin-right: 10px;
    .el-tag__close {
      display: none;
    }
  }
}
.planShow {
  border-radius: 4px;
  margin: 20px;

  .plan-wrap {
    flex: 1;
    height: 700px;
    margin-left: 15px;

    border-radius: 4px;
    position: relative;
    .tree-toggle {
      position: absolute;
      top: 50%;
      left: -30px;
      transform: translateY(-50%);
      cursor: pointer;
      padding: 5px;
      svg {
        color: #339999;
        font-size: 20px;
      }
    }
    .plan-content {
      position: relative;
      width: 1366px;
      height: 768px;
      margin: auto;
      //   overflow: hidden;
      background-repeat: no-repeat;
      background-position-x: center;
      background-size: auto 768px;
    }
    .device-item {
      position: relative;
      .device-popover {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 45px;
        min-width: 100px;
        border-radius: 4px;
        color: #606266;
        line-height: 1.5;
        font-size: 14px;
        background: #fff;
        z-index: 1000;
        cursor: pointer;
        padding-bottom: 6px;
        box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
          0px 6px 16px 0px rgba(0, 0, 0, 0.08),
          0px 3px 6px -4px rgba(0, 0, 0, 0.12);
        .device-name {
          padding: 5px 8px;
          font-weight: bold;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          display: block;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 6px;
        }
        &:after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -13px;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: #fff;
        }
      }
      .icon-wrap {
        position: relative;
        color: #fff;
        line-height: 30px;
        min-width: 10px;
        height: 30px;
        background: #394c67;
        box-shadow: 0px 5px 10px -2px rgba(0, 0, 0, 0.3);
        opacity: 0.8;
        border-radius: 6px;
        padding: 0 10px;
        text-align: center;
        .point-value {
          font-size: 14px;
          color: #1890ff;
        }
        &::before {
          content: '';
          position: absolute;
          border: 5px solid;
          border-color: #394c67 transparent transparent transparent;
          bottom: -10px;
          left: 6px;
          opacity: 0.8;
        }
        svg {
          font-size: 15px;
          color: #fff;
          vertical-align: middle;
        }
        &.inline {
          .point-value {
            color: #1890ff;
          }
        }
        &.off-line {
          background: #8b8b8b;
          box-shadow: 0px 5px 10px -2px rgba(0, 0, 0, 0.3);
          .point-value {
            color: #ffffff;
          }
          &::before {
            border-color: #8b8b8b transparent transparent transparent;
          }
        }
        &.alarm {
          box-shadow: 0px 5px 10px -2px #ff3f0d;
          .point-value {
            color: #ff3f0d;
          }
        }
      }
      a {
        position: relative;
        font-size: 12px;
        line-height: 24px;
        box-shadow: 0 0 0 1px #ccc;
        background: #fff;
        color: black;
        float: left;
      }
    }
  }
  .el-dialog__wrapper {
    background: rgba(0, 0, 0, 0.5);
  }
  @at-root .el-dialog.planShow-dialog {
    width: 1000px;
    .el-dialog__body {
      padding: 0;
    }
    .el-dialog__header {
      padding: 0;
    }
    .planDialog-basic-info {
      flex: 0 240px;
      padding: 25px 0;
      border-right: 2px solid #c6d3dc;
    }
    .planDialog-level-info {
      flex: 0 0 700px;
      padding: 25px 0;
    }
    .icon-wrap {
      text-align: center;
      img {
        width: 60px;
      }
    }
    .device-name {
      font-weight: 500;
      padding-left: 25px;
      font-size: 24px;
      margin: 10px 0;
    }
    .device-status {
      margin-top: 5px;
      text-align: center;
      letter-spacing: 3px;
      color: #02a9d1;
      font-size: 15px;
    }
    .inline {
      color: #13ce66;
    }
    .off-line {
      color: #d3dce6;
    }
    .alarm {
      color: #ff4949;
    }
    .basic-info-list {
      margin-top: 10px;
      padding-left: 5px;
      list-style: none;
      li {
        padding: 8px 5px;
      }
      .label {
        display: inline-block;
        width: 85px;
        color: rgba(0, 0, 0, 0.85);
        text-align: right;
      }
      .value {
        color: rgba(0, 0, 0, 0.65);
      }
    }
    .level-radio {
      text-align: center;
    }
  }
  @at-root .video-dialog {
    width: 900px;
    border-radius: 4px;
    overflow: hidden;
    .el-dialog__body {
      padding: 0;
    }
    .el-dialog__header {
      padding: 0;
    }
  }
}
.clearfix {
  content: '';
  clear: both;
  display: block;
}
.planShow-sturctTree-popover {
  min-width: 300px;
  .struct-wrap {
    flex: 0 0 300px;
    border-radius: 4px;
    overflow: hidden;
    &.close {
      flex: 0;
    }
    .struct-content {
      height: 725px;
      padding: 15px 10px;
      overflow: auto;
    }
    .el-tree {
      border: none;
      .icon {
        font-size: 16px;
        margin-right: 5px;
        color: #20a0ff;
      }
    }
  }
  .node-item {
    white-space: normal;
    display: flex;
    flex: 1;
    &:hover {
      .el-button {
        display: inline-block;
      }
    }
  }
  .node-btn-wrap {
    flex: 1;
    text-align: right;
    .el-button {
      padding: 0;
      display: none;
    }
    .el-icon-picture {
      font-size: 14px;
      color: #339999;
      margin-right: 5px;
      margin-left: 10px;
    }
  }
}
.plan-tooltip {
  z-index: 2147483647 !important;
}
.plan-date-picker {
  z-index: 2147483647 !important;
}

.el-message-box__wrapper {
  z-index: 2147483647 !important;
  background: rgba(0, 0, 0, 0.5);
}
.plan-item-popper {
  min-width: 110px;
  padding: 7px;
}
.plan-fullscreen {
  .plan-wrap {
    overflow: auto;
  }
}
@keyframes bounce {
  from,
  20%,
  53%,
  80%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(-50%, 0, 0);
  }
  40%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(-50%, -12px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(-50%, -8px, 0);
  }
  90% {
    transform: translate3d(-50%, -4px, 0);
  }
}

.bounce {
  animation-name: bounce;
  transform-origin: center bottom;
  animation-duration: 1s;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
}
.circlepoint {
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-right: 5px;
  border-radius: 50%;
}
</style>
