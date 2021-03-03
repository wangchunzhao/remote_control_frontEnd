<template>
  <el-dialog
    title="编辑项目"
    width="450px"
    top="100px"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
    class="projectEditDialog"
  >
    <div class="project-edit-dialog">
      <el-form
        ref="form"
        :rules="formRules"
        size="small"
        :model="form"
        label-width="80px"
        style="width: 100%"
      >
        <el-form-item prop="pname" label="项目名称">
          <el-input
            v-model.trim="form.pname"
            placeholder="项目名称"
            style="width: 100%;"
            clearable
            size="medium"
          />
        </el-form-item>
        <el-form-item
          prop=""
          label="项目地址"
          required
          style="margin-bottom: 20px"
        >
          <el-col :span="11" style="position: relative">
            <el-form-item prop="region">
              <el-cascader
                v-model="form.region"
                clearable
                ref="cascaderAddr"
                filterable
                :options="regionOptions"
                placeholder="省 / 市 / 区"
                style="width: 100%;"
                size="medium"
              />
              <el-link
                :underline="false"
                type="primary"
                size="small"
                @click.native="handleClickMapBtn"
                style="position: absolute;left:0;bottom: -30px"
              >
                在地图中查找
              </el-link>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="1">&nbsp;</el-col>
          <el-col :span="12">
            <el-form-item prop="stree">
              <el-input
                v-model.trim="form.stree"
                clearable
                placeholder="详细街道地址"
                style="width: 100%;"
                size="medium"
              />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item
          label="所属分区"
          :rules="[
            {
              required: true,
              message: '请选择分区',
              trigger: 'blur'
            }
          ]"
          prop="subarea"
        >
          <el-select
            v-model="form.subarea"
            style="width: 100%;"
            placeholder="请选择分区"
          >
            <el-option
              v-for="item in subareaOptions"
              :key="item.SubareaId"
              :label="item.SubareaName"
              :value="item.SubareaId"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="关联网关"
          v-if="gatewayOptions.length"
          :rules="[
            {
              required: true,
              message: '请选择',
              trigger: 'blur'
            }
          ]"
          prop="gatewayId"
        >
          <el-select
            v-model="form.gatewayId"
            style="width: 100%;"
            placeholder="请选择"
          >
            <el-option
              v-for="item in gatewayOptions"
              :key="item.id"
              :label="item.NAME"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="describe" label="项目简介">
          <el-input
            v-model="form.describe"
            :rows="6"
            type="textarea"
            placeholder=""
            size="medium"
          />
        </el-form-item>
        <el-form-item prop="industry" label="行业类型">
          <el-select
            v-model="form.industry"
            @change="handleChangeIndustry"
            placeholder="请选择"
            clearable
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="item in industryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="level" label="项目等级">
          <el-select
            v-model="form.level"
            placeholder="请选择"
            clearable
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="tag" label="项目标签">
          <div style="margin-bottom: 10px" v-if="tagList.length < 5">
            <el-input
              class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleTagInputConfirm"
              @blur="handleTagInputConfirm"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              size="small"
              @click="showTagInput"
            >
              + 标签
            </el-button>
          </div>
          <el-tag
            v-for="(item, index) in tagList"
            :key="index"
            closable
            effect="plain"
            :disable-transitions="false"
            @close="handleDeleteTag(index)"
            style="margin-right: 5px;margin-bottom: 5px"
          >
            {{ item }}
          </el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          size="medium"
          type="primary"
          @click.native="submit"
          :loading="submitLoading"
        >
          确 定
        </el-button>
      </div>

      <GetPositionDialog
        @change="handleSetPoistion"
        :appendToBody="true"
        ref="getPositionDialog"
      />
    </div>
  </el-dialog>
</template>

<script>
import regionData from '@/assets/json/region.json'
import { uploadFile } from '@/api/uploader'
import GetPositionDialog from '@/components/GetPositionDialog'
import { industryOptions } from '@/utils/enum'
import { updateProjectDevices } from '@/api/device_new'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

dayjs.extend(LocalizedFormat)
import {
  getProjectModelList,
  getSubareaOptions,
  addProject,
  editProject,
  isNameExist,
  getProject
} from '@/api/subarea'

const applicationOptions = [
  {
    name: '设备监测',
    icon: 'power',
    industrys: [1, 2, 3, 4]
  },
  {
    name: '报警管理',
    icon: 'bell-fill',
    industrys: [1, 2, 3, 4]
  },
  {
    name: '事件中心',
    icon: 'file-copy-fill',
    industrys: [1, 2, 3, 4]
  },
  {
    name: '维修保养',
    icon: 'wrench-fill',
    industrys: [1, 2, 3, 4]
  },
  {
    name: '能耗管理',
    icon: 'piechart-circle-fil',
    industrys: [2]
  },
  {
    name: '资产管理',
    icon: 'database-fill',
    industrys: [1, 2, 3, 4]
  },
  {
    name: '项目配置',
    icon: 'setting-fill',
    industrys: [1, 2, 3, 4]
  },
  {
    name: '终端管理',
    icon: 'zhongduanguanli-mian',
    industrys: [1, 2, 3, 4]
  },
  {
    name: '操作日志',
    icon: 'file-text-fill',
    industrys: [1, 2, 3, 4]
  },
  {
    name: '验证校验',
    icon: 'safetycertificate-f',
    industrys: [1]
  },
  {
    name: '数据下载',
    icon: 'excelshujuxiazai',
    industrys: [1, 2, 3, 4]
  }
]

