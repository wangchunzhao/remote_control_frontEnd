<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button @click.native="handleClickAdd" size="small" type="primary">
        创建新模板
      </el-button>
      <el-tooltip
        class="item"
        effect="dark"
        content="组合模板中包含多个已定义的从站设备，用于快速配置网关通讯点位"
        placement="top"
      >
        <i
          class="el-icon-question"
          style="margin-left: 15px;font-size: 18px;color: rgba(0,0,0,0.3); cursor: pointer;"
        ></i>
      </el-tooltip>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索模板名称"
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
      <el-table-column type="index" width="70" label="序号" />
      <el-table-column prop="DeviceTemplateName" label="模板名称" />
      <el-table-column
        column-key="ShareUserId"
        prop="ShareUserName"
        :filters="userOptions"
        label="来源"
      />
      <el-table-column prop="UpdateTime" sortable="custom" label="编辑时间" />

      <el-table-column prop="PointNum" label="点位数量" />

      <el-table-column label="操作">
        <template v-if="row.Permission" slot-scope="{ row }">
          <!-- 权限集合 1:查看 2:使用 3:分享 4:编辑 5:删除(,1,2,3,4,5,) -->
          <el-button
            v-if="row.Permission.includes(',1,')"
            @click.native="() => handleClickWatch(row)"
            type="text"
          >
            查看
          </el-button>
          <el-button
            v-if="row.Permission.includes(',4,')"
            @click.native="() => handleClickEdit(row)"
            type="text"
          >
            编辑
          </el-button>
          <el-button
            v-if="row.Permission.includes(',3,')"
            @click.native="() => handleClickShare(row)"
            type="text"
          >
            分享
          </el-button>
          <el-button
            v-if="row.Permission.includes(',4,')"
            @click.native="() => handleClickCopy(row)"
            type="text"
          >
            复制
          </el-button>
          <el-button
            @click.native="() => handleClickRemove(row)"
            type="text"
            v-if="row.Permission.includes(',5,')"
            class="btn-danger"
          >
            删除
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
    <EditDialog ref="editDialog" @refresh="fetchTableData" />
    <DetailDialog ref="detailDialog" />
    <CopyDialog ref="copyDialog" @refresh="fetchTableData" />
    <ShareDialog ref="shareDialog" @refresh="fetchTableData" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import EditDialog from './EditDialog'
import DetailDialog from '../component/DialogTemplatePointList'
import CopyDialog from './CopyDialog'
import ShareDialog from './ShareDialog'
import {
  getDeviceTemplatePage,
  deleteDeviceTemplate,
  getDeviceTemplatePageShareUserDropdown
} from '@/api/deviceTemplate'

export default {
  components: {
    EditDialog,
    DetailDialog,
    CopyDialog,
    ShareDialog
  },
  data() {
    return {
      filterForm: {
        text: '',
        sortProp: undefined,
        shareUserId: undefined,
        isAsc: undefined
      },
      userOptions: [],

      tableLoading: false,
      tableData: [{}],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  mounted() {
    this.fetchTableData()
    getDeviceTemplatePageShareUserDropdown().then(res => {
      if (res.data.Code === 200) {
        this.userOptions = res.data.Data
        this.userOptions.forEach(item => {
          item.text = item.Value
          item.value = item.Key
        })
      }
    })
  },
  methods: {
    // 点击新增
    handleClickAdd() {
      this.$refs.editDialog.openDialog()
    },
    // 点击查看
    handleClickWatch(row) {
      this.$refs.detailDialog.openDialog({
        id: row.DeviceTemplateId,
        completeControl: row.Permission.includes(',4,')
      })
    },
    // 点击编辑
    handleClickEdit(row) {
      this.$refs.editDialog.openDialog(row.DeviceTemplateId)
    },
    // 点击分享
    handleClickShare(row) {
      this.$refs.shareDialog.openDialog(row.DeviceTemplateId)
    },
    // 点击复制
    handleClickCopy(row) {
      this.$refs.copyDialog.openDialog(row.DeviceTemplateId)
    },
    // 点击删除
    handleClickRemove(row) {
      this.$confirm('确认要删除选中的模板吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteDeviceTemplate({
            deviceTemplateId: row.DeviceTemplateId
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                this.fetchTableData()
                this.$message.success('删除成功')
              } else {
                this.$message.error('删除失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        })
        .catch(() => {})
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'UpdateTime') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'DeviceTemplateName') {
        this.filterForm.sortProp = 1
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.ShareUserId) {
        this.filterForm.shareUserId = filter.ShareUserId
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
        const { text, sortProp, isAsc, shareUserId } = this.filterForm
        const { currentPage, size } = this.pagination
        getDeviceTemplatePage({
          DeviceTemplateName: text,
          ShareUserIdList: shareUserId,
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
