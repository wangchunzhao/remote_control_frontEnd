<template>
  <el-dialog
    width="500px"
    title="分项管理"
    :visible.sync="dialogVisible"
    custom-class="branch_manage-dialog"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-input
        size="small"
        v-model="filterText"
        placeholder="搜索设备名称"
        clearable
        suffix-icon="el-icon-search"
      ></el-input>
      <div class="tree-wrap thin-scroll">
        <el-tree
          :data="structTree"
          ref="tree"
          :props="{
            children: 'ChildrenList',
            label: 'Name'
          }"
          show-checkbox
          class="filter-tree"
          default-expand-all
          :filter-node-method="filterNode"
          @check="handleCheckChange"
        >
          <span class="custom-node" slot-scope="{ node, data }">
            <span>
              <c-svg
                name="folder-open-fill"
                style="color: rgb(144, 147, 153); margin-right: 5px;"
                v-if="data.IsSubentry"
              ></c-svg>
              <span>{{ data.Name }}</span>
              <c-svg
                name="zong"
                style="color: rgb(144, 147, 153); margin-left: 5px;"
                v-if="data.IsSummary"
              ></c-svg
            ></span>
            <el-link
              v-if="!data.IsSubentry"
              :underline="false"
              type="primary"
              @click.native="() => handleSetSummary(data)"
              style="font-weight: normal;"
            >
              {{ !data.IsSummary ? '设为总表' : '取消总表' }}
            </el-link>
          </span>
        </el-tree>
      </div>
    </div>
    <span slot="footer">
      <el-button
        size="small"
        :disabled="!currentDevices.length"
        type="primary"
        @click.native="handleClickChange"
        >变更设备分项</el-button
      >
    </span>
    <el-dialog
      width="440px"
      append-to-body
      title="变更设备分项"
      :visible.sync="dialogVisible2"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        label-width="100px"
        size="small"
      >
        <div style="margin: 0 0 25px 30px">
          已选中
          <span style="font-size: 20px;font-weight: bold;padding: 0 6px">{{
            currentDevices.length
          }}</span>
          个设备
        </div>
        <el-form-item label="选择分项" prop="branchIds">
          <el-cascader
            v-model="form.branchIds"
            :options="branchTree"
            ref="cascader"
            filterable
            size="small"
            :props="{
              checkStrictly: true,
              children: 'ChildrenList',
              label: 'Name',
              value: 'SubentryId'
            }"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="medium" type="primary" @click.native="submitForm"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {
  getSubentryTree,
  setSubentryModelTreeSummary,
  updateSubentryModelTree
} from '@/api/subentry'
export default {
  data() {
    return {
      dialogVisible: !1,
      loading: !1,
      dialogVisible2: !1,
      filterText: '',
      treeData: [],
      currentDevices: [],
      form: {
        branchIds: []
      },
      rules: {
        branchIds: [
          {
            required: !0,
            type: 'array',
            message: '请选择',
            trigger: 'change'
          }
        ]
      },
      branchTree: []
    }
  },
  watch: {
    filterText(t) {
      this.$refs.tree.filter(t)
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    structTree() {
      return this.$store.state.energy.energyStruct
    }
  },
  mounted() {
    this.fetchTreeData()
  },
  methods: {
    openDialog() {
      ;(this.dialogVisible = !0), this.fetchBranchTree()
    },
    filterNode(t, e) {
      return !t || -1 !== e.Name.indexOf(t)
    },
    handleSetSummary(t) {
      this.$confirm(
        '确认要将『'
          .concat(t.Name, '』')
          .concat(0 === t.IsSummary ? '设为总表' : '取消设为总表', '?'),
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          setSubentryModelTreeSummary({
            subentryModelTreeList: [
              {
                SubentryId: t.SubentryId,
                ModelTreeId: t.ModelTreeId
              }
            ],
            isSummary: 0 === t.IsSummary ? 1 : 0
          })
            .then(t => {
              200 === t.data.Code
                ? (this.$message.success('总表设置成功'), this.fetchTreeData())
                : this.$message.error(t.data.Message)
            })
            .catch(err => {
              console.error(err)
              this.$message.error('总表设置失败')
            })
        })
        .catch(() => {})
    },
    handleCheckChange() {
      this.currentDevices = this.$refs.tree
        .getCheckedNodes()
        .filter(function(t) {
          return !1 === t.IsSubentry
        })
    },
    handleClickChange() {
      this.dialogVisible2 = !0
    },
    handleClose() {
      ;(this.dialogVisible = !1), (this.currentDevices = [])
    },
    fetchTreeData() {
      this.loading = true
      this.$store
        .dispatch('fetchEnergyStruct')
        .catch(e => {
          this.$message.error(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    fetchBranchTree() {
      getSubentryTree({
        companyId: this.companyId,
        projectId: this.projectId,
        isGetModelTree: false
      })
        .then(res => {
          if (200 === res.data.Code) {
            this.branchTree = res.data.Data
            this.walk(this.branchTree)
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    submitForm() {
      this.$refs.form.validate(e => {
        if (!e) {
          console.log('error submit!!')
          return
        }
        var a = this.form.branchIds,
          i = a[a.length - 1]
        updateSubentryModelTree({
          companyId: this.companyId,
          projectId: this.projectId,
          subentryId: i,
          modelTreeList: this.currentDevices.map(item => {
            return {
              SubentryId: item.SubentryId,
              ModelTreeId: item.ModelTreeId
            }
          })
        })
          .then(e => {
            var a = e.data
            200 === a.Code
              ? (this.$message.success('操作成功'),
                this.fetchTreeData(),
                (this.currentDevices = []),
                (this.dialogVisible2 = false))
              : this.$message.error(e.data.Message)
          })
          .catch(err => {
            console.error(err)
            this.$message.error('操作失败')
          })
      })
    },
    // 删除空的Children
    walk(t) {
      t.forEach(t => {
        t.ChildrenList &&
          (t.ChildrenList.length
            ? this.walk(t.ChildrenList)
            : delete t.ChildrenList)
      })
    }
  }
}
</script>

<style lang="scss">
.branch_manage-dialog {
  .tree-wrap {
    margin: 15px 0;
    height: 400px;
    overflow: auto;
  }
  .custom-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 5px;
  }
  .custom-node:hover .el-link {
    display: inline-block;
  }
  .custom-node .el-link {
    font-weight: 400;
    display: none;
  }
  .el-dialog__body {
    padding: 15px 25px;
  }
}
</style>
