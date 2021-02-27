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
    energyStruct() {
      return this.$store.state.energy.energyStruct
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  data() {
    return {
      energyBranchType: 'default', // 用能支路类型
      energyBranchId: '', // 支路分组id
      energyBranchIdList: '', // 自定义列表
      timeType: 'day', // 时间类型
      time: '', // 日期
      dateRange: [], //日期范围
      timeIntervalType: 'default', // 时段类型
      timeInterval: '', // 已设置时段值
      timeIntervalDateRange: [] // 自定义时段值
    }
  },
  mounted() {
    this.$refs.customEnegyBranchPicker.init(this.energyBranchType, true)
    this.$refs.customDatePicker.init(this.timeType, true)
    this.$refs.customTimeIntervalPicker.init(this.timeIntervalType, true)
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
      // console.log(val, '时间类型变化')
      this.timeType = val
    },
    // 更换时间
    timeChange(val) {
      // console.log(val, '时间值变化')
      this.timeType = val.type
      this.time = val.time
      this.dateRange = val.dateRange
    },
    // 更换时段类型
    timeIntervalTypeChange(val) {
      console.log(val, '时段类型变化')
      this.timeIntervalType = val
    },
    // 更换时段
    timeIntervalChange(val) {
      console.log(val, '时段值变化')
      this.timeIntervalType = val.type
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
