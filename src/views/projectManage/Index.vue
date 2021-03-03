<template>
  <div class="content-box project-manage">
    <el-card shadow="never" :class="['left-wrap', visible ? null : 'hidden']">
      <span id="scroll-target" />
      <div slot="header" class="clearfix">
        <span class="card-title">项目分区</span>
      </div>
      <div>
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
          <span slot-scope="{ node, data }" class="custom-tree-node" style="">
            <span>
              <c-svg
                :name="
                  data.Remark === '项目' ? 'location-fill' : 'folder-open-fill'
                "
                :style="{
                  color: data.Remark === '项目' ? '#909399' : '#5AC8FA'
                }"
              />
              {{ node.label }}
            </span>
            <span v-if="data.Remark !== '项目'" class="node-btn">
              <el-link
                :underline="false"
                type="primary"
                v-permission="[10]"
                @click.native="handleAddSubarea(node, data)"
              >
                <i class="el-icon-plus" />
              </el-link>
              <el-link
                :underline="false"
                type="primary"
                v-permission="[10]"
                style="margin-left: 6px;"
                @click.native="handleEditSubarea(node, data)"
              >
                <i class="el-icon-setting" />
              </el-link>
              <el-link
                :underline="false"
                type="text"
                class="btn-danger"
                v-permission="[10]"
                style="margin-left: 6px;"
                v-if="node.level !== 1"
                @click.native="removeSubarea(data)"
              >
                <i class="el-icon-delete" />
              </el-link>
            </span>
          </span>
        </el-tree>
      </div>
    </el-card>
    <div class="right-wrap">
      <div class="indicator" @click="() => (visible = !visible)">
        <c-svg :name="visible ? 'doubleleft' : 'doubleright'" />
      </div>
      <el-card shadow="never">
        <div class="card-title-wrap">
          <span class="card-title">
            {{ currentNode && currentNode.SubareaName }}
          </span>
          <el-button
            @click="$refs.projectEditDialog.openDialog()"
            v-permission="[50]"
            size="mini"
            style="margin-left:15px"
          >
            编辑
          </el-button>
        </div>
        <el-tabs v-model="tabActive">
          <el-tab-pane name="first" style="padding: 5px 20px 20px 20px;">
            <span slot="label">
              项目列表
              <el-badge
                v-if="projectTotal > 0"
                :value="projectTotal"
                :class="tabActive === 'first' ? 'badge-primary' : 'badge-info'"
                style="transform: translateY(5px)"
              >
              </el-badge>
            </span>
            <project-list
              :root-node="structTree.length && structTree[0].SubareaId"
              :node="currentNode"
              @change="val => (projectTotal = val)"
              @submit="treeData => (structTree = [treeData])"
            />
          </el-tab-pane>
          <el-tab-pane name="second" style="padding: 5px 20px 20px 20px;">
            <span slot="label">
              分区列表
              <el-badge
                v-if="partitionTotal > 0"
                :value="partitionTotal"
                :class="tabActive === 'second' ? 'badge-primary' : 'badge-info'"
                style="transform: translateY(5px)"
              >
              </el-badge>
            </span>
            <partition-manage
              :node="currentNode"
              @change="val => (partitionTotal = val)"
              @add="fetchTreeData"
              @watch="node => setNode(node)"
            />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <ProjectEditDialog ref="projectEditDialog"></ProjectEditDialog>
  </div>
</template>

<script>
import ProjectList from './component/ProjectList'
import PartitionManage from './component/PartitionManage'
import ProjectEditDialog from '@/components/ProjectEditDialog'
import { deleteSubarea, editSubarea, addSubarea } from '@/api/subarea'

