<template>
  <el-dialog
    width="900px"
    title=""
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    custom-class="video-player-dialog"
  >
    <div style="width: 900px; height: 600px;overflow: hidden;">
      <div
        v-if="currentVideo.type === 0"
        id="video-wrap"
        style="width: 900px; height: 600px;"
      ></div>

      <iframe
        v-if="currentVideo && currentVideo.type === 1"
        :src="
          `https://open.ys7.com/ezopen/h5/iframe?url=${currentVideo.url}&autoplay=1&accessToken=${currentVideo.token}`
        "
        width="900px"
        height="600px"
        id="ysOpenDevice"
        allowfullscreen
      >
      </iframe>
    </div>

    <div class="video-player-tool clearfix">
      <div style="float: right;">
        <el-dropdown trigger="click">
          <el-button type="text"
            >{{ currentVideo.name
            }}<i class="el-icon-arrow-down el-icon--right"></i
          ></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              @click.native="handleSelectVideo(item)"
              v-for="(item, index) in videoList"
              :key="index"
            >
              {{ item.PointName }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </el-dialog>
</template>

<script>
// 下面之所以能这样引用，是因为 在euikit.js文件的最后添加了一行代码： export default EZUIKit;
import { getModelTreeVideoMonitorPointList } from '@/api/videoMonitorPoint'
export default {
  data() {
    return {
      dialogVisible: false,
      currentVideo: {
        type: '',
        url: '',
        name: '',
        token: ''
      },
      videoList: []
    }
  },
  watch: {
    'currentVideo.url'(url) {
      if (!url) {
        return false
      }
      if (this.currentVideo.type === 0) {
        // 自定义
        this.playVideo()
      } else if (this.currentVideo.type === 1) {
        // 萤石
      } else if (this.currentVideo.type === 2) {
        // 乐橙
      }
    }
  },
  computed: {
    industryId() {
      return this.$store.state.app.project.Industry
    }
  },
  methods: {
    openDialog({ deviceId }) {
      if (deviceId) {
        getModelTreeVideoMonitorPointList({
          modelTreeId: deviceId,
          industry: this.industryId
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.videoList = res.data.Data
              this.currentVideo.type = this.videoList[0].VideoMonitorType
              this.currentVideo.name = this.videoList[0].PointName
              this.currentVideo.url = this.videoList[0].MonitorAddress
              this.currentVideo.token = this.videoList[0].AccessToken
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
      this.dialogVisible = true
    },
    // 选择视频
    handleSelectVideo(video) {
      this.currentVideo.type = video.VideoMonitorType
      this.currentVideo.name = video.PointName
      this.currentVideo.url = video.MonitorAddress
      this.currentVideo.token = video.AccessToken
    },
    playVideo() {
      this.$nextTick(() => {
        let videoObject = {
          container: '#video-wrap', // “#”代表容器的ID，“.”或“”代表容器的class
          variable: 'player', // 该属性必需设置，值等于下面的new chplayer()的对象
          flashplayer: false, // 如果强制使用flashplayer则设置成true
          autoplay: true,
          video: this.currentVideo.url // 视频地址
        }
        new ckplayer(videoObject)
      })
    },
    handleClose() {
      this.currentVideo.type = ''
      this.currentVideo.name = ''
      this.currentVideo.url = ''
      this.currentVideo.token = ''
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss">
.video-player-dialog {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
  }
  .video-player-tool {
    padding: 0 15px;
    .icon {
      width: 18px;
      height: 18px;
    }
    .el-button--text {
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
