<template>
  <div class="content-box energy_manage-analyze">
    <div class="energy_manage-panel panel-control">
      <el-form style="display: flex;align-items: center" label-width="100px">
        <el-row>
          <el-col :span="6">
            <el-form-item
              label="用能支路:"
              style="display: flex;align-items: center"
            >
              <CustomEnegyBranchPicker
                :direction="'row'"
                @typeChange="enegyBranchTypeChange"
                @chooseChange="enegyBranchChange"
                ref="customEnegyBranchPicker"
              >
              </CustomEnegyBranchPicker>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item
              label="日期范围:"
              style="display: flex;align-items: center;margin-left: 15px"
            >
              <CustomDatePicker
                :typeArr="['day', 'week', 'month', 'custom']"
                :direction="'row'"
                @timeChange="timeChange"
                @typeChange="timeTypeChange"
                ref="customDatePicker"
              ></CustomDatePicker>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item
              label="时段:"
              style="display: flex;align-items: center;margin-left: 15px"
            >
              <CustomTimeIntervalPicker
                :direction="'row'"
                :projectId="projectId"
                @typeChange="timeIntervalTypeChange"
                @chooseChange="timeIntervalChange"
                ref="customTimeIntervalPicker"
              ></CustomTimeIntervalPicker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <Panel1 />
    <Panel2 />
    <Panel3 />
    <Panel5 />
    <Panel4 />
  </div>
</template>

<script>
import Panel1 from './component/Panel1'
import Panel2 from './component/Panel2'
import Panel3 from './component/Panel3'
import Panel4 from './component/Panel4'
import Panel5 from './component/Panel5'
import CustomEnegyBranchPicker from '@/components/CustomEnegyBranchPicker'
import CustomDatePicker from '@/components/CustomDatePicker'
import CustomTimeIntervalPicker from '@/components/CustomTimeIntervalPicker'

export default {
  props: {
    activeName: String
  },
  components: {
    Panel1,
    Panel2,
    Panel3,
    Panel4,
    Panel5,
    CustomEnegyBranchPicker,
    CustomDatePicker,
    CustomTimeIntervalPicker
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  data() {
    return {
      energyBranchType: 'default', // 用能支路类型
      energyBranchId: '', // 支路分组id
      energyBranchIdList: '', // 自定义列表

      form: {
        DateType: undefined,
        TimeQuantum: {
          StartDate: undefined,
          EndDate: undefined
        },
        TimeIntervalId: undefined,
        ClassifyList: []
      }
    }
  },
  mounted() {
    this.$refs.customEnegyBranchPicker.init('default', true)
    this.$refs.customDatePicker.init('day', true)
    this.$refs.customTimeIntervalPicker.init('default', true)
  },
  methods: {
    // 更换支路类型
    enegyBranchTypeChange(val) {
      console.log(val, '类型变化')
      this.enegyBranchType = val
    },
    // 更换支路
    enegyBranchChange(val) {
      console.log(val, '值变化')
      this.enegyBranchType = val.type
    },
    // 更换时间类型
    timeTypeChange(val) {
      let DateType = ''
      switch (val) {
        case 'day':
          DateType = 'Day'
          break
        case 'week':
          DateType = 'Week'
          break
        case 'month':
          DateType = 'Month'
          break
        case 'year':
          DateType = 'Year'
          break
        case 'custom':
          DateType = 'Custom'
          break
        default:
          DateType = 'Day'
          break
      }
      this.form.DateType = DateType
    },
    // 更换时间
    timeChange(val) {
      if (val.type === 'custom' && (!val.dateRange || !val.dateRange.length)) {
        return
      }
      let DateType = ''
      switch (val.type) {
        case 'day':
          DateType = 'Day'
          break
        case 'week':
          DateType = 'Week'
          break
        case 'month':
          DateType = 'Month'
          break
        case 'year':
          DateType = 'Year'
          break
        case 'custom':
          DateType = 'Custom'
          break
        default:
          DateType = 'Day'
          break
      }
      this.form.DateType = DateType
      this.form.TimeQuantum.StartDate =
        val.dateRange.length > 1 ? val.dateRange[0] : ''
      this.form.TimeQuantum.EndDate =
        val.dateRange.length > 1 ? val.dateRange[1] : ''
    },
    // 更换时段类型
    timeIntervalTypeChange(val) {
      if (val !== 'default') {
        this.form.TimeIntervalId = undefined
        this.form.ClassifyList = []
      }
      // this.timeIntervalType = val
    },
    // 更换时段
    timeIntervalChange(val) {
      if (val.type === 'custom' && (!val.dateRange || !val.dateRange.length)) {
        return
      }
      let ClassifyList = []
      if (val.type === 'default') {
        ClassifyList =
          val.timeInterval === 'all' ? undefined : [val.timeInterval]
      } else if (val.dateRange && val.dateRange.length) {
        ClassifyList = [val.dateRange[0], val.dateRange[1]]
      } else {
        ClassifyList = undefined
      }
      this.form.TimeIntervalId = val.timeIntervalId
      this.form.ClassifyList = ClassifyList
    }
  }
}
</script>

<style lang="scss">
.energy_manage-analyze {
  padding: 0 24px;
  background-color: transparent;
  .energy_manage-panel {
    margin-top: 24px;
    background-color: #fff;
    border-radius: 4px;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0 24px;
    .title {
      font-size: 15px;
      font-weight: 500;
    }
  }
  .table-wrap {
    position: relative;
    .table-download-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      .icon {
        font-size: 16px;
      }
    }
  }
  .panel-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    .el-form-item {
      margin: 0;
    }
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
</style>
