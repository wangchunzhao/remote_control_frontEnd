<template>
  <el-dialog
    width="500px"
    title="解决设备名称冲突"
    append-to-body
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div
      style="font-size: 13px;margin-bottom: 15px;margin-left: 20px;color: #a2aec0;"
    >
      <div>解决设备「{{ active.deviceName }}」的名称重复问题</div>
    </div>
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
      <el-form-item label="解决方式" prop="type">
        <el-select
          v-model="form.type"
          filterable
          style="width:250px;"
          @change="handleChangeType"
          placeholder="请选择"
        >
          <el-option label="重命名" :value="1"></el-option>
          <el-option label="合并" :value="2"></el-option>
        </el-select>
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content" style="line-height: 18px;">
            <div>重命名：手动修改重名的设备名称</div>
            <div>合并：不新增设备，将点位关联到已存在设备</div>
          </div>
          <i
            style="margin-left: 10px;font-size: 16px;"
            class="el-icon-question"
          ></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item
        ref="formItem1"
        v-if="form.type === 1"
        label="新名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          clearable
          style="width:250px;"
          placeholder="请输入新的设备名称"
        ></el-input>
      </el-form-item>
      <el-form-item
        ref="formItem2"
        v-if="form.type === 2"
        label="合并设备"
        prop="deviceId"
      >
        <el-select
          v-model="form.deviceId"
          filterable
          style="width:250px;"
          placeholder="选择要合并的设备"
        >
          <el-option
            v-for="item in deviceOptions"
            :label="item.name"
            :key="item.key"
            :value="item.id"
          >
            <span style="float: left">{{ item.name }}</span>
            <el-link
              style="float: right; font-size: 12px"
              @click.native="() => $refs.pointDialog.openDialog(item.pointList)"
              type="primary"
              :underline="false"
              >查看点位</el-link
            >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        v-if="active.index !== 0"
        size="medium"
        @click.native="() => (active.index -= 1)"
        >上一个</el-button
      >
      <el-button size="medium" type="primary" @click.native="submitForm">{{
        active.index === Object.keys(source).length - 1 ? '确定' : '下一个'
      }}</el-button>
    </span>
    <PointDialog ref="pointDialog" />
  </el-dialog>
</template>

<script>
import PointDialog from './PointDialog'
export default {
  components: { PointDialog },
  data() {
    return {
      dialogVisible: false,

      source: {},
      active: {
        index: undefined,
        deviceName: ''
      },
      result: [],

      deviceOptions: [],
      form: {
        name: '',
        deviceId: '',
        type: 1
      },
      rules: {
        type: [{ required: true, message: '请选择', trigger: 'blur' }],
        name: [
          { required: true, message: '请输入新的设备名称', trigger: 'blur' }
        ],
        deviceId: [
          { required: true, message: '请选择要合并的设备', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    'active.index'(val) {
      if (Object.keys(this.source).length) {
        this.$nextTick(() => {
          this.$refs.form.resetFields()
          const key = Object.keys(this.source)[val]
          this.active.deviceName = key
          this.form.name = key + '_copy'
          this.deviceOptions = this.source[key].map(item => {
            return {
              name: item.Value,
              id: item.Key,
              pointList: item.Extend
            }
          })
        })
      }
    }
  },
  methods: {
    openDialog(source) {
      this.dialogVisible = true
      this.source = source
      this.active.index = 0
    },
    handleClose() {
      this.dialogVisible = false
      this.source = {}
      this.deviceOptions = []
      this.active = {
        index: undefined,
        deviceName: ''
      }
      this.result = []
      this.$refs.form.resetFields()
    },
    handleChangeType() {
      this.$nextTick(() => {
        this.$refs.formItem1.clearValidate()
        this.$refs.formItem2.clearValidate()
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { type, name, deviceId } = this.form
          this.result[this.active.index] = {
            type,
            key: this.active.deviceName,
            deviceId,
            name
          }
          // 说明修改的是最后一个
          if (this.active.index === Object.keys(this.source).length - 1) {
            this.$emit('submit', JSON.parse(JSON.stringify(this.result)))
            this.dialogVisible = false
          }
          this.active.index += 1
          this.active.deviceName = ''
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
