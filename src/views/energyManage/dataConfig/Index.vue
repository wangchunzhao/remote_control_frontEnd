<template>
  <div class="content-box">
    <div class="table-tool-box">
      <span style="font-size: 15px;font-weight: bold;margin-right: 15px;"
        >用能支路</span
      >
      <el-button
        @click.native="() => $refs.branchAddDialog.openDialog()"
        icon="el-icon-plus"
        size="small"
        type="primary"
      >
        新增自定义支路
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索支路名称"
        suffix-icon="el-icon-search"
      />
    </div>

    <el-table v-loading="tableLoading" :data="tableData" style="width: 100%;">
      <el-table-column prop="ModelTreeName" label="支路名称" min-width="130">
        <template slot-scope="{ row }">
          <el-input
            v-if="row.editable && row.IsCustomBranch === 1"
            clearable
            size="small"
            v-model="row.ModelTreeName"
            placeholder="请输入"
          ></el-input>
          <span v-else>
            {{ row.ModelTreeName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" min-width="170">
        <template slot-scope="{ row }">
          <el-link
            :underline="false"
            type="primary"
            @click.native="() => handleEditFormula(row)"
            v-if="row.editable && row.IsCustomBranch === 1"
          >
            {{ row.IsCustomBranch ? row.formulaText : row.ModelTreeName }}
          </el-link>
          <span v-else>
            {{ row.IsCustomBranch ? row.formulaText : row.ModelTreeName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="SubentryName" label="关联分项" min-width="110">
        <template slot-scope="{ row }">
          <el-cascader
            :options="
              treeDataFactory(associatedSubentryTree, row.TopSubentryId)
            "
            ref="cascader"
            v-model="row.SubentryId"
            placeholder="请选择支路"
            v-if="row.editable"
            filterable
            :show-all-levels="false"
            size="mini"
            :props="{
              children: 'ChildrenList',
              label: 'Name',
              value: 'SubentryId',
              emitPath: false,
              checkStrictly: true
            }"
          >
            <template slot-scope="{ node, data }">
              <c-svg
                v-if="data.IsSubentry"
                style="color: #909399; margin-right: 5px"
                name="folder-open-fill"
              ></c-svg>
              <span>{{ data.Name }}</span>
              <c-svg
                v-if="data.IsSummary"
                style="color: #909399; margin-left: 5px"
                name="zong"
              ></c-svg> </template
          ></el-cascader>
          <span v-else>
            {{ row.SubentryName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="支路等级" min-width="70">
        <template slot-scope="{ row }">
          <el-select
            v-if="row.editable"
            v-model="row.IsSummary"
            size="mini"
            placeholder="请选择"
          >
            <el-option label="总表" :value="1"></el-option>
            <el-option label="末端" :value="0"></el-option>
          </el-select>
          <span v-else>{{ levelMap[row.IsSummary] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="{ row }">
          <el-link
            v-if="row.editable === false"
            :underline="false"
            type="primary"
            @click.native="() => (row.editable = true)"
          >
            编辑
          </el-link>
          <el-link
            v-if="row.editable === true"
            :underline="false"
            type="primary"
            @click.native="handleEdit(row)"
          >
            保存
          </el-link>
          <el-link
            v-if="row.editable === true"
            :underline="false"
            type="info"
            @click.native="() => handleEditCancel(row)"
          >
            取消
          </el-link>
          <el-link
            v-if="row.IsCustomBranch === 1"
            :underline="false"
            type="primary"
            @click.native="
              () => $refs.refreshDataDialog.openDialog(row.ModelTreeId)
            "
          >
            刷新数据
          </el-link>
          <el-link
            v-if="row.IsCustomBranch === 1"
            @click.native="() => handleRemove(row)"
            :underline="false"
            type="danger"
            class="btn-danger"
          >
            删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        v-show="pagination.total > 0"
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <BranchAddDialog
      :associatedSubentryTree="associatedSubentryTree"
      ref="branchAddDialog"
      @refresh="handleRefreshTable"
    />
    <FormulaEditDialog ref="formulaEditDialog" />
    <RefreshDataDialog ref="refreshDataDialog" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import BranchAddDialog from './BranchAddDialog'
import {
  getBranchPage,
  deleteBranch,
  addOrUpdateBranch
} from '@/api/branchCompute'
import { getSubentryTree } from '@/api/subentry'
import FormulaEditDialog from './FormulaEditDialog'
import RefreshDataDialog from './RefreshDataDialog'

export default {
  components: {
    BranchAddDialog,
    FormulaEditDialog,
    RefreshDataDialog
  },
  data() {
    return {
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined
      },

      associatedSubentryTree: [],
      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      levelMap: {
        1: '总表',
        0: '末端'
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    projectId() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  mounted() {
    this.fetchTableData()

    getSubentryTree({
      companyId: this.companyId,
      projectId: this.projectId,
      isGetModelTree: false
    })
      .then(res => {
        if (200 === res.data.Code) {
          this.associatedSubentryTree = res.data.Data
          this.walk(this.associatedSubentryTree, node => {
            if (!node.ChildrenList.length) {
              delete node.ChildrenList
            }
          })
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    handleEdit(row) {
      const {
        BranchComputeList,
        IsCustomBranch,
        IsSummary,
        ModelTreeId,
        ModelTreeName,
        SubentryId,
        formulaRules
      } = row
      if (!ModelTreeName) {
        this.$message('请输入支路名称')
        return
      }
      addOrUpdateBranch({
        ModelTreeId: ModelTreeId,
        CompanyId: this.companyId,
        ProjectId: this.projectId,
        ModelTreeName: ModelTreeName,
        SubentryId: SubentryId,
        IsSummary: IsSummary,
        IsCustomBranch: IsCustomBranch,
        BranchComputeList: formulaRules || BranchComputeList
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.$message.success('支路编辑成功')
            this.$store.dispatch('fetchEnergyStruct')
            this.fetchTableData()
            row.editable = false
          } else {
            this.$message.error('支路编辑失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('支路编辑失败')
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    handleEditCancel(row) {
      row.editable = false
      this.fetchTableData()
    },
    handleEditFormula(row) {
      this.$refs.formulaEditDialog.openDialog(row)
    },
    handleRemove(row) {
      this.$confirm(`确认要删了自定义支路『${row.ModelTreeName}』?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBranch({
            modelTreeId: row.ModelTreeId
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data === true) {
                this.$message.success('删除成功')
                this.fetchTableData()
                this.$store.dispatch('fetchEnergyStruct')
              } else {
                this.$message.error('删除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
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
    handleRefreshTable() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 获取表格数据
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { text } = this.filterForm
        const { currentPage, size } = this.pagination
        getBranchPage({
          CompanyId: this.companyId,
          ProjectId: this.projectId,
          ModelTreeName: text,
          PageSize: size,
          PageIndex: currentPage
        })
          .then(res => {
            if (
              currentPage === this.pagination.currentPage &&
              text === this.filterForm.text
            ) {
              let data = res.data
              if (data.Code === 200) {
                data.Data.Data.forEach(v => {
                  if (v.IsCustomBranch === 1) {
                    // 自定义支路
                    let text = ''
                    v.BranchComputeList.forEach((vv, index) => {
                      if (index === 0) {
                        text = vv.ComputeModelTreeName
                      } else {
                        text += ` ${vv.ComputeSymbol} ${vv.ComputeModelTreeName}`
                      }
                    })
                    v.formulaText = text
                  }
                  v.editable = false
                })
                this.tableData = data.Data.Data
                this.pagination.total = data.Data.TotalCount
              } else {
                this.tableData = []
                this.pagination.total = 0
                this.$message.error('列表获取失败')
              }
            }
          })
          .catch(err => {
            console.error(err)
            if (currentPage === this.pagination.currentPage) {
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
    ),
    walk(arr, handle) {
      arr.forEach(item => {
        handle(item)
        if (item.ChildrenList) {
          this.walk(item.ChildrenList, handle)
        }
      })
    },
    treeDataFactory(tree, type) {
      const res = tree.find(v => v.SubentryId === type)
      return res ? [res] : []
    }
  }
}
</script>

<style lang="scss" scoped></style>
