<template>
  <el-dialog
    width="950px"
    title="编辑资产"
    append-to-body
    :visible.sync="dialogVisible"
    :id="'dialog-edit-asset' + form.id"
    custom-class="dialog-edit-asset"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="110px"
      style="margin-right: 15px;"
      size="small"
    >
      <div
        style="color:rgba(0,0,0,0.85);font-size: 16px;margin-bottom: 16px;font-weight: 500;"
      >
        基本信息
      </div>
      <el-row>
        <el-col :span="8">
          <el-form-item label="资产名称：" prop="name">
            <el-input v-model="form.name" placeholder="请输入"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="资产编码：" prop="assetCode">
            <el-tooltip
              effect="dark"
              content="编码是唯一的，您也可以自己定义"
              placement="top"
            >
              <el-input
                :disabled="!!form.id"
                v-model.trim="form.assetCode"
                class="bg-gray"
                clearable
              />
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="资产分类：" prop="assetClassify">
            <el-select
              v-model="form.assetClassify"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="item in assetTypeOptions"
                :label="item.TypeName"
                :key="item.ID"
                :value="item.ID"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="型号：" prop="model">
            <el-input v-model="form.model" placeholder="请输入"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="出厂编号：" prop="naserialNumberme">
            <el-input
              v-model="form.serialNumber"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="项目：" prop="projectId">
            <el-select
              v-model="form.projectId"
              clearable
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
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="状态：" prop="statusId">
            <el-select
              clearable
              v-model="form.statusId"
              filterable
              placeholder="请选择"
            >
              <el-option label="使用中" :value="1" />
              <el-option label="闲置中" :value="2" />
              <el-option label="已验证" :value="3" />
              <el-option label="待验证" :value="4" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div style="background-color: #e8e8e8;height: 2px;margin: 24px 0;"></div>
      <div
        style="color:rgba(0,0,0,0.85);font-size: 16px;margin-bottom: 16px;font-weight: 500;"
      >
        安装信息
      </div>
      <el-row>
        <el-form-item label="安装日期：" prop="installDate">
          <el-date-picker
            v-model="form.installDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-row>
      <div style="background-color: #e8e8e8;height: 2px;margin: 24px 0;"></div>
      <div
        style="color:rgba(0,0,0,0.85);font-size: 16px;margin-bottom: 16px;font-weight: 500;"
      >
        合同信息
      </div>
      <el-row>
        <el-col :span="8">
          <el-form-item label="销售合同号：" prop="salesContract">
            <el-input
              v-model="form.salesContract"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="经销商：" prop="dealerId">
            <el-select v-model="form.dealerId" filterable placeholder="请选择">
              <el-option
                v-for="item in dealerOptions"
                :key="item.Key"
                :label="item.Value"
                :value="item.Key"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客户名称：" prop="customerName">
            <el-input
              v-model="form.customerName"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
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
import {
  addAssetsDeviceNew,
  existCode,
  getDealerDropdownList,
  updateAssetsDeviceNew
} from '@/api/assets'
import { logSnapShotFactory } from '@/utils/logSnapShot'

