<template>
  <img
    :src="src"
    :alt="alt"
    :style="{ width: size + 'px', height: size + 'px' }"
    class="avatar-JSDKSJDF890233"
  />
</template>

<script>
export default {
  props: {
    size: {
      type: Number,
      default: function() {
        return 30
      }
    },
    src: {
      type: String,
      required: true
    },
    alt: String
  }
}
</script>

<style lang="scss">
.avatar-JSDKSJDF890233 {
  border-radius: 50%;
}
</style>
