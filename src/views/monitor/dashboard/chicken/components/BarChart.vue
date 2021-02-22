<template>
  <div class="custom-barchart-DSFJ82390">
    <div class="wrap">
      <div
        v-for="(val, index) in data"
        :key="val + index"
        :style="{
          backgroundColor: colors[index],
          flex: index === 0 ? 0 : data[index] - data[index - 1]
        }"
        class="bar-item"
      >
        <div class="bar-label">
          {{ val }}
        </div>
      </div>
      <div
        v-if="showTooltip"
        class="tooltip-slot"
        :style="{ position: 'absolute', left: tooltipPositionLeft + '%' }"
      >
        <div
          role="tooltip"
          v-if="tooltipPositionNumber !== undefined"
          aria-hidden="false"
          class="el-tooltip__popper is-light"
          x-placement="top"
          :style="{
            top: '-49px',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }"
        >
          {{ tooltipText }}
          <div x-arrow="" class="popper__arrow" style="left: 41px;"></div>
        </div>
      </div>
      <!-- </el-tooltip> -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Array,
    showTooltip: {
      type: Boolean,
      default: function() {
        return true
      }
    },
    tooltipText: String,
    tooltipPositionNumber: Number,
    colors: Array
  },
  data() {
    return {
      isShowTooltip: true,
      tooltipPositionLeft: 0
    }
  },
  watch: {
    tooltipPositionNumber() {
      const max = this.data[this.data.length - 1]
      const min = this.data[0]
      const diff = max - min
      if (this.tooltipPositionNumber < min) {
        this.tooltipPositionLeft = 0
      } else if (this.tooltipPositionNumber > max) {
        this.tooltipPositionLeft = 100
      } else {
        this.tooltipPositionLeft =
          ((this.tooltipPositionNumber - min) / diff) * 100
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-barchart-DSFJ82390 {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  .wrap {
    height: 15px;
    display: flex;
    position: relative;
  }
  .bar-item {
    position: relative;
    height: 100%;
  }
  .bar-label {
    position: absolute;
    bottom: -15px;
    right: -15px;
    color: rgba(0, 0, 0, 0.25);
    font-size: 12px;
  }
}
</style>
