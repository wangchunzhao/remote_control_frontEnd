<template>
  <el-dialog
    width="300px"
    title="修改离线判断间隔"
    append-to-body
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="85px"
      size="small"
    >
      <el-form-item label="当前间隔:">
        <span style="color: #FAAD14;">{{ intervalHistory }} - 分钟</span>
      </el-form-item>
      <el-form-item label="间隔修改:" prop="interval">
        <el-input
          v-model.number="form.interval"
          style="width: 120px;"
          placeholder="请输入"
        ></el-input>
        分钟
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        size="medium"
        :loading="submitLoading"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import {
  getProjectoffLineInterval,
  updateoffLineInterval
} from '@/api/eventStrategy'
export default {
  data() {
    return {
      dialogVisible: false,

      intervalHistory: '',
      form: {
        interval: ''
      },
      rules: {
        interval: [
          {
            required: true,
            type: 'number',
            min: 1,
            message: '请输入一个整数',
            trigger: 'blur'
          }
        ]
      },
      submitLoading: false
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      getProjectoffLineInterval({ projectId: this.projectId }).then(res => {
        if (res.data.Code === 200) {
          this.intervalHistory = res.data.Data
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.intervalHistory = ''
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const { interval } = this.form
          updateoffLineInterval({
            projectId: this.projectId,
            offLineInterval: interval
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                if (data.Data.IsSuccess) {
                  this.$message.success('编辑成功')
                  this.dialogVisible = false
                } else {
                  this.$message.error('编辑失败')
                }
              } else {
                this.$message.error('编辑失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('编辑失败')
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
