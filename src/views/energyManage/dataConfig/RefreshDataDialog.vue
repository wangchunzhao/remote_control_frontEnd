<template>
  <el-dialog width="420px" :visible.sync="dialogVisible" @close="handleClose">
    <template v-slot:title>
      <div class="el-dialog__title">
        <div>
          <span>刷新能耗数据</span>
          <el-tooltip class="item" effect="dark" placement="right">
            <div slot="content" style="width: 280px;line-height: 20px;">
              计算公式变化后，可以按照新公式对近3个月能耗统计数据重新计算。
            </div>
            <c-svg
              name="info-circle-fill"
              style="color: rgba(0,0,0,0.25); margin-left: 10px;"
            ></c-svg>
          </el-tooltip>
        </div>
      </div>
    </template>
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
      <el-form-item label="时间范围" prop="time">
        <el-date-picker
          v-model="form.time"
          type="daterange"
          align="right"
          style="width: 240px;"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        size="medium"
        :loading="submitLoading"
        type="primary"
        @click.native="submitForm"
        >刷 新</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { generateBranchData } from '@/api/branchCompute'
import dayjs from 'dayjs'
export default {
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,

      form: {
        time: ''
      },
      rules: {
        time: [{ required: true, message: '请选择', trigger: 'change' }]
      },

      pickerOptions: {
        disabledDate(time) {
          return (
            time.getTime() > Date.now() ||
            time.getTime() < Date.now() - 3600 * 1000 * 24 * 90
          )
        },
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  methods: {
    openDialog(id) {
      this.dialogVisible = true
      this.currentId = id
    },
    handleClose() {
      this.dialogVisible = false
      this.form.time = ''
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { time } = this.form
          this.submitLoading = true
          generateBranchData({
            StartTime: this._dateFormat(time[0], 'YYYY-MM-DD HH:mm'),
            EndTime: this._dateFormat(
              dayjs(time[1]).add(1, 'day'),
              'YYYY-MM-DD HH:mm'
            ),
            ModelTreeIdList: [this.currentId]
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('数据刷新成功')
                this.dialogVisible = false
              } else {
                this.$message.error('数据刷新失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('数据刷新失败')
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
