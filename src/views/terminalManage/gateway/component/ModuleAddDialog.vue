<template>
  <el-dialog
    width="570px"
    title="添加从站设备"
    append-to-body
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" size="small" hide-required-asterisk>
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
              filterable
              clearable
              style="width: 193px;"
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
              {
                validator: (rule, value, callback) =>
                  checkAddress(rule, value, callback, index),
                trigger: 'blur'
              }
            ]"
          >
            <el-input
              v-model.trim="item.address"
              style="width: 90px;"
              clearable
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-button
          v-if="item.moduleId"
          @click.native="() => handleClick(item)"
          size="medium"
          type="text"
          >{{ item.userId !== userId ? ' 查看点位' : ' 编辑' }}</el-button
        >
        <div style="float: right">
          <el-button
            v-show="item.moduleId"
            type="text"
            @click.native="() => handleCopyFormItem(item)"
          >
            <c-svg name="file-copy-fill"></c-svg>
          </el-button>
          <el-button
            class="btn-danger"
            type="text"
            v-if="form.modules.length > 1"
            @click.native="() => handleRemoveFormItem(index)"
          >
            <i class="el-icon-delete"></i>
          </el-button>
        </div>
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
      <el-button
        :loading="submitLoading"
        :disabled="loading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
    <DialogPointEdit @refresh="fetchModuleOptions" ref="dialogPointEdit" />
    <DialogPreviewPointList
      :list="previewPointList"
      ref="dialogPreviewPointList"
    />
  </el-dialog>
</template>

<script>
import { getDeviceModuleDropdown } from '@/api/deviceModule'
import DialogPointEdit from './DialogPointEdit'
import DialogPreviewPointList from './DialogPreviewPointList'
import { Decrypt } from '@/utils/secret'

const isInteger = n => {
  if (n === '') {
    return false
  }
  return parseInt(n, 10) == n
}
export default {
  props: {
    existModules: {
      type: Array,
      default: function() {
        return []
      }
    },
    projectId: {
      type: Number,
      default: function() {
        return undefined
      }
    }
  },
  components: {
    DialogPointEdit,
    DialogPreviewPointList
  },
  data() {
    const checkAddress = (rule, value, callback, index) => {
      if (isInteger(value)) {
        if (Number(value) < 1 || Number(value) > 255) {
          callback(new Error('请输入一个 1-255 之间的整数'))
        } else {
          /** 网关中已存在的模块和当前要添加的模块集合 */
          const moduleList = [...this.form.modules, ...this.existModules]
          moduleList.forEach(v => {
            if (v.moduleId) {
              v.DeviceModuleId = v.moduleId
              v.Address = v.address
            }
          })
          const currentModule = this.form.modules[index]
          if (
            moduleList.filter(
              v =>
                `${v.Address}-${v.DeviceModuleId}` ===
                `${currentModule.address}-${currentModule.moduleId}`
            ).length > 1
          ) {
            callback(new Error('同一从站设备不可以有相同的从站地址'))
            return
          }
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
        modules: [
          {
            moduleId: '',
            address: '',
            userId: -1,
            moduleType: 1 // 0:自定义模版 1:系统模版 2:企业模板 3:项目模板
          }
        ]
      },
      previewPointList: [],
      submitLoading: false,
      moduleOptions: [],
      checkAddress
    }
  },
  computed: {
    // projectId() {
    //   return this.$store.state.app.project.id
    // },
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
  mounted() {
    this.fetchModuleOptions()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchModuleOptions()
    },
    handleClose() {
      this.dialogVisible = false
      this.form.modules = [
        {
          moduleId: '',
          address: '',
          userId: -1,
          moduleType: 1 // 0:自定义模版 1:系统模版 2:企业模板 3:项目模板
        }
      ]
    },
    handleModuleChange(val, formItem) {
      let temp = undefined
      this.moduleOptions.some(module_ => {
        temp = module_.options.find(item => item.Key === val)
        return temp
      })
      const pointList = JSON.parse(Decrypt(temp.Extend.DeviceModulePointStr))
      formItem.pointList = pointList
      formItem.moduleType = temp.Extend.ModuleType
      formItem.userId = temp.Extend.UserId
    },
    handleClick(formItem) {
      if (formItem.userId !== this.userId) {
        this.previewPointList = formItem.pointList
        this.previewPointList.forEach(v => {
          v.address = formItem.address
        })
        this.$refs.dialogPreviewPointList.openDialog()
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
        moduleType: 1
      })
    },
    handleCopyFormItem(item) {
      this.form.modules.push(JSON.parse(JSON.stringify(item)))
    },
    handleRemoveFormItem(index) {
      this.form.modules.splice(index, 1)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { modules } = this.form
          if (!modules.length) {
            this.$message('请至少选择一个从站设备')
            return false
          }
          const temp = modules.map(item => `${item.moduleId}-${item.address}`)
          if ([...new Set(temp)].length < temp.length) {
            this.$message({
              message: '同一从站设备不可以有相同的从站地址, 请修改',
              duration: 10000
            })
            return false
          }
          const list = []
          modules.forEach(module_ => {
            list.push({
              DeviceModuleId: module_.moduleId,
              Address: module_.address
            })
          })
          this.$emit('change', list)
          this.dialogVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    fetchModuleOptions() {
      getDeviceModuleDropdown({
        companyId: this.companyId,
        projectId: this.projectId || undefined
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
