<template>
  <div class="dashboardChicken-box-OOIJKDF0943 box-style">
    <div class="top-wrap">
      <el-row :gutter="20" type="flex" style="height: 100%;">
        <el-col
          :span="12"
          @click.native="() => handleOpenMidicineDialog('drinkMedicine')"
          style="height: 100%;border-right: 1px solid #E8E8E8;overflow: hidden;cursor: pointer;"
        >
          <div class="title">今日饮药</div>
          <el-tooltip class="item" effect="dark" placement="top">
            <div
              slot="content"
              v-html="drinkMedicineText"
              style="width: 200px;line-height: 20px;white-space: pre-line;"
            ></div>
            <div
              style="line-height: 20px;white-space: div-line;"
              v-html="drinkMedicineText"
            ></div>
          </el-tooltip>
        </el-col>
        <el-col
          :span="12"
          @click.native="() => handleOpenMidicineDialog('immune')"
          style="position: relative;height: 100%;overflow: hidden;cursor: pointer;"
        >
          <div class="title" style="padding-left: 10px;">今日免疫</div>
          <el-tooltip class="item" effect="dark" placement="top">
            <div
              slot="content"
              v-html="immuneText"
              style="width: 200px;line-height: 20px;"
            ></div>
            <div
              style="line-height: 20px;white-space: div-line;"
              v-html="immuneText"
            ></div>
          </el-tooltip>
        </el-col>
      </el-row>
    </div>
    <div class="bottom-wrap">
      <div class="title">今日饮水</div>
      <el-row :gutter="20" type="flex">
        <el-col :span="12">
          <span style="font-size: 24px;margin-right: 5px;" class="bold-text">
            {{
              typeof drinkData.TodayValue === 'number'
                ? drinkData.TodayValue
                : '-'
            }}
          </span>
          <span class="light-text">t</span>
        </el-col>
        <el-col :span="12" style="position: relative;">
          <span class="light-text">日环比</span>
          <span
            style="margin: 0 4px;"
            :class="[
              'bold-text',
              upOrFallFactory(drinkData.DayOnMonth) === 'up'
                ? 'red-text'
                : 'green-text'
            ]"
          >
            <i
              :class="[
                upOrFallFactory(drinkData.DayOnMonth) === 'up'
                  ? 'el-icon-caret-top'
                  : 'el-icon-caret-bottom'
              ]"
            ></i>
            {{
              typeof drinkData.DayOnMonth === 'number'
                ? drinkData.DayOnMonth
                : '-'
            }}%
          </span>
          <div style="position: absolute;top: -22px;">
            <span class="light-text">周环比</span>
            <span
              style="margin: 0 4px 0 0;"
              :class="[
                'bold-text',
                upOrFallFactory(drinkData.DayOnMonth) === 'up'
                  ? 'red-text'
                  : 'green-text'
              ]"
            >
              <i
                :class="[
                  upOrFallFactory(drinkData.WeekOnMonth) === 'up'
                    ? 'el-icon-caret-top'
                    : 'el-icon-caret-bottom'
                ]"
              ></i>
              {{
                typeof drinkData.WeekOnMonth === 'number'
                  ? drinkData.WeekOnMonth
                  : '-'
              }}%
            </span>
          </div>
        </el-col>
      </el-row>
    </div>
    <DialogMidicine
      :deviceId="deviceId"
      :projectId="projectId"
      ref="dialogMidicine"
    />
  </div>
</template>

<script>
import { getHenhouseStrPointData, getTodayHenhouse } from '@/api/breed'
import DialogMidicine from './DialogMedicine'
import dayjs from 'dayjs'
export default {
  components: {
    DialogMidicine
  },
  props: {
    projectId: Number,
    deviceId: Number
  },
  data() {
    return {
      drinkMedicineText: '',
      immuneText: '',
      drinkData: {}
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    handleOpenMidicineDialog(type) {
      this.$refs.dialogMidicine.openDialog(type)
    },
    fetchData() {
      this.drinkMedicineText = ''
      this.immuneText = ''
      getHenhouseStrPointData({
        projectId: this.projectId,
        mtid: this.deviceId,
        start: dayjs()
          .startOf('day')
          .format('YYYY-MM-DD HH:mm'),
        end: dayjs()
          .add(1, 'day')
          .format('YYYY-MM-DD'),
        pointType: 'DrinkMedicine'
      }).then(res => {
        if (res.data.Code === 200) {
          if (res.data.Data && res.data.Data[0]) {
            this.drinkMedicineText = res.data.Data[0].Value.replace(
              /\\n/g,
              '<br />'
            )
          }
        }
      })
      getHenhouseStrPointData({
        projectId: this.projectId,
        mtid: this.deviceId,
        start: dayjs()
          .startOf('day')
          .format('YYYY-MM-DD HH:mm'),
        end: dayjs()
          .add(1, 'day')
          .format('YYYY-MM-DD'),
        pointType: 'Immune'
      }).then(res => {
        if (res.data.Code === 200) {
          if (res.data.Data && res.data.Data[0]) {
            this.immuneText = res.data.Data[0].Value.replace(/\\n/g, '<br />')
          }
        }
      })
      getTodayHenhouse({
        projectId: this.projectId,
        mtid: this.deviceId,
        queryPoint: '今日饮水'
      }).then(res => {
        if (res.data.Code === 200) {
          this.drinkData = res.data.Data
        }
      })
    },
    upOrFallFactory(val) {
      if (typeof val === 'number') {
        if (val >= 0) {
          return 'up'
        } else {
          return 'fall'
        }
      } else {
        return 'up'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboardChicken-box-OOIJKDF0943 {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  .top-wrap {
    flex: 1;
    height: 0;
    padding-bottom: 30px;
  }
  .bottom-wrap {
    flex: 0 0 53px;
  }
  .title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 10px;
  }
  .bold-text {
    font-weight: 500;
  }
  .light-text {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
  }
  .el-row--flex {
    align-items: center;
  }
  .red-text {
    color: #f5222d;
  }
  .green-text {
    color: #52c41a;
  }
  .chart-wrap {
    margin-top: 25px;
  }
}
</style>
