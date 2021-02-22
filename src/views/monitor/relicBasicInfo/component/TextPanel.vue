<template>
  <div class="reliceBasicInfo-panel">
    <div class="panel-header">
      <span class="title">
        {{ title }}
      </span>
      <el-button
        style="padding: 3px 8px;"
        @click.native="handleClick"
        size="mini"
        plain
        v-permission="[28]"
      >
        <c-svg :name="editable ? 'save' : 'bianji'"></c-svg>
        {{ editable ? '保存' : '编辑' }}</el-button
      >
    </div>
    <div class="panel-body">
      <div
        v-html="text"
        v-if="!editable"
        style="white-space: pre-wrap;line-height: 22px;"
      ></div>
      <el-input
        type="textarea"
        :rows="10"
        v-else
        placeholder="请输入内容"
        v-model="text"
      >
      </el-input>
    </div>
  </div>
</template>

<script>
import { updateModelInfo } from '@/api/modelInfo'
export default {
  props: {
    title: String,
    field: String,
    content: String,
    systemId: String,
    projectId: Number
  },
  data() {
    return {
      editable: false,
      text: ''
    }
  },
  watch: {
    content(val) {
      this.text = val
    }
  },
  methods: {
    handleClick() {
      this.editable = !this.editable
      if (this.editable === false) {
        updateModelInfo({
          projectId: this.projectId,
          modelId: this.systemId,
          [this.field]: this.text
        })
          .then(res => {
            if (res.data.Code !== 200 || res.data.Data.IsSuccess !== true) {
              this.$message.error('更新失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('更新失败')
          })
      }
    }
  }
}
</script>

.<style lang="stylus" scoped></style>
