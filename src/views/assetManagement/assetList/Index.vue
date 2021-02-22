<template>
  <div>
    <page-header title="资产列表">
      <template v-slot:right>
        <el-button
          type="text"
          @click.native="
            () => {
              $refs.dialogAssetClassify.openDialog()
            }
          "
          style="padding: 0 7px;margin-left: 15px;"
        >
          查看资产分类
        </el-button>
      </template>
    </page-header>
    <div class="content-box">
      <div class="table-tool-box">
        <el-button
          size="small"
          icon="el-icon-plus"
          type="primary"
          v-if="checkPermission([144])"
          @click="handleClickAdd"
        >
          新增
        </el-button>
        <el-tooltip
          placement="top"
          effect="light"
          v-if="checkPermission([144])"
          style="display: inline-block;"
        >
          <div slot="content" style="text-align: center;font-size: 12px;">
            <a
              href="javascript:;"
              style="color:#409EFF;"
              @click="downloadTemplate"
              >样式表下载
              <c-svg name="download" />
            </a>
          </div>
          <el-upload
            action="123"
            :show-file-list="false"
            accept=".xlsx"
            :before-upload="handleUpload"
          >
            <el-button
              :loading="uploadLoading"
              size="small"
              style="margin: 0 10px;"
            >
              批量导入
            </el-button>
          </el-upload>
        </el-tooltip>
        <el-button
          v-if="checkPermission([146])"
          @click.native="handlePropEdit"
          size="small"
          plain
        >
          修改
        </el-button>
        <el-button
          v-if="checkPermission([143])"
          :loading="exportLoading"
          @click.native="handleExport"
          size="small"
          plain
        >
          导出
        </el-button>
        <el-button
          v-if="checkPermission([145])"
          @click.native="handleDelete"
          size="small"
          type="danger"
        >
          删除
        </el-button>
        <div class="right-wrap">
          <el-badge
            :hidden="hideFilterNotice"
            is-dot
            class="item"
            style="margin-top: 0px;margin-right: 15px;"
          >
            <el-button
              @click.native="() => $refs.dialogFilterForm.openDialog()"
              type="text"
              style="padding: 0;"
              >筛选<i class="el-icon-arrow-down"></i
            ></el-button>
          </el-badge>
          <el-input
            v-model.trim="filterForm.text"
            size="small"
            clearable
            class="filter-input"
            placeholder="搜索资产名称/资产编码"
            suffix-icon="el-icon-search"
          />
        </div>
      </div>
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        fit
        element-loading-text="加载中..."
        style="width: 100%;"
        @filter-change="filterChange"
        @sort-change="sortChange"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="资产名称" prop="mName">
          <template slot-scope="{ row }">
            <el-link
              @click.native="() => onClickName(row)"
              :underline="false"
              type="primary"
              >{{ row.mName }}</el-link
            >
          </template>
        </el-table-column>
        <el-table-column label="资产编码" prop="assets_code">
          <template slot-scope="{ row }">
            {{ row.assets_code || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="资产分类" prop="TypeName">
          <template slot-scope="{ row }">
            {{ row.TypeName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="型号" prop="type">
          <template slot-scope="{ row }">
            {{ row.type || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="出厂编码" prop="SerialNumber">
          <template slot-scope="{ row }">
            {{ row.SerialNumber || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建日期" prop="createTime">
          <template slot-scope="{ row }">
            {{ row.createTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="项目" prop="pname">
          <template slot-scope="{ row }">
            {{ row.pname || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="pagination.total > 0"
        :total="pagination.total"
        :page.sync="pagination.page"
        :limit.sync="pagination.limit"
        @pagination="fetchTableData"
      />
      <DialogAssetDetail
        :statusMap="statusMap"
        :id="activeAsset.id"
        @complate="fetchTableData"
        ref="dialogAssetDetail"
      />
      <DialogFilterForm @change="filterFormChange" ref="dialogFilterForm" />
      <DialogAssetEdit ref="dialogAssetEdit" @complete="afterAssetAdd" />
      <DialogPropEdit
        :ids="multipleSelection.map(v => v.id)"
        ref="dialogPropEdit"
        @complete="fetchTableData"
      />
      <DialogAssetClassify ref="dialogAssetClassify" />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import DialogAssetDetail from './DialogAssetDetail'
import {
  getAssetsList,
  importAssetsExcel,
  exportAssetsListNew,
  deleteAssetsInfo
} from '@/api/assets'
import DialogFilterForm from './DialogFilterForm'
import DialogAssetEdit from './DialogAssetEdit'
import DialogPropEdit from './DialogPropEdit'
import DialogAssetClassify from './DialogAssetClassify'
import filesaver from 'file-saver'
import { checkPermission } from '@/utils/permissions'
const statusMap = [
  { text: '闲置中', value: 2 },
  { text: '使用中', value: 1 },
  { text: '已验证', value: 3 },
  { text: '待验证', value: 4 }
]
export default {
  components: {
    Pagination,
    DialogAssetDetail,
    DialogFilterForm,
    DialogAssetEdit,
    DialogPropEdit,
    DialogAssetClassify
  },
  data() {
    return {
      uploadLoading: false,
      exportLoading: false,
      tableData: null,
      tableLoading: false,
      activeAsset: {},
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      multipleSelection: [],
      filterForm: {
        text: '',
        projectIds: [],
        statusIds: [],
        installDateRange: null,
        createDateRange: null,
        classifyIds: [],
        sortProp: undefined,
        isAsc: undefined
      },
      statusMap,
      downloadLoading: false,
      checkPermission
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.page = 1
      this.fetchTableData()
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    industryId() {
      return this.$store.state.app.project.Industry
    },
    hideFilterNotice() {
      const {
        projectIds,
        classifyIds,
        statusIds,
        installDateRange,
        createDateRange
      } = this.filterForm
      return (
        !projectIds.length &&
        !classifyIds.length &&
        !statusIds.length &&
        !installDateRange &&
        !createDateRange
      )
    }
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    filterFormChange(form) {
      Object.assign(this.filterForm, form)
      this.pagination.page = 1
      this.fetchTableData()
    },
    handleDelete() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选择一条资产')
        return false
      }
      this.$confirm('确认要删除选中的资产？', '提示', { type: 'warning' }).then(
        () => {
          deleteAssetsInfo({
            operateType: 0,
            modelTreeIdList: this.multipleSelection.map(item => item.id)
          }).then(res => {
            if (res.data.Code === 200) {
              this.$message.success('资产删除成功')
              this.fetchTableData()
            } else {
              this.$message.error('资产删除失败')
            }
          })
        }
      )
    },
    handlePropEdit() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选择一条资产')
        return false
      }
      this.$refs.dialogPropEdit.openDialog()
    },
    handleExport() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选择一条需要导出的资产')
        return false
      }
      const {
        text,
        sortProp,
        isAsc,
        projectIds,
        classifyIds,
        statusIds,
        installDateRange,
        createDateRange
      } = this.filterForm
      this.exportLoading = true
      exportAssetsListNew({
        project: projectIds.join(','),
        orderfield: isAsc,
        orderfunc: sortProp,
        deviceName: text,
        assets_typeID: classifyIds.join(','),
        locationZ: undefined,
        monitorID: undefined,
        devtypeID: undefined,
        status: statusIds.join(','),
        InstallDateTimeQuantum: installDateRange
          ? {
              StartDate: installDateRange[0],
              EndDate: installDateRange[1]
            }
          : undefined,
        CreateTimeQuantum: createDateRange
          ? {
              StartDate: createDateRange[0],
              EndDate: createDateRange[1]
            }
          : undefined,
        companyId: this.companyId,
        ModelTreeIdList: this.multipleSelection.map(item => item.id)
      })
        .then(res => {
          if (
            res.headers['content-type'] === 'application/json; charset=utf-8'
          ) {
            // blob转json
            var reader = new FileReader()
            reader.onload = e => {
              const temp = JSON.parse(e.target.result)
              this.$message(temp.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          const blob = new Blob([res.data])
          filesaver.saveAs(blob, '资产列表.xls')
        })
        .catch(err => {
          console.error(err)
          this.$message('导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    handleUpload(file) {
      this.uploadLoading = true
      let fd = new FormData()
      fd.append('file1', file)
      importAssetsExcel(fd, this.companyId)
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            if (data.Description.length) {
              let descText = ''
              data.Description.forEach(item => {
                descText += `<div style="padding: 4px 0">${item.ErrMessage}</div>`
              })
              this.$notify({
                title: '错误提示',
                duration: 15000,
                dangerouslyUseHTMLString: true,
                message: descText
              })
            }
            this.pagination.page = 1
            this.fetchTableData()
          } else {
            this.$message.error('资产导入失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('文件解析错误，请确保上传文件不存在错误')
        })
        .finally(() => {
          this.uploadLoading = false
        })
      return false
    },
    downloadTemplate() {
      window.open(
        'https://cdn.sinocold.net/excel_template/%E8%B5%84%E4%BA%A7%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF_v2.xlsx',
        '_blank'
      )
    },
    onClickName(row) {
      this.activeAsset = row
      this.$nextTick(() => {
        this.$refs.dialogAssetDetail.openDialog()
      })
    },
    afterAssetAdd() {
      this.pagination.page = 1
      this.fetchTableData()
    },
    /**
     * 表格排序
     */
    sortChange(val) {
      const { prop, order } = val
      this.filterForm.sortProp = prop
      this.filterForm.isAsc = order === 'ascending'
      this.fetchTableData()
    },
    /**
     * 表格筛选
     */
    filterChange(filter) {
      if (filter.PROTOCOL) {
        this.filterForm.protocol = filter.PROTOCOL
      }
      this.fetchTableData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleClickAdd() {
      this.$refs.dialogAssetEdit.openDialog()
    },
    formatJson(filterVal) {
      return this.tableData.map(v =>
        filterVal.map(j => {
          if (j === 'timestamp') {
            return '2010-12-23 23：00'
          } else {
            return v[j]
          }
        })
      )
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const {
          text,
          sortProp,
          isAsc,
          projectIds,
          classifyIds,
          statusIds,
          installDateRange,
          createDateRange
        } = this.filterForm
        const { page, limit } = this.pagination
        getAssetsList({
          project: projectIds.join(','),
          orderfield: isAsc,
          orderfunc: sortProp,
          deviceName: text,
          assets_typeID: classifyIds.join(','),
          locationZ: undefined,
          monitorID: undefined,
          devtypeID: undefined,
          status: statusIds.join(','),
          InstallDateTimeQuantum: installDateRange
            ? {
                StartDate: installDateRange[0],
                EndDate: installDateRange[1]
              }
            : undefined,
          CreateTimeQuantum: createDateRange
            ? {
                StartDate: createDateRange[0],
                EndDate: createDateRange[1]
              }
            : undefined,
          companyId: this.companyId,
          PageIndex: page,
          PageSize: limit
        })
          .then(res => {
            if (
              page === this.pagination.page &&
              text === this.filterForm.text
            ) {
              if (res.data.Code === 200) {
                this.tableData = res.data.Data.Data
                this.pagination.total = res.data.Data.TotalCount
              } else {
                this.tableData = []
                this.pagination.total = 0
                this.$message.error('列表获取失败')
              }
            }
          })
          .catch(err => {
            console.error(err)
            if (
              page === this.pagination.page &&
              text === this.filterForm.text
            ) {
              this.tableData = []
              this.pagination.total = 0
              this.$message.error('列表获取失败')
            }
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
