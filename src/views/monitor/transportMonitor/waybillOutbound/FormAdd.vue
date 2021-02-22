<template>
  <el-form
    ref="form"
    :model="form"
    :rules="formRules"
    label-width="85px"
    size="medium"
    inline
  >
    <el-form-item label="运单号" prop="orderNo">
      <el-input
        v-model="form.orderNo"
        style="width: 201px;"
        placeholder="请输入运单号"
      />
    </el-form-item>
    <el-form-item label="运送车辆" prop="car">
      <el-select
        v-model="form.car"
        placeholder="请选择车辆"
        clearable
        style="width: 201px"
      >
        <el-option
          v-for="item in carOptions"
          :key="item.Key"
          :label="item.Value"
          :value="item.Key"
        />
      </el-select>
    </el-form-item>
    <div>
      <el-form-item label="路线" prop="startPlace">
        <el-input
          v-model="form.startPlace"
          style="width: 201px;"
          placeholder="请输入出发地"
        />
      </el-form-item>
      <c-svg
        name="right-arrow"
        style="font-size: 20px;transform: translateY(7px);margin-right: 8px;"
      />
      <el-form-item label="" label-width="0" prop="endPlace">
        <el-input
          v-model="form.endPlace"
          style="width: 201px;"
          placeholder="请输入目的地"
        />
      </el-form-item>
    </div>
    <el-form-item label="温度范围" prop="range">
      <el-select
        v-model="form.range"
        placeholder="请选择温度范围"
        clearable
        style="width: 201px"
      >
        <el-option
          v-for="item in tempRangOptions"
          :key="item.Key"
          :label="item.Value"
          :value="item.Key"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="绑定终端" prop="terminalIds">
      <el-select
        v-model="form.terminalIds"
        multiple
        placeholder="请选择数据终端"
        clearable
        filterable
        style="width: 450px;"
      >
        <el-option-group
          v-for="group in terminalOptions"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="item in group.options"
            :key="item.Key"
            :label="item.Value"
            :value="item.Key"
          />
        </el-option-group>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import {
  getTerminalDropdow,
  getProjectForCarList,
  getTempRangeWeb
} from '@/api/device_new'
export default {
  data() {
    return {
      terminalOptions: [],
      carOptions: [],
      tempRangOptions: [],

      form: {
        orderNo: '',
        car: null,
        startPlace: '',
        endPlace: '',
        range: '',
        terminalIds: []
      },
      formRules: {
        orderNo: [
          { required: true, message: '请输入运单号', trigger: 'change' }
        ],
        terminalIds: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一个数据终端',
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.fetchOptions()
  },
  methods: {
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate(valid => {
          if (valid) {
            const {
              orderNo,
              car,
              startPlace,
              endPlace,
              range,
              terminalIds
            } = this.form

            const tags = []
            const terminals = []
            this.terminalOptions[0].options.forEach(item => {
              if (terminalIds.indexOf(item.Key) > -1) {
                terminals.push(item)
              }
            })
            this.terminalOptions[1].options.forEach(item => {
              if (terminalIds.indexOf(item.Key) > -1) {
                terminals.push(item)
              }
            })
            terminals.forEach(item => {
              if (item.Type === 1) {
                tags.push({
                  Type: 't',
                  TagId: item.Value,
                  TagType: item.TagType
                })
              } else {
                tags.push({
                  Type: 't',
                  TagId: item.Value,
                  TagType: item.TagType
                })
                tags.push({
                  Type: 'h',
                  TagId: item.Value,
                  TagType: item.TagType
                })
              }
            })
            const form = {
              CompanyId: this.companyId,
              ProjectId: this.projectId,
              WaybillNumber: orderNo,
              Departure: startPlace,
              Destination: endPlace,
              Tags: tags,
              TempRangeId: range
            }
            if (car) {
              form.CarId = car
              form.CarNumber = this.carOptions.find(
                item => item.Key === car
              ).Value
            }
            resolve({
              valid: true,
              data: form
            })
          } else {
            reject('error submit!!')
          }
        })
      })
    },
    resetForm() {
      this.$refs.form.resetFields()
    },
    fetchOptions() {
      getTerminalDropdow({
        projectId: this.projectId
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          data.SensorList.forEach(item => {
            item.TagType = 1
          })
          data.TerminalList.forEach(item => {
            item.TagType = 2
          })
          this.terminalOptions = [
            {
              label: '传感器',
              options: data.SensorList
            },
            {
              label: '记录仪',
              options: data.TerminalList
            }
          ]
        }
      })
      getProjectForCarList({
        projectId: this.projectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.carOptions = res.data.Data
          } else {
            this.carOptions = []
          }
        })
        .catch(err => {
          console.error(err)
        })
      getTempRangeWeb({
        projectId: this.projectId,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tempRangOptions = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
