<template>
  <el-dialog
    width="320px"
    title="批量设置"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :rules="formRules"
      size="small"
      :model="form"
      label-width="80px"
      style="width: 100%"
    >
      <el-form-item prop="level" label="项目等级">
        <el-select
          v-model="form.level"
          placeholder="请选择"
          clearable
          filterable
          style="width: 100%;"
        >
          <el-option
            v-for="item in levelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="tag" label="项目标签">
        <div style="margin-bottom: 10px" v-if="tagList.length < 5">
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleTagInputConfirm"
            @blur="handleTagInputConfirm"
          >
          </el-input>
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            @click="showTagInput"
          >
            + 标签
          </el-button>
        </div>
        <el-tag
          v-for="(item, index) in tagList"
          :key="index"
          closable
          effect="plain"
          :disable-transitions="false"
          @close="handleDeleteTag(index)"
          style="margin-right: 5px;margin-bottom: 5px"
        >
          {{ item }}
        </el-tag>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submit"
        >保 存</el-button
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
      submitLoading: false,
      ProjectIdList: [],
      tagList: ['标签一', '标签二', '标签三'],
      inputVisible: false,
      inputValue: '',
      form: {
        level: ''
      },
      formRules: {
        level: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ]
      },
      levelOptions: [
        {
          label: '重要',
          value: 1
        },
        {
          label: '一般',
          value: 2
        }
      ]
    }
  },
  methods: {
    openDialog(ProjectIdList) {
      this.dialogVisible = true
      this.$refs.form && this.$refs.form.clearValidate()
      this.ProjectIdList = ProjectIdList
    },
    handleClose() {
      this.dialogVisible = false
      this.submitLoading = false
      this.inputVisible = false
      this.inputValue = ''
      this.form.level = ''
      this.tagList = []
      this.ProjectIdList = []
    },
    handleDeleteTag(index) {
      this.tagList.splice(index, 1)
    },
    showTagInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleTagInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        this.tagList.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.$emit('refresh')
          this.handleClose()
        }
      })
    }
  }
}
</script>
