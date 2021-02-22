<template>
  <el-popover
    placement="right"
    :open-delay="openDelay"
    popper-class="role-permission-popover"
    trigger="hover"
    @show="handleShow"
    @hide="handleHide"
    :close-delay="20000"
  >
    <div class="content thin-scroll" v-loading="loading">
      <el-tree
        :data="permissionTree"
        show-checkbox
        node-key="FuncId"
        ref="permissionTree"
        :expand-on-click-node="false"
        :check-on-click-node="true"
        :default-checked-keys="permissionChecked"
        :default-expand-all="true"
        style="margin: 10px 0;"
        :props="defaultProps"
      >
      </el-tree>
    </div>
    <slot style="cursor: pointer" slot="reference"></slot>
  </el-popover>
</template>

<script>
import { getRuleTree } from '@/api/roleFunc'

export default {
  // 1：企业角色 2：项目角色
  props: {
    roleType: {
      type: Number,
      required: true,
      validator: function(val) {
        return [1, 2].includes(val)
      }
    },
    roleId: {
      type: Number
    },
    openDelay: {
      type: Number,
      default: function() {
        return 600
      }
    }
  },
  data() {
    return {
      loading: false,
      permissionTree: [],
      permissionChecked: [],
      defaultProps: {
        children: 'Children',
        label: 'FuncName'
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    handleShow() {
      this.fetchPermissionTree()
    },
    handleHide() {},
    fetchPermissionTree() {
      if (!this.permissionTree.length) {
        this.loading = true
      }
      getRuleTree({
        roleId: this.roleId,
        PlatformType: this.roleType,
        industry: undefined,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.walk(data, this.permissionChecked, true)
            this.permissionTree = data
          } else {
            console.log('权限列表获取失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    walk(arr, res, disabled = true) {
      arr.forEach(item => {
        item.disabled = disabled
        // HalfSelection: 0 未选中  1 全选  2半选
        if (item.HalfSelection === 1) {
          res.push(item.FuncId)
        }
        if (item.Children.length) {
          this.walk(item.Children, res, disabled)
        }
      })
    },
    // 修改树节点的样式
    changeTreeStyle() {
      const width =
        document.querySelector('.role-permission-popover .content')
          .clientWidth / 3
      const lv2Nodes = document.querySelectorAll('.lv2-node')
      lv2Nodes.forEach(node => {
        let temp = node.parentNode.parentNode
        temp.style.display = 'inline-block'
        temp.style.width = width + 'px'
      })
      const lv1Nodes = document.querySelectorAll('.lv1-node')
      lv1Nodes.forEach(node => {
        let temp = node.parentNode
        temp.parentNode.style.cssText =
          'border-bottom: 2px solid #EBEEF5;padding: 10px;'
        temp.nextElementSibling.style.cssText = `display: inline-block; width: ${width *
          4}px;overflow: visible;white-space: normal;`
        temp.querySelector('.el-tree-node__expand-icon').style.display = 'none'
        temp.style.cssText = `display: inline-block; width: ${width}px; vertical-align: top;line-height: 34px;`
      })
    }
  }
}
</script>
