<template>
  <div
    class="custom-energyBranch-pikcer-KJDSHFJ"
    :class="direction === 'row' ? 'row' : ''"
  >
    <el-radio-group
      v-model="type"
      @change="typeChange"
      size="mini"
      border
      :class="direction === 'row' ? 'radio-group-box' : ''"
    >
      <el-radio-button label="default">
        按分组
      </el-radio-button>
      <el-radio-button label="custom">
        自定义
      </el-radio-button>
    </el-radio-group>
    <el-select
      v-show="type === 'default'"
      v-model="groupId"
      placeholder=""
      size="mini"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0',
        width: pickerWidth ? pickerWidth * 1.3 + 'px' : '100%'
      }"
    >
      <el-option
        v-for="item in groupList"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
    <el-cascader
      v-show="type === 'custom'"
      :options="energyStruct"
      ref="cascader"
      clearable
      :filterable="true"
      :props="cascaderProps"
      collapse-tags
      @visible-change="handleBranchVisible"
      size="mini"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0',
        width: pickerWidth ? pickerWidth + 'px' : '100%'
      }"
    >
      <template slot-scope="{ node, data }">
        <c-svg
          v-if="data.IsSubentry"
          style="color: #909399; margin-right: 5px"
          name="folder-open-fill"
        ></c-svg>
        <span
          :class="[
            data.nodeType === 'projectNode' ? 'project-node-SJHDF9823' : ''
          ]"
          >{{ data.Name }}</span
        >
        <c-svg
          v-if="data.IsSummary"
          style="color: #909399; margin-left: 5px"
          name="zong"
        ></c-svg> </template
    ></el-cascader>
  </div>
</template>

<script>
import { getSubentryTree } from '@/api/subentry'

function walk(arr) {
  arr.forEach(item => {
    item.ChildrenList && item.ChildrenList.length
      ? walk(item.ChildrenList)
      : delete item.ChildrenList
  })
}

export default {
  name: 'CustomDatePicker',
  props: {
    direction: {
      type: String,
      default: function() {
        return 'column'
      }
    },
    pickerWidth: {
      type: Number,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      type: 'default',
      groupId: '',
      groupList: [1, 2, 3], // 分组列表
      idList: [], // 自定义列表
      defaultChooseValue: false, //切换后是否自动选择值

      cascaderProps: {
        multiple: true,
        children: 'ChildrenList',
        label: 'Name',
        value: 'SubentryId',
        lazy: false,
        lazyLoad: (node, resolve) => {
          if (node.level === 1) {
            getSubentryTree({
              companyId: this.$store.state.app.company.id,
              projectId: node.value,
              isGetModelTree: true
            })
              .then(res => {
                if (200 === res.data.Code) {
                  // 目前只要做了电量的
                  let data = res.data.Data
                  walk(data)
                  resolve(data)
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            resolve()
          }
        }
      }
    }
  },
  computed: {
    energyStruct() {
      return this.$store.state.energy.energyStruct
    }
  },
  watch: {
    groupId(val) {
      if (val) {
        this.valueOutPut(val)
      }
    },
    idList(val) {
      if (val && val.length) {
        this.valueOutPut(val)
      }
    }
  },
  methods: {
    /**
     * 组件初始化、重置
     * @param type {String} 默认选择类型
     * @param defaultChooseValue {Boolean} 是否默认选择
     * **/
    init(type = 'default', defaultChooseValue = false) {
      this.type = type
      this.defaultChooseValue = defaultChooseValue
      this.groupId = 1
    },
    // 值变化
    valueOutPut(val) {
      if (this.type === 'default') {
        this.$emit('chooseChange', {
          type: this.type,
          groupId: val,
          idList: []
        })
      } else {
        this.$emit('chooseChange', {
          type: this.type,
          groupId: '',
          idList: val
        })
      }
    },
    // 类型变化
    typeChange() {
      this.idList = []
      this.$emit('typeChange', this.type)
      if (this.type === 'default') {
        this.$emit('chooseChange', {
          type: this.type,
          groupId: this.groupId,
          idList: []
        })
      } else {
        this.$emit('chooseChange', {
          type: this.type,
          groupId: '',
          idList: []
        })
      }
    },
    // 更换自定义支路
    handleBranchVisible(isVisible) {
      if (isVisible) return
      // 获取选中的设备节点
      let checkedNodes = this.$refs.cascader.getCheckedNodes()
      if (!checkedNodes.length) {
        return
      }
      if (
        !checkedNodes.every(v => {
          if (v.data.TopSubentryId === checkedNodes[0].data.TopSubentryId) {
            return true
          }
          return false
        })
      ) {
        this.$notify.info({
          title: '消息',
          duration: 10000,
          offset: 70,
          message:
            '不支持不同类型支路的对比，如：电量下的 A 支路不可以和燃气量下的 B 支路对比'
        })
        return
      }
      let nodes = checkedNodes.filter(item => !item.data.IsSubentry)
      if (nodes.length) {
        let branchIds = []
        nodes.forEach(item => {
          branchIds.push(item.data.ModelTreeId)
        })
        if (!branchIds.length) {
          this.$message('选中的节点下面没有设备，无法查询')
          return
        }
        this.idList = branchIds
      } else {
        this.idList = []
      }
    }
  }
}
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
}
.radio-group-box {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-right: 10px;
}
</style>
<style lang="scss">
.custom-energyBranch-pikcer-KJDSHFJ {
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    background-color: #fff;
    color: #1890ff;
  }
  .el-radio-button {
    flex: 1;
  }
  .el-radio-button__inner {
    display: block;
  }
}
</style>
