<template>
  <div :id="domId" v-nodata="isNoData" style="height: 300px;" />
</template>

<script>
export default {
  props: {
    domId: {
      default: function() {
        return ''
      },
      type: String
    },
    data: {
      type: Object,
      default: function() {
        return null
      }
    },
    typeId: {},
    loading: {
      type: Boolean,
      default: function() {
        return true
      }
    }
  },
  data() {
    return {
      isNoData: false
    }
  },
  watch: {
    loading: {
      handler(val) {
        if (val) {
          this.chart &&
            this.chart.showLoading({
              color: '#1890ff'
            })
        } else {
          this.chart && this.chart.hideLoading()
        }
      },
      immediate: true
    },
    data: {
      handler(val) {
        if (!val) {
          return false
        }
        this.isNoData = false

        if (!val.data.length) {
          this.chart.clear()
          this.isNoData = true
          return false
        }
        this.chart.setOption({
          color: [
            '#1878ff',
            '#1cbe24',
            '#f8c312',
            '#1a235f',
            '#7024d8',
            '#1cb7b5'
          ],
          tooltip: {
            trigger: 'item',
            // formatter: '报修数量 <br/>{b}: {c} ({d}%)'
            formatter: params => {
              var icon = this.typeId
                ? ''
                : `
                <a href="javascript:void(0);" style="float: right;color: #fff;margin-left: 30px;" onclick="drillDown('${params.dataIndex}')">
                  <img style="width: 15px; cursor: pointer;" src="https://cdn.sinocold.net/images/20190404140158.png" alt="">
                  下钻
                </a>
              `
              var str = `
                  <div style="margin-bottom: 6px;">
                    <span>报警数量</span>
                    ${icon}
                  </div>
                  <div>
                    <span class="tooltip-point" style="background: ${params.color}"></span>
                    <span>${params.name}：${params.value}（${params.percent}%）</span>
                  </div>
                `
              return str
            }
          },
          series: [
            {
              type: 'pie',
              radius: ['50%', '70%'],
              center: ['50%', '50%'],
              data: this.data.data,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        })
        this.chart.hideLoading()
      },
      deep: true
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.domId))
    this.chart.showLoading({
      color: '#1890ff'
    })
    window.addEventListener('resize', this.chart.resize)
    this.chart.on('click', params => {
      if (this.typeId) {
        // 说明已经选择了分类，不可再下钻了
        return false
      }
      this.$emit('drillDown', params.data.Id)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.chart.resize)
  }
}
</script>
