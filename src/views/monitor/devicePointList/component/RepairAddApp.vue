<template>
  <el-dialog
    title="新增维修工单"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    width="600px"
    @close="handleClose"
    class="repair-form"
  >
    <el-form
      ref="addForm"
      :model="addForm"
      :rules="addFormRules"
      label-width="100px"
      size="medium"
      v-loading="loading"
    >
      <el-form-item label="项目" prop="projectId">
        <el-select
          v-model="addForm.projectId"
          filterable
          placeholder="请选择项目"
          clearable
          style="width: 220px;"
          @change="changeProject"
          disabled
        >
          <el-option
            v-for="item in proList"
            :key="item.id"
            :value="item.id"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备名称" prop="device">
        <el-select
          v-model="addForm.device"
          filterable
          placeholder="请选择报修设备"
          style="width: 220px;"
          @change="changeDevice"
          :loading="deviceOptionsLoading"
          disabled
        >
          <el-option
            v-for="item in deviceOptions"
            :key="item.id"
            :label="item.mName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="故障现象" prop="fault">
        <el-input
          v-model="addForm.fault"
          type="text"
          placeholder="请输入备注"
          disabled
        />
      </el-form-item>
      <el-form-item label="备注说明" prop="remark">
        <el-input
          v-model="addForm.remark"
          type="textarea"
          placeholder="请输入备注"
        />
      </el-form-item>
      <span style="margin-left: 33px;">故障图片</span>
      <ImageList
        style="margin-left: 100px;margin-top: 15px;margin-bottom: 15px"
        @changeFile="url => (addForm.faultPhoto = url)"
      />
      <el-form-item label="维保单位" prop="maintenanceUnit">
        <el-select
          v-model="addForm.maintenanceUnit"
          filterable
          placeholder="请选择维保单位"
          style="width: 220px;"
          @change="changeMaintenanceUnit"
        >
          <el-option
            v-for="item in maintenanceUnitOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="维保人" prop="repairer">
        <el-select
          v-model="addForm.repairer"
          placeholder="请选择维保人"
          filterable
          style="width: 220px;"
        >
          <el-option
            v-for="item in repairerOptions"
            :key="item.RepairID"
            :label="item.Nickname"
            :value="item.RepairID"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="medium" @click="dialogVisible = false">取 消</el-button>
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click="submitForm('addForm')"
        >新 增</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import ImageList from '@components/ImageList'
