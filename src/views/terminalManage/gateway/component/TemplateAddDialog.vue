<template>
  <el-dialog
    width="700px"
    title="添加组合模板"
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="template-add-dialog"
  >
    <el-form
      :model="form"
      ref="form"
      inline
      size="small"
      hide-required-asterisk
    >
      <div
        v-for="(item, index) in form.templates"
        :key="index"
        class="form-item-box"
      >
        <el-button
          size="medium"
          class="btn-danger"
          type="text"
          @click.native="() => handleRemoveFormItem(index)"
        >
          <i class="el-icon-delete"></i>
        </el-button>
        <el-row type="flex">
          <el-col :span="12">
            <el-form-item
              :label="'模板' + (index + 1)"
              :prop="'templates.' + index + '.templateId'"
              label-width="68px"
              :rules="[{ required: true, message: '请选择', trigger: 'blur' }]"
            >
              <el-select
                v-model="item.templateId"
                filterable
                @change="val => changeTemplate(val, item)"
                style="width: 210px;"
                placeholder="请选择"
              >
                <el-option
                  v-for="template in templateOptions"
                  :label="template.Value"
                  :value="template.Key"
                  :key="template.Key"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-button
              v-if="item.templateId"
              @click.native="() => handleWatchTemplate(item)"
              type="text"
              style="padding: 8px 0;"
            >
              查看模板
            </el-button>
          </el-col>
        </el-row>
        <div style="margin-bottom: 15px;">
          修改从站
          <el-switch
            v-model="item.editAble"
            active-text="开"
            style="transform: translateX(-15px)"
            inactive-text="关"
          >
          </el-switch>
        </div>
        <div v-if="item.editAble" style="margin-left: 65px;">
          <div
            class="row"
            v-for="(module_, index2) in item.modules"
            :key="index2"
          >
            <el-form-item
              :prop="'templates.' + index + '.modules.' + index2 + '.address'"
              :rules="[{ validator: checkAddress, trigger: 'blur' }]"
              :label="
                `「${module_.DeviceModuleName}」从站设备，地址 ${module_.addressOld} 改为 `
              "
            >
              <el-input
                style="width: 85px;"
                v-model="module_.address"
              ></el-input>
            </el-form-item>
            <el-button
              @click.native="() => handleWatchModule(module_)"
              type="text"
              style="padding: 8px 0;"
            >
              查看点位
            </el-button>
          </div>
        </div>
      </div>
      <el-button
        @click.native="handleAddFormItem"
        type="text"
        size="medium"
        icon="el-icon-plus"
        >增加模板</el-button
      >
    </el-form>
    <span slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
    <DialogPreviewPointList
      :list="previewPointList"
      ref="dialogPreviewPointList"
    />
    <TemplateDetailDialog ref="templateDetailDialog" />
  </el-dialog>
</template>

<script>
import { getDeviceTemplateIncludeModuleDropdown } from '@/api/deviceTemplate'
import DialogPreviewPointList from './DialogPreviewPointList'
import { getDeviceModulePointList } from '@/api/deviceModule'
import TemplateDetailDialog from './DialogTemplatePointList'
import { Decrypt } from '@/utils/secret'

