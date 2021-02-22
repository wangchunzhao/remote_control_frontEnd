<template>
  <div
    class="plan-struct open"
    :style="{ transform: `translateX(${-254 + scrollbarWidth}px)` }"
  >
    <div class="header-wrap">
      <el-button type="text" style="font-size: 15px;">
        {{ currentProject.name }}
        <!-- <el-dropdown trigger="click" placement="bottom" @command="changeProject">
        <span class="el-dropdown-link">
          <el-button type="text" style="font-size: 15px;">{{ currentProject.name }}</el-button><i class="el-icon-arrow-down el-icon--right" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="child in proList" :key="child.id" :command="child.id">
              {{ child.label }}
            </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown> -->
        <c-svg
          name="hamburger"
          class-name="toggle-btn"
          @click.native="toggleSide"
        />
      </el-button>
    </div>
    <el-tree
      ref="tree"
      v-loading="structLoading"
      :data="structData"
      :render-content="renderContent"
      highlight-current
      node-key="mtid"
      :current-node-key="currentNode"
      :props="structTreeProps"
      :expand-on-click-node="false"
      default-expand-all
      class="thin-scroll"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    />
    <div class="filter-wrap">
      <el-input
        v-model="filter"
        suffix-icon="el-icon-search"
        clearable
        size="small"
        placeholder="搜索"
        style="margin-right: 10px;"
      />
      <el-tooltip
        effect="dark"
        :content="checked ? '显示所有区域' : '显示已配置区域'"
        placement="top"
      >
        <el-checkbox v-model="checked" />
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { existPlan } from '@/api/planNew'
import { getPlanStructTree } from '@/api/planNew'
export default {
  data() {
    return {
      currentProject: {
        // 当前选中的项目
        id: '',
        name: ''
      },
      currentNode: '', // 当前的树结点
      structLoading: false,
      structData: [], // 树结构数据
      structTreeProps: {
        children: 'Child',
        label: 'mname'
      },
      treeMtids: [], // 整棵树结点的mtid

      scrollbarWidth: 0, // 树滚动条的宽度

      filter: '',
      checked: false
    }
  },
  computed: {
    project() {
      return this.$store.state.app.project
    }
  },
  watch: {
    filter() {
      this.$refs.tree.filter()
    },
    checked() {
      this.$refs.tree.filter()
    }
  },
  mounted() {
    this.fetchStructTree(this.project.id)
    const wrap = document.querySelector('.plan-struct')
    document.body.addEventListener('click', e => {
      if (
        !wrap.contains(e.target) &&
        e.target.className !==
          'el-input__icon el-icon-circle-close el-input__clear'
      ) {
        this.closeSide()
      }
    })
  },
  methods: {
    // 筛选节点
    filterNode(value, data) {
      if (this.filter) {
        if (this.checked) {
          return (
            data.mname.toLowerCase().indexOf(this.filter.toLowerCase()) !==
              -1 && data.exist === 'true'
          )
        } else {
          return (
            data.mname.toLowerCase().indexOf(this.filter.toLowerCase()) !== -1
          )
        }
      } else {
        if (this.checked) {
          return data.exist === 'true'
        } else {
          return true
        }
      }
    },
    // 选择项目
    changeProject(val) {
      this.fetchStructTree(val, true)
    },
    // 关闭侧边栏
    closeSide() {
      let wrap = document.querySelector('.plan-struct')
      wrap.classList.remove('open')
      let treeWrap = document.querySelector('.el-tree')
      this.scrollbarWidth = treeWrap.offsetWidth - treeWrap.clientWidth
    },
    // 开关侧边栏
    toggleSide() {
      let wrap = document.querySelector('.plan-struct')
      wrap.classList.toggle('open')
      let treeWrap = document.querySelector('.el-tree')
      this.scrollbarWidth = treeWrap.offsetWidth - treeWrap.clientWidth
    },
    renderContent(h, { node, data }) {
      let rightHtml = (
        <el-tooltip
          class="item"
          effect="dark"
          class={data.exist === 'true' ? 'exist' : 'not-exist'}
          content={node.label}
          placement="right"
        >
          <i class="el-icon-picture"></i>
        </el-tooltip>
      )
      return (
        <span style="white-space:normal;flex:1">
          <span>
            <svg class="icon node-icon" aria-hidden="true">
              <use xlinkHref="#icon-ceng" />
            </svg>
            <span>{node.label}</span>
          </span>
          {rightHtml}
        </span>
      )
    },
    // 树结点点击事件
    handleNodeClick(obj, node) {
      this.currentNode = node.data.mtid
      this.$emit('clickNode', node.data.mtid)
    },
    // 判断每个结点有没有平面图，更新结构树，
    updateTreeData(treeData) {
      this.getMtid(treeData)
      existPlan({
        mtid: this.treeMtids.join(',')
      })
        .then(res => {
          let data = JSON.parse(res.data)
          this.setTreeData(treeData, data)
          this.structData = treeData
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(this.currentNode)
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取结构树
    fetchStructTree(pid) {
      this.structLoading = true
      getPlanStructTree({
        project: pid
      })
        .then(res => {
          let data = JSON.parse(res.data)
          if (data.success) {
            this.currentNode = data.plist[0].mtid
            this.$refs.tree.setCurrentKey(data.plist[0].mtid)
            this.$emit('clickNode', this.currentNode)

            this.currentProject.id = data.plist[0].pid
            this.currentProject.name = data.plist[0].mname
            // 判断每个结点有没有平面图，更新结构树
            this.updateTreeData(data.plist)
          } else {
            this.structData = []
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('服务器错误，结构树信息获取失败')
        })
        .then(() => {
          this.structLoading = false
        })
    },
    // 遍历结构树，拿到所有的mtid
    getMtid(tree) {
      for (let i = 0, length = tree.length; i < length; i++) {
        this.treeMtids.push(tree[i].mtid)
        if (tree[i].Child) {
          this.getMtid(tree[i].Child)
        }
      }
    },
    // 遍历结构树，给所有结点添加 exist 属性（判断有没有平面图）
    setTreeData(tree, map) {
      for (let i = 0, length = tree.length; i < length; i++) {
        tree[i].exist = map[tree[i].mtid]
        if (tree[i].Child) {
          this.setTreeData(tree[i].Child, map)
        }
      }
    }
  }
}
</script>

<style lang="scss">
.plan-struct {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  transition: transform 0.25s ease-out;
  background: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.07);
  overflow: hidden;
  padding: 0 0px 10px 10px;
  .el-tree {
    height: calc(100vh - 110px);
    overflow-y: auto;
  }
  .filter-wrap {
    display: none;
    padding-top: 10px;
    margin-right: 10px;
    border-top: 1px solid #eee;
  }
  &.open {
    transform: translateX(0) !important;
    .el-icon-picture {
      pointer-events: none;
    }
    .not-exist {
      display: none;
    }
    .filter-wrap {
      display: flex;
      align-items: center;
    }
  }
  .header-wrap {
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-bottom: 1px solid #eee;
    margin-bottom: 15px;
    margin-right: 10px;
  }
  .el-dropdown {
    cursor: pointer;
    font-size: 18px;
  }
  .toggle-btn {
    position: absolute;
    top: 2px;
    right: 0px;
    font-size: 18px;
    cursor: pointer;
    color: #409eff;
    padding: 10px;
    &:hover {
      opacity: 0.5;
    }
  }
  .node-icon {
    font-size: 16px;
    margin-right: 5px;
  }
  .el-icon-picture {
    font-size: 16px;
    float: right;
    margin-right: 10px;
    color: #339999;
    pointer-events: auto;
  }
  .not-exist {
    display: inline-block;
    color: #ccc;
  }
}
</style>
