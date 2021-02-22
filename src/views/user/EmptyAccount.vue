<template>
  <div class="emptyAccount">
    <div v-if="step === 1" class="add-gateway-form">
      <h4 class="section-title">添加网关</h4>
      <el-alert
        v-if="form.isCG100"
        close-text="故障排查"
        title="添加前请确认网关处于上电状态，且指示灯为绿色常亮"
        type="info"
        show-icon
      >
      </el-alert>
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        style="width: 360px;margin: auto;margin-top: 16px;"
        label-width="110px"
        size="medium"
      >
        <el-form-item label="网关序列号：" prop="sn">
          <el-input v-model="form.sn" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="网关类型：" prop="type">
          <el-select
            v-model="form.type"
            filterable
            placeholder="请选择"
            style="width: 100%;"
          >
            <el-option label="Modbus网关" :value="1" />
            <el-option label="TCP网关" :value="2" />
            <el-option label="MQTT网关" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="网关名称：" prop="name">
          <el-input
            v-model="form.name"
            clearable
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item
          v-if="form.type === 3"
          label="网关用户名"
          prop="account"
          :rules="[
            {
              required: form.type === 3,
              message: '请输入网关用户名',
              trigger: 'blur'
            }
          ]"
        >
          <el-input v-model.trim="form.account" autocomplete="off" />
          <input type="text" style="position: absolute;top: -1000px;" />
        </el-form-item>
        <el-form-item
          v-if="form.type === 3"
          label="网关密码"
          prop="pwd"
          :rules="[
            {
              required: form.type === 3,
              message: '请输入网关密码',
              trigger: 'blur'
            }
          ]"
        >
          <input type="password" style="position: absolute;top: -1000px;" />
          <el-input v-model.trim="form.pwd" autocomplete="off" show-password />
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="submitLoading"
            @click.native="submitGatewayForm"
            style="margin-left: 30px"
            type="primary"
            >添 加 网 关</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div
      v-loading="bindLoading"
      v-if="step === 2"
      element-loading-text="正在将项目与网关绑定"
      class="add-project-form"
    >
      <h4 class="section-title">添加项目并绑定网关</h4>
      <ProjectEditForm
        :isRefresh="false"
        :companyIdProp="1"
        @complete="id => gatewayBindProject(id)"
        :subareaOptionsProp="[
          { SubareaName: '秦骏（上海）实业有限公司', SubareaId: 1 }
        ]"
        ref="projectEditForm"
      />
    </div>
  </div>
</template>

<script>
import {
  ckDeviceNo,
  addDevicesNewModbus,
  verifyDevice,
  deviceAddMQTT,
  addDevicePoint,
  getDeviceNumRule,
  updateProjectDevices
} from '@/api/device_new'
import { randomString } from '@/utils/index'
import { checkModbusGatewaySN, parseSN } from '@/utils/sensor'
import ProjectEditForm from '@/components/ProjectEditForm'

