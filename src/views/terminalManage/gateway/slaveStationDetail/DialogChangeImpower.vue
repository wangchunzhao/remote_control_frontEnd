<template>
  <el-dialog
    width="550px"
    title="变更授权范围"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      style="width: 400px;margin: auto;"
      size="small"
    >
      <el-form-item label="授权对象：" prop="object">
        <el-radio-group @change="form.range = []" v-model="form.object">
          <el-radio :label="0">仅创建者</el-radio>
          <el-radio :label="1">项目</el-radio>
          <el-radio :label="2">企业</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="授权范围：" prop="range">
        <el-select
          v-if="form.object === 0"
          v-model="form.range"
          style="width: 230px;"
          disabled
          placeholder="请选择"
        >
          <el-option label="0" :value="0"></el-option>
        </el-select>
        <el-cascader
          ref="cascader"
          class="cascader-SODKIFJ23489"
          v-model="form.subareaIds"
          :options="subareaTree"
          v-if="form.object === 1"
          v-loading="treeLoading"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255,255,255,.5)"
          clearable
          :show-all-levels="false"
          filterable
          collapse-tags
          style="width: 100%;"
          :props="cascaderProps"
        >
          <template slot-scope="{ node, data }">
            <c-svg
              style="color: #909399; margin-right: 5px"
              :name="data.Remark === '项目' ? 'location' : 'folder-open-fill'"
            />
            <span>{{ data.SubareaName }}</span>
          </template>
        </el-cascader>
        <el-select
          v-if="form.object === 2"
          v-model="form.range"
          style="width: 230px;"
          multiple
          collapse-tags
          placeholder="请选择"
        >
          <el-option
            :key="item.CompanyId"
            v-for="item in companyList"
            :label="item.CompanyName"
            :value="item.CompanyId"
          ></el-option>
        </el-select>
      </el-form-item>
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
import { updateDeviceModulePermissionScope } from '@/api/deviceModule'
import { getAllSubareaTree } from '@/api/subarea'

export default {
  props: {
    info: Object
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      treeLoading: false,
      subareaTree: [],
      cascaderProps: {
        children: 'Children',
        label: 'SubareaName',
        value: 'SubareaId',
        multiple: true,
        emitPath: false
      },
      form: {
        object: 0,
        range: []
      },
      rules: {
        object: [{ required: true, trigger: 'blur' }]
      }
    }
  },
  computed: {
    companyList() {
      return this.$store.state.app.companyList
    }
  },
  watch: {
    info(val) {
      this.form.object = val.PermissionType
      if (val.PermissionId) {
        this.form.range = val.PermissionId.split(',')
          .filter(v => v !== '')
          .map(v => JSON.parse(v))
      }
    }
  },
  mounted() {
    this.fetchSubareaTree()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let { range, object } = this.form
          if (object === 1) {
            const checkedNodes = this.$refs.cascader.getCheckedNodes()
            range = checkedNodes
              .filter(v => v.data.Remark === '项目')
              .map(v => v.data.ProjectId)
          }
          this.submitLoading = true
          updateDeviceModulePermissionScope({
            deviceModuleId: this.info.DeviceModuleId,
            permissionType: object,
            permissionId: `,${range.join(',')},`
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('授权变更成功')
                this.$emit('refresh')
                this.dialogVisible = false
              } else {
                this.$message.error('授权变更失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('授权变更失败')
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
    fetchSubareaTree() {
      this.treeLoading = true
      getAllSubareaTree({
        isGetProject: true,
        isPermission: true
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.walk(res.data.Data)
            this.subareaTree = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.treeLoading = false
        })
    },
    walk(arr) {
      arr.forEach(v => {
        if (v.Children) {
          if (!v.Children.length) {
            delete v.Children
          } else {
            this.walk(v.Children)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.cascader-SODKIFJ23489 {
  .el-loading-spinner {
    top: 0;
    margin-top: 0;
  }
}
</style>
