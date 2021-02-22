<template>
  <el-dialog :visible.sync="dialogVisible" width="630px" @close="handleClose">
    <div style="line-height: 24px;font-size: 18px;color: #303133;" slot="title">
      {{ form.id ? '维保合同：' + form.no : '新增维保合同' }}
      <el-tag
        size="small"
        v-if="form.id"
        :type="
          form.status === 0
            ? 'warning'
            : form.status === 1
            ? 'success'
            : form.status === 2
            ? 'info'
            : ''
        "
      >
        {{
          form.status === 0
            ? '待签约'
            : form.status === 1
            ? '执行中'
            : form.status === 2
            ? '已到期'
            : ''
        }}
      </el-tag>
    </div>
    <el-form
      :model="form"
      :rules="formRules"
      ref="form"
      v-loading="loading"
      label-width="100px"
      size="medium"
      class="pact-form"
    >
      <el-form-item label="合同名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入合同名称"
          style="width: 420px;"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="合同编号" prop="no">
        <el-input
          v-model="form.no"
          :disabled="true"
          style="width: 180px;"
        ></el-input>
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select
          v-model="form.deviceType"
          placeholder="请选择"
          clearable
          @change="changeDeviceType"
          style="width: 180px;"
        >
          <el-option
            v-for="item in deviceTypes"
            :label="item.mname"
            :value="item.id"
            :key="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维保单位" prop="unit">
        <el-select
          v-model="form.unit"
          placeholder="请选择"
          @change="changeUnit"
          style="width: 420px;"
        >
          <el-option
            v-for="item in companyOptions"
            :key="item.CompanyId"
            :label="item.CompanyName"
            :value="item.CompanyId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="签约项目" prop="projects">
        <treeselect
          v-model="form.projects"
          :default-expand-level="1"
          :multiple="true"
          :options="treeOptions"
          style="line-height: 20px;width: 420px;"
          placeholder="请选择"
          :normalizer="normalizer"
        />
      </el-form-item>
      <el-form-item label="服务期限" required style="width: 520px;">
        <el-col :span="11">
          <el-form-item prop="startTime">
            <el-date-picker
              type="date"
              placeholder="选择日期"
              v-model="form.startTime"
              style="width: 100%;"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col style="text-align: center;" :span="2">至</el-col>
        <el-col :span="11">
          <el-form-item prop="endTime">
            <el-date-picker
              type="date"
              placeholder="选择时间"
              v-model="form.endTime"
              style="width: 100%;"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item
        :label="index === 0 ? '保养模板' : ''"
        required
        v-for="(template, index) in form.templates"
        :key="index"
        style="width: 520px;"
      >
        <el-col :span="14">
          <div class="template-box">
            <c-svg name="PDF" class="file-icon"></c-svg>
            <div class="template-info">
              <div class="name">{{ template.MaintenanceTemplateName }}</div>
              <div class="cycle">
                维保周期：{{
                  template.MaintenanceCycle === 0
                    ? '周'
                    : template.MaintenanceCycle === 2
                    ? '半月'
                    : template.MaintenanceCycle === 4
                    ? '月'
                    : template.MaintenanceCycle === 6
                    ? '季度'
                    : template.MaintenanceCycle === 7
                    ? '半年'
                    : template.MaintenanceCycle === 8
                    ? '年'
                    : ''
                }}
              </div>
            </div>
            <div class="tool-box">
              <el-button
                type="text"
                v-if="template.CompanyId === companyId"
                @click.native="
                  $router.push({
                    name: 'maintenanceTemplateDetail',
                    query: { data: JSON.stringify(template) }
                  })
                "
              >
                <c-svg name="bianji"></c-svg>
              </el-button>

              <el-button type="text" @click.native="handlePreView(template)">
                <c-svg name="chakan1"></c-svg>
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="1">
          <span style="visibility: hidden;">&nbsp;</span>
        </el-col>
        <el-col :span="9" style="position: relative;">
          <el-form-item
            :prop="'templates.' + index + '.time'"
            :rules="{
              type: 'date',
              required: true,
              message: '请选择时间',
              trigger: 'change'
            }"
          >
            <el-date-picker
              type="datetime"
              placeholder="选择首保日期"
              v-model="template.time"
              format="yyyy-MM-dd HH"
              style="width: 100%;"
            ></el-date-picker>
          </el-form-item>
          <el-button
            v-if="form.templates.length !== 1"
            class="btn-danger remove-template-btn"
            type="text"
            style="padding: 6px;"
            @click.native="removeTemplate(index)"
          >
            <i
              class="el-icon-remove"
              style="font-size: 18px;margin-left: 5px;"
            />
          </el-button>
        </el-col>
      </el-form-item>
      <el-form-item required :label="form.templates.length ? '' : '保养模板'">
        <TemplateSelect :data="templateOptions" @change="changeTemplates">
          <el-button icon="el-icon-plus" type="text">添加</el-button>
        </TemplateSelect>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="medium" @click="dialogVisible = false">取 消</el-button>
      <el-button
        size="medium"
        :loading="submitLoading"
        type="primary"
        @click="submit"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import TemplateSelect from './component/TemplateSelect'
