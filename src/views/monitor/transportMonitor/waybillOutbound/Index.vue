<template>
  <div class="waybill-outbound content-box">
    <div style="margin-bottom: 16px;">
      <el-button
        type="primary"
        size="small"
        @click.native="addFormDialogVisible = true"
      >
        新增运单
      </el-button>
      <el-tooltip placement="top" effect="light" style="display: inline-block;">
        <div slot="content" style="text-align: center;font-size: 12px;">
          <a
            href="javascript:;"
            style="color:rgb(24, 144, 255);"
            @click="downloadTemplate"
            >样式表下载<c-svg name="download"
          /></a>
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
          >
            批量导入
          </el-button>
        </el-upload>
      </el-tooltip>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        placeholder="查找运输单"
        style="width: 200px;float: right;"
        suffix-icon="el-icon-search"
      />
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
      element-loading-text="加载中..."
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column label="运单号" sortable="custom" prop="WaybillNumber" />
      <el-table-column label="绑定时间" sortable="custom" prop="BindTime" />
      <el-table-column
        label="状态"
        prop="TransportStatus"
        column-key="TransportStatus"
        :filters="[
          { text: '未启运', value: 0 },
          { text: '运输中', value: 1 },
          { text: '已完成', value: 2 }
        ]"
      >
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :type="
              row.TransportStatus === 0
                ? ''
                : row.TransportStatus === 1
                ? 'success'
                : row.TransportStatus === 2
                ? 'info'
                : ''
            "
          >
            {{
              row.TransportStatus === 0
                ? '未启运'
                : row.TransportStatus === 1
                ? '运输中'
                : row.TransportStatus === 2
                ? '已完成'
                : ''
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="运送车辆"
        prop="CarNumber"
        column-key="CarNumber"
        :filters="carOptions"
      />
      <el-table-column label="路线">
        <template slot-scope="{ row }">
          <el-button
            v-if="row.CarSerivceID"
            type="text"
            @click.native="
              $router.push({
                name: 'waybillTrack',
                query: {
                  carSn: row.CarSn || row.TerminalTagList[0],
                  carServiceID: row.CarSerivceID,
                  start: row.BindTime,
                  end: row.TransportEndTime || '',
                  carId: row.CarId,
                  carNumber: row.CarNumber
                }
              })
            "
          >
            {{ row.Departure ? row.Departure + '-' + row.Destination : '-' }}
          </el-button>
          <span v-else>
            {{ row.Departure ? row.Departure + '-' + row.Destination : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="绑定终端数量" sortable="custom" prop="TagCount" />
      <el-table-column label="温度范围" prop="TempRangeName" />
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="handleWatch(row)">
            查看
          </el-button>
          <el-button
            v-if="row.TransportStatus !== 2"
            type="text"
            class="btn-danger"
            @click.native="finishWaybill(row)"
          >
            结束运单
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

    <el-dialog
      title="新增运单"
      :visible.sync="addFormDialogVisible"
      width="600px"
      @open="
        () => {
          $refs.addForm && $refs.addForm.fetchOptions()
        }
      "
      @close="handleDialogClose"
    >
      <FormAdd ref="addForm" />
      <span slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button size="medium" @click="addFormDialogVisible = false"
          >取 消</el-button
        >
        <el-button
          type="primary"
          size="medium"
          @click="submitAddForm('addForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <WaybillDetail ref="detailDialog" @edit="fetchTableData" />
  </div>
</template>

<script>
import FormAdd from './FormAdd'
import WaybillDetail from './WaybillDetail'
import {
  waybillBindTagsV2Web,
  getWaybillPageV2,
  getProjectForCarList,
  waybillUnbindTagsWebV2,
  batchImportWaybill
} from '@/api/device_new'
export default {
  name: 'WaybillOutbound',
  components: {
    FormAdd,
    WaybillDetail
  },
  data() {
    return {
      uploadLoading: false,

      carOptions: [],
      filterForm: {
        text: '',
        status: undefined,
        cars: undefined,
        sortProp: undefined,
        isAsc: false
      },
      tableLoading: false,

      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },

      addFormDialogVisible: false
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
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
    getProjectForCarList({
      projectId: this.projectId
    })
      .then(res => {
        if (res.data.Code === 200) {
          res.data.Data.forEach(item => {
            item.text = item.Value
            item.value = item.Key
          })
          this.carOptions = res.data.Data
        } else {
          this.carOptions = []
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    // 下载样表
    downloadTemplate() {
      window.location.href =
        'https://cdn.sinocold.net/excel_template/%E8%BF%90%E5%8D%95%E5%AF%BC%E5%85%A5%E6%A0%B7%E8%A1%A8.xlsx'
    },
    // 上传样表
    uploadExcel(file) {
      this.uploadLoading = true
      const formData = new FormData()
      formData.append('file', file)
      formData.append('companyId', this.companyId)
      formData.append('projectId', this.projectId)
      batchImportWaybill(formData)
        .then(res => {
          if (res.data.Code === 200) {
            const desc = res.data.Data.Description
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
            }
            this.fetchSensorList()
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
      // importSensorTag(formData).then(res => {
      //   if (res.data.Code === 200) {
      //     const desc = res.data.Data.Description
      //     if (desc.length) {
      //       let descText = ''
      //       desc.forEach(item => {
      //         descText += `
      //           <div>ErrTag：${item.ErrTag}，Message：${item.ErrMessage}</div>
      //         `
      //       })
      //       this.$notify({
      //         title: '错误提示',
      //         duration: 10000,
      //         dangerouslyUseHTMLString: true,
      //         message: descText
      //       })
      //       return false
      //     } else {
      //       this.$message.success('导入成功')
      //     }
      //     this.fetchSensorList()
      //   } else {
      //     this.$message.error('导入失败')
      //   }
      // }).catch(err => {
      //   this.$message.error('导入失败')
      //   console.error(err)
      // }).finally(() => {
      //   this.uploadLoading = false
      // })
      return false
    },
    sortChange(val) {
      if (val.prop === 'BindTime') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'WaybillNumber') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'TagCount') {
        this.filterForm.sortProp = 2
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 传感器表格筛选
    filterChange(filter) {
      if (filter.TransportStatus) {
        this.filterForm.status = filter.TransportStatus
      } else if (filter.CarNumber) {
        this.filterForm.cars = filter.CarNumber
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
    // 查看
    handleWatch(row) {
      this.$refs.detailDialog.openDialog(row.WaybillManagementId)
    },
    // 结束运单
    finishWaybill(row) {
      this.$confirm(
        `运单${
          row.TransportStatus === 0 ? '还未启运' : '正在运输中'
        }，提前结束可能导致移动端运单交付流程无法正常运行, 确认要结束运单吗？`,
        {
          confirmButtonText: '结 束',
          cancelButtonText: '返 回',
          type: 'warning',
          confirmButtonClass: 'waybill_outbound-confirm-btn'
        }
      )
        .then(() => {
          waybillUnbindTagsWebV2({
            WaybillNumber: row.WaybillNumber,
            ProjectId: row.ProjectId
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('运单结束成功')
                this.fetchTableData()
              } else {
                this.$message.error('运单结束失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('运单结束失败')
            })
        })
        .catch(() => {})
    },
    handleDialogClose() {
      this.$refs.addForm.resetForm()
    },
    submitAddForm() {
      this.$refs.addForm.validate().then(res => {
        if (res.valid) {
          waybillBindTagsV2Web(res.data)
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('运单新增成功')
                this.addFormDialogVisible = false
                this.fetchTableData()
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('新增失败')
            })
        }
      })
    },
    fetchTableData() {
      this.tableLoading = true
      getWaybillPageV2({
        ProjectId: this.projectId,
        TransportStatusList: this.filterForm.status,
        CarIdList: this.filterForm.cars,
        WaybillNumber: this.filterForm.text,
        PageIndex: this.pagination.currentPage,
        PageSize: this.pagination.size,
        IsAsc: this.filterForm.isAsc,
        SortType: this.filterForm.sortProp
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tableData = res.data.Data.Data
            this.tableData.forEach(item => {
              if (!item.CarSerivceID) {
                if (item.TerminalTagList.length) {
                  // 说明车绑定了记录仪
                  item.CarSerivceID = 159810
                }
              }
            })
            this.pagination.total = res.data.Data.TotalCount
          } else {
            this.$message.error('列表获取失败')
          }
        })
        .catch(err => {
          this.$message.error('列表获取失败')
          console.error(err)
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>

<style lang="scss">
.waybill-outbound {
  .el-dialog__footer {
    text-align: right;
  }
}
.waybill_outbound-confirm-btn {
  background-color: #f5222d !important;
  border-color: #fff !important;
}
</style>
