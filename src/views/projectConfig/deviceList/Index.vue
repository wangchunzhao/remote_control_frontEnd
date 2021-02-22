<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        @click.native="() => $refs.addDialog.openDialog()"
        size="small"
        v-permission="[52]"
        type="primary"
      >
        新增设备
      </el-button>
      <el-tooltip placement="top" effect="dark" style="display: inline-block;">
        <div slot="content" style="text-align: center;font-size: 12px;">
          <a
            href="javascript:;"
            style="color:rgb(24, 144, 255);"
            @click="downloadTemplate"
            ><c-svg name="download" />下载导入模板</a
          >
        </div>
        <el-upload
          action="123"
          :show-file-list="false"
          accept=".xlsx"
          :before-upload="uploadExcel"
        >
          <el-button
            :loading="uploadLoading"
            size="small"
            style="margin: 0 10px;"
            v-permission="[52]"
          >
            从表格导入
          </el-button>
        </el-upload>
      </el-tooltip>
      <el-button
        v-permission="[53]"
        size="small"
        @click.native="handleClickEditProp"
      >
        变更设备属性
      </el-button>
      <el-button
        v-permission="[54]"
        size="small"
        type="danger"
        @click.native="handleClickRemove"
      >
        删除设备
      </el-button>
      <div style="float: right;display: flex;align-items: center">
        <el-switch
          v-model="switchStatus"
          active-text="仅显示未配置设备"
          @change="switchChange"
        />
        <el-badge
          :hidden="
            !filterForm.status.length &&
              !filterForm.associateArea.length &&
              !filterForm.types.length
          "
          is-dot
          class="item"
          style="margin-left: 25px;"
        >
          <el-button
            @click.native="() => $refs.filterDialog.openDialog()"
            type="text"
            style="padding: 0;"
            >筛选<i class="el-icon-arrow-down"></i
          ></el-button>
        </el-badge>

        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="margin-left: 25px;"
          class="filter-input"
          placeholder="搜索设备名称"
          suffix-icon="el-icon-search"
        />
      </div>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55px" />
      <el-table-column prop="ModelTreeName" sortable="custom" label="设备名称">
        <template slot-scope="{ row }">
          <el-link
            type="primary"
            :underline="false"
            @click.native="handleClickDeviceName(row)"
          >
            {{ row.ModelTreeName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="BigTypeName" label="子系统" />
      <el-table-column prop="SmallTypeName" label="设备分类" />
      <el-table-column
        prop="DeviceMonitoryPointCount"
        sortable="custom"
        label="点位数量"
      >
        <template slot-scope="{ row }">
          <el-link
            type="primary"
            :underline="false"
            @click.native="
              () =>
                $refs.devicePointDialog.openDialog({
                  id: row.ModelTreeId,
                  name: row.ModelTreeName
                })
            "
            >{{ row.DeviceMonitoryPointCount }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column prop="LocationName" label="关联区域" />
      <el-table-column label="监控状态">
        <template slot-scope="{ row }">
          <el-tag
            v-if="row.ModelTreeStatus"
            :type="statusOptions[row.ModelTreeStatus].type"
            size="mini"
            >{{ statusOptions[row.ModelTreeStatus].label }}</el-tag
          >
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
    <FilterDialog @change="handleFilter" ref="filterDialog" />
    <DeviceAddDialog ref="addDialog" @refresh="fetchTableData" />
    <EditPropDialog
      @refresh="fetchTableData"
      :ids="multipleSelection.map(item => item.ModelTreeId)"
      ref="editPropDialog"
    />
    <DevicePointDialog ref="devicePointDialog" @refresh="fetchTableData" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import FilterDialog from './FilterDialog'
import DeviceAddDialog from './DeviceAddDialog'
import EditPropDialog from './EditPropDialog'
import { getModelTreePage } from '@/api/model_new'
import { importModelTree } from '@/api/point'
import DevicePointDialog from './DevicePointDialog'
import { deleteAssetsInfo } from '@/api/assets'
export default {
  name: 'ProjectConfig_DeviceList',
  components: {
    FilterDialog,
    DeviceAddDialog,
    EditPropDialog,
    DevicePointDialog
  },
  data() {
    return {
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined,
        types: [],
        associateArea: [],
        status: []
      },
      uploadLoading: false,
      switchStatus: false, // 未配置设备开关状态

      multipleSelection: [],
      tableLoading: false,
      tableData: [{}],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      statusOptions: {
        1: {
          label: '离线',
          type: 'info'
        },
        2: {
          label: '在线',
          type: 'success'
        },
        3: {
          label: '报警',
          type: 'danger'
        }
      }
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
    companyId() {
      return this.$store.state.app.company.id
    },
    industryId() {
      return this.$store.state.app.project.Industry
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    handleClickDeviceName(row) {
      this.$router.push({
        name: 'devicePointList',
        query: {
          deviceName: row.ModelTreeName,
          mtid: row.ModelTreeId,
          BigTypeId: this.BigTypeId,
          SmallTypeId: this.SmallTypeId
        }
      })
    },
    switchChange() {
      this.pagination = {
        currentPage: 1,
        size: 10,
        total: 0
      }
      this.tableData = [{}]
      this.fetchTableData()
    },
    // 下载样表
    downloadTemplate() {
      window.open(
        'https://cdn.sinocold.net/excel_template/%E8%AE%BE%E5%A4%87%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88%20%281%29.xlsx',
        '_blank'
      )
    },
    // 批量上传
    uploadExcel(file) {
      this.uploadLoading = true
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', this.projectId)
      importModelTree({
        formData,
        industry: this.industryId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const desc = res.data.Data.Description.ErrList
            if (desc.length) {
              let descText = ''
              desc.forEach(item => {
                descText += `
                <div>第${item.ErrKey}行，Message：${item.ErrMessage}</div>
              `
              })
              this.$notify({
                title: '错误提示',
                duration: 10000,
                dangerouslyUseHTMLString: true,
                message: descText
              })
              return false
            } else {
              this.$message.success('导入成功')
              this.fetchTableData()
            }
          } else {
            this.$message.error('导入失败')
          }
        })
        .catch(err => {
          this.$message.error('导入失败')
          console.error(err)
        })
        .finally(() => {
          this.uploadLoading = false
        })
      return false
    },
    handleClickEditProp() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$refs.editPropDialog.openDialog(this.multipleSelection)
    },
    handleClickRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }

      this.$confirm('确认要删除选中的设备吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteAssetsInfo({
            storageSpaceExtendList: undefined,
            operateType: 1,
            modelTreeIdList: this.multipleSelection.map(
              item => item.ModelTreeId
            )
          }).then(res => {
            if (res.data.Code === 200) {
              this.$message.success('设备删除成功')
              this.fetchTableData()

              // 因为可能会删除与能耗相关的设备，所以这里每次删除设备都直接更新能耗相关数据
              this.$store.dispatch('fetchEnergyStruct')
            } else {
              this.$message.error('设备删除失败')
            }
          })
        })
        .catch(() => {})
    },
    // 筛选表单变化
    handleFilter(form) {
      Object.assign(this.filterForm, form)
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'DeviceMonitoryPointCount') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'ModelTreeName') {
        this.filterForm.sortProp = 0
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
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
        const {
          text,
          sortProp,
          isAsc,
          types,
          associateArea,
          status
        } = this.filterForm
        const { currentPage, size } = this.pagination
        let bigTypeIdList = []
        let smallTypeIdList = []
        types.forEach(item => {
          bigTypeIdList.push(item[0])
          smallTypeIdList.push(item[1])
        })
        getModelTreePage({
          ProjectId: this.projectId,
          BigTypeId: undefined,
          BigTypeIdList: this.switchStatus ? [-1] : [...new Set(bigTypeIdList)],
          SmallTypeId: undefined,
          SmallTypeIdList: this.switchStatus ? [-1] : smallTypeIdList,
          LocationIdList: associateArea,
          ModelTreeName: text,
          ModelTreeStatus: status,
          IsEnabledPermission: false,
          SortType: sortProp,
          IsMonitor: 1,
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

<style lang="scss" scoped></style>
