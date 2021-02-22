<template>
  <el-card :body-style="{ padding: '0px' }">
    <div style="padding: 14px;">
      <div class="device-card_name">
        {{ data.mname }}
        <el-tag
          :class="
            data.modelConnectStatus === 1
              ? 'offline-tag'
              : data.modelConnectStatus === 3
              ? 'alarm-tag'
              : 'normal-tag'
          "
          style="float: right;"
          size="mini"
        >
          {{
            data.modelConnectStatus === 1
              ? '离线'
              : data.modelConnectStatus === 3
              ? '报警'
              : '正常'
          }}
        </el-tag>
      </div>
      <div class="device-card_title">位置：{{ data.area }}</div>
      <div class="device-card_params">
        <div
          v-for="point in data.PointList.length > 3
            ? data.PointList.slice(0, 4)
            : data.PointList"
          :key="point.id"
          class="point-param"
          style="cursor: pointer"
          @click.stop="() => $emit('watchHistory', point.point, data.mtid)"
        >
          {{ point.pname }}：<span
            style="float:right;"
            :class="{
              online: point.valuename === '开',
              close: point.valuename === '关',
              currentValue: point.valuename != '开' && point.valuename != '关',
              offline: point.ConnectStatus === '1'
            }"
            >{{ point.valuename }}</span
          >
        </div>
      </div>
      <div class="device-card_btnwrapper" @click.stop="watchAllParam(data)">
        <el-button type="text" class="device-card_button">
          查看详情
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  props: {
    bigTypeId: Number,
    smallTypeId: Number,
    data: Object
  },
  data() {
    return {}
  },
  methods: {
    fetHistoryData(pointId, deviceId) {
      this.history.point = [pointId]
      this.history.deviceId = deviceId
      this.$refs.historyDialog.toggleDialog()
    },
    watchAllParam(data) {
      this.$router.push({
        name: 'devicePointList',
        query: {
          mtid: data.mtid,
          deviceName: data.mname,
          from: this.$route.name,
          path: this.$route.path,
          BigTypeId: this.bigTypeId,
          SmallTypeId: this.smallTypeId
        }
      })
    }
  }
}
</script>
