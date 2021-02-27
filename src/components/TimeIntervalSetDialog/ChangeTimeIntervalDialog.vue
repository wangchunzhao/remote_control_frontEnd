<template>
  <el-dialog
    width="360px"
    title="批量时段设置"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div>
      <el-form ref="form" label-width="85px" size="small">
        <el-form-item label="已选中:">
          {{ list.length }}
        </el-form-item>
      </el-form>
      <el-select
        v-model="type"
        placeholder="请选择"
        size="mini"
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
