<template>
  <el-dialog
    width="400px"
    title=""
    custom-class="device-filter-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="100px" size="small">
      <el-form-item label="设备类型：" prop="deviceTypeIds">
        <el-select
          style="width: 220px;"
          v-model="form.deviceTypeIds"
          clearable
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in deviceTypeOptions"
            :key="item.id"
            :label="item.mname"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报修时间：" prop="createDateRange">
        <el-date-picker
          style="width: 220px;"
          v-model="form.createDateRange"
          type="datetimerange"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          range-separator="至"
          :picker-options="pickerOptions"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="工单状态：" prop="statusIds">
        <el-select
          style="width: 220px;"
          v-model="form.statusIds"
          clearable
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="(item, index) in statusOptions"
            :key="item.label + index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报修单位：" prop="repairCompanyIds">
        <el-select
          style="width: 220px;"
          v-model="form.repairCompanyIds"
          clearable
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in repairCompanyOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报修人：" prop="repairUserIds">
        <el-select
          style="width: 220px;"
          v-model="form.repairUserIds"
          clearable
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in repairUserOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维修单位：" prop="maintenanceCompanyIds">
        <el-select
          style="width: 220px;"
          v-model="form.maintenanceCompanyIds"
          clearable
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in maintenanceCompanyOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维修人：" prop="maintenanceUserIds">
        <el-select
          style="width: 220px;"
          v-model="form.maintenanceUserIds"
          clearable
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in maintenanceUserOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
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
import { getNewRepairActivePageQueryParameter } from '@/api/newRepairActive'
import { getModelList } from '@/api/maintenanceUnit'
export default {
  data() {
    return {
      dialogVisible: false,

      form: {
        deviceTypeIds: [],
        createDateRange: '',
        statusIds: [],
        repairCompanyIds: [],
        repairUserIds: [],
        maintenanceCompanyIds: [],
        maintenanceUserIds: []
      },

      deviceTypeOptions: [],
      repairCompanyOptions: [],
      repairUserOptions: [],
      maintenanceCompanyOptions: [],
      maintenanceUserOptions: [],

      statusOptions: [
        {
          value: [1],
          label: '待接单'
        },
        {
          value: [2],
          label: '已接单'
        },
        {
          value: [3, 5],
          label: '已签到'
        },
        {
          value: [6],
          label: '待确认'
        },
        {
          value: [7],
          label: '已完成'
        },
        {
          value: [0],
          label: '已撤销'
        }
      ],
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近7天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近30天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  computed: {
    projectList() {
      return this.$store.state.app.proList
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    platform() {
      return this.$store.state.permissions.platform
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchOptions()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchOptions()
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleReset() {
      this.form = {
        deviceTypeIds: [],
        createDateRange: '',
        statusIds: [],
        repairCompanyIds: [],
        repairUserIds: [],
        maintenanceCompanyIds: [],
        maintenanceUserIds: []
      }
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    submitForm() {
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    fetchOptions() {
      getModelList({
        Industry: 0
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.deviceTypeOptions = res.data.Data
            this.deviceTypeOptions.push({
              id: -1,
              mname: '其他'
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
      getNewRepairActivePageQueryParameter({
        companyId: this.companyId,
        projectIdList:
          this.platform === PLATFORM.business
            ? [this.projectId]
            : this.projectList.map(v => v.id)
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.repairCompanyOptions = data.ProjectDropdown
            this.maintenanceCompanyOptions = data.MaintenanceUnitDropdown
            this.repairUserOptions = data.ApplicantDropdown
            this.maintenanceUserOptions = data.RepairDropdown
          }
        })
        .catch(err => {
          console.error(err)
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
