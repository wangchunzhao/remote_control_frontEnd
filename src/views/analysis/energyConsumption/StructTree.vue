<template>
  <div>
    <el-input size="small" placeholder="搜索项目名称" v-model="filterText">
    </el-input>
    <div
      style="margin-top: 18px;max-height: 400px;overflow: auto"
      class="thin-scroll"
    >
      <el-tree
        :data="companyStruct"
        show-checkbox
        ref="tree"
        @check-change="handleCheckChange"
        node-key="SubareaId"
        :default-expanded-keys="[
          companyStruct ? companyStruct[0].SubareaId : undefined
        ]"
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
export default {
  data() {
    return {
      filterText: ''
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  computed: {
    companyStruct() {
      return [this.$store.state.app.companyStruct]
    }
  },
  methods: {
    handleCheckChange(val, val2, val3) {
      const checkedNodes = this.$refs.tree.getCheckedNodes()
      console.log('[49]-StructTree.vue', checkedNodes)
      this.$emit('change', checkedNodes)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.SubareaName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    }
  }
}
</script>
