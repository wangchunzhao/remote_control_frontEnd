<template>
  <div class="device-container">
    <page-header :title="$route.meta.title">
      <template v-slot:right>
        <el-button
          size="mini"
          v-permission="[platform === PLATFORM.business ? 41 : '*']"
          @click.native="
            () => {
              $refs.repairAddForm.toggleDialog()
            }
          "
          style="padding: 5px 7px;;margin-left: 15px;"
        >
          <i class="el-icon-plus"></i>
          新建维修工单
        </el-button>
      </template>
    </page-header>
    <div class="content-box">
      <div class="table-tool-box">
        <el-button
          @click.native="() => $refs.addCameraDialog.openDialog()"
          size="small"
          type="primary"
        >
          新增
        </el-button>
        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          class="filter-input"
          placeholder="搜索名称"
          suffix-icon="el-icon-search"
        />
      </div>

      <el-table
        v-loading="tableLoading"
        :data="tableData"
        style="width: 100%;"
        @sort-change="sortChange"
        @filter-change="filterChange"
      >
        <el-table-column prop="PointName" label="名称" />
        <el-table-column prop="Area" label="位置" />
        <el-table-column prop="Status" label="状态">
          <template slot-scope="{ row }">
            <el-tag
              v-if="row.Status !== -1"
              size="mini"
              :type="row.Status === 0 ? 'info' : 'success'"
              >{{ row.Status === 0 ? '离线' : '在线' }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="UpdateTime" label="更新时间" />
        <el-table-column prop="MonitorAddress" label="视频连接">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              v-if="row.Status !== 0"
              @click.native="watchVideo(row)"
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
      <VideoPlayer :video="currentVideo" ref="videoPlayer" />
      <AddCameraDialog
        :projectId="projectId"
        @complete="fetchTableData"
        ref="addCameraDialog"
      />
      <RepairAddApp ref="repairAddForm" @complete="fetchTableData" />
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { getVideoMonitorPage } from '@/api/model_new'
import VideoPlayer from '@/components/VideoPlayer'
import AddCameraDialog from '../refrigerationSystem/AddCameraDialog'
import RepairAddApp from '@/components/RepairAddApp'

export default {
  components: {
    VideoPlayer,
    AddCameraDialog,
    RepairAddApp
  },
  data() {
    return {
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined
      },

      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      PLATFORM,
      currentVideo: {}
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    watchVideo(row) {
      this.currentVideo = {
        type: row.VideoMonitorType,
        url: row.MonitorAddress,
        token: row.AccessToken
      }
      this.$refs.videoPlayer.openDialog()
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'CREATE_TIME') {
        this.filterForm.sortProp = 0
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.PROTOCOL) {
        this.filterForm.protocol = filter.PROTOCOL
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 分页
    handleCurrentChange() {
      this.fetchTableData()
    },
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 获取表格数据
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { text, sortProp, isAsc } = this.filterForm
        const { currentPage, size } = this.pagination
        getVideoMonitorPage({
          BigTypeId: this.$route.query.sid,
          ProjectId: this.projectId,
          PointName: text,
          SortType: sortProp,
          IsAsc: isAsc,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            let data = res.data
            if (data.Code === 200) {
              this.tableData = data.Data.Data
              this.pagination.total = data.Data.TotalCount
            } else {
              this.tableData = []
              this.pagination.total = 0
              this.$message.error('列表获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.tableData = []
            this.pagination.total = 0
            this.$message.error('列表获取失败')
          })
          .finally(() => {
            this.tableLoading = false
          })
      },
      1000,
      {
        leading: true
      }
    )
  }
}
</script>
