<template>
  <div>
    <el-input
      size="small"
      clearable
      placeholder="搜索项目名称"
      v-model="filterText"
    >
    </el-input>
    <div
      style="margin-top: 15px;max-height: 400px;overflow: auto"
      class="thin-scroll"
    >
      <el-tree
        :data="companyStruct"
        show-checkbox
        ref="tree"
        @check-change="handleCheckChange"
        node-key="SubareaId"
        :default-expanded-keys="
          companyStruct.length ? [companyStruct[0].SubareaId] : []
        "
        :filter-node-method="filterNode"
        :props="{
          children: 'Children',
          label: 'SubareaName'
        }"
      >
      </el-tree>
    </div>
  </div>
</template>

<script>
import { getUserOwnSubareaTree } from '@/api/subarea'
import debounce from 'lodash/debounce'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      filterText: '',
      companyStruct: []
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  computed: {
    ...mapGetters(['companyId'])
  },
  mounted() {
    // 获取项目树
    getUserOwnSubareaTree({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          let tree = [res.data.Data]
          this.walk(tree)
          console.log('[59]-StructTree.vue', tree)
          this.companyStruct = tree
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    handleCheckChange: debounce(function() {
      const checkedNodes = this.$refs.tree.getCheckedNodes()
      this.$emit('change', checkedNodes)
    }, 600),
    filterNode(value, data) {
      if (!value) return true
      return data.SubareaName.toLowerCase().indexOf(value.toLowerCase()) !== -1
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
