<template>
  <el-dialog
    width="600px"
    title="新增维保团队"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="80px"
      size="small"
    >
      <el-form-item label="团队名称" prop="name">
        <el-input
          style="width: 193px;"
          v-model="form.name"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="维保片区" prop="areaIds">
        <el-cascader
          ref="cascader"
          :options="areaOptions"
          v-model="form.areaIds"
          :show-all-levels="false"
          :props="{
            children: 'Children',
            label: 'SubareaName',
            value: 'SubareaId',
            emitPath: false,
            multiple: true
          }"
          collapse-tags
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item m label="维保类型" prop="typeIds">
        <el-select
          v-model="form.typeIds"
          collapse-tags
          multiple
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in maintenanceTypeOptions"
            :key="item.id"
            :label="item.mname"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div style="margin-bottom: 15px;">
      <el-button
        size="small"
        type="primary"
        @click.native="() => $refs.memberAddDialog.openDialog()"
      >
        新增</el-button
      >
      <el-button @click.native="handleClickRemove" size="small" type="danger"
        >移除</el-button
      >
    </div>
    <el-table
      :data="tableData"
      style="width: 100%;"
      empty-text="点击上方按钮添加团队成员"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="Value" label="成员姓名" />
      <el-table-column prop="Title" label="手机号" />
    </el-table>
    <span slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
    <MemberAddDialog @change="handleMemberChange" ref="memberAddDialog" />
  </el-dialog>
</template>

<script>
import MemberAddDialog from './MemberAddDialog'
import { addOrUpdateMaintenance } from '@/api/maintenance'

export default {
  props: {
    maintenanceTypeOptions: Array
  },
  components: {
    MemberAddDialog
  },
  data() {
    return {
      dialogVisible: false,

      form: {
        name: '',
        areaIds: [],
        typeIds: []
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        areaIds: [
          {
            required: true,
            type: 'array',
            message: '请选择',
            trigger: 'change'
          }
        ],
        typeIds: [
          {
            required: true,
            type: 'array',
            message: '请选择',
            trigger: 'change'
          }
        ]
      },
      areaOptions: [],
      submitLoading: false,

      multipleSelection: [],
      tableData: []
    }
  },
  computed: {
    companyStruct() {
      return this.$store.state.app.companyStruct
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.areaOptions = [this.companyStruct]
    this.walk(this.areaOptions)
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.form.name = ''
      this.form.areaIds = []
      this.form.typeIds = []
      this.tableData = []
      this.multipleSelection = []
      this.$refs.form.resetFields()
      this.$nextTick(() => {
        this.dialogVisible = false
      })
    },

    handleMemberChange(list) {
      list.forEach(v => {
        if (!this.tableData.find(vv => vv.Key === v.Key)) {
          this.tableData.push(v)
        }
      })
    },

    handleClickRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一个要移除的成员')
        return
      }
      this.tableData = this.tableData.filter(v => {
        return !this.multipleSelection.find(vv => vv.Key === v.Key)
      })
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    submitForm() {
      const checkNodes = this.$refs.cascader.getCheckedNodes(false)

      const ids = []
      checkNodes.forEach(v => {
        if (v.parent === null) {
          // 选中的是根节点
          ids.push(v.value)
        } else if (v.parent.checked === false) {
          ids.push(v.value)
        }
      })
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const { name, typeIds } = this.form
          addOrUpdateMaintenance({
            MaintenanceId: undefined,
            CompanyId: this.companyId,
            MaintenanceName: name,
            Status: 0,
            UserIdList: this.tableData.map(v => v.Key),
            SubareaIdList: ids,
            SubsystemIdList: typeIds
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                if (data.Data) {
                  this.$message.success('维保团队添加成功')
                  this.$emit('refresh')
                  this.dialogVisible = false
                } else {
                  this.$message.error('维保团队添加失败')
                }
              } else {
                this.$message.error('维保团队添加失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('维保团队添加失败')
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
    walk(arr) {
      arr.forEach(item => {
        item.Children && item.Children.length
          ? this.walk(item.Children)
          : delete item.Children
      })
    }
  }
}
</script>
