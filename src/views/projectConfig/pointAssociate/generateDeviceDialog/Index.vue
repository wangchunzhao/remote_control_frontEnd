<template>
  <el-dialog
    width="500px"
    title="批量生成设备"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="110px"
      size="small"
    >
      <el-form-item label="已选中点位：">
        <el-link type="primary" :underline="false">{{ points.length }}</el-link>
        个
      </el-form-item>
      <el-form-item label="设备类型：" prop="deviceType">
        <el-cascader
          v-model="form.deviceType"
          :options="monitroTypeOptions"
          clearable
          filterable
          :props="{
            value: 'ID',
            label: 'TypeName',
            children: 'subset'
          }"
        />
      </el-form-item>
    </el-form>
    <div>生成设备列表：</div>
    <el-table :data="tableData" style="margin: 15px 15px 0; width: auto;">
      <el-table-column prop="deviceName" label="设备名称">
        <template slot-scope="{ row }">
          <el-input
            v-model="row.deviceName"
            v-if="row.nameEditable"
            placeholder="请输入"
            size="mini"
            style="width: 80%;"
          ></el-input>
          <span v-else style="padding-right: 20px;display: inline-block;">
            {{ row.deviceName }}
          </span>
          <el-link
            @click.native="
              () => {
                row.nameEditable = !row.nameEditable
              }
            "
            :icon="row.nameEditable ? 'el-icon-check' : 'el-icon-edit'"
            style="position: absolute; top: 18px;right: 10px;"
          ></el-link>
        </template>
      </el-table-column>
      <el-table-column label="点位数量" width="80">
        <template slot-scope="{ row }">
          <el-button
            @click.native="() => handleClickNum(row)"
            type="text"
            style="padding: 0;"
            >{{ row.pointList.length }}</el-button
          >
        </template>
      </el-table-column>
      <el-table-column width="70" label="操作">
        <template slot-scope="{ $index }">
          <el-button
            @click.native="() => tableDataSource.splice($index, 1)"
            type="text"
            class="btn-danger"
            style="padding: 0;"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, prev, pager, next"
        :total="tableDataSource.length"
        @current-change="handleCurrentChange"
      />
    </div>
    <span slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
    <el-dialog
      width="450px"
      append-to-body
      title="编辑设备点位"
      :visible.sync="pointDialogVisible"
    >
      <el-button @click.native="handleClickEditProp" size="small" type="primary"
        >变更点位属性</el-button
      >
      <el-button size="small" type="danger" @click.native="handleRemovePoint"
        >移除</el-button
      >
      <el-table
        :data="currentRow.pointList"
        style="margin-top: 15px;"
        @selection-change="val => (multipleSelection = val)"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="PointName" label="点位名称"> </el-table-column>
        <el-table-column prop="PointTypeName" label="类型"> </el-table-column>
        <el-table-column prop="Unit" width="70" label="单位"> </el-table-column>
        <el-table-column prop="Level" width="70" label="等级">
          <template slot-scope="{ row }">
            {{ levelOptions[row.Level] }}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer">
        <el-button
          size="medium"
          type="primary"
          @click.native="() => (pointDialogVisible = false)"
          >确 定</el-button
        >
      </span>
      <EditPropDialog
        ref="editPropDialog"
        @change="handlePointPropChange"
        :point-ids="multipleSelection.map(item => item.PointId)"
      />
    </el-dialog>
    <FixConflictDialog @submit="handleFixConflict" ref="fixConflictDialog" />
  </el-dialog>
</template>

<script>
import EditPropDialog from '../EditPropDialog'
import { monitorTypeList } from '@/api/monitorTypeProject'
import { batchAddModelTree } from '@/api/point'
import FixConflictDialog from './FixConflictDialog'

export default {
  props: {
    points: Array
  },
  components: {
    EditPropDialog,
    FixConflictDialog
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,

      monitroTypeOptions: [],
      form: {
        deviceType: []
      },
      rules: {
        deviceType: [
          {
            type: 'array',
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        ]
      },
      tableDataSource: [],
      currentRow: {},
      pagination: {
        currentPage: 1,
        size: 10
      },

      pointDialogVisible: false,
      multipleSelection: [],
      levelOptions: {
        1: '一级',
        2: '二级',
        3: '三级'
      }
    }
  },
  watch: {
    points(val) {
      let list = []
      val.forEach(item => {
        const temp = list.find(item2 => item2.deviceName === item.Name)
        if (temp) {
          temp.pointList.push(item)
        } else {
          list.push({
            deviceName: item.Name,
            nameEditable: false,
            pointList: [item]
          })
        }
        this.tableDataSource = list
      })
    }
  },
  computed: {
    tableData() {
      return this.tableDataSource.slice(
        (this.pagination.currentPage - 1) * this.pagination.size,
        (this.pagination.currentPage - 1) * this.pagination.size +
          this.pagination.size
      )
    },
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
    this.fetchMonitorTypeOption()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    // 分页
    handleCurrentChange() {
      // this.fetchTableData()
    },
    handleClickNum(row) {
      this.currentRow = row
      this.pointDialogVisible = true
    },
    handleFixConflict(res) {
      // type,
      // key,
      // deviceId,
      // name
      res.forEach(item => {
        let temp = this.tableDataSource.find(
          item2 => item2.deviceName === item.key
        )
        if (temp) {
          // 重命名
          if (item.type === 1) {
            temp.deviceName = item.name
            temp.deviceId = undefined
            temp.isAdd = true
          } else {
            // 合并
            temp.deviceId = item.deviceId
            temp.isAdd = false
          }
        }
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { deviceType } = this.form
          if (!this.tableData.length) {
            this.$message('请至少添加一个设备')
            return false
          }
          if (this.tableDataSource.find(item => item.deviceName === '')) {
            this.$message('名字不能为空')
            return false
          }
          let list = []
          this.tableDataSource.forEach(item => {
            list.push({
              ModelTreeId: item.deviceId,
              ModelTreeName: item.deviceName,
              isAdd: item.isAdd === undefined ? true : item.isAdd,
              PointIdList: item.pointList.map(point => point.PointId)
            })
          })
          this.submitLoading = true
          batchAddModelTree({
            ProjectId: this.projectId,
            BigTypeId: deviceType[0],
            SmallTypeId: deviceType[1],
            LocationId: undefined,
            OperateType: 1,
            ModelTreeInfoList: list
          })
            .then(res => {
              if (res.data.Code === 200) {
                const data = res.data.Data
                if (Object.keys(data).length) {
                  this.$refs.fixConflictDialog.openDialog(data)
                } else {
                  this.$message.success('设备生成成功')
                  this.dialogVisible = false
                  this.$emit('refresh')
                }
              } else {
                this.$message.error('设备生成失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('设备生成失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleRemovePoint() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.currentRow.pointList = this.currentRow.pointList.filter(item => {
        if (
          this.multipleSelection.find(item2 => item2.PointId === item.PointId)
        ) {
          return false
        } else {
          return true
        }
      })
    },
    handlePointPropChange({ propType, form }) {
      if (propType === 1) {
        this.multipleSelection.forEach(
          item => (item.PointName = form.PointName)
        )
      } else if (propType === 2) {
        this.multipleSelection.forEach(item => {
          item.PointTypeId = form.PointTypeId
          item.Unit = form.Unit
        })
      } else if (propType === 3) {
        this.multipleSelection.forEach(item => (item.Level = form.Level))
      }
    },
    handleClickEditProp() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$refs.editPropDialog.openDialog()
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
    }
  }
}
</script>
