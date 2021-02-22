<template>
  <el-dialog
    width="320px"
    title="选择导出的字段"
    custom-class="repairOrder-export-dialog"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div>
      <draggable
        :list="fieldList"
        class="list-group"
        ghost-class="ghost"
        @start="dragging = true"
        @end="dragging = false"
      >
        <div
          v-for="(item, index) in fieldList"
          :key="item.key"
          class="list-item"
        >
          <c-svg class="drag-icon" name="tuozhuai"></c-svg>
          <c-svg class="desc-icon" :name="item.icon"></c-svg>
          <span class="desc">{{ item.label }}</span>
          <el-link
            :disabled="fieldList.length === 1"
            @click.native="() => deleteField(index)"
            class="delete-btn"
            :underline="false"
          >
            <i class="el-icon-circle-close"></i>
          </el-link>
        </div>
      </draggable>
      <el-button
        @click.native="handleClickAdd"
        type="text"
        :disabled="!otherFieldList.length"
        style="margin-left: 40px;"
      >
        <i class="el-icon-circle-plus" style="margin-right: 6px;"></i>
        添加字段 {{ `${fieldList.length}/${list.length}` }}
      </el-button>
    </div>
    <span slot="footer">
      <el-button
        :loading="exportLoading"
        size="medium"
        type="primary"
        @click.native="handleExport"
        >导 出</el-button
      >
    </span>
    <ExportAddField
      @change="handleChangeField"
      ref="exportAddField"
      :list="otherFieldList"
    />
  </el-dialog>
</template>

<script>
import draggable from 'vuedraggable'
import { exportNewRepairActivePage } from '@/api/newRepairActive'
import fileSaver from 'file-saver'
import ExportAddField from './exportAddField'
export default {
  props: {
    list: Array,
    filterCondition: Object
  },
  components: {
    draggable,
    ExportAddField
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectList() {
      return this.$store.state.app.proList
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  data() {
    return {
      dialogVisible: false,
      exportLoading: false,
      dragging: false,
      fieldList: [],
      otherFieldList: []
    }
  },
  watch: {
    list(val) {
      const temp = JSON.parse(JSON.stringify(val))
      this.fieldList = temp.filter(v => !v.hidden)
      this.otherFieldList = temp.filter(v => v.hidden)
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    deleteField(index) {
      if (this.fieldList.length === 1) {
        // 至少保留一个导出字段
        return
      }
      const temp = this.fieldList.splice(index, 1)
      this.otherFieldList.push(...temp)
    },
    handleClickAdd() {
      this.$refs.exportAddField.openDialog()
    },
    handleChangeField({ list, otherList }) {
      this.fieldList.push(...list)
      this.otherFieldList = otherList
    },
    handleExport() {
      this.exportLoading = true
      const {
        text,
        sortProp,
        isAsc,
        isRelateMe,
        deviceTypeIds,
        createDateRange,
        statusIds,
        repairCompanyIds,
        repairUserIds,
        maintenanceCompanyIds,
        maintenanceUserIds
      } = this.filterCondition

      const ids = []
      statusIds.forEach(v => {
        ids.push(...v)
      })

      exportNewRepairActivePage({
        CompanyId: this.companyId,
        Status: ids,
        StartCreateTime: createDateRange ? createDateRange[0] : undefined,
        EndCreateTime: createDateRange ? createDateRange[1] : undefined,
        ProjectIdList: repairCompanyIds.length
          ? repairCompanyIds
          : this.platform === PLATFORM.business
          ? [this.projectId]
          : this.projectList.map(v => v.id),
        ApplicantIdList: repairUserIds,
        ProjectName: '',
        BigTypeIdList: deviceTypeIds,
        BigTypeId: undefined,
        SmallTypeId: undefined,
        EquipmentId: undefined,
        MaintenanceUnitIdList: maintenanceCompanyIds,
        RepairUserIdList: maintenanceUserIds,
        AcceptanceTime: undefined,
        FaultContent: '',
        ApplicantNameOrPhone: '',
        FaultContentOrOrder: text,
        IsApp: false,
        IsMy: isRelateMe === true ? isRelateMe : undefined,
        SortType: sortProp,
        IsAsc: isAsc,
        FieldList: this.fieldList.map(v => v.key)
      })
        .then(res => {
          if (
            res.headers['content-type'] === 'application/json; charset=utf-8'
          ) {
            // blob转json
            var reader = new FileReader()
            reader.onload = e => {
              const temp = JSON.parse(e.target.result)
              this.$message(temp.Message)
            }
            reader.readAsText(res.data)
            return false
          }
          const blob = new Blob([res.data])
          fileSaver.saveAs(blob, '维修工单列表.xls')
        })
        .catch(err => {
          console.error(err)
          this.$message.error('导出失败')
        })
        .finally(() => {
          this.exportLoading = false
          this.dialogVisible = false
        })
    }
  }
}
</script>

<style lang="scss">
.repairOrder-export-dialog {
  .el-dialog__body {
    padding: 0;
  }
  .list-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    &:hover {
      background-color: #f7f7f7;
      .drag-icon {
        opacity: 1;
      }
      .delete-btn {
        opacity: 1;
        pointer-events: all;
      }
    }
  }
  .desc-icon {
    margin: 0 10px;
  }
  .desc {
    flex: 1;
  }
  .delete-btn {
    opacity: 0;
    pointer-events: none;
  }
  .drag-icon {
    opacity: 0;
    transition: opacity 0.5s;
    cursor: move;
  }
}
</style>
