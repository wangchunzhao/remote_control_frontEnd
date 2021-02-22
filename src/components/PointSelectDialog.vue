<template>
  <el-dialog
    width="400px"
    title="添加对比点位"
    :visible.sync="dialogVisible"
    append-to-body
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
      <el-form-item label="子系统:" prop="system">
        <el-select
          v-model="form.system"
          @change="handleSystemChange"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in systemOptions"
            :key="item.BigTypeId"
            :label="item.name"
            :value="item.BigTypeId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备:" prop="device">
        <el-select
          v-model="form.device"
          :loading="deviceLoading"
          @change="handleDeviceChange"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in deviceOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位:" prop="point">
        <el-select
          v-model="form.point"
          :loading="pointLoading"
          multiple
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in pointOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
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
import {
  getModelListByProject,
  getModelTreeAndPointTypeDropdown,
  queryPoint
} from '@/api/model'
import { getPointModelTreeSysInfo } from '@/api/point'
export default {
  props: {
    pointIds: {
      type: Array,
      default: function() {
        return []
      }
    },
    projectId: Number
  },
  data() {
    return {
      dialogVisible: false,
      systemOptions: [],
      deviceOptions: [],
      deviceLoading: false,
      pointOptions: [],
      pointLoading: false,

      form: {
        system: '',
        device: '',
        point: []
      },
      rules: {
        system: [{ required: true, message: '请选择', trigger: 'change' }],
        device: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    }
  },
  watch: {
    pointIds: {
      handler: function(val) {
        if (val.length) {
          getPointModelTreeSysInfo({
            pointId: val[0]
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data.length) {
                const data = res.data.Data[0]
                this.form.system = data.pid
                this.fetchDeviceOptions()
                this.form.device = data.id
                this.fetchPointOptions()
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
      },
      immediate: true
    }
  },
  computed: {
    platform() {
      return this.$store.state.permissions.platform
    }
    // projectId() {
    //   return this.$store.state.app.project.id
    // }
  },
  mounted() {
    if (this.platform === PLATFORM.business) {
      this.form.project = this.projectId
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchSystemOptions()
    },
    handleClose() {
      this.dialogVisible = false
    },
    clearCache() {
      this.systemOptions = []
      this.deviceOptions = []
      this.pointOptions = []
      this.form.point = []
      this.form.device = ''
      this.form.system = ''
    },
    handleSystemChange(val) {
      if (val) {
        this.fetchDeviceOptions()
      }
      this.deviceOptions = []
      this.pointOptions = []
      this.form.device = ''
      this.form.point = []
    },
    handleDeviceChange(val) {
      if (val) {
        this.fetchPointOptions()
      }
      this.pointOptions = []
      this.form.point = []
    },
    fetchSystemOptions() {
      const { project } = this.form
      getModelListByProject({
        projectId: project
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.systemOptions = res.data.Data
          } else {
            this.systemOptions = []
          }
        })
        .catch(err => {
          console.error(err)
          this.systemOptions = []
        })
    },
    fetchDeviceOptions() {
      this.deviceLoading = true
      const { project, system } = this.form
      getModelTreeAndPointTypeDropdown({
        bigTypeId: system,
        projectId: project
      })
        .then(res => {
          if (res.data.Code === 200) {
            if (res.data.Data) {
              this.deviceOptions = res.data.Data.ModelTreeDropdown
            }
          } else {
            this.deviceOptions = []
          }
        })
        .catch(err => {
          console.error(err)
          this.deviceOptions = []
        })
        .finally(() => {
          this.deviceLoading = false
        })
    },
    fetchPointOptions() {
      const { project, system, device } = this.form
      this.pointLoading = true
      queryPoint({
        mtid: device,
        mtidList: undefined,
        BigTypeId: system,
        ProjectId: project,
        LevelList: undefined,
        PointStatusList: undefined,
        PointTypeIdList: undefined,
        area: undefined,
        name: undefined,
        stime: undefined,
        etime: undefined,
        typeCn: undefined,
        alarmLevel: undefined,
        IsGetPointRelevance: false,
        SortType: undefined,
        IsAsc: undefined,
        PageIndex: 1,
        PageSize: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.pointOptions = res.data.Data.Data
          } else {
            this.pointOptions = []
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.pointLoading = false
        })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { point } = this.form
          this.$emit('submit', point)
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
