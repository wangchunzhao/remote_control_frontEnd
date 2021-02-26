<template>
  <div class="page-header">
    <div class="wrap">
      <el-link
        type="primary"
        :underline="false"
        v-if="showBack"
        @click.native="
          () => {
            if (onClickBack) {
              onClickBack()
              return
            }
            $router.go(-1)
          }
        "
      >
        <c-svg name="jiantou" class="back-icon" />
      </el-link>
      <span class="title">{{ title }}</span>
      <slot name="right"></slot>
    </div>
    <slot name="bottom"></slot>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    showBack: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    onClickBack: {
      type: Function
    }
  },
  methods: {
    foo() {
      console.log('[44]-PageHeader.vue', this.onClickBack)
      // this.onClickBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  box-sizing: border-box;
  background: #fff;
  padding: 16px 45px 20px;
  .wrap {
    display: flex;
    align-items: center;
  }
  .back-icon {
    font-size: 20px;
    margin-right: 10px;
  }
  .title {
    font-size: 20px;
    font-weight: 500;
    color: #3c3c3c;
  }
}
</style>
