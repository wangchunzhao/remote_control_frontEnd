<template>
  <el-dialog
    width="330px"
    title=""
    custom-class="device-filter-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="80px" size="small">
      <el-form-item label="设备类型" prop="types">
        <el-cascader
          v-model="form.types"
          :options="monitroTypeOptions"
          :props="{
            multiple: true,
            value: 'ID',
            label: 'TypeName',
            children: 'subset'
          }"
        />
      </el-form-item>
      <el-form-item label="关联区域" prop="associateArea">
        <el-cascader
          v-model="form.associateArea"
          :options="associateAreaOptions"
          :show-all-levels="false"
          :props="{
            checkStrictly: true,
            multiple: true,
            emitPath: false,
            children: 'Child',
            label: 'mname',
            value: 'mtid'
          }"
          clearable
          filterable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="监控状态" prop="status">
        <el-select
          v-model="form.status"
          multiple
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option label="在线" :value="2"></el-option>
          <el-option label="离线" :value="1"></el-option>
          <el-option label="报警" :value="3"></el-option>
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
import { monitorTypeList } from '@/api/monitorTypeProject'
import { modelTrees } from '@/api/model_new'

export default {
  data() {
    return {
      dialogVisible: false,

      form: {
        types: [],
        associateArea: [],
        status: []
      },
      associateAreaOptions: [],

      monitroTypeOptions: []
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    industryId() {
      return this.$store.state.app.project.Industry
    },

    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchAreaOptions()
    this.fetchMonitorTypeOption()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    resetForm() {
      this.form = {
        types: [],
        associateArea: [],
        status: []
      }

      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    submitForm() {
      this.$emit('change', this.form)
      this.dialogVisible = false
    },
    // 监控分类选项
    fetchMonitorTypeOption() {
      monitorTypeList({
        projectId: this.projectId,
        industry: this.industryId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.monitroTypeOptions = res.data.Data.subset
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchAreaOptions() {
      modelTrees({
        projectId: this.projectId,
        isGetModelTree: false
      }).then(res => {
        if (res.data.Code === 200) {
          this.associateAreaOptions = res.data.Data
          this.walk(this.associateAreaOptions)
        }
      })
    },
    // 删除空的Child
    walk(arr) {
      arr.forEach(item => {
        if (item.Child) {
          if (!item.Child.length) {
            delete item.Child
          } else {
            this.walk(item.Child)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.device-filter-dialog {
  .el-dialog__header {
    display: none;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
