<template>
  <el-dialog width="420px" :visible.sync="dialogVisible" @close="handleClose">
    <template v-slot:title>
      <div class="el-dialog__title">
        <div>
          <span>新增自定义支路</span>
          <el-tooltip class="item" effect="dark" placement="right">
            <div slot="content" style="width: 280px;line-height: 20px;">
              自定义支路的能耗值通过加减已有支路的能耗消耗值来计算，计算结果将在各能耗统计图表中展现
            </div>
            <c-svg
              name="info-circle-fill"
              style="color: rgba(0,0,0,0.25); margin-left: 10px;"
            ></c-svg>
          </el-tooltip>
        </div>
      </div>
    </template>
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
      <el-form-item label="支路名称" prop="name">
        <el-input
          style="width: 240px;"
          clearable
          v-model="form.name"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="关联分项" prop="associatedSubentry">
        <el-cascader
          :options="associatedSubentryTree"
          ref="associatedSubentryCascader"
          @change="associatedSubentryChange"
          v-model="form.associatedSubentry"
          placeholder="请选择支路"
          clearable
          filterable
          :show-all-levels="false"
          style="width: 240px;"
          :props="{
            children: 'ChildrenList',
            label: 'Name',
            value: 'SubentryId',
            emitPath: false,
            checkStrictly: true
          }"
        >
          <template slot-scope="{ node, data }">
            <c-svg
              v-if="data.IsSubentry"
              style="color: #909399; margin-right: 5px"
              name="folder-open-fill"
            ></c-svg>
            <span>{{ data.Name }}</span>
            <c-svg
              v-if="data.IsSummary"
              style="color: #909399; margin-left: 5px"
              name="zong"
            ></c-svg> </template
        ></el-cascader>
      </el-form-item>
      <el-form-item label="计算公式" required style="margin-bottom: 0">
        <div style="min-height: 25px;margin-bottom: 10px;width: 240px;">
          = {{ formulaText }}
        </div>
        <el-form-item
          :rules="[
            { required: true, message: '请选择支路', trigger: 'change' }
          ]"
          prop="formulaFirstBranchId"
        >
          <el-cascader
            :options="branchTree"
            :disabled="!form.associatedSubentry"
            v-model="form.formulaFirstBranchId"
            placeholder="请选择支路"
            clearable
            filterable
            :show-all-levels="false"
            style="width: 240px;"
            :props="{
              children: 'ChildrenList',
              label: 'Name',
              value: 'ModelTreeId',
              emitPath: false,
              checkStrictly: true
            }"
          >
            <template slot-scope="{ node, data }">
              <c-svg
                v-if="data.IsSubentry"
                style="color: #909399; margin-right: 5px"
                name="folder-open-fill"
              ></c-svg>
              <span>{{ data.Name }}</span>
              <c-svg
                v-if="data.IsSummary"
                style="color: #909399; margin-left: 5px"
                name="zong"
              ></c-svg> </template
          ></el-cascader>
        </el-form-item>
        <div
          v-for="(item, index) in form.rules"
          :key="index"
          style="margin-top: 18px;"
        >
          <el-col :span="6">
            <el-form-item
              :rules="[
                { required: true, message: '请选择', trigger: 'change' }
              ]"
              :prop="'rules.' + index + '.operator'"
            >
              <el-select
                v-model="item.operator"
                :disabled="!form.associatedSubentry"
                clearable
                filterable
                placeholder=""
              >
                <el-option label="加" value="+"></el-option>
                <el-option label="减" value="-"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="1">&nbsp;</el-col>
          <el-col :span="17">
            <el-form-item
              :prop="'rules.' + index + '.branchId'"
              :rules="[
                { required: true, message: '请选择支路', trigger: 'change' }
              ]"
            >
              <el-cascader
                :options="branchTree"
                :disabled="!form.associatedSubentry"
                v-model="item.branchId"
                placeholder="请选择支路"
                clearable
                filterable
                :show-all-levels="false"
                style="width: 158px;"
                :props="{
                  children: 'ChildrenList',
                  label: 'Name',
                  value: 'ModelTreeId',
                  emitPath: false,
                  checkStrictly: true
                }"
              >
                <template slot-scope="{ node, data }">
                  <c-svg
                    v-if="data.IsSubentry"
                    style="color: #909399; margin-right: 5px"
                    name="folder-open-fill"
                  ></c-svg>
                  <span>{{ data.Name }}</span>
                  <c-svg
                    v-if="data.IsSummary"
                    style="color: #909399; margin-left: 5px"
                    name="zong"
                  ></c-svg> </template
              ></el-cascader>
              <el-button
                class="btn-danger"
                v-if="form.rules.length > 1"
                type="text"
                style="padding: 3px;"
                @click.native="removeRule(index)"
              >
                <i
                  class="el-icon-remove"
                  style="font-size: 18px;margin-left: 5px;"
                />
              </el-button>
            </el-form-item>
          </el-col>
        </div>
      </el-form-item>
      <el-link
        :disabled="!form.associatedSubentry"
        @click.native="handleAddRule"
        :underline="false"
        style="margin-left: 100px;margin-bottom: 15px;"
        type="primary"
      >
        <i class="el-icon-plus"></i>
        新增计算项
      </el-link>
      <el-form-item label="支路等级" prop="level">
        <el-select
          style="width: 240px;"
          v-model="form.level"
          clearable
          placeholder="请选择"
        >
          <el-option label="总表" :value="1"></el-option>
          <el-option label="末端" :value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >新 增</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { randomString } from '@/utils/index'
