<template>
  <el-dialog
    width="440px"
    title="绑定通讯卡"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
      <el-form-item label="SIM 卡号：" prop="cardNo">
        <el-input
          v-model="form.cardNo"
          placeholder="请输入20位卡号"
          style="width: 200px;"
        ></el-input>
        <el-tooltip placement="right">
          <img
            style="width: 216px;height: 120px;border-radius: 5px;"
            slot="content"
            src="https://cdn.sinocold.net/images/SIM%E5%8D%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png"
            alt=""
          />
          <c-svg
            style="position: absolute;top: 7px; right: 60px;;font-size: 18px;color: rgba(0,0,0,0.3); cursor: pointer;"
            name="info-circle-fill"
          />
        </el-tooltip>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { deviceBindICCID } from '@/api/device_new'
export default {
  props: {
    gatewayId: Number
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      form: {
        cardNo: ''
      },
      rules: {
        cardNo: [
          { required: true, message: '请输入', trigger: 'blur' },
          {
            pattern: /[0-9A-Z]{20}$/,
            message: '20位卡号'
          }
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
          this.submitLoading = true
          deviceBindICCID({
            ICCID: this.form.cardNo,
            deviceID: this.gatewayId
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('通讯卡绑定成功')
                this.$emit('complete')
                this.dialogVisible = false
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('绑定失败')
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
