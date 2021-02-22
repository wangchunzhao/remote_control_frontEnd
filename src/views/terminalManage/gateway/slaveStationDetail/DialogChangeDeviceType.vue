<template>
  <el-dialog
    width="370px"
    title="修改所属品类"
    :visible.sync="dialogVisible"
    class="typeChangeDialog"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
      <el-form-item label="所属品类：" prop="deviceType">
        <el-cascader
          size="small"
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
    </el-form>
    <div slot="footer">
      <div
        style="display: flex;align-items: center;justify-content: space-between"
      >
        <div />
        <div>
          <el-button size="medium" @click.native="handleClose">取消</el-button>
          <el-button
            :loading="submitLoading"
            size="medium"
            type="primary"
            @click.native="submitForm"
            >确定</el-button
          >
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { monitorTypeList } from '@/api/monitorTypeProject'
import { updateDeviceModuleModel } from '@/api/deviceModule'
import { getPreferences } from '@/api/preferences'
import store from '@/store'
import { getModelListByProject } from '@/api/model'
let id = 0
export default {
  data() {
    return {
      DeviceModuleId: '',
      dialogVisible: false,
      submitLoading: false,
      form: {
        deviceType: []
      },
      rules: {
        deviceType: [
          {
            type: 'array',
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ]
      },
      monitroTypeOptions: [] //所属品类列表
    }
  },
  computed: {
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  mounted() {
    this.fetchMonitorTypeOption()
  },
  methods: {
    openDialog(id = undefined) {
      this.DeviceModuleId = id
      this.dialogVisible = true
      this.$refs.form ? this.$refs.form.clearValidate() : null
    },
    handleClose() {
      this.DeviceModuleId = ''
      this.form.deviceType = []
      this.dialogVisible = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let { deviceType } = this.form
          updateDeviceModuleModel({
            deviceModuleId: this.DeviceModuleId,
            smallTypeId: deviceType.length ? deviceType[2] : undefined
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('修改成功')
                this.$emit('refresh')
                this.dialogVisible = false
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('修改失败')
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    async fetchMonitorTypeOption() {
      let monitroTypeOptions = [
        {
          ID: 1,
          TypeName: '冷链',
          subset: []
        },
        {
          ID: 2,
          TypeName: '商超',
          subset: []
        },
        {
          ID: 3,
          TypeName: '养殖业',
          subset: []
        },
        {
          ID: 4,
          TypeName: '文物监测',
          subset: []
        }
      ]
      await Promise.all([
        monitorTypeList({
          industry: 1
        }),
        monitorTypeList({
          industry: 2
        }),
        monitorTypeList({
          industry: 3
        }),
        monitorTypeList({
          industry: 4
        })
      ])
        .then(([res1, res2, res3, res4]) => {
          if (res1.data.Code === 200) {
            monitroTypeOptions[0].subset = res1.data.Data.subset
          }
          if (res2.data.Code === 200) {
            monitroTypeOptions[1].subset = res2.data.Data.subset
          }
          if (res3.data.Code === 200) {
            monitroTypeOptions[2].subset = res3.data.Data.subset
          }
          if (res4.data.Code === 200) {
            monitroTypeOptions[3].subset = res4.data.Data.subset
          }
        })
        .catch((err) => {
          console.error(err)
          this.$message.error('获取所属品类列表失败')
        })
        .finally(() => {
          this.monitroTypeOptions = monitroTypeOptions
        })
    }
  }
}
</script>
<style lang="scss">
.typeChangeDialog {
  .el-checkbox {
    display: flex;
    align-items: center;
    padding: 0 24px;
  }
  .el-checkbox__label {
    padding-left: 20px;
  }
}
</style>
