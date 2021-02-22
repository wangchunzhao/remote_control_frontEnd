<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        @click.native="$refs.dialogAddGatewayAuthForm.openDialog(deviceId)"
        size="small"
        type="primary"
        style="margin-right: 20px;"
      >
        新增授权
      </el-button>
      <div style="float: right;">
        <el-input
          v-model.trim="filterForm.text"
          size="small"
          clearable
          style="margin-left: 20px;"
          class="filter-input"
          placeholder="查找用户名或手机号"
          suffix-icon="el-icon-search"
        />
      </div>
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      ref="table"
      style="width: 100%;"
      @filter-change="filterChange"
      @sort-change="sortChange"
    >
      <el-table-column
        sortable="custom"
        prop="UserName"
        min-width="100"
        label="用户名"
      />
      <el-table-column min-width="110" prop="UserMobile" label="手机号" />
      <el-table-column
        min-width="110"
        prop="FuncGroupName"
        column-key="FuncGroupName"
        :filters="funcGroupOptions"
        label="授权类型"
      />
      <el-table-column
        min-width="110"
        prop="PermissionType"
        column-key="PermissionType"
        :filters="PermissionTypeOptions"
        label="角色"
      >
        <template slot-scope="{ row }">
          <span>{{ PermissionTypeList[row.PermissionType] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template v-if="row.PermissionType === 0" slot-scope="{ row }">
          <el-button
            type="text"
            :disabled="row.FuncGroupId === 4 && isOnlyRoot"
            @click.native="
              $refs.dialogEditGatewayAuthForm.openDialog(row.UserId, deviceId)
            "
          >
            修改权限
          </el-button>
          <el-button
            type="text"
            @click.native="handleDelete(row.UserId)"
            class="btn-danger"
            :disabled="row.FuncGroupId === 4 && isOnlyRoot"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--    <div class="pagination-wrap">-->
    <!--      <el-pagination-->
    <!--        background-->
    <!--        :current-page.sync="pagination.currentPage"-->
    <!--        :page-size.sync="pagination.size"-->
    <!--        :page-sizes="[10, 20, 50, 100]"-->
    <!--        layout="total, sizes, prev, pager, next, jumper"-->
    <!--        :total="pagination.total"-->
    <!--        @size-change="handleSizeChange"-->
    <!--        @current-change="handleCurrentChange"-->
    <!--      />-->
    <!--    </div>-->
    <DialogAddGatewayAuthForm
      :typeList="funcGroupOptions"
      @refresh="fetchTableData"
      ref="dialogAddGatewayAuthForm"
    />
    <DialogEditGatewayAuthForm
      :typeList="funcGroupOptions"
      @refresh="refresh"
      ref="dialogEditGatewayAuthForm"
    />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import DialogAddGatewayAuthForm from './component/DialogAddGatewayAuthForm'
import DialogEditGatewayAuthForm from './component/DialogEditGatewayAuthForm'
import {
  getUserGatewayPermission,
  getFuncGroupList,
  deleteUserFuncGroup
} from '@/api/userApply'
export default {
  props: {
    deviceId: Number
  },
  components: {
    DialogAddGatewayAuthForm,
    DialogEditGatewayAuthForm
  },
  data() {
    return {
      filterForm: {
        text: '',
        sortProp: undefined,
        isAsc: undefined
      },
      funcGroupOptions: [],
      tableLoading: false,
      isOnlyRoot: true, //是否只有一个管理者 （所有权限）
      tableData: [],
      oldTableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      PermissionTypeList: {
        0: '独立授权用户',
        1: '项目成员',
        2: '企业成员'
      },
      PermissionTypeOptions: [
        {
          text: '独立授权用户',
          value: 0
        },
        {
          text: '项目成员',
          value: 1
        },
        {
          text: '企业成员',
          value: 2
        }
      ]
    }
  },
  watch: {
    'filterForm.text'(val) {
      this.tableData = this.oldTableData
      if (val) {
        this.$refs.table.clearFilter()
        let list = []
        list = this.tableData.filter(item => {
          if (
            (item.UserName && item.UserName.indexOf(val) > -1) ||
            (item.UserMobile && item.UserMobile.indexOf(val) > -1)
          ) {
            return item
          }
        })
        this.tableData = list
      }
    },
    deviceId() {
      this.fetchTableData()
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.app.userInfo
    }
  },
  mounted() {
    this.fetchTableData()
    this.fetchFilterOptions()
  },
  methods: {
    refresh() {
      this.fetchTableData()
      this.$emit('permissionReg')
    },
    // 删除
    handleDelete(UserId) {
      this.$confirm('确定要移除该用户的所有权限吗 ？', '确认信息', {
        type: 'warning'
      })
        .then(() => {
          deleteUserFuncGroup({
            Type: 'Gateway',
            ForeignId: this.deviceId,
            UserIdList: [UserId]
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('删除成功')
                if (UserId !== this.userInfo.uid) {
                  this.fetchTableData()
                } else {
                  this.$emit('permissionReg')
                }
              } else {
                this.$message.error('删除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('删除失败')
            })
            .finally(() => {
              this.$emit('permissionReg')
            })
        })
        .catch(() => {})
    },
    /**
     * 表格筛选
     */
    filterChange(filter) {
      let list = []
      this.tableData = this.oldTableData
      if (filter.FuncGroupName) {
        this.$refs.table.clearFilter('PermissionType')
        if (filter.FuncGroupName.length) {
          this.tableData.map(item => {
            filter.FuncGroupName.map(item1 => {
              if (item.FuncGroupId === item1) {
                list.push(item)
              }
            })
          })
          this.tableData = list
        } else {
          this.$refs.table.clearFilter()
        }
      } else if (filter.PermissionType) {
        this.$refs.table.clearFilter('FuncGroupName')
        if (filter.PermissionType.length) {
          this.tableData.map(item => {
            filter.PermissionType.map(item1 => {
              if (item.PermissionType === item1) {
                list.push(item)
              }
            })
          })
          this.tableData = list
        } else {
          this.$refs.table.clearFilter()
        }
      }
    },
    // 表格排序
    sortChange(val) {
      if (this.tableData.length) {
        if (val.prop === '"UserName"' && val.order !== 'ascending') {
          this.tableData = this.sortChinese(this.tableData, 'UserName')
        } else {
          this.tableData = this.tableData.reverse()
        }
      }
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
        if (!this.deviceId) {
          return
        }
        this.tableLoading = true
        getUserGatewayPermission({
          deviceListId: [this.deviceId]
        })
          .then(res => {
            let data = res.data
            if (data.Code === 200) {
              this.tableData = data.Data
              this.oldTableData = this.tableData
              let rootNum = 0
              data.Data.map(item => {
                if (item.FuncGroupId === 4) {
                  rootNum++
                }
              })
              this.isOnlyRoot = rootNum <= 1
            } else {
              this.tableData = []
              this.oldTableData = []
              this.$message.error('列表获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.tableData = []
            this.oldTableData = []
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
    ),
    fetchFilterOptions() {
      getFuncGroupList({
        funcGroupType: 'GatewayAuthorize'
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.funcGroupOptions = res.data.Data
            this.funcGroupOptions.map(item => {
              item.text = item.FuncGroupName
              item.value = item.FuncGroupId
            })
          } else {
            this.$message.error('获取权限组列表失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取权限组列表失败')
        })
    }
  }
}
</script>
