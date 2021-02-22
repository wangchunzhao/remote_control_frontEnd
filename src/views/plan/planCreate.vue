<template>
  <div>
    <page-header class="planCreate-page-header" title="平面图编辑" showBack>
      <template v-slot:right>
        <div class="right-wrap">
          <el-button
            type="primary"
            size="mini"
            @click.native="
              $router.back({
                query: {
                  mtid: currentNode.mtid,
                  tabIndex: $route.query.tabIndex
                }
              })
            "
          >
            <c-svg name="save" />
            保存
          </el-button>
          <el-button type="primary" size="mini" @click.native="deleteImg">
            <i class="el-icon-delete" />
            删除底图
          </el-button>
          <el-upload
            :before-upload="beforeProImgUpload"
            class="plan-bgupload"
            action="2333"
            accept="image/png,image/jpg,image/jpeg"
          >
            <el-button type="primary" size="mini" style="margin-left: 10px;">
              <c-svg name="cloud-upload" />
              修改底图
            </el-button>
          </el-upload>
        </div>
      </template>
    </page-header>
    <div class="planCreate">
      <div class="planCreate-content">
        <div
          v-loading="planLoading"
          class="plan-wrap thin-scroll bg-fff"
          element-loading-text="加载中..."
        >
          <!-- 定义一个隐藏的div存放上传的图片（为了获取图片的长宽信息） -->
          <div
            class="hidden-img-wrap"
            style="position:fixed;top:1000000000px"
          />
          <div
            class="target"
            @dragover="targetWrapDragOver"
            @drop="targetWrapDrop"
            :style="{
              'background-image': planBgImg
                ? `url(${planBgImg})`
                : `url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)`
            }"
          >
            <a
              v-for="item in targetData"
              :key="item.Mtid + item.PointId"
              :title="`${item.Area ? item.Area + '-' : ''}${item.Name}`"
              :style="{ left: item.LocX, top: item.LocY, position: 'absolute' }"
              class="drag-item"
              draggable="true"
              @dragstart="e => targetDargStart(e, item)"
            >
              <svg class="icon plan-device-icon" aria-hidden="true">
                <use
                  :xlink:href="`#icon-${getIcon(item, 'target')}`"
                ></use></svg
            ></a>
          </div>
        </div>
        <div
          v-loading="sourceLoading"
          class="component-wrap bg-fff"
          @dragover="componentWrapDragOver"
          @dragenter="componentWrapDragEnter"
          @drop="componentWrapDrop"
          element-loading-text="加载中..."
        >
          <div class="title-wrap">
            <span class="text">&nbsp;可配置设备/点位</span>
            <el-tooltip
              class="item"
              effect="dark"
              content="拖拽将设备/点位放入图中"
              placement="top"
            >
              <c-svg
                name="what"
                style="margin-left:10px;font-size:15px;color:#1890FF;"
              />
            </el-tooltip>
          </div>
          <el-input
            size="small"
            clearable
            style="margin: 6px 12px;width: auto;"
            placeholder="搜索设备/点位"
            suffix-icon="el-icon-search"
            v-model="filterText"
          >
          </el-input>
          <el-tabs v-model="tabActiveName">
            <el-tab-pane label="设备" name="device">
              <div class="config-component-list thin-scroll">
                <el-tree
                  ref="tree"
                  :data="generateDeviceTree(deviceList)"
                  node-key="mtid"
                  :props="deviceTreeProps"
                  :expand-on-click-node="false"
                  default-expand-all
                >
                  <span
                    @dragend="() => (delIconVisible = false)"
                    slot-scope="{ node, data }"
                    draggable
                    @dragstart="
                      e => {
                        if (data.type !== 'groupNode') {
                          sourceDargStart(e, data)
                        }
                      }
                    "
                    class="node-item"
                  >
                    <span>
                      <c-svg
                        v-if="data.type === 'groupNode'"
                        :name="data.icon"
                      ></c-svg>
                      <span>{{ node.label }}</span>
                    </span>
                  </span>
                </el-tree>
                <div
                  v-if="!sourceDeviceList.length"
                  style="color:#5e7382;text-align:center;padding-top:30px;"
                >
                  暂无可选设备
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="点位" name="point">
              <div class="config-component-list thin-scroll">
                <a
                  v-for="item in pointList"
                  :key="item.id + item.mtid"
                  @dragstart="e => sourceDargStart(e, item)"
                  @dragend="() => (delIconVisible = false)"
                  :title="`${item.Area ? item.Area + '-' : ''}${item.name}`"
                  class="drag-item"
                  draggable="true"
                >
                  <span class="drag-icon">
                    <svg class="icon temp-icon" aria-hidden="true">
                      <use
                        :xlink:href="`#icon-${getIcon(item, 'source')}`"
                      /></svg
                  ></span>
                  <span class="text">{{
                    `${item.Area ? item.Area + '-' : ''}${item.name}`
                  }}</span>
                </a>
                <div
                  v-if="!pointList.length"
                  style="color:#5e7382;text-align:center;padding-top:30px;"
                >
                  暂无可选点位
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
          <transition name="el-zoom-in-center">
            <div v-if="delIconVisible" class="delete-icon">
              <i class="el-icon-delete" />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  deleteInfo,
  updateArea,
  uploadImg,
  getUndistr,
  getDistr,
  deleteImg
} from '@/api/planNew'
import { randomString } from '@/utils/index'
import { uploadFile } from '@/api/uploader'

