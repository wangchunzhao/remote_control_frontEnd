<template>
  <el-form
    ref="form"
    :model="form"
    :rules="formRules"
    label-width="90px"
    size="medium"
    style="margin-right: 60px;"
  >
    <el-form-item label="内容" prop="content">
      <el-input v-model="form.content" clearable placeholder="请输入日程内容" />
    </el-form-item>
    <el-form-item label="类型" prop="type">
      <el-select
        v-model="form.type"
        placeholder="请选择日程类型"
        clearable
        filterable
        style="width: 220px"
        @change="typeChange"
      >
        <el-option label="验证日程" :value="1" />
        <el-option label="校验日程" :value="2" />
      </el-select>
    </el-form-item>
    <el-form-item label="日期" prop="date">
      <el-date-picker
        v-model="form.date"
        type="date"
        clearable
        placeholder="请选择日期"
      />
    </el-form-item>
    <el-form-item label="提醒" prop="remindTime">
      <el-select
        v-model="form.remindTime"
        placeholder="请选择"
        clearable
        filterable
        style="width: 220px"
      >
        <el-option label="当日（早上九点）" :value="0" />
        <el-option label="提前1天" :value="1" />
        <el-option label="提前1周" :value="7" />
        <el-option label="自定义" :value="-1" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="form.remindTime === -1" label="提前" prop="customTime">
      <el-input-number
        controls-position="right"
        :min="1"
        v-model="form.customTime"
      ></el-input-number>
      天
    </el-form-item>
    <el-form-item label="添加成员" prop="users">
      <el-select
        v-model="form.users"
        multiple
        placeholder="请选择"
        clearable
        filterable
        style="width: 100%;"
      >
        <el-option
          v-for="item in userOptions"
          :key="item.userId"
          :label="item.name"
          :value="item.userId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="关联资源" style="margin-bottom: 0;">
      <ScheduleAssociated ref="scheduleAssociated" :schedule-type="form.type" />
    </el-form-item>
  </el-form>
</template>

<script>
import { queryProjectConcats } from '@/api/alarmStrategyNew'
import ScheduleAssociated from './ScheduleAssociated'

export default {
  components: {
    ScheduleAssociated
  },
  data() {
    return {
      form: {
        content: '',
        type: undefined,
        date: '',
        remindTime: '',
        customTime: '',
        users: []
      },
      formRules: {
        content: [
          { required: true, message: '请输入日程内容', trigger: 'change' }
        ],
        date: [{ required: true, message: '请选择日期', trigger: 'change' }],
        remindTime: [{ required: true, message: '请选择', trigger: 'change' }],
        customTime: [{ required: true, message: '请输入', trigger: 'change' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        users: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一个成员',
            trigger: 'change'
          }
        ]
      },

      userOptions: []
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    currentUserId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  mounted() {
    this.getOptions()
  },
  methods: {
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate(valid => {
          if (valid) {
            const resources = this.$refs.scheduleAssociated.tableData.map(
              item => item.ID
            )
            if (!resources.length) {
              this.$message('请选择关联的资源')
              return false
            }
            const {
              content,
              type,
              date,
              remindTime,
              users,
              customTime
            } = this.form
            resolve({
              valid: true,
              data: {
                ProjectId: this.projectId,
                Type: type,
                Content: content,
                WorkDate: this._dateFormat(date, 'YYYY-MM-DD'),
                Remind: remindTime === -1 ? customTime : remindTime,
                CreateUser: this.currentUserId,
                Status: 0, // 新增修改不传默认为0
                Member: users,
                Resources: resources,
                Files: undefined
              }
            })
          } else {
            reject('error submit!!')
          }
        })
      })
    },
    typeChange() {
      this.form.resources = []
    },
    resetForm() {
      this.$refs.form.resetFields()
      this.form.resources = []
    },
    getOptions() {
      queryProjectConcats({
        strategyID: 0,
        project: this.projectId
      })
        .then(res => {
          this.userOptions = res.data.Data
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
