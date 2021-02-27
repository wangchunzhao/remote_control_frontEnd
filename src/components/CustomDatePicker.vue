<template>
  <div
    class="custom-date-pikcer-KJDSHFJ"
    :class="direction === 'row' ? 'row' : ''"
  >
    <el-radio-group
      v-model="type"
      @change="scopeChange"
      size="mini"
      border
      :class="direction === 'row' ? 'radio-group-box' : ''"
    >
      <el-radio-button label="day" v-if="typeArr.indexOf('day') >= 0">
        日
      </el-radio-button>
      <el-radio-button label="week" v-if="typeArr.indexOf('week') >= 0">
        周
      </el-radio-button>
      <el-radio-button label="month" v-if="typeArr.indexOf('month') >= 0">
        月
      </el-radio-button>
      <el-radio-button label="year" v-if="typeArr.indexOf('year') >= 0">
        年
      </el-radio-button>
      <el-radio-button label="custom" v-if="typeArr.indexOf('custom') >= 0">
        自定义
      </el-radio-button>
    </el-radio-group>
    <el-date-picker
      v-show="type === 'day'"
      v-model="time"
      type="date"
      placeholder=""
      :clearable="false"
      :picker-options="{
        disabledDate(val) {
          return val.getTime() > Date.now() - 3600000 * 24
        }
      }"
      size="mini"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0',
        width: pickerWidth ? pickerWidth + 'px' : '100%'
      }"
    />
    <el-date-picker
      v-show="type === 'week'"
      v-model="time"
      type="week"
      format="yyyy 第 WW 周"
      placeholder=""
      :clearable="false"
      :picker-options="{
        firstDayOfWeek: 1,
        disabledDate(val) {
          return val.getTime() > Date.now() - 3600 * 1000 * 24 * 7
        }
      }"
      size="mini"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0',
        width: pickerWidth ? pickerWidth + 'px' : '100%'
      }"
    />
    <el-date-picker
      v-show="type === 'month'"
      v-model="time"
      type="month"
      placeholder=""
      :clearable="false"
      :picker-options="{
        firstDayOfWeek: 1,
        disabledDate(val) {
          return (
            val >
            dayjs()
              .subtract(1, 'month')
              .startOf('month')
          )
        }
      }"
      size="mini"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0',
        width: pickerWidth ? pickerWidth + 'px' : '100%'
      }"
    />
    <el-date-picker
      v-show="type === 'year'"
      v-model="time"
      type="year"
      placeholder=""
      :clearable="false"
      :picker-options="{
        firstDayOfWeek: 1,
        disabledDate(val) {
          return val > dayjs().startOf('year')
        }
      }"
      size="mini"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0',
        width: pickerWidth ? pickerWidth + 'px' : '100%'
      }"
    />
    <el-date-picker
      v-show="type === 'custom'"
      v-model="dateRange"
      type="daterange"
      range-separator="至"
      startTime-placeholder="开始日期"
      endTime-placeholder="结束日期"
      :picker-options="{
        disabledDate(val) {
          return val.getTime() > Date.now() - 3600000 * 24
        }
      }"
      size="mini"
      :style="{
        'margin-top': direction === 'column' ? '5px' : '0',
        width: pickerWidth ? pickerWidth * 1.6 + 'px' : '100%'
      }"
    >
    </el-date-picker>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'CustomDatePicker',
  props: {
    typeArr: {
      type: Array,
      default: function() {
        return ['day', 'week', 'month', 'year', 'custom']
      }
    },
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
    }
  },
  data() {
    return {
      type: 'day',
      time: '', //时间
      dateRange: [], //自定义时间
      defaultTime: false, //是否自动选择时间
      dayjs
    }
  },
  watch: {
    //日、周、
    time(val) {
      this.valueOutPut(val)
    },
    dateRange(val) {
      if (val.length > 1) {
        this.valueOutPut(val)
      }
    }
  },
  methods: {
    /**
     * 组件初始化、重置
     * @param type {String} 默认选择类型
     * @param defaultTime {Boolean} 是否默认
     * **/
    init(type = 'day', defaultTime = false) {
      let time = ''
      time = ''
      this.defaultTime = defaultTime
      if (defaultTime) {
        switch (type) {
          case 'day':
            time = dayjs()
              .subtract(1, 'day')
              .format('YYYY-MM-DD')
            break
          case 'week':
            time = dayjs()
              .subtract(1, 'week')
              .format('YYYY-MM-DD')
            break
          case 'month':
            time = dayjs()
              .subtract(1, 'month')
              .format('YYYY-MM-DD')
            break
          case 'year':
            time = dayjs()
              .subtract(1, 'year')
              .format('YYYY-MM-DD')
            break
          default:
            time = ''
            break
        }
      }
      this.time = time
      this.type = type
      this.dateRange = []
    },
    valueOutPut(val) {
      let startTime = ''
      let endTime = ''
      if (val) {
        //自定义时间
        if (
          Object.prototype.toString.call(val) === '[object Array]' &&
          val.length > 1
        ) {
          startTime = dayjs(val[0]).format('YYYY-MM-DD')
          endTime = dayjs(val[1])
            .add(1, 'day')
            .format('YYYY-MM-DD')
        } else {
          //其他类型时间
          switch (this.type) {
            case 'day':
              startTime = dayjs(val).format('YYYY-MM-DD')
              endTime = dayjs(val)
                .add(1, 'day')
                .format('YYYY-MM-DD')
              break
            case 'week':
              startTime = dayjs(val)
                .startOf('week')
                .format('YYYY-MM-DD')
              endTime = dayjs(val)
                .endOf('week')
                .add(1, 'millisecond')
                .format('YYYY-MM-DD')
              break
            case 'month':
              startTime = dayjs(val)
                .startOf('month')
                .format('YYYY-MM-DD')
              endTime = dayjs(val)
                .endOf('month')
                .add(1, 'millisecond')
                .format('YYYY-MM-DD')
              break
            case 'year':
              startTime = dayjs(val)
                .startOf('year')
                .format('YYYY-MM-DD')
              endTime = dayjs(val)
                .endOf('year')
                .add(1, 'millisecond')
                .format('YYYY-MM-DD')
              break
            default:
              startTime = ''
              endTime = ''
              break
          }
        }
      } else {
        startTime = ''
        endTime = ''
      }
      this.$emit('timeChange', {
        type: this.type,
        time:
          Object.prototype.toString.call(val) === '[object Array]'
            ? undefined
            : dayjs(val).format('YYYY-MM-DD'),
        dateRange: [startTime, endTime]
      })
    },
    // 时间类型变化
    scopeChange() {
      if (!this.defaultTime) {
        this.time = ''
      }
      this.dateRange = []
      this.$emit('typeChange', this.type)
      if (this.type === 'custom') {
        this.$emit('timeChange', {
          type: this.type,
          time: '',
          dateRange: []
        })
      } else {
        this.valueOutPut(this.time)
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
.custom-date-pikcer-KJDSHFJ {
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