export default {
  data() {
    return {
      deviceTreeProps: {
        children: 'children',
        label: 'name'
      },
      currentNode: {
        mtid: ''
      },
      planBgImg: '',
      planLoading: false,
      targetData: [],
      tabActiveName: 'device',
      filterText: '',
      sourceLoading: false,
      sourcePointList: [],
      sourceDeviceList: [],
      elDrag: null,
      delIconVisible: false
    }
  },
  computed: {
    deviceList() {
      return this.sourceDeviceList.filter(v => {
        return (
          `${v.Area ? v.Area + '-' : ''}${v.name}`.indexOf(this.filterText) > -1
        )
      })
    },
    pointList() {
      return this.sourcePointList.filter(v => {
        return (
          `${v.Area ? v.Area + '-' : ''}${v.name}`.indexOf(this.filterText) > -1
        )
      })
    }
  },
  mounted() {
    this.currentNode.mtid = this.$route.query.mtid
    this.fetchPlan()
    this.fetchSource()
  },
  methods: {
    // 点击上传图片
    beforeProImgUpload(file) {
      this.planBgImg = ''
      if (!this.currentNode.mtid) {
        this.$message('请选中位置后再添加底图')
        return
      }
      let formData = new FormData()
      formData.append('file', file)
      formData.append('BucketName', 'front-end-assets')
      formData.append('ObjectName', `plan/backgroundImg/`)
      let reader = new FileReader()
      let that = this
      reader.onload = function() {
        var oImg = new Image()
        oImg.src = this.result
        document.querySelector('.hidden-img-wrap').appendChild(oImg)
        oImg.onload = () => {
          const width = oImg.offsetWidth
          const height = oImg.offsetHeight
          that.initPlanWrapSize(width, height)
          uploadFile(formData).then(res => {
            if (res.data.Code === 200) {
              const imgUrl = res.data.Data[0]

              uploadImg({
                img: imgUrl,
                id: that.currentNode.mtid,
                height,
                width
              }).then(res2 => {
                const data = JSON.parse(res2.data)
                if (data.flag === '00') {
                  that.planBgImg = imgUrl
                  that.$message.success('底图设置成功')
                } else {
                  that.$message.error('底图设置失败')
                }
              })
            } else {
              that.$message.error('图片上传失败')
            }
          })
          document.querySelector('.hidden-img-wrap').removeChild(oImg)
        }
      }
      reader.readAsDataURL(file)
      return false
    },
    // 删除底图
    deleteImg() {
      this.$confirm('确认要删除底图?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteImg(this.currentNode.mtid)
          .then(res => {
            let data = JSON.parse(res.data)
            if (data.flag === '00') {
              this.planBgImg = ''
            }
          })
          .catch(err => {
            console.error(err)
          })
      })
    },
    generateDeviceTree(deviceList) {
      const tree = []
      deviceList.forEach(v => {
        let temp = tree.find(vv => vv.smallTypeId === v.SmallTypeId)
        if (temp) {
          temp.children.push(v)
        } else {
          tree.push({
            type: 'groupNode',
            smallTypeId: v.SmallTypeId,
            mtid: randomString(10),
            children: [],
            name: v.SmallTypeName,
            icon: v.icon
          })
        }
      })
      return tree
    },
    sourceDargStart(event, data) {
      if (!this.planBgImg) {
        this.$message('请先上传底图！')
        return false
      }
      // 保存拖动元素的引用
      this.elDrag = event.target
      event.dataTransfer.effectAllowed = 'move' // 仅能在 dragstart 事件中设置该属性，其他事件中设置均无效。
      event.dataTransfer.setData(
        'payload',
        JSON.stringify({
          operationType: 'add',
          deviceId: data.mtid,
          pointId: data.id,
          Name: data.name,
          type: data.type,
          icon: data.icon,
          offsetX: event.offsetX,
          // 记录鼠标点击位置相对触发事件元素左上角的位置
          offsetY: event.offsetY
        })
      )
    },
    targetDargStart(event, data) {
      if (!this.planBgImg) {
        this.$message('请先上传底图！')
        return false
      }
      // 保存拖动元素的引用
      this.elDrag = event.target
      event.dataTransfer.effectAllowed = 'move' // 仅能在 dragstart 事件中设置该属性，其他事件中设置均无效。
      event.dataTransfer.setData(
        'payload',
        JSON.stringify({
          operationType: 'update',
          deviceId: data.Mtid,
          pointId: data.PointId,
          Name: (data.Area ? data.Area + '-' : '') + data.Name,
          type: data.Type,
          icon: data.Icon,
          offsetX: event.offsetX,
          // 记录鼠标点击位置相对触发事件元素左上角的位置
          offsetY: event.offsetY
        })
      )
    },
    targetWrapDragOver(event) {
      // 阻止默认动作
      event.preventDefault()
      return true
    },
    targetWrapDrop(event) {
      // 调用 preventDefault() 来避免浏览器对数据的默认处理（drop 事件的默认行为是以链接形式打
      event.preventDefault()
      if (event.target.className === 'target') {
        let wrap = document.querySelector('.plan-wrap .target')
        const payload = JSON.parse(event.dataTransfer.getData('payload'))
        const locX =
          ((event.offsetX - payload.offsetX) /
            ~~wrap.style.width.replace('px', '')) *
            100 +
          '%'
        const locY = ((event.offsetY - payload.offsetY) / 768) * 100 + '%'
        if (payload.operationType === 'add') {
          // 新增操作
          this.targetData.push({
            Mtid: payload.deviceId,
            PointId: payload.pointId,
            Name: payload.name,
            LocX: locX,
            LocY: locY,
            Type: payload.type,
            Icon: payload.icon
          })
          let deviceList = []
          let pointList = []
          this.sourceDeviceList.forEach(v => {
            if (v.mtid == payload.deviceId && v.id == payload.pointId) {
              return
            }
            deviceList.push(v)
          })
          this.sourcePointList.forEach(v => {
            if (v.mtid == payload.deviceId && v.id == payload.pointId) {
              return
            }
            pointList.push(v)
          })
          this.sourceDeviceList = deviceList
          this.sourcePointList = pointList
        } else if (payload.operationType === 'update') {
          const index = this.targetData.findIndex(
            v => v.Mtid === payload.deviceId && v.PointId === payload.pointId
          )
          this.targetData[index].LocX = locX
          this.targetData[index].LocY = locY
          this.$set(this.targetData, index, this.targetData[index])
        }

        let data = {}
        data.mtid = payload.deviceId
        // payload.type === 1 是设备，没有点位 id
        data.point = payload.type === 1 ? undefined : payload.pointId
        data.locX = locX
        data.locY = locY
        this.upDatePlan(data)
      }
    },
    componentWrapDragOver(event) {
      event.preventDefault()
      return true
    },
    componentWrapDragEnter() {
      const wrap = document.querySelector('.component-wrap')
      if (wrap.contains(this.elDrag)) {
        // 如果触发事件的元素是deleteZone的子元素，则不触发
        return
      }
      this.delIconVisible = true
    },
    componentWrapDrop(event) {
      const wrap = document.querySelector('.component-wrap')
      if (wrap.contains(this.elDrag)) {
        // 如果触发事件的元素是wrap的子元素，则不触发
        return
      }
      try {
        const payload = JSON.parse(event.dataTransfer.getData('payload'))
        if (payload.operationType === 'update') {
          let data = {}
          data.mtid = payload.deviceId
          data.point = payload.type === 1 ? undefined : payload.pointId
          this.deletePalnItem(data)

          let list = []
          this.targetData.forEach(v => {
            if (v.Mtid == payload.deviceId && v.PointId == payload.pointId) {
              return
            }
            list.push(v)
          })
          this.targetData = list
          this.delIconVisible = false
        }
      } catch (err) {
        console.error(err)
      }
    },
    // 获取可配置设备列表
    fetchSource() {
      this.sourceLoading = true
      getUndistr(this.currentNode.mtid)
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data || []
            let deviceList = []
            let pointList = []
            data.forEach(v => {
              if (v.type === 1) {
                deviceList.push(v)
              } else {
                pointList.push(v)
              }
            })
            this.sourceDeviceList = deviceList
            this.sourcePointList = pointList
          } else {
            this.sourceDeviceList = []
            this.sourcePointList = []
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('服务器错误，可配置设备列表获取失败')
        })
        .finally(() => {
          this.sourceLoading = false
        })
    },
    // 获取已配置的设置
    fetchPlan() {
      this.structLoading = true
      this.planLoading = true
      getDistr(this.currentNode.mtid)
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.initPlanWrapSize(data.BgWidth, data.BgHeight)

            this.planBgImg = data.Img
              ? data.Img.indexOf('https://front-end-assets') > -1
                ? data.Img
                : global.PROJECT_URLPROD + data.Img
              : ''
            if (data.List.length) {
              this.targetData = data.List
            } else {
              this.targetData = []
            }
          } else {
            this.targetData = []
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.structLoading = false
          this.planLoading = false
        })
    },
    // 更新平面图
    upDatePlan(data) {
      updateArea(data)
        .then(res => {
          let data = JSON.parse(res.data)
          if (data.flag === '00') {
            this.$message({
              type: 'success',
              message: '平面图更新成功'
            })
          } else {
            this.$message.error('服务器错误，平面图更新失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('服务器错误，平面图更新失败')
        })
    },
    deletePalnItem(data) {
      deleteInfo(data)
        .then(res => {
          let data = JSON.parse(res.data)
          if (data.flag === '00') {
            this.fetchSource()
            this.$message({
              type: 'success',
              message: '删除成功'
            })
          } else {
            this.$message.error('删除失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('删除失败')
        })
    },
    getIcon(data, type = 'source') {
      let icon = ''
      if (type === 'source') {
        icon = data.icon
        if (data.icon === 'default') {
          data.type === 2 && (icon = 'point')
          data.type === 1 && (icon = 'cube1')
        }
      } else {
        icon = data.Icon
        if (icon === 'default' || icon === '') {
          data.Type === 2 && (icon = 'point')
          data.Type === 1 && (icon = 'cube1')
        }
      }
      return icon
    },
    initPlanWrapSize(bgWidth, bgHeight) {
      let wrap = document.querySelector('.plan-wrap .target')
      wrap.style.width = bgWidth * (768 / bgHeight) + 'px'
    }
  }
}
</script>
<style lang="scss">
.planCreate-page-header {
  .right-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .plan-bgupload {
    .el-upload--text {
      width: auto;
      height: auto;
      border: none;
    }
  }
}
.planCreate {
  -moz-user-select: none;
  /* 为了拖拽的体验，禁止用户选中文字 */
  -webkit-user-select: none;
  -ms-user-select: none;
  -khtml-user-select: none;
  user-select: none;
  margin: 20px;
}
.planCreate-content {
  display: flex;
  .struct-wrap {
    flex: 0 0 300px;
    overflow: hidden;
  }
  .component-wrap {
    flex: 0 0 220px;
    .el-tabs__item {
      width: 50%;
      text-align: center;
    }
    .el-tabs__nav {
      float: none;
    }
    .title-wrap {
      font-size: 16px;
      padding: 12px;
    }
  }
  .struct-wrap,
  .component-wrap {
    border-radius: 4px;
    overflow: hidden;
  }
  .component-wrap {
    position: relative;
    .config-component-list {
      height: 620px;
      padding-left: 4px;
      overflow-y: auto;
      &:empty {
        height: 0;
      }
      .node-item {
        flex: 1;
        padding: 5 0;
        cursor: move;
      }
    }
    .drag-item {
      display: block;
      font-size: 14px;
      padding: 6px 0;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .icon {
      font-size: 20px;
      color: #1890ff;
      margin-right: 5px;
    }
    .drag-icon {
      cursor: move;
    }
    .delete-icon {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #eff2f7;
      i {
        font-size: 60px;
        text-shadow: 0 0 5px #fff;
        color: #ff4949;
      }
    }
  }
  .plan-wrap {
    flex: 1;
    position: relative;
    margin: 0 10px;
    border-radius: 4px;
    overflow: auto;
    .target {
      width: 1366px;
      position: relative;
      margin: auto;
      height: 768px;
      background-repeat: no-repeat;
      background-position-x: center;
      background-size: auto 768px;
    }
    .drag-item {
      position: relative;
      cursor: move;
      .point {
        width: 15px;
        height: 15px;
        display: inline-block;
        border-radius: 50%;
        background: #82d0ea;
      }
      .text {
        display: none;
      }
    }
    .plan-device-icon {
      font-size: 24px;
      color: #1890ff;
    }
    .temp-icon {
      display: none;
    }
  }
}
</style>
