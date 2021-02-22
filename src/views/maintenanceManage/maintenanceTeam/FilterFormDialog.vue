<template>
  <el-dialog
    width="360px"
    custom-class="alarm-filter-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="85px" size="small">
      <el-form-item label="维保类型:">
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
            v-for="item in maintenanceTypeOptions"
            :key="item.id"
            :label="item.mname"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维保片区:">
        <el-cascader
          v-model="form.areaIds"
          ref="cascader"
          style="width: 100%"
          :options="areaOptions"
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
      <el-form-item label="状态:">
        <el-select
          v-model="form.statusIds"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option label="启用" :value="0"> </el-option>
          <el-option label="停用" :value="1"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="成员姓名:">
        <el-select
          v-model="form.userIds"
          filterable
          multiple
          collapse-tags
          style="width: 100%;"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in memberOptions"
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
import { getMaintenancePageParameter } from '@/api/maintenance'
export default {
  props: {
    maintenanceTypeOptions: Array
  },
  data() {
    return {
      dialogVisible: false,

      form: {
        typeIds: [],
        areaIds: [],
        statusIds: [],
        userIds: []
      },
      areaOptions: [],
      memberOptions: []
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
    this.fetchMemberOptions()
    this.areaOptions = [this.companyStruct]
    this.walk(this.areaOptions)
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchMemberOptions()
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    resetForm() {
      this.form.typeIds = []
      this.form.areaIds = []
      this.form.statusIds = []
      this.form.areaTemp = []
      this.form.userIds = []
      this.$emit('change', JSON.parse(JSON.stringify(this.form)))
      this.dialogVisible = false
    },
    submitForm() {
      this.$emit('change', JSON.parse(JSON.stringify(this.form)))
      this.dialogVisible = false
    },
    fetchMemberOptions() {
      getMaintenancePageParameter({
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.memberOptions = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
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
