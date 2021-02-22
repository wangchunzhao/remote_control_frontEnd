<template>
  <el-dialog
    width="570px"
    title="编辑模板"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      v-loading="loading"
      :model="form"
      ref="form"
      size="small"
      hide-required-asterisk
    >
      <el-form-item
        prop="name"
        label="模板名称"
        label-width="76px"
        :rules="[
          {
            required: true,
            message: '请输入',
            trigger: 'blur'
          }
        ]"
      >
        <el-input
          style="width: 193px;"
          v-model.trim="form.name"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item
        label=""
        v-for="(item, index) in form.modules"
        :key="index"
        style="margin-bottom: 0;"
      >
        <el-col :span="13">
          <el-form-item
            :prop="'modules.' + index + '.moduleId'"
            :label="'从站设备' + (index + 1)"
            :rules="[
              {
                required: true,
                message: '请选择',
                trigger: 'blur'
              }
            ]"
          >
            <el-select
              @change="val => handleModuleChange(val, item)"
              v-model="item.moduleId"
              placeholder="请选择"
            >
              <el-option-group
                v-for="group in moduleOptions"
                :key="group.label"
                :label="group.label"
              >
                <el-option
                  v-for="(item, i) in group.options"
                  :key="i"
                  :label="item.Value"
                  :value="item.Key"
                ></el-option>
              </el-option-group>
              <el-option
                style="border-top: 1px solid #DCDFE6;"
                label=""
                value="customAdd"
              >
                <i class="el-icon-plus"></i>
                <span>自定义添加</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            :prop="'modules.' + index + '.address'"
            :label="'地址'"
            :rules="[
              {
                required: true,
                message: '请输入',
                trigger: 'blur'
              },
              { validator: checkAddress, trigger: 'blur' }
            ]"
          >
            <el-input
              v-model.trim="item.address"
              style="width: 80px;"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-button
          v-if="item.moduleId"
          @click.native="() => handleClick(item)"
          size="medium"
          type="text"
          >{{ item.userId !== userId ? '查看' : '编辑' }}</el-button
        >
        <el-button
          size="medium"
          class="btn-danger"
          style="float: right;"
          type="text"
          @click.native="() => handleRemoveFormItem(index)"
        >
          <i class="el-icon-delete"></i>
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          @click.native="handleAddFormItem"
          type="text"
          size="medium"
          icon="el-icon-plus"
          >增加从站设备</el-button
        >
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="medium" @click.native="() => handleClickPreview()"
        >预 览</el-button
      >
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
    <DialogPointEdit @refresh="fetchModuleOptions" ref="dialogPointEdit" />
    <PreviewDialog :list="previewPointList" ref="previewDialog" />
  </el-dialog>
</template>

<script>
import {
  getDeviceModuleDropdown,
  getDeviceModulePointList
} from '@/api/deviceModule'
import {
  addOrUpdateDeviceTemplate,
  getDeviceTemplate
} from '@/api/deviceTemplate'
import DialogPointEdit from '../component/DialogPointEdit'
import PreviewDialog from '../component/DialogPreviewPointList'
import { Decrypt } from '@/utils/secret'