import { getCompanyAssetsTypeList } from '@/api/assetTypeProject'
export default {
  data() {
    let checkCode = (rule, value, callback) => {
      if (this.operationType === 'config') {
        callback()
        return false
      }
      console.log(this.form.id)
      if (!value || this.form.id) {
        callback()
      } else {
        existCode({
          assetsCode: value
        }).then(res => {
          // 判断资产编码是否重复(存在返回false，不存在返回true)
          if (!res.data.Data.IsExist) {
            callback(new Error('该资产编码已存在，不可重复添加'))
          } else {
            callback()
          }
        })
      }
    }
    return {
      dialogVisible: false,
      submitLoading: false,
      assetTypeOptions: [],
      dealerOptions: [],
      form: {
        id: '',
        name: '',
        assetCode: '',
        assetClassify: '',
        model: '',
        serialNumber: '',
        projectId: '',
        statusId: '',
        installDate: '',
        salesContract: '',
        dealerId: '',
        customerName: ''
      },
      rules: {
        name: [{ required: true, message: '请输入', trigger: 'blur' }],
        assetCode: [{ validator: checkCode, trigger: 'blur' }],
        assetClassify: [
          { required: true, message: '请选择', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    projectOptions() {
      return this.$store.state.app.proList
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.fetchOptions()
  },
  methods: {
    openDialog(assetInfo) {
      this.dialogVisible = true
      if (assetInfo) {
        this.form.id = assetInfo.ModelTreeId
        this.form.name = assetInfo.ModelTreeName
        this.form.assetCode = assetInfo.AssetsCode
        this.form.assetClassify = assetInfo.AssetsType
        this.form.model = assetInfo.Type
        this.form.serialNumber = assetInfo.SerialNumber
        this.form.projectId = assetInfo.ProjectId
        this.form.statusId = assetInfo.Status || undefined
        this.form.installDate =
          assetInfo.InstallDate !== '-' ? new Date(assetInfo.InstallDate) : ''
        this.form.salesContract = assetInfo.ContractNo
        this.form.dealerId = assetInfo.DealerId
        this.form.customerName = assetInfo.CustomerName
      }
      this.fetchOptions()
    },
    handleClose() {
      this.dialogVisible = false
      Object.assign(this.form, {
        id: '',
        name: '',
        assetCode: '',
        assetClassify: '',
        model: '',
        serialNumber: '',
        projectId: '',
        statusId: '',
        installDate: '',
        salesContract: '',
        dealerId: '',
        customerName: ''
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {
            id,
            name,
            assetCode,
            assetClassify,
            model,
            serialNumber,
            projectId,
            statusId,
            installDate,
            salesContract,
            dealerId,
            customerName
          } = this.form
          if (id) {
            const { fileName, bucketName, objectName } = logSnapShotFactory(
              document.querySelector('#dialog-edit-asset' + id)
            )
            this.submitLoading = true
            console.log(installDate || undefined)
            updateAssetsDeviceNew({
              ModelTreeId: id,
              AssetsCode: assetCode,
              AssetsType: assetClassify,
              ModelTreeName: name,
              Type: model,
              SerialNumber: serialNumber,
              ProjectId: projectId,
              Status: statusId || undefined,
              InstallDate: installDate || undefined,
              ContractNo: salesContract,
              DealerId: dealerId,
              CustomerName: customerName,
              StorageSpaceExtendList: {
                FileNameList: [fileName],
                BucketName: bucketName,
                ObjectName: objectName
              }
            })
              .then(res => {
                const data = res.data
                if (data.Code === 200 && data.Data) {
                  this.$message.success('资产编辑成功')
                  this.$emit('complete')
                  this.dialogVisible = false
                } else {
                  this.$message.error('资产编辑失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('资产编辑失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            this.submitLoading = true
            addAssetsDeviceNew({
              project: projectId || undefined,
              mName: name,
              companyId: this.companyId,
              asset_code: assetCode,
              assets_type: assetClassify,
              SerialNumber: serialNumber,
              installDate: installDate || undefined,
              ModelTreeExtend: {
                ContractNo: salesContract,
                DealerId: dealerId,
                CustomerName: customerName
              },
              status: statusId || undefined,
              type: model,
              bid: -1,
              model: -1
            })
              .then(res => {
                const data = res.data
                if (data.Code === 200) {
                  this.$message.success('资产添加成功')
                  this.$emit('complete')
                  this.dialogVisible = false
                } else {
                  this.$message.error('资产添加失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('资产添加失败')
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
    fetchOptions() {
      getCompanyAssetsTypeList({
        companyId: this.companyId
      }).then(res => {
        if (res.data.Code === 200) {
          this.assetTypeOptions = res.data.Data.subset
        }
      })
      getDealerDropdownList({
        companyId: this.companyId
      }).then(res => {
        if (res.data.Code === 200) {
          this.dealerOptions = res.data.Data
        }
      })
    }
  }
}
</script>

<style lang="scss">
.dialog-edit-asset {
  .bg-gray input {
    background: #f5f7fa;
  }
}
</style>
