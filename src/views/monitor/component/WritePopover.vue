<template>
  <el-popover
    popper-class="write-popover"
    placement="top"
    title="远程写入"
    v-model="visible"
    width="200"
    trigger="click"
    @hide="handlePopoverHide"
  >
    <div>
      <el-form :model="form" :rules="rules" ref="form" label-width="0">
        <el-form-item label="" prop="value">
          <el-input
            placeholder="请输入远程写入值"
            size="mini"
            clearable
            v-model="form.value"
          ></el-input>
        </el-form-item>
      </el-form>
      <div style="text-align: right; margin-right: 16px">
        <el-button size="mini" type="text" @click="visible = false"
          >取消</el-button
        >
        <el-button
          :loading="loading"
          type="primary"
          size="mini"
          @click="submitForm"
          >确定</el-button
        >
      </div>
    </div>
    <el-button style="padding: 5px 10px;" type="text" slot="reference"
      >写入</el-button
    >
  </el-popover>
</template>

<script>
import { writeGateway } from '@/api/device_new'
import mqtt from 'mqtt'
import { getPointConfig } from '@/api/device_new'
import { addLog } from '@/api/log'
export default {
  props: {
    id: Number,
    type: String,
    pointInfo: Object,
    project: String
  },
  data() {
    var validateValue = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入数值'))
      } else {
        // 例如: 100, -0.99, 3, 234.32, -1, 900, 235.09, 12,345,678.90
        if (/^-?\d+(,\d{3})*(\.\d{1,6})?$/.test(value)) {
          callback()
        } else {
          callback(new Error('请输入数值'))
        }
      }
    }
    return {
      visible: false,
      loading: false,
      form: {
        value: ''
      },
      rules: {
        value: [
          { required: true, message: '请输入数值', trigger: 'blur' },
          { validator: validateValue, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
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
  methods: {
    // handleTextChange(val) {
    //   this.form.value = val.replace(/[^-\d.]/g, '')
    // },
    handlePopoverHide() {
      this.form.value = ''
      this.$refs.form.resetFields()
      // 如果是mqtt网关，关闭websocket连接
      this.mqttClient && this.mqttClient.end()
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          if (this.type === 'MQTT') {
            try {
              this.handleAddLog(this.form.value)
              // 关闭之前的websocket连接
              this.mqttClient && this.mqttClient.end()
              this.loading = true
              // 读取 mqtt 网关配置数据，
              const confitRes = await getPointConfig({
                pointID: this.id
              })
              let configSpec = null
              if (confitRes.data.Code === 200) {
                configSpec = confitRes.data.Data
              } else {
                this.$message.error('配置信息获取失败')
                this.loading = false
                return
              }

              this.mqttClient = mqtt.connect(
                'wss:mqtt.coolcare.link:8084/mqtt',
                {
                  connectTimeout: 40000, // 超时时间
                  // 认证信息
                  clientId: `mqttjs_${Math.random()
                    .toString(16)
                    .substr(2, 10)}_${this.userId}`,
                  username: 'webclient',
                  password: 'webclient.coolcare@Sinocold'
                }
              )
              this.mqttClient.on('error', error => {
                this.$message.error('与服务器连接失败')
                this.loading = false
                console.error('连接失败:', error)
              })

              // 订阅配置/控制/重启指令的响应
              this.mqttClient.on('connect', () => {
                this.mqttClient.subscribe(
                  `gw/mq/${configSpec.DESCRIBES}/response`,
                  { qos: 1 },
                  error => {
                    if (error) {
                      console.error(error)
                    }
                  }
                )

                // mqtt网关的写入操作
                const deviceCode = configSpec.MONITORY_ADDR.split('.')[0]
                const tagCode = configSpec.MONITORY_ADDR.replace(
                  deviceCode + '.',
                  ''
                )
                const payload = [
                  {
                    operate: 'write',
                    deviceCode: deviceCode,
                    tagCode: tagCode,
                    val: this.form.value
                  }
                ]
                // 下发指令
                this.mqttClient.publish(
                  `gw/mq/${configSpec.DESCRIBES}/service`,
                  JSON.stringify(payload),
                  error => {
                    if (error) {
                      this.$message('指令下发失败')
                      this.loading = false
                      console.error(error)
                    }
                  }
                )
                // 写指令下发后，如果写操作30秒内没有返回，则主动去查询实时数据
                let timer = setTimeout(() => {
                  this.subscribeRealTimeData(
                    this.mqttClient,
                    configSpec.DESCRIBES,
                    deviceCode,
                    tagCode
                  )
                }, 30 * 1000)
                this.mqttClient.on('message', (topic, message) => {
                  const res = JSON.parse(message.toString())
                  // topic eg: gw/mq/QM23140202/response
                  if (topic.includes('/response') && res.message) {
                    // 写操作有message这个字段返回
                    clearTimeout(timer)
                    if (res.status !== undefined) {
                      // 新版本mqtt网关有status这个字段返回
                      if (res.status === true) {
                        this.$message.success('指令下发成功')
                        this.visible = false
                        this.loading = false
                      } else {
                        this.$message('指令下发失败')
                      }
                    } else {
                      // 老版本mqtt网关没有status这个字段返回
                      this.$message.success('指令下发成功')
                      this.visible = false
                      this.loading = false
                    }
                    this.loading = false
                  }
                  if (res.time) {
                    // 订阅的实时消息有time这个字段
                    if (res[deviceCode][tagCode] == this.form.value) {
                      this.$message.success('指令下发成功')
                      this.visible = false
                      this.loading = false
                    } else {
                      this.$message('操作失败')
                    }
                    // 查询到实时数据后直接取消订阅
                    this.mqttClient.unsubscribe(
                      `gw/mq/${configSpec.DESCRIBES}/realtime/#`
                    )
                  }
                })
              })
            } catch (err) {
              console.error(err)
              this.$message('指令下发失败')
            }
          } else if (this.type === 'Modbus RTU') {
            this.loading = true
            writeGateway({
              pointID: this.id,
              writeData: this.form.value
            })
              .then(res => {
                if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                  this.$message.success('指令下发成功')
                } else {
                  this.$message('指令下发失败')
                }
              })
              .catch(err => {
                console.error(err)
              })
              .finally(() => {
                this.visible = false
                this.loading = false
              })
          }
        } else {
          return false
        }
      })
    },
    // 订阅一个点位的实时数据
    subscribeRealTimeData(mqttClient, DESCRIBES, deviceCode, tagCode) {
      mqttClient.publish(
        `gw/mq/${DESCRIBES}/inquire`,
        JSON.stringify({
          operate: 'read',
          devices: [
            {
              deviceCode: deviceCode,
              tags: [{ tagCode: tagCode }]
            }
          ]
        })
      )
      // 订阅一个主题(点位实时数据)
      mqttClient.subscribe(
        `gw/mq/${DESCRIBES}/realtime/#`,
        { qos: 1 },
        error => {
          if (error) {
            // ('订阅成功')
            console.log('订阅realtime失败：', error)
          }
        }
      )
    },
    handleAddLog(writeValue) {
      const { mname, pname } = this.pointInfo
      addLog({
        CompanyId: this.companyId,
        ProjectId: this.project || this.projectId,
        LogModelId: 6,
        LogModelActionId: 32,
        LogModelActionName: '远程参数修改',
        Content: `对 ${mname} / ${pname} 写入值 ${writeValue}`,
        RequestContent: `pointID=${this.id}&writeData=${writeValue}`
      }).catch(() => {
        console.log(
          `日志：『对 ${mname} / ${pname} 写入值 ${writeValue}』生成失败`
        )
      })
    }
  }
}
</script>

<style lang="scss">
.write-popover {
  padding: 0;
  padding-bottom: 16px;
  .el-popover__title {
    height: 30px;
    margin: 0;
    padding-left: 16px;
    line-height: 30px;
    font-weight: 500;
    border-bottom: 1px solid rgba(0, 0, 0, 0.09);
    font-size: 14px;
  }
  .el-form {
    padding: 16px;
    padding-bottom: 0;
  }
}
</style>
