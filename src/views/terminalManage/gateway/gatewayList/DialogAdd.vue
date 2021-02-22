<template>
  <el-dialog
    width="620px"
    title="添加网关"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    custom-class="gateway-add-dialog"
  >
    <div v-if="!isSuccess">
      <el-alert
        v-if="form.isCG100"
        close-text="故障排查"
        title="添加前请确认网关处于上电状态，且指示灯为绿色常亮"
        type="info"
        show-icon
        @close="onClickAlertClose"
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
          <el-input clearable v-model="form.sn" placeholder="请输入"></el-input>
          <el-tooltip effect="light" placement="right">
            <img
              style="width: 216px;height: 120px;border-radius: 5px;"
              slot="content"
              src="https://cdn.sinocold.net/images_app/QRCode.png"
              alt=""
            />
            <c-svg
              style="position: absolute;top: 9px; right: -30px;;font-size: 18px;color: rgba(0,0,0,0.3); cursor: pointer;"
              name="info-circle-fill"
            />
          </el-tooltip>
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
          <el-input v-model.trim="form.account" clearable autocomplete="off" />
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
          <el-input
            v-model.trim="form.pwd"
            clearable
            autocomplete="off"
            show-password
          />
        </el-form-item>
        <el-form-item label="所属项目：" prop="project">
          <el-select
            v-model="form.project"
            :disabled="projectDisabled"
            filterable
            clearable
            placeholder="请选择"
            style="width: 100%;"
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div v-else class="success-result">
      <c-svg name="check-circle-fill"></c-svg>
      <h4>网关添加成功</h4>
      <div class="desc">请前往网关详情页面进行点位通讯配置</div>
      <div style="margin-bottom: 50px;">
        <el-button @click.native="goConfig" size="small" type="primary"
          >配置通讯</el-button
        >
        <el-button @click="handleClose" size="small" plain>返回列表</el-button>
      </div>
    </div>
    <span v-if="!isSuccess" slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >添 加</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import {
  ckDeviceNo,
  addDevicesNewModbus,
  verifyDevice,
  deviceAddMQTT,
  addDevicePoint,
  getDeviceNumRule
} from '@/api/device_new'
import { randomString } from '@/utils/index'
import { checkModbusGatewaySN, parseSN } from '@/utils/sensor'

let snParseOptions = {}
export default {
  props: {
    projectDisabled: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    showSuccess: {
      type: Boolean,
      default: function() {
        return true
      }
    }
  },
  data() {
    const checkNO = (rule, value, callback) => {
      if (this.form.type === 3) {
        // mqtt网关序列号
        if (
          /^[A-Z][A-Z\d]{9}$/.test(value) ||
          /^[A-Z][A-Z0-9]{15}$/.test(value)
        ) {
          callback()
        } else {
          callback(
            new Error(
              '10位（由大写字母、数字组成，字母开头）或 16位（由大写字母、数字组成，字母开头）'
            )
          )
        }
      } else {
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
    }
    return {
      dialogVisible: false,
      submitLoading: false,
      isSuccess: false,
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
        version: '', // 如果版本是 E, 则可以自定义网关点位，而不一定要用从站设备配置
        isCG100: false
      },
      addGatewayId: undefined,
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        sn: [
          { required: true, message: '请输入网关序列号', trigger: 'blur' },
          { validator: checkNO, trigger: 'blur' }
        ]
      },
      PLATFORM
    }
  },
  watch: {
    'form.sn'(val) {
      if (val.length === 16) {
        if (checkModbusGatewaySN(val)) {
          const res = parseSN(val, snParseOptions)
          this.form.stopBit = res.stopBit
          this.form.checkBit = res.checkBit
          this.form.dataBit = res.dataBit
          this.form.baudRate = res.baudRate
          this.form.version = res.version
          switch (res.gatewayType) {
            case 'MQTT':
              this.form.type = 3
              break
            case 'Modbus TCP':
              this.form.type = 2
              break
            case 'Modbus RTU':
              this.form.type = 1
              break
            default:
              break
          }
          this.form.name =
            res.deviceType +
            '-' +
            randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
          this.form.isCG100 = res.isCG100
        }
      }
    }
  },
  computed: {
    projectOptions() {
      return this.$store.state.app.proList
    },
    platform() {
      return this.$store.state.permissions.platform
    },
    projectId() {
      return (this.$store.state.app.project || {}).id
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    userId() {
      return this.$store.state.app.userInfo.uid
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
    openDialog() {
      this.dialogVisible = true
      if (this.projectDisabled === true) {
        this.form.project = this.projectId
      }
    },
    handleClose() {
      this.isSuccess = false
      this.form = Object.assign(this.form, {
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
        version: '',
        isCG100: false
      })
      this.addGatewayId = undefined
      this.$nextTick(() => {
        this.dialogVisible = false
      })
    },
    onClickAlertClose() {
      window.open(
        'https://thoughts.teambition.com/share/5f2cb53171752d0016369b6b#title=CG100_系列网关常见故障排查',
        '_blank'
      )
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
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
            baudRate,
            version
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
              CompanyId: this.companyId,
              pid: project || undefined,
              BaudRate: baudRate,
              DataBit: dataBit,
              CheckBit: checkBit,
              StopBit: stopBit,
              DeviceTypeE: version === 'E' ? 1 : 0
            })
              .then(res => {
                const data = res.data
                if (data.Code === 200 && data.Data > 0) {
                  this.addGatewayId = data.Data
                  this.$emit('refresh', data.Data)
                  if (this.showSuccess) {
                    this.isSuccess = true
                  } else {
                    this.dialogVisible = false
                  }
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
                    CompanyId: this.companyId
                  })
                    .then(res => {
                      if (res.data.Code === 200) {
                        this.addGatewayId = res.data.Data
                        this.isSuccess = true
                        this.$emit('refresh')
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
              CompanyId: this.companyId
            })
              .then(res => {
                if (res.data.Code === 200) {
                  this.addGatewayId = res.data.Data
                  this.isSuccess = true
                  this.$emit('refresh')
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
    goConfig() {
      this.dialogVisible = false
      this.$router.push({
        name: 'gatewayDetail',
        query: {
          data: JSON.stringify({
            id: this.addGatewayId
          }),
          tabActiveName: 'second'
        }
      })
    }
  }
}
</script>

<style lang="scss">
div.gateway-add-dialog {
  .el-dialog__body {
    padding-top: 10px;
  }
  .el-alert {
    background-color: #e6f7ff;
    border: 1px solid rgba(145, 213, 255, 1);
    color: rgba(0, 0, 0, 0.65);
  }
  .el-alert__icon {
    color: #1890ff;
  }
  .is-customed.el-alert__closebtn {
    color: #1890ff;
  }
  .success-result {
    text-align: center;
    margin-top: 40px;
    .icon {
      font-size: 70px;
      color: #52c41a;
    }
    h4 {
      font-size: 24px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .desc {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 30px;
    }
  }
}
</style>
