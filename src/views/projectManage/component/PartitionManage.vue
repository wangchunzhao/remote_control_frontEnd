<template>
  <div>
    <el-button
      :disabled="node && node.Remark === '项目'"
      size="small"
      v-permission="[9]"
      type="primary"
      @click.native="clickAdd"
    >
      添加子分区
    </el-button>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;margin-top: 20px;"
    >
      <el-table-column prop="SubareaName" label="分区名称" />
      <el-table-column prop="ProjectNum" label="项目数量" />
      <el-table-column prop="UserNum" label="用户数量" />
      <el-table-column label="操作" width="130">
        <template slot-scope="{ row }">
          <el-link
            type="primary"
            v-permission="[10]"
            :underline="false"
            @click.native="handleEditSubarea(row)"
          >
            编辑
          </el-link>
          <el-link type="primary" :underline="false" @click.native="watch(row)">
            查看
          </el-link>
          <el-link
            class="btn-danger"
            type="text"
            v-permission="[10]"
            :underline="false"
            @click.native="removeSubarea(row)"
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
  </div>
</template>

<script>
import {
  addSubarea,
  getSubareaList,
  editSubarea,
  deleteSubarea
} from '@/api/subarea'
export default {
  props: {
    node: {
      type: Object,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      tableLoading: false,
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  watch: {
    node: {
      handler: function(val) {
        if (val) {
          this.fetchPartitionList()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 编辑分区
    handleEditSubarea(row) {
      this.$prompt('修改分区名', '', {
        inputValue: row.SubareaName,
        confirmButtonText: '确定',
        inputPattern: /.{1,20}/,
        inputErrorMessage: '分区名长度（1至20之间）',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          editSubarea({
            subareaName: value,
            subareaId: row.SubareaId
          })
            .then(res => {
              let data = res.data
              if (data.Code === 200) {
                this.fetchPartitionList()
                this.$message.success('分区名修改成功')
                this.$emit('add')
              } else {
                this.$message.error('分区名修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('分区名修改失败')
            })
        })
        .catch(() => {})
    },
    // 删除分区
    removeSubarea(row) {
      this.$confirm(
        '删除后分区下的项目将会归到企业根节点下，点击确认继续删除',
        '确认信息',
        {
          type: 'warning',
          distinguishCancelAndClose: true,
          confirmButtonText: '确认删除',
          cancelButtonText: '取消'
        }
      )
        .then(() => {
          deleteSubarea({
            subareaId: row.SubareaId
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('分区删除成功')
                this.$emit('add')
                this.pagination.currentPage = 1
                this.fetchPartitionList()
                this.$store.dispatch('fetchUserOwnSubareaTree')
              } else {
                this.$message.error('分区删除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('分区删除失败')
            })
        })
        .catch(() => {})
    },
    // 点击添加子分区
    clickAdd() {
      if (!this.node) {
        this.$message('请在左侧项目结构树中选择一个结点')
        return false
      }
      if (this.node.Remark === '项目') {
        this.$message('不可以在项目下添加分区')
        return false
      }
      this.$prompt('请输入分区名', '', {
        confirmButtonText: '确定',
        inputValue: '',
        inputValidator: val => {
          if (val.length > 20 || val.length < 1) {
            return '分区名长度（1至20之间）'
          }
        },
        inputErrorMessage: '',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          addSubarea({
            subareaName: value,
            parentId: this.node.SubareaId
          })
            .then(res => {
              let data = res.data
              if (data.Code === 200) {
                this.$emit('add')
              } else {
                this.$message.error('分区添加失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('分区添加失败')
            })
        })
        .catch(() => {})
    },
    // 点击查看
    watch(node) {
      this.$emit('watch', node)
    },
    handleCurrentChange() {
      this.fetchPartitionList()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchPartitionList()
    },
    fetchPartitionList() {
      this.tableLoading = true
      getSubareaList({
        subareaId: this.node.SubareaId,
        projectName: this.filter,
        pageIndex: this.pagination.currentPage,
        pageSize: this.pagination.size
      })
        .then(res => {
          let data = res.data
          if (data.Code === 200) {
            this.tableData = data.Data.Data
            this.pagination.total = data.Data.TotalCount
            if (!this.filter) {
              this.$emit('change', this.pagination.total)
            }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.el-pagination {
  margin-top: 15px;
  text-align: center;
}
</style>
