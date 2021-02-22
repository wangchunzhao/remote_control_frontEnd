<template>
  <svg slot="icon" :class="['icon', className]" aria-hidden="true">
    <use :xlink:href="`#icon-${name}`" />
  </svg>
</template>

<script>
export default {
  name: 'CSvg',
  props: {
    name: {
      type: String,
      require: true,
      default: function() {
        return ''
      }
    },
    className: {
      type: String,
      default: function() {
        return ''
      }
    }
  }
}
</script>
