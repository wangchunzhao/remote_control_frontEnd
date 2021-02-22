<template>
  <div>
    <div class="clearfix">
      <el-button
        :disabled="node && node.Remark === '项目'"
        size="small"
        v-permission="[6]"
        type="primary"
        @click.native="clickAdd"
      >
        添加项目
      </el-button>
      <el-button
        :disabled="node && node.Remark === '项目'"
        size="small"
        plain
        v-permission="[138]"
        @click.native="() => $refs.moveInDialog.openDialog()"
      >
        迁入项目
      </el-button>
      <el-button
        size="small"
        :loading="exportLoading"
        plain
        @click.native="handleExport"
      >
        导出
      </el-button>
      <el-input
        v-model="filterForm.filter"
        placeholder="请输入项目名称"
        clearable
        size="small"
        suffix-icon="el-icon-search"
        style="width: 150px;float: right;"
      />
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      @sort-change="sortChange"
      @filter-change="filterChange"
      style="margin-top: 20px;"
    >
      <el-table-column prop="ProjectName" label="项目" />
      <el-table-column
        column-key="Industry"
        prop="Industry"
        :filter-multiple="false"
        :filters="[...industryOptions.map(v => ({ ...v, text: v.label }))]"
        label="行业"
      >
        <template slot-scope="{ row }">
          {{
            (industryOptions.find(v => v.value === row.Industry) || {}).label
          }}
        </template>
      </el-table-column>
      <el-table-column prop="SubareaName" label="所属分区" />
      <el-table-column prop="UserNum" sortable="custom" label="人员数量" />
      <el-table-column prop="CreateTime" sortable="custom" label="创建时间">
        <template slot-scope="{ row }">
          {{ _dateFormat(row.CreateTime, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="操作" width="130px">
        <template slot-scope="{ row }">
          <el-link
            :underline="false"
            type="primary"
            v-permission="[7]"
            @click.native="clickEdit(row)"
          >
            设置
          </el-link>
          <el-link
            :underline="false"
            type="primary"
            v-permission="[139]"
            @click.native="() => $refs.moveOutDialog.openDialog(row.ProjectId)"
          >
            移交
          </el-link>
          <el-link
            :underline="false"
            class="btn-danger"
            type="text"
            v-permission="[8]"
            @click.native="clickRemove(row)"
          >
            删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
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
    <el-dialog
      :title="currentProjectId ? '编辑项目' : '添加项目'"
      width="580px"
      :before-close="
        done => {
          $refs.projectEditForm.resetForm()
          currentProjectId = undefined
          done()
        }
      "
      :visible.sync="projectDialogVisible"
    >
      <ProjectEditForm
        ref="projectEditForm"
        :projectId="currentProjectId"
        @complete="projectEditComplete"
        :subareaId="node.SubareaId"
      />
    </el-dialog>
    <el-dialog
      title="删除项目"
      :visible.sync="deleteDialog"
      custom-class="delProjectDialog"
    >
      <div class="attention-info">
        这是一个危险操作，需要进行身份验证
      </div>
      <el-form
        ref="delProjectForm"
        :model="delProjectForm"
        :rules="delProjectFormRule"
      >
        <el-form-item prop="password">
          <el-input
            v-model.trim="delProjectForm.password"
            placeholder="请输入登录密码"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="delProjectDialog = false"
          >取 消</el-button
        >
        <el-button
          size="small"
          type="danger"
          :loading="removeLoading"
          @click.native="removeProject('delProjectForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <MoveInDialog :node="node" ref="moveInDialog" @refresh="fetchProjectList" />
    <MoveOutDialog ref="moveOutDialog" @refresh="fetchProjectList" />
  </div>
</template>

<script>
import regionOptions from '@/assets/json/region.json'
import MoveInDialog from './MoveInDialog'
import MoveOutDialog from './MoveOutDialog'
import ProjectEditForm from '@/components/ProjectEditForm'
import { getProjectList, deleteProject, exportProjectPage } from '@/api/subarea'
import { getMemberList } from '@/api/userSubarea'
import debounce from 'lodash/debounce'
import { industryOptions } from '@/utils/enum'
import { saveAs } from 'file-saver'
export default {
  components: {
    MoveInDialog,
    MoveOutDialog,
    ProjectEditForm
  },
  props: {
    node: {
      type: Object,
      default: function() {
        return null
      }
    },
    rootNode: {
      type: Number,
      default: function() {
        return 0
      }
    }
  },
  data() {
    return {
      filterForm: {
        text: '',
        industry: undefined,
        sortProp: undefined,
        isAsc: undefined
      },
      exportLoading: false,
      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      currentProjectId: undefined,
      projectDialogVisible: false,
      userOptions: [],
      submitLoading: false,
      deleteDialog: false,
      removeLoading: false,
      delProjectForm: {
        password: ''
      },
      delProjectFormRule: {
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' }
        ]
      },
      industryOptions,
      regionOptions
    }
  },
  watch: {
    node: {
      handler: function(val) {
        if (val) {
          this.fetchProjectList()
        }
      },
      immediate: true
    },
    rootNode(val) {
      if (val) {
        getMemberList({
          subareaId: val,
          userName: '',
          pageIndex: 1,
          pageSize: 5000
        })
          .then(res => {
            const data = res.data
            if (data.Code === 200) {
              this.userOptions = data.Data.Data
            } else {
              this.userOptions = []
            }
          })
          .catch(err => {
            console.error(err)
            this.userOptions = []
          })
      }
    },
    'filterForm.filter'() {
      this.pagination.currentPage = 1
      this.fetchProjectList()
    }
  },
  methods: {
    projectEditComplete() {
      this.fetchProjectList()
      this.$refs.projectEditForm.resetForm()
      this.projectDialogVisible = false
    },
    // 点击新增项目
    clickAdd() {
      if (!this.node) {
        this.$message('请选择要添加的区域')
        return false
      }
      if (this.node.Remark === '项目') {
        this.$message('项目下不可再新增项目')
        return false
      }
      this.currentProjectId = null
      this.projectDialogVisible = true
    },
    // 点击编辑
    clickEdit(row) {
      this.currentProjectId = row.ProjectId
      this.projectDialogVisible = true
    },
    handleExport() {
      this.exportLoading = true
      const { filter, industry } = this.filterForm
      exportProjectPage({
        SubareaId: this.node.SubareaId,
        ProjectName: filter,
        Industry: industry ? industry[0] : undefined
      })
        .then(res => {
          if (
            'application/json; charset=utf-8' === res.headers['content-type']
          ) {
            const reader = new FileReader()
            reader.onload = t => {
              const data = JSON.parse(t.target.result)
              this.$message(data.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          var a = new Blob([res.data])
          saveAs(a, `${this.node.SubareaName}-项目列表.xls`)
        })
        .catch(err => {
          console.error(err)
          this.$message.error('导出失败')
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    // 删除项目
    removeProject(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.removeLoading = true
          deleteProject({
            pwd: this.delProjectForm.password,
            projectId: this.currentProjectId
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('项目删除成功')
                this.$emit('submit', data.Data)
                this.$store.dispatch('fetchCompanyStruct')
                this.$store.dispatch('fetchUserOwnSubareaTree')
                this.$store.dispatch('fetchProject')
                this.fetchProjectList()
                this.dialogVisible = false
                this.deleteDialog = false
              } else {
                this.$message.error(data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('项目删除失败')
            })
            .finally(() => {
              this.removeLoading = false
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    // 点击删除项目
    clickRemove(row) {
      this.$confirm('确认要删除该项目？', '确认信息', {
        type: 'warning',
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.currentProjectId = row.ProjectId
          this.deleteDialog = true
        })
        .catch(() => {})
    },
    /**
     * 表格排序
     */
    sortChange(val) {
      this.filterForm.sortProp = val.prop
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchProjectList()
    },
    /**
     * 表格筛选
     */
    filterChange(filter) {
      if (filter.Industry) {
        this.filterForm.industry = filter.Industry
      }
      this.pagination.currentPage = 1
      this.fetchProjectList()
    },
    handleCurrentChange() {
      this.fetchProjectList()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchProjectList()
    },
    fetchProjectList: debounce(
      function() {
        this.tableLoading = true
        const { currentPage, size } = this.pagination
        const { filter, isAsc, sortProp, industry } = this.filterForm
        getProjectList({
          SubareaId: this.node.SubareaId,
          ProjectName: filter,
          Industry: industry ? industry[0] : undefined,
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: currentPage,
          PageSize: size
        })
          .then(res => {
            if (
              this.pagination.currentPage !== currentPage ||
              this.filterForm.filter !== filter
            ) {
              return false
            }
            let data = res.data
            if (data.Code === 200) {
              this.tableData = data.Data.Data
              this.pagination.total = data.Data.TotalCount
              if (!filter && !industry) {
                this.$emit('change', this.pagination.total)
              }
            } else {
              this.tableData = []
              this.pagination.total = 0
              this.$message.error('项目列表获取失败')
            }
          })
          .catch(err => {
            if (
              this.pagination.currentPage !== currentPage ||
              this.filterForm.filter !== filter
            ) {
              return false
            }
            console.error(err)
            this.tableData = []
            this.pagination.total = 0
            this.$message.error('项目列表获取失败')
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

<style lang="scss" scoped>
.el-pagination {
  margin-top: 15px;
  text-align: center;
}
</style>

<style lang="scss">
.delProjectDialog,
.transferProjectDialog {
  width: 450px;
  .attention-info {
    padding: 10px;
    margin-bottom: 20px;
    background: #f2d7d8;
    font-size: 15px;
    color: #cc5454;
    border-radius: 4px;
  }
}
</style>