let snParseOptions = []
export default {
  components: {
    ProjectEditForm
  },
  data() {
    const checkNO = (rule, value, callback) => {
      if (/^[A-Z][A-Z0-9]{15}$/.test(value)) {
        ckDeviceNo({
          deviceno: value
        }).then(res => {
          if (res.data.Data.IsSuccess) {
            callback(new Error('该序列号已存在'))
          } else {
            callback()
          }
        })
      } else {
        callback(new Error('16位（由大写字母、数字组成，字母开头）'))
      }
    }
    return {
      submitLoading: false,
      bindLoading: false,
      step: 1,
      form: {
        sn: '',
        type: 1,
        name: '',
        pwd: '',
        account: '',
        project: undefined,
        stopBit: '',
        checkBit: '',
        dataBit: '',
        baudRate: '',
        isCG100: false
      },
      addGatewayId: undefined,
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        sn: [
          { required: true, message: '请输入网关序列号', trigger: 'blur' },
          { validator: checkNO, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  watch: {
    watch: {
      'form.sn'(val) {
        if (this.form.type === 1 && val.length === 16) {
          if (checkModbusGatewaySN(val)) {
            const res = parseSN(val, snParseOptions)
            this.form.stopBit = res.stopBit
            this.form.checkBit = res.checkBit
            this.form.dataBit = res.dataBit
            this.form.baudRate = res.baudRate
            this.form.name =
              res.deviceType +
              '-' +
              randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            this.form.isCG100 = res.isCG100
          }
        }
      }
    }
  },
  mounted() {
    getDeviceNumRule({
      deviceTypeList: ['BaudRate', 'DataCheckStopBit', 'SmallType', 'Function']
    }).then(res => {
      if (res.data.Code === 200) {
        const data = res.data.Data
        snParseOptions = {
          baudRateOptions: data.BaudRate,
          dataCheckStopBitOptions: data.DataCheckStopBit,
          smallTypeOptions: data.SmallType,
          functionOptions: data.Function
        }
      }
    })
  },
  methods: {
    submitGatewayForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const {
            sn,
            type,
            name,
            pwd,
            account,
            project,
            stopBit,
            dataBit,
            checkBit,
            baudRate
          } = this.form
          if (type === 1) {
            // modbus 网关
            this.submitLoading = true
            addDevicesNewModbus({
              DeviceModuleAndAddressList: [],
              deviceId: undefined,
              remark: sn,
              deviceName: name,
              DeviceAddress: '',
              CompanyId: undefined,
              pid: project,
              BaudRate: baudRate,
              DataBit: dataBit,
              CheckBit: checkBit,
              StopBit: stopBit
            })
              .then(res => {
                const data = res.data
                if (data.Code === 200 && data.Data > 0) {
                  this.addGatewayId = data.Data
                  this.step = 2
                } else {
                  this.$message.error('网关添加失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('网关添加失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else if (type === 3) {
            // mqtt 网关
            this.submitLoading = true
            verifyDevice({
              deviceNo: sn,
              deviceUserName: account,
              deviceUserPwd: pwd
            })
              .then(res => {
                const data = res.data
                if (data.Code === 200) {
                  this.addGatewayId = data.Data
                  deviceAddMQTT({
                    deviceName: name,
                    deviceNo: sn,
                    deviceUserName: account,
                    deviceUserPwd: pwd,
                    pid: project,
                    uid: this.userId,
                    CompanyId: undefined
                  })
                    .then(res => {
                      const data = res.data
                      if (data.Code === 200) {
                        this.$emit('refresh')
                        this.step = 2
                      }
                    })
                    .catch(err => {
                      console.error(err)
                      this.$message.error('网关添加失败')
                    })
                    .finally(() => {
                      this.submitLoading = false
                    })
                } else {
                  this.$message.error(data.Message)
                  this.submitLoading = false
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else if (type === 2) {
            // tcp 网关
            this.submitLoading = true
            addDevicePoint({
              PointList: [],
              DvcName: name,
              DvcNo: sn,
              ProjectID: project,
              CompanyId: undefined
            })
              .then(res => {
                if (res.data.Code === 200) {
                  this.addGatewayId = res.data.Data
                  this.step = 2
                } else {
                  this.$message.error('网关添加失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('网关添加失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          }
        } else {
          console.log('error submit!!')
        }
      })
    },
    gatewayBindProject(projectId) {
      if (!projectId) {
        return
      }
      this.bindLoading = true
      updateProjectDevices({
        deviceID: this.addGatewayId,
        projectId: projectId
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            if (data.Data.IsSuccess) {
              this.$message.success('绑定成功')
              this.$store
                .dispatch('fetchCompanyList', { uid: this.userId })
                .then(() => {
                  this.$store
                    .dispatch('fetchProject', { uid: this.userId })
                    .then(() => {
                      this.$router.push({ name: 'mapIndex' })
                    })
                })
                .catch(err => {
                  console.error(err)
                })
                .finally(() => {
                  this.loading = false
                })
            } else {
              this.$message.error('项目绑定网关失败')
            }
          } else {
            this.$message.error('项目绑定网关失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('项目绑定网关失败')
        })
        .finally(() => {
          this.bindLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.emptyAccount {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #324157;
  .section-title {
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    margin-top: 30px;
  }
  .add-gateway-form {
    width: 450px;
    background-color: #fff;
    border-radius: 4px;
  }
  .add-project-form {
    padding: 0 30px 30px 30px;
    width: 650px;
    background-color: #fff;
    border-radius: 4px;
  }
}
</style>
