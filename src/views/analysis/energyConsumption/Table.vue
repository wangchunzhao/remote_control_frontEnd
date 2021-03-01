<template>
  <div>
    <div class="table-tool-box">
      <el-button
        :loading="exportLoading"
        size="small"
        type="primary"
        @click="handleExport"
      >
        导出
      </el-button>
    </div>
    <el-table
      :data="data"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
    >
      <el-table-column
        v-for="key in columns"
        :key="key"
        :label="key"
        :prop="key"
      />
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    exportLoading: {
      type: Boolean
    }
  },
  methods: {
    handleExport() {
      this.$emit('onClickExport')
    }
  }
}
</script>
