<template>
  <el-card shadow="never" class="box-card card-qrcode">
    <div slot="header" class="clearfix">
      <span class="card-title">微信公众号</span>
    </div>
    <div class="main-body">
      <div class="qicode-box">
        <img
          class="qrcode"
          src="https://front-end-assets.oss-cn-shanghai.aliyuncs.com/Carrier_PC/%E5%85%AC%E4%BC%97%E5%8F%B7.jpg"
          alt=""
        />
      </div>
      <div class="qrcode-text">扫码关注，绑定后接收报警推送</div>
    </div>
  </el-card>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.card-qrcode {
  height: 330px;
}
.qicode-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qrcode {
  width: 213px;
  height: 213px;
}
.qrcode-text {
  margin-top: 5px;
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #8fa2b5;
  line-height: 22px;
  text-align: center;
}
</style>