export default {
  components: {
    PartitionManage,
    ProjectEditDialog,
    ProjectList
  },
  data() {
    return {
      visible: true,
      tabActive: 'first',
      treeLoading: false,
      structTree: [],
      projectRoleOptions: [],
      currentNode: null,
      projectTotal: 0,
      partitionTotal: 0
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
    companyStruct: {
      handler: function() {
        this.structTree = [this.companyStruct]
        this.currentNode = this.structTree[0]
        this.$nextTick(() => {
          this.$refs.tree.filter()
          this.$refs.tree &&
            this.$refs.tree.setCurrentKey(this.currentNode.SubareaId)
        })
      },
      immediate: true
    }
  },
  methods: {
    // // 获取结构树
    // fetchTreeData: debounce(function() {
    //   this.treeLoading = true
    //   getSubareaTree({
    //     companyId: this.$store.state.app.company.id
    //   })
    //     .then(res => {
    //       const data = res.data
    //       if (data.Code === 200) {
    //         this.structTree = [data.Data]
    //         this.currentNode = this.structTree[0]
    //         this.$nextTick(() => {
    //           this.$refs.tree &&
    //             this.$refs.tree.setCurrentKey(this.currentNode.SubareaId)
    //         })
    //       } else {
    //         this.$message.error('企业结构树获取失败')
    //       }
    //     })
    //     .catch(err => {
    //       console.error(err)
    //       this.$message.error('企业结构树获取失败')
    //     })
    //     .finally(() => {
    //       this.treeLoading = false
    //     })
    // }, 600),
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
    handleClickNode(data) {
      this.currentNode = data
      document.querySelector('#scroll-target').scrollIntoView({
        block: 'end',
        behavior: 'smooth'
      })
    },
    // 删除分区
    removeSubarea(data) {
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
            subareaId: data.SubareaId
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                // const parent = node.parent
                // const children = parent.data.Children || parent.data
                // const index = children.findIndex(d => d.SubareaId === data.SubareaId)
                // children.splice(index, 1)
                this.fetchTreeData()
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
    setNode(node) {
      this.currentNode = node
      this.tabActive = 'first'
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(node.SubareaId)
      })
    },
    // 添加分区
    handleAddSubarea(node, data) {
      this.$prompt('添加分区', '', {
        inputValue: null,
        confirmButtonText: '确定',
        inputPlaceholder: '输入分区名称',
        inputPattern: /.{1,20}/,
        inputErrorMessage: '分区名长度（1至20之间）',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          addSubarea({
            subareaName: value,
            parentId: data.SubareaId
          })
            .then(res => {
              let data = res.data
              if (data.Code === 200) {
                this.fetchTreeData()
                this.$message.success('分区添加成功')
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
    // 编辑分区
    handleEditSubarea(node, data) {
      this.$prompt('修改分区名', '', {
        inputValue: data.SubareaName,
        confirmButtonText: '确定',
        inputPattern: /.{1,20}/,
        inputErrorMessage: '分区名长度（1至20之间）',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          editSubarea({
            subareaName: value,
            subareaId: data.SubareaId
          })
            .then(res => {
              let data = res.data
              if (data.Code === 200) {
                this.$message.success('分区名修改成功')
                node.data.SubareaName = value
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
    filterNode(value, data) {
      return data.Remark === '分区' || data.Remark === '企业'
    }
  }
}
</script>

<style lang="scss">
.project-manage {
  display: flex;
  background-color: transparent;
  padding: 0;
  .left-wrap {
    width: 350px;
    transition: width 0.3s;
    &.hidden {
      width: 0;
      border: none;
    }
  }

  .right-wrap {
    position: relative;
    flex: 1;
    overflow-x: hidden;
    padding-left: 25px;
    .el-card__body {
      padding: 0;
    }
    .card-title-wrap {
      padding: 18px 20px;
      position: relative;
    }
  }
  .indicator {
    position: absolute;
    top: 16px;
    left: 12px;
    padding: 5px 0px;
    background-color: #fff;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    z-index: 10;
    cursor: pointer;
    &:hover {
      svg {
        color: #409eff;
      }
    }
    svg {
      color: rgba(0, 0, 0, 0.65);
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
    justify-content: space-between;
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
