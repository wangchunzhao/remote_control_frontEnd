<template>
  <el-dialog
    width="360px"
    custom-class="alarm-filter-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="85px"
      size="small"
    >
      <el-form-item
        v-if="
          layout.includes('projectIds') && $route.name !== 'alarmManageIndex'
        "
        label="项目:"
      >
        <el-select
          v-model="form.projectIds"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="layout.includes('deviceTypes')" label="设备类型:">
        <el-select
          v-model="form.deviceTypes"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in deviceTypeOptions"
            :label="item.Name"
            :value="item.Id"
            :key="item.Id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="layout.includes('alarmLevels')" label="报警等级:">
        <el-select
          v-model="form.alarmLevels"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in levelOptions"
            :label="item.label"
            :value="item.id"
            :key="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="layout.includes('alarmTypes')" label="报警类型:">
        <el-select
          v-model="form.alarmTypes"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in alarmTypeOptions"
            :label="item.Name"
            :value="item.Id"
            :key="item.Id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="layout.includes('comfirmUserIds')" label="确认人:">
        <el-select
          v-model="form.confirmUserIds"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in confirmUserOptions"
            :label="item.Name"
            :value="item.Id"
            :key="item.Id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="layout.includes('dealUserIds')" label="处理人:">
        <el-select
          v-model="form.dealUserIds"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in dealUserOptions"
            :label="item.Name"
            :value="item.Id"
            :key="item.Id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="layout.includes('continue')"
        label="持续时长:"
        style="margin-bottom: 0;"
      >
        <el-col :span="8">
          <el-form-item prop="continueTimeStart">
            <el-input
              clearable
              v-model.number="form.continueTimeStart"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="1" style="text-align: center;">-</el-col>
        <el-col :span="8">
          <el-form-item prop="continueTimeEnd">
            <el-input
              clearable
              v-model.number="form.continueTimeEnd"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1">&nbsp;</el-col>
        <el-col :span="6">
          <el-select
            class="range-select"
            v-model="form.continueTimeUnit"
            filterable
            placeholder=""
          >
            <el-option label="分" value="minute"></el-option>
            <el-option label="时" value="hour"></el-option>
            <el-option label="天" value="day"></el-option>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item
        v-if="layout.includes('response')"
        label="响应时长:"
        style="margin-bottom: 0;"
      >
        <el-col :span="8">
          <el-form-item prop="responseTimeStart">
            <el-input
              clearable
              v-model.number="form.responseTimeStart"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="1" style="text-align: center;">-</el-col>
        <el-col :span="8">
          <el-form-item prop="responseTimeEnd">
            <el-input
              clearable
              v-model.number="form.responseTimeEnd"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1">&nbsp;</el-col>
        <el-col :span="6">
          <el-select
            class="range-select"
            v-model="form.responseTimeUnit"
            filterable
            placeholder=""
          >
            <el-option label="分" value="minute"></el-option>
            <el-option label="时" value="hour"></el-option>
            <el-option label="天" value="day"></el-option>
          </el-select>
        </el-col>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button size="small" type="primary" @click.native="submitForm"
        >筛 选</el-button
      >
      <el-button
        size="small"
        type="text"
        @click.native="resetForm"
        style="font-size: 14px;"
      >
        <c-svg style="font-size: 15px;" name="undo" />
        重置筛选</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    layout: Array,
    inAlarmManageIndex: {
      type: Boolean,
      default: function() {
        false
      }
    },
    alarmTypeOptions: {
      type: Array,
      default: function() {
        return []
      }
    },
    confirmUserOptions: {
      type: Array,
      default: function() {
        return []
      }
    },
    dealUserOptions: {
      type: Array,
      default: function() {
        return []
      }
    },
    deviceTypeOptions: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      dialogVisible: false,

      form: {
        projectIds: [],
        deviceTypes: [],
        alarmLevels: [],
        alarmTypes: [],
        confirmUserIds: [],
        dealUserIds: [],
        continueTimeStart: undefined,
        continueTimeEnd: undefined,
        continueTimeUnit: 'minute',
        responseTimeStart: undefined,
        responseTimeEnd: undefined,
        responseTimeUnit: 'minute'
      },
      rules: {
        continueTimeStart: [
          {
            type: 'number',
            required: true,
            message: '数字',
            trigger: 'blur'
          }
        ],
        continueTimeEnd: [
          {
            type: 'number',
            required: true,
            message: '数字',
            trigger: 'blur'
          }
        ],
        responseTimeStart: [
          {
            type: 'number',
            required: true,
            message: '数字',
            trigger: 'blur'
          }
        ],
        responseTimeEnd: [
          {
            type: 'number',
            required: true,
            message: '数字',
            trigger: 'blur'
          }
        ]
      },
      levelOptions: [
        {
          id: 1,
          label: '紧急'
        },
        {
          id: 2,
          label: '重要'
        },
        {
          id: 3,
          label: '一般'
        },
        {
          id: 4,
          label: '记录'
        }
      ]
    }
  },
  computed: {
    projectList() {
      return this.$store.state.app.proList
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    resetForm() {
      this.form.projectIds = []
      this.form.deviceTypes = []
      this.form.alarmLevels = []
      this.form.alarmTypes = []
      this.form.confirmUserIds = []
      this.form.dealUserIds = []
      this.form.continueTimeStart = undefined
      this.form.continueTimeEnd = undefined
      this.form.continueTimeUnit = 'minute'
      this.form.responseTimeStart = undefined
      this.form.responseTimeEnd = undefined
      this.form.responseTimeUnit = 'minute'

      const form = this.formFactory()
      this.$emit('change', form)
      this.dialogVisible = false
    },
    submitForm() {
      const form = this.formFactory()
      this.$emit('change', form)
      this.dialogVisible = false
    },
    formFactory() {
      const {
        projectIds,
        deviceTypes,
        alarmLevels,
        alarmTypes,
        confirmUserIds,
        dealUserIds,
        continueTimeStart,
        continueTimeEnd,
        continueTimeUnit,
        responseTimeStart,
        responseTimeEnd,
        responseTimeUnit
      } = this.form
      let form = {}
      this.layout.forEach(item => {
        switch (item) {
          case 'projectIds':
            if (!this.inAlarmManageIndex) {
              // 如果不在单个项目下的报警管理页面使用
              form.projectIds = projectIds
            }
            break
          case 'deviceTypes':
            form.deviceTypes = deviceTypes
            break
          case 'alarmLevels':
            form.alarmLevels = alarmLevels
            break
          case 'alarmTypes':
            form.alarmTypes = alarmTypes
            break
          case 'confirmUserIds':
            form.confirmUserIds = confirmUserIds
            break
          case 'dealUserIds':
            form.dealUserIds = dealUserIds
            break
          case 'continue':
            if (continueTimeUnit === 'minute') {
              form.continueTimeStart = continueTimeStart
              form.continueTimeEnd = continueTimeEnd
              // debugger
            } else if (continueTimeUnit === 'hour') {
              form.continueTimeStart = continueTimeStart * 60
              form.continueTimeEnd = continueTimeEnd * 60
            } else if (continueTimeUnit === 'day') {
              form.continueTimeStart = continueTimeStart * 24 * 60
              form.continueTimeEnd = continueTimeEnd * 24 * 60
            }
            break
          case 'response':
            if (responseTimeUnit === 'minute') {
              form.responseTimeStart = responseTimeStart
              form.responseTimeEnd = responseTimeEnd
            } else if (responseTimeUnit === 'hour') {
              form.responseTimeStart = responseTimeStart * 60
              form.responseTimeEnd = responseTimeEnd * 60
            } else if (responseTimeUnit === 'day') {
              form.responseTimeStart = responseTimeStart * 24 * 60
              form.responseTimeEnd = responseTimeEnd * 24 * 60
            }
            break
          default:
            break
        }
      })
      return form
    }
  }
}
</script>

<style lang="scss">
.alarm-filter-dialog {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 30px 30px 20px 20px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .range-select {
    .el-input__inner {
      padding: 0 5px;
    }
  }
  .el-input .el-input__inner {
    padding: 0 7px;
  }
}
</style>
