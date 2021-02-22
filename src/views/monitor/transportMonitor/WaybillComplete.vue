<template>
  <div class="waybill-complete content-box">
    <div style="margin-bottom: 16px;">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click.native="addWayBillDialog = true"
      >
        新增运单
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        placeholder="查找单号"
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
    >
      <el-table-column type="expand">
        <template slot-scope="{ row }">
          <div class="waybill-file-list">
            <el-tooltip
              v-for="item in row.Waybill_Storage_FileList"
              :key="item.FileName"
              class="item"
              effect="dark"
              :content="item.FileName"
              placement="top"
            >
              <a :href="item.Url" download class="waybill-file">
                <c-svg
                  class="file-type-icon"
                  :name="handleFileType(item.FileName)"
                />
                <span>{{ item.FileName }}</span>
                <div class="cover">
                  <c-svg class="download-icon" name="download" />
                </div>
              </a>
            </el-tooltip>

            <div
              class="waybill-file-input"
              @click="clickUploadBtn(row.WaybillStorageId)"
            >
              <i class="el-icon-plus" style="font-size: 20px;" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="单号" sortable="custom" prop="WaybillNumber" />
      <el-table-column label="更新时间" sortable="custom" prop="UpdateTime" />
      <el-table-column label="文件数量" sortable="custom" prop="FileCount" />
      <el-table-column label="操作者" prop="OperateUserName" />
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
      title="新增单号"
      :visible.sync="addWayBillDialog"
      width="450px"
      @close="handleDialogClose"
    >
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        size="medium"
      >
        <el-form-item label="运单号" prop="no">
          <el-input
            v-model="addForm.no"
            placeholder="请输入运单号"
            style="width: 250px;"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button size="medium" @click="addWayBillDialog = false"
          >取 消</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="submitAddForm('addForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      title="上传数据"
      :visible.sync="uploadFileDialog"
      width="500px"
      @close="fileList = []"
    >
      <el-alert
        title="注意，若运单下存在同名文件，将会被上传的文件覆盖"
        type="warning"
        show-icon
      />
      <el-upload
        ref="upload"
        action="#233"
        :file-list="fileList"
        :on-change="fileChange"
        :before-remove="fileRemove"
        :auto-upload="false"
        accept=".xlsx, .xls, .doc, .docx, .pdf"
        style="margin-top: 15px;"
      >
        <el-button slot="trigger" size="small" icon="el-icon-plus">
          添 加
        </el-button>
        <div slot="tip" class="el-upload__tip">
          只能上传excel/word/pdf文件，且不超过5M
        </div>
      </el-upload>
      <span slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button size="medium" @click.native="uploadFileDialog = false"
          >取 消</el-button
        >
        <el-button
          :loading="uploadLoading"
          :disabled="!fileList.length"
          size="medium"
          type="primary"
          @click.native="submitUploadFile"
          >上 传</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  addWaybillStorage,
  batchAddWaybillStorageFile,
  getWaybillStoragePage
} from '@/api/waybillStorage'
export default {
  data() {
    return {
      filterForm: {
        text: '',
        project: '',
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

      addWayBillDialog: false,
      addForm: {
        no: ''
      },
      addFormRules: {
        no: [
          { required: true, message: '请输入运单号', trigger: 'change' },
          { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '不可有特殊字符' }
        ]
      },

      currentWaybillId: '',
      uploadFileDialog: false,
      uploadLoading: false,
      fileList: []
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  watch: {
    'filterForm.text'() {
      this.fetchTableData()
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    sortChange(val) {
      // 0:默认按创建时间排序 1:电量 2:温度 3:湿度 4:数据更新数据
      if (val.prop === 'UpdateTime') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'WaybillNumber') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'FileCount') {
        this.filterForm.sortProp = 2
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleDialogClose() {
      this.addForm.no = ''
    },
    // 点击上传文件，打开弹窗
    clickUploadBtn(id) {
      this.currentWaybillId = id
      this.uploadFileDialog = true
    },
    // 根据文件名确定图标
    handleFileType(name) {
      // .xlsx, .xls, .doc, .docx, .pdf
      if (name.indexOf('.xlsx') > -1 || name.indexOf('.xls') > -1) {
        return 'excel'
      } else if (name.indexOf('pdf') > -1) {
        return 'PDF'
      } else if (name.indexOf('doc') > -1 || name.indexOf('docx') > -1) {
        return 'wenjianguanli_wordwenjian'
      } else {
        return 'wenjian'
      }
    },
    fileChange(file, fileList) {
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        this.$message('上传文件大小不能超过5M')
        fileList.pop()
      }
      this.fileList = fileList
    },
    fileRemove(file) {
      this.fileList = this.fileList.filter(item => item.uid !== file.uid)
    },
    // 上件文件
    submitUploadFile() {
      this.uploadLoading = true
      const formData = new FormData()
      formData.append('waybillStorageId', this.currentWaybillId)
      this.fileList.forEach(item => {
        formData.append(item.name, item.raw)
      })
      batchAddWaybillStorageFile(formData)
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('文件上传成功')
            this.fetchTableData()
            this.uploadFileDialog = false
          } else {
            this.$message.error('上传失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('上传失败')
        })
        .finally(() => {
          this.uploadLoading = false
        })
    },
    submitAddForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          addWaybillStorage({
            waybillNumber: this.addForm.no,
            CompanyId: this.companyId
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('新增成功')
                this.fetchTableData()
                this.addWayBillDialog = false
              } else {
                this.$message.error('新增失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('新增失败')
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    fetchTableData() {
      this.tableLoading = true
      getWaybillStoragePage({
        CompanyId: this.companyId,
        WaybillNumber: this.filterForm.text,
        SortType: this.filterForm.sortProp,
        IsAsc: this.filterForm.isAsc,
        PageIndex: this.pagination.currentPage,
        PageSize: this.pagination.size
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.tableData = data.Data
            this.pagination.total = data.TotalCount
          } else {
            this.tableData = []
            this.$message.error('列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('列表获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.waybill-complete {
  .waybill-file-list {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
  }
  .waybill-file {
    flex: 0 0 180px;
    overflow: hidden;
    z-index: 0;
    position: relative;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 4px;
    box-sizing: border-box;
    margin: 10px;
    padding: 6px;
    cursor: pointer;
    .file-type-icon {
      font-size: 40px;
      margin-right: 6px;
    }
    span {
      width: 115px;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transform: translateY(-5px);
      color: #656565;
    }
    &:hover {
      .cover {
        display: block;
      }
      span {
        color: rgb(24, 144, 255);
      }
    }
    .cover {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
      text-align: center;
      line-height: 54px;
    }
    .download-icon {
      font-size: 18px;
      fill: #fff;
    }
  }
  .waybill-file-input {
    flex: 0 0 180px;
    overflow: hidden;
    z-index: 0;
    margin: 10px;
    background-color: #fff;
    border: 1px dashed #c0ccda;
    border-radius: 4px;
    box-sizing: border-box;
    margin-top: 10px;
    padding: 6px;
    height: 54px;
    line-height: 49px;
    text-align: center;
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.waybill-complete {
  .el-dialog__footer {
    text-align: right;
  }
}
</style>
