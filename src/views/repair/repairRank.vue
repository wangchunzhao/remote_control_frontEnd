<template>
  <el-row :gutter="20" class="repair">
    <el-col :span="24">
      <div class="left">
        <el-button
          size="small"
          :class="{ 'el-button--primary changeBtn': wrap, btncolor: !wrap }"
          @click="handleEfficiency"
        >
          效率排名
        </el-button>
        <el-button
          size="small"
          :class="{ 'el-button--primary changeBtn': !wrap, btncolor: wrap }"
          @click="handleEvaluate"
        >
          满意度排名
        </el-button>
      </div>
      <div class="right">
        <el-col v-show="wrap" :span="24" class="commonWrapper">
          <div class="commonBox insideBox clearfix bg-fff">
            <el-col :span="24" class="commonHeader">
              <c-svg name="table" class-name="commonImg" />
              <span class="commonTitle">受理效率排名</span>
              <div class="groupBtns">
                <el-button
                  size="small"
                  :class="{ 'el-button--primary': efficiencytime == 1 }"
                  plain
                  @click="handletype(1)"
                >
                  本年
                </el-button>
                <el-button
                  size="small"
                  :class="{ 'el-button--primary': efficiencytime == 2 }"
                  plain
                  @click="handletype(2)"
                >
                  本月
                </el-button>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="clearfix" style="padding:15px 5px;">
                <el-table :data="data" highlight-current-row>
                  <el-table-column type="index" label="序号" width="80" />
                  <el-table-column
                    prop="nickname"
                    label="承修方"
                    min-width="200"
                  />
                  <el-table-column
                    prop="repair_count"
                    label="维修次数（次）"
                    min-width="150"
                    align="right"
                  />
                  <el-table-column
                    prop="ResponseTime"
                    label="平均响应时间（分）"
                    min-width="180"
                    align="right"
                  />
                  <el-table-column
                    prop="AcceptanceTime"
                    label="平均受理时间（分）"
                    min-width="180"
                    align="right"
                  />
                  <el-table-column
                    prop="CompleteTime"
                    label="完成平均用时（时）"
                    min-width="180"
                    align="right"
                  />
                </el-table>
              </div>
            </el-col>
          </div>
        </el-col>
        <el-col v-show="!wrap" :span="24" class="commonWrapper">
          <div class="commonBox insideBox clearfix bg-fff">
            <el-col :span="24" class="commonHeader">
              <c-svg name="table" class-name="commonImg" />
              <span class="commonTitle">满意度排名</span>
              <div class="groupBtns">
                <el-button
                  size="small"
                  :class="{ 'el-button--primary': evaluatetime == 1 }"
                  plain
                  @click="handletime(1)"
                >
                  本年
                </el-button>
                <el-button
                  size="small"
                  :class="{ 'el-button--primary': evaluatetime == 2 }"
                  plain
                  @click="handletime(2)"
                >
                  本月
                </el-button>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="clearfix" style="padding:15px 5px;">
                <el-table :data="list" highlight-current-row>
                  <el-table-column type="index" label="序号" width="80" />
                  <el-table-column
                    prop="nickname"
                    label="承修方"
                    min-width="220"
                  />
                  <el-table-column
                    prop="Evaluate_count"
                    label="评价次数"
                    min-width="200"
                    align="right"
                  />
                  <el-table-column
                    prop="SumScore"
                    label="总分值"
                    min-width="200"
                    align="right"
                  />
                  <el-table-column
                    prop="AvgScore"
                    label="平均分"
                    min-width="200"
                    align="right"
                  />
                </el-table>
              </div>
            </el-col>
          </div>
        </el-col>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import {
  getRepairStatisticalTimeList,
  getRepairStatisticalEvaluateList
} from '@/api/repair'
export default {
  data() {
    return {
      data: [],
      list: [],
      efficiencytime: 1,
      evaluatetime: 1,
      wrap: true
    }
  },
  mounted() {
    this.GetRepair_Statistical_TimeList()
    this.GetRepair_Statistical_EvaluateList()
  },
  methods: {
    handleEfficiency() {
      this.wrap = true
    },
    handleEvaluate() {
      this.wrap = false
    },
    handletype(val) {
      this.efficiencytime = val
      this.GetRepair_Statistical_TimeList()
    },
    handletime(val) {
      this.evaluatetime = val
      this.GetRepair_Statistical_EvaluateList()
    },
    GetRepair_Statistical_TimeList() {
      getRepairStatisticalTimeList(this.efficiencytime)
        .then(res => {
          this.data = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    GetRepair_Statistical_EvaluateList() {
      getRepairStatisticalEvaluateList(this.evaluatetime)
        .then(res => {
          this.list = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
<style lang="scss">
.groupBtns {
  margin-top: -4px;
  float: right;
}
@import 'src/assets/style/repair.scss';
</style>
