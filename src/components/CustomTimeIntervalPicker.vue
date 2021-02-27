<template>
  <div
    class="custom-timeInterval-pikcer-KJDSHFJ"
    :class="direction === 'row' ? 'row' : ''"
  >
    <el-radio-group
      v-model="type"
      @change="typeChange"
      size="mini"
      border
      :class="direction === 'row' ? 'radio-group-box' : ''"
    >
      <el-radio-button label="default">
        已设置时段
      </el-radio-button>
      <el-radio-button label="custom">
        自定义时段
      </el-radio-button>
    </el-radio-group>
    <el-select
      v-show="type === 'default'"
      v-model="timeInterval"
      placeholder=""
      size="mini"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0',
        width: pickerWidth ? pickerWidth + 'px' : '100%'
      }"
    >
      <el-option
        v-for="item in typeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <div
      v-show="type === 'custom'"
      style="display: flex;align-items: center"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0'
      }"
    >
      <el-time-select
        placeholder="起始时间"
        v-model="dateRange[0]"
        :picker-options="{
          start: '00:00',
          step: '01:00',
          end: '23:00'
        }"
        size="mini"
        :style="{
          width: pickerWidth ? pickerWidth + 'px' : '100%'
        }"
      >
      </el-time-select>
      <div style="margin: 0 10px">-</div>
      <el-time-select
        placeholder="结束时间"
        v-model="dateRange[1]"
        :picker-options="{
          start: '00:00',
          step: '01:00',
          end: '23:00'
        }"
        size="mini"
        :style="{
          width: pickerWidth ? pickerWidth + 'px' : '100%'
        }"
      >
      </el-time-select>
    </div>
  </div>
</template>

<script>
import { getTimeInterval } from '@/api/timeInterval'

export default {
  name: 'CustomDatePicker',
  props: {
    direction: {
      type: String,
      default: function() {
        return 'column'
      }
    },
    pickerWidth: {
      type: Number,
      default: function() {
        return null
      }
    },
    projectId: {
      type: Number,
      default: function() {
        return -1
      }
    },
    companyId: {
      type: Number,
      default: function() {
        return -1
      }
    }
  },
  data() {
    return {
      type: 'default',
      timeInterval: '', //已设置时段值
      startTime: '',
      endTime: '',
      dateRange: [], //自定义时段
      typeOptions: [], //已设置时段列表
      defaultChooseValue: false //切换后是否自动选择值
    }
  },
  watch: {
    timeInterval(val) {
      if (val) {
        this.valueOutPut(val)
      }
    },
    dateRange(val) {
      if (val && val.length > 1 && val[0] && val[1]) {
        this.valueOutPut(val)
      }
    }
  },
  methods: {
    /**
     * 组件初始化、重置
     * @param type {String} 默认选择类型
     * @param defaultChooseValue {Boolean} 是否默认选择
     * **/
    init(type = 'default', defaultChooseValue = false) {
      getTimeInterval({
        projectId: this.projectId,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            if (res.data.Data) {
              let typeOptions = []
              if (res.data.Data.Classify) {
                for (let i = 0; i < res.data.Data.Classify; i++) {
                  typeOptions.push({
                    label: 'T' + (i + 1),
                    value: 'T' + (i + 1)
                  })
                }
                typeOptions.unshift({
                  label: '全部',
                  value: 'all'
                })
              } else {
                typeOptions = []
              }
              this.typeOptions = typeOptions
            } else {
              this.typeOptions = []
            }
          } else {
            this.$message.error('获取时段失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取时段失败')
        })
        .finally(() => {
          this.defaultChooseValue = defaultChooseValue
          this.type = type
          this.dateRange = []
          if (defaultChooseValue && this.typeOptions.length) {
            this.timeInterval = 'all'
          }
        })
    },
    // 值变化
    valueOutPut(val) {
      if (this.type === 'default') {
        let typeOptions = this.typeOptions.length
          ? this.typeOptions.slice(1, this.typeOptions.length)
          : []
        let timeIntervalList = typeOptions.map(item => item.value)
        this.$emit('chooseChange', {
          type: this.type,
          timeInterval: val,
          timeIntervalList: timeIntervalList,
          dateRange: []
        })
      } else {
        this.$emit('chooseChange', {
          type: this.type,
          timeInterval: '',
          timeIntervalList: [],
          dateRange: val
        })
      }
    },
    // 类型变化
    typeChange() {
      this.timeInterval =
        this.defaultChooseValue && this.typeOptions.length
          ? this.timeInterval
          : ''
      this.dateRange = []

      this.$emit('typeChange', this.type)
      if (this.type === 'custom') {
        this.$emit('chooseChange', {
          type: this.type,
          timeInterval: '',
          timeIntervalList: [],
          dateRange: []
        })
      } else if (this.typeOptions.length) {
        let typeOptions = this.typeOptions.slice(1, this.typeOptions.length)
        this.$emit('chooseChange', {
          type: this.type,
          timeInterval: this.timeInterval,
          timeIntervalList: typeOptions.map(item => item.value),
          dateRange: []
        })
      } else {
        this.$emit('chooseChange', {
          type: this.type,
          timeInterval: '',
          timeIntervalList: [],
          dateRange: []
        })
      }
    }
  }
}
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
}
.radio-group-box {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-right: 10px;
}
</style>
<style lang="scss">
.custom-timeInterval-pikcer-KJDSHFJ {
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    background-color: #fff;
    color: #1890ff;
  }
  .el-radio-button {
    flex: 1;
  }
  .el-radio-button__inner {
    display: block;
  }
}
</style>
