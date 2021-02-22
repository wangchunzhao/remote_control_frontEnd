<template>
  <el-dialog
    width="580px"
    title="查找地址"
    :append-to-body="appendToBody"
    :visible.sync="dialogVisible"
    @close="handleClose"
    custom-class="getposition-dialog"
  >
    <el-autocomplete
      v-model="filter"
      :fetch-suggestions="querySearchAsync"
      placeholder="请输入内容"
      clearable
      @select="handleSelect"
    >
      <template slot-scope="{ item }">
        <div class="ellipsis">{{ item.name }}</div>
        <div
          class="ellipsis"
          style="font-size: 12px;color: #b4b4b4;line-height:12px;padding-bottom: 10px;"
        >
          {{ `${item.province}/${item.city}/${item.district}` }}
        </div>
      </template>
      <el-button
        @click.native="handleSearch"
        slot="append"
        icon="el-icon-search"
      ></el-button>
    </el-autocomplete>
    <div id="getposition-map"></div>
    <span slot="footer">
      <el-button
        :loading="loading"
        size="medium"
        type="primary"
        @click.native="submit"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { forwardBaiduRequest } from '@/api/forward'
export default {
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      filter: '',
      point: null,
      userCurrentPosition: {},
      resFromSuggest: null
    }
  },
  mounted() {
    this.myGeo = new BMap.Geocoder()
  },
  methods: {
    handleSelect(val) {
      this.point = val.location
      const mapPoint = new BMap.Point(this.point.lng, this.point.lat)
      this.map.centerAndZoom(mapPoint, 16)
      this.map.addOverlay(new BMap.Marker(this.point))
      this.resFromSuggest = val
    },
    querySearchAsync(queryString, cb) {
      if (!queryString) {
        cb([])
        return
      }
      // 创建地址解析器实例
      forwardBaiduRequest({
        Url: 'http://api.map.baidu.com/place/v2/suggestion',
        QueryString: `query=${queryString}&region=全国&city_limit=false&output=json`
      })
        .then(res => {
          if (res.data.status === 0) {
            const data = res.data.result
            data.forEach(v => (v.value = v.name))
            cb(data)
          } else {
            cb([])
          }
        })
        .catch(err => {
          console.error(err)
          cb([])
        })
    },
    handleSearch() {
      if (!this.filter) {
        return
      }
      this.resFromSuggest = null
      this.myGeo.getPoint(
        this.filter,
        point => {
          if (point) {
            this.point = point
            this.map.centerAndZoom(point, 16)
            this.map.addOverlay(new BMap.Marker(point))
          } else {
            this.$message('您输入的地址没有解析到结果')
            this.point = null
          }
        },
        ''
      )
    },
    openDialog(address) {
      this.dialogVisible = true
      this.$nextTick(() => {
        // 百度地图API功能
        this.map = new BMap.Map('getposition-map') // 创建Map实例
        this.map.enableScrollWheelZoom(true)

        if (address) {
          this.myGeo.getPoint(
            address,
            point => {
              if (point) {
                this.point = point
              }
              this.map.centerAndZoom(
                point ? point : new BMap.Point(116.404, 39.915),
                point ? 16 : 11
              ) // 初始化地图,设置中心点坐标和地图级别
              if (point) {
                this.map.addOverlay(new BMap.Marker(point))
              }
            },
            '全国'
          )
        } else {
          this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 11)
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.filter = ''
      this.point = null
      this.resFromSuggest = null
    },
    submit() {
      const { point } = this
      if (!point) {
        this.$message('请先搜索出项目所在地')
        return
      }
      if (this.resFromSuggest) {
        this.$emit('change', {
          street: this.resFromSuggest.name,
          adcode: this.resFromSuggest.adcode
        })
        this.dialogVisible = false
        return
      }
      this.loading = true
      forwardBaiduRequest({
        Url: 'http://api.map.baidu.com/reverse_geocoding/v3/',
        QueryString: `location=${point.lat},${point.lng}&output=json`
      })
        .then(res => {
          if (res.data.status === 0) {
            const data = res.data.result
            this.$emit('change', {
              street: data.formatted_address,
              adcode: data.addressComponent.adcode
            })
            this.dialogVisible = false
          } else {
            this.$message('您输入的地址没有解析到结果')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message('您输入的地址没有解析到结果')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss">
.getposition-dialog {
  .el-dialog__body {
    position: relative;
    padding: 0;
  }
  .el-input {
    width: 300px;
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10;
  }
  #getposition-map {
    height: 320px;
  }
}
</style>