const isInteger = n => {
  if (n === '') {
    return false
  }
  return parseInt(n, 10) == n
}
export default {
  components: {
    DialogPreviewPointList,
    TemplateDetailDialog
  },
  data() {
    const checkAddress = (rule, value, callback) => {
      if (isInteger(value)) {
        if (Number(value) < 1 || Number(value) > 255) {
          callback(new Error('1-255(整数)'))
        } else {
          callback()
        }
      } else {
        callback(new Error('1-255(整数)'))
      }
    }
    return {
      dialogVisible: false,
      templateOptions: [],

      form: {
        templates: [
          {
            templateId: '',
            editAble: false,
            modules: [],
            permission: ''
          }
        ]
      },
      previewPointList: [],
      submitLoading: false,
      checkAddress
    }
  },
  computed: {
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  mounted() {
    this.fetchTemplateOptions()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchTemplateOptions()
    },
    handleClose() {
      this.dialogVisible = false
      this.form = {
        templates: [
          {
            templateId: '',
            editAble: false,
            modules: [],
            permission: ''
          }
        ]
      }
      this.$refs.form.resetFields()
    },
    handleWatchModule(item) {
      getDeviceModulePointList({
        deviceModuleId: item.DeviceModuleId,
        isGetAll: true
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.previewPointList = JSON.parse(Decrypt(res.data.Data))
            if (this.userId === item.UserId) {
              // 从站设备创建人就是当前登录用户
              this.previewPointList.forEach(v => (v.fullVisible = true))
            }
            this.$refs.dialogPreviewPointList.openDialog(item.DeviceModuleName)
          } else {
            this.$message.error('从站设备点位查询失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('从站设备点位查询失败')
        })
    },
    handleWatchTemplate(item) {
      this.$refs.templateDetailDialog.openDialog({
        id: item.templateId
      })
    },
    changeTemplate(val, item) {
      const template = this.templateOptions.find(item => item.Key === val)
      const modules = []
      template.Extend.DeviceTemplate.Device_Template_ModuleList.forEach(
        item => {
          modules.push({
            addressOld: item.Address,
            address: '',
            ...item.Device_Module
          })
        }
      )
      item.modules = modules
      item.permission = template.Extend.Permission
    },
    handleRemoveFormItem(index) {
      this.form.templates.splice(index, 1)
    },
    handleAddFormItem() {
      this.form.templates.push({
        templateId: '',
        editAble: false,
        modules: [],
        permission: ''
      })
    },
    submitForm() {
      if (!this.form.templates.length) {
        this.$message('请至少添加一个模板')
        return false
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          const { templates } = this.form

          // 判断是否有同模板 + 同从站设备 + 同从站地址的情况
          const temp = []
          templates.forEach(template => {
            template.modules.forEach(module_ => {
              temp.push(
                `${template.templateId}-${module_.DeviceModuleId}-${
                  template.editAble ? module_.address : module_.addressOld
                }`
              )
            })
          })
          if ([...new Set(temp)].length !== temp.length) {
            this.$message({
              message: '同一从站设备不可以有相同的从站地址, 请修改',
              duration: 10000
            })
            return false
          }

          this.submitLoading = true
          const list = []
          templates.forEach(template => {
            template.modules.forEach(module_ => {
              list.push({
                DeviceModuleId: module_.DeviceModuleId,
                Address: template.editAble
                  ? module_.address
                  : module_.addressOld
              })
            })
          })
          this.submitLoading = false
          this.dialogVisible = false
          this.$emit('change', list)
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    fetchTemplateOptions() {
      getDeviceTemplateIncludeModuleDropdown().then(res => {
        if (res.data.Code === 200) {
          this.templateOptions = res.data.Data
        }
      })
    }
  }
}
</script>

<style lang="scss">
.template-add-dialog {
  .el-dialog__body {
    padding: 18px 26px;
  }
  .form-item-box {
    & + .form-item-box {
      margin-top: 15px;
    }
    position: relative;
    padding: 16px 20px;
    background-color: rgba(0, 0, 0, 0.04);
    .btn-danger {
      position: absolute;
      z-index: 10;
      top: 10px;
      right: 15px;
    }
  }
  .row {
    display: flex;
    align-items: flex-start;
  }

  .el-switch__label--left {
    position: relative;
    left: 46px;
    color: #fff;
    z-index: -1111;
  }
  .el-switch__label--right {
    position: relative;
    right: 46px;
    color: #fff;
    z-index: -1111;
  }
  .el-switch__label.is-active {
    z-index: 1111;
    color: #fff;
  }
  .el-switch__label--left {
    position: relative;
    left: 46px;
    color: #fff;
    z-index: -1111;
  }
  .el-switch__label--right {
    position: relative;
    right: 46px;
    color: #fff;
    z-index: -1111;
  }
  .el-switch__label--right.is-active {
    z-index: 1111;
    color: #fff !important;
  }
  .el-switch__label--left.is-active {
    z-index: 1111;
    color: #9c9c9c !important;
  }
}
</style>
