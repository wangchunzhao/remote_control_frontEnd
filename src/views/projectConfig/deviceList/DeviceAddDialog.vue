<template>
  <el-dialog
    width="720px"
    title="新增设备"
    :visible.sync="dialogVisible"
    @close="handleClose"
    :append-to-body="true"
  >
    <!--    <el-alert-->
    <!--      type="info"-->
    <!--      show-icon-->
    <!--      style="background-color: #E6F7FF;margin-bottom: 20px;"-->
    <!--    >-->
    <!--      <div slot="title">-->
    <!--        若数据已上线，可以前往-->
    <!--        <el-link-->
    <!--          @click.native="-->
    <!--            () => {-->
    <!--              dialogVisible = false-->
    <!--              $router.push({ name: 'pointAssociate' })-->
    <!--            }-->
    <!--          "-->
    <!--          type="primary"-->
    <!--          :underline="false"-->
    <!--          style="font-size: 12px;"-->
    <!--          >点位关联</el-link-->
    <!--        >-->
    <!--        页面批量生成设备。-->
    <!--      </div>-->
    <!--    </el-alert>-->

    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="130px"
      style="margin-right: 60px;"
      size="small"
    >
      <el-form-item label="设备类型：" prop="type">
        <el-cascader
          v-model="form.type"
          :options="monitroTypeOptions"
          :props="{
            value: 'ID',
            label: 'TypeName',
            children: 'subset'
          }"
        />
      </el-form-item>
      <el-row v-for="(item, index) in form.devices" :key="index">
        <el-col :span="12">
          <el-form-item
            :label="'设备' + (index + 1) + '：'"
            :prop="'devices.' + index + '.name'"
            :rules="{
              required: true,
              message: '请输入',
              trigger: 'blur'
            }"
          >
            <el-input
              clearable
              style="width: 180px"
              v-model="item.name"
              placeholder="请输入设备名称"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="SN号：" :prop="'devices.' + index + '.name'">
            <el-input
              clearable
              style="width: 180px"
              v-model="item.SN"
              placeholder="请输入SN号"
            ></el-input>
            <el-button
              size="medium"
              class="btn-danger"
              v-if="form.devices.length > 1"
              style="float: right;"
              type="text"
              @click.native="() => handleRemoveFormItem(index)"
            >
              <i class="el-icon-delete"></i>
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <div style="margin-left: 20px;">
        <el-button
          @click.native="handleAddFormItem"
          type="text"
          size="medium"
          icon="el-icon-plus"
          >增加设备</el-button
        >
      </div>
      <div style="margin-left: 20px;">
        <el-button
          @click.native="() => (deviceAttrShow = !deviceAttrShow)"
          type="text"
          size="medium"
        >
          添加设备属性
          <i v-show="!deviceAttrShow" class="el-icon-arrow-down"></i>
          <i v-show="deviceAttrShow" class="el-icon-arrow-up"></i>
        </el-button>
      </div>
      <div v-show="deviceAttrShow">
        <el-row>
          <el-col
            v-if="form.ModelTreeStaticPropertyList.length"
            v-for="(item, index) in deviceAttrList"
            :key="index"
            :span="12"
          >
            <el-form-item :label="item.ModelTreeStaticPropertyName + '：'">
              <el-input
                v-if="
                  item.ModelTreeStaticPropertyItems.length &&
                    item.ModelTreeStaticPropertyItems[0].IsCustom === 1
                "
                v-model="form.ModelTreeStaticPropertyList[index].Value"
                @change="
                  () => {
                    form.ModelTreeStaticPropertyList[index].Key =
                      item.ModelTreeStaticPropertyItems[0].ModelTreeStaticPropertyItemId
                    form.ModelTreeStaticPropertyList[index].KeyValue =
                      form.ModelTreeStaticPropertyList[index].Key +
                      '~' +
                      form.ModelTreeStaticPropertyList[index].Value
                  }
                "
                :placeholder="
                  item.ModelTreeStaticPropertyName &&
                  item.ModelTreeStaticPropertyName.indexOf('上下限') >= 0
                    ? '以英文符(~)分隔'
                    : '请输入'
                "
                style="width: 180px"
              ></el-input>
              <el-select
                v-else
                v-model="form.ModelTreeStaticPropertyList[index].KeyValue"
                filterable
                placeholder="请选择"
                @change="
                  val => {
                    form.ModelTreeStaticPropertyList[index].Key = form
                      .ModelTreeStaticPropertyList[index].KeyValue
                      ? form.ModelTreeStaticPropertyList[index].KeyValue.split(
                          '~'
                        )[0] - 0
                      : ''
                    form.ModelTreeStaticPropertyList[index].Value = form
                      .ModelTreeStaticPropertyList[index].KeyValue
                      ? form.ModelTreeStaticPropertyList[index].KeyValue.split(
                          '~'
                        )[1]
                      : ''
                  }
                "
              >
                <el-option
                  v-for="item1 in item.ModelTreeStaticPropertyItems"
                  :key="
                    item1.ModelTreeStaticPropertyItemId +
                      '~' +
                      item1.ModelTreeStaticPropertyItemName
                  "
                  :label="item1.ModelTreeStaticPropertyItemName"
                  :value="
                    item1.ModelTreeStaticPropertyItemId +
                      '~' +
                      item1.ModelTreeStaticPropertyItemName
                  "
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌：" prop="brand">
              <el-input
                v-model="form.brand"
                placeholder="请输入"
                style="width: 180px"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号：" prop="model">
              <el-input
                v-model="form.model"
                placeholder="请输入"
                style="width: 180px"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出厂日期：" prop="dateTime">
              <el-date-picker
                v-model="form.dateTime"
                type="date"
                style="width: 180px"
                value-format="yyyy-MM-dd"
                :picker-options="{
                  disabledDate: time => {
                    return time > new Date()
                  }
                }"
                placeholder="选择日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备标签：" prop="deviceLabel">
              <el-input
                v-model="form.deviceLabel"
                placeholder="多个标签以英文符(;)分隔"
                style="width: 180px"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <span slot="footer">
      <el-button
        size="medium"
        :loading="submitLoading"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { monitorTypeList } from '@/api/monitorTypeProject'
