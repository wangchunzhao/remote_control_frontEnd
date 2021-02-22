<template>
  <div id="carmap_container" class="carmap_container">
    <div
      id="mapContainer"
      v-loading="maploading"
      element-loading-text="加载中..."
    />
    <div class="toolBox">
      <el-date-picker
        v-model="stime"
        type="datetime"
        placeholder="开始时间"
        value-format="timestamp"
        format="yyyy-MM-dd HH:mm"
        size="small"
        @change="handlestartTime"
      />
      <span>&nbsp;至&nbsp;</span>
      <el-date-picker
        v-model="etime"
        type="datetime"
        placeholder="结束时间"
        value-format="timestamp"
        format="yyyy-MM-dd HH:mm"
        size="small"
        :picker-options="pickerOptions"
      />
      <el-button
        type="primary"
        size="small"
        style="margin-left: 10px;"
        icon="el-icon-search"
        @click="searchTrackPoints"
      >
        查询
      </el-button>
      <el-button size="small" icon="el-icon-rank" @click="screenFull">
        {{ fullscreenStatus ? '取消全屏' : '全屏' }}
      </el-button>
      <el-tooltip
        content="打开/关闭位置刷新（每分钟更新最近定位）"
        effect="light"
        placement="top"
      >
        <el-switch
          v-model="isPosition"
          style="margin-left: 10px;"
          @change="checkPosition"
        />
      </el-tooltip>
    </div>
  </div>
