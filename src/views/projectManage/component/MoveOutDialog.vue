<template>
  <el-dialog
    width="400px"
    title="移交项目"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      size="small"
      ref="form"
      label-width="30px"
    >
      <el-form-item label="" prop="subareaId">
        <el-cascader
          :options="structTree"
          ref="cascader"
          v-model="form.subareaId"
          clearable
          filterable
          style="width: 300px;"
          :props="cascaderProps"
        >
          <template slot-scope="{ node, data }">
            <c-svg
              style="color: #909399; margin-right: 5px"
              name="folder-open-fill"
            ></c-svg>
            <span>{{ data.SubareaName }}</span>
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
        size="medium"
        :loading="loading"
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
  data() {
    return {
      dialogVisible: false,
      companyOptions: [],
      structTree: [],
      cascaderProps: {
        children: 'Children',
        label: 'SubareaName',
        value: 'SubareaId',
        lazy: true,
        emitPath: false,
        checkStrictly: true,
        lazyLoad: (node, resolve) => {
          if (node.level === 1) {
            getSubareaTree({
              isGetProject: false,
              companyId: node.data.companyId
            })
              .then(res => {
                if (res.data.Code === 200) {
                  let data = res.data.Data.Children
                  walk(data)
                  resolve(data)
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            resolve()
          }
        }
      },
      loading: false,
      form: {
        currentProject: '',
        subareaId: ''
      },
      rules: {
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
    openDialog(id) {
      this.dialogVisible = true
      this.fetchCompanyOptions()
      this.form.currentProject = id
    },
    handleClose() {
      this.form.subareaId = ''
      this.form.currentProject = ''
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { subareaId, currentProject } = this.form

          // 要转入的企业id
          let companyId = undefined
          let node = this.$refs.cascader.getCheckedNodes()[0]
          while (node.parent) {
            node = node.parent
          }
          companyId = node.data.companyId
          this.loading = true
          updateProjectCompany({
            OldCompanyId: this.currentCompanyId,
            CompanyId: companyId,
            SubareaId: subareaId < 0 ? 0 : subareaId,
            ProjectIds: [currentProject],
            Access: 2
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                if (data.Data.IsSuccess) {
                  this.dialogVisible = false
                  this.$emit('refresh')
                  this.$message.success('项目移交成功')
                  this.$store.dispatch('fetchCompanyStruct')
                  this.$store.dispatch('fetchUserOwnSubareaTree')
                  this.$store.dispatch('fetchProject')
                } else {
                  this.$message.error('项目移交失败')
                }
              } else {
                this.$message.error(data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('项目移交失败')
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
        Access: 2
      }).then(res => {
        if (res.data.Code === 200) {
          let options = []
          res.data.Data.forEach(v => {
            if (v.CompanyId !== this.currentCompanyId) {
              options.push({
                SubareaName: v.CompanyName,
                SubareaId: v.CompanyId * -1,
                companyId: v.CompanyId,
                Children: []
              })
            }
          })
          this.structTree = options
        }
      })
    }
  }
}
</script>
