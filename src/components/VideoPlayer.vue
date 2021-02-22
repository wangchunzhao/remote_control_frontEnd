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
        v-if="video.type === 0"
        id="video-wrap"
        style="width: 900px; height: 600px;"
      ></div>

      <iframe
        v-if="video && video.type === 1"
        :src="
          `https://open.ys7.com/ezopen/h5/iframe?url=${video.url}&autoplay=1&accessToken=${video.token}`
        "
        width="900px"
        height="600px"
        id="ysOpenDevice"
        allowfullscreen
      >
      </iframe>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    video: Object
    // video: {
    //   type: '',
    //   url: '',
    //   token: ''
    // },
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  watch: {
    'video.url'(url) {
      if (!url) {
        return false
      }
      if (this.video.type === 0) {
        // 自定义
        this.playVideo()
      } else if (this.video.type === 1) {
        // 萤石
      } else if (this.video.type === 2) {
        // 乐橙
      }
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    playVideo() {
      this.$nextTick(() => {
        let videoObject = {
          container: '#video-wrap', // “#”代表容器的ID，“.”或“”代表容器的class
          variable: 'player', // 该属性必需设置，值等于下面的new chplayer()的对象
          flashplayer: false, // 如果强制使用flashplayer则设置成true
          autoplay: true,
          video: this.video.url // 视频地址
        }
        new ckplayer(videoObject)
      })
    },
    handleClose() {
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
}
</style>
