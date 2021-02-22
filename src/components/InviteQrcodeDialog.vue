<template>
  <el-dialog
    width="320px"
    title="邀请成员"
    :visible.sync="dialogVisible"
    custom-class="invite-qrcode-dialog"
    @close="handleClose"
  >
    <div>
      <div class="title">{{ title }}</div>
      <img class="qrcode" :src="url.qrcodeUrl" alt="" />
      <div>
        使用 CoolCare app 扫码快速加入{{ type === 'project' ? '项目' : '企业' }}
      </div>
      <div style="padding: 10px 0;">（邀请有效期为24小时）</div>
      <el-link @click.native="handleCopy" type="primary" :underline="false"
        >复制邀请链接
      </el-link>
    </div>
  </el-dialog>
</template>

<script>
import { copyToClipboard } from '@/utils/index'
export default {
  props: {
    url: {
      type: Object,
      required: true
    },
    title: String,
    // type: 'project' 'company'
    type: String
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleCopy() {
      this.dialogVisible = false
      copyToClipboard(this.url.inviteText)
      this.$message.success('邀请链接已复制到剪切板')
    }
  }
}
</script>

<style lang="scss">
.invite-qrcode-dialog {
  .el-dialog__body {
    text-align: center;
    padding: 20px;
  }
  .title {
    font-weight: 500;
    font-size: 15px;
  }
  .qrcode {
    width: 165px;
    height: 165px;
  }
}
</style>
