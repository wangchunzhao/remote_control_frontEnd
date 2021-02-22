<template>
  <el-dialog
    width="360px"
    title="变更点位属性"
    append-to-body
    custom-class="edit-prop-dialog"
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
      <el-form-item label="选择属性：">
        <el-select
          v-model="form.propType"
          placeholder="请选择属性"
          @change="
            () => {
              unitOptions = []
              form.unit = ''
            }
          "
        >
          <el-option label="名称" :value="1" />
          <el-option label="类型/单位" :value="2" />
          <el-option label="测点级别" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="变更方式：" v-if="form.propType === 1">
        <el-radio-group v-model="form.nameChangeType">
          <el-radio :label="1">覆盖</el-radio>
          <el-radio :label="2">局部替换</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="form.propType === 1 && form.nameChangeType === 2"
        label="查找文本："
        prop="findName"
      >
        <el-input
          style="width: 193px;"
          v-model.trim="form.findName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item v-if="form.propType === 1" label="替换文本：" prop="name">
        <el-input
          style="width: 193px;"
          v-model.trim="form.name"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-if="form.propType === 2"
        ref="pointTypeId"
        label="选择类型："
        prop="pointTypeId"
      >
        <el-select
          v-model="form.pointTypeId"
          filterable
          placeholder="请选择点位类型"
          @change="changePointType"
        >
          <el-option-group
            v-for="group in pointTypeOptions"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.ID"
              :label="item.TypeName"
              :value="item.ID"
            >
              <span style="float: left;margin-right: 25px;">{{
                item.TypeName
              }}</span>
              <span
                v-if="group.label === '状态量'"
                style="float: right; color: #8492a6; font-size: 13px"
                >{{ item.Value }}</span
              >
            </el-option>
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="showUnitFormItem && unitOptions.length"
        ref="unit"
        label="选择单位："
        prop="unit"
      >
        <el-select v-model="form.unit" placeholder="请选择单位">
          <el-option
            v-for="item in unitOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="level" v-if="form.propType === 3" label="选择级别：">
        <el-select v-model="form.level" placeholder="请选择测点级别">
          <el-option label="一级" :value="1" />
          <el-option label="二级" :value="2" />
          <el-option label="三级" :value="3" />
        </el-select>
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
  </el-dialog>
</template>

<script>
import { batchUpdatePoint } from '@/api/point'
import { fetchPointTypeList } from '@/api/pointType'
import { logSnapShotFactory } from '@/utils/logSnapShot'

export default {
  props: {
    pointIds: Array
  },
  data() {
    return {
      dialogVisible: false,

      submitLoading: false,
      form: {
        propType: 1,
        level: '',
        name: '',
        findName: '',
        nameChangeType: 1,
        pointTypeId: '',
        unit: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '必填',
            trigger: 'blur'
          }
        ],
        findName: [
          {
            required: true,
            message: '必填',
            trigger: 'blur'
          }
        ],
        pointTypeId: [
          {
            required: true,
            message: '必填',
            trigger: 'blur'
          }
        ],
        unit: [
          {
            required: true,
            message: '必填',
            trigger: 'blur'
          }
        ],
        level: [
          {
            required: true,
            message: '必填',
            trigger: 'change'
          }
        ]
      },

      pointTypeOptions: [],
      showUnitFormItem: false,
      unitOptions: []
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchPointTypeOptions()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.form.name = ''
      this.form.findName = ''
      this.form.level = ''
      this.form.unit = ''
      this.form.pointTypeId = ''
      this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const {
            name,
            findName,
            nameChangeType,
            propType,
            level,
            pointTypeId,
            unit
          } = this.form
          let form = { PointIdList: this.pointIds, UpdatePointType: propType }
          if (propType === 1) {
            form.PointName = name
            if (nameChangeType === 1) {
              form.FindPointName = null
            } else {
              form.FindPointName = findName
            }
          } else if (propType === 2) {
            form.PointTypeId = pointTypeId
            form.Unit = unit || undefined
          } else if (propType === 3) {
            form.Level = level
          }

          const { fileName, bucketName, objectName } = logSnapShotFactory(
            document.querySelector('.edit-prop-dialog .el-dialog__body')
          )
          const storageSpaceExtendList = {
            FileNameList: [fileName],
            BucketName: bucketName,
            ObjectName: objectName
          }
          form.ProjectId = this.projectId
          form.StorageSpaceExtendList = storageSpaceExtendList
          batchUpdatePoint(form)
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success(
                  `属性变更成功（选中${this.pointIds.length}个，变更成功${res.data.Data}个）`
                )
                this.$emit('refresh')
                this.$emit('change', {
                  propType,
                  form
                })
                this.dialogVisible = false
              } else {
                this.$message.error('属性变更失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('属性变更失败')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
        }
      })
    },
    // 切换点位类型
    changePointType(val) {
      this.showUnitFormItem = false
      this.unitOptions = []
      this.form.unit = ''
      this.pointTypeOptions[1].options.forEach(item => {
        if (item.ID === val) {
          this.showUnitFormItem = true
          item.Value &&
            (this.unitOptions = item.Value.split('|').map(v => v.trim()))
        }
      })
    },
    fetchPointTypeOptions() {
      // 获取点位类型
      fetchPointTypeList(this.projectId).then(res => {
        const data = res.data.Data
        this.pointTypeOptions = [
          {
            label: '状态量',
            options: data.State
          },
          {
            label: '模拟量',
            options: data.Analog
          }
        ]
      })
    }
  }
}
</script>
