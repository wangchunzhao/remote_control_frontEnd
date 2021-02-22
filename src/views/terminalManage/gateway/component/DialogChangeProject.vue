<template>
  <el-dialog
    width="400px"
    title="变更项目"
    :visible.sync="visible"
    append-to-body
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
      <el-form-item label="企业名称" prop="company">
        <el-select
          @change="handleChangeCompany"
          v-model="form.company"
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in companyOptions"
            :label="item.CompanyName"
            :value="item.CompanyId"
            :key="item.CompanyId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称" prop="project">
        <el-select v-model="form.project" filterable placeholder="请选择">
          <el-option
            v-for="item in projectOptions"
            :label="item.Value"
            :value="item.Key"
            :key="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-button
        style="margin-left: 30px;padding: 0px;"
        icon="el-icon-plus"
        @click.native="handleCreateProject"
        type="text"
        >创建项目</el-button
      >
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        size="medium"
        type="primary"
        :loading="submitLoading"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
    <el-dialog
      title="添加项目"
      width="580px"
      append-to-body
      @close="
        () => {
          $refs.projectEditForm.resetForm()
        }
      "
      :visible.sync="projectDialogVisible"
    >
      <ProjectEditForm
        :companyIdProp="form.company"
        ref="projectEditForm"
        @complete="afterAddProject"
      />
    </el-dialog>
  </el-dialog>
</template>

<script>
import { getUserOwnProject } from '@/api/subarea'
import { updateProjectDevices } from '@/api/device_new'
import ProjectEditForm from '@/components/ProjectEditForm'
export default {
  components: {
    ProjectEditForm
  },
  props: {
    deviceId: Number
  },
  data() {
    return {
      visible: false,
      projectDialogVisible: false,
      projectOptions: [],
      form: {
        company: '',
        project: ''
      },
      rules: {
        company: [{ required: true, message: '请选择', trigger: 'blur' }],
        project: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      submitLoading: false
    }
  },
  computed: {
    companyOptions() {
      return this.$store.state.app.companyList
    }
  },
  methods: {
    openDialog() {
      this.visible = true
    },
    handleClose() {
      this.visible = false
    },
    handleChangeCompany() {
      this.form.project = ''
      this.projectOptions = []
      this.fetchProjectOptions()
    },
    fetchProjectOptions() {
      getUserOwnProject({
        companyId: this.form.company
      }).then(res => {
        if (res.data.Code === 200) {
          this.projectOptions = res.data.Data
        }
      })
    },
    handleCreateProject() {
      if (!this.form.company) {
        this.$message('请先选择要添加项目的公司')
      } else {
        this.projectDialogVisible = true
      }
    },
    afterAddProject(id) {
      this.form.project = id
      this.fetchProjectOptions()
      this.projectDialogVisible = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$confirm(
            '变更网关所属项目后，已配置的监测点位和报警将会清除，点位的历史数据会保留',
            '确认修改',
            {
              type: 'warning'
            }
          ).then(() => {
            this.submitLoading = true
            const { project } = this.form
            updateProjectDevices({
              deviceID: this.deviceId,
              projectId: project
            })
              .then(res => {
                const data = res.data
                if (data.Code === 200) {
                  if (data.Data.IsSuccess) {
                    this.$message.success('项目变更成功')
                    this.visible = false
                    this.$emit('complete')
                  } else {
                    this.$message.error('项目变更失败')
                  }
                } else {
                  this.$message.error('项目变更失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('项目变更失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
