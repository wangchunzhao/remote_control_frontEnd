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
      <el-form-item label="充值操作员:">
        <el-select
          filterable
          v-model="form.operator"
          style="width: 100%;"
          clearable
          multiple
          placeholder="请选择"
        >
          <el-option
            v-for="item in operatorOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="充值类型:">
        <el-select
          filterable
          v-model="form.rechargeType"
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in rechargeTypeOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="电表ID:">
        <el-select
          filterable
          v-model="form.id"
          style="width: 100%;"
          clearable
          multiple
          placeholder="请选择"
        >
          <el-option
            v-for="item in meterOptions"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="购电单号:">
        <el-input
          v-model="form.powerPurchaseOrder"
          placeholder="请输入"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="充值订单号:">
        <el-input
          v-model="form.rechargeOrder"
          placeholder="请输入"
          clearable
        ></el-input>
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
import { getMeterOrderPageParameter } from '@/api/meter'
export default {
  props: {
    projectId: {
      type: Number,
      required: true
    },
    rechargeTypeOptions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      operatorOptions: [],
      meterOptions: [],
      form: {
        operator: [],
        rechargeType: undefined,
        id: [],
        powerPurchaseOrder: '',
        rechargeOrder: ''
      },
      rules: {}
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchOptions()
    },
    handleClose() {
      this.dialogVisible = false
    },
    resetForm() {
      Object.assign(this.form, {
        operator: [],
        rechargeType: undefined,
        id: [],
        powerPurchaseOrder: '',
        rechargeOrder: ''
      })
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    fetchOptions() {
      getMeterOrderPageParameter({
        projectId: this.projectId
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          this.meterOptions = data.MeterDropdownList
          this.operatorOptions = data.OperatorDropdownList
        }
      })
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
