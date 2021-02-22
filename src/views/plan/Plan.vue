<template>
  <div
    v-loading.fullscreen="planLoading"
    class="outer-container plan-page"
    element-loading-text="绘制中..."
    element-loading-background="rgba(0, 0, 0, 0.8)"
    style="background-image:url(https://plan-img.oss-cn-shanghai.aliyuncs.com/background/plan-bg.gif)"
  >
    <div class="inner-container">
      <div class="plan-container">
        <canvas id="plan-canvas" />
        <div style="display: none;">
          <canvas id="plan-canvas-hide" />
        </div>
        <struct-tree @clickNode="clickNode" />
        <div v-loading="sourceLoading" class="plan-source-list open hidden">
          <div class="header-wrap">
            <span style="font-size: 15px;">可配置设备/点位</span>
            <el-tooltip
              class="item"
              effect="dark"
              content="通过拖拽『图标』将设备/点位放入图中"
              placement="top"
            >
              <c-svg
                name="what"
                style="margin-left:10px;font-size:15px;color:#1890ff;"
              />
            </el-tooltip>
          </div>
          <div class="list thin-scroll">
            <div
              v-for="item in source"
              :key="item.mtid + item.id"
              class="list-item"
            >
              <div
                draggable
                class="plan-item-icon"
                :data-payload="JSON.stringify(item)"
              >
                <img
                  :id="item.icon"
                  crossOrigin="anonymous"
                  draggable="false"
                  :src="item.icon"
                  alt=""
                />
              </div>
              <div class="item-name">
                {{ item.name }}
              </div>
            </div>
          </div>
          <div class="filter-wrap">
            <el-input
              v-model="sourceFilter"
              suffix-icon="el-icon-search"
              clearable
              size="small"
              placeholder="搜索"
            />
          </div>
          <div class="indicator-wrap">
            <i class="indicator" @click="toggleSourceList" />
          </div>
        </div>
        <div
          v-show="planBgImg"
          :style="{ right: bottomToolBoxPositionRight }"
          class="bottom-tool-box"
        >
          <el-dropdown trigger="click" placement="top">
            <span class="el-dropdown-link">
              <c-svg style="font-size: 18px;" name="gengduo" />
            </span>
            <el-dropdown-menu slot="dropdown" class="plan-more-dropdown">
              <!-- <el-dropdown-item @click.native="foo">
                FOO
              </el-dropdown-item> -->
              <el-dropdown-item
                @click.native="$refs.uploadDialog.toggleDialog()"
              >
                编辑底图
              </el-dropdown-item>
              <el-dropdown-item @click.native="deletePlanBg">
                删除底图
              </el-dropdown-item>
              <el-dropdown-item @click.native="exportImg">
                下载图片
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-tooltip
            :open-delay="500"
            effect="dark"
            :content="editable ? '退出编辑' : '编辑'"
            placement="top"
          >
            <c-svg name="shezhi" style="" @click.native="toggleEdit" />
          </el-tooltip>
          <el-tooltip
            :open-delay="500"
            effect="dark"
            :content="isShowAll ? '退出所有' : '展开所有'"
            placement="top"
          >
            <c-svg
              name="chakan1"
              style="font-size: 24px;"
              @click.native="handleAllTooltip"
            />
          </el-tooltip>
          <el-popover
            ref="popover"
            placement="top"
            width="280"
            popper-class="plan-hotkey-wrap"
            trigger="click"
          >
            <div class="hotkey-wrap">
              <div class="hotkey-item">
                <span>缩放</span>
                <span>
                  <span class="hotkey">{{ OS === 'mac' ? '⌥' : 'Ctrl' }}</span>
                  <span style="padding: 0 6px;">+</span>
                  <c-svg name="gunlunjian" />
                </span>
              </div>
              <div class="hotkey-item">
                <span>展开所有</span>
                <span>
                  <span class="hotkey">{{ OS === 'mac' ? '⌥' : 'Ctrl' }}</span>
                  <span style="padding: 0 6px;">+</span>
                  <span class="hotkey">F</span>
                </span>
              </div>
              <div class="hotkey-item">
                <span>导出图片</span>
                <span>
                  <span class="hotkey">{{ OS === 'mac' ? '⌥' : 'Ctrl' }}</span>
                  <span style="padding: 0 6px;">+</span>
                  <span class="hotkey">S</span>
                </span>
              </div>
              <div class="hotkey-item">
                <span>开启/关闭编辑</span>
                <span>
                  <span class="hotkey">{{ OS === 'mac' ? '⌥' : 'Ctrl' }}</span>
                  <span style="padding: 0 6px;">+</span>
                  <span class="hotkey">E</span>
                </span>
              </div>
              <div class="hotkey-item">
                <span>按100%显示</span>
                <span>
                  <span class="hotkey">{{ OS === 'mac' ? '⌥' : 'Ctrl' }}</span>
                  <span style="padding: 0 6px;">+</span>
                  <span class="hotkey">1</span>
                </span>
              </div>
            </div>
          </el-popover>
          <!-- <el-tooltip :open-delay="500" effect="dark" :enterable="false" content="快捷键" placement="top"> -->
          <c-svg v-popover:popover name="jianpan" />
          <!-- </el-tooltip> -->
          <el-tooltip
            :open-delay="500"
            class="item"
            effect="dark"
            :content="isFullscreen ? '退出全屏' : '全屏视图'"
            placement="bottom"
          >
            <c-svg
              :name="
                isFullscreen ? 'shipinjiankongicon' : 'shipinjiankongicon2'
              "
              style="width:18px;height: 18px;"
              @click.native="handleScreen"
            />
          </el-tooltip>
          <el-tooltip
            :open-delay="500"
            effect="dark"
            content="缩小"
            placement="top"
          >
            <c-svg name="jian2" @click.native="clickZoomOut" />
          </el-tooltip>
          <span class="zoom-input" @click="initCanvas"
            >{{ parseInt(scaleInput * 100) }}%</span
          >
          <el-tooltip
            :open-delay="500"
            effect="dark"
            content="放大"
            placement="top"
          >
            <c-svg name="jia1" @click.native="clickZoomIn" />
          </el-tooltip>
        </div>
        <div v-if="planBgImg === 'no-img'" class="no-plan">
          <c-svg name="kong" />
          <div>
            还没有创建平面图？马上
            <a
              href="javascript:;"
              style="color: #1890ff;font-size: 16px;"
              @click="$refs.uploadDialog.toggleDialog()"
              >创建
            </a>
          </div>
        </div>

        <div id="plan-icon-" style="display: none">
          <img
            v-for="item in iconImgs"
            :id="item"
            :key="item"
            crossOrigin="anonymous"
            :src="item"
            alt=""
          />
        </div>
        <!-- 定义一个隐藏的div存放上传的图片（为了获取图片的长宽信息） -->
        <div class="hidden-img-wrap" style="position:fixed;top:10000px" />
      </div>
    </div>
    <HistoryDialog
      ref="historyDialog"
      :point-ids="history.point"
      :device-id="history.deviceId"
    />
    <DeviceDialog ref="deviceDialog" :device-id="deviceId" />
    <UploadDialog
      ref="uploadDialog"
      bucket-name="plan-img"
      object-name="background/"
      @complete="handleUpload"
    />
    <el-dialog
      :visible.sync="videoDialogVisible"
      :show-close="false"
      custom-class="video-dialog"
      @close="videoDialogClose"
    >
      <div id="video" style="width: 735px;height:600px;" />
    </el-dialog>
    <div class="legend-wrap">
      <div class="legend-item normal">
        在线
      </div>
      <div class="legend-item offline">
        离线
      </div>
      <div class="legend-item alarm">
        报警
      </div>
    </div>
  </div>
