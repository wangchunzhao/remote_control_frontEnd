<template>
  <el-dialog
    width="350px"
    title="绑定摄像头"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div style="margin-bottom: 15px;margin-left: 20px;">
      请选择绑定到 {{ deviceName }} 的摄像头。
    </div>
    <el-form :model="form" ref="form" label-width="20px" size="small">
      <el-form-item
        v-for="(item, index) in form.cameras"
        label=""
        :key="index"
        :prop="'cameras.' + index + '.value'"
        :rules="[
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ]"
      >
        <el-select v-model="item.value" filterable placeholder="请选择摄像头">
          <el-option
            v-for="item in cameraOptions"
            :label="item.Value"
            :value="item.Key"
            :disabled="handleSelectOptionDisable(item.Key)"
            :key="item.Key"
          ></el-option>
        </el-select>
        <el-button
          class="btn-danger"
          type="text"
          style="padding: 6px;"
          @click.native="removeSelect(index)"
        >
          <i class="el-icon-remove" style="font-size: 18px;margin-left: 5px;" />
        </el-button>
        <el-button
          v-if="index === 0"
          type="text"
          :style="{ padding: '6px', marginLeft: 0 }"
          @click.native="addSelect"
        >
          <i
            class="el-icon-circle-plus"
            style="font-size: 18px;margin-left: 5px;"
          />
        </el-button>
      </el-form-item>
    </el-form>
    <div style="margin-left: 20px;color: rgba(0,0,0,.45); font-size: 12px;">
      没有找到摄像头？
      <el-button
        @click.native="handleClickAdd"
        type="text"
        style="font-size: 12px;padding: 0;"
        >点击添加
      </el-button>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="medium" type="primary" @click.native="submitForm"
        >确 定</el-button
      >
    </span>
    <AddCameraDialog
      :projectId="projectId"
      @complete="fetchCameraOptions"
      ref="addCameraDialog"
    />
  </el-dialog>
</template>

<script>
import AddCameraDialog from './AddCameraDialog'
import {
  getModelTreeVideoMonitorPointList,
  getVideoMonitorPointDropdownList,
  batchModelTreeBindVideoMonitorPoint
} from '@/api/videoMonitorPoint'
export default {
  components: {
    AddCameraDialog
  },
  data() {
    return {
      dialogVisible: false,
      deviceName: '',
      cameraOptions: [],
      form: {
        id: '',
        cameras: [
          {
            value: ''
          }
        ]
      }
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    industryId() {
      return this.$store.state.app.project.Industry
    }
  },
  methods: {
    openDialog({ id, name }) {
      this.deviceName = name
      this.form.id = id
      getModelTreeVideoMonitorPointList({
        modelTreeId: id,
        industry: this.industryId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            if (data.length) {
              this.form.cameras = []
              data.forEach(item => {
                this.form.cameras.push({
                  value: item.PointId
                })
              })
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
      this.fetchCameraOptions(id)
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.form.id = ''
      this.form.cameras = [
        {
          value: ''
        }
      ]
      this.$refs.form.resetFields()
    },
    removeSelect(index) {
      this.form.cameras.splice(index, 1)
    },
    addSelect() {
      this.form.cameras.push({
        value: ''
      })
    },
    handleSelectOptionDisable(val) {
      const temp = this.form.cameras.map(item => item.value)
      return temp.indexOf(val) > -1
    },
    handleClickAdd() {
      this.$refs.addCameraDialog.openDialog()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // const { name, deviceType, cycle, id } = this.form
          let form = []
          this.form.cameras.forEach(item => {
            const temp = this.cameraOptions.find(
              camera => camera.Key === item.value
            )
            if (temp) {
              form.push({
                PointId: temp.Key,
                PointName: temp.Value
              })
            }
          })
          batchModelTreeBindVideoMonitorPoint({
            modelTreeId: this.form.id,
            form
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                if (data.Data.IsSuccess) {
                  this.$message.success('摄像头绑定成功')
                  this.$emit('refresh')
                  this.dialogVisible = false
                } else {
                  this.$message.error('摄像头绑定失败')
                }
              } else {
                this.$message.error('摄像头绑定失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('摄像头绑定失败')
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    fetchCameraOptions(id) {
      getVideoMonitorPointDropdownList({
        projectId: this.projectId,
        modelTreeId: id,
        industry: this.industryId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.cameraOptions = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