import {
  getModelTreeStaticProperty,
  addOrUpdateModelTree
} from '@/api/device_new'

export default {
  props: {
    systemId: Number
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      deviceAttrShow: false,

      BigTypeId: '', //设备类型 父ID
      SmallTypeId: '', //设备类型 子ID
      deviceAttrList: [], //静态属性列表
      form: {
        devices: [
          {
            name: ''
          }
        ],
        type: [],
        ModelTreeStaticPropertyList: [], //静态属性值列表
        brand: '', //品牌
        model: '', //型号
        dateTime: '', //出厂日期
        deviceLabel: '' //设备标签
      },
      rules: {
        type: [
          {
            required: true,
            type: 'array',
            message: '请选择',
            trigger: 'change'
          }
        ]
      },
      monitroTypeOptions: []
    }
  },
  watch: {
    'form.type'(val) {
      if (val && val.length && val.length > 1) {
        this.BigTypeId = val[0]
        this.SmallTypeId = val[1]
        this.fetchDeviceOptions()
      } else {
        this.BigTypeId = ''
        this.SmallTypeId = ''
        this.form.ModelTreeStaticPropertyList = []
      }
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    industryId() {
      return this.$store.state.app.project.Industry
    },

    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchMonitorTypeOption()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.form = {
        devices: [
          {
            name: '',
            SN: ''
          }
        ],
        type: []
      }
      this.$refs.form.resetFields()
    },
    handleAddFormItem() {
      this.form.devices.push({
        name: '',
        SN: ''
      })
    },
    handleRemoveFormItem(index) {
      this.form.devices.splice(index, 1)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const {
            type,
            devices,
            ModelTreeStaticPropertyList, //静态属性列表
            brand, //品牌
            model, //型号
            dateTime, //出厂日期
            deviceLabel //设备标签
          } = this.form
          let PropertyList = JSON.parse(
            JSON.stringify(ModelTreeStaticPropertyList)
          )
          // 删除自定义字段、空值
          for (let i = 0; i < PropertyList.length; i++) {
            let item = PropertyList[i]
            if (item.KeyValue) {
              delete item.KeyValue
            } else {
              PropertyList.splice(i, 1)
              i--
            }
          }
          let form = {
            ProjectId: this.projectId,
            BigTypeId: type[0],
            SmallTypeId: type[1],
            LocationTreeId: undefined,
            Brand: brand, // 关联区域
            Spec: model, // 型号
            MFG: dateTime, // 型号
            Tag: deviceLabel, // 型号
            ModelTreeStaticPropertyList: PropertyList,
            ModelTreeList: devices.map(item => ({
              ModelTreeName: item.name,
              SN: item.SN
            }))
          }
          addOrUpdateModelTree(form)
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('设备添加成功')
                this.$emit('refresh')
                this.dialogVisible = false
              } else {
                this.$message.error('设备添加失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('设备添加失败')
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
    // 监控分类选项
    fetchMonitorTypeOption() {
      monitorTypeList({
        projectId: this.projectId,
        industry: this.industryId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data.subset
            if (this.systemId) {
              this.monitroTypeOptions = data.filter(
                // 这里this.systemId 是string , item.ID是 number
                item => item.ID == this.systemId
              )
            } else {
              this.monitroTypeOptions = data
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    //获取设备动态属性
    fetchDeviceOptions() {
      getModelTreeStaticProperty({
        smallTypeId: this.SmallTypeId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.deviceAttrList = res.data.Data
            let ModelTreeStaticPropertyList = []
            for (let i = 0; i < this.deviceAttrList.length; i++) {
              ModelTreeStaticPropertyList.push({
                Key: '',
                Value: '',
                KeyValue: ''
              })
            }
            this.form.ModelTreeStaticPropertyList = ModelTreeStaticPropertyList
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
