<template>
  <el-dialog
    width="600px"
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="maintenanceTeam-edit-dialog"
  >
    <template v-slot:title>
      <el-tooltip
        class="item"
        effect="dark"
        content="点击可编辑"
        placement="top"
      >
        <div
          @blur.self="handleTitleBlur"
          placeholder="请输入"
          contenteditable
          class="el-dialog__title"
        >
          {{ form.name }}
        </div>
      </el-tooltip>
    </template>

    <div class="row">
      <div class="label-td">
        状态
        <el-tooltip
          class="item"
          effect="dark"
          content="将维保团队状态修改为「停用」后，报修时将无法选择该团队作为维修方"
          placement="top"
        >
          <c-svg
            name="info-circle-fill"
            style="color: #BFBFBF;margin-left: 8px;"
          ></c-svg>
        </el-tooltip>
      </div>
      <div class="value-td">
        <el-select
          v-if="form.statusEditable"
          size="mini"
          v-model="form.status"
          placeholder="请选择"
        >
          <el-option label="正常" :value="0"> </el-option>
          <el-option label="停用" :value="1"> </el-option>
        </el-select>
        <el-tag
          v-else
          :type="form.status === 0 ? 'success' : 'info'"
          size="mini"
        >
          {{ form.status === 0 ? '正常' : '停用' }}
        </el-tag>
        <div>
          <el-link
            v-if="form.statusEditable === false"
            @click.native="() => (form.statusEditable = true)"
            class="edit-btn"
            :underline="false"
            type="primary"
          >
            <c-svg name="bianji"></c-svg>
          </el-link>
          <div v-else>
            <el-button
              @click.native="form.statusEditable = false"
              size="mini"
              type="text"
              >取消</el-button
            >
            <el-button
              @click.native="
                () => {
                  updateTeam({ Status: form.status })
                  form.statusEditable = false
                }
              "
              size="mini"
              type="primary"
              >保存</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="label-td">维保片区</div>
      <div class="value-td">
        <el-cascader
          v-model="form.areaIds"
          v-if="form.areaEditable"
          ref="cascader"
          size="mini"
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
        <div v-else>{{ form.areaLabel }}</div>
        <div>
          <el-link
            v-if="form.areaEditable === false"
            @click.native="() => (form.areaEditable = true)"
            class="edit-btn"
            :underline="false"
            type="primary"
          >
            <c-svg name="bianji"></c-svg>
          </el-link>
          <div v-else>
            <el-button
              @click.native="form.areaEditable = false"
              size="mini"
              type="text"
              >取消</el-button
            >
            <el-button @click.native="handleEditArea" size="mini" type="primary"
              >保存</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="label-td">维保类型</div>
      <div class="value-td">
        <el-select
          v-model="form.typeIds"
          collapse-tags
          filterable
          multiple
          v-if="form.typeEditable"
          size="mini"
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
        <div v-else>
          {{ form.typeLabel }}
        </div>
        <div>
          <el-link
            v-if="form.typeEditable === false"
            @click.native="() => (form.typeEditable = true)"
            class="edit-btn"
            :underline="false"
            type="primary"
          >
            <c-svg name="bianji"></c-svg>
          </el-link>
          <div v-else>
            <el-button
              @click.native="form.typeEditable = false"
              size="mini"
              type="text"
              >取消</el-button
            >
            <el-button @click.native="handleEditType" size="mini" type="primary"
              >保存</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <div style="margin: 15px 0;">
      <el-button
        size="small"
        type="primary"
        @click.native="() => $refs.memberAddDialog.openDialog()"
      >
        新增</el-button
      >
      <el-button @click.native="handleClickRemove" size="small" type="danger"
        >移除</el-button
      >
      <el-button @click.native="handleSetManage" size="small" primary
        >设为管理员</el-button
      >
    </div>
    <el-table
      :data="tableData"
      style="width: 100%;"
      empty-text="点击上方按钮添加团队成员"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="Value" label="成员姓名">
        <template slot-scope="{ row }">
          {{ row.Value }}
          <c-svg
            v-if="row.Extend2 === 1"
            style="font-size: 16;color: #1890FF;margin-left: 6px;"
            name="guanli"
          />
        </template>
      </el-table-column>
      <el-table-column prop="Title" label="手机号" />
    </el-table>
    <span slot="footer">
      <el-button
        :loading="deleteLoading"
        size="medium"
        type="danger"
        @click.native="handleDelete"
        >删 除</el-button
      >
    </span>
    <MemberAddDialog @change="handleMemberAdd" ref="memberAddDialog" />
  </el-dialog>
</template>

<script>
import MemberAddDialog from './MemberAddDialog'
import {
  getMaintenancePageParameter,
  deleteMaintenance,
  addOrUpdateMaintenance,
  setMaintenanceAdmin
} from '@/api/maintenance'

