<template>
  <div class="content-box report-manage-list">
    <el-card shadow="never" class="left-wrap">
      <span id="scroll-target" />
      <div slot="header" class="clearfix">
        <span class="card-title">项目分区</span>
      </div>
      <div>
        <el-input
          v-model="treeFilter"
          placeholder="搜索"
          clearable
          size="small"
          suffix-icon="el-icon-search"
        />
        <el-tree
          ref="tree"
          v-loading="treeLoading"
          :data="structTree"
          node-key="SubareaId"
          default-expand-all
          :current-node-key="currentNode && currentNode.SubareaId"
          :expand-on-click-node="false"
          style="margin-top: 15px;"
          :filter-node-method="filterNode"
          highlight-current
          :props="{
            children: 'Children',
            label: 'SubareaName'
          }"
          @node-click="data => handleClickNode(data)"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <c-svg
              :name="
                data.Remark === '项目' ? 'location-fill' : 'folder-open-fill'
              "
              :style="{
                color: data.Remark === '项目' ? '#909399' : '#5AC8FA'
              }"
            />
            <span style="margin-left: 10px">{{ node.label }}</span>
            {{ data.Remark !== '项目' ? `（${data.Count}）` : '' }}
          </span>
        </el-tree>
      </div>
    </el-card>
    <div class="right-wrap">
      <el-card shadow="never">
        <div class="card-title-wrap">
          <span class="card-title">
            {{ currentNode && currentNode.SubareaName }}
          </span>
          <el-button
            @click="downloadReport([])"
            type="primary"
            size="mini"
            :loading="downLoading"
            style="margin-left: 5px"
          >
            批量下载
          </el-button>
          <el-button
            v-if="currentNode && currentNode.Remark === '项目'"
            @click="$refs.contactsSetDialog.openDialog(currentNode.ProjectId)"
            size="mini"
            style="margin-left: 5px"
          >
            联系人设置
          </el-button>
        </div>
        <div class="card-table-wrap">
          <el-table
            v-loading="tableLoading"
            :data="tableData"
            class="member-table"
            ref="memberTable"
            style="width: 100%;margin-top: 20px;"
            @sort-change="sortChange"
            @selection-change="val => (multipleSelection = val)"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column min-width="150" prop="ReportName" label="报告名称">
              <template slot-scope="{ row }">
                <el-link
                  :underline="false"
                  @click="downloadReport([row.ReportId])"
                  :disabled="downLoading"
                >
                  {{ row.ReportName }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="ReleaseTime"
              label="发布时间"
              min-width="120"
            >
              <template slot-scope="{ row }">
                {{ _dateFormat(row.ReleaseTime, 'YYYY-MM-DD HH:mm') }}
              </template>
            </el-table-column>
            <el-table-column
              sortable="custom"
              min-width="80"
              prop="DownloadCount"
              label="下载次数"
            />
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
        </div>
      </el-card>
    </div>
    <ContactsSetDialog ref="contactsSetDialog"></ContactsSetDialog>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import ContactsSetDialog from '@/components/ContactsSetDialog'
import { getReportPage } from '@/api/report'

export default {
  components: {
    ContactsSetDialog
  },
  data() {
    return {
      visible: true,
      tableLoading: false,
      downLoading: false,
      treeLoading: false,
      treeFilter: '',
      ProjectIdList: [],
      structTree: [],
      tableData: [],
      currentNode: null,
      filterForm: {
        sortProp: undefined,
        isAsc: undefined
      },
      multipleSelection: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    companyStruct() {
      return this.$store.state.app.companyStruct
    }
  },
  watch: {
    treeFilter(val) {
      this.$refs.tree.filter(val)
    },
    companyStruct: {
      handler: function() {
        this.structTree = [this.companyStruct]
        if (this.structTree.length) {
          this.currentNode = this.structTree[0]
        }
        this.walk(this.structTree)
      },
      immediate: true
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    // 下载报告
    downloadReport(id) {},
    // 表格排序
    sortChange(val) {
      this.filterForm.isAsc = val.order === 'ascending'
      this.filterForm.sortProp = val.order ? val.prop : undefined
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 重置表格
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 表格换页
    handleCurrentChange() {
      this.fetchTableData()
    },
    // 项目结构树数据处理
    fetchTreeData() {
      this.treeLoading = true
      this.$store
        .dispatch('fetchCompanyStruct')
        .catch(err => {
          this.$message.error(err)
        })
        .finally(() => {
          this.treeLoading = false
        })
    },
    // 点击项目结构节点
    handleClickNode(data) {
      this.currentNode = data
      document.querySelector('#scroll-target').scrollIntoView({
        block: 'end',
        behavior: 'smooth'
      })
      this.handleSizeChange()
    },
    // 筛选项目结构
    filterNode(value, data) {
      if (!value) return true
      return data.SubareaName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    // 获取表格数据
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { currentPage, size } = this.pagination
        const currentNode = this.currentNode
          ? { ...this.currentNode }
          : undefined
        const { sortProp, isAsc } = this.filterForm
        this.ProjectIdList = []
        this.getTreeProjectIdList(currentNode)
        let data = {
          CompanyId: currentNode.CompanyId,
          ProjectIdList: this.ProjectIdList,
          DiagnosisStatus: 'Diagnosed',
          IsRelease: 1,
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: currentPage,
          PageSize: size
        }
        getReportPage(data)
          .then(res => {
            if (
              this.pagination.currentPage !== currentPage ||
              this.pagination.size !== size
            ) {
              return false
            }
            const data = res.data
            if (data.Code === 200) {
              if (data.Data === null) {
                this.tableData = []
                return false
              }
              this.tableData = data.Data.Data
              this.pagination.total = data.Data.TotalCount
            } else {
              this.tableData = []
              this.pagination.total = 0
              this.$message.error(res.data.Message)
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('报告列表获取失败')
            this.pagination.total = 0
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
    // 获取树节点下的项目ID集合
    getTreeProjectIdList(obj) {
      if (obj.Remark === '项目') {
        this.ProjectIdList.push(obj.ProjectId)
      } else if (obj.Children && obj.Children.length) {
        obj.Children.map(item => {
          this.getTreeProjectIdList(item)
        })
      }
    },
    // 删除空的Children
    walk(arr) {
      arr.forEach(item => {
        if (item.Children) {
          if (!item.Children.length) {
            delete item.Children
          } else {
            this.walk(item.Children)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.report-manage-list {
  display: flex;
  background-color: transparent;
  padding: 0;
  .left-wrap {
    width: 350px;
    height: 600px;
    transition: width 0.3s;
    background: #fff;
    overflow-y: auto;
    &.hidden {
      width: 0;
      border: none;
    }
  }

  .right-wrap {
    position: relative;
    flex: 1;
    overflow-x: hidden;
    margin-left: 25px;
    background: #fff;
    .el-card__body {
      height: 560px;
      padding: 20px 0;
      overflow-y: auto;
    }
    .card-title-wrap {
      padding: 0 24px 18px;
      position: relative;
      border-bottom: 1px solid #ebeef5;
    }
    .card-table-wrap {
      padding: 0 24px;
    }
  }
  .el-tabs__nav {
    transform: translateX(25px) !important;
  }
  .el-tabs__nav-wrap {
    &::after {
      height: 1px;
    }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 14px;
    padding-right: 8px;
    .node-btn {
      display: none;
    }
    &:hover {
      .node-btn {
        display: inline-block;
      }
    }
  }
  .badge-primary {
    .el-badge__content {
      background-color: #e6f7ff;
      color: #1890ff;
      font-weight: normal;
    }
  }
  .badge-info {
    .el-badge__content {
      background-color: rgba(0, 0, 0, 0.09);
      color: #9e9e9e;
      font-weight: normal;
    }
  }
}
</style>