export default {
  components: {
    GetPositionDialog
  },
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    companyIdProp: {
      type: Number,
      default: function() {
        return 0
      }
    },
    subareaId: Number,
    subareaOptionsProp: {
      type: Array,
      default: function() {
        return null
      }
    },
    gatewayOptions: {
      type: Array,
      default: function() {
        return []
      }
    },
    isRefresh: {
      type: Boolean,
      default: function() {
        return true
      }
    }
  },

  data() {
    const checkName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入'))
      }
      if (value === this.oldProjectName) {
        callback()
        return false
      }
      isNameExist({
        subareaName: value,
        companyId: this.companyIdProp || this.companyId
      }).then(res => {
        if (res.data.Data.IsExist) {
          callback(new Error('该名称已被使用'))
        } else {
          callback()
        }
      })
    }
    return {
      dialogVisible: false,
      submitLoading: false,
      tagList: ['标签一', '标签二', '标签三'],
      inputVisible: false,
      inputValue: '',

      form: {
        id: undefined,
        pname: '',
        region: [],
        stree: '',
        subarea: '',
        describe: '',
        industry: '',
        level: '',
        projectCode: '',
        imgurl: '',
        imgFormData: undefined,
        createDate: '',
        expireDate: '',
        gatewayId: undefined
      },
      formRules: {
        pname: [{ validator: checkName, trigger: 'blur' }],
        region: [
          {
            required: true,
            type: 'array',
            message: '请选择',
            trigger: 'change'
          }
        ],
        industry: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        level: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        subarea: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        stree: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      systemList: [],
      applicationList: [],
      subareaOptions: [],
      regionOptions: regionData,
      industryOptions,
      levelOptions: [
        {
          label: '重要',
          value: 1
        },
        {
          label: '一般',
          value: 2
        }
      ]
    }
  },
  computed: {
    companyId() {
      return (this.$store.state.app.company || {}).id
    },
    projectId() {
      return (this.$store.state.app.project || {}).id
    }
  },
  watch: {
    subareaId: {
      handler: function(val) {
        this.form.subarea = val
      },
      immediate: true
    },
    subareaOptionsProp: {
      handler: function(val) {
        if (val) {
          this.subareaOptions = val
        }
      },
      immediate: true
    },
    projectId: {
      handler: function(val) {
        if (val) {
          getProject({
            projectId: val
          })
            .then(res => {
              if (res.data.Code === 200) {
                const data = res.data.Data
                const {
                  ProjectId,
                  ProjectName,
                  Address,
                  SubareaId,
                  Describe,
                  Industry,
                  ProjectImage,
                  ProjectCode,
                  CreateTime,
                  ExpireTime
                } = data
                this.form.industry = Industry
                this.form.id = ProjectId
                this.form.pname = ProjectName
                this.oldProjectName = ProjectName
                this.form.region = Address.split(';')[0].split(',')
                this.form.stree = Address.split(';')[2]
                this.form.subarea = SubareaId
                this.form.describe = Describe
                this.form.imgurl = ProjectImage
                this.form.projectCode = ProjectCode
                this.form.createDate = CreateTime
                this.form.expireDate = ExpireTime
                this.fetchSystemList(Industry)
                this.applicationList = applicationOptions.filter(v => {
                  return v.industrys.includes(Industry)
                })
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
      },
      immediate: true
    },
    companyIdProp(val) {
      if (val && !this.subareaOptionsProp) {
        this.fetchOptions()
      }
    }
  },
  mounted() {
    if (!this.subareaOptionsProp) {
      this.fetchOptions()
    }
  },
  methods: {
    handleDeleteTag(index) {
      this.tagList.splice(index, 1)
    },
    showTagInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleTagInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        this.tagList.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    openDialog() {
      this.dialogVisible = true
      this.$refs.form && this.$refs.form.clearValidate()
    },
    handleClose() {
      this.dialogVisible = false
      this.submitLoading = false
    },
    dateFormat(date) {
      return dayjs(date).format('LL')
    },
    showExpireMsg(date) {
      return new Date() > new Date(date)
    },
    resetForm() {
      this.form.id = undefined
      this.form.pname = ''
      this.form.region = []
      this.form.stree = ''
      this.form.describe = ''
      this.form.industry = ''
      this.form.projectCode = ''
      this.form.imgurl = ''
      this.form.imgFormData = undefined
      this.form.gatewayId = undefined
      this.$refs.form.resetFields()
    },
    handleClickMapBtn() {
      let address = ''
      if (this.form.region.length && this.form.stree) {
        address =
          this.$refs['cascaderAddr'].inputValue.replace(/\s+/g, '') +
          this.form.stree
      }

      this.$refs.getPositionDialog.openDialog(address)
    },
    handleSetPoistion({ street, adcode }) {
      this.form.stree = street
      if (adcode) {
        const res = find(regionData, adcode.toString())
        if (res && res.length) {
          this.form.region = res.map(v => v.value)
        }
      }
    },
    handleChangeIndustry(val) {
      this.fetchSystemList(val)
      this.applicationList = applicationOptions.filter(v => {
        return v.industrys.includes(val)
      })
    },
    submit(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // "130000,130100,130132;河北省石家庄市元氏县;槐阳大街北段路西"
          let form = JSON.parse(JSON.stringify(this.form))
          form.address = this.$refs['cascaderAddr'].inputValue.replace(
            /\s+/g,
            ''
          )
          form.address =
            this.form.region.join(',') +
            ';' +
            form.address +
            ';' +
            this.form.stree

          this.submitLoading = true
          if (this.projectId) {
            // 编辑项目
            const { imgFormData } = this.form
            if (imgFormData) {
              imgFormData.append('BucketName', 'front-end-assets')
              imgFormData.append('ObjectName', `images_app/项目背景图/`)
              await uploadFile(imgFormData).then(res => {
                if (res.data.Code === 200) {
                  form.imgurl = res.data.Data[0]
                } else {
                  this.$message.error('图片上传失败')
                }
              })
            }
            editProject(form, form.subarea)
              .then(res => {
                const data = res.data
                if (data.Code === 200) {
                  this.$message.success('项目编辑成功')
                  this.$emit('complete')
                  this.$store.dispatch('fetchCompanyStruct')
                  this.$store.dispatch('fetchUserOwnSubareaTree')
                  this.$store.dispatch('fetchProject')
                } else {
                  this.$message.error('项目编辑失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('项目编辑失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            // 新增项目
            addProject(form, form.subarea)
              .then(res => {
                const data = res.data
                if (data.Code === 200) {
                  this.$message.success('项目添加成功')
                  this.$emit('complete', data.Data)
                  if (this.form.gatewayId) {
                    this.gatewayAssociateProject(data.Data, this.form.gatewayId)
                  }
                  if (this.isRefresh) {
                    this.$store.dispatch('fetchCompanyStruct')
                    this.$store.dispatch('fetchUserOwnSubareaTree')
                    this.$store.dispatch('fetchProject')
                  }
                } else {
                  this.$message.error('项目添加失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('项目添加失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          }
        } else {
          return false
        }
      })
    },
    // 网关关联项目
    gatewayAssociateProject(projectId, gatewayId) {
      updateProjectDevices({
        deviceID: gatewayId,
        projectId: projectId
      }).then(res => {
        if (res.data.Code !== 200) {
          this.$message('网关关联项目失败')
        }
      })
    },
    fetchOptions() {
      getSubareaOptions({
        companyId: this.companyIdProp || this.companyId
      })
        .then(res => {
          let data = res.data
          if (data.Code === 200 && !this.subareaOptionsProp) {
            this.subareaOptions = data.Data
          } else {
            this.subareaOptions = []
          }
        })
        .catch(err => {
          console.error(err)
          this.subareaOptions = []
        })
    },
    fetchSystemList(id) {
      getProjectModelList({
        projectId: 0,
        Industry: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.systemList = res.data.Data
          } else {
            this.systemList = []
          }
        })
        .catch(err => {
          this.systemList = []
          console.error(err)
        })
    },
    upload(fileObj) {
      const reader = new FileReader()
      reader.readAsDataURL(fileObj.file)
      let that = this
      reader.onload = function() {
        that.$refs.cropDialog.openDialog(this.result)
      }
    }
  }
}
function find(array, value) {
  let stack = []
  let going = true

  let walker = (array, value) => {
    array.forEach(item => {
      if (!going) return
      stack.push(item)
      if (item['value'] === value) {
        going = false
      } else if (item['children']) {
        walker(item['children'], value)
      } else {
        stack.pop()
      }
    })
    if (going) stack.pop()
  }

  walker(array, value)

  return stack
}
</script>

<style lang="scss">
.project-edit-dialog {
  .el-form {
    width: calc(100% - 90px);
  }
  .auto-wrap-JSDFSSJKDFHNS23 {
    display: flex;
    flex-wrap: wrap;
    & > div {
      text-align: center;
      flex: 0 0 20%;
    }
  }
  .project-logo {
    width: 247px;
    height: 119.97142px;
    border-radius: 4px;
    box-shadow: inset 0px 15px 10px -15px #000;
  }
}
</style>
