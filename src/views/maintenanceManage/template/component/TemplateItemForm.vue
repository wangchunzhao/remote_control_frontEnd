<template>
  <el-dialog
    width="640px"
    title="编辑维保内容"
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
      <el-form-item label="维保项名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="内容类型" prop="type">
        <el-select v-model="form.type" :disabled="Boolean(itemId)">
          <!-- // 0:选择项 1:数值 2:是否 3:文本 4:清单 -->
          <el-option label="选择项" :value="0"></el-option>
          <el-option label="数值" :value="1"></el-option>
          <el-option label="是/否" :value="2"></el-option>
          <el-option label="文本" :value="3"></el-option>
          <el-option label="检查清单" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <template v-if="form.type === 0">
        <el-form-item
          v-for="(item, index) in form.items0"
          :label="'选项' + (index + 1)"
          :key="index"
          :prop="'items0.' + index + '.value'"
          :rules="[
            {
              required: true,
              message: '不能为空',
              trigger: 'blur'
            }
          ]"
        >
          <el-input style="width: 192px;" v-model="item.value"></el-input>
          <el-button
            v-if="form.items0.length !== 1"
            class="btn-danger"
            type="text"
            style="padding: 6px;"
            @click.native="removeInput(index)"
          >
            <i
              class="el-icon-remove"
              style="font-size: 18px;margin-left: 5px;"
            />
          </el-button>
        </el-form-item>
      </template>
      <template v-if="form.type === 1">
        <el-form-item
          v-for="(item, index) in form.items1"
          :label="'数值' + (index + 1)"
          required
          prop="type"
          style="margin-bottom: 0;"
          :key="index"
        >
          <el-col :span="8">
            <el-form-item
              :prop="'items1.' + index + '.name'"
              :rules="{
                required: true,
                message: '不能为空',
                trigger: 'blur'
              }"
            >
              <el-input v-model="item.name" placeholder="名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">&nbsp;</el-col>
          <el-col :span="8">
            <el-form-item
              :prop="'items1.' + index + '.referenceValue'"
              :rules="{
                pattern: /^[a-zA-Z0-9_.\u4e00-\u9fa5]+$/,
                message: '不可有特殊字符'
              }"
            >
              <el-input
                v-model="item.referenceValue"
                placeholder="参考值"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">&nbsp;</el-col>
          <el-col :span="5">
            <el-form-item
              :prop="'items1.' + index + '.unit'"
              :rules="{
                required: true,
                message: '不能为空',
                trigger: 'blur'
              }"
            >
              <el-input v-model="item.unit" placeholder="单位"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">
            <el-button
              v-if="form.items1.length !== 1"
              class="btn-danger"
              type="text"
              style="padding: 6px;"
              @click.native="removeInput(index)"
            >
              <i
                class="el-icon-remove"
                style="font-size: 18px;margin-left: 5px;"
              />
            </el-button>
          </el-col>
        </el-form-item>
      </template>
      <el-form-item
        v-if="form.type === 3"
        label="参考内容"
        :rules="{
          required: true,
          message: '不能为空',
          trigger: 'blur'
        }"
        prop="referenceText3"
      >
        <el-input v-model="form.referenceText3"></el-input>
      </el-form-item>
      <template v-if="form.type === 4">
        <el-form-item
          v-for="(item, index) in form.items4"
          :label="'清单项' + (index + 1)"
          :key="index"
          :prop="'items4.' + index + '.value'"
          :rules="{
            required: true,
            message: '不能为空',
            trigger: 'blur'
          }"
        >
          <el-input style="width: 192px;" v-model="item.value"></el-input>
          <el-button
            v-if="form.items4.length !== 1"
            class="btn-danger"
            type="text"
            style="padding: 6px;"
            @click.native="removeInput(index)"
          >
            <i
              class="el-icon-remove"
              style="font-size: 18px;margin-left: 5px;"
            />
          </el-button>
        </el-form-item>
      </template>
      <div
        v-if="form.type !== 3 && form.type !== 2"
        style="margin-left: 100px;"
        @click="addInput"
      >
        <el-button icon="el-icon-plus" type="text">新增</el-button>
      </div>
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
import { addOrUpdateMaintenanceTemplateItem } from '@/api/maintenanceTemplate'

export default {
  data() {
    return {
      visible: false,

      itemId: undefined,
      groupName: '',
      templateId: undefined,

      form: {
        name: '',
        type: 0,
        items0: [
          {
            value: ''
          }
        ],
        items1: [
          {
            name: '',
            referenceValue: '',
            unit: ''
          }
        ],
        referenceText3: '',
        items4: [
          {
            value: ''
          }
        ]
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    }
  },
  methods: {
    openDialog({
      itemId,
      itemName,
      templateId,
      groupName,
      templateType,
      contents,
      order
    }) {
      this.visible = true
      this.order = order

      // 说明是编辑
      if (itemId) {
        this.itemId = itemId
        this.form.name = itemName
        this.form.type = templateType
        if (templateType === 0) {
          this.form.items0 = contents
        } else if (templateType === 1) {
          this.form.items1 = contents
        } else if (templateType === 2) {
          // 是/否类型，不用处理
        } else if (templateType === 3) {
          this.form.referenceText3 = contents.value
        } else if (templateType === 4) {
          this.form.items4 = contents
        }
      }
      this.templateId = templateId
      this.groupName = groupName
    },
    handleClose() {
      this.visible = false
      this.itemId = undefined
      this.templateId = undefined
      this.order = undefined
      this.groupName = ''
      this.form = {
        name: '',
        type: 0,
        items0: [
          {
            value: ''
          }
        ],
        items1: [
          {
            name: '',
            referenceValue: '',
            unit: ''
          }
        ],
        referenceText3: '',
        items4: [
          {
            value: ''
          }
        ]
      }
    },
    addInput() {
      const { type } = this.form
      if (type === 0) {
        this.form.items0.push({
          value: ''
        })
      } else if (type === 1) {
        this.form.items1.push({
          name: '',
          referenceValue: '',
          unit: ''
        })
      } else if (type === 4) {
        this.form.items4.push({
          value: ''
        })
      }
    },
    removeInput(index) {
      const { type } = this.form
      if (this.form.type === 0) {
        this.form.items0.splice(index, 1)
      } else if (type === 1) {
        this.form.items1.splice(index, 1)
      } else if (type === 4) {
        this.form.items4.splice(index, 1)
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {
            name,
            type,
            items0,
            items1,
            items4,
            referenceText3
          } = this.form

          let templateContent = {}
          if (type === 0) {
            items0.forEach(item => {
              templateContent[item.value] = false
            })
          } else if (type === 1) {
            items1.forEach(item => {
              templateContent[item.name] = {
                Value: item.referenceValue,
                Unit: item.unit
              }
            })
          } else if (type === 2) {
            templateContent = {
              // eslint-disable-next-line prettier/prettier
              '是': false,
              // eslint-disable-next-line prettier/prettier
              '否': false
            }
          } else if (type == 3) {
            templateContent = {
              key: referenceText3
            }
          } else if (type === 4) {
            items4.forEach(item => {
              templateContent[item.value] = false
            })
          }

          addOrUpdateMaintenanceTemplateItem({
            MaintenanceTemplateItemId: this.itemId,
            MaintenanceTemplateItemName: name,
            MaintenanceTemplateId: this.templateId,
            GroupName: this.groupName,
            TemplateType: type,
            TemplateContent: JSON.stringify(templateContent),
            Order: this.order
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('维保项更新成功')
                this.visible = false
                this.$emit('refresh')
              } else {
                this.$message.error('维保项更新失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('维保项更新失败')
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
