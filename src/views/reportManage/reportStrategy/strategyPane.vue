<template>
  <div class="content-box">
    <el-form
      ref="form"
      :model="form"
      :rules="formRules"
      size="medium"
      :hide-required-asterisk="true"
    >
      <el-form-item label="策略名称" prop="name">
        <el-input
          v-show="isEdit"
          :disabled="submitLoading"
          placeholder="请输入"
          v-model="form.name"
          style="width: 500px"
        ></el-input>
        <span v-show="!isEdit">12312312</span>
      </el-form-item>
      <el-form-item label="适用项目" prop="projectIdList">
        <el-select
          v-show="isEdit"
          v-model="form.projectIdList"
          :disabled="submitLoading"
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
        <span v-show="!isEdit">12312312</span>
      </el-form-item>
      <el-form-item label="统计周期" prop="cycle">
        <el-radio-group
          v-model="form.cycle"
          v-show="isEdit"
          :disabled="submitLoading"
        >
          <el-radio label="Week">周</el-radio>
          <el-radio label="Month">月</el-radio>
        </el-radio-group>
        <span v-show="!isEdit">12312312</span>
      </el-form-item>
      <el-form-item label="包含内容" prop="contentList">
        <el-select
          v-show="isEdit"
          v-model="form.contentList"
          :disabled="submitLoading"
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
        <span v-show="!isEdit">12312312</span>
      </el-form-item>
      <el-form-item label="报警明细" prop="levelList">
        <el-select
          v-show="isEdit"
          v-model="form.levelList"
          :disabled="submitLoading"
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
        <span v-show="!isEdit">12312312</span>
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
              v-show="isEdit"
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
  data() {
    return {
      isEdit: true,
      submitLoading: false,
      form: {
        name: '',
        projectIdList: [],
        cycle: 'Week',
        contentList: [],
        levelList: []
      },
      tableData: [
        {
          name: '低温设备-温度',
          Max: '',
          Min: ''
        },
        {
          name: '中温设备-温度',
          Max: '',
          Min: ''
        },
        {
          name: '化霜最高温度',
          Max: '',
          Min: ''
        },
        {
          name: '机组-吸气压力',
          Max: '',
          Min: ''
        }
      ],
      formRules: {
        name: [{ required: true, message: '请输入', trigger: 'blur' }],
        projectIdList: [
          {
            type: 'array',
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        cycle: [
          {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        contentList: [
          {
            type: 'array',
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ],
        levelList: [
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
          value: '1'
        },
        {
          label: '诊断分析',
          value: '2'
        },
        {
          label: '报警统计',
          value: '3'
        },
        {
          label: '用电量统计',
          value: '4'
        },
        {
          label: '工单统计',
          value: '5'
        }
      ],
      levelOptions: [
        {
          id: 1,
          label: '紧急'
        },
        {
          id: 2,
          label: '重要'
        },
        {
          id: 3,
          label: '一般'
        },
        {
          id: 4,
          label: '记录'
        }
      ]
    }
  },
  methods: {
    deletePane() {
      this.$confirm('确认删除 ？', '提示', {
        type: 'warning'
      })
        .then(() => {})
        .catch(() => {})
    },
    submit() {
      this.submitLoading = true
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
