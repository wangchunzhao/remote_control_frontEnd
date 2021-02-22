<template>
  <el-card
    :body-style="{ padding: '0px', cursor: 'pointer' }"
    @click.native="() => watchAllParam(data)"
  >
    <div style="padding: 14px;">
      <div class="device-card_name">
        {{ data.ModelTreeName }}
      </div>
      <div class="device-card_title">位置：{{ data.area }}</div>
      <div class="device-card_title" style="padding-top:10px">
        {{
          $route.meta.pagequery === 1
            ? '防区数量：'
            : $route.meta.pagequery === 2
            ? '电表读数：'
            : '回路总数：'
        }}
        <span style="float:right;color:#1890ff">{{ data.num }}</span>
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
  methods: {
    watchAllParam(data) {
      this.$router.push({
        name: 'devicePointList',
        query: {
          mtid: data.ModelTreeId,
          deviceName: data.ModelTreeName,
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
