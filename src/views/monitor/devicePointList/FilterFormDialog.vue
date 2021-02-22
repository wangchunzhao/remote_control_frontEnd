<template>
  <el-dialog
    width="360px"
    custom-class="alarm-filter-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="85px" size="small">
      <el-form-item label="参数等级:">
        <el-select
          v-model="form.levelIds"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in levelOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位状态:">
        <el-select
          v-model="form.statusIds"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="读写权限:">
        <el-select
          v-model="form.readWriteAccess"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in readWriteAccessOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报警配置:">
        <el-select
          v-model="form.isSetAlarm"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in isSetAlarmOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位类型:">
        <el-select
          v-model="form.typeIds"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button size="small" type="primary" @click.native="submitForm"
        >筛 选</el-button
      >
      <el-button
        size="small"
        type="text"
        @click.native="resetForm"
        style="font-size: 14px;"
      >
        <c-svg style="font-size: 15px;" name="undo" />
        重置筛选</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    typeOptions: Array
  },
  data() {
    return {
      dialogVisible: false,

      form: {
        levelIds: [],
        statusIds: [],
        readWriteAccess: [],
        isSetAlarm: [],
        typeIds: []
      },
      statusOptions: [
        {
          id: 1,
          label: '离线'
        },
        {
          id: 2,
          label: '正常'
        },
        {
          id: 3,
          label: '报警'
        }
      ],
      readWriteAccessOptions: [
        {
          id: 1,
          label: '只读'
        },
        {
          id: 3,
          label: '读写'
        }
      ],
      isSetAlarmOptions: [
        {
          id: 1,
          label: '未配置'
        },
        {
          id: 2,
          label: '已配置'
        }
      ],
      levelOptions: [
        {
          id: 1,
          label: '一级参数'
        },
        {
          id: 2,
          label: '二级参数'
        },
        {
          id: 3,
          label: '三级参数'
        }
      ]
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
    resetForm() {
      this.form.levelIds = []
      this.form.statusIds = []
      this.form.readWriteAccess = []
      this.form.isSetAlarm = []
      this.form.typeIds = []
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    submitForm() {
      this.$emit('change', this.form)
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss">
.alarm-filter-dialog {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 30px 30px 20px 20px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .range-select {
    .el-input__inner {
      padding: 0 5px;
    }
  }
  .el-input .el-input__inner {
    padding: 0 7px;
  }
}
</style>
