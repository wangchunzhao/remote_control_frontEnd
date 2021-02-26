<template>
  <el-dialog
    width="600px"
    title="时段设置"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div slot="footer">
      <el-button size="medium" type="primary" @click.native="submit"
        >确 定</el-button
      >
    </div>
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
      dialogVisible: false
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    submit() {}
  }
}
</script>

<style lang="scss" scoped></style>
