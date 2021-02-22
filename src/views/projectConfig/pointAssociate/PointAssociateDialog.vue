<template>
  <el-dialog
    width="400px"
    title="点位关联"
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
      <el-form-item label="已选中点位：">
        <el-link type="primary" :underline="false">{{
          pointIds.length
        }}</el-link>
        个
      </el-form-item>
      <el-form-item label="关联设备：" prop="device">
        <el-cascader
          v-model="form.device"
          :options="associateDeviceOptions"
          :show-all-levels="false"
          :props="{
            multiple: true,
            children: 'Children',
            label: 'Value',
            value: 'Key'
          }"
          @change="associateDeviceChange"
          clearable
          filterable
        >
          <template slot-scope="{ node, data }">
            <i
              v-if="node.value === -1"
              class="el-icon-plus"
              style="margin-right: 6px;"
            ></i>
            <span>{{ data.Value }}</span>
          </template></el-cascader
        >
      </el-form-item>
      <el-form-item label="关联区域：" prop="area">
        <el-cascader
          v-model="form.area"
          :options="associateAreaOptions"
          :show-all-levels="false"
          @change="associateAreaChange"
          :props="{
            checkStrictly: true,
            emitPath: false,
            children: 'Child',
            label: 'mname',
            value: 'mtid'
          }"
          clearable
          filterable
        >
          <template v-slot:empty>
            正在加载中...
          </template>
          <template slot-scope="{ node, data }">
            <i
              v-if="node.value < 0"
              class="el-icon-plus"
              style="margin-right: 6px;"
            ></i>

            <span>{{ data.mname }}</span>
          </template></el-cascader
        >
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >确 定</el-button
      >
    </span>
    <AddAreaDialog
      ref="addAreaDialog"
      @refresh="handleAreaAdd"
      :parentId="currentParentNode"
    />
    <DeviceAddDialog ref="addDialog" @refresh="fetchAssociateDeviceOptions" />
  </el-dialog>
</template>

<script>
import AddAreaDialog from './AddAreaDialog'
import { modelTrees } from '@/api/model_new'
import DeviceAddDialog from '../deviceList/DeviceAddDialog'

import {
  pointRelevanceModelTreeAndLocation,
  getSubsystemAndModelTreeDropdownList
} from '@/api/point'

export default {
  props: {
    pointIds: Array
  },
  components: {
    AddAreaDialog,
    DeviceAddDialog
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,

      form: {
        device: [],
        area: undefined
      },
      rules: {
        // device: [
        //   {
        //     type: 'array',
        //     required: true,
        //     message: '请选择',
        //     trigger: 'change'
        //   }
        // ]
      },
      associateDeviceOptions: [],
      currentParentNode: undefined,
      associateAreaOptions: []
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchAreaOptions()
    this.fetchAssociateDeviceOptions()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    associateDeviceChange(val) {
      this.form.device = val.filter(item1 => {
        if (item1[0] === -1) {
          // 说明点击的是新增设备
          this.$refs.addDialog.openDialog()
          return false
        } else {
          return true
        }
      })
    },
    associateAreaChange(val) {
      // 说明点击的是新增区域操作
      if (val < 0) {
        this.currentParentNode = this.findParent(
          this.associateAreaOptions[0].Child,
          val,
          this.associateAreaOptions[0]
        )
        this.form.area = ''
        this.$refs.addAreaDialog.openDialog()
      }
    },
    handleAreaAdd({ areaId }) {
      this.form.area = areaId
      this.fetchAreaOptions()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { device, area } = this.form
          if (!device.length && !area) {
            this.$message('关联设备和关联区域请至少填写一项')
            return false
          }
          let temp = []
          device.forEach(item => {
            if (item[2]) {
              // 只取设备id
              temp.push(item[2])
            }
          })
          if (area) {
            temp.push(area)
          }
          this.submitLoading = true
          pointRelevanceModelTreeAndLocation({
            PointIdList: this.pointIds,
            ModelTreeOrLocationIdList: temp
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('点位关联成功')
                this.dialogVisible = false
                this.$emit('refresh')
              } else {
                this.$message.error('点位关联失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('点位关联失败')
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
    fetchAreaOptions() {
      this.associateAreaOptions = []
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
    // 添加新增区域按钮
    walk(arr, level = 1) {
      if (level !== 1) {
        arr.push({
          mtid: -1 * Math.random(),
          mname: '新增区域'
        })
      }
      arr.forEach(item => {
        if (item.Child) {
          level += 1
          this.walk(item.Child, level)
        }
      })
    },
    findParent(arr, id, parent) {
      let parentId = null
      // eslint-disable-next-line no-unused-vars
      function walk(arr, id, parent) {
        arr.forEach(item => {
          if (!parentId) {
            if (item.mtid === id) {
              parentId = parent.mtid
            } else {
              if (item.Child) {
                walk(item.Child, id, item)
              }
            }
          }
        })
      }
      walk(arr, id, parent)

      if (parentId) {
        return parentId
      }
    },
    fetchAssociateDeviceOptions() {
      getSubsystemAndModelTreeDropdownList({ projectId: this.projectId }).then(
        res => {
          if (res.data.Code === 200) {
            this.associateDeviceOptions = res.data.Data
            this.associateDeviceOptions.push({
              Key: -1,
              Value: '新增设备'
            })
          }
        }
      )
    }
  }
}
</script>
