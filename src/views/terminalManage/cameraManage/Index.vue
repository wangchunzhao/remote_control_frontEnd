<template>
  <div class="camera-manage content-box">
    <div style="margin-bottom: 16px;">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        v-permission="[platform === 'DEVICE_CONNECT' ? 136 : 132]"
        @click.native="() => $refs.addCameraDialog.openDialog()"
      >
        新增
      </el-button>
      <el-button
        v-permission="[platform === 'DEVICE_CONNECT' ? 137 : 134]"
        type="danger"
        size="small"
        @click.native="handleRemove"
      >
        从项目中移除
      </el-button>
      <el-select
        v-model="filterForm.project"
        placeholder="请选择项目"
        size="small"
        style="margin-left: 10px;"
        v-if="platform === 'DEVICE_CONNECT'"
        clearable
        filterable
        @change="changeProject"
      >
        <el-option
          v-for="item in proList"
          :key="item.id"
          :value="item.id"
          :label="item.label"
        />
      </el-select>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        placeholder="查找序列号/名称"
        style="width: 200px;float: right;"
        suffix-icon="el-icon-search"
      />
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
      element-loading-text="加载中..."
      @selection-change="handleSelectionChange"
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="编号" sortable="custom" prop="DeviceSerial">
        <template slot-scope="{ row }">
          {{ row.DeviceSerial || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="名称" sortable="custom" prop="Name" />
      <el-table-column label="所属项目" prop="ProjectName" />
      <el-table-column
        label="品牌"
        prop="VideoMonitorType"
        column-key="VideoMonitorType"
        :filters="[
          { text: '自定义', value: 0 },
          { text: '萤石', value: 1 },
          { text: '乐橙', value: 2 }
        ]"
      >
        <template slot-scope="{ row }">
          {{ videoMonitorTypeOptions[row.VideoMonitorType] }}
        </template>
      </el-table-column>
      <el-table-column
        label="应用密钥"
        prop="VideoMonitorApplicationId"
        column-key="VideoMonitorApplicationId"
        :filters="secretOptions"
      >
        <template slot-scope="{ row }">
          {{
            row.VideoMonitorApplicationId
              ? secretOptions.find(
                  v => v.value === row.VideoMonitorApplicationId
                ).text
              : '-'
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="连接状态"
        prop="Status"
        column-key="Status"
        :filter-multiple="false"
        :filters="[{ text: '在线', value: 1 }, { text: '离线', value: 0 }]"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.Status === 0 ? 'info' : 'success'" size="small">
            {{ row.Status === 0 ? '离线' : '在线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="视频连接">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            @click.native="handleWatchVideo(row)"
            style="padding: 0;"
          >
            <c-svg
              name="monitor"
              style="width:20px;height:18px;cursor:pointer"
            />
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <AddCameraDialog
      :projectId="platform === 'BUSINESS' ? projectId : null"
      @complete="fetchTableData"
      ref="addCameraDialog"
    />
    <VideoPlayer :video="currentVideo" ref="videoPlayer" />
  </div>
</template>

<script>
import AddCameraDialog from '@/views/monitor/refrigerationSystem/AddCameraDialog'
import {
  getVideoMonitorPointPage,
  batchDeleteVideoMonitorPoint
} from '@/api/videoMonitorPoint'
import VideoPlayer from '@/components/VideoPlayer'
import { getVideoMonitorApplicationDropdown } from '@/api/videoMonitorApplication'

export default {
  name: 'CameraManageIndex',
  components: {
    AddCameraDialog,
    VideoPlayer
  },
  data() {
    return {
      filterForm: {
        text: '',
        project: '',
        status: undefined,
        sortProp: undefined,
        isAsc: false,
        videoMonitorTypeList: [],
        videoMonitorApplicationIdList: []
      },
      filter: '',
      projectFilter: '',
      tableLoading: false,
      multipleSelection: [],
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      videoMonitorTypeOptions: {
        0: '-',
        1: '萤石',
        2: '乐橙'
      },
      currentVideo: {},
      secretOptions: []
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  async mounted() {
    if (this.platform === 'BUSINESS') {
      this.filterForm.project = this.projectId
    }
    const res = await getVideoMonitorApplicationDropdown({
      companyId: this.companyId
    })

    if (res.data.Code === 200) {
      this.secretOptions = res.data.Data.map(v => {
        return {
          text: v.Value,
          value: v.Key
        }
      })
    }

    this.fetchTableData()
  },
  methods: {
    // 查看视频
    handleWatchVideo(row) {
      this.currentVideo = {
        type: row.VideoMonitorType,
        url: row.MonitorAddress,
        token: row.AccessToken
      }
      this.$refs.videoPlayer.openDialog()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 表格筛选-修改项目
    changeProject() {
      this.fetchTableData()
    },
    handleRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$confirm('确认要移除选中的摄像头', '提示', { type: 'warning' }).then(
        () => {
          batchDeleteVideoMonitorPoint({
            pointIdList: this.multipleSelection.map(item => item.PointId)
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('移除成功')
                this.fetchTableData()
              } else {
                this.$message.error('移除失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
      )
    },
    // 表格排序
    sortChange(val) {
      this.filterForm.sortProp = val.prop
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.VideoMonitorApplicationId) {
        this.filterForm.videoMonitorApplicationIdList =
          filter.VideoMonitorApplicationId
      } else if (filter.Status) {
        this.filterForm.status = filter.Status[0]
      } else if (filter.VideoMonitorType) {
        this.filterForm.videoMonitorTypeList = filter.VideoMonitorType
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    fetchTableData() {
      this.tableLoading = true
      const {
        text,
        project,
        isAsc,
        sortProp,
        status,
        videoMonitorTypeList,
        videoMonitorApplicationIdList
      } = this.filterForm
      const { currentPage, size } = this.pagination

      getVideoMonitorPointPage({
        CompanyId: this.companyId,
        ProjectId: project,
        DeviceSerialOrName: text,
        VideoMonitorTypeList: videoMonitorTypeList,
        Status: status,
        SortType: sortProp,
        IsAsc: isAsc,
        PageIndex: currentPage,
        PageSize: size,
        VideoMonitorApplicationIdList: videoMonitorApplicationIdList
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tableData = res.data.Data.Data
            this.pagination.total = res.data.Data.TotalCount
          } else {
            this.$message.error('采集器列表获取失败')
          }
        })
        .catch(err => {
          this.$message.error('采集器列表获取失败')
          console.error(err)
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.camera-manage {
  background-color: #fff;
  border-radius: 4px;
}
</style>
