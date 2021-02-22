<template>
  <el-dialog
    width="330px"
    append-to-body
    custom-class="repairOrder-export-addField"
    title="添加字段"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div v-for="item in fieldList" :key="item.key" class="list-item">
      <el-checkbox @change="handleFieldCheckedChange" v-model="item.checked">
        <c-svg class="desc-icon" :name="item.icon"></c-svg>
        <span class="desc">{{ item.label }}</span>
      </el-checkbox>
    </div>
    <span slot="footer">
      <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        style="float:left;margin: 7px 0 0 6px;"
        @change="handleCheckAllChange"
        >全选</el-checkbox
      >
      <el-button size="medium" type="primary" @click.native="handleAdd"
        >添 加</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    list: Array
  },
  data() {
    return {
      dialogVisible: false,
      fieldList: [],
      checkAll: false,
      isIndeterminate: false
    }
  },
  watch: {
    list: {
      handler: function(val) {
        this.fieldList = val.map(v => {
          return { ...v, checked: false }
        })
      },
      immediate: true
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleCheckAllChange(val) {
      if (val === true) {
        this.fieldList.forEach(v => (v.checked = true))
      } else {
        this.fieldList.forEach(v => (v.checked = false))
      }
      this.isIndeterminate = false
    },
    handleFieldCheckedChange() {
      const checkedCount = this.fieldList.filter(v => v.checked).length
      this.checkAll = checkedCount === this.fieldList.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.fieldList.length
    },
    handleAdd() {
      this.$emit('change', {
        list: this.fieldList.filter(v => v.checked),
        otherList: this.fieldList.filter(v => !v.checked)
      })
      this.isIndeterminate = false
      this.checkAll = false
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss">
.repairOrder-export-addField {
  .el-dialog__body {
    padding: 0;
  }
  .list-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    &:hover {
      background-color: #f7f7f7;
    }
  }
  .desc-icon {
    margin-right: 10px;
  }
  .el-checkbox {
    margin-right: 0;
  }
  .el-checkbox__label {
    font-weight: normal;
  }
}
</style>
