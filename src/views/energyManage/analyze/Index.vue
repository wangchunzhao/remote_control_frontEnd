<template>
  <div class="content-box energy_manage-analyze">
    <div class="energy_manage-panel panel-header">
      <el-form style="display: flex;align-items: center">
        <el-form-item label="用能支路" style="display: flex;align-items: center">
          <el-radio-group
            v-model="type"
            @change="typeChange"
            size="small"
            border
          >
            <el-radio-button label="defaultType">
              按分组
            </el-radio-button>
            <el-radio-button label="customType">
              自定义
            </el-radio-button>
          </el-radio-group>
          <el-select
            v-show="type === 'defaultType'"
            v-model="groupId"
            placeholder=""
            style="width:100px;margin-left: 5px"
            size="mini"
            clearable
            @change="groupChange"
          >
            <el-option
              v-for="item in groupList"
              :key="item.Id"
              :label="item.Name"
              :value="item.Id"
            />
          </el-select>
          <el-cascader
            v-show="type === 'customType'"
            :options="energyStruct"
            ref="cascader"
            clearable
            :filterable="true"
            size="mini"
            :props="cascaderProps"
            style="width:100px;margin-left: 5px"
            collapse-tags
            @visible-change="handleBranchVisible"
          >
            <template slot-scope="{ node, data }">
              <c-svg
                v-if="data.IsSubentry"
                style="color: #909399; margin-right: 5px"
                name="folder-open-fill"
              ></c-svg>
              <span
                :class="[
                  data.nodeType === 'projectNode'
                    ? 'project-node-SJHDF9823'
                    : ''
                ]"
                >{{ data.Name }}</span
              >
              <c-svg
                v-if="data.IsSummary"
                style="color: #909399; margin-left: 5px"
                name="zong"
              ></c-svg> </template
          ></el-cascader>
        </el-form-item>
        <el-form-item label="日期范围" style="display: flex;align-items: center;margin-left: 15px">
          <CustomDatePicker
            :typeArr="['day', 'week', 'month', 'custom']"
            @timeChange="timeChange"
            @typeChange="timeTypeChange"
            ref="customDatePicker"
          ></CustomDatePicker>
        </el-form-item>
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
import CustomDatePicker from '@/components/CustomDatePicker'
import { getSubentryTree } from '@/api/subentry'
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
    CustomDatePicker
  },
  computed: {
    energyStruct() {
      return this.$store.state.energy.energyStruct
    }
  },
  data() {
    return {
      type: 'defaultType', //支路类型
      groupId: '', // 支路分组ID
      groupList: [], // 支路分组列表
      timeType: 'day', // 默认选择的时间类型
      time: '', // 选择的日期
      startTime: '', // 日期开始时间
      endTime: '', // 日期结束时间

      cascaderProps: {
        multiple: true,
        children: 'ChildrenList',
        label: 'Name',
        value: 'SubentryId',
        lazy: false,
        lazyLoad: (node, resolve) => {
          if (node.level === 1) {
            getSubentryTree({
              companyId: this.$store.state.app.company.id,
              projectId: node.value,
              isGetModelTree: true
            })
              .then(res => {
                if (200 === res.data.Code) {
                  // 目前只要做了电量的
                  let data = res.data.Data
                  walk(data)
                  resolve(data)
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            resolve()
          }
        }
      }
    }
  },
  mounted() {
    this.$refs.customDatePicker.init(this.timeType, true)
  },
  methods: {
    // 更换支路类型
    typeChange(val) {
      switch (val) {
        case 'defaultType':
          break
        case 'customType':
          break
        default:
          break
      }
    },
    // 更换时间类型
    timeTypeChange(val) {
      this.timeType = val
    },
    // 更换时间
    timeChange(val) {
      this.time = val.time
      this.startTime = val.dateRange.length > 1 ? val.dateRange[0] : ''
      this.endTime = val.dateRange.length > 1 ? val.dateRange[1] : ''
    },
    // 更换分组支路
    groupChange() {},
    // 更换自定义支路
    handleBranchVisible(isVisible) {
      if (isVisible) return
      // 获取选中的设备节点
      let checkedNodes = this.$refs.cascader.getCheckedNodes()
      if (!checkedNodes.length) {
        return
      }
      if (
        !checkedNodes.every(v => {
          if (v.data.TopSubentryId === checkedNodes[0].data.TopSubentryId) {
            return true
          }
          return false
        })
      ) {
        this.$notify.info({
          title: '消息',
          duration: 10000,
          offset: 70,
          message:
            '不支持不同类型支路的对比，如：电量下的 A 支路不可以和燃气量下的 B 支路对比'
        })
        return
      }
      let nodes = checkedNodes.filter(item => !item.data.IsSubentry)
      if (nodes.length) {
        let branchIds = []
        nodes.forEach(item => {
          branchIds.push(item.data.ModelTreeId)
        })
        if (!branchIds.length) {
          this.$message('选中的节点下面没有设备，无法查询')
          this.isNoData = true
          this.tableData = []
          this.tableCols = []
          this.chart.clear()
          return
        }
        this.filterForm.branchIds = branchIds
        this.filterForm.startDate.length && this.fetchChartData()
      } else {
        this.filterForm.branchIds = []
      }
    }
  }
}
</script>

<style lang="scss">
.energy_manage-analyze {
  padding: 0;
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
}
</style>
