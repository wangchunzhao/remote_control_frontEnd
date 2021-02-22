<template>
  <el-dialog
    width="560px"
    title="添加摄像头"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    custom-class="add-camera-dialog"
    :append-to-body="true"
  >
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="添加方式"> </el-step>
      <el-step title="设备信息"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive == 0" style="margin: 40px 40px 0 40px;">
      <div style="text-align: center;">
        <el-select
          v-model="pid"
          placeholder="请选择项目"
          style="margin-bottom: 35px;"
          v-if="!projectId"
          size="medium"
          clearable
          filterable
        >
          <el-option
            v-for="item in proList"
            :key="item.id"
            :value="item.id"
            :label="item.label"
          />
        </el-select>
      </div>

      <div class="add-way-row" style="margin-bottom: 30px;">
        <el-radio v-model="addWay" :label="1" size="medium" border
          >通过设备编号添加</el-radio
        >
        <div class="way-desc">
          支持添加海康萤石或大华乐橙的网络摄像头和NVR设备
        </div>
      </div>
      <div class="add-way-row">
        <el-radio v-model="addWay" :label="2" size="medium" border
          >通过监控地址添加</el-radio
        >
        <div class="way-desc">
          直接输入视频流地址来添加摄像头点位
        </div>
      </div>
    </div>
    <div v-if="stepActive === 1">
      <el-form
        :model="form1"
        ref="form1"
        v-if="addWay === 1"
        label-width="100px"
        size="medium"
        style="margin: 40px 50px 0 50px;"
      >
        <el-form-item
          label="应用密钥"
          prop="secret"
          :rules="[
            {
              required: true,
              message: '请选择',
              trigger: 'change'
            }
          ]"
        >
          <el-select
            v-model="form1.secret"
            clearable
            filterable
            style="width: 240px;"
            placeholder="请选择"
          >
            <el-option
              v-for="item in secretOptions"
              :label="item.Value"
              :value="item.Key"
              :key="item.Key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in form1.deviceNos"
          :label="'设备编号' + (index + 1)"
          :key="index"
          :prop="'deviceNos.' + index + '.value'"
          :rules="[
            {
              required: true,
              message: '请输入',
              trigger: 'blur'
            },
            { validator: checkDeviceNo, trigger: 'blur' }
          ]"
        >
          <el-input
            v-model="item.value"
            size="small"
            clearable
            style="width: 240px;"
            placeholder="请输入"
          ></el-input>

          <el-button
            class="btn-danger"
            type="text"
            v-if="form1.deviceNos.length !== 1"
            style="padding: 6px;"
            @click.native="
              () => {
                form1.deviceNos.splice(index, 1)
              }
            "
          >
            <i
              class="el-icon-remove"
              style="font-size: 18px;margin-left: 5px;"
            />
          </el-button>
        </el-form-item>
        <el-button
          @click.native="
            () => {
              form1.deviceNos.push({ value: '' })
            }
          "
          type="text"
          icon="el-icon-plus"
          style="margin-left: 10px;"
          >增加设备</el-button
        >
      </el-form>
      <el-form
        :model="form2"
        ref="form2"
        v-if="addWay === 2"
        label-width="80px"
        size="medium"
        style="margin: 40px 0px 0 0px;"
      >
        <el-form-item
          v-for="(item, index) in form2.items"
          :label="'摄像头' + (index + 1)"
          :key="index"
          required
          style="margin-bottom: 0"
        >
          <el-col :span="8">
            <el-form-item
              :prop="'items.' + index + '.pointName'"
              :rules="[
                {
                  required: true,
                  message: '请输入',
                  trigger: 'blur'
                }
              ]"
            >
              <el-input
                v-model="item.pointName"
                size="small"
                clearable
                placeholder="点位名称"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">&nbsp;</el-col>
          <el-col :span="13">
            <el-form-item
              :prop="'items.' + index + '.url'"
              :rules="[
                {
                  required: true,
                  message: '请输入',
                  trigger: 'blur'
                },
                {
                  pattern: /^https?:\/\/(.+\/)+.+(\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|m3u8|mp4))$/i,
                  message: '请输入正确的视频链接地址',
                  trigger: 'blur'
                }
              ]"
            >
              <el-input
                v-model="item.url"
                size="small"
                clearable
                placeholder="视频流地址"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-button
              class="btn-danger"
              type="text"
              v-if="form2.items.length !== 1"
              style="padding: 6px;"
              @click.native="
                () => {
                  form2.items.splice(index, 1)
                }
              "
            >
              <i
                class="el-icon-remove"
                style="font-size: 18px;margin-left: 5px;"
              />
            </el-button>
          </el-col>
        </el-form-item>
        <el-button
          @click.native="
            () => {
              form2.items.push({ pointName: '', url: '' })
            }
          "
          type="text"
          icon="el-icon-plus"
          style="margin-left: 10px;"
          >增加设备</el-button
        >
      </el-form>
    </div>

    <div v-if="stepActive === 2" style="text-align: center;margin: 40px auto;">
      <i
        style="font-size: 52px;color: rgba(82, 196, 26, 1);"
        class="el-icon-success"
      ></i>
      <div style="font-weight: bold;margin: 10px 0;font-size: 16px;">
        添加完成
      </div>
      <div style="color:rgba(0,0,0,.45);">
        已成功添加
        {{ addWay === 1 ? successCount : form2.items.length }}
        个摄像头点位
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button
        v-if="stepActive === 0"
        size="medium"
        type="primary"
        @click.native="handleNext"
        >下一步</el-button
      >
      <el-button
        v-if="stepActive === 1"
        size="medium"
        @click.native="() => (stepActive -= 1)"
        >上一步</el-button
      >
      <el-button
        v-if="stepActive === 1"
        size="medium"
        type="primary"
        @click.native="submitForm"
        :loading="submitLoading"
        >添 加</el-button
      >
      <el-button
        v-if="stepActive === 2"
        size="medium"
        type="primary"
        @click.native="handleClose"
        >返 回</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import {
  getVideoMonitorApplicationDropdown,
  getDeviceAddress
} from '@/api/videoMonitorApplication'
import { batchAddVideoMonitorPoint } from '@/api/videoMonitorPoint'
export default {
  props: {
    projectId: Number
  },
  data() {
    const checkDeviceNo = (rule, value, callback) => {
      if (!this.form1.secret) {
        callback(new Error('请先选择应用密钥'))
        return false
      }
      getDeviceAddress({
        videoMonitorApplicationId: this.form1.secret,
        deviceSerial: value
      })
        .then(res => {
          if (res.data.Code === 200) {
            const index = rule.field.split('.')[1]
            const data = res.data.Data
            this.$set(this.form1.deviceNos, index, {
              value,
              DeviceSerial: value,
              VideoMonitorApplicationId: this.form1.secret,
              ProjectId: this.pid,
              PointName: data.Name,
              Status: data.Status,
              MonitorAddress: data.MonitorAddress,
              PlaybackAddress: data.PlaybackAddress
            })
            callback()
          } else {
            callback(
              new Error(
                '未找到该设备。若需要使用企业自有开发者账号来管理视频设备，请先前往『系统管理-应用管理』界面录入应用密钥'
              )
            )
          }
        })
        .catch(err => {
          console.error(err)
          callback(new Error('编号校验失败'))
        })
    }
    return {
      dialogVisible: false,
      stepActive: 0,
      addWay: 1,
      pid: '',
      successCount: 0,
      secretOptions: [],
      form1: {
        secret: '',
        deviceNos: [
          {
            value: ''
          }
        ]
      },
      checkDeviceNo,
      form2: {
        items: [
          {
            pointName: '',
            url: ''
          }
        ]
      },
      submitLoading: false
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    industryId() {
      return this.$store.state.app.project.Industry
    },
    proList() {
      return this.$store.state.app.proList
    }
  },
  mounted() {
    this.pid = this.projectId
    getVideoMonitorApplicationDropdown({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          this.secretOptions = res.data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false

      this.stepActive = 0
      this.form1.secret = ''
      this.form1.deviceNos = [
        {
          value: ''
        }
      ]
      this.form2.items = [
        {
          pointName: '',
          url: ''
        }
      ]

      this.$refs.form1 && this.$refs.form1.resetFields()
      this.$refs.form2 && this.$refs.form2.resetFields()
    },
    handleNext() {
      if (!this.pid) {
        this.$message('请先选择项目')
        return
      }
      this.stepActive += 1
    },
    submitForm() {
      if (this.addWay === 1) {
        this.$refs.form1.validate(valid => {
          if (valid) {
            this.submitLoading = true
            batchAddVideoMonitorPoint({
              form: this.form1.deviceNos,
              industry: this.industryId,
              bigTypeId:
                this.$route.query.sid == 39 ? this.$route.query.sid : undefined
            })
              .then(res => {
                if (res.data.Code === 200) {
                  const data = res.data.Data
                  this.successCount = this.form1.deviceNos.length
                  if (data.length) {
                    let descText = ''
                    data.forEach(item => {
                      descText += `
                        <div>设备：${item.ErrKey}添加失败，Message：${item.ErrMessage}</div>
                      `
                    })
                    this.$notify({
                      title: '错误提示',
                      duration: 10000,
                      dangerouslyUseHTMLString: true,
                      message: descText
                    })
                    this.successCount = this.successCount - data.length
                  }
                  this.$emit('complete')
                  this.stepActive = 2
                } else {
                  this.$message.error(res.data.Message)
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('添加失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.$refs.form2.validate(valid => {
          if (valid) {
            const form = []
            this.form2.items.forEach(item => {
              form.push({
                DeviceSerial: '',
                VideoMonitorApplicationId: 0,
                ProjectId: this.pid,
                PointName: item.pointName,
                Status: -1,
                MonitorAddress: item.url,
                PlaybackAddress: ''
              })
            })
            batchAddVideoMonitorPoint({
              form,
              industry: this.industryId,
              bigTypeId:
                this.$route.query.sid == 39 ? this.$route.query.sid : undefined
            })
              .then(res => {
                if (res.data.Code === 200) {
                  this.$emit('complete')
                  this.stepActive = 2
                } else {
                  this.$message.error(res.data.Message)
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('添加失败')
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
}
</script>

<style lang="scss">
.add-camera-dialog {
  .add-way-row {
    display: flex;
    align-items: center;
  }
  .way-desc {
    color: rgba(0, 0, 0, 0.45);
    line-height: 25px;
    flex: 1;
  }
  .el-form-item__error {
    padding-top: 0;
  }
}
</style>
