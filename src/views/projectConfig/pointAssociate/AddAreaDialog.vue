<template>
  <el-dialog
    width="330px"
    title="新增区域"
    append-to-body
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="80px"
      size="small"
    >
      <el-form-item label="区域名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入"
          style="width: 190px;"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { addModel } from '@/api/locationTree'
export default {
  props: {
    parentId: Number
  },
  data() {
    return {
      dialogVisible: false,

      form: {
        name: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { name } = this.form
          addModel({
            mtid: this.parentId,
            name
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message({
                  type: 'success',
                  message: '添加成功'
                })
                this.dialogVisible = false
                // areaId 转 number类型
                this.$emit('refresh', { areaId: res.data.Data * 1 })
              } else {
                this.$message.error('添加失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('添加失败')
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
