<template>
  <el-dialog
    width="600px"
    title="新增维保模板"
    :visible.sync="visible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      style="margin-right: 40px;"
      size="small"
    >
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入模板名称"></el-input>
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="form.deviceType" filterable placeholder="请选择">
          <el-option
            v-for="item in deviceTypes"
            :label="item.mname"
            :value="item.id"
            :key="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="保养周期" prop="cycle">
        <el-select v-model="form.cycle" filterable placeholder="请选择">
          <!-- 0:周 2:半月 4:月 6:季度 8:年 -->
          <el-option label="天" :value="10"></el-option>
          <el-option label="周" :value="0"></el-option>
          <el-option label="半月" :value="2"></el-option>
          <el-option label="月" :value="4"></el-option>
          <el-option label="季度" :value="6"></el-option>
          <el-option label="半年" :value="7"></el-option>
          <el-option label="年" :value="8"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="保养类型" prop="type">
        <el-select v-model="form.type" filterable placeholder="请选择">
          <!-- 0:周 2:半月 4:月 6:季度 8:年 -->
          <el-option label="现场保养" :value="0"></el-option>
          <el-option label="远程保养" :value="2"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="medium" @click.native="visible = false">取 消</el-button>
      <el-button size="medium" type="primary" @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { getModelList } from '@/api/maintenanceUnit'
import { addOrUpdateMaintenanceTemplate } from '@/api/maintenanceTemplate'
export default {
  data() {
    return {
      visible: false,

      deviceTypes: [],
      form: {
        name: '',
        deviceType: '',
        cycle: '',
        type: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        deviceType: [{ required: true, message: '请选择', trigger: 'change' }],
        cycle: [{ required: true, message: '请选择', trigger: 'change' }],
        type: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    getModelList({
      Industry: 0
    })
      .then(res => {
        const data = res.data
        if (data.Code === 200) {
          this.deviceTypes = data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    openDialog() {
      this.visible = true
    },
    handleClose() {
      this.visible = false
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { name, deviceType, cycle, type } = this.form
          addOrUpdateMaintenanceTemplate({
            MaintenanceTemplateId: undefined,
            CompanyId: this.companyId,
            BigTypeId: deviceType,
            BigTypeName: this.deviceTypes.find(item => item.id === deviceType)
              .mname,
            MaintenanceTemplateName: name,
            MaintenanceCycle: cycle,
            MaintenanceType: type
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                if (data.Data.IsSuccess) {
                  this.$message.success('模板新增成功')
                  this.$router.push({
                    name: 'maintenanceTemplateDetail',
                    query: { data: JSON.stringify(data.Data.Description) }
                  })
                } else {
                  this.$message.error('模板新增失败')
                }
              } else {
                this.$message.error('模板新增失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('模板新增失败')
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
