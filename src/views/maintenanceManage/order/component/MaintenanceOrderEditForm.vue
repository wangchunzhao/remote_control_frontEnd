<template>
  <el-dialog
    width="450px"
    :title="idList.length > 1 ? '批量修改' : '编辑工单'"
    :visible.sync="visible"
    @close="handleClose"
    custom-class="maintenance-order-edit-form"
  >
    <el-alert
      v-if="idList.length > 1"
      type="info"
      class="custom-alert"
      :title="`已选中${idList.length}个维保工单`"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    >
    </el-alert>
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      size="small"
      label-width="100px"
    >
      <el-form-item label="保养日期" style="margin-bottom: 0;">
        <el-col :span="6">
          <el-form-item prop="operation">
            <el-select v-model="form.operation" placeholder="请选择">
              <el-option label="增加" :value="1"></el-option>
              <el-option label="减少" :value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col style="text-align: center;" :span="1">-</el-col>
        <el-col :span="6">
          <el-form-item prop="day">
            <el-select v-model="form.day" placeholder="">
              <el-option label="1" :value="1"></el-option>
              <el-option label="2" :value="2"></el-option>
              <el-option label="3" :value="3"></el-option>
              <el-option label="4" :value="4"></el-option>
              <el-option label="5" :value="5"></el-option>
              <el-option label="6" :value="6"></el-option>
              <el-option label="7" :value="7"></el-option>
              <el-option label="8" :value="8"></el-option>
              <el-option label="9" :value="9"></el-option>
              <el-option label="10" :value="10"></el-option>
              <el-option label="11" :value="11"></el-option>
              <el-option label="12" :value="12"></el-option>
              <el-option label="13" :value="13"></el-option>
              <el-option label="14" :value="14"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <span style="margin-left: 5px;">
          天
        </span>
      </el-form-item>
      <el-form-item label="负责人" prop="user">
        <el-select v-model="form.user" filterable placeholder="请选择">
          <el-option
            v-for="item in userOptions"
            :label="item.Value"
            :key="item.Key"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button size="medium" @click.native="visible = false">取 消</el-button>
      <el-button size="medium" type="primary" @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { batchUpdateMaintenanceOrderTime } from '@/api/maintenanceOrder'
import { getMaintenancePageParameter } from '@/api/maintenance'
export default {
  data() {
    return {
      visible: false,
      idList: [],
      userOptions: [],

      form: {
        operation: 1,
        day: '',
        user: ''
      },
      rules: {
        // operation: [{ required: true, message: '请选择', trigger: 'change' }],
        // day: [{ required: true, message: '请选择', trigger: 'change' }],
        // user: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    openDialog({ idList, teamId }) {
      this.teamId = teamId
      this.visible = true
      this.idList = idList
      this.fetchUserOptions()
    },
    handleClose() {
      this.visible = false
      this.idList = []
      this.userOptions = []
      this.$refs.form.resetFields()
    },
    fetchUserOptions() {
      getMaintenancePageParameter({
        companyId: this.companyId,
        maintenanceId: this.teamId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.userOptions = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { operation, day, user } = this.form
          batchUpdateMaintenanceOrderTime({
            maintenanceOrderIdList: this.idList,
            maintenanceDays: day
              ? operation === 1
                ? day
                : day * -1
              : undefined,
            acceptanceUserId: user || undefined
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('工单修改成功')
                this.visible = false
                this.$emit('refresh')
              } else {
                this.$message.error('工单修改失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('工单修改失败')
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
.maintenance-order-edit-form {
  .custom-alert {
    background-color: rgba(230, 247, 255, 1);
    i {
      color: #1890ff;
    }
  }
}
</style>
