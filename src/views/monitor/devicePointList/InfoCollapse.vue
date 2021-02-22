<template>
  <div class="InfoCollapse-page" v-loading="loading">
    <el-collapse v-model="activeName">
      <el-collapse-item title="一致性 Consistency" name="1">
        <template slot="title">
          <span class="info-title">基本信息</span>
          <el-button
            type="text"
            @click.stop="changeEditStatus"
            style="margin-left: 15px"
            v-show="!infoEdit"
          >
            修改
          </el-button>
          <div v-show="infoEdit" style="margin-left: 15px">
            <el-button
              type="text"
              style="color: #AFAFAF"
              @click.stop="cancelEdit"
            >
              取消
            </el-button>
            <el-button type="text" @click.stop="changeDeviceInfo">
              保存
            </el-button>
          </div>
        </template>
        <div class="page-content">
          <el-form
            :model="form"
            :rules="rules"
            ref="form"
            label-width="100px"
            size="small"
          >
            <el-row v-show="infoEdit">
              <el-col :span="8">
                <el-form-item label="设备编号：" prop="AssetsCode">
                  {{ form.AssetsCode }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="设备名称：" prop="ModelTreeName">
                  <el-input
                    v-model="form.ModelTreeName"
                    placeholder="请输入"
                    style="width: 193px"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="所属项目：" prop="projectId">
                  <el-select
                    v-model="form.projectId"
                    filterable
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in projectOptions"
                      :key="item.id"
                      :label="item.label"
                      :value="item.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="设备类型：" prop="deviceType">
                  <el-cascader
                    v-model="form.deviceType"
                    clearable
                    filterable
                    :options="monitroTypeOptions"
                    :props="{
                      value: 'ID',
                      label: 'TypeName',
                      children: 'subset'
                    }"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="关联区域：" prop="area">
                  <el-cascader
                    v-model="form.area"
                    clearable
                    filterable
                    :options="associateOptions"
                    :props="{
                      checkStrictly: true,
                      emitPath: false,
                      children: 'Child',
                      label: 'mname',
                      value: 'mtid'
                    }"
                  ></el-cascader>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-show="!infoEdit">
              <el-col :span="8">
                <el-form-item label="设备编号：" prop="AssetsCode">
                  {{ form.AssetsCode }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="设备名称：" prop="ModelTreeName">
                  {{ form.ModelTreeName }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="所属项目：" prop="projectId">
                  {{ form.ProjectName }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="设备类型：" prop="deviceType">
                  {{ form.deviceTypeName }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="关联区域：" prop="area">
                  {{ form.areaName }}
                </el-form-item>
              </el-col>
            </el-row>
            <div class="info-part-title">设备属性</div>

            <el-row v-show="infoEdit">
              <!--              静态属性-->
              <el-col
                v-if="form.ModelTreeStaticPropertyList.length"
                v-for="(item, index) in deviceAttrList"
                :key="index"
                :span="8"
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
                    placeholder="请输入"
                    style="width: 193px"
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
                          ? form.ModelTreeStaticPropertyList[
                              index
                            ].KeyValue.split('~')[0] - 0
                          : ''
                        form.ModelTreeStaticPropertyList[index].Value = form
                          .ModelTreeStaticPropertyList[index].KeyValue
                          ? form.ModelTreeStaticPropertyList[
                              index
                            ].KeyValue.split('~')[1]
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
              <!--                通用-->
              <el-col :span="8">
                <el-form-item label="SN号：" prop="SN">
                  <el-input
                    v-model="form.SN"
                    placeholder="请输入"
                    style="width: 193px"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="品牌：" prop="brand">
                  <el-input
                    v-model="form.brand"
                    placeholder="请输入"
                    style="width: 193px"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="规格型号：" prop="model">
                  <el-input
                    v-model="form.model"
                    placeholder="请输入"
                    style="width: 193px"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="出厂日期：" prop="dateTime">
                  <el-date-picker
                    v-model="form.dateTime"
                    type="date"
                    style="width: 193px"
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
              <el-col :span="8">
                <el-form-item label="设备标签：" prop="deviceLabel">
                  <el-input
                    v-model="form.deviceLabel"
                    placeholder="多个标签以英文符(;)分隔"
                    style="width: 193px"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row v-show="!infoEdit">
              <!--              静态属性-->
              <el-col
                v-for="(item, index) in form.ModelTreeStaticPropertyNameList"
                :key="index"
                :span="8"
              >
                <el-form-item :label="item.ModelTreeStaticPropertyName + '：'">
                  {{ item.ModelTreeStaticPropertyItemName }}
                </el-form-item>
              </el-col>
              <!--                通用-->
              <el-col :span="8">
                <el-form-item label="SN号：" prop="SN">
                  {{ form.SN }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="品牌：" prop="brand">
                  {{ form.brand }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="规格型号：" prop="model">
                  {{ form.model }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="出厂日期：" prop="dateTime">
                  {{ form.dateTime }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="设备标签：" prop="deviceLabel">
                  <el-tag
                    v-for="(item, index) in form.deviceLabelList"
                    style="margin-right: 10px"
                    :key="index"
                  >
                    {{ item }}
                  </el-tag>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { modelTrees } from '@/api/model_new'
import {
  getModelTreeBaseInfo,
  getModelTreeStaticProperty,
  addOrUpdateModelTree
} from '@/api/device_new'
import { monitorTypeList } from '@/api/monitorTypeProject'

export default {
  name: 'InfoCollapse',
  data() {
    return {
      infoEdit: false, //是否在编辑
      loading: false,
      activeName: '1',
      oldForm: {}, //缓存数据
      form: {
        ProjectName: '', //项目名称
        projectId: '', //项目id
        ModelTreeName: '', //设备名称
        AssetsCode: '', //设备编号
        deviceTypeName: '', //设备类型名称
        deviceType: [], //设备类型
        area: '', //关联区域id
        areaName: '', //关联区域名称
        SN: '', //sn号
        brand: '', //品牌
        model: '', //型号
        dateTime: '', //出厂日期
        deviceLabel: '', //设备标签
        deviceLabelList: [], //设备标签
        ModelTreeStaticPropertyList: [], //静态属性列表
        ModelTreeStaticPropertyNameList: [] //静态属性列表
      },
      deviceAttrList: [], //动态属性列表
      mtid: '', //设备ID
      BigTypeId: '', //设备类型 父ID
      SmallTypeId: '', //设备类型 子ID
      rules: {
        // name: [
        //   { required: true, message: '请输入', trigger: 'blur' },
        //   { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        // ],
        // deviceType: [
        //   {
        //     type: 'array',
        //     required: true,
        //     message: '请选择',
        //     trigger: 'change'
        //   }
        // ],
        // area: [
        //   {
        //     required: true,
        //     message: '请选择',
        //     trigger: 'change'
        //   }
        // ]
      },
      monitroTypeOptions: [],
      associateOptions: []
    }
  },
  watch: {
    'form.deviceType'(val) {
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
    projectId() {
      return this.$store.state.app.project.id
    },
    projectOptions() {
      return this.$store.state.app.proList
    },
    industryId() {
      return this.$store.state.app.project.Industry
    }
  },
  mounted() {
    this.mtid = this.$route.query.mtid
    this.fetchAreaOptions()
    this.fetchTableData()
  },
  methods: {
    changeEditStatus() {
      this.infoEdit = !this.infoEdit
    },
    cancelEdit() {
      this.form = this.oldForm
      this.infoEdit = false
    },
    changeDeviceInfo() {
      const {
        projectId, //项目id
        deviceType, //设备类型
        area, //关联区域
        ModelTreeStaticPropertyList, //静态属性列表
        brand, //品牌
        model, //型号
        dateTime, //出厂日期
        deviceLabel //设备标签
      } = this.form
      let PropertyList = JSON.parse(JSON.stringify(ModelTreeStaticPropertyList))
      // 静态属性列表处理
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
      let form = {}
      form.ProjectId = projectId //设备列表
      form.BigTypeId = deviceType[0] // 设备类型
      form.SmallTypeId = deviceType[1] // 设备类型
      form.LocationTreeId = area // 关联区域
      form.Brand = brand // 关联区域
      form.Spec = model // 型号
      form.MFG = dateTime // 型号
      form.Tag = deviceLabel // 型号
      form.ModelTreeStaticPropertyList = PropertyList
      form.ModelTreeList = [
        {
          ModelTreeId: this.mtid,
          ModelTreeName: this.form.ModelTreeName,
          SN: this.form.SN
        }
      ]
      this.loading = true
      addOrUpdateModelTree(form)
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.$message.success('修改信息成功')
            this.fetchTableData()
          } else {
            this.$message.error('修改信息失败')
            this.loading = false
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('修改信息失败')
          this.loading = false
        })
    },
    //获取设备信息
    fetchTableData: debounce(
      function() {
        this.loading = true
        getModelTreeBaseInfo({
          modelTreeId: this.mtid
        })
          .then(res => {
            if (res.data.Code === 200) {
              let data = res.data.Data
              let ModelTreeStaticPropertyList = []
              let PropertyList = JSON.parse(
                JSON.stringify(data.ModelTreeStaticPropertyList)
              )
              PropertyList.map(item => {
                ModelTreeStaticPropertyList.push({
                  Key: item.ModelTreeStaticPropertyItemId,
                  Value: item.ModelTreeStaticPropertyItemName,
                  KeyValue:
                    item.ModelTreeStaticPropertyItemId +
                    '~' +
                    item.ModelTreeStaticPropertyItemName
                })
              })
              let form = {
                projectId: this.projectId,
                ProjectName: data.ProjectName, //项目名称
                ModelTreeName: data.ModelTreeName, //设备名称
                AssetsCode: data.AssetsCode, //设备编号
                deviceType: [data.BigTypeId, data.SmallTypeId], //设备类型
                deviceTypeName: data.BigTypeName + '/' + data.SmallTypeName,
                area: data.LocationTreeId, //关联区域
                areaName: data.LocationTreeName, //关联区域
                SN: data.SN, //sn号
                brand: data.Brand, //品牌
                model: data.Spec, //型号
                dateTime: this._dateFormat(data.MFG, 'YYYY-MM-DD'), //出厂日期
                deviceLabel: data.Tag, //设备标签
                deviceLabelList: data.Tag ? data.Tag.split(';') : [], //设备标签
                ModelTreeStaticPropertyNameList:
                  data.ModelTreeStaticPropertyList, //静态属性名称列表
                ModelTreeStaticPropertyList
              }
              this.BigTypeId = data.BigTypeId
              this.SmallTypeId = data.SmallTypeId
              this.$emit('refreshDeviceBaseInfo', data)
              this.form = form
              this.oldForm = form
              this.infoEdit = false
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('获取设备基本信息失败')
          })
          .finally(() => {
            this.loading = false
            this.fetchMonitorTypeOption()
          })
      },
      1000,
      {
        leading: true
      }
    ),
    // 关联区域选项
    fetchAreaOptions() {
      modelTrees({
        projectId: this.projectId,
        isGetModelTree: false
      }).then(res => {
        if (res.data.Code === 200) {
          this.associateOptions = res.data.Data
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
            this.monitroTypeOptions = res.data.Data.subset
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    //获取设备静态属性
    fetchDeviceOptions() {
      getModelTreeStaticProperty({
        smallTypeId: this.SmallTypeId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.deviceAttrList = res.data.Data
            let List = this.form.ModelTreeStaticPropertyList
            let ModelTreeStaticPropertyList = []
            let ModelTreeStaticPropertyNameList = []
            this.deviceAttrList.map(item => {
              let PropertyItem = {
                Key: '',
                Value: '',
                KeyValue: ''
              }
              let namePropertyItem = {
                ModelTreeStaticPropertyName: item.ModelTreeStaticPropertyName,
                ModelTreeStaticPropertyItemName: ''
              }
              //自定义属性
              item.ModelTreeStaticPropertyItems.map(item1 => {
                List.map(item2 => {
                  if (item1.ModelTreeStaticPropertyItemId === item2.Key) {
                    PropertyItem = item2
                    namePropertyItem.ModelTreeStaticPropertyItemName =
                      item2.Value
                  }
                })
              })
              ModelTreeStaticPropertyList.push(PropertyItem)
              ModelTreeStaticPropertyNameList.push(namePropertyItem)
            })
            this.form.ModelTreeStaticPropertyList = ModelTreeStaticPropertyList
            this.form.ModelTreeStaticPropertyNameList = ModelTreeStaticPropertyNameList
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取设备静态属性失败')
        })
    }
  }
}
</script>

<style lang="scss">
.InfoCollapse-page {
  .page-content {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
  .el-collapse {
    border: none;
  }
  .el-collapse-item__wrap {
    border: none;
  }
  .el-collapse-item__header {
    border: none;
  }
}
</style>
<style scoped lang="scss">
.info-title {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 24px;
}
.info-part-title {
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
  margin-bottom: 16px;
}
</style>
