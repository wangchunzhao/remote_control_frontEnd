<template>
  <el-dialog
    title="上传图片"
    :visible.sync="dialogVisible"
    width="820px"
    :before-close="handleClose"
  >
    <el-upload
      action="#233"
      :file-list="fileList"
      list-type="picture-card"
      :on-remove="handleRemove"
      :limit="50"
      :on-change="fileChange"
      :http-request="handleUpload"
      accept="image/png,image/jpg,image/jpeg"
      :multiple="false"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <span slot="footer" class="dialog-footer">
      <el-button :loading="uploadLoading" type="primary" @click.native="submit"
        >确 定</el-button
      >
    </span>
    <CropDialog
      ref="cropDialog"
      :aspectRatio="48 / 27"
      :cropperImg="cropperImg"
      @cancel="() => fileList.pop()"
      @change="handleImgCropper"
    />
  </el-dialog>
</template>

<script>
import { uploadFile } from '@/api/uploader'
import CropDialog from './CropDialog'
import { randomString } from '@/utils/index'

export default {
  props: {
    // 上传的图片是否需要裁剪
    isCropper: {
      type: Boolean,
      default: function() {
        return true
      }
    }
  },
  components: {
    CropDialog
  },
  data() {
    return {
      cropperImg: null,
      fileList: [],
      dialogVisible: false,
      uploadLoading: false,
      formData: new FormData()
    }
  },
  methods: {
    openDialog(list = []) {
      this.dialogVisible = true
      this.fileList = []
      const temp = []
      list.forEach(v => {
        temp.push({
          uid: randomString(10),
          url: v
        })
      })
      this.fileList = temp
    },
    handleClose() {
      this.dialogVisible = false
      this.fileList = []
      this.formData = new FormData()
    },
    fileChange(file, fileList) {
      const isLt5M = file.size / 1024 / 1024 < 4
      if (!isLt5M) {
        this.$message('上传文件大小不能超过4M')
        fileList.pop()
      }
      this.fileList = fileList
      if (this.isCropper) {
        this.cropperImg = file.url
        this.$refs.cropDialog.openDialog()
      } else {
        const _URL = window.URL || window.webkitURL
        const img = new Image()
        const _this = this
        img.onload = async function() {
          // file.url 是一个ObjectURL,下面的操作是把ObjectURl转blob
          const blob = await fetch(file.url).then(r => r.blob())
          // 将图片的长宽信息拼接到文件名中
          _this.formData.append(
            `file$${file.name.split('.')[0]}&${this.width}*${this.height}`,
            blob,
            file.name
          )
          file.width = this.width
          file.height = this.height
          _URL.revokeObjectURL(file.url)
        }
        img.src = file.url
      }
    },
    handleRemove(file) {
      this.fileList = this.fileList.filter(item => item.uid !== file.uid)
      if (file.width) {
        // 只有上传图纸信息时，file才有width属性
        this.formData.delete(
          `file$${file.name.split('.')[0]}&${file.width}*${file.height}`
        )
      } else {
        this.formData.delete('file_' + file.uid)
      }
    },
    handleImgCropper({ blob, url }) {
      const file = this.fileList.find(v => v.url === this.cropperImg)
      if (file) {
        file.url = url
      }
      this.formData.append('file_' + file.uid, blob, file.name)
    },
    handleUpload() {
      return
    },
    submit() {
      // 这里筛选出已经上传过的图片，刚刚选中上传的图片url是objectURL
      const imgList = this.fileList
        .filter(v => v.url.includes('https://'))
        .map(v => v.url)
      console.log(Array.from(this.formData.keys()).length)
      if (Array.from(this.formData.keys()).length) {
        // 说明有新上传的图片
        this.uploadLoading = true
        this.formData.append('BucketName', 'front-end-assets')
        this.formData.append('ObjectName', `cultural_relic/`)
        uploadFile(this.formData)
          .then(res => {
            if (res.data.Code === 200) {
              this.$emit('change', [...imgList, ...res.data.Data])
              this.dialogVisible = false
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
      } else {
        this.$emit('change', imgList)
        this.dialogVisible = false
      }
    }
  }
}
</script>
