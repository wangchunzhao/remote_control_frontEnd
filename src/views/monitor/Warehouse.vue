<template>
  <div class="device-container">
    <page-header :title="$route.meta.title">
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
          style="padding: 5px 7px;;margin-left: 15px;"
        >
          <i class="el-icon-plus"></i>
          添加设备
        </el-button>
      </template>
    </page-header>
    <el-tabs v-model="activeName" class="device-tab" @tab-click="getsubId">
      <el-tab-pane
        v-for="item in tabList"
        :key="item.id + projectId"
        v-loading="tabLoading"
        :name="item.id"
        :label="item.Value"
        element-loading-text="加载中..."
        class="pdg"
      >
        <div v-if="item.id !== '-1'" class="device-wrap">
          <el-form ref="searchForm" :model="searchForm" label-width="70px">
            <el-row :gutter="48">
              <el-col :span="8">
                <el-form-item label="设备名称">
                  <el-input
                    v-model="searchForm.deviceName"
                    size="small"
                    placeholder="请输入"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="监测点">
                  <el-input
                    v-model="searchForm.point"
                    size="small"
                    placeholder="请输入"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8" class="handleWrapper">
                <el-button
                  size="small"
                  icon="el-icon-search"
                  type="primary"
                  @click="searchDevice"
                >
                  搜索
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  icon="el-icon-refresh"
                  @click="resetForm"
                >
                  重置
                </el-button>
              </el-col>
            </el-row>
          </el-form>
          <el-row>
            <el-col :span="24">
              <el-table
                :data="table"
                :row-class-name="tableRowClassName"
                :header-row-class-name="tableheaderClass"
                fit
                @sort-change="handleSortChange"
              >
                <el-table-column type="index" label="序号" width="60px">
                  <template slot-scope="scope">
                    <span>{{
                      listPagination.num * (listPagination.page - 1) +
                        1 +
                        scope.$index
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  sortable="custom"
                  prop="mname"
                  label="设备名称"
                />
                <el-table-column
                  sortable="custom"
                  prop="pname"
                  label="点位名称"
                />
                <el-table-column prop="valuename" label="当前值" sortable>
                  <template slot-scope="scope">
                    <div
                      style="cursor:pointer;padding-right:20px"
                      :class="{
                        online: scope.row.valuename === '开',
                        offline: scope.row.valuename === '关',
                        active:
                          scope.row.alarmactive !== '' &&
                          Number(scope.row.alarmactive) > 0,
                        normal: Number(scope.row.alarmactive) <= 0
                      }"
                      @click="fetHistoryData(scope.row.point, scope.row.id)"
                    >
                      {{ scope.row.valuename }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="在线状态">
                  <template slot-scope="{ row }">
                    <el-tag
                      size="mini"
                      :type="
                        row.ConnectStatus === 2
                          ? 'success'
                          : row.ConnectStatus === 3
                          ? 'danger'
                          : 'info'
                      "
                    >
                      {{
                        row.ConnectStatus === 2
                          ? '在线'
                          : row.ConnectStatus === 3
                          ? '报警'
                          : '离线'
                      }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="utime" label="更新时间" sortable />
                <el-table-column fixed="right" label="操作">
                  <template slot-scope="scope">
                    <router-link
                      :to="{
                        name: 'devicePointList',
                        query: {
                          deviceName: scope.row.mname,
                          mtid: scope.row.id,
                          from: $route.name,
                          path: $route.path,
                          BigTypeId: sid,
                          SmallTypeId: activeName
                        }
                      }"
                      class="device-card_a"
                    >
                      所有参数
                    </router-link>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <div class="pagination-wrap">
            <el-pagination
              background
              :current-page.sync="listPagination.page"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="listPagination.num"
              layout="total, sizes, prev, pager, next, jumper"
              :total="listPagination.total"
              @size-change="handleSizeChanges"
              @current-change="handleCurrentChanges"
            />
          </div>
        </div>
        <div v-if="item.id === '-1'" style="margin: -20px;">
          <plan-show />
        </div>
      </el-tab-pane>
    </el-tabs>
    <HistoryDialog
      ref="historyDialog"
      :point-ids="history.point"
      :device-id="history.deviceId"
    />
    <DeviceAddDialog
      :systemId="Number($route.query.sid)"
      ref="addDialog"
      @refresh="handleRefreshPage()"
    />
  </div>
</template>
<script>
import { getTab, getTableList } from '@/api/model'
import PlanShow from '@/views/plan/planShow'
import HistoryDialog from '@/components/HistoryDialog'
import DeviceAddDialog from '@/views/projectConfig/deviceList/DeviceAddDialog'
export default {
  components: {
    PlanShow,
    HistoryDialog,
    DeviceAddDialog
  },
  data() {
    return {
      activeName: null,
      sid: null,
      tabList: [],
      deviceList: [],
      deviceName: '',
      tabLoading: true,
      tabcontentQuery: {
        page: 1,
        num: 12,
        total: 0
      },
      listPagination: {
        page: 1,
        num: 10,
        total: 0
      },
      radio: '列表模式',
      table: [],
      searchForm: {
        deviceName: '',
        point: '',
        value: '',
        sortField: undefined,
        isAsc: undefined
      },

      history: {
        point: null,
        deviceId: 0
      }
    }
  },
  watch: {
    $route() {
      const { fullPath } = this.$route
      this.$router.replace({
        path: '/redirect' + fullPath
      })
    },
    projectId() {
      this.fetchtab()
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.$store.commit('SET_HEADER_TITLE', this.$route.query.title)
    // 仓库监测的系统id 是 191
    this.sid = 191
    this.fetchtab()
    // if (this.$route.query.sid) {
    //   this.pid = JSON.parse(sessionStorage.getItem(storageName('project'))).id
    //   this.sid = this.$route.query.sid
    //   sessionStorage.setItem(storageName('subsystemId'), this.sid)
    //   this.fetchtab()
    // } else {
    //   this.pid = JSON.parse(sessionStorage.getItem(storageName('project'))).id
    //   this.sid = sessionStorage.getItem(storageName('subsystemId'))
    //   this.fetchtab()
    // }
  },
  methods: {
    handleSortChange(val) {
      if (val.order === 'ascending') {
        this.searchForm.isAsc = true
      } else {
        this.searchForm.isAsc = false
      }
      if (val.prop === 'mname') {
        this.searchForm.sortField = 1
        this.fetchListData()
      } else if (val.prop === 'pname') {
        this.searchForm.sortField = 2
        this.fetchListData()
      }
    },
    initTable() {
      if (this.radio === '列表模式') {
        this.listPagination.page = 1
        this.listPagination.num = 10
        this.fetchListData()
      }
    },
    // 跳转设备详情页面
    gojump(mtid) {
      // @click="gojump(cell.mtid)"
      this.$router.push({
        path: '/monitor/device',
        query: { mtid: mtid, from: this.$route.name, path: this.$route.path }
      })
    },
    fetchAllData(row) {
      this.$router.push({
        name: 'devicePointList',
        query: {
          mtid: row.mtid,
          deviceName: row.mname,
          from: this.$route.name,
          path: this.$route.path
        }
      })
    },
    // 重置表单
    resetForm() {
      this.searchForm.deviceName = ''
      this.searchForm.point = ''
      this.searchForm.value = ''
      if (this.radio === '列表模式') {
        this.fetchListData()
      }
    },
    fetHistoryData(pointId, deviceId) {
      this.history.point = [pointId]
      this.history.deviceId = deviceId
      this.$refs.historyDialog.toggleDialog()
    },
    // alarmactive为标识设备报警状态
    tableRowClassName(row) {
      if (row.ConnectStatus === 3) {
        return 'danger-row'
      }
      return ''
    },
    getsubId() {
      this.searchForm.deviceName = ''
      this.searchForm.point = ''
      this.searchForm.value = ''

      this.listPagination.page = 1
      this.listPagination.num = 10
      this.fetchListData()
    },
    // 获取点位表格数据
    fetchListData() {
      this.tabLoading = true
      getTableList({
        ProjectId: this.projectId,
        BigTypeId: this.sid,
        ModelTreeName: this.searchForm.deviceName,
        SmallTypeId: this.activeName,
        PageIndex: this.listPagination.page,
        PageSize: this.listPagination.num,
        PointName: this.searchForm.point,
        SortType: this.searchForm.sortField,
        IsAsc: this.searchForm.isAsc
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.listPagination.total = data.TotalCount
            this.table = data.Data
          } else {
            this.table = []
            this.listPagination.total = 0
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.tabLoading = false
        })
    },
    fetchtab() {
      getTab({
        projectId: this.projectId,
        bigTypeId: this.sid
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
            if (this.$store.state.app.project.Industry === 1) {
              // 冷链行业
              this.tabList.unshift({
                id: '-1',
                Value: '平面图'
              })
            }

            this.activeName = this.tabList[0].id
            if (
              (this.activeName === '3' || this.activeName === '8') &&
              this.$route.query.sid === '41'
            ) {
              // 冷库
              this.radio = '卡片模式'
            }
            this.fetchListData()
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    searchDevice() {
      if (this.radio === '列表模式') {
        this.listPagination.page = 1
        this.listPagination.num = 10
        this.fetchListData()
      }
    },
    handleCurrentChanges(val) {
      this.listPagination.page = val
      this.fetchListData()
    },
    handleSizeChanges(val) {
      this.listPagination.num = val
      this.fetchListData()
    },
    tableheaderClass() {
      return 'header-row'
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

<style lang="scss">
@import 'src/assets/style/monitorCommon.scss';
</style>
