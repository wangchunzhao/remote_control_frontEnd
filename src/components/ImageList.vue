<template>
  <div>
    <el-upload
      action="#233"
      :file-list="fileList"
      list-type="picture-card"
      :on-remove="handleRemove"
      :limit="8"
      :on-change="fileChange"
      :http-request="handleUpload"
      accept="image/png,image/jpg,image/jpeg"
      :multiple="false"
    >
      <i class="el-icon-plus" />
    </el-upload>
  </div>
</template>

<script>
import { uploadFile } from '@/api/uploader'
export default {
  data() {
    return {
      fileList: []
    }
  },
  methods: {
    fileChange(file, fileList) {
      const isLt4M = file.size / 1024 / 1024 < 4
      if (!isLt4M) {
        this.$message('上传文件大小不能超过4M')
        fileList.pop()
      }
      this.fileList = fileList
    },
    handleRemove(file) {
      this.fileList = this.fileList.filter(item => item.uid !== file.uid)
      this.$emit(
        'changeFile',
        this.fileList.map(item => item.serviceUrl).join(',')
      )
    },
    handleUpload({ file }) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('BucketName', 'front-end-assets')
      formData.append('ObjectName', `repair/`)
      uploadFile(formData)
        .then(res => {
          if (res.data.Code === 200) {
            this.fileList[this.fileList.length - 1].serviceUrl =
              res.data.Data[0]
            this.$emit(
              'changeFile',
              this.fileList.map(item => item.serviceUrl).join(',')
            )
          } else {
            this.$message.error('图片上传失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('图片上传失败')
        })
        .finally(() => {
          this.uploadLoading = false
        })
    }
  }
}
</script>
