<template>
  <el-dialog
    width="310px"
    title="批量修改从站地址"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div style="color: rgba(0,0,0,.3);margin-bottom: 15px;">
      已选中 {{ list.length }} 个点位
    </div>
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      inline
      hide-required-asterisk
      size="small"
    >
      <el-form-item label="将从站地址修改为" prop="address">
        <el-input
          v-model="form.address"
          placeholder="请输入"
          style="width: 100px;"
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
const isInteger = n => {
  if (n === '') {
    return false
  }
  return parseInt(n, 10) == n
}
export default {
  props: {
    list: Array
  },
  data() {
    const checkAddress = (rule, value, callback) => {
      if (isInteger(value)) {
        if (Number(value) < 1 || Number(value) > 255) {
          callback(new Error('请输入一个 1-255 之间的整数'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请输入一个 1-255 之间的整数'))
      }
    }
    return {
      dialogVisible: false,

      form: {
        address: ''
      },
      rules: {
        address: [
          { required: true, message: '请输入', trigger: 'blur' },
          { validator: checkAddress, trigger: 'blur' }
        ]
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
          this.list.forEach(item => {
            item.address.value = this.form.address
          })
          this.$message.success('修改成功')
          this.$emit('change')
          this.dialogVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
