<template>
  <span class="datepickergroup">
    <div class="wrap">
      <el-radio-group :size="size" v-model="type" @change="handleTypeChange">
        <el-radio-button v-for="item in layout" :key="item" :label="item">{{
          textMap[item]
        }}</el-radio-button>
      </el-radio-group>
      <slot name="datepickerLabel"></slot>
      <el-date-picker
        v-for="item in layout"
        style="max-width: 205px;"
        :key="item"
        :size="size"
        @change="handleTimeChange"
        :type="item"
        v-show="type === item"
        :picker-options="{
          firstDayOfWeek: 1
        }"
        :format="'week' === item ? 'yyyy 第 WW 周' : undefined"
        :value-format="'daterange' === item ? undefined : 'yyyy-MM-dd'"
        v-model="time"
        placeholder="请选择"
      >
      </el-date-picker>
    </div>
  </span>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
export default {
  props: {
    size: {
      type: String,
      default: function() {
        return 'mini'
      }
    },
    fireImmediate: {
      type: Boolean,
      default: true
    },
    valueFormat: {
      type: String,
      default: 'YYYY-MM-DD HH:mm'
    },
    initTime: {
      type: [String, Array]
    },
    layout: {
      type: Array,
      default: function() {
        return ['date', 'week', 'month', 'year', 'daterange']
      }
    }
  },
  data() {
    return {
      type: '',
      time: '',
      textMap: {
        date: '日',
        week: '周',
        month: '月',
        year: '年',
        daterange: '自定义'
      }
    }
  },
  watch: {
    initTime: {
      handler: function(val) {
        this.time = val
      },
      immediate: true
    },
    // time: {
    //   handler: function(t) {
    //     console.log(11111111111, t)
    //     if (!t && this.type) return
    //     let startDate = '',
    //       endDate = ''
    //     switch (this.type) {
    //       case 'date':
    //         startDate = dayjs(t)
    //           .startOf('day')
    //           .format(this.valueFormat)
    //         endDate = dayjs(t)
    //           .endOf('day')
    //           .add(1, 's')
    //           .format(this.valueFormat)
    //         break
    //       case 'week':
    //         startDate = dayjs(t)
    //           .startOf('week')
    //           .format(this.valueFormat)
    //         endDate = dayjs(t)
    //           .endOf('week')
    //           .add(1, 's')
    //           .format(this.valueFormat)
    //         break
    //       case 'month':
    //         startDate = dayjs(t)
    //           .startOf('month')
    //           .format(this.valueFormat)
    //         endDate = dayjs(t)
    //           .endOf('month')
    //           .add(1, 's')
    //           .format(this.valueFormat)
    //         break
    //       case 'year':
    //         startDate = dayjs(t)
    //           .startOf('year')
    //           .format(this.valueFormat)
    //         endDate = dayjs(t)
    //           .endOf('year')
    //           .add(1, 's')
    //           .format(this.valueFormat)
    //         break
    //       case 'daterange':
    //         startDate = dayjs(t[0]).format(this.valueFormat)
    //         endDate = dayjs(t[1]).format(this.valueFormat)
    //         break
    //       default:
    //         break
    //     }
    //     this.$emit('change', {
    //       startDate,
    //       endDate,
    //       dateType: this.type
    //     })
    //   },
    //   immediate: true
    // },
    type: function(t) {
      if (!t) return
    }
  },
  mounted() {
    this.type = this.layout[0]
    if (this.fireImmediate) {
      const { startDate, endDate } = this.timeFactory(this.time)
      this.$emit('change', {
        startDate,
        endDate,
        dateType: this.type
      })
    }
  },
  methods: {
    handleTimeChange(val) {
      const { startDate, endDate } = this.timeFactory(val)
      this.$emit('change', {
        startDate,
        endDate,
        dateType: this.type
      })
    },
    handleTypeChange(t) {
      this.$emit('typeChange', t)
      if ('daterange' !== t && !Array.isArray(this.time)) {
        const { startDate, endDate } = this.timeFactory(this.time)
        this.$emit('change', {
          startDate,
          endDate,
          dateType: this.type
        })
      }
    },
    timeFactory(time) {
      let startDate = ''
      let endDate = ''
      switch (this.type) {
        case 'date':
          startDate = dayjs(time)
            .startOf('day')
            .format(this.valueFormat)
          endDate = dayjs(time)
            .endOf('day')
            .add(1, 's')
            .format(this.valueFormat)
          break
        case 'week':
          startDate = dayjs(time)
            .startOf('week')
            .format(this.valueFormat)
          endDate = dayjs(time)
            .endOf('week')
            .add(1, 's')
            .format(this.valueFormat)
          break
        case 'month':
          startDate = dayjs(time)
            .startOf('month')
            .format(this.valueFormat)
          endDate = dayjs(time)
            .endOf('month')
            .add(1, 's')
            .format(this.valueFormat)
          break
        case 'year':
          startDate = dayjs(time)
            .startOf('year')
            .format(this.valueFormat)
          endDate = dayjs(time)
            .endOf('year')
            .add(1, 's')
            .format(this.valueFormat)
          break
        case 'daterange':
          startDate = dayjs(time[0]).format(this.valueFormat)
          endDate = dayjs(time[1]).format(this.valueFormat)
          break
        default:
          break
      }
      return { startDate, endDate }
    }
  }
}
</script>

<style lang="scss" scoped>
.datepickergroup {
  display: inline-block;
  .el-radio-group {
    margin-right: 10px;
  }
  .wrap {
    display: flex;
    align-items: center;
  }
}
</style>
