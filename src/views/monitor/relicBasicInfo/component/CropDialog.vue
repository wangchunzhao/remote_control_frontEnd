<template>
  <el-dialog
    width="800px"
    append-to-body
    title="图片裁剪"
    custom-class="crop-dialog"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    @close="handleClose"
  >
    <img class="crop-img" :src="this.cropperImg" alt="" />
    <span slot="footer">
      <el-button size="medium" @click.native="handleCancel">取 消</el-button>
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
  props: {
    cropperImg: String,
    aspectRatio: Number
  },
  data() {
    return {
      dialogVisible: false,
      imgUrl: '',
      cropper: null
    }
  },
  watch: {
    cropperImg() {
      this.$nextTick(() => {
        this.cropper = new Cropper(
          document.querySelector('.crop-dialog .crop-img'),
          {
            aspectRatio: this.aspectRatio
          }
        )
      })
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleCancel() {
      this.dialogVisible = false
      this.$emit('cancel')
    },
    handleClose() {
      this.dialogVisible = false
      this.cropper.destroy()
    },
    submit() {
      const canvas = this.cropper.getCroppedCanvas()

      canvas.toBlob(blob => {
        this.$emit('change', {
          blob,
          url: canvas.toDataURL()
        })
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