export default {
  props: {
    maintenanceTypeOptions: Array
  },
  components: {
    MemberAddDialog
  },
  data() {
    return {
      dialogVisible: false,

      form: {
        teamId: '',
        name: '',
        status: '',
        areaIds: [],
        typeIds: [],
        typeLabel: '',
        areaLabel: '',
        statusEditable: false,
        areaEditable: false,
        typeEditable: false
      },
      areaOptions: [],
      deleteLoading: false,

      multipleSelection: [],
      tableData: []
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
    this.areaOptions = [this.companyStruct]
    this.walk(this.areaOptions)
  },
  methods: {
    openDialog(payload) {
      this.dialogVisible = true
      this.form.teamId = payload.MaintenanceId
      this.form.name = payload.MaintenanceName
      this.form.typeLabel = payload.SubsystemList.map(v => v.Value).join('，')
      this.form.areaLabel = payload.SubareaList.map(v => v.Value).join('，')
      this.form.typeIds = payload.SubsystemList.map(v => v.Key)
      this.form.areaIds = payload.SubareaList.map(v => v.Key)
      this.form.status = payload.Status
      this.fetchMemberList()
    },
    handleClose() {
      this.form.name = ''
      this.form.areaIds = []
      this.form.teamId = ''
      this.form.typeIds = []
      this.form.teamId = ''
      this.form.statusEditable = false
      this.form.typeEditable = false
      this.form.areaEditable = false
      this.tableData = []
      this.multipleSelection = []
      this.dialogVisible = false
    },

    handleTitleBlur(e) {
      const text = e.target.innerText
      if (text === '') {
        this.$message('团队名称不可以为空')
        return
      }
      if (text !== this.form.name) {
        this.form.name = text
        this.updateTeam({ MaintenanceName: text })
      }
    },
    handleEditType() {
      if (!this.form.typeIds.length) {
        this.$message('请至少选中一项维保类型')
        return false
      }

      this.updateTeam({ SubsystemIdList: this.form.typeIds })
      this.form.typeEditable = false
      this.form.typeLabel = this.maintenanceTypeOptions
        .filter(v => this.form.typeIds.includes(v.id))
        .map(v => v.mname)
        .join('，')
    },
    handleEditArea() {
      const checkNodes = this.$refs.cascader.getCheckedNodes(false)
      const ids = []
      checkNodes.forEach(v => {
        if (v.parent === null) {
          // 选中的是根节点
          ids.push(v.value)
        } else if (v.parent.checked === false) {
          ids.push(v.value)
        }
      })
      if (!ids.length) {
        this.$message('请至少选中一个维保区域')
        return false
      }
      this.updateTeam({ SubareaIdList: ids })
      this.form.areaLabel = checkNodes
        .filter(v => ids.includes(v.value))
        .map(v => v.label)
        .join('，')
      this.form.areaEditable = false
    },
    handleSetManage() {
      if (!this.multipleSelection.length) {
        this.$message('请选中一个成员')
        return
      }
      if (this.multipleSelection.length !== 1) {
        this.$message('只能选中一个成员')
        return
      }
      setMaintenanceAdmin({
        userId: this.multipleSelection[0].Key,
        maintenanceId: this.form.teamId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('管理员修改成功')
            this.fetchMemberList()
          } else {
            this.$message.error('管理员修改失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    handleClickRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一个要移除的成员')
        return
      }
      this.$confirm('确认要移除选中的的成员?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.tableData = this.tableData.filter(v => {
            return !this.multipleSelection.find(vv => vv.Key === v.Key)
          })
          this.updateTeam({
            UserIdList: this.tableData.map(v => v.Key)
          })
        })
        .catch(() => {})
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleDelete() {
      this.$confirm(`确认要移除维保团队『${this.form.name}』?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteLoading = true
          deleteMaintenance({
            ids: [this.form.teamId]
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('删除成功')
                this.$emit('refresh')
                this.dialogVisible = false
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('删除失败')
            })
            .finally(() => {
              this.deleteLoading = false
            })
        })
        .catch(() => {})
    },
    handleMemberAdd(list) {
      if (!list.length) {
        return
      }
      list.forEach(v => {
        if (!this.tableData.find(vv => vv.Key === v.Key)) {
          this.tableData.push(v)
        }
      })
      this.updateTeam({
        UserIdList: this.tableData.map(v => v.Key)
      })
    },
    updateTeam(props = {}) {
      const { teamId } = this.form
      addOrUpdateMaintenance({
        MaintenanceId: teamId,
        CompanyId: this.companyId,
        ...props
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            if (data.Data) {
              this.$message.success('更新成功')
              this.$emit('refresh')
            } else {
              this.$message.error('更新失败')
            }
          } else {
            this.$message.error('更新失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('更新失败')
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    fetchMemberList() {
      const { teamId } = this.form
      getMaintenancePageParameter({
        companyId: this.companyId,
        maintenanceId: teamId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tableData = res.data.Data
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
.maintenanceTeam-edit-dialog {
  .row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.09);
    background-color: rgba(0, 0, 0, 0.02);
  }
  .label-td {
    flex: 0 0 90px;
    padding: 0 16px;
    min-height: 40px;
    line-height: 40px;
  }
  .value-td {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background-color: #fff;
    &:hover {
      .edit-btn {
        display: inline-block;
      }
    }
    .el-button {
      padding: 5px;
    }
  }
  .edit-btn {
    display: none;
  }
  .el-dialog__title {
    cursor: pointer;
    margin-right: 30px;
    border-radius: 5px;
    &:hover {
      background-color: #f7f7f7;
    }
  }
  [contenteditable='true']:empty::before {
    content: attr(placeholder);
  }
}
</style>
