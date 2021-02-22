<template>
  <div>
    <page-header show-back title="组态">
      <template v-slot:right>
        <el-cascader
          :options="structData"
          size="small"
          v-model="locationIds"
          style="margin-left: 20px"
          @change="onLocationChange"
          :show-all-levels="false"
          :props="{
            checkStrictly: true,
            children: 'Child',
            label: 'mname',
            value: 'mtid'
          }"
        >
        </el-cascader>
      </template>
    </page-header>
    <div style="margin: 20px;">
      <iframe
        v-if="iframeSrc"
        :src="iframeSrc"
        allowfullscreen
        allow="fullscreen"
        style="width: 100%;height: calc(100vh - 150px);"
        frameborder="0"
      ></iframe>
      <HistoryDialog
        :point-ids="history.points"
        :device-id="history.deviceId"
        ref="historyDialog"
      />
    </div>
  </div>
</template>

<script>
import HistoryDialog from '@/components/HistoryDialog'
import { getPlanStructTree } from '@/api/planNew'
import { getToken } from '@/utils/auth'

export default {
  components: {
    HistoryDialog
  },
  data() {
    return {
      iframeSrc: '',
      structData: [],
      locationIds: [],
      history: {
        points: null,
        deviceId: 0
      }
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchStructTree()
    window.addEventListener(
      'message',
      event => {
        const data = event.data
        if (data.event === 'showHistoryDialog') {
          this.history = {
            points: data.payload.pointIds,
            deviceId: data.payload.deviceId
          }
          this.$refs.historyDialog.toggleDialog()
        }
      },
      false
    )
  },
  methods: {
    onLocationChange(val) {
      this.iframeSrc = `https://yun.sinocold.net/configuration/#/player?projectId=${
        this.projectId
      }&locationId=${val[val.length - 1]}&token=${getToken()}`
    },
    fetchStructTree() {
      getPlanStructTree({
        project: this.projectId
      })
        .then(res => {
          let data = JSON.parse(res.data)
          if (data.success) {
            this.structData = data.plist
            this.locationIds = [this.structData[0].mtid]
            this.iframeSrc = `https://yun.sinocold.net/configuration/#/player?projectId=${
              this.projectId
            }&locationId=${this.structData[0].mtid}&token=${getToken()}`
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
