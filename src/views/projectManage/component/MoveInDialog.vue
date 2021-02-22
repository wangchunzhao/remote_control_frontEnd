<template>
  <el-dialog
    width="440px"
    title="迁入项目"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      size="small"
      label-width="120"
    >
      <el-form-item label="选择企业" prop="company">
        <el-select
          v-model="form.company"
          @change="companyChange"
          filterable
          style="width: 300px;"
          placeholder="请选择"
        >
          <el-option
            v-for="item in companyOptions"
            :label="item.CompanyName"
            :key="item.CompanyId"
            :value="item.CompanyId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择项目" prop="subareaId">
        <el-cascader
          :options="structTree"
          ref="cascader"
          collapse-tags
          v-model="form.subareaId"
          clearable
          :loading="subareaTreeLoading"
          filterable
          style="width: 300px;"
          :props="cascaderProps"
        >
          <template slot="empty">
            {{ subareaTreeLoading ? '加载中...' : '暂无数据.' }}
          </template>
          <template slot-scope="{ node, data }">
            <c-svg
              :name="
                data.Remark === '项目' ? 'location-fill' : 'folder-open-fill'
              "
              :style="{
                color: data.Remark === '项目' ? '#909399' : '#5AC8FA'
              }"
            />
            <span>&nbsp;{{ data.SubareaName }}</span>
            <c-svg
              v-if="data.IsSummary"
              style="color: #909399; margin-left: 5px"
              name="zong"
            ></c-svg> </template
        ></el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :loading="loading"
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
  getAccessCompany,
  updateProjectCompany,
  getSubareaTree
} from '@/api/subarea'

function walk(arr) {
  arr.forEach(item => {
    item.Children && item.Children.length
      ? walk(item.Children)
      : delete item.Children
  })
}

export default {
  props: {
    node: {
      type: Object,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      subareaTreeLoading: false,
      companyOptions: [],
      structTree: [],
      cascaderProps: {
        multiple: true,
        children: 'Children',
        label: 'SubareaName',
        value: 'SubareaId'
      },
      form: {
        company: '',
        subareaId: ''
      },
      rules: {
        company: [{ required: true, message: '请选择', trigger: 'change' }],
        subareaId: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    }
  },
  computed: {
    currentCompanyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchCompanyOptions()
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    companyChange(val) {
      this.structTree = []
      this.fetchSubareaTree(val)
    },
    fetchSubareaTree(val) {
      this.subareaTreeLoading = true
      getSubareaTree({
        isGetProject: true,
        companyId: val
      })
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data.Children
            walk(data)
            this.structTree = data
          } else {
            this.structTree = []
          }
        })
        .catch(err => {
          console.error(err)
          this.structTree = []
        })
        .finally(() => {
          this.subareaTreeLoading = false
        })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { company } = this.form

          const checkedNodes = this.$refs.cascader.getCheckedNodes()
          let projectIds = []
          checkedNodes.forEach(v => {
            if (v.data.Remark === '项目') {
              projectIds.push(v.data.ProjectId)
            }
          })
          updateProjectCompany({
            OldCompanyId: company,
            CompanyId: this.currentCompanyId,
            SubareaId: this.node.SubareaId,
            ProjectIds: projectIds,
            Access: 1
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                if (data.Data.IsSuccess) {
                  this.dialogVisible = false
                  this.$emit('refresh')
                  this.$message.success('项目迁入成功')
                  this.$store.dispatch('fetchCompanyStruct')
                  this.$store.dispatch('fetchUserOwnSubareaTree')
                  this.$store.dispatch('fetchProject')
                } else {
                  this.$message.error('项目迁入失败')
                }
              } else {
                this.$message.error(data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('项目迁入失败')
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    fetchCompanyOptions() {
      getAccessCompany({
        Access: 1
      }).then(res => {
        if (res.data.Code === 200) {
          this.companyOptions = res.data.Data.filter(
            v => v.CompanyId !== this.currentCompanyId
          )
        }
      })
    }
  }
}
</script>
