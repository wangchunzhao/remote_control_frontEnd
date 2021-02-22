<template>
  <div class="permission-select">
    <el-alert
      v-show="role && role.CompanyId === 0"
      title='"系统角色"是默认角色，无法编辑，请到『关联人员』选项卡中选择角色关联的人员'
      type="warning"
    />
    <div v-if="role && role.CompanyId !== 0" style="margin: 15px 0;">
      <el-radio-group v-model="groupType" size="small">
        <el-radio-button label="business">
          业务平台
        </el-radio-button>
        <el-radio-button label="data">
          数据平台
        </el-radio-button>
        <el-radio-button label="dataScreen">
          数据大屏
        </el-radio-button>
      </el-radio-group>
      <el-button
        type="primary"
        style="float: right;"
        size="small"
        @click.native="submit"
      >
        保存修改
      </el-button>
    </div>

    <el-tree
      v-show="role && role.CompanyId === 0"
      ref="tree"
      v-loading="treeLoading"
      :data="treeData"
      show-checkbox
      node-key="FuncId"
      default-expand-all
      :default-checked-keys="defaultChecked"
      :props="{
        children: 'Children',
        label: 'FuncName'
      }"
      style="margin: 30px 40px;"
    >
      <span
        slot-scope="{ node }"
        :class="['custom-tree-node', node.level === 3 ? 'lv3-node' : null]"
      >
        <span>{{ node.label }}</span>
      </span>
    </el-tree>
    <el-tree
      v-show="groupType === 'business' && (role && role.CompanyId !== 0)"
      ref="businessTree"
      v-loading="treeLoading"
      :data="businessTreeData"
      show-checkbox
      node-key="FuncId"
      default-expand-all
      :default-checked-keys="businessTreeChecked"
      :props="{
        children: 'Children',
        label: 'FuncName'
      }"
      style="margin: 30px 40px;"
    >
      <span
        slot-scope="{ node }"
        :class="['custom-tree-node', node.level === 3 ? 'lv3-node' : null]"
      >
        <span>{{ node.label }}</span>
      </span>
    </el-tree>
    <el-tree
      v-show="groupType === 'data' && (role && role.CompanyId !== 0)"
      ref="dataTree"
      v-loading="treeLoading"
      :data="dataTreeData"
      show-checkbox
      node-key="FuncId"
      default-expand-all
      :default-checked-keys="dataTreeChecked"
      :props="{
        children: 'Children',
        label: 'FuncName'
      }"
      style="margin: 50px;"
    >
      <span
        slot-scope="{ node }"
        :class="['custom-tree-node', node.level === 3 ? 'lv3-node' : null]"
      >
        <span>{{ node.label }}</span>
      </span>
    </el-tree>
    <div
      v-show="groupType === 'dataScreen' && (role && role.CompanyId !== 0)"
      style="margin: 30px 40px;"
    >
      <el-checkbox
        v-model="dataScreenChecked"
        style="font-size: 13px;font-weight: normal;"
      >
        数据大屏
      </el-checkbox>
    </div>
  </div>
</template>

