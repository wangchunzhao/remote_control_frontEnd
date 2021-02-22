<template>
  <el-dialog
    width="360px"
    custom-class="filter-dialog"
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
      <el-form-item label="设备分类:">
        <el-select
          filterable
          v-model="form.deviceTypeIds"
          style="width: 100%;"
          clearable
          multiple
          placeholder="请选择"
        >
          <el-option
            v-for="item in deviceTypeOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="子系统:">
        <el-select
          filterable
          v-model="form.systemIds"
          style="width: 100%;"
          clearable
          multiple
          placeholder="请选择"
        >
          <el-option
            v-for="item in systemOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="监控状态:">
        <el-select
          filterable
          v-model="form.statusIds"
          style="width: 100%;"
          clearable
          multiple
          placeholder="请选择"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备名称:">
        <el-input v-model="form.deviceName"></el-input>
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
import { getBigSmallType } from '@/api/model'
export default {
  data() {
    return {
      dialogVisible: false,
      deviceTypeOptions: [],
      systemOptions: [],
      form: {
        deviceName: '',
        deviceTypeIds: [],
        systemIds: [],
        statusIds: []
      },
      statusOptions: [
        {
          value: 1,
          label: '离线'
        },
        {
          value: 2,
          label: '在线'
        },
        {
          value: 3,
          label: '报警'
        }
      ],
      rules: {}
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    getBigSmallType({
      companyId: this.companyId
    })
      .then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          this.deviceTypeOptions = data.SmallTypeDrop
          this.systemOptions = data.BigTypeDrop
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    setForm(val) {
      Object.assign(this.form, val)
    },
    resetForm() {
      Object.assign(this.form, {
        deviceName: '',
        deviceTypeIds: [],
        systemIds: [],
        statusIds: []
      })
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
.filter-dialog {
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
}
</style>
