<template>
  <el-dialog
    width="440px"
    title="批量变更"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="100px" size="medium">
      <el-form-item label="报警开关" prop="tAlarm">
        <el-select v-model="form.tAlarm" filterable placeholder="请选择">
          <el-option label="开" :value="1"></el-option>
          <el-option label="关" :value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="form.tAlarm === ''"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >变 更</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { updateSensor } from '@/api/device_new'
export default {
  props: {
    ids: {
      type: Array,
      required: false,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      submitLoading: !1,
      dialogVisible: !1,
      form: {
        tAlarm: ''
      }
    }
  },
  methods: {
    openDialog() {
      this.form.tAlarm = ''
      this.dialogVisible = true
    },
    handleClose() {
      this.form.tAlarm = ''
      this.dialogVisible = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const { tAlarm } = this.form
          updateSensor({
            SensorIdList: this.ids,
            tAlarm
          })
            .then(res => {
              if (res.data.Code === 200) {
                if (res.data.Data) {
                  this.$message.success('变更成功')
                  this.$emit('refresh')
                  this.dialogVisible = false
                } else {
                  this.$message.error(res.data.Message)
                }
              } else {
                this.$message.error('变更失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('变更失败')
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