<script>
import { getRuleTree, editRoleRule } from '@/api/roleFunc'
export default {
  props: {
    role: {
      type: Object,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      groupType: 'business',
      treeLoading: false,
      treeData: [],

      businessTreeData: [],
      dataTreeData: [],
      defaultChecked: [],
      businessTreeChecked: [],
      dataTreeChecked: [],

      dataScreenChecked: false
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  watch: {
    role: {
      handler: function(val) {
        if (val) {
          this.drawTree()
        }
      }
    }
    // groupType(val) {
    //   this.drawTree()
    // }
  },
  methods: {
    submit() {
      let checked = [
        ...this.$refs.businessTree.getCheckedKeys(),
        ...this.$refs.dataTree.getCheckedKeys()
      ]
      if (this.dataScreenChecked) {
        checked.push(40) // 40代码数据大屏
      }
      editRoleRule({
        HalfSelection: [
          ...this.$refs.businessTree.getHalfCheckedKeys(),
          ...this.$refs.dataTree.getHalfCheckedKeys()
        ],
        FuncIdS: checked,
        RoleId: this.role.RoleId
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.$message.success('角色修改成功')
          } else {
            this.$message.error('角色修改失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('角色修改失败')
        })
    },
    drawTree() {
      this.treeLoading = true
      this.defaultChecked = []
      this.businessTreeChecked = []
      this.dataTreeChecked = []
      if (this.role.CompanyId === 0) {
        // 系统角色
        getRuleTree({
          roleId: this.role.RoleId,
          PlatformType: 0,
          companyId: this.companyId
        })
          .then(res => {
            const data = res.data
            if (data.Code === 200) {
              this.walk(data.Data, 1, this.defaultChecked)
              this.treeData = data.Data

              this.$nextTick(() => {
                this.changeDomStyle()
              })
            } else {
              this.treeData = []
            }
          })
          .catch(err => {
            console.error(err)
            this.treeData = []
          })
          .finally(() => {
            this.treeLoading = false
          })
      } else {
        // 自定义角色
        getRuleTree({
          // 业务平台
          roleId: this.role.RoleId,
          PlatformType: 1,
          companyId: this.companyId
        })
          .then(res => {
            const data = res.data
            if (data.Code === 200) {
              this.walk(data.Data, 2, this.businessTreeChecked)
              this.businessTreeData = data.Data
              this.$nextTick(() => {
                this.changeDomStyle()
              })
            } else {
              this.treeData = []
            }
          })
          .catch(err => {
            console.error(err)
            this.treeData = []
          })
          .finally(() => {
            this.treeLoading = false
          })
        getRuleTree({
          // 数据平台
          roleId: this.role.RoleId,
          PlatformType: 2,
          companyId: this.companyId
        })
          .then(res => {
            const data = res.data
            if (data.Code === 200) {
              this.walk(data.Data, 2, this.dataTreeChecked)
              this.dataTreeData = data.Data
              this.$nextTick(() => {
                this.changeDomStyle()
              })
            } else {
              this.treeData = []
            }
          })
          .catch(err => {
            console.error(err)
            this.treeData = []
          })
          .finally(() => {
            this.treeLoading = false
          })
        getRuleTree({
          // 数据大屏
          roleId: this.role.RoleId,
          PlatformType: 4,
          companyId: this.companyId
        })
          .then(res => {
            const data = res.data
            if (data.Code === 200) {
              this.dataScreenChecked = data.Data[0].Checked
            } else {
              this.dataScreenChecked = false
            }
          })
          .catch(err => {
            console.error(err)
            this.treeData = []
          })
      }
    },
    // type: 1 把所有节点加disabled属性 type: 2 获取所有选中节点的id
    walk(arr, type, res) {
      if (type === 1) {
        arr.forEach(item => {
          item.disabled = true
          if (item.Checked) {
            res.push(item.FuncId)
          }
          if (item.Children.length) {
            this.walk(item.Children, type, res)
          }
        })
      } else if (type === 2) {
        arr.forEach(item => {
          // if (item.FuncId === 11 || item.FuncId === 29) { // 监测模块下的控制台 或 数据平台下的安全分析 必选，且不可更改
          //   item.disabled = true
          // }
          // HalfSelection: 0 未选中  1 全选  2半选
          if (item.HalfSelection === 1) {
            res.push(item.FuncId)
          }
          if (item.Children.length) {
            this.walk(item.Children, type, res)
          }
        })
      }
    },
    // 把第三级的树节点样式改过横向布局
    changeDomStyle() {
      const nodes = document.querySelectorAll('.lv3-node')
      nodes.forEach(node => {
        let temp = node.parentNode.parentNode
        temp.style.display = 'inline-block'
        temp.parentNode.cssText = 'overflow: visible;white-space: pre-wrap;'
      })
    }
  }
}
</script>
