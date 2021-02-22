<template>
  <div class="box-style" style="height: 100%;box-sizing: border-box">
    <div id="weather-view-he"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  mounted() {
    window.WIDGET = { ID: 'aRLQWbyfzK' }
    const tag = document.createElement('script')
    tag.src = 'https://apip.weatherdt.com/view/static/js/r.js?v=1111'
    tag.type = 'text/javascript'
    document.getElementsByTagName('head')[0].appendChild(tag)
  }
}
</script>

<style lang="scss">
#weather-view-he {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  // pointer-events: none;
  .wv-top-backdrop {
    bottom: 0;
    right: 0;
    width: 100% !important;
    height: 100% !important;
  }
  .wv-lt-location {
    a {
      color: #409eff;
      text-decoration: none;
    }
  }
}
@media (max-width: 1700px) {
  #weather-view-he {
    .wv-v-h-col-right {
      display: none;
    }
    .wv-v-h-col-left {
      width: 100% !important;
    }
    .wv-v-h-col-middle {
      display: none;
    }
  }
}
</style>