import { getModelList } from '@/api/maintenanceUnit'
import {
  getContractNumber,
  addMaintainContract,
  updateMaintainContract,
  getMaintainContractQuery
} from '@/api/maintainContract'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getMaintenanceTemplateDropdownList } from '@/api/maintenanceTemplate'
import { getMaintenanceUnitList } from '@/api/maintenanceUnit'
import { getSubareaTree } from '@/api/subarea'

export default {
  components: {
    TemplateSelect,
    Treeselect
  },
  props: {
    type: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      treeOptions: [],
      normalizer(node) {
        return {
          id: node.SubareaId,
          label: node.SubareaName,
          children: node.Children
        }
      },

      loading: false,
      deviceTypes: [],
      templateOptions: {},
      companyOptions: [],

      submitLoading: false,
      form: {
        id: '',
        name: '',
        no: '',
        projects: [],
        deviceType: '',
        unit: '',
        startTime: '',
        endTime: '',
        status: '',
        templates: []
      },
      formRules: {
        name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
        no: [{ required: true, message: '编号必填', trigger: 'blur' }],
        projects: [
          {
            required: true,
            type: 'array',
            message: '请选择签约项目',
            trigger: 'blur'
          }
        ],
        deviceType: [
          {
            required: true,
            message: '请选择设备类型',
            trigger: 'change'
          }
        ],
        unit: [
          {
            required: true,
            message: '请选择维保单位',
            trigger: 'change'
          }
        ],
        startTime: [
          {
            type: 'date',
            required: true,
            message: '请选择时间',
            trigger: 'change'
          }
        ],
        endTime: [
          {
            type: 'date',
            required: true,
            message: '请选择时间',
            trigger: 'change'
          }
        ]
      },
      dialogVisible: false
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
    getSubareaTree({
      companyId: this.$store.state.app.company.id
    })
      .then(res => {
        const data = res.data
        if (data.Code === 200) {
          this.walk([data.Data])
          this.treeOptions = [data.Data]
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    openDialog(id) {
      this.dialogVisible = true

      // 说明是编辑
      if (id) {
        this.loading = true
        this.form.id = id
        getMaintainContractQuery({
          contractID: id
        })
          .then(res => {
            if (res.data.Code === 200) {
              const data = res.data.Data
              this.form.name = data.contractName
              this.form.deviceType = data.maintainType
              this.form.startTime = new Date(data.startDate)
              this.form.endTime = new Date(data.endDate)
              this.form.no = data.contractNumber
              this.form.unit = data.partyB
              this.form.status = data.contractStatus
              this.form.projects = data.projectList.map(item => item.Key)
              data.templateList.forEach(item => {
                this.form.templates.push({
                  time: new Date(item.maintainFirst),
                  ...item.maintenance_Template
                })
              })
              this.fetchCompanyOptions()
              this.fetchTemplateOptions()
            } else {
              this.$message.error('合同详情获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('合同详情获取失败')
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        getContractNumber()
          .then(res => {
            if (res.data.Code === 200) {
              this.form.no = res.data.Data
            } else {
              this.$message.error('合同编号获取失败，请稍候再试')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('合同编号获取失败，请稍候再试')
          })
      }
    },
    handleClose() {
      this.$refs.form.resetFields()
      this.form.templates = []
      this.form.id = ''
      this.form.status === ''
      this.templateOptions = []
      this.companyOptions = []
      this.dialogVisible = false
    },
    removeTemplate(index) {
      this.form.templates.splice(index, 1)
    },
    // 修改设备类型后触发
    changeDeviceType() {
      this.templateOptions = {}
      this.companyOptions = []
      this.form.unit = ''
      this.form.templates = []
      this.fetchCompanyOptions()
    },
    // 修改维保单位后触发
    changeUnit() {
      this.templateOptions = {}
      this.form.templates = []
      this.fetchTemplateOptions()
    },
    // 改变模板后触发
    changeTemplates(template) {
      this.$set(template, 'time', '')
      if (
        this.form.templates.find(
          item => item.MaintenanceTemplateId === template.MaintenanceTemplateId
        )
      ) {
        return false
      }
      this.form.templates.push(template)
    },
    // 预览模板
    handlePreView(template) {
      if (!template.Url) {
        this.$message({
          message:
            '预览文件暂未生成，请前往模板详情页，点击预览报告按钮生成预览文件',
          duration: 10000
        })
        return false
      }
      window.open(template.Url, '_blank')
    },
    // 获取保养模板options
    fetchTemplateOptions() {
      getMaintenanceTemplateDropdownList({
        companyIdList: [this.companyId, this.form.unit],
        bigTypeId: this.form.deviceType
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.templateOptions = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取维保单位optionsGetMaintenance_UnitList
    fetchCompanyOptions() {
      getMaintenanceUnitList({
        companyId: this.companyId,
        typeId: this.form.deviceType,
        pageIndex: 1,
        pageSize: 500
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.companyOptions = res.data.Data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 提交表单
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {
            id,
            name,
            no,
            deviceType,
            unit,
            startTime,
            endTime,
            templates,
            projects
          } = this.form

          if (!templates.length) {
            this.$message('请至少选择一个保养模板')
            return false
          }
          this.submitLoading = true
          // 说明是编辑
          if (id) {
            updateMaintainContract({
              contractID: id,
              contractNumber: no,
              contractName: name,
              maintainType: deviceType,
              partyA: this.companyId,
              partyB: unit,
              projectList: projects,
              startDate: this._dateFormat(startTime, 'YYYY-MM-DD'),
              endDate: this._dateFormat(endTime, 'YYYY-MM-DD'),
              MaintenanceTemplate: templates.map(item => {
                return {
                  Key: item.MaintenanceTemplateId,
                  Value: this._dateFormat(item.time, 'YYYY-MM-DD HH') + ':00:00'
                }
              })
            })
              .then(res => {
                if (res.data.Code === 200) {
                  this.$message.success('合同更新成功')
                  this.$emit('refresh')
                  this.dialogVisible = false
                } else {
                  this.$message.error('合同更新失败')
                }
              })
              .catch(err => {
                this.$message.error('合同更新失败')
                console.error(err)
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            addMaintainContract({
              contractNumber: no,
              contractName: name,
              maintainType: deviceType,
              partyA: this.companyId,
              partyB: unit,
              startDate: this._dateFormat(startTime, 'YYYY-MM-DD'),
              endDate: this._dateFormat(endTime, 'YYYY-MM-DD'),
              projectList: projects,
              MaintenanceTemplate: templates.map(item => {
                return {
                  Key: item.MaintenanceTemplateId,
                  Value: this._dateFormat(item.time, 'YYYY-MM-DD HH') + ':00:00'
                }
              })
            })
              .then(res => {
                if (res.data.Code === 200) {
                  this.$message.success('合同新增成功')
                  this.$emit('refresh')
                  this.dialogVisible = false
                } else {
                  this.$message.error(res.Message)
                }
              })
              .catch(err => {
                this.$message.error('合同新增失败')
                console.error(err)
              })
              .finally(() => {
                this.submitLoading = false
              })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 删除空的Children
    walk(arr) {
      arr.forEach(item => {
        if (item.Children) {
          if (!item.Children.length) {
            delete item.Children
          } else {
            this.walk(item.Children)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pact-form {
  .template-box {
    display: flex;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
    .file-icon {
      flex: 0 0 30px;
      width: 28px;
      height: 32px;
    }
    .template-info {
      flex: 1;
      margin: 0 10px;
      font-size: 12px;
      line-height: 17px;
      .name {
        width: 120px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .cycle {
        color: #c0c4cc;
      }
    }
    .tool-box {
      flex: 0 0 45px;
      .icon {
        color: #606266;
      }
    }
  }
  .remove-template-btn {
    position: absolute;
    right: -40px;
    top: 0;
  }
}
</style>
