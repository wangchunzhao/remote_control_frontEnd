<template>
  <el-dialog
    width="380px"
    title="注册集中器"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      style="margin-right: 50px;"
      size="small"
    >
      <el-form-item label="所属项目" prop="projectId">
        <el-select
          v-model="form.projectId"
          :disabled="platform === PLATFORM.business"
          style="width: 100%;"
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-for="(name, index) in form.names"
        :label="`集中器${index + 1}`"
        :key="index"
        :prop="'names.' + index + '.value'"
        :rules="{
          type: 'number',
          required: true,
          min: 10000000,
          max: 99999999,
          message: '请输入 8 位数字',
          trigger: 'blur'
        }"
      >
        <el-input
          clearable
          v-model.number="name.value"
          placeholder="请输入（8位数字）"
        ></el-input>
        <el-link
          type="danger"
          :underline="false"
          v-if="form.names.length > 1"
          @click.native="() => handleRemoveFormItem(index)"
          style="position: absolute;right: -20px;"
        >
          <i class="el-icon-remove-outline" />
        </el-link>
      </el-form-item>
      <el-form-item label="" style="margin-bottom: 0;">
        <el-button
          @click.native="handleAddFormItem"
          icon="el-icon-plus"
          type="text"
          size="medium"
          >新增</el-button
        >
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >添 加</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { batchAddConcentrator } from '@/api/meter'
export default {
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      form: {
        names: [{ value: '' }],
        projectId: ''
      },
      rules: {
        projectId: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      PLATFORM
    }
  },
  computed: {
    projectOptions() {
      return this.$store.state.app.proList
    },
    projectId() {
      return (this.$store.state.app.project || {}).id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      if (this.platform === PLATFORM.business) {
        this.form.projectId = this.projectId
      }
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    handleRemoveFormItem(index) {
      this.form.names.splice(index, 1)
    },
    handleAddFormItem() {
      this.form.names.push({ value: '' })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { names, projectId } = this.form
          this.submitLoading = true
          batchAddConcentrator({
            ProjectId: projectId,
            ConcentratorNoList: names.map(v => v.value)
          })
            .then(res => {
              if (res.data.Code === 200) {
                const data = res.data.Data
                if (!data.ErrList.length) {
                  this.$message.success('新增成功')
                  this.$emit('refresh')
                  this.dialogVisible = false
                } else {
                  let descText = ''
                  data.ErrList.forEach(item => {
                    descText += `
                        <div>电表-${item.ErrKey} 操作失败，Message：${item.ErrMessage}</div>
                      `
                  })
                  this.$notify({
                    title: '错误提示',
                    duration: 10000,
                    dangerouslyUseHTMLString: true,
                    message: descText
                  })
                }
              } else {
                this.$message.error('新增失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('新增失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