const isInteger = n => {
  if (n === '') {
    return false
  }
  return parseInt(n, 10) == n
}
export default {
  components: {
    DialogPointEdit,
    PreviewDialog
  },
  data() {
    const checkAddress = (rule, value, callback) => {
      if (isInteger(value)) {
        if (Number(value) < 1 || Number(value) > 255) {
          callback(new Error('请输入一个 1-255 之间的整数'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请输入一个 1-255 之间的整数'))
      }
    }
    return {
      dialogVisible: false,
      loading: false,

      form: {
        id: undefined,
        name: '',
        modules: [
          {
            moduleId: '',
            address: '',
            moduleType: 0, // 1:系统从站设备 0： 自定义从站设备
            userId: -1
          }
        ]
      },
      submitLoading: false,
      moduleOptions: [],
      previewPointList: [],
      checkAddress
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    platform() {
      return this.$store.state.permissions.platform
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  methods: {
    openDialog(id = undefined) {
      this.dialogVisible = true
      this.form.id = id
      this.fetchModuleOptions()
      if (id) {
        this.loading = true
        getDeviceTemplate({
          deviceTemplateId: id
        })
          .then(res => {
            if (res.data.Code === 200) {
              const data = JSON.parse(Decrypt(res.data.Data))
              this.form.name = data.DeviceTemplateName

              const list = []
              data.Device_Template_ModuleList.forEach(item => {
                list.push({
                  moduleId: item.DeviceModuleId,
                  moduleType: item.Device_Module.ModuleType,
                  userId: item.Device_Module.UserId,
                  address: item.Address,
                  pointList: item.Device_Module.DeviceModulePointList
                })
              })
              this.form.modules = list
            } else {
              this.$message.error('模板数据获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('模板数据获取失败')
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    handleClose() {
      this.dialogVisible = false
      this.previewPointList = []
      this.form.id = undefined
      this.form.name = ''
      this.form.modules = [
        {
          moduleId: '',
          address: '',
          moduleType: 0, // 0:自定义模版 1:系统模版 2:企业模板 3:项目模板
          userId: -1
        }
      ]
    },
    handleModuleChange(val, formItem) {
      // 点击了自定义添加
      if (val === 'customAdd') {
        formItem.moduleId = ''
        this.$refs.dialogPointEdit.openDialog()
      } else {
        let temp = undefined
        this.moduleOptions.some(module_ => {
          temp = module_.options.find(item => item.Key === val)
          return temp
        })
        formItem.moduleType = temp.Extend.ModuleType
        const pointList = JSON.parse(Decrypt(temp.Extend.DeviceModulePointStr))
        formItem.pointList = pointList
        formItem.userId = temp.Extend.UserId
      }
    },
    handleClick(formItem) {
      if (formItem.userId !== this.userId) {
        getDeviceModulePointList({
          deviceModuleId: formItem.moduleId,
          isGetAll: true
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.previewPointList = JSON.parse(Decrypt(res.data.Data))
              if (this.userId === formItem.userId) {
                // 从站设备创建人就是当前登录用户
                this.previewPointList.forEach(v => (v.fullVisible = true))
              }
              this.$refs.previewDialog.openDialog()
            } else {
              this.$message.error('从站设备点位查询失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('从站设备点位查询失败')
          })
      } else {
        let selectModule = undefined
        this.moduleOptions.some(module_ => {
          selectModule = module_.options.find(
            item => item.Key === formItem.moduleId
          )
          return selectModule
        })
        this.$refs.dialogPointEdit.openDialog({
          id: formItem.moduleId,
          ...selectModule.Extend,
          name: selectModule.Value
        })
      }
    },
    handleAddFormItem() {
      this.form.modules.push({
        moduleId: '',
        address: '',
        moduleType: 0,
        userId: -1
      })
    },
    handleRemoveFormItem(index) {
      this.form.modules.splice(index, 1)
    },
    handleClickPreview() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { modules } = this.form
          if (!modules.length) {
            this.$message('请至少选择一个从站设备')
            return false
          }
          const temp = modules.map(item => `${item.moduleId}-${item.address}`)
          if ([...new Set(temp)].length < temp.length) {
            this.$message('同一从站设备不可以有相同的从站地址, 请修改')
            return false
          }
          let list = []
          this.form.modules.forEach(module_ => {
            module_.pointList.forEach(v => {
              v.address = module_.address
              v.fullVisible = module_.userId === this.userId
            })
            list.push(...module_.pointList)
          })
          this.previewPointList = list
          this.$refs.previewDialog.openDialog(this.form.name)
        }
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { modules, id, name } = this.form
          if (!modules.length) {
            this.$message('请至少选择一个从站设备')
            return false
          }
          const temp = modules.map(item => `${item.moduleId}-${item.address}`)
          if ([...new Set(temp)].length < temp.length) {
            this.$message('同一从站设备不可以有相同的从站地址, 请修改')
            return false
          }
          const list = []
          modules.forEach(item => {
            list.push({
              DeviceTemplateId: id,
              DeviceModuleId: item.moduleId,
              Address: item.address
            })
          })
          this.submitLoading = true
          addOrUpdateDeviceTemplate({
            DeviceTemplateId: id,
            DeviceTemplateName: name,
            Device_Template_ModuleList: list
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success(id ? '编辑成功' : '添加成功')
                this.$emit('refresh')
                this.dialogVisible = false
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error(id ? '编辑失败' : '添加失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    fetchModuleOptions() {
      getDeviceModuleDropdown({
        companyId: this.companyId,
        projectId:
          this.platform === PLATFORM.business ? this.projectId : undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            let systemOptions = []
            let customOptions = []
            let projectOptions = []
            let companyOptions = []
            // 0:自定义模版 1:系统模版 2:企业模板 3:项目模板
            data.forEach(item => {
              if (item.Extend.ModuleType === 1) {
                systemOptions.push(item)
              } else if (item.Extend.ModuleType === 0) {
                customOptions.push(item)
              } else if (item.Extend.ModuleType === 2) {
                companyOptions.push(item)
              } else if (item.Extend.ModuleType === 3) {
                projectOptions.push(item)
              }
            })
            this.moduleOptions = [
              {
                label: '系统从站设备',
                options: systemOptions
              },
              {
                label: '自定义从站设备',
                options: customOptions
              },
              {
                label: '企业从站设备',
                options: companyOptions
              },
              {
                label: '项目从站设备',
                options: projectOptions
              }
            ]
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