import { getAssetsListApp } from '@/api/assets'
import {
  getBindingMaintenanceUser,
  getMaintenanceUserList,
  addRepair
} from '@/api/repairActive'
import { getMaintenanceDropdownBySubsystemId } from '@/api/maintenance'
import { getAlarmDetail } from '@/api/alarmActive'
export default {
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    }
  },
  components: {
    ImageList
  },
  data() {
    return {
      alarmId: '',
      dialogVisible: false,
      loading: false,
      deviceOptionsLoading: false,
      deviceOptions: [],
      maintenanceUnitOptions: [],
      repairerOptions: [],
      faultOptions: [],
      addForm: {
        projectId: (this.$store.state.app.project || {}).id,
        device: '',
        repairer: '',
        maintenanceUnit: '',
        fault: '',
        faultPhoto: '',
        remark: '',
        bid: '',
        sid: ''
      },
      submitLoading: false,
      addFormRules: {
        projectId: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ],
        device: [{ required: true, message: '请选择设备', trigger: 'change' }],
        repairer: [
          { required: true, message: '请选择维保人', trigger: 'change' }
        ],
        fault: [
          { required: true, message: '请选择故障现象', trigger: 'change' }
        ],
        maintenanceUnit: [
          { required: true, message: '请选择维保单位', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    proList() {
      return this.$store.state.app.proList
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  methods: {
    toggleDialog() {
      this.dialogVisible = !this.dialogVisible
    },
    editToggleDialog(Id) {
      this.dialogVisible = !this.dialogVisible
      this.loading = true
      this.alarmId = Id
      getAlarmDetail({
        alarmId: Id
      }).then(res => {
        if (res.data.Code === 200) {
          let data = res.data.Data
          this.addForm = {
            projectId: this.projectId,
            device: data.Mtid,
            repairer: '', //维保人
            maintenanceUnit: '', //维保单位
            fault: data.AlarmType,
            faultPhoto: '', //故障图片
            remark: `当前状态：${data.PValue}${data.unit}，触发规则：${data.ALARM_SETTING}，触发时间：${data.ALARM_EPOCH}` //备注
          }
          this.fetchDeviceList(data)
        }
      })
    },
    handleClose() {
      this.addForm = {
        device: '',
        repairer: '',
        maintenanceUnit: '',
        fault: '',
        faultPhoto: '',
        remark: '',
        bid: '',
        sid: ''
      }
      this.deviceOptions = []
      this.maintenanceUnitOptions = []
      this.repairerOptions = []
      this.faultOptions = []
      this.dialogVisible = false
    },
    // 选择项目
    changeProject() {
      this.deviceOptions = []
      this.maintenanceUnitOptions = []
      this.repairerOptions = []
      this.faultOptions = []
      this.addForm.device = ''
      this.addForm.maintenanceUnit = ''
      this.addForm.repairer = ''
      this.addForm.fault = ''
      this.addForm.sid = ''
      this.addForm.bid = ''

      this.deviceOptionsLoading = true
      // this.fetchDeviceList()
    },
    // 选择设备
    changeDevice(id) {
      this.maintenanceUnitOptions = []
      this.addForm.maintenanceUnit = ''
      this.repairerOptions = []
      this.addForm.repairer = ''
      this.faultOptions = []
      // 查看选中设备有没有绑定维保人
      getBindingMaintenanceUser({
        EquipmentID: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.loading = false
            if (data) {
              this.addForm.maintenanceUnit = data.MaintenanceUnit
              this.fetchMaintenanceUnitOption()
              this.addForm.repairer = data.MaintenanceUser
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
      const device = this.deviceOptions.find(item => item.id === id)
      this.addForm.bid = device.monitorID
      this.addForm.sid = device.devtypeID
      // 获取维保单位选项
      getMaintenanceDropdownBySubsystemId({
        subsystemId: this.addForm.bid,
        projectId: this.addForm.projectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.maintenanceUnitOptions = res.data.Data
          } else {
            this.maintenanceUnitOptions = []
          }
        })
        .catch(err => {
          this.maintenanceUnitOptions = []
          console.error(err)
        })
    },
    // 选择维保单位
    changeMaintenanceUnit() {
      this.repairerOptions = []
      this.addForm.repairer = ''
      this.fetchMaintenanceUnitOption()
    },
    fetchMaintenanceUnitOption() {
      getMaintenanceUserList({
        maintenanceUnitID: this.addForm.maintenanceUnit
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.repairerOptions = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchDeviceList(row) {
      getAssetsListApp({
        ProjectIdList: [this.addForm.projectId],
        DeviceNameOrAssetsCode: '',
        PageIndex: 1,
        PageSize: 10000
      })
        .then(res => {
          let data = res.data.Data.Data
          this.deviceOptions = data
          if (row.Mtid) {
            this.changeDevice(row.Mtid)
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.deviceOptionsLoading = false
        })
    },
    // 提交表单
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submitLoading = true
          const {
            projectId,
            maintenanceUnit,
            repairer,
            fault,
            remark,
            faultPhoto,
            device
          } = this.addForm
          let data = {
            ProjectID: projectId,
            MaintenanceUnit: maintenanceUnit,
            MaintenanceUser: repairer,
            FaultDescribe: fault,
            Remarks: remark,
            FaultPhoto: faultPhoto,
            Applicant: this.userId,
            EquipmentID: device,
            ALARM_ACTIVE_ID: this.alarmId
          }
          addRepair(data)
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('报修成功')
                this.dialogVisible = false
                this.$emit('complete', this.alarmId)
              } else {
                this.$message.error('报修失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('报修失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.repair-form {
  .el-upload-list__item {
    width: 80px;
    height: 80px;
  }
  .el-upload--picture-card {
    width: 80px;
    height: 80px;
    line-height: 80px;
  }
}
</style>
