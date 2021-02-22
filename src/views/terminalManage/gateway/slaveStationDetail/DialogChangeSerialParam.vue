<template>
  <el-dialog
    width="370px"
    title="修改串口参数"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="100px" size="small">
      <el-form-item label="波特率：" prop="baudRate">
        <el-select
          filterable
          clearable
          v-model="form.baudRate"
          size="small"
          placeholder=""
        >
          <el-option
            v-for="item in baudRateOptions"
            :key="item.Value"
            :label="item.Value"
            :value="item.Value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据位：" prop="dataBit">
        <el-select
          filterable
          clearable
          v-model="form.dataBit"
          size="small"
          placeholder=""
        >
          <el-option
            v-for="item in dataBitOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="校验位：" prop="checkBit">
        <el-select
          filterable
          clearable
          v-model="form.checkBit"
          size="small"
          placeholder=""
        >
          <el-option
            v-for="item in checkBitOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="停止位：" prop="stopBit">
        <el-select
          filterable
          clearable
          v-model="form.stopBit"
          size="small"
          placeholder=""
        >
          <el-option
            v-for="item in stopBitOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          >
          </el-option>
        </el-select>
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
import { updateDeviceModuleGorgeParameter } from '@/api/deviceModule'
import { getDeviceNumRule } from '@/api/device_new'

export default {
  props: {
    info: Object
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      form: {
        baudRate: '',
        dataBit: '',
        checkBit: '',
        stopBit: ''
      },
      dataBitOptions: [],
      stopBitOptions: [],
      baudRateOptions: [],
      checkBitOptions: []
    }
  },
  watch: {
    info: {
      handler: function() {
        this.form.baudRate = this.info.BaudRate
        this.form.dataBit = this.info.DataBit
        this.form.checkBit = this.info.CheckBit
        this.form.stopBit = this.info.StopBit
      },
      immediate: true
    }
  },
  mounted() {
    getDeviceNumRule({
      deviceTypeList: ['BaudRate', 'CheckBit', 'StopBit', 'DataBit']
    }).then(res => {
      if (res.data.Code === 200) {
        const data = res.data.Data
        this.baudRateOptions = data.BaudRate
        this.checkBitOptions = data.CheckBit
        this.dataBitOptions = data.DataBit.map(v => {
          v.Key = parseInt(v.Key)
          return v
        })
        this.stopBitOptions = data.StopBit
      }
    })
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
          const { dataBit, stopBit, checkBit, baudRate } = this.form
          this.submitLoading = true
          updateDeviceModuleGorgeParameter({
            deviceModuleId: this.info.DeviceModuleId,
            deviceModuleGorgeParameter: {
              BaudRate: baudRate,
              DataBit: dataBit,
              CheckBit: checkBit,
              StopBit: stopBit
            }
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('修改成功')
                this.$emit('refresh')
                this.dialogVisible = false
              } else {
                this.$message.error('修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('修改失败')
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