import { addOrUpdateBranch } from '@/api/branchCompute'
export default {
  props: {
    associatedSubentryTree: Array
  },
  data() {
    return {
      dialogVisible: false,
      branchTree: [],

      form: {
        id: '',
        name: '',
        formulaFirstBranchId: '',
        rules: [
          {
            operator: '',
            branchId: ''
          }
        ],
        level: '',
        associatedSubentry: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        level: [{ required: true, message: '请输入名称', trigger: 'change' }],
        associatedSubentry: [
          { required: true, message: '请输入名称', trigger: 'change' }
        ]
      },
      submitLoading: false
    }
  },
  computed: {
    structTree() {
      return this.$store.state.energy.energyStruct
    },
    formulaText() {
      let text = this.getNodeLabel(
        this.branchTree,
        this.form.formulaFirstBranchId
      )
      this.form.rules.forEach(v => {
        text += ` ${v.operator} ${this.getNodeLabel(
          this.branchTree,
          v.branchId
        )}`
      })
      return text
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    associatedSubentryChange(val) {
      if (val) {
        const checkedNodes = this.$refs.associatedSubentryCascader.getCheckedNodes()
        const type = checkedNodes[0].data.TopSubentryId
        const data = this.structTree.find(v => v.SubentryId === type)

        this.branchTree = data ? [data] : []
        this.walk(this.branchTree, node => {
          if (node.IsSubentry) {
            node.ModelTreeId = randomString(8)
            node.disabled = true
          }
        })
      } else {
        this.branchTree = []
      }
      this.form.formulaFirstBranchId = ''
      this.form.rules = [
        {
          operator: '',
          branchId: ''
        }
      ]
    },
    handleAddRule() {
      this.form.rules.push({
        operator: '',
        branchId: ''
      })
    },
    removeRule(index) {
      this.form.rules.splice(index, 1)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {
            id,
            name,
            formulaFirstBranchId,
            rules,
            associatedSubentry,
            level
          } = this.form
          let list = [
            {
              ComputeModelTreeId: formulaFirstBranchId,
              ComputeSymbol: '+'
            }
          ]
          rules.forEach(v => {
            list.push({
              ComputeModelTreeId: v.branchId,
              ComputeSymbol: v.operator
            })
          })
          list.forEach((v, index) => {
            v.Order = index
          })

          if (!id) {
            this.submitLoading = true
            addOrUpdateBranch({
              ModelTreeId: undefined,
              CompanyId: this.companyId,
              ProjectId: this.projectId,
              ModelTreeName: name,
              SubentryId: associatedSubentry,
              IsSummary: level,
              IsCustomBranch: 1,
              BranchComputeList: list
            })
              .then(res => {
                const data = res.data
                if (data.Code === 200) {
                  this.$message.success('支路新增成功')
                  this.$store.dispatch('fetchEnergyStruct')
                  this.$emit('refresh')
                  this.dialogVisible = false
                } else {
                  this.$message.error('支路新增失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('支路新增失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    walk(arr, handle) {
      arr.forEach(item => {
        handle(item)
        if (item.ChildrenList) {
          this.walk(item.ChildrenList, handle)
        }
      })
    },
    getNodeLabel(treeData, id) {
      let label = ''
      if (id) {
        const walk = arr => {
          arr.forEach(v => {
            if (v.ModelTreeId === id) {
              label = v.Name
            }
            if (v.ChildrenList) {
              walk(v.ChildrenList)
            }
          })
        }
        walk(treeData)
      }
      return label
    }
  }
}
</script>
