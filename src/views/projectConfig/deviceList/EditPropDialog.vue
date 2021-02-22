<template>
  <el-dialog
    width="720px"
    title="变更设备属性"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-alert
      type="info"
      show-icon
      style="background-color: #E6F7FF;margin-bottom: 20px;"
    >
      <div slot="title">
        请变更所选设备中相同属性，其他不同属性可在每个设备的详情中进行编辑添加。
      </div>
    </el-alert>
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
      <el-form-item label="项目：" prop="projectId">
        <el-select v-model="form.projectId" filterable placeholder="请选择">
          <el-option
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="12">
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
        <el-col :span="12">
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
              style="width: 193px"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格型号：" prop="model">
            <el-input
              v-model="form.model"
              placeholder="请输入"
              style="width: 193px"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出厂日期：" prop="dateTime">
            <el-date-picker
              v-model="form.dateTime"
              type="date"
              style="width: 193px"
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
              style="width: 193px"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <!--      设备列表-->
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item title="设备列表" name="1">
          <el-table
            ref="table"
            :data="List"
            class="asset-table"
            style="width: 100%"
            show-overflow-tooltip
          >
            <el-table-column
              min-width="110"
              prop="AssetsCode"
              label="设备编号"
            />
            <el-table-column prop="ModelTreeName" label="设备名称">
              <template slot-scope="{ row }">
                <template v-if="row.editStatus">
                  <el-input
                    v-model="row.ModelTreeName"
                    placeholder="请输入"
                  ></el-input>
                </template>
                <span v-else>{{ row.ModelTreeName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="SN" label="SN号">
              <template slot-scope="{ row }">
                <template v-if="row.editStatus">
                  <el-input v-model="row.SN" placeholder="请输入"></el-input>
                </template>
                <span v-else>{{ row.SN }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" prop="edit">
              <template slot-scope="{ row }">
                <div v-if="row.editStatus">
                  <el-button
                    type="text"
                    style="color: #AFAFAF"
                    @click.native="cancelEdit(row)"
                  >
                    取消
                  </el-button>
                  <el-button type="text" @click.native="rowEditReg(row)">
                    确认
                  </el-button>
                </div>
                <el-button v-else type="text" @click.native="editRow(row)">
                  修改
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrap">
            <el-pagination
              background
              :current-page.sync="pagination.currentPage"
              :page-size.sync="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              @size-change="handleSizeChange"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
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
  </el-dialog>
</template>

<script>
import { modelTrees } from '@/api/model_new'
import {
  getModelTreeStaticProperty,
  addOrUpdateModelTree
} from '@/api/device_new'
import { monitorTypeList } from '@/api/monitorTypeProject'
export default {
  props: {
    ids: Array
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      activeNames: ['1'],
      form: {
        projectId: '', //项目id
        deviceType: [], //设备类型
        area: '', //关联区域
        brand: '', //品牌
        model: '', //型号
        dateTime: '', //出厂日期
        deviceLabel: '', //设备标签

        ModelTreeStaticPropertyList: [] //静态属性列表
      },
      BigTypeId: '', //设备类型 父ID
      SmallTypeId: '', //设备类型 子ID
      List: [],
      deviceAttrList: [], //动态属性列表
      pagination: {
        currentPage: 1,
        total: 0,
        pageSize: 10
      },
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
    this.form.projectId = this.projectId
    this.fetchAreaOptions()
    this.fetchMonitorTypeOption()
  },
  methods: {
    openDialog(List) {
      for (let i = 0; i < List.length; i++) {
        List[i].oldModelTreeName = List[i].ModelTreeName
        List[i].Index = i
        List[i].oldSN = List[i].SN
        List[i].editStatus = false
      }
      this.pagination = {
        currentPage: 1,
        total: List.length,
        pageSize: 10
      }
      this.List = List
      this.dialogVisible = true
    },
    rowEditReg(row) {
      if (row.ModelTreeName && row.SN) {
        this.List[row.Index].editStatus = false
        this.List = [...this.List]
      } else if (!row.ModelTreeName) {
        this.$message.error('请输入设备名称')
      } else {
        this.$message.error('请输入SN号')
      }
    },
    editRow(row) {
      this.List[row.Index].editStatus = true
      this.List = [...this.List]
    },
    cancelEdit(row) {
      this.List[row.Index].ModelTreeName = row.oldModelTreeName
      this.List[row.Index].SN = row.oldSN
      this.List[row.Index].editStatus = false
      this.List = [...this.List]
    },
    // 修改每页显示的数量
    handleSizeChange() {
      this.pagination.currentPage = 1
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 设备列表校验
          let List = []
          for (let i = 0; i < this.List.length; i++) {
            if (this.List[i].editStatus) {
              this.$message.error('请确认设备信息')
              return
            } else if (!this.List[i].ModelTreeName) {
              this.$message.error('请输入设备名称')
              return
            } else {
              List.push({
                ModelTreeId: this.List[i].ModelTreeId,
                ModelTreeName: this.List[i].ModelTreeName,
                SN: this.List[i].SN
              })
            }
          }
          this.submitLoading = true
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
          let PropertyList = JSON.parse(
            JSON.stringify(ModelTreeStaticPropertyList)
          )
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
          form.ModelTreeList = List //设备列表
          form.BigTypeId = deviceType[0] // 设备类型
          form.SmallTypeId = deviceType[1] // 设备类型
          form.LocationTreeId = area // 关联区域
          form.Brand = brand // 关联区域
          form.Spec = model // 型号
          form.MFG = dateTime // 型号
          form.Tag = deviceLabel // 型号
          form.ModelTreeStaticPropertyList = PropertyList

          addOrUpdateModelTree(form)
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('属性变更成功')
                this.$emit('refresh')
                this.dialogVisible = false
              } else {
                this.$message.error('属性变更失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('属性变更失败')
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
