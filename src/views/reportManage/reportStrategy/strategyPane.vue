<template>
  <div class="content-box">
    <el-form
      ref="form"
      :model="form"
      :rules="formRules"
      size="medium"
      :hide-required-asterisk="true"
    >
      <el-form-item label="策略名称" prop="ReportStrategyName">
        <el-input
          v-show="isEdit"
          :disabled="submitLoading"
          placeholder="请输入"
          v-model="form.ReportStrategyName"
          style="width: 500px"
        ></el-input>
        <span v-show="!isEdit">{{ form.ReportStrategyName }}</span>
      </el-form-item>
      <el-form-item label="适用项目" prop="ProjectIdList">
        <el-select
          v-model="form.ProjectIdList"
          :disabled="submitLoading || !isEdit"
          multiple
          filterable
          placeholder="请选择"
          style="width: 500px"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="统计周期" prop="Cycle">
        <el-radio-group
          v-model="form.Cycle"
          :disabled="submitLoading || !isEdit"
        >
          <el-radio :label="0">周</el-radio>
          <el-radio :label="1">月</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="包含内容" prop="ContentList">
        <el-select
          v-model="form.ContentList"
          :disabled="submitLoading || !isEdit"
          multiple
          filterable
          placeholder="请选择"
          style="width: 500px"
        >
          <el-option
            v-for="item in contentOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报警明细" prop="AlarmList">
        <el-select
          v-model="form.AlarmList"
          :disabled="submitLoading || !isEdit"
          multiple
          filterable
          placeholder="请选择显示范围"
          style="width: 500px"
        >
          <el-option
            v-for="item in levelOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="item-title">指标阈值</div>
    <el-table
      :data="tableData"
      style="width: 100%"
      header-row-class-name="strategyPane-table-header"
    >
      <el-table-column label="指标" prop="name" />
      <el-table-column label="超过临界上限时间占比">
        <template slot-scope="{ row }">
          <div
            style="display: flex;align-items: center;justify-content: center"
          >
            <el-input
              v-show="isEdit"
              v-model="row.Max"
              :disabled="submitLoading"
              type="number"
              placeholder=""
              style="width: 80px"
              size="small"
            ></el-input>
            <span v-show="!isEdit">{{ row.Max }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="超过临界下限时间占比">
        <template slot-scope="{ row }">
          <div
            style="display: flex;align-items: center;justify-content: center"
          >
            <el-input
              v-show="isEdit && row.name !== '化霜最高温度'"
              v-model="row.Min"
              :disabled="submitLoading"
              type="number"
              placeholder=""
              style="width: 80px"
              size="small"
            ></el-input>
            <span v-show="!isEdit">{{ row.Min }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div
      style="display: flex;align-items: center;justify-content: center;margin-top: 20px"
      v-permission="[109]"
    >
      <el-button
        v-show="isEdit"
        @click="isEdit = false"
        style="margin: 0 15px"
        size="small"
      >
        取消
      </el-button>
      <el-button
        @click="deletePane"
        type="danger"
        size="small"
        :loading="submitLoading"
        style="margin: 0 15px"
      >
        删除
      </el-button>
      <el-button
        v-show="!isEdit"
        @click="isEdit = true"
        type="primary"
        style="margin: 0 15px"
        size="small"
      >
        编辑
      </el-button>
      <el-button
        v-show="isEdit"
        @click="submit"
        type="primary"
        style="margin: 0 15px"
        size="small"
        :loading="submitLoading"
      >
        提交
      </el-button>
    </div>
  </div>
</template>

<script>
import { setReportStrategy, deleteReportStrategy } from '@/api/reportStrategy'
export default {
  name: 'strategyPane',
  props: {
    info: Object
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    projectOptions() {
      return this.$store.state.app.proList
    }
  },
  watch: {
    info: {
      handler: function(val) {
        let form = JSON.parse(JSON.stringify(val))
        if (form.Content) {
          form.ContentList = form.Content.slice(
            1,
            form.Content.length - 1
          ).split('$')
        } else {
          form.ContentList = []
        }
        if (form.Alarm) {
          form.AlarmList = form.Alarm.slice(1, form.Alarm.length - 1).split('$')
        } else {
          form.AlarmList = []
        }
        form.ProjectIdList = form.ProjectList.map(item => item.Key)
        this.form = form
        this.tableData = [
          {
            name: '低温设备-温度',
            Max: form.LowTModelTreeUpper,
            Min: form.LowTModelTreeLower
          },
          {
            name: '中温设备-温度',
            Max: form.MiddleTModelTreeUpper,
            Min: form.MiddleTModelTreeLower
          },
          {
            name: '高温设备-温度',
            Max: form.HighTModelTreeUpper,
            Min: form.HighTModelTreeLower
          },
          {
            name: '化霜最高温度',
            Max: form.DefrostingTUpper
          },
          {
            name: '机组-吸气压力',
            Max: form.IPAPUpper,
            Min: form.IPAPLower
          }
        ]
        if (form.ReportStrategyId === 'add') {
          this.isEdit = true
        } else {
          this.isEdit = false
        }
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      isEdit: false,
      submitLoading: false,
      form: {},
      tableData: [],
      formRules: {
        ReportStrategyName: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        ProjectIdList: [
          {
            type: 'array',
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        Cycle: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        ContentList: [
          {
            type: 'array',
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        AlarmList: [
          {
            type: 'array',
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ]
      },
      contentOptions: [
        {
          label: '设备运行',
          value: '0'
        },
        {
          label: '诊断分析',
          value: '4'
        },
        {
          label: '报警统计',
          value: '1'
        },
        {
          label: '用电量统计',
          value: '2'
        },
        {
          label: '工单统计',
          value: '3'
        }
      ],
      levelOptions: [
        {
          id: '1',
          label: '紧急'
        },
        {
          id: '2',
          label: '重要'
        },
        {
          id: '3',
          label: '一般'
        },
        {
          id: '4',
          label: '记录'
        }
      ]
    }
  },
  methods: {
    // 删除
    deletePane() {
      this.$confirm('确认删除该策略吗 ？', '提示', {
        type: 'warning'
      })
        .then(() => {
          if (this.form.ReportStrategyId === 'add') {
            this.$emit('deletePane', this.form.ReportStrategyId)
          } else {
            this.submitLoading = true
            deleteReportStrategy({
              reportStrategyId: this.form.ReportStrategyId
            })
              .then(res => {
                if (res.data.Code === 200 && res.data.Data) {
                  this.$message.success('删除成功')
                  this.$emit('deletePane', this.form.ReportStrategyId)
                } else {
                  this.$message.error('删除失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('删除失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          }
        })
        .catch(() => {})
    },
    // 提交
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let data = {
            ProjectIdList: this.form.ProjectIdList,
            ReportStrategyId: this.form.ReportStrategyId,
            CompanyId: this.form.CompanyId,
            ReportStrategyName: this.form.ReportStrategyName,
            Cycle: this.form.Cycle,
            Content: `$${this.form.ContentList.join('$')}$`,
            Alarm: `$${this.form.AlarmList.join('$')}$`
          }
          let flag = true
          for (let i = 0; i < this.tableData.length; i++) {
            if (
              (this.tableData[i].Max && this.tableData[i].Max < 0) ||
              (this.tableData[i].Min && this.tableData[i].Min < 0)
            ) {
              flag = false
              break
            } else {
              switch (i) {
                case 0:
                  data.LowTModelTreeUpper = this.tableData[i].Max
                    ? this.tableData[i].Max - 0
                    : 0
                  data.LowTModelTreeLower = this.tableData[i].Min
                    ? this.tableData[i].Min - 0
                    : 0
                  break
                case 1:
                  data.MiddleTModelTreeUpper = this.tableData[i].Max
                    ? this.tableData[i].Max - 0
                    : 0
                  data.MiddleTModelTreeLower = this.tableData[i].Min
                    ? this.tableData[i].Min - 0
                    : 0
                  break
                case 2:
                  data.HighTModelTreeUpper = this.tableData[i].Max
                    ? this.tableData[i].Max - 0
                    : 0
                  data.HighTModelTreeLower = this.tableData[i].Min
                    ? this.tableData[i].Min - 0
                    : 0
                  break
                case 3:
                  data.DefrostingTUpper = this.tableData[i].Max
                    ? this.tableData[i].Max - 0
                    : 0
                  break
                case 4:
                  data.IPAPUpper = this.tableData[i].Max
                    ? this.tableData[i].Max - 0
                    : 0
                  data.IPAPLower = this.tableData[i].Min
                    ? this.tableData[i].Min - 0
                    : 0
                  break
              }
            }
          }
          if (!flag) {
            this.$message.error('请检查指标阈值表格，并正确输入时间占比值')
            return
          }
          if (data.ReportStrategyId === 'add') {
            delete data.ReportStrategyId
          }
          this.submitLoading = true
          setReportStrategy(data)
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message.success('提交成功')
                this.$emit('refresh')
              } else {
                this.$message.error('提交失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('提交失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.item-title {
  vertical-align: middle;
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
</style>
<style lang="scss">
.strategyPane-table-header {
  th {
    text-align: center !important;
  }
  th:first-of-type {
    text-align: left !important;
  }
}
</style>
