<template>
  <el-dialog
    width="680px"
    title="工单详情"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div v-loading="loading" class="repair-detail-dialog-box">
      <div class="part-title">报警信息</div>
      <el-form :model="form" ref="form" label-width="100px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目">
              {{ form.pname }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号">
              {{ form.assets_code }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称">
              {{ form.mName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障现象">
              {{ form.FaultDescribe }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注说明">
              {{ form.Remarks }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="故障图片">
              <el-row>
                <el-col
                  :span="4"
                  v-for="(item, index) in FaultPhotoList"
                  :key="index"
                >
                  <img
                    :src="item"
                    style="display:block;width: 100%;height: auto"
                    alt=""
                  />
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="维保团队">
              {{ form.MaintenanceUnitName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维保人">
              {{ form.RepairUserName }}
            </el-form-item>
          </el-col>
        </el-row>
        <div class="dialog-content-line"></div>
        <div class="part-title">跟进进度</div>
        <div class="detail-timeline-box">
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in step"
              :key="index"
              :icon="item.Status === 7 ? 'el-icon-check' : ''"
              :color="item.Status === 7 ? '#3388FF' : ''"
              :type="item.Status === 7 ? 'large' : 'normal'"
            >
              <div class="time-line-content">
                <div
                  class="time-line-top"
                  :class="item.Status === 7 ? 'time-line-top-active' : ''"
                >
                  <div>{{ item.Action }}</div>
                  <div>{{ item.CreateTime }}</div>
                </div>
                <div class="time-line-bottom">{{ item.Description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { getQueryRepairAcitve, getRepairSchedule } from '@/api/newRepairActive'

export default {
  data() {
    return {
      loading: false,
      dialogVisible: false,
      form: {},
      repairOrder: '',
      FaultPhotoList: [], //图片列表
      step: []
    }
  },
  methods: {
    openDialog(repairOrder) {
      this.repairOrder = repairOrder
      this.loading = true
      getQueryRepairAcitve({
        repairOrder
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.form = res.data.Data
            if (this.form.FaultPhoto) {
              let FaultPhoto = this.form.FaultPhoto.split(',')
              for (let i = 0; i < FaultPhoto.length; i++) {
                if (FaultPhoto[i].indexOf('http') === -1) {
                  FaultPhoto[i] = global.BASE_URI + FaultPhoto[i]
                }
              }
              this.FaultPhotoList = FaultPhoto
              console.log(this.FaultPhotoList, 'this.FaultPhotoList')
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
      getRepairSchedule({
        repairOrder
      })
        .then(res => {
          this.step = res.data.Data.New_Repair_ScheduleList
        })
        .catch(err => {
          console.error(err)
        })
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
.repair-detail-dialog-box {
  .el-timeline-item__node--large {
    left: -5px;
    width: 20px;
    height: 20px;
  }
}
</style>
<style scoped lang="scss">
.part-title {
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 20px;
  margin: 0 0 16px 0;
}
.dialog-content-line {
  width: 100%;
  height: 1px;
  background: #e9e9e9;
  margin: 0 0 16px 0;
}
.time-line-content {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
  line-height: 22px;
  width: 350px;
}
.time-line-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
.time-line-top-active {
  color: #000;
}
.time-line-bottom {
  font-size: 12px;
  line-height: 16px;
}
.detail-timeline-box {
  max-height: 300px;
  overflow: auto;
}
</style>