</template>
<script>
import screenfull from 'screenfull'
import { getBaiduAttactPoints, forwardBaiduGetlatestpoint } from '@/api/forward'
export default {
  data() {
    return {
      stime: '',
      etime: '',
      start: '',
      end: '',
      map: '',
      currentpositionTimer: null,
      maploading: false,
      points: [],
      fullscreenStatus: false,
      initstartTime: '',
      initendTime: '',
      initlongitude: null,
      initlatitude: null,
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() < new Date(this.stime).getTime() - 8.64e7
        }
      },
      isPosition: false,
      monitorInfoBox: null,
      trackInfoBox: null,
      point: null,
      type: null,
      initHeight: null,
      initCanvas: null,
      myCurrentOverlay: null,

      opts: {
        width: 200, // 信息窗口宽度
        height: 120, // 信息窗口高度
        enableMessage: true, // 设置允许信息窗发送短息
        offset: {
          width: 6,
          height: -22
        }
      }
    }
  },
  mounted() {
    this.serviceId = this.$route.query.serviceId
    this.entityName = this.$route.query.entityName

    const mapHeight = window.innerHeight - 141
    this.initHeight = mapHeight
    const map = document.getElementById('carmap_container')
    map.style.cssText = 'height:' + mapHeight + 'px'
    this.map = new BMap.Map('mapContainer', { enableMapClick: false })
    this.map.setMapStyle({ style: 'googlelite' })
    this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 11)
    this.map.enableScrollWheelZoom(true)
    window.map = this.map
    const opt1 = { anchor: window.BMAP_ANCHOR_TOP_RIGHT }
    this.map.addControl(new BMap.NavigationControl(opt1)) // 增加比例尺
    this.map.addControl(new BMap.ScaleControl())
    this.map.addControl(new BMap.OverviewMapControl())

    this.end = Date.parse(new Date()) / 1000
    this.start = this.end - 60 * 60 * 24
    this.stime = Date.now() - 3600 * 1000 * 24
    this.etime = Date.now()

    // 默认查询最近一天的
    this.maploading = true
    this.getTrackPoint(this.stime, this.etime)
      .then(res => {
        if (res.length) {
          this.drawTrack(res)
        } else {
          this.$message('当前时间段内无轨迹')
        }
      })
      .catch(err => {
        console.error(err)
        this.$message.error('轨迹点加载失败')
      })
      .finally(() => {
        this.maploading = false
      })
    this.initTrackPointOverlay()
    this.addZoomControl()
    this.initCurentPositionOverlay()
    // 监听地图是否处在全屏状态下。
    screenfull.on('change', () => {
      const map = document.getElementById('carmap_container')
      let vw = window.innerWidth
      let vh = window.innerHeight
      if (screenfull.isFullscreen) {
        this.fullscreenStatus = true
        map.style.cssText = `width: ${vw}px;height: ${vh}px`
      } else {
        map.style.cssText = `height:${this.initHeight}px;width:100%`
        this.fullscreenStatus = false
      }
    })
    window.addEventListener('resize', () => {
      if (this.$route.path !== '/coldCar/carMap') {
        return
      }
      const mapHeight = window.innerHeight - 141
      const map = document.getElementById('carmap_container')
      this.initHeight = mapHeight
      map.style.cssText = `height:${mapHeight}px`
    })

    this.checkPositionCount = 0
  },
  beforeDestroy() {
    clearInterval(this.currentpositionTimer)
  },
  methods: {
    // 查询一个时间段内的时间间隔
    getTrackPoint(start, end) {
      return new Promise((resolve, reject) => {
        getBaiduAttactPoints({
          service_id: this.serviceId,
          entity_name: this.entityName,
          simple_return: 0,
          page_size: 5000,
          page_index: 1,
          start_time: parseInt(start / 1000),
          end_time: parseInt(end / 1000),
          is_processed: 1,
          process_option:
            'need_denoise=1,need_vacuate=1,need_mapmatch=1,transport_mode=driving'
        })
          .then(res => {
            if (res.data.points) {
              resolve(res.data.points)
            } else {
              reject('加载轨迹点失败')
            }
            resolve(res.data.points)
          })
          .catch(err => {
            console.error(err)
            reject('加载轨迹点失败')
          })
      })
    },
    checkPosition() {
      if (this.isPosition) {
        this.$message('已开启实时位置')
        this.fetchcurrentPosition()
      } else {
        this.$message('已关闭实时位置')
        this.myCurrentOverlay.hide()
        if (this.trackInfoBox) {
          this.trackInfoBox.close()
        }
        clearInterval(this.currentpositionTimer)
        this.currentpositionTimer = null
        this.checkPositionCount = 0 // 清空定位次数
      }
    },
    handlestartTime(val) {
      this.start = val / 1000
      this.initstartTime = this.start
    },
    searchTrackPoints(val) {
      this.end = val / 1000
      if (this.stime + 3600 * 24 * 7 * 1000 < this.etime) {
        // 判断开始时间+30天是否小于结束时间
        // this.etime = ''
        this.$message({
          showClose: true,
          message: '日期范围最大为7天 请重新选择'
        })
        return false
      }
      if (!this.stime) {
        this.$message('请选择结束时间')
        return false
      }
      if (this.stime > this.etime) {
        this.$message('开始时间不能大于结束时间')
        return false
      }
      this.start = this.initstartTime
      // this.checkhistoryTrack()

      this.map.clearOverlays()
      if (this.isPosition) {
        this.fetchcurrentPosition()
      }
      this.points = []
      let that = this

      // eslint-disable-next-line no-inner-declarations
      async function loadpoints(start, end) {
        for (var i = 0; i <= Math.ceil((end - start) / 86400000) - 1; i++) {
          let startTime = start + i * 86400000
          let endTime = start + (i + 1) * 86400000
          await that.getTrackPoint(startTime, endTime).then(res => {
            that.points.push(...res)
          })
        }
      }
      this.maploading = true
      loadpoints(this.stime, this.etime)
        .then(() => {
          this.maploading = false
          if (!this.points.length) {
            this.$message('当前时间段内无轨迹')
          } else {
            this.drawTrack(this.points, this.start, this.end)
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('轨迹点加载失败')
        })
        .finally(() => {
          this.maploading = false
        })
    },
    // 获取设备实时位置
    fetchcurrentPosition() {
      forwardBaiduGetlatestpoint({
        service_id: this.serviceId,
        entity_name: this.entityName
      })
        .then(res => {
          if (res.data.latest_point && res.data.latest_point.latitude) {
            let data = res.data.latest_point
            let point = new BMap.Point(data.longitude, data.latitude)
            if (this.checkPositionCount === 0) {
              // 如果是第一次定位的话
              this.map.setCenter(point)
            }
            this.checkPositionCount += 1
            let that = this
            let myCurrentOverlay = ''
            point.loc_time = data.loc_time
            point.sensor0 = data.sensor0
            point.sensor1 = data.sensor1
            point.sensor2 = data.sensor2
            point.sensor3 = data.sensor3
            point.sensor4 = data.sensor4
            point.sensor5 = data.sensor5
            point.sensor6 = data.sensor6
            point.sensor7 = data.sensor7
            point.sensor8 = data.sensor8
            point.sensor9 = data.sensor9
            point.tempture = data.tempture
            point.power = data.battery
            point.create_time = new Date(data.loc_time * 1000).format(
              'yyyy-MM-dd hh:mm:ss'
            )
            point.humidity = data.humidity
            this.point = point
            new BMap.Marker(point)
            if (!this.initlongitude) {
              this.initlongitude = data.longitude
              this.initlatitude = data.latitude
              myCurrentOverlay = new this.CurentPosition(
                point,
                'currentPosition'
              )
              this.myCurrentOverlay = myCurrentOverlay
              this.map.addOverlay(myCurrentOverlay)
            } else {
              myCurrentOverlay = new this.CurentPosition(
                point,
                'currentPosition'
              )
              this.myCurrentOverlay = myCurrentOverlay
              this.map.addOverlay(myCurrentOverlay)
            }
            myCurrentOverlay._div.addEventListener('click', function() {
              that.setTrackInfoBox(point, 'currentPosition')
            })
            if (!this.currentpositionTimer) {
              this.currentpositionTimer = setInterval(
                this.fetchcurrentPosition,
                1000 * 60
              )
            }
          } else {
            this.$message.error('查询车辆实时位置失败')
            clearInterval(this.currentpositionTimer)
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('查询车辆实时位置失败')
        })
    },
    // 全屏配置
    screenFull() {
      let wrap = document.getElementById('carmap_container')
      if (screenfull.enabled) {
        screenfull.toggle(wrap)
      }
    },
    drawTrack(data, starttime, endtime) {
      let that = this
      let totalPoints = []
      if (data.length === 0) {
        return
      }
      if (!starttime) {
        starttime = data[0].loc_time
      }
      if (!endtime) {
        endtime = data[data.length - 1].loc_time
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i].loc_time >= starttime && data[i].loc_time <= endtime) {
          let tempPoint = new BMap.Point(data[i].longitude, data[i].latitude)
          tempPoint.speed = data[i].speed ? data[i].speed : 0
          tempPoint.loc_time = data[i].loc_time
          tempPoint.height = data[i].height
          tempPoint.sensor0 = data[i].sensor0
          tempPoint.sensor1 = data[i].sensor1
          tempPoint.sensor2 = data[i].sensor2
          tempPoint.sensor3 = data[i].sensor3
          tempPoint.sensor4 = data[i].sensor4
          tempPoint.sensor5 = data[i].sensor5
          tempPoint.sensor6 = data[i].sensor6
          tempPoint.sensor7 = data[i].sensor7
          tempPoint.sensor8 = data[i].sensor8
          tempPoint.sensor9 = data[i].sensor9
          tempPoint.radius = data[i].radius
          tempPoint.tempture = data[i].tempture
          tempPoint.power = data[i].battery
          tempPoint.create_time = data[i].create_time
          tempPoint.humidity = data[i].humidity
          tempPoint.printSpeed = this.getSpeed(data[i].speed)
          tempPoint.lnglat =
            data[i].longitude.toFixed(2) + ',' + data[i].latitude.toFixed(2)
          totalPoints.push(tempPoint)
        }
      }
      that.map.setViewport(totalPoints, { margins: [80, 0, 0, 200] })
      let updatePointer = function() {
        let ctx = this.canvas.getContext('2d')
        that.initCanvas = ctx
        if (!ctx) {
          return
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        if (totalPoints.length !== 0) {
          let pixelPart = 0
          const pixelPartUnit = 40
          for (let i = 0, len = totalPoints.length; i < len - 1; i = i + 1) {
            let pixel = that.map.pointToPixel(totalPoints[i])
            let nextPixel = that.map.pointToPixel(totalPoints[i + 1])
            pixelPart =
              pixelPart +
              Math.pow(
                Math.pow(nextPixel.x - pixel.x, 2) +
                  Math.pow(nextPixel.y - pixel.y, 2),
                0.5
              )
            if (pixelPart <= pixelPartUnit) {
              continue
            }
            pixelPart = 0
            ctx.beginPath()

            if (
              totalPoints[i + 1].loc_time - totalPoints[i].loc_time <=
              5 * 60
            ) {
              // 箭头一共需要5个点：起点、终点、中心点、箭头端点1、箭头端点2

              let midPixel = new BMap.Pixel(
                (pixel.x + nextPixel.x) / 2,
                (pixel.y + nextPixel.y) / 2
              )

              // 起点终点距离
              let distance = Math.pow(
                Math.pow(nextPixel.x - pixel.x, 2) +
                  Math.pow(nextPixel.y - pixel.y, 2),
                0.5
              )
              // 箭头长度
              let pointerLong = 4
              let aPixel = {}
              let bPixel = {}
              if (nextPixel.x - pixel.x === 0) {
                if (nextPixel.y - pixel.y > 0) {
                  aPixel.x = midPixel.x - pointerLong * Math.pow(0.5, 0.5)
                  aPixel.y = midPixel.y - pointerLong * Math.pow(0.5, 0.5)
                  bPixel.x = midPixel.x + pointerLong * Math.pow(0.5, 0.5)
                  bPixel.y = midPixel.y - pointerLong * Math.pow(0.5, 0.5)
                } else if (nextPixel.y - pixel.y < 0) {
                  aPixel.x = midPixel.x - pointerLong * Math.pow(0.5, 0.5)
                  aPixel.y = midPixel.y + pointerLong * Math.pow(0.5, 0.5)
                  bPixel.x = midPixel.x + pointerLong * Math.pow(0.5, 0.5)
                  bPixel.y = midPixel.y + pointerLong * Math.pow(0.5, 0.5)
                } else {
                  continue
                }
              } else {
                let k0 =
                  (-Math.pow(2, 0.5) * distance * pointerLong +
                    2 * (nextPixel.y - pixel.y) * midPixel.y) /
                    (2 * (nextPixel.x - pixel.x)) +
                  midPixel.x
                let k1 = -((nextPixel.y - pixel.y) / (nextPixel.x - pixel.x))
                let a = Math.pow(k1, 2) + 1
                let b = 2 * k1 * (k0 - midPixel.x) - 2 * midPixel.y
                let c =
                  Math.pow(k0 - midPixel.x, 2) +
                  Math.pow(midPixel.y, 2) -
                  Math.pow(pointerLong, 2)

                aPixel.y = (-b + Math.pow(b * b - 4 * a * c, 0.5)) / (2 * a)
                bPixel.y = (-b - Math.pow(b * b - 4 * a * c, 0.5)) / (2 * a)
                aPixel.x = k1 * aPixel.y + k0
                bPixel.x = k1 * bPixel.y + k0
              }
              ctx.moveTo(aPixel.x, aPixel.y)
              ctx.lineWidth = 2
              ctx.strokeStyle = '#eee'
              ctx.lineTo(midPixel.x, midPixel.y)
              ctx.lineTo(bPixel.x, bPixel.y)
              ctx.lineCap = 'round'
            }
            if (
              totalPoints[i].loc_time >= starttime &&
              totalPoints[i + 1].loc_time <= endtime
            ) {
              ctx.stroke()
            }
          }
        }
      }
      let updateBack = function() {
        let nextArray = []
        let ctx = this.canvas.getContext('2d')
        if (!ctx) {
          return
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (totalPoints.length !== 0) {
          var lines = 1

          for (let i = 0, len = totalPoints.length; i < len - 1; i++) {
            let pixel = that.map.pointToPixel(totalPoints[i])
            let nextPixel = that.map.pointToPixel(totalPoints[i + 1])
            ctx.beginPath()

            ctx.moveTo(pixel.x, pixel.y)
            if (
              totalPoints[i + 1].loc_time - totalPoints[i].loc_time <=
              5 * 60
            ) {
              // 绘制轨迹的时候绘制两次line，一次是底色，一次是带速度颜色的。目的是实现边框效果
              ctx.lineWidth = 10
              ctx.strokeStyle = '#8b8b89'
              ctx.lineTo(nextPixel.x, nextPixel.y)
              ctx.lineCap = 'round'
            } else {
              lines = lines + 1
              nextArray.push([pixel, nextPixel])
            }
            if (
              totalPoints[i].loc_time >= starttime &&
              totalPoints[i + 1].loc_time <= endtime
            ) {
              ctx.stroke()
            }
          }
        }
      }
      let update = function() {
        let nextArray = []
        let ctx = this.canvas.getContext('2d')
        if (!ctx) {
          return
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        if (totalPoints.length !== 0) {
          var lines = 1
          for (let i = 0, len = totalPoints.length; i < len - 1; i++) {
            // map.addOverlay(new BMap.Marker(totalPoints[i]))
            let pixel = that.map.pointToPixel(totalPoints[i])
            let nextPixel = that.map.pointToPixel(totalPoints[i + 1])
            ctx.beginPath()
            ctx.moveTo(pixel.x, pixel.y)
            if (
              totalPoints[i + 1].loc_time - totalPoints[i].loc_time <=
              5 * 60
            ) {
              // 绘制带速度颜色的轨迹
              ctx.lineCap = 'round'
              ctx.lineWidth = 8
              let grd = ctx.createLinearGradient(
                pixel.x,
                pixel.y,
                nextPixel.x,
                nextPixel.y
              )
              let speed = totalPoints[i].speed
              let speedNext = totalPoints[i + 1].speed
              grd.addColorStop(0, that.getColorBySpeed(speed))
              grd.addColorStop(1, that.getColorBySpeed(speedNext))
              ctx.strokeStyle = grd
              ctx.lineTo(nextPixel.x, nextPixel.y)
            } else {
              lines = lines + 1
              nextArray.push([pixel, nextPixel])
            }
            if (
              totalPoints[i].loc_time >= starttime &&
              totalPoints[i + 1].loc_time <= endtime
            ) {
              ctx.stroke()
            }
          }
        }

        if (totalPoints[0].loc_time >= starttime) {
          let imgStart = new Image()
          imgStart.src =
            'https://cdn.sinocold.net/images/monitorDashboard/start2.png'
          imgStart.onload = function() {
            let width = [4, 8]
            ctx.drawImage(
              imgStart,
              that.map.pointToPixel(totalPoints[0]).x - 20,
              that.map.pointToPixel(totalPoints[0]).y - 20
            )
            ctx.font = 'lighter 14px arial'
            ctx.fillStyle = 'white'
            ctx.fillText(
              '1',
              that.map.pointToPixel(totalPoints[0]).x -
                width[lines >= 10 ? 1 : 0],
              that.map.pointToPixel(totalPoints[0]).y - 15
            )
          }
        }
        if (totalPoints[totalPoints.length - 1].loc_time <= endtime) {
          let imgEnd = new Image()
          imgEnd.src =
            'https://cdn.sinocold.net/images/monitorDashboard/end2.png'
          imgEnd.onload = function() {
            let width = [4, 8]
            ctx.drawImage(
              imgEnd,
              that.map.pointToPixel(totalPoints[totalPoints.length - 1]).x - 20,
              that.map.pointToPixel(totalPoints[totalPoints.length - 1]).y - 20
            )
            ctx.font = 'lighter 14px arial'
            ctx.fillStyle = 'white'
            ctx.fillText(
              lines,
              that.map.pointToPixel(totalPoints[totalPoints.length - 1]).x -
                width[lines >= 10 ? 1 : 0],
              that.map.pointToPixel(totalPoints[totalPoints.length - 1]).y - 15
            )
          }
        }
      }
      if (totalPoints.length > 0) {
        window.canvasLayerBack = new CanvasLayer({
          map: this.map,
          update: updateBack
        })
        window.canvasLayer = new CanvasLayer({
          map: this.map,
          update: update
        })
        window.CanvasLayerPointer = new CanvasLayer({
          map: this.map,
          update: updatePointer
        })
      }
      if (typeof pointCollection !== 'undefined') {
        this.map.removeOverlay(pointCollection)
      }
      let options = {
        size: window.BMAP_POINT_SIZE_HUGE,
        shape: window.BMAP_POINT_SHAPE_STAR,
        color: 'rgba(0, 0, 0, 0)'
      }
      let pointCollection = new BMap.PointCollection(totalPoints, options) // 初始化PointCollection
      pointCollection.addEventListener('mouseover', function(e) {
        that.addTrackPointOverlay(e.point, 'trackpointOverlay')
      })
      pointCollection.addEventListener('mouseout', function() {
        that.removeTrackPointOverlay('trackpointOverlay')
      })
      pointCollection.addEventListener('click', function(e) {
        that.removeTrackInfoBox()
        that.removeTrackPointOverlay('trackpointonOverlay')
        that.addTrackPointOverlay(e.point, 'trackpointonOverlay')
        that.setTrackInfoBox(e.point, '')
      })
      this.map.addOverlay(pointCollection) // 添加Overlay
    },
    initTrackPointOverlay() {
      this.trackPointOverlay = function(point, type) {
        this._point = point
        this.type = type
      }
      this.trackPointOverlay.prototype = new BMap.Overlay()
      this.trackPointOverlay.prototype.initialize = function(map) {
        this._map = map
        let div = (this._div = document.createElement('div'))
        // div.className = 'trackpointOverlay';
        div.className = this.type
        let innerDiv = document.createElement('div')
        innerDiv.className = 'trackpoint_in'
        div.appendChild(innerDiv)
        map.getPanes().labelPane.appendChild(div)
        return div
      }
      this.trackPointOverlay.prototype.draw = function() {
        let map = this._map
        let pixel = map.pointToOverlayPixel(this._point)
        this._div.style.left = pixel.x - 8 + 'px'
        this._div.style.top = pixel.y - 8 + 'px'
      }
    },
    initCurentPositionOverlay() {
      this.CurentPosition = function(point, type) {
        this._point = point
        this.type = type
      }
      this.CurentPosition.prototype = new BMap.Overlay()
      this.CurentPosition.prototype.initialize = function(map) {
        this._map = map
        let div = (this._div = document.createElement('div'))
        div.className = this.type
        const currentArr = document.querySelectorAll('.currentPosition')
        if (currentArr.length > 0) {
          currentArr.forEach(item => {
            map.getPanes().labelPane.removeChild(item)
          })
        }
        map.getPanes().labelPane.appendChild(div)
        return div
      }
      this.CurentPosition.prototype.draw = function() {
        let map = this._map
        let pixel = map.pointToOverlayPixel(this._point)
        this._div.style.left = pixel.x - 20 + 'px'
        this._div.style.top = pixel.y - 37 + 'px'
      }
    },
    // 添加缩放控件
    addZoomControl() {
      var ZoomControl = function() {
        // 默认停靠位置和偏移量
        this.defaultAnchor = window.BMAP_ANCHOR_BOTTOM_RIGHT
        this.defaultOffset = new BMap.Size(15, 90)
      }
      // 通过JavaScript的prototype属性继承于BMap.Control
      ZoomControl.prototype = new BMap.Control()
      // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
      // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
      ZoomControl.prototype.initialize = function(map) {
        var zoom = document.createElement('div')
        zoom.className = 'zoom'
        var zoomIn = document.createElement('div')
        zoomIn.className = 'zoomIn'
        var zoomOut = document.createElement('div')
        zoomOut.className = 'zoomOut'
        zoom.appendChild(zoomIn)
        zoom.appendChild(zoomOut)
        zoomIn.onclick = function() {
          map.zoomIn()
        }
        zoomOut.onclick = function() {
          map.zoomOut()
        }
        // 添加DOM元素到地图中
        map.getContainer().appendChild(zoom)
        // 将DOM元素返回
        return zoom
      }
      // 创建控件
      var myZoomCtrl = new ZoomControl()
      // 添加到地图当中
      this.map.addControl(myZoomCtrl)
    },
    getSpeed: function(speed) {
      var speedDesc
      if (speed >= 150) {
        speedDesc = ' - - '
      } else if (speed >= 1 && speed < 150) {
        speedDesc = speed.toFixed(1) + 'km/h'
      } else {
        speedDesc = '静止'
      }
      return speedDesc
    },
    removeTrackPointOverlay(type) {
      let overlays = this.map.getOverlays()
      let length = overlays.length
      let trackPointOverlays = []
      for (let i = 0; i < length; i++) {
        if (overlays[i].type === type) {
          trackPointOverlays.push(overlays[i])
        }
      }
      for (let j = 0; j < trackPointOverlays.length; j++) {
        this.map.removeOverlay(trackPointOverlays[j])
      }
    },
    addTrackPointOverlay(point, type) {
      let myCompOverlay = new this.trackPointOverlay(point, type)
      this.map.addOverlay(myCompOverlay)
      // this.map.addOverlay()
    },
    // 删除infoBox
    removeTrackInfoBox() {
      this.map.removeOverlay(this.trackInfoBox)
      this.trackInfoBox = null
    },
    removeMonitorInfoBox() {
      this.map.removeOverlay(this.monitorInfoBox)
      this.monitorInfoBox = null
    },
    getColorBySpeed(speed) {
      var color = ''
      var red = 0
      var green = 0
      var blue = 0
      speed = speed > 100 ? 100 : speed
      switch (Math.floor(speed / 25)) {
        case 0:
          red = 187
          green = 0
          blue = 0
          break
        case 1:
          speed = speed - 25
          red = 187 + Math.ceil(((241 - 187) / 25) * speed)
          green = 0 + Math.ceil(((48 - 0) / 25) * speed)
          blue = 0 + Math.ceil(((48 - 0) / 25) * speed)
          break
        case 2:
          speed = speed - 50
          red = 241 + Math.ceil(((255 - 241) / 25) * speed)
          green = 48 + Math.ceil(((200 - 48) / 25) * speed)
          blue = 48 + Math.ceil(((0 - 48) / 25) * speed)
          break
        case 3:
          speed = speed - 75
          red = 255 + Math.ceil(((22 - 255) / 25) * speed)
          green = 200 + Math.ceil(((191 - 200) / 25) * speed)
          blue = 0 + Math.ceil(((43 - 0) / 25) * speed)
          break
        case 4:
          red = 22
          green = 191
          blue = 43
          break
      }

      red =
        red.toString(16).length === 1
          ? '0' + red.toString(16)
          : red.toString(16)
      green =
        green.toString(16).length === 1
          ? '0' + green.toString(16)
          : green.toString(16)
      blue =
        blue.toString(16).length === 1
          ? '0' + blue.toString(16)
          : blue.toString(16)
      color = '#' + red + green + blue
      return color
    },
    setTrackInfoBox(point, type) {
      const timeText = type === 'currentPosition' ? '更新时间' : '定位时间'

      const htmlString = `
          <div>
            ${timeText}：${point.create_time}
          </div>
          <div>
            电量：${point.power}%
          </div>
          <div>
            温度：${point.tempture}
          </div>
          ${
            point.humidity > 0 ?
            `
              <div>
                湿度：${point.humidity}
              </div>
            ` : ''
          }
        `
      this.trackInfoBox = new BMapLib.InfoBox(this.map, htmlString, {
        boxClass: 'terminal-map-infobox',
        closeIconMargin: '12px',
        alignBottom: false,
        closeIconUrl:
          'https://cdn.sinocold.net/images/baiduMap/closeinfowindow.png'
      })
      this.trackInfoBox.open(point)
      this.map.panTo(point)
    }
  }
}
</script>
<style lang="scss" scoped>
.carmap_container {
  position: relative;
  overflow: hidden;
}
#mapContainer {
  width: 100%;
  height: 100%;
}
.toolBox {
  position: absolute;
  top: 20px;
  left: 20px;
}
.in_use {
  background: #24b47e;
}
.un_use {
  background: #dbdbdb;
}
.use_sign {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: -1px;
}
</style>
<style>
.terminal-map-infobox {
  padding: 0 15px;
  width: 240px;
  height: 140px;
  line-height: 40px;
  color: #606266;
  transform: translateY(-25px);
  background-color: #fff;
}
</style>

<style lang="scss">
@import 'src/assets/style/map.scss';
</style>
