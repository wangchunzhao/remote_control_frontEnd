<template>
  <el-dialog
    title="编辑计算公式"
    width="420px"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px"
      size="small"
    >
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
        @click.native="handleAddRule"
        :underline="false"
        style="margin-left: 100px;margin-bottom: 15px;"
        type="primary"
      >
        <i class="el-icon-plus"></i>
        新增计算项
      </el-link>
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
import { randomString } from '@/utils/index'
export default {
  data() {
    return {
      dialogVisible: false,
      branchTree: [],

      form: {
        formulaFirstBranchId: '',
        rules: [
          {
            operator: '',
            branchId: ''
          }
        ]
      },
      rules: {
        associatedSubentry: [
          { required: true, message: '请输入名称', trigger: 'change' }
        ]
      },
      submitLoading: false
    }
  },
  computed: {
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
    structTree() {
      return this.$store.state.energy.energyStruct
    }
  },
  methods: {
    openDialog(payload) {
      this.dialogVisible = true
      this.dataSource = payload
      let rules = []
      payload.BranchComputeList.forEach((v, index) => {
        if (index === 0) {
          this.form.formulaFirstBranchId = v.ComputeModelTreeId
        } else {
          rules.push({
            operator: v.ComputeSymbol,
            branchId: v.ComputeModelTreeId
          })
        }
        this.form.rules = rules
      })

      const type = payload.TopSubentryId
      const data = this.structTree.find(v => v.SubentryId === type)
      this.branchTree = data ? [data] : []
      this.walk(this.branchTree, node => {
        if (node.IsSubentry) {
          node.ModelTreeId = randomString(8)
          node.disabled = true
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
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
          const { formulaFirstBranchId, rules } = this.form
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
          this.dataSource.formulaRules = list
          this.dataSource.formulaText = this.formulaText
          this.dialogVisible = false
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
