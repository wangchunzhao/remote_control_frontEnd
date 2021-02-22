<template>
  <el-dialog
    width="450px"
    title="编辑设备权限"
    custom-class="device-permission-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div v-loading="loading" class="tree-wrap thin-scroll">
      <el-tree
        :data="deviceTree"
        show-checkbox
        node-key="Key"
        ref="tree"
        default-expand-all
        :default-checked-keys="defaultChecked"
        :props="{
          children: 'Children',
          label: 'Value'
        }"
      >
      </el-tree>
    </div>

    <div
      slot="footer"
      style="width: 100%;display: flex;align-items: center;justify-content: space-between"
    >
      <el-checkbox @change="handleSelectAll" v-model="isSelectAll">
        全选
      </el-checkbox>
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submit"
        >确 定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { getSubsystemAndModelTreeDropdownList } from '@/api/point'
import { getUserModel, resetUserModel } from '@/api/model'
import { logSnapShotFactory } from '@/utils/logSnapShot'

export default {
  data() {
    return {
      loading: false,
      submitLoading: false,
      defaultChecked: [],
      deviceTree: [],
      dialogVisible: false,
      isSelectAll: false
    }
  },
  methods: {
    openDialog({ projectId, userId }) {
      this.dialogVisible = true
      this.loading = true
      this.userId = userId
      this.projectId = projectId
      getSubsystemAndModelTreeDropdownList({ projectId: projectId })
        .then(res => {
          if (res.data.Code === 200) {
            this.deviceTree = res.data.Data
          } else {
            this.deviceTree = []
            this.$message.error('数据获取失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
      getUserModel({
        projectId,
        userId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.defaultChecked = res.data.Data
          } else {
            this.defaultChecked = []
            this.$message.error('数据获取失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    handleClose() {
      this.dialogVisible = false
      this.deviceTree = []
      this.defaultChecked = []
      this.userId = undefined
      this.projectId = undefined
      this.isSelectAll = false
    },
    handleSelectAll() {
      if (this.isSelectAll) {
        this.$refs.tree.setCheckedNodes(this.deviceTree)
      } else {
        this.$refs.tree.setCheckedNodes([])
      }
    },
    submit() {
      const nodes = this.getSimpleCheckedNodes(this.$refs.tree.store)
      this.submitLoading = true
      const { fileName, bucketName, objectName } = logSnapShotFactory(
        document.querySelector('.device-permission-dialog .el-dialog__body')
      )
      const storageSpaceExtendList = {
        FileNameList: [fileName],
        BucketName: bucketName,
        ObjectName: objectName
      }
      resetUserModel({
        UserModelList: nodes.map(item => item.Extend),
        ProjectId: this.projectId,
        UserId: this.userId,
        StorageSpaceExtendList: storageSpaceExtendList
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('设置成功')
            this.dialogVisible = false
            this.$emit('refresh')
          } else {
            this.$message.error('设置失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    getSimpleCheckedNodes(store) {
      const checkedNodes = []
      const traverse = function(node) {
        const childNodes = node.root ? node.root.childNodes : node.childNodes

        childNodes.forEach(child => {
          if (child.checked) {
            checkedNodes.push(child.data)
          }
          if (child.indeterminate) {
            traverse(child)
          }
        })
      }
      traverse(store)
      return checkedNodes
    }
  }
}
</script>

<style lang="scss">
.device-permission-dialog {
  .el-dialog__body {
    padding: 0;
  }
  .tree-wrap {
    padding: 15px;
    height: 400px;
    overflow: auto;
  }
}
</style>
