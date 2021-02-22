<template>
  <div>
    <el-row v-loading="cardLoading" type="flex" class="card-row-SDJKF9382">
      <el-col
        v-for="item in cardList"
        :key="item.mtid"
        :xs="24"
        :sm="8"
        :md="6"
        :lg="4"
        class="device-card"
      >
        <Component
          :is="
            SMALL_TYPE1.includes(smallTypeId)
              ? 'Card1'
              : BIG_TYPE1.includes(bigTypeId)
              ? 'Card3'
              : 'Card2'
          "
          :bigTypeId="bigTypeId"
          :smallTypeId="smallTypeId"
          @open-video-dialog="payload => $refs.videoPlayer.openDialog(payload)"
          @clickBindCamera="
            payload => $refs.bindCameraDialog.openDialog(payload)
          "
          @refresh="
            () => {
              fetchCardData({ showLoading: false })
            }
          "
          :data="item"
          @watchHistory="watchHistory"
        />
      </el-col>
    </el-row>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="pagination.page"
        :page-sizes="[12, 24, 48, 96]"
        :page-size="pagination.num"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <HistoryDialog
      ref="historyDialog"
      :point-ids="history.point"
      :device-id="history.deviceId"
    />
    <VideoPlayer ref="videoPlayer" />
    <BindCameraDialog @refresh="fetchCardData" ref="bindCameraDialog" />
  </div>
</template>

<script>
import { queryDeviceInfo, getCard } from '@/api/model'
import HistoryDialog from '@/components/HistoryDialog'
import VideoPlayer from '@/views/monitor/refrigerationSystem/VideoPlayer'
import Card1 from '@/views/monitor/component/Card1'
import Card2 from '@/views/monitor/component/Card2'
import Card3 from '@/views/monitor/component/Card3'
import BindCameraDialog from '@/views/monitor/refrigerationSystem/BindCameraDialog'
import { SMALL_TYPE1, BIG_TYPE1 } from '@/views/monitor/type'

export default {
  components: {
    VideoPlayer,
    HistoryDialog,
    Card1,
    Card2,
    Card3,
    BindCameraDialog
  },
  props: {
    bigTypeId: Number,
    smallTypeId: Number,
    form: Object
  },
  data() {
    return {
      cardLoading: false,
      cardList: [],
      pagination: {
        page: 1,
        num: 12,
        total: 0
      },
      history: {
        point: null,
        deviceId: 0
      },
      SMALL_TYPE1,
      BIG_TYPE1
    }
  },
  watch: {
    form: {
      handler: function() {
        this.pagination.currentPage = 1
        this.fetchCardData()
      },
      deep: true
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchCardData()
  },
  methods: {
    watchHistory(pointId, deviceId) {
      this.history.point = [pointId]
      this.history.deviceId = deviceId
      this.$refs.historyDialog.toggleDialog()
    },
    // 获取点位卡片数据
    fetchCardData() {
      this.cardLoading = true
      if (BIG_TYPE1.includes(this.bigTypeId)) {
        getCard(
          this.projectId,
          this.bigTypeId,
          this.smallTypeId,
          this.form.text,
          this.pagination.page,
          this.pagination.num
        )
          .then(res => {
            if (res.data.Code === 200) {
              const data = res.data.Data
              this.cardList = data.Data
              this.pagination.total = data.TotalCount
            } else {
              this.cardList = []
              this.pagination.total = 0
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.cardLoading = false
          })
      } else {
        // 冷冻冷藏下的冷库和冷柜
        queryDeviceInfo({
          ProjectId: this.projectId,
          BigTypeId: this.bigTypeId,
          SmallTypeId: this.smallTypeId,
          ModelTreeName: this.form.text,
          ModelTreeStatusList: this.form.state ? [this.form.state] : undefined,
          PageIndex: this.pagination.page,
          PageSize: this.pagination.num
        })
          .then(res => {
            if (res.data.Code === 200) {
              let data = res.data.Data.Data
              if (SMALL_TYPE1.includes(this.smallTypeId)) {
                data.forEach(item1 => {
                  item1.isMonitor = false
                  item1.monitorOnline = false
                  item1.PointList.length &&
                    item1.PointList.forEach(item => {
                      item.alarmactive !== 0 && (item1.alarm = true)
                      if (
                        item.pname === '库温' ||
                        item.pname === '温度' ||
                        item.pname === '控制温度'
                      ) {
                        item1.num1 = {
                          val: item.value,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.pname === '湿度') {
                        item1.num2 = {
                          val: item.value,
                          alarm: item.alarmactive !== 0
                        }
                      } else if (item.pname.indexOf('制冷状态') > -1) {
                        item1.state1 = {
                          val: item.value,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.pname === '化霜状态') {
                        item1.state2 = {
                          val: item.valuename,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.pname === '风机状态') {
                        item1.state3 = {
                          val: item.valuename,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.pname === '库门状态') {
                        item1.state4 = {
                          val: item.valuename,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.type === 57) {
                        item1.isMonitor = true
                        item.value === 1 && (item1.monitorOnline = true)
                      }
                    })
                })
              }
              this.cardList = data
              this.pagination.total = res.data.Data.TotalCount
            } else {
              this.cardList = []
              this.pagination.total = 0
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.cardLoading = false
          })
      }
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchCardData()
    },
    handleSizeChange(val) {
      this.pagination.num = val
      this.fetchCardData()
    }
  }
}
</script>

<style lang="scss">
.card-row-SDJKF9382 {
  flex-wrap: wrap;
  min-height: 90px;
}
</style>
