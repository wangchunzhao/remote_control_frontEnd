<template>
  <el-dialog
    width="600px"
    title="处理报警"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      style="margin-right: 40px;"
      size="small"
    >
      <el-form-item v-if="industry === 1" label="报警原因">
        <el-select
          v-model="form.reason"
          size="medium"
          placeholder="请选择"
          clearable
          style="width: 300px;"
        >
          <el-option
            v-for="item in reasonOptions"
            :key="item.Alarm_ReasonID"
            :label="item.Reason"
            :value="item.Reason"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="name">
        <el-input
          type="textarea"
          :rows="5"
          :disabled="
            industry === 1 && form.reason !== '其他' && !!reasonOptions.length
          "
          v-model="form.remark"
          placeholder=""
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="medium" type="primary" @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { alarmReasonDescribe } from '@/api/alarmReasonDesc'
import { upDetail } from '@/api/alarmActive'

export default {
  data() {
    return {
      dialogVisible: false,
      reasonOptions: [],
      form: {
        remark: '',
        reason: ''
      },
      rules: {
        remark: [{ required: true, message: '请输入', trigger: 'blur' }],
        reason: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    }
  },
  computed: {
    industry() {
      if (
        this.$store.state.app.project &&
        this.$store.state.app.project.Industry
      ) {
        return this.$store.state.app.project.Industry
      } else {
        return ''
      }
    }
  },
  methods: {
    openDialog({ idList, type }) {
      this.dialogVisible = true
      this.currentAlarmIdList = idList
      if (this.industry === 1) {
        alarmReasonDescribe({
          PointTypeID: type,
          Industry: this.industry
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.reasonOptions = res.data.Data
            } else {
              this.reasonOptions = []
            }
          })
          .catch(err => {
            console.error(err)
            this.reasonOptions = []
          })
      }
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let remark = this.form.remark
          if (this.industry === 1) {
            if (this.form.reason !== '其他') {
              remark = this.form.reason
            }
          }
          if (!remark) {
            this.$message('请输入处理备注')
            return
          }
          upDetail({
            AlarmIdList: this.currentAlarmIdList,
            COMMENT: remark
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                this.dialogVisible = false
                this.$message.success('提交成功')
                // 提交成功后重新获取表格内容
                this.$emit('refresh')
              } else {
                this.$message.error('提交失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('提交失败')
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
