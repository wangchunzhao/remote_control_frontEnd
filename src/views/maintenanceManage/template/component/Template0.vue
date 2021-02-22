<template>
  <el-card class="pact-template0-card" shadow="never">
    <div slot="header" class="clearfix">
      <span style="color: #303133;font-size: 17px;">{{ title }}</span>
      <el-dropdown style="float: right;">
        <span class="more-btn">
          <i class="el-icon-more"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handleEdit">
            <c-svg name="bianji" style="margin-right: 6px;" />
            修改内容
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleRemove">
            <c-svg name="delete" style="margin-right: 6px;" />
            删除</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div
      style="margin-bottom: 20px;"
      v-for="(item, index) in contents"
      :key="index"
    >
      <el-radio v-model="radio" disabled label="1">{{ item.value }}</el-radio>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'Template0',
  props: {
    title: {
      type: String
    },
    itemId: {
      type: Number
    },
    contents: {
      type: Array
    }
  },
  data() {
    return {
      radio: false
    }
  },
  methods: {
    handleRemove() {
      this.$confirm('确认要删除选中的维保项?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$emit('remove', this.itemId)
        })
        .catch(() => {})
    },
    handleEdit() {
      this.$emit('edit')
    }
  }
}
</script>

<style lang="scss">
.pact-template0-card {
  padding-bottom: 50%;
  position: relative;
  .more-btn {
    cursor: pointer;
  }
  .el-card__header {
    cursor: move;
  }
  .el-card__body {
    height: calc(100% - 53px);
    position: absolute;
    overflow-y: auto;
    width: 100%;
    box-sizing: border-box;
  }
  /* 修改滚动条样式 */
  .el-card__body::-webkit-scrollbar {
    width: 7px;
    height: 10px;
  }

  .el-card__body::-webkit-scrollbar-thumb {
    height: 16px;
    border-radius: 4px;
    background-color: #a6a6a6;
    border-left: 2px solid transparent;
  }

  .el-card__body::-webkit-scrollbar-track {
    background-color: #e5e5e5;
    border-left: 2px solid transparent;
  }
  .el-radio__input.is-disabled + span.el-radio__label {
    color: inherit;
  }
}
</style>
