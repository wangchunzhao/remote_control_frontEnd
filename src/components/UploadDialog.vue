<template>
  <el-dialog
    custom-class="upload-dialog"
    :visible.sync="dialogVisible"
    width="480px"
    top="25vh"
    :show-close="false"
  >
    <el-upload
      class="upload-wrap"
      drag
      :show-file-list="false"
      :http-request="upload"
      :before-upload="handleBeforeUpload"
      action="#333333"
      :accept="accept"
      :multiple="true"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
        <div class="el-upload__tip">{{ tip }}，且不超过{{ limitSize }}kb</div>
      </div>
    </el-upload>
  </el-dialog>
</template>

<script>
import { uploadFile } from '@/api/uploader.js'
export default {
  props: {
    limitSize: {
      type: Number,
      default: function() {
        return 1024
      }
    },
    bucketName: {
      type: String,
      required: true
    },
    objectName: {
      type: String,
      required: true
    },
    accept: {
      type: String,
      default: function() {
        return 'image/png,image/jpg,image/jpeg,image/svg+xml'
      }
    },
    tip: {
      type: String,
      default: function() {
        return '只能上传jpg/png/svg文件'
      }
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    toggleDialog() {
      this.dialogVisible = !this.dialogVisible
    },
    handleBeforeUpload(file) {
      const isLtSize = file.size / 1024 < this.limitSize

      if (!isLtSize) {
        this.$message(
          `上传文件大小不能超过 ${(this.limitSize / 1024).toFixed(1)}MB!`
        )
      }
      return isLtSize
    },
    upload(fileObj) {
      const formData = new FormData()
      formData.append('file', fileObj.file)
      formData.append('type', fileObj.file.type)
      formData.append('BucketName', this.bucketName)
      formData.append('ObjectName', this.objectName)
      uploadFile({
        formData: formData
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.$emit('complete', {
              res: true,
              url: res.data.Data
            })
          } else {
            this.$message.error('文件上传失败')
            this.$emit('complete', {
              res: false
            })
          }
        })
        .catch(err => {
          this.$emit('complete', {
            res: false
          })
          console.error(err)
          this.$message.error('文件上传失败')
        })
    }
  }
}
</script>

<style lang="scss">
.upload-dialog {
  border-radius: 6px;
  overflow: hidden;
  .el-dialog__header {
    padding: 0;
  }
  .el-dialog__body {
    padding: 5px;
  }
  .el-upload {
    display: block;
  }
  .el-upload-dragger {
    width: 100%;
    height: 240px;
  }
}
</style>
