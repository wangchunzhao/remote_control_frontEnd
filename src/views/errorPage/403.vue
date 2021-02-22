<template>
  <div class="err-403-page">
    <div class="main-wrap">
      <img
        src="https://cdn.sinocold.net/images/wZcnGqRDyhPOEYFcZDnb.svg"
        alt=""
      />
      <div>
        <div class="text-403">403</div>
        <div class="desc">抱歉，你无权访问此页面</div>
        <el-button @click.native="handleClick" type="primary" size="medium">{{
          platform === 'BUSINESS' ? '返回首页' : '返回上一页'
        }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick() {
      if (this.platform === 'BUSINESS') {
        this.$router.replace({ name: 'mapIndex' })
      } else {
        this.$router.go(-1)
      }
    }
  },
  computed: {
    platform() {
      return this.$store.state.permissions.platform
    }
  }
}
</script>

<style lang="scss" scoped>
.err-403-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .main-wrap {
    display: flex;
    align-items: center;
  }
  img {
    width: 360px;
    height: 360px;
    margin-right: 100px;
  }
  .text-403 {
    font-weight: 600;
    font-size: 72px;
    line-height: 72px;
    color: #434e59;
  }
  .desc {
    margin: 16px 0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 20px;
    line-height: 28px;
  }
}
</style>
