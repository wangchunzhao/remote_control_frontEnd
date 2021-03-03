<template>
  <el-dialog
    width="320px"
    title="变更数据权限"
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
      hide-required-asterisk
      label-width="100px"
      style="width: 100%"
    >
      <el-form-item prop="levelList" label="设备权限：">
        <el-select
          v-model="form.levelList"
          placeholder="请选择"
          multiple
          clearable
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
      <el-form-item prop="levelList" label="报警权限：">
        <el-select
          v-model="form.levelList"
          placeholder="请选择"
          multiple
          clearable
          style="width: 100%;"
        >
          <el-option
            v-for="item in dataPermissionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submit">
        确 认
      </el-button>
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
      userIdList: [],
      form: {
        levelList: []
      },
      formRules: {
        levelList: [
          {
            type: 'array',
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
      ],
      dataPermissionOptions:[]
    }
  },
  methods: {
    openDialog(userIdList) {
      this.dialogVisible = true
      this.$refs.form && this.$refs.form.clearValidate()
      this.userIdList = userIdList
    },
    handleClose() {
      this.dialogVisible = false
      this.submitLoading = false
      this.userIdList = []
      this.form.levelList = []
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
