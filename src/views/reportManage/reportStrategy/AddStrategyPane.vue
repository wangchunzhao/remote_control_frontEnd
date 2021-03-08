<template>
  <el-dialog
    width="300px"
    title="新增策略"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div>
      <el-input
        placeholder="请输入策略名称"
        v-model="name"
        style="width: 100%"
        size="small"
      ></el-input>
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
    }
  },
  data() {
    return {
      dialogVisible: false,
      name: ''
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.name = ''
    },
    submit() {
      if (!this.name) {
        this.$message.error('请输入策略名称')
        return
      }
      this.$emit('addPane', this.name)
      this.handleClose()
    }
  }
}
</script>
