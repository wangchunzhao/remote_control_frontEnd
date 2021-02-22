<template>
  <div class="event-notice-edit content-box">
    <el-form
      ref="basicForm"
      :model="basicForm"
      :rules="basicFormRules"
      label-width="80px"
      size="medium"
    >
      <div class="custom-panel">
        <div class="custom-panel-header">
          基本信息
        </div>
        <div class="custom-panel-body">
          <el-form-item label="所属项目" prop="project">
            <el-select
              v-model="basicForm.project"
              filterable
              placeholder="请选择项目"
              :disabled="
                Boolean($route.query.id) || platform === PLATFORM.business
              "
              style="width: 240px"
              @change="changeProject"
            >
              <el-option
                v-for="item in proList"
                :key="item.id"
                :value="item.id"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="策略名称" prop="name">
            <el-input
              v-model.trim="basicForm.name"
              placeholder="请输入策略名称"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="basicForm.remark"
              :rows="3"
              type="textarea"
              placeholder="请输入备注细则"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item
            class="inline-form-item"
            label="资源类型"
            prop="systemTypeId"
          >
            <el-select
              v-model="basicForm.resourceType"
              placeholder="请选择"
              size="small"
              :disabled="Boolean($route.query.id)"
              style="width:240px"
              @change="changeResourceType"
            >
              <el-option
                v-for="item in resourceTypeOptions"
                :label="item.eventName"
                :value="item.eventTypeId"
                :key="item.eventTypeId"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <div>
            <el-form-item
              class="inline-form-item"
              label="事件类型"
              prop="eventType"
            >
              <el-select
                v-model="basicForm.eventType"
                placeholder="请选择"
                size="small"
                :disabled="Boolean($route.query.id)"
                style="width:240px"
              >
                <el-option
                  v-for="item in eventTypeOptions"
                  :label="item.eventName"
                  :value="item.eventTypeId"
                  :key="item.eventTypeId"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
    <el-form
      ref="noticeForm"
      :model="noticeForm"
      :rules="noticeFormRules"
      label-width="80px"
      size="small"
    >
      <div class="custom-panel">
        <div class="custom-panel-header">
          通知规则
        </div>
        <div class="custom-panel-body">
          <div class="box-light">
            <div style="margin-bottom: 15px;">
              <span class="box-light-title-weight">
                通知方式
              </span>
              <el-tooltip
                class="item"
                effect="dark"
                content="使用短信、语音电话方式通知需要支付相关通信费用"
                placement="right"
              >
                <c-svg name="attention" style="font-size: 16px;" />
              </el-tooltip>
            </div>
            <div class="notice-row">
              <el-form-item label-width="0">
                <el-checkbox-group v-model="noticeForm.ways">
                  <el-checkbox label="App" disabled />
                  <el-checkbox label="微信" disabled />
                  <el-checkbox label="短信" />
                  <el-checkbox label="语音电话" />
                </el-checkbox-group>
              </el-form-item>
            </div>
          </div>
          <div class="box-light" style="margin-top: 24px;">
            <div style="position:relative;">
              <span class="box-light-title-weight">
                清除时通知
              </span>
              <el-switch
                v-model="noticeForm.recovery"
                active-color="#409EFF"
                :active-value="1"
                :inactive-value="0"
                inactive-color="#dcdfe6"
                style=""
              />
            </div>
          </div>
          <div class="box-light" style="margin-top: 24px;">
            <div style="margin-bottom: 15px;position:relative;">
              <span class="box-light-title-weight">
                重复通知
              </span>
              <el-switch
                v-model="noticeForm.repeatCheck"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                style=""
                @change="$refs['noticeForm'].validate()"
              />
            </div>
            <!-- <div class="notice-row">
              <span class="box-light-title">报警持续</span>
              <el-form-item label-width="0" prop="repeatTime">
                <el-input
                  v-model.trim="noticeForm.repeatTime"
                  :disabled="!noticeForm.repeatCheck"
                  placeholder="请输入"
                  style="width: 70px;"
                />
              </el-form-item>
              <span style="margin-top: 10px;margin-left:10px;color:#656565;"
                >分钟无响应，产生新消息通知</span
              >
            </div> -->
          </div>
        </div>
      </div>
    </el-form>
    <div class="custom-panel">
      <div class="custom-panel-header">
        联系人
        <user-select :data="userList" @change="selectUser">
          <el-button
            type="primary"
            size="mini"
            circle
            icon="el-icon-plus"
            style="margin-left: 30px;"
          />
        </user-select>
      </div>
      <div class="custom-panel-body">
        <el-table :data="contactTableData" style="width: 100%;">
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="text"
                class="btn-danger"
                @click.native="deleteContact(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="mobile" label="手机" />
          <el-table-column prop="binding" label="第三方账号">
            <template slot-scope="{ row }">
              <c-svg
                v-if="row.binding === '已绑定'"
                style="font-size: 18px;color: #19AD19;"
                name="wechat-fill"
              />
            </template>
          </el-table-column>
          <el-table-column prop="range" label="接收通知时段">
            <template slot-scope="scope">
              <el-time-picker
                v-model="scope.row.range"
                is-range
                format="HH:mm:ss"
                range-separator="至"
                :clearable="false"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围"
                size="small"
                style="width: 220px;"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="custom-panel" style="text-align: center;">
      <el-button size="medium" @click.native="$router.back()">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        size="medium"
        style="margin-left: 40px;"
        @click.native="submit"
      >
        提交
      </el-button>
    </div>
  </div>
