<template>
  <el-dialog
    width="800px"
    title="图片裁剪"
    custom-class="crop-dialog"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <img class="crop-img" :src="this.imgUrl" alt="" />
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submit"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
export default {
  data() {
    return {
      dialogVisible: false,
      imgUrl: '',
      cropper: null
    }
  },
  methods: {
    openDialog(url) {
      this.dialogVisible = true
      this.imgUrl = url
      this.$nextTick(() => {
        this.cropper = new Cropper(
          document.querySelector('.crop-dialog .crop-img'),
          {
            aspectRatio: 35 / 17
          }
        )
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.imgUrl = ''
      this.cropper.destroy()
    },
    submit() {
      const canvas = this.cropper.getCroppedCanvas({
        width: '247',
        height: '119.97142px'
      })

      canvas.toBlob(blob => {
        const formData = new FormData()
        formData.append('file', blob, 'img.jpg')
        this.$emit('change', { formData, imgUrl: canvas.toDataURL() })
        this.dialogVisible = false
      })
    }
  }
}
</script>

<style lang="scss">
.crop-dialog {
  .el-dialog__body {
    padding: 0;
    min-height: 300px;
  }
  .crop-img {
    width: 100%;
    max-width: 100%;
    height: auto;
  }
}
</style>
