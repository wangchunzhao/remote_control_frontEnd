<template>
  <el-dialog
    width="360px"
    title=""
    custom-class="device-filter-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="100px" size="small">
      <el-form-item label="数据网关" prop="source">
        <el-select
          v-model="form.source"
          clearable
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in sourceOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="原始设备名称" prop="devices">
        <el-select
          v-model="form.devices"
          clearable
          multiple
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
      <el-form-item label="类型" prop="types">
        <el-select
          v-model="form.types"
          clearable
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in pointTypeOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="等级" prop="levels">
        <el-select
          v-model="form.levels"
          multiple
          filterable
          clearable
          placeholder="请选择"
        >
          <el-option label="一级" :value="1"></el-option>
          <el-option label="二级" :value="2"></el-option>
          <el-option label="三级" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联设备" prop="associateDevices">
        <el-cascader
          v-model="form.associateDevices"
          :options="associateDeviceOptions"
          :props="{
            multiple: true,
            emitPath: false,
            children: 'Children',
            label: 'Value',
            value: 'Key'
          }"
          clearable
          filterable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="关联区域" prop="associateArea">
        <el-cascader
          v-model="form.associateArea"
          :options="associateAreaOptions"
          :props="{
            checkStrictly: true,
            multiple: true,
            emitPath: false,
            children: 'Child',
            label: 'mname',
            value: 'mtid'
          }"
          clearable
          filterable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="报警配置" prop="cycle">
        <el-radio v-model="form.isAlarmConfig" :label="true">已配置</el-radio>
        <el-radio v-model="form.isAlarmConfig" :label="false">未配置</el-radio>
        <el-link
          @click.native="() => (form.isAlarmConfig = undefined)"
          :underline="false"
          type="info"
        >
          <i class="el-icon-close"></i>
        </el-link>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button size="small" type="primary" @click.native="submitForm"
        >筛 选</el-button
      >
      <el-button
        size="small"
        type="text"
        @click.native="handleReset"
        style="font-size: 14px;"
      >
        <c-svg style="font-size: 15px;" name="undo" />
        重置筛选</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import {
  getPointPageDropdownList,
  getSubsystemAndModelTreeDropdownList
} from '@/api/point'
import { modelTrees } from '@/api/model_new'

export default {
  data() {
    return {
      dialogVisible: false,

      form: {
        source: [],
        devices: [],
        types: [],
        levels: [],
        associateDevices: [],
        associateArea: [],
        isAlarmConfig: undefined
      },
      sourceOptions: [],
      deviceOptions: [],
      associateAreaOptions: [],
      associateDeviceOptions: [],
      pointTypeOptions: []
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.fetchOptions()
    this.fetchAreaOptions()
    this.fetchassociateDeviceOptions()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleReset() {
      this.form = {
        source: [],
        devices: [],
        types: [],
        levels: [],
        associateDevices: [],
        associateArea: [],
        isAlarmConfig: undefined
      }
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    submitForm() {
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    fetchOptions() {
      getPointPageDropdownList({
        projectId: this.projectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.pointTypeOptions = data.PointTypeList
            this.deviceOptions = data.NameList
            this.sourceOptions = data.DeviceList
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchassociateDeviceOptions() {
      getSubsystemAndModelTreeDropdownList({ projectId: this.projectId }).then(
        res => {
          if (res.data.Code === 200) {
            this.associateDeviceOptions = res.data.Data
            this.associateDeviceOptions.unshift({
              Key: 0,
              Value: '未关联'
            })
          }
        }
      )
    },
    fetchAreaOptions() {
      modelTrees({
        projectId: this.projectId,
        isGetModelTree: false
      }).then(res => {
        if (res.data.Code === 200) {
          this.associateAreaOptions = res.data.Data
          this.associateAreaOptions.push({
            mtid: 0,
            mname: '未关联'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.device-filter-dialog {
  .el-dialog__header {
    display: none;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
