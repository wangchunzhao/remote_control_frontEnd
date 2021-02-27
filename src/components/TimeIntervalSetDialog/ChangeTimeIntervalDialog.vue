<template>
  <el-dialog
    width="300px"
    title="批量时段设置"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div style="margin-bottom: 10px">已选中：{{ list.length }}</div>
    <div>
      <el-select
        v-model="type"
        placeholder="请选择"
        size="small"
        style="width: 100%"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submit"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    options: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      list: [],
      type: ''
    }
  },
  methods: {
    openDialog(list) {
      this.dialogVisible = true
      this.list = list
    },
    handleClose() {
      this.$emit('changeModel')
      this.dialogVisible = false
      this.list = []
    },
    submit() {
      if (!this.type) {
        this.$message.error('请设置时段')
        return
      }
      this.$emit('changeType', this.type)
      this.handleClose()
    }
  }
}
</script>