</template>

<script>
import UserSelect from '../component/UserSelect'
import {
  getEventTypeList,
  addEventStrategy,
  updateEventStrategy,
  queryProjectConcats,
  queryEventStrategy
} from '@/api/eventStrategy'
import { logSnapShotFactory } from '@/utils/logSnapShot'

export default {
  components: {
    UserSelect
  },
  data() {
    // const checkRepeatTime = (rule, value, callback) => {
    //   if (this.noticeForm.repeatCheck) {
    //     const result = this.isInteger(value)
    //     if (!result.res) {
    //       callback(new Error(result.msg))
    //     } else {
    //       if (parseInt(value) >= 5) {
    //         callback()
    //       } else {
    //         callback(new Error('时间间隔最小5分钟'))
    //       }
    //     }
    //   } else {
    //     callback()
    //   }
    // }
    return {
      basicForm: {
        name: '',
        project: '',
        remark: '',
        resourceType: '',
        eventType: ''
      },
      basicFormRules: {
        project: [
          { required: true, message: '请选择所属项目', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入策略名称', trigger: 'blur' },
          { min: 2, max: 25, message: '长度在 2 到 25 个字符', trigger: 'blur' }
        ],
        resourceType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        eventType: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      resourceTypeOptions: [],
      eventTypeOptions: [],
      noticeForm: {
        ways: ['微信', 'App'],
        recovery: 0,
        repeatCheck: 0
        // repeatTime: undefined
      },
      noticeFormRules: {
        // repeatTime: [{ validator: checkRepeatTime, trigger: 'blur' }]
      },
      contactTableData: [],
      userList: [],
      PLATFORM,
      submitLoading: false
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    },
    platform() {
      return this.$store.state.permissions.platform
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    if (this.$route.query.id) {
      queryEventStrategy({
        ID: this.$route.query.id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.basicForm.name = data.name
            this.basicForm.project = data.project
            this.basicForm.remark = data.remark
            this.basicForm.resourceType = data.resourcesType
            this.basicForm.eventType = data.eventType
            this.fetchEventTypeOptions(data.resourcesType)
            this.fetchUserList(data.ID)

            this.noticeForm.ways = data.notice.split(',')
            this.noticeForm.recovery = data.recovery
            this.noticeForm.repeatCheck = data.repeatCheck
            // this.noticeForm.repeatTime = data.repeatTime

            data.concats.forEach(item => {
              item.range[0] = this.stringToDate(item.range[0])
              item.range[1] = this.stringToDate(item.range[1])
            })
            this.contactTableData = data.concats
          } else {
            this.$message.error('策略内容获取失败')
          }
        })
        .catch(err => {
          this.$message.error('策略内容获取失败')
          console.error(err)
        })
    }
    if (Object.keys(this.$route.params).length > 1) {
      // 通过复制进入当前页面
      const { noticeForm, basicForm, contactTableData } = this.$route.params
      this.basicForm = basicForm
      this.noticeForm = noticeForm
      this.contactTableData = contactTableData
      this.fetchEventTypeOptions(this.basicForm.resourceType)
    }
    if (this.platform === PLATFORM.business) {
      this.basicForm.project = this.projectId
      this.fetchUserList()
    }

    getEventTypeList({
      parentId: undefined
    }).then(res => {
      if (res.data.Code === 200) {
        this.resourceTypeOptions = res.data.Data
      }
    })
  },
  methods: {
    // 修改项目
    changeProject() {
      this.fetchUserList()
      if (this.basicForm.resourceType) {
        this.fetchEventTypeOptions(this.basicForm.resourceType)
      }
    },
    // 修改资源类型触发
    changeResourceType(val) {
      this.eventTypeOptions = []
      this.basicForm.eventType = ''

      if (this.basicForm.project) {
        this.fetchEventTypeOptions(val)
      }
    },
    submit() {
      let res = [] // 2个表单的基本验证情况
      this.$refs['basicForm'].validate(valid => {
        if (valid) {
          res.push(true)
        } else {
          res.push(false)
          return false
        }
      })

      this.$refs['noticeForm'].validate(valid => {
        if (valid) {
          res.push(true)
        } else {
          res.push(false)
          return false
        }
      })
      this.submitLoading = true
      const { name, project, remark, resourceType, eventType } = this.basicForm
      const { ways, recovery, repeatCheck } = this.noticeForm
      const { fileName, bucketName, objectName } = logSnapShotFactory(
        document.querySelector('.event-notice-edit')
      )
      if (this.$route.query.id) {
        updateEventStrategy({
          ID: this.$route.query.id,
          name,
          project: 0, // 传 0 是后端定义的
          ProjectId: project,
          remark,
          resourcesType: resourceType,
          eventType,
          recovery: recovery,
          notice: ways.join(','),
          repeatCheck,
          Operator: undefined,
          StorageSpaceExtendList: {
            FileNameList: [fileName],
            BucketName: bucketName,
            ObjectName: objectName
          },
          ConcatsList: this.contactTableData.map(item => ({
            strategyID: this.$route.query.id,
            userId: item.userId,
            range: `${this.timeFormat(item.range[0])},${this.timeFormat(
              item.range[1]
            )}`
          }))
        })
          .then(res => {
            if (res.data.Code === 200 && res.data.Data.IsSuccess === true) {
              this.$message.success('策略编辑成功')
              setTimeout(() => {
                this.$router.go(-1)
              }, 300)
            } else {
              this.$message.error(res.data.Message)
            }
          })
          .catch(err => {
            this.$message.error('编辑失败')
            console.log(err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      } else {
        addEventStrategy({
          name,
          project,
          remark,
          resourcesType: resourceType,
          eventType,
          recovery,
          notice: ways.join(','),
          repeatCheck,
          Operator: undefined,
          StorageSpaceExtendList: {
            FileNameList: [fileName],
            BucketName: bucketName,
            ObjectName: objectName
          },
          ConcatsList: this.contactTableData.map(item => ({
            userId: item.userId,
            range: `${this.timeFormat(item.range[0])},${this.timeFormat(
              item.range[1]
            )}`
          }))
        })
          .then(res => {
            if (res.data.Code === 200 && res.data.Data.IsSuccess === true) {
              this.$message.success('策略添加成功')
              setTimeout(() => {
                this.$router.go(-1)
              }, 300)
            } else {
              this.$message.error(res.data.Message)
            }
          })
          .catch(err => {
            this.$message.error('添加失败')
            console.log(err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      }
    },
    // 选择联系人接收通知的等级
    selectAlarmLevel(row, level) {
      if (row.levels.includes(level)) {
        row.levels = row.levels.filter(item => item !== level)
      } else {
        row.levels.push(level)
      }
    },
    // 清空表单
    clearForm() {},
    // 选择联系人
    selectUser(user) {
      if (user.check) {
        user.range = [
          new Date('2016', '9', '06', '00', '00', '00'),
          new Date('2016', '9', '06', '23', '59', '59')
        ]
        this.contactTableData.push(user)
      } else {
        this.contactTableData = this.contactTableData.filter(
          item => item.userId !== user.userId
        )
      }
    },
    // 删除联系人
    deleteContact(user) {
      this.contactTableData = this.contactTableData.filter(
        item => item.userId !== user.userId
      )
      this.userList.forEach(item => {
        if (item.userId === user.userId) {
          item.check = false
        }
      })
    },
    fetchUserList(strategyID = 0) {
      this.userList = []
      queryProjectConcats({
        strategyID: strategyID,
        project: this.basicForm.project
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.forEach(item => {
              if (!item.levels) {
                item.levels = []
              }
            })
            this.userList = data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 是否是数字
    isInteger(n) {
      if (n === '') {
        return { res: false, msg: '必填' }
      }
      if (parseFloat(n, 10) != n) {
        return { res: false, msg: '必须是数字' }
      }
      return { res: true }
    },
    timeFormat(time) {
      const date = new Date(time)
      let hour = date.getHours()
      let minute = date.getMinutes()
      let second = date.getSeconds()
      return `${hour > 9 ? hour : '0' + hour}:${
        minute > 9 ? minute : '0' + minute
      }:${second > 9 ? second : '0' + second}`
    },
    stringToDate(string) {
      return new Date('2018/8/30 ' + string)
    },
    fetchEventTypeOptions(id) {
      const { project } = this.basicForm
      getEventTypeList({
        parentId: id,
        projectId: project,
        isupdate: this.$route.query.id ? true : false
      }).then(res => {
        if (res.data.Code === 200) {
          this.eventTypeOptions = res.data.Data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
div.event-notice-edit {
  background-color: transparent;
  padding: 0;
  .custom-panel {
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    padding: 16px 24px;
    margin-bottom: 24px;
  }
  .custom-panel-header {
    font-size: 16px;
    font-weight: bold;
    color: #3c3c3c;
  }
  .custom-panel-body {
    padding: 24px;
  }
  .box-light {
    position: relative;
    padding: 24px;
    margin: 0 84px;
    background: rgba(250, 250, 250, 1);
    border-radius: 5px;
    & + .box-light {
      margin-top: 24px;
    }
  }
  .box-light-title-weight {
    margin-right: 24px;
    font-size: 14px;
    font-weight: bold;
  }
  .box-light-title {
    margin-right: 15px;
    color: #656565;
    margin-top: 10px;
  }
  .attention-text {
    color: #878787;
  }
  .notice-row {
    display: flex;
    align-items: flex-start;
    .el-form-item {
      margin-bottom: 0;
    }
  }
  .regular-row1 {
    display: flex;
    justify-content: space-between;
    width: 970px;
    & > div {
      flex: 1;
      color: #656565;
    }
  }
  .regular-row2 {
    color: #656565;
  }
  .inline-form-item {
    display: inline-block;
  }
}
</style>

<style lang="scss">
.event-notice-edit {
  .el-input__inner {
    font-size: 13px;
  }
}
</style>