</template>

<script>
import { saveAs } from 'file-saver'
import {
  deleteInfo,
  updateArea,
  setPlanBg,
  getUndistr,
  deleteImg
} from '@/api/planNew'
import { getPlanItems } from '@/api/planNew'
import screenfull from 'screenfull'
import StructTree from './component/StructTree'
import { preloadImg } from '@/utils/index'
import HistoryDialog from '@/components/HistoryDialog'
import UploadDialog from '@/components/UploadDialog'
import DeviceDialog from './component/DeviceDialog'

let canvas = null
let PLAN_WIDTH = null // 平面图宽度
let PLAN_HEIGHT = null // 平面图高度
const ELEMENT_SIZE = 20 // 平面图元素的大小（放icon的矩形大小）
export default {
  components: {
    StructTree,
    HistoryDialog,
    DeviceDialog,
    UploadDialog
  },
  data() {
    return {
      planBgImg: '', // 平面图底图地址
      iconImgs: [], // 所有的icon图片地址
      bgWidth: 0, // 底图在当前屏幕大小下按底图原始比例应该显示的大小
      bgHeight: 0,

      scaleInput: 1, // 当前的缩放比例
      elementList: [], // 所有已配置的点位
      dialogVisible: false,
      planLoading: false,

      sourceListVisible: false,
      sourceFilter: '',
      sourceList: [],
      sourceLoading: false,

      isFullscreen: false, // 是否显示全屏
      isShowAll: false, // 是否显示所有tooltip
      editable: false, // 是否处于编辑模式

      history: {
        point: null,
        deviceId: 0
      },
      deviceId: null,
      videoDialogVisible: false,
      currentVideoUrl: '',

      bottomToolBoxPositionRight: '10px',
      OS: getOS()
    }
  },
  computed: {
    project() {
      return this.$store.state.app.project
    },
    source() {
      return this.sourceList.filter(item => {
        return (
          item.name.toLowerCase().indexOf(this.sourceFilter.toLowerCase()) > -1
        )
      })
    }
  },
  watch: {
    source() {
      // 绑定drag事件
      this.$nextTick(() => {
        const elDrags = document.querySelectorAll('.plan-item-icon')
        for (let i = 0; i < elDrags.length; i++) {
          elDrags[i].addEventListener(
            'dragstart',
            event => {
              if (!this.planBgImg) {
                this.$message('请先上传底图！')
                return false
              }

              let payload = JSON.parse(elDrags[i].getAttribute('data-payload'))
              payload.offsetX = event.offsetX
              payload.offsetY = event.offsetY
              event.dataTransfer.effectAllowed = 'copy'
              event.dataTransfer.setData('payload', JSON.stringify(payload))
            },
            false
          )
          elDrags[i].addEventListener('dragend', () => {}, false)
        }
      })
    },
    sourceListVisible(val) {
      if (!val) {
        document.querySelector('.plan-source-list').className =
          'plan-source-list open hidden'
        this.bottomToolBoxPositionRight = '10px'
      } else {
        this.bottomToolBoxPositionRight = '290px'
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    // // 监听平面图全屏状态变化。
    screenfull.on('change', () => {
      if (screenfull.isFullscreen) {
        this.isFullscreen = true
      } else {
        this.isFullscreen = false
      }
    })

    // 绑定快捷键
    document.addEventListener('keydown', e => {
      if (!this.planBgImg) {
        return false
      }
      if (this.OS === 'mac') {
        if (e.altKey) {
          switch (e.keyCode) {
            case 70:
              this.handleAllTooltip()
              break
            case 69:
              this.toggleEdit()
              break
            case 49:
              this.scaleInput = 1
              this.initCanvas()
              break
            case 83:
              this.exportImg()
              break
            default:
              break
          }
        }
      } else {
        if (e.ctrlKey) {
          switch (e.keyCode) {
            case 70:
              this.handleAllTooltip()
              break
            case 69:
              this.toggleEdit()
              break
            case 49:
              this.scaleInput = 1
              this.initCanvas()
              break
            case 83:
              this.exportImg()
              break
            default:
              break
          }
        }
      }
    })
  },
  beforeDestroy() {
    // 清除全局的事件监听
    window.removeEventListener('resize', this.handleResize)
    this.timer && clearInterval(this.timer)
  },
  methods: {
    foo() {
      // var transform = canvas.viewportTransform.slice()
      // canvas.viewportTransform = [1, 0, 0, 1, 0, 0]
      // const dataURL = canvas.toDataURL({
      //   format: 'png'
      // })
      // saveAs(dataURItoBlob(dataURL), 'plan.jpg')
      // canvas.viewportTransform = transform
      canvas.forEachObject(group => {
        if (group.type === 'elementGroup') {
          elementUpdate(group, {
            signText: 'Test',
            color: 'red'
          })
        }
      })
      canvas.renderAll()
    },
    // 全屏开关
    handleScreen() {
      screenfull.toggle()
    },
    // 结构树节点点击事件
    clickNode(id) {
      this.currentNode = id
      this.fetchPlan()
      this.fetchSource()
      // 开启定时更新
      this.timer = setInterval(() => {
        this.regularlyUpdate()
      }, 60000)
      // 先绘制底图
      // getLocationTreeImgById({
      //   locationTreeId: this.currentNode
      // }).then(res => {
      //   if (res.data.Code === 200) {
      //     const uri = res.data.Data
      //     if (uri.indexOf('http') > -1) {
      //       this.planBgImg = uri
      //     } else {
      //       // 兼容老版本
      //       this.planBgImg = _host + uri
      //     }
      //     canvas = new fabric.Canvas('plan-canvas', {
      //       selection: false
      //     })

      //     const SCREEN_WIDTH = document.body.clientWidth

      //     PLAN_WIDTH = SCREEN_WIDTH

      //     canvas.setWidth(PLAN_WIDTH)
      //     canvas.setHeight(PLAN_HEIGHT)
      //     // 读取图片地址，设置画布背景
      //     fabric.Image.fromURL(
      //       this.planBgImg,
      //       function(oImg) {
      //         PLAN_HEIGHT = (SCREEN_WIDTH / (oImg.width / oImg.height))
      //         oImg.set({
      //           selectable: false,

      //           // 通过scale来设置图片大小，这里设置和画布一样大
      //           scaleX: PLAN_WIDTH / oImg.width,
      //           scaleY: PLAN_HEIGHT / oImg.height
      //         })

      //         // 设置背景
      //         canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas))
      //       }, {
      //         crossOrigin: 'Anonymous' // 解决图片跨域问题
      //       })
      //   } else {
      //     canvas && canvas.clear()
      //     this.planBgImg = 'no-img'
      //   }
      // }).catch(err => {
      //   console.error(err)
      //   this.planBgImg = 'no-img'
      // })
    },
    // 初始化画布
    initCanvas() {
      if (this.planBgImg === 'no-img' || !this.planBgImg) {
        return false
      }
      if (this.editable) {
        this.$message('编辑模式下不可执行该操作')
        return false
      }
      let _this = this
      canvas && canvas.dispose()
      this.isShowAll = false
      this.editable = false
      this.sourceListVisible = false
      this.scaleInput = 1

      canvas = new fabric.Canvas('plan-canvas', {
        selection: false
      })

      // 自定义右上角icon的点击事件
      fabric.Canvas.prototype.customiseControls({
        tr: {
          cursor: 'pointer',
          action: function(e, target) {
            _this
              .$confirm('确定将选中的元素从平面图上移除？', {
                type: 'warning',
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              })
              .then(() => {
                let data = target.payload
                if (data.type === 2) {
                  // 刚拖拽进来的点位
                  data.pointId = data.id
                }
                deleteInfo({
                  mtid: data.mtid,
                  point: data.pointId
                })
                  .then(res => {
                    let data = JSON.parse(res.data)
                    if (data.flag === '00') {
                      canvas.remove(target)
                      _this.fetchSource()
                    } else {
                      _this.$message.error('删除失败，请刷新页面')
                    }
                  })
                  .catch(err => {
                    console.error(err)
                    _this.$message.error('删除失败，请刷新页面')
                  })
              })
          }
        }
      })

      const SCREEN_WIDTH = document.body.clientWidth

      PLAN_WIDTH = SCREEN_WIDTH

      canvas.setWidth(PLAN_WIDTH)
      // 读取图片地址，设置画布背景
      fabric.Image.fromURL(
        this.planBgImg,
        oImg => {
          if (!oImg.width) {
            _this.$message.error('平面图底图加载失败')
            return false
          }
          PLAN_HEIGHT = SCREEN_WIDTH / (oImg.width / oImg.height)
          canvas.setHeight(PLAN_HEIGHT)

          oImg.set({
            selectable: false,

            // 通过scale来设置图片大小，这里设置和画布一样大
            scaleX: PLAN_WIDTH / oImg.width,
            scaleY: PLAN_HEIGHT / oImg.height
          })

          // 设置背景
          canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas))

          // 将平面图元素添加到平面图上
          canvas.set('renderOnAddRemove', false)
          this.elementList.forEach(item => {
            let left = item.LocX
            let top = item.LocY
            if (item.LocX.indexOf('%') > -1) {
              // 兼容老版本平面图
              left = item.LocX.replace('%', '') / 100
              top = item.LocY.replace('%', '') / 100
            }

            // 如果图标icon是 defult 或 空字符，做处理判断是点还是设备
            if (item.Icon === 'default' || item.Icon === '') {
              !item.Child && (item.Icon = 'point') // 是点位
              item.Child && (item.Icon = 'device') // 是设备
            }

            let signText = ''
            let tooltipText = ''
            if (!item.Child && item.Camera) {
              // 摄像头
              tooltipText = item.Area + ': ' + item.Name
              item.type = 'camera'
            } else if (!item.Child && !item.Camera) {
              // 点位
              signText = item.Valit
              tooltipText = item.Name
              item.type = 'point'
            } else if (item.Child) {
              // 设备
              tooltipText = `[ ${item.Name} ]`
              item.Child.forEach(child => {
                tooltipText += `\n${child.Name}：${child.Valit}`
              })
              item.type = 'device'
            }

            let data = item
            canvas.add(
              elementFactor({
                id: item.Mtid,
                size: ELEMENT_SIZE,
                left: left * PLAN_WIDTH,
                top: top * PLAN_HEIGHT,
                imgId: `https://plan-img.oss-cn-shanghai.aliyuncs.com/icon/${item.Icon}.png`,
                signText,
                tooltipText,
                color: this.handleColor(item),
                payload: data
              })
            )
          })
          canvas.renderAll()
          canvas.set('renderOnAddRemove', true)

          const dropTarget = document.querySelector('.upper-canvas ')
          /* 只要元素正在合法的放置目标上拖动时，就执行脚本（对象是目标元素）*/
          dropTarget.addEventListener(
            'dragover',
            event => {
              // 阻止默认动作
              event.preventDefault()
              event.dataTransfer.dropEffect = 'copy'
              return true
            },
            false
          )

          canvas.on('drop', event => {
            const pointer = canvas.getPointer(event.e)
            const payload = JSON.parse(event.e.dataTransfer.getData('payload'))
            if (payload.type === 2) {
              // 点位
              payload.pointId = payload.id
            }
            const zoom = 1 / canvas.getZoom()
            const left = pointer.x
            const top = pointer.y + (ELEMENT_SIZE - payload.offsetY + 8) * zoom
            canvas.add(
              elementFactor({
                id: payload.Mtid,
                size: ELEMENT_SIZE,
                left: left,
                top: top,
                imgId: payload.Icon,
                // signText,
                tooltipText: payload.Name,
                color: '#339999',
                payload: payload,
                editable: true,
                zoom: zoom
              })
            )
            canvas.renderAll()
            this.sourceList = this.sourceList.filter(
              item => item.Mtid + item.Id !== payload.Mtid + payload.PointId
            )
            _this.upDatePlan({
              mtid: payload.Mtid,
              point: payload.PointId,
              locX: left / PLAN_WIDTH,
              locY: top / PLAN_HEIGHT
            })
          })
          // 监听鼠标滚轮事件，实现缩放
          canvas.on('mouse:wheel', opt => {
            const evt = opt.e
            let enable = false
            if (_this.OS === 'mac') {
              if (evt.altKey) {
                enable = true
              }
            } else {
              if (evt.ctrlKey) {
                enable = true
              }
            }
            if (enable) {
              const delta = opt.e.deltaY * -1
              // let pointer = canvas.getPointer(opt.e)
              let zoom = canvas.getZoom()
              zoom = zoom + delta / 200
              if (zoom > 20) zoom = 20
              if (zoom < 0.3) zoom = 0.3
              this.scaleInput = zoom
              this.canvaScale({
                origin: {
                  x: opt.e.offsetX,
                  y: opt.e.offsetY
                },
                num: zoom
              })
              var groupScale = 1 / zoom

              var groups = canvas.getObjects()
              groups.forEach(group => {
                if (group.type === 'tooltipGroup') {
                  group.set('top', group.targetTop - 40 * (1 / zoom))
                }
                group.scale(groupScale)
              })

              opt.e.preventDefault()
              opt.e.stopPropagation()
            }
          })

          canvas.on('mouse:down', function(opt) {
            const evt = opt.e

            if (_this.editable) {
              // 可编辑模式
              if (!opt.target) {
                // 说明没有点击在元素上面
                this.isDragging = true
                this.lastPosX = evt.clientX
                this.lastPosY = evt.clientY
              }
            } else {
              // 不可编辑
              this.isDragging = true
              this.lastPosX = evt.clientX
              this.lastPosY = evt.clientY
              if (opt.target && opt.target.type === 'elementGroup') {
                const data = opt.target.payload
                if (data.type === 'point') {
                  _this.history.point = [data.PointId]
                  _this.$refs.historyDialog.toggleDialog()
                } else if (data.type === 'camera') {
                  _this.openVideoDialog(data.Camera)
                } else if (data.type === 'device') {
                  _this.deviceId = data.Mtid
                  _this.$refs.deviceDialog.toggleDialog()
                }
              }
            }
          })
          canvas.on('mouse:move', function(opt) {
            if (this.isDragging) {
              const e = opt.e
              this.viewportTransform[4] += e.clientX - this.lastPosX
              this.viewportTransform[5] += e.clientY - this.lastPosY
              this.lastPosX = e.clientX
              this.lastPosY = e.clientY

              var groups = canvas.getObjects()
              groups.forEach(group => {
                group.setCoords() // 为什么要使用setCoords: https://github.com/fabricjs/fabric.js/wiki/When-to-call-setCoords
              })
              this.requestRenderAll()
            }
          })

          canvas.on('mouse:up', function(opt) {
            this.isDragging = false
            if (
              opt.target &&
              opt.target.type === 'elementGroup' &&
              _this.editable
            ) {
              const target = opt.target
              _this.upDatePlan({
                mtid: target.payload.Mtid,
                point: target.payload.PointId,
                locX: target.left / PLAN_WIDTH,
                locY: target.top / PLAN_HEIGHT
              })
            }
          })
          canvas.on('mouse:over', e => {
            // 显示元素的tooltip
            if (e.target && e.target.type === 'elementGroup') {
              const toolTip = toolTipFactor({
                targetId: e.target.id,
                text: e.target.tooltipText,
                targetTop: e.target.top,
                targetLeft: e.target.left,
                zoom: canvas.getZoom()
              })
              canvas.add(toolTip)
            }
            if (e.target && e.target.type === 'tooltipGroup') {
              e.target && e.target.bringToFront()
            }
          })

          canvas.on('mouse:out', e => {
            // 删除元素的tooltip
            if (
              e.target &&
              e.target.type === 'elementGroup' &&
              !this.isShowAll
            ) {
              canvas.forEachObject(obj => {
                if (
                  obj.type === 'tooltipGroup' &&
                  obj.targetId === e.target.id
                ) {
                  canvas.remove(obj)
                }
              })
            }
          })
          canvas.on('after:render', function() {
            // canvas.contextContainer.strokeStyle = '#555'
            // canvas.forEachObject(function(obj) {
            //   var bound = obj.getBoundingRect()
            //   canvas.contextContainer.strokeRect(
            //     bound.left + 0.5,
            //     bound.top + 0.5,
            //     bound.width,
            //     bound.height
            //   )
            // })
          })
        },
        {
          crossOrigin: 'Anonymous' // 解决图片跨域问题
        }
      )
    },
    // 画布缩放
    canvaScale({ origin, num }) {
      if (origin) {
        canvas.zoomToPoint(origin, num)
        var groupScale = 1 / num

        var groups = canvas.getObjects()
        groups.forEach(group => {
          group.scale(groupScale)
        })
      } else {
        // canvas.setZoom(1)
      }
    },
    // 展开/关闭所有tooltip
    handleAllTooltip() {
      canvas.set('renderOnAddRemove', false)
      if (this.isShowAll) {
        // 删除所有的tooltip
        canvas.forEachObject(item => {
          if (item.type === 'tooltipGroup') {
            canvas.remove(item)
          }
        })
      } else {
        // 显示所有的tooltip
        canvas.forEachObject(item => {
          if (item.type === 'elementGroup') {
            const toolTip = toolTipFactor({
              targetId: item.id,
              text: item.tooltipText,
              targetTop: item.top,
              targetLeft: item.left,
              zoom: canvas.getZoom()
            })
            canvas.add(toolTip)
          }
        })
      }
      canvas.renderAll()
      canvas.set('renderOnAddRemove', true)
      this.isShowAll = !this.isShowAll
    },

    // 开关编辑功能
    toggleEdit() {
      if (this.editable) {
        this.fetchPlan() // 重新绘制
      } else {
        canvas.forEachObject(item => {
          if (item.type === 'elementGroup') {
            elementUpdate(item, {
              editable: true
            })
          }
        })
      }
      canvas.renderAll()
      this.sourceListVisible = !this.sourceListVisible
      document.querySelector('.plan-source-list').classList.toggle('hidden')
      this.editable = !this.editable
    },
    // 点击放大
    clickZoomIn() {
      this.scaleInput += 0.3
      if (this.scaleInput > 20) this.scaleInput = 20
      const centerPoint = canvas.getCenter()
      this.canvaScale({
        origin: {
          x: centerPoint.left,
          y: centerPoint.top
        },
        num: this.scaleInput
      })
    },
    // 点击缩小
    clickZoomOut() {
      this.scaleInput -= 0.3
      if (this.scaleInput < 0.3) this.scaleInput = 0.3
      const centerPoint = canvas.getCenter()
      this.canvaScale({
        origin: {
          x: centerPoint.left,
          y: centerPoint.top
        },
        num: this.scaleInput
      })
    },
    exportImg() {
      if (this.scaleInput > 4) {
        this.$message('当前放大倍数大于4，不支持导出图片。')
        return false
      }
      const message = this.$message({
        message: '正在生成图片，请稍候...',
        iconClass: 'el-icon-loading',
        type: 'info',
        duration: 0
      })

      const canvasTemp = new fabric.Canvas('plan-canvas-hide', {
        selection: false
      })
      const WIDTH = PLAN_WIDTH * this.scaleInput
      const HEIGHT = PLAN_HEIGHT * this.scaleInput

      canvasTemp.setWidth(WIDTH)
      canvasTemp.setHeight(HEIGHT)
      // 读取图片地址，设置画布背景
      fabric.Image.fromURL(
        this.planBgImg,
        function(oImg) {
          oImg.set({
            selectable: false,

            // 通过scale来设置图片大小，这里设置和画布一样大
            scaleX: WIDTH / oImg.width,
            scaleY: HEIGHT / oImg.height
          })

          // 设置背景
          canvasTemp.setBackgroundImage(
            oImg,
            canvasTemp.renderAll.bind(canvasTemp)
          )
        },
        {
          crossOrigin: 'Anonymous' // 解决图片跨域问题
        }
      )

      // 将平面图元素添加到平面图上
      canvasTemp.set('renderOnAddRemove', false)
      this.elementList.forEach(item => {
        let left = item.LocX
        let top = item.LocY
        if (item.LocX.indexOf('%') > -1) {
          // 兼容老版本平面图
          left = item.LocX.replace('%', '') / 100
          top = item.LocY.replace('%', '') / 100
        }

        // 如果图标icon是 defult 或 空字符，做处理判断是点还是设备
        if (item.Icon === 'default' || item.Icon === '') {
          !item.Child && (item.Icon = 'point') // 是点位
          item.Child && (item.Icon = 'device') // 是设备
        }

        let signText = ''
        let tooltipText = ''
        if (!item.Child && item.Camera) {
          // 摄像头
          tooltipText = item.Area + ': ' + item.Name
          item.type = 'camera'
        } else if (!item.Child && !item.Camera) {
          // 点位
          signText = item.Valit
          tooltipText = item.Name
          item.type = 'point'
        } else if (item.Child) {
          // 设备
          tooltipText = `[ ${item.Name} ]`
          item.Child.forEach(child => {
            tooltipText += `\n${child.Name}：${child.Valit}`
          })
          item.type = 'device'
        }

        let data = item

        canvasTemp.add(
          elementFactor({
            id: item.Mtid,
            size: ELEMENT_SIZE,
            left: left * WIDTH,
            top: top * HEIGHT,
            imgId: `https://plan-img.oss-cn-shanghai.aliyuncs.com/icon/${item.Icon}.png`,
            signText,
            tooltipText,
            color: this.handleColor(item),
            payload: data
          })
        )
      })

      if (this.isShowAll) {
        // 显示所有的tooltip
        canvasTemp.forEachObject(item => {
          if (item.type === 'elementGroup') {
            const toolTip = toolTipFactor({
              targetId: item.Id,
              text: item.tooltipText,
              targetTop: item.top,
              targetLeft: item.left
            })
            canvasTemp.add(toolTip)
          }
        })
      }
      canvasTemp.renderAll()
      canvasTemp.set('renderOnAddRemove', true)

      // 延时10秒等待平面图底图加载完成完成后再导出图片
      setTimeout(() => {
        const dataURL = canvasTemp.toDataURL({
          format: 'png'
        })
        saveAs(
          dataURItoBlob(dataURL),
          `plan${this._dateFormat(new Date(), 'YYYY-MM-DD HH:mm')}.png`
        )
        canvasTemp && canvasTemp.dispose()
        message.close()
      }, 6000)
    },
    // 开关侧边栏
    toggleSourceList() {
      let wrap = document.querySelector('.plan-source-list')
      wrap.classList.toggle('open')
      wrap.classList.toggle('close')
      this.bottomToolBoxPositionRight === '10px'
        ? (this.bottomToolBoxPositionRight = '290px')
        : (this.bottomToolBoxPositionRight = '10px')
    },
    // 获取平面图数据
    fetchPlan() {
      this.planLoading = true
      getPlanItems({
        mtid: this.currentNode,
        typeId: ''
      })
        .then(res => {
          if (res.data.Code) {
            const data = res.data.Data
            if (data.Img) {
              if (data.Img.indexOf('http') > -1) {
                this.planBgImg = data.Img
              } else {
                // 兼容老版本
                this.planBgImg = _host + data.Img
              }
            } else {
              this.planBgImg = 'no-img'
              canvas && canvas.clear()
            }

            let icons = [
              ...new Set(data.List.map(item => item.Icon)),
              ...['device', 'point']
            ] // 添加两个默认图标
            this.iconImgs = icons.map(
              item =>
                `https://plan-img.oss-cn-shanghai.aliyuncs.com/icon/${item}.png`
            )

            // 先预加载icon图标
            preloadImg(this.iconImgs)
              .then(() => {})
              .catch(err => {
                console.error(err)
              })
              .finally(() => {
                this.$nextTick(() => {
                  this.elementList = data.List
                  this.initCanvas()
                })
              })
          } else {
            this.planBgImg = 'no-img'
            canvas && canvas.dispose()
            this.elementList = []
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.planLoading = false
        })
    },
    // 上传图片完成
    handleUpload(data) {
      if (data.res) {
        setPlanBg({
          url: data.url[0],
          mtid: this.currentNode
        })
          .then(() => {
            this.fetchPlan()
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.$refs.uploadDialog.toggleDialog()
          })
      }
    },
    // 删除平面图底图
    deletePlanBg() {
      if (this.elementList.length) {
        this.$message('平面图上还有元素，不能删除底图')
        return false
      }
      this.$confirm('确认要删除平面图的底图?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteImg(this.currentNode)
          .then(res => {
            let data = JSON.parse(res.data)
            if (data.flag === '00') {
              this.planBgImg = ''
              this.fetchPlan()
            } else {
              this.$message.error('删除失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('删除失败')
          })
      })
    },
    // 加载可配置的点位、设备
    fetchSource() {
      this.sourceLoading = true
      getUndistr(this.currentNode)
        .then(res => {
          if (res.data.Code === 200) {
            this.sourceData = res.data.Data
            this.sourceData.forEach(item => {
              item.icon = `https://plan-img.oss-cn-shanghai.aliyuncs.com/icon/${item.icon}.png`
            })
          } else {
            this.sourceData = []
          }
        })
        .catch(err => {
          console.error(err)
          this.sourceList = []
        })
        .finally(() => {
          this.sourceLoading = false
        })
    },

    videoDialogClose() {
      this.currentVideoUrl = ''
    },
    openVideoDialog(url) {
      this.currentVideoUrl = url
      this.videoDialogVisible = true
      this.$nextTick(() => {
        let videoObject = {
          container: '#video', // “#”代表容器的ID，“.”或“”代表容器的class
          variable: 'player', // 该属性必需设置，值等于下面的new chplayer()的对象
          flashplayer: false, // 如果强制使用flashplayer则设置成true
          autoplay: true,
          video: this.currentVideoUrl // 视频地址
        }
        // eslint-disable-next-line new-cap
        new ckplayer(videoObject)
      })
    },

    // 拖动后更新平面图
    upDatePlan(form) {
      updateArea(form)
        .then(res => {
          let data = JSON.parse(res.data)
          if (data.flag !== '00') {
            this.$message.error('平面图更新失败，请刷新页面')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('平面图更新失败，请刷新页面')
        })
    },
    // 定时更新
    regularlyUpdate() {
      this.timer && clearInterval(this.timer)
      getPlanItems({
        mtid: this.currentNode,
        typeId: ''
      })
        .then(res => {
          if (res.data.Code) {
            const data = res.data.Data
            this.elementList = data.List
            canvas.forEachObject(obj => {
              if (obj.type === 'elementGroup') {
                const temp = this.elementList.find(
                  element =>
                    element.Mtid + element.PointId ===
                    obj.payload.Mtid + obj.payload.PointId
                )
                if (temp) {
                  let options = {}
                  if (!temp.Child && temp.Camera) {
                    // 摄像头
                    options.tooltipText = temp.Area + ': ' + temp.Name
                    temp.type = 'camera'
                  } else if (!temp.Child && !temp.Camera) {
                    // 点位
                    options.signText = temp.Valit
                    options.tooltipText = temp.Name
                    temp.type = 'point'
                  } else if (temp.Child) {
                    // 设备
                    options.tooltipText = `[ ${temp.Name} ]`
                    temp.Child.forEach(child => {
                      options.tooltipText += `\n${child.Name}：${child.Valit}`
                    })
                    temp.type = 'device'
                  }
                  options.color = this.handleColor(temp)
                  options.payload = temp
                  elementUpdate(obj, options)
                }
              }
            })
          } else {
            this.elementList = []
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 判断要显示的颜色
    handleColor(data) {
      switch (data.status) {
        case '1': // 在线
          return '#339999'
        case '0': // 在线
          return '#cccccc'
        case '-1': // 在线
          return '#ac9999'
        default:
          return '#339999'
      }
    },
    handleResize() {
      this.initCanvas()
    }
  }
}

/**
 * 生成平面图的Element
 * @params {id} 唯一标识
 * @params {size} 大小
 * @params {left} 定位
 * @params {top} 定位
 * @params {imgId} 图标图片对应的 html 元素的class
 * @params {signText} 图标右侧显示的文字
 * @params {tooltipText} tooltip的文字
 * @params {color} 颜色
 * @params {payload} 额外的数据
 * @params {editable} 是否可编辑
 * @params {zoom} 缩放倍数
 */
function elementFactor({
  id,
  size,
  left,
  top,
  imgId,
  signText,
  tooltipText,
  color,
  payload,
  editable = false,
  zoom
}) {
  let collection = []
  var img = new fabric.Image(document.getElementById(imgId), {
    left: size * 0.5 - (size * 0.6) / 2,
    top: size * 0.5 - (size * 0.6) / 2
  })
  img.scaleToWidth(size * 0.6)
  img.scaleToHeight(size * 0.6)
  let text = null
  if (signText) {
    text = new fabric.Text(` ${signText} `, {
      left: size,
      type: 'text',
      top: 2,
      fill: color,
      backgroundColor: '#ffffff',
      fontSize: 14
    })
  }

  let rect = new fabric.Rect({
    type: 'rect',
    width: text ? size + text.width + 2 : size,
    height: size,
    fill: color,
    rx: size / 6,
    ry: size / 6
    // strokeWidth: 1,
    // stroke: '#ccc',
    // strokeDashArray: [size, size, size * 2] // 右边不要边框
  })

  let triangleNum = ELEMENT_SIZE
  let triangle = new fabric.Triangle({
    type: 'triangle',
    top: size * 0.3,
    left: rect.width * 0.5 - triangleNum / 2,
    width: triangleNum,
    height: triangleNum,
    flipY: true,
    fill: color
  })

  if (signText) {
    collection = [rect, triangle, img, text]
  } else {
    collection = [rect, triangle, img]
  }
  let group = new fabric.Group(collection, {
    left: left,
    top: top,
    type: 'elementGroup',
    id,
    size,
    tooltipText: tooltipText,
    payload,
    selectable: editable,
    hasControls: editable,
    hasBorders: false,
    hoverCursor: 'pointer',
    originX: 'center',
    originY: 'bottom'
  })
  group.customiseCornerIcons({
    settings: {
      // borderColor: 'black',
      cornerSize: 18,
      cornerShape: 'circle',
      cornerPadding: 5
    },
    tr: {
      icon: 'https://plan-img.oss-cn-shanghai.aliyuncs.com/icon/remove.svg',
      settings: {
        cornerBackgroundColor: '#f5222d'
      }
    }
  })
  group.setControlsVisibility({
    // 隐藏部分控制器
    mt: false,
    mb: false,
    ml: false,
    mr: false,
    bl: false,
    br: false,
    tl: false,
    mtr: false
  })
  if (zoom) {
    group.scale(zoom)
  }
  return group
}

function elementUpdate(group, options) {
  if (options.hasOwnProperty('editable')) {
    if (options.editable) {
      group.set({
        selectable: true,
        hasControls: true
      })
    } else {
      group.set({
        selectable: false,
        hasControls: false
      })
    }
    return false // 如果只是更改编辑状态的话，应该不会更新其它内容
  }
  if (options.tooltipText) {
    group.tooltipText = options.tooltipText
  }
  group.payload = options.payload
  group.forEachObject(item => {
    if (options.hasOwnProperty('signText')) {
      if (item.type === 'text') {
        item.set({
          text: ` ${options.signText} `
        })
        const rectObj = group.getObjects().find(item2 => item2.type === 'rect')
        rectObj.set({
          width: group.size + item.width + 2
        })
      }
    }
    if (options.hasOwnProperty('color')) {
      if (item.type === 'rect') {
        item.set({
          fill: options.color
        })
      }
      if (item.type === 'text') {
        item.set({
          fill: options.color
        })
      }
      if (item.type === 'triangle') {
        item.set({
          fill: options.color
        })
      }
    }
  })
}
/**
 * 生成一个tooltip group
 * @params {targetId} 目标obj的id
 * @params {text} 显示的文字
 * @params {targetTop} 目标obj的top属性
 * @params {targetLeft} 目标obj的left属性
 * @params {zoom} 整个canvas的缩放级别
 * @params {offset} 出现位置的偏移量
 * @params {padding} padding属性
 */
function toolTipFactor({
  targetId,
  text,
  targetTop,
  targetLeft,
  zoom = 1,
  offset = 40,
  padding = 10
}) {
  var textObj = new fabric.Text(text, {
    fill: '#ffffff',
    fontSize: 12,
    lineHeight: 1.5,
    left: padding,
    top: padding
  })
  var bgRect = new fabric.Rect({
    width: textObj.width + padding * 2,
    height: textObj.height + padding * 2,
    fill: '#303133',
    rx: 5,
    ry: 5
    // strokeWidth: 1,
    // stroke: '#ccc',
  })
  const group = new fabric.Group([bgRect, textObj], {
    type: 'tooltipGroup',
    targetId,
    targetTop,
    targetLeft,
    selectable: false,
    hasControls: false,
    hasBorders: false,
    originX: 'center',
    originY: 'bottom'
  })
  group.set('left', targetLeft)
  group.set('top', targetTop - offset * (1 / zoom))
  group.scale(1 / zoom)

  return group
}
// base64 转 Blob
export const dataURItoBlob = dataURI => {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length)

  // create a view into the buffer
  var ia = new Uint8Array(ab)

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString })
  return blob
}

// 获取当前的系统型号
function getOS() {
  var agent = navigator.userAgent.toLowerCase()
  var isMac = /macintosh|mac os x/i.test(navigator.userAgent)
  if (agent.indexOf('win32') >= 0 || agent.indexOf('wow32') >= 0) {
    // 这是windows32位系统"
    return 'window'
  }
  if (agent.indexOf('win64') >= 0 || agent.indexOf('wow64') >= 0) {
    // 这是windows64位系统"
    return 'window'
  }
  if (isMac) {
    return 'mac'
  }
}
</script>

<style lang="scss" scoped>
.plan-container,
.outer-container {
  width: 100vw;
  height: 100vh;
}

.outer-container {
  position: relative;
  overflow: hidden;
}

.inner-container {
  position: absolute;
  left: 0;
  overflow-x: scroll;
  overflow-y: scroll;
}

.plan-container::-webkit-scrollbar {
  display: none;
}

.plan-page {
  .no-plan {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    padding: 100px 200px;
    background: #f0f2f5;
    border-radius: 20px;
    .icon {
      font-size: 100px;
    }
    div {
      font-size: 16px;
      color: rgb(153, 153, 153);
      margin-top: 15px;
    }
  }
  .bottom-tool-box {
    position: fixed;
    bottom: 10px;
    right: 20px;
    display: flex;
    align-items: center;
    transition: right 0.25s ease-out;
    .icon {
      font-size: 20px;
      padding: 10px 15px;
      cursor: pointer;
      color: rgb(159, 162, 168);
      user-select: none;
      &:hover {
        color: #1890ff;
      }
    }
    .zoom-input {
      width: 40px;
      text-align: center;
      cursor: pointer;
      color: #6e747d;
      &:hover {
        color: #1890ff;
      }
    }
  }
  .legend-wrap {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 99;
    font-size: 12px;
    line-height: 16px;
    color: #314659;
    .legend-item {
      &::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        margin-right: 6px;
        border-radius: 50%;
      }
      &.normal {
        &:before {
          background: #339999;
        }
      }
      &.offline {
        &::before {
          background: #d3dce6;
        }
      }
      &.alarm {
        &::before {
          background: #ff4949;
        }
      }
    }
  }
}

.plan-source-list {
  position: fixed;
  right: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  transform: translateX(260px);
  transition: transform 0.25s ease-out;
  background: #fff;
  z-index: 100;
  // border-left: 1px solid rgba(0,0,0,.07);
  padding: 0 0px 10px 10px;

  &:hover {
    .indicator {
      opacity: 1;
    }
  }

  &.open {
    transform: translateX(0) !important;
    .filter-wrap {
      display: flex;
      align-items: center;
    }
  }
  &.hidden {
    transform: translateX(275px) !important;
  }
  &.close {
    .indicator {
      opacity: 1;
    }
    .indicator-wrap {
      &:hover {
        .indicator {
          &::before {
            transform: rotate(30deg);
          }
          &::after {
            transform: rotate(-30deg);
          }
        }
      }
    }
  }
  .filter-wrap {
    display: none;
    padding-top: 10px;
    margin-right: 10px;
    border-top: 1px solid #eee;
  }
  .header-wrap {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #eee;
    margin-bottom: 5px;
    margin-right: 10px;
  }
  .indicator-wrap {
    position: absolute;
    left: -10px;
    top: 0;
    width: 10px;
    height: 100%;
    border-right: 1px solid rgba(0, 0, 0, 0.07);
    &:hover {
      border-right-color: #3da8f5;
      .indicator {
        background-color: #3da8f5;
        &::before {
          transform: rotate(-30deg);
        }
        &::after {
          transform: rotate(30deg);
        }
      }
    }
  }
  .indicator {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 14px;
    height: 30px;
    background-color: #ccc;
    opacity: 0;
    border-radius: 4px 0 0 4px;
    cursor: pointer;
    transition-property: background-color, opacity;
    transition-timing-function: ease-in-out;
    transition-duration: 200ms;
    &::before {
      content: '';
      display: block;
      position: relative;
      bottom: -1px;
      width: 2px;
      height: 8px;
      background-color: #fff;
      border-radius: 1px;
      transition: all 300ms ease-in-out;
    }
    &::after {
      content: '';
      display: block;
      position: relative;
      width: 2px;
      height: 8px;
      background-color: #fff;
      border-radius: 1px;
      transition: all 300ms ease-in-out;
    }
  }
  .list {
    height: calc(100vh - 100px);
    overflow-y: auto;
  }
  .list-item {
    display: flex;
    align-items: center;
    .item-name {
      flex: 1;
      padding: 12px 10px 12px 0;
      margin-left: 10px;
      border-bottom: 1px solid #f5f5f5;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    img {
      width: 12px;
      height: 12px;
      user-select: none;
    }
    .plan-item-icon {
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border-radius: 4px;
      background: #339999;
      cursor: move;
      user-select: none;
    }
  }
}
</style>

<style lang="scss">
.plan-more-dropdown {
  padding: 0;
  overflow: initial;
  max-height: initial;
}
.plan-hotkey-wrap {
  padding: 0;
  box-shadow: 0 2px 2px 0px rgba(40, 120, 255, 0.1),
    0 0px 2px rgba(0, 0, 0, 0.12);
  border-radius: 3px;
  font-size: 15px;
  // .hotkey-wrap {
  // }
  .hotkey-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 42px;
    line-height: 42px;
    padding: 0 15px;
    &:hover {
      background: #f7f7f7;
    }
  }
  .hotkey {
    border-radius: 4px;
    background-color: rgb(255, 255, 255);
    color: #111;
    border: solid 1px rgba(14, 23, 38, 0.18);
    padding: 1px 6px;
    margin: 0 2px;
    font-size: 15px;
    display: inline-block;
    line-height: 16px;
  }
}
.video-dialog {
  width: 735px;
  border-radius: 4px;
  overflow: hidden;
  .el-dialog__body {
    padding: 0;
  }
  .el-dialog__header {
    padding: 0;
  }
}
</style>
