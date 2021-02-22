<template>
  <div class="planCreate">
    <div class="planCreate-content">
      <div
        v-loading="planLoading"
        class="plan-wrap thin-scroll bg-fff"
        element-loading-text="加载中..."
      >
        <el-button
          type="primary"
          class="preview-btn"
          size="mini"
          @click.native="
            $router.back({
              query: { mtid: currentNode.mtid, tabIndex: $route.query.tabIndex }
            })
          "
        >
          <c-svg name="save" />
          保存
        </el-button>
        <el-button
          type="primary"
          class="delete-btn"
          size="mini"
          @click.native="deleteImg"
        >
          <i class="el-icon-delete" />
          删除底图
        </el-button>
        <el-upload
          :before-upload="beforeProImgUpload"
          class="plan-bgupload"
          action="2`333"
          accept="image/png,image/jpg,image/jpeg"
        >
          <el-button type="primary" size="mini" style="padding: 5px;">
            <c-svg name="cloud-upload" />
            修改底图
          </el-button>
        </el-upload>
        <!-- 定义一个隐藏的div存放上传的图片（为了获取图片的长宽信息） -->
        <div class="hidden-img-wrap" style="position:fixed;top:1000000000px" />
        <div
          class="target"
          :style="{
            'background-image': planBgImg
              ? `url(${planBgImg})`
              : `url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)`
          }"
        />
      </div>
      <div
        v-loading="sourceLoading"
        class="component-wrap bg-fff"
        element-loading-text="加载中..."
      >
        <div class="title-wrap">
          <h3>
            <span class="text">可配置设备/点位</span>
            <el-tooltip
              class="item"
              effect="dark"
              content="拖拽将设备/点位放入图中"
              placement="top"
            >
              <c-svg
                name="what"
                style="margin-left:10px;font-size:15px;color:#339999;"
              />
            </el-tooltip>
          </h3>
        </div>
        <div class="config-component-list thin-scroll" />
        <div
          v-if="!sourceData.length"
          style="color:#5e7382;text-align:center;padding-top:30px;"
        >
          暂无可配置设备
        </div>
        <transition name="el-zoom-in-center">
          <div v-if="delIconVisible" class="delete-icon">
            <i class="el-icon-delete" />
          </div>
        </transition>
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
import { uploadFile } from '@/api/uploader'
import { storageName } from '@/utils/index'

export default {
  data() {
    return {
      currentNode: {
        mtid: ''
      },
      planBgImg: '',
      planLoading: false,
      targetData: [],
      sourceLoading: false,
      sourceData: [],
      elDrag: null,
      left: '',
      top: '', // 记录鼠标点击位置相对触发事件元素左上角的位置
      delIconVisible: false,
      userId: JSON.parse(sessionStorage.getItem(storageName('userInfo'))).uid
    }
  },
  mounted() {
    this.currentNode.mtid = this.$route.query.mtid
    this.Drop()
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
    Drag() {
      let elDrags = document.querySelectorAll('.drag-item')
      for (let i = 0; i < elDrags.length; i++) {
        elDrags[i].addEventListener(
          'dragstart',
          event => {
            if (!this.planBgImg) {
              this.$message('请先上传底图！')
              return false
            }
            this.left = event.offsetX
            this.top = event.offsetY
            // 保存拖动元素的引用(ref.)
            this.elDrag = event.target
            event.dataTransfer.effectAllowed = 'move' // 仅能在 dragstart 事件中设置该属性，其他事件中设置均无效。
            event.dataTransfer.setData('text/plain', 'moveFromSource')
          },
          false
        )
        elDrags[i].addEventListener(
          'dragend',
          () => {
            this.delIconVisible = false
          },
          false
        )
      }
    },
    Drop() {
      let target = document.querySelector('.target')
      /* 只要元素正在合法的放置目标上拖动时，就执行脚本（对象是目标元素）*/
      target.addEventListener(
        'dragover',
        event => {
          // 阻止默认动作
          event.preventDefault()
          return true
        },
        false
      )
      // 将被拖拽元素放在目标元素内时运行脚本（对象是目标元素）只执行一次
      target.addEventListener(
        'drop',
        event => {
          // 调用 preventDefault() 来避免浏览器对数据的默认处理（drop 事件的默认行为是以链接形式打
          event.preventDefault()
          if (event.target.className === 'target') {
            let wrap = document.querySelector('.plan-wrap .target')
            this.elDrag.style.left =
              ((event.offsetX - this.left) /
                ~~wrap.style.width.replace('px', '')) *
                100 +
              '%'
            this.elDrag.style.top =
              ((event.offsetY - this.top) / 768) * 100 + '%'
            this.elDrag.style.position = 'absolute'
            let data = {}
            data.mtid = this.elDrag.getAttribute('data-mtid')
            data.point =
              this.elDrag.getAttribute('data-type') === '1'
                ? undefined
                : parseInt(this.elDrag.getAttribute('data-id'))
            data.locX = this.elDrag.style.left
            data.locY = this.elDrag.style.top
            event.target.appendChild(this.elDrag)
            this.upDatePlan(data)
          }
        },
        false
      )
      let deleteZone = document.querySelector('.component-wrap')
      deleteZone.addEventListener(
        'dragover',
        event => {
          event.preventDefault()
          return true
        },
        false
      )
      deleteZone.addEventListener(
        'dragenter',
        () => {
          if (deleteZone.contains(this.elDrag)) {
            // 如果触发事件的元素是deleteZone的子元素，则不触发
            return
          }
          this.delIconVisible = true
        },
        false
      )
      deleteZone.addEventListener(
        'drop',
        event => {
          if (deleteZone.contains(this.elDrag)) {
            // 如果触发事件的元素是deleteZone的子元素，则不触发
            return
          }
          let data = {}
          data.mtid = this.elDrag.getAttribute('data-mtid')
          data.point =
            this.elDrag.getAttribute('data-type') === '1'
              ? undefined
              : parseInt(this.elDrag.getAttribute('data-id'))
          this.deletePalnItem(data)
          if (event.target.className === 'component-wrap');
          {
            this.elDrag.parentNode.removeChild(this.elDrag)
          }
          this.delIconVisible = false
        },
        false
      )
    },
    // 获取可配置设备列表
    fetchSource() {
      this.sourceLoading = true
      getUndistr(this.currentNode.mtid)
        .then(res => {
          if (res.data.Code === 200) {
            this.sourceData = res.data.Data || []
            document.querySelector(
              '.config-component-list'
            ).innerHTML = this.renderDragDom(this.sourceData)
            this.Drag()
          } else {
            this.sourceData = []
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
              document.querySelector(
                '.target'
              ).innerHTML = this.renderTargetDom(this.targetData)

              this.Drag()
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
    renderTargetDom(data) {
      let domText = ''
      data.forEach(item => {
        let icon = item.Icon
        if (icon === 'default' || icon === '') {
          item.Type === 2 && (icon = 'point')
          item.Type === 1 && (icon = 'cube1')
        }
        domText += `<a title="${item.Area ? item.Area + '-' : ''}${
          item.Name
        }" style="left: ${item.LocX}; top: ${
          item.LocY
        }; position: absolute" data-mtid="${item.Mtid}" data-id="${
          item.PointId
        }" data-type="${item.Type}" class="drag-item" draggable="true">
                    <svg class="icon plan-device-icon" aria-hidden="true"><use xlink:href="#icon-${icon}"></use></svg></a>`
      })
      return domText
    },
    renderDragDom(data) {
      let domText = ''
      data.forEach(item => {
        let icon = item.icon
        if (item.icon === 'default') {
          item.type === 2 && (icon = 'point')
          item.type === 1 && (icon = 'cube1')
        }
        let id = item.type === 2 ? item.id : '0'
        domText += `<a title="${item.Area ? item.Area + '-' : ''}${
          item.name
        }" data-mtid="${
          item.mtid
        }" data-id="${id}" class="drag-item" draggable="true">
                    <span class="drag-icon"><svg class="icon temp-icon" aria-hidden="true"><use xlink:href="#icon-${icon}"></use></svg><span>
                    <span class="text">${
                      item.name
                    }</span><svg class="icon plan-device-icon" aria-hidden="true"><use xlink:href="#icon-${icon}"></use></svg></a>`
      })
      return domText
    },
    initPlanWrapSize(bgWidth, bgHeight) {
      let wrap = document.querySelector('.plan-wrap .target')
      wrap.style.width = bgWidth * (768 / bgHeight) + 'px'
    }
  }
}
</script>
<style lang="scss">
.planCreate {
  -moz-user-select: none;
  /* 为了拖拽的体验，禁止用户选中文字 */
  -webkit-user-select: none;
  -ms-user-select: none;
  -khtml-user-select: none;
  user-select: none;
  margin: 20px;
  @at-root {
    .planCreate-content {
      display: flex;
      .struct-wrap {
        flex: 0 0 300px;
        overflow: hidden;
      }
      .struct-content {
        height: 725px;
        padding: 15px 10px;
        overflow: auto;
        .el-tree {
          border: none;
          .icon {
            font-size: 16px;
            margin-right: 5px;
            color: #20a0ff;
          }
        }
      }
      .component-wrap {
        flex: 0 0 200px;
      }
      .struct-wrap,
      .component-wrap {
        border-radius: 4px;
        overflow: hidden;
      }
      .component-wrap {
        position: relative;
        .config-component-list {
          height: 755px;
          padding-left: 4px;
          overflow-y: auto;
          &:empty {
            height: 0;
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
          color: #339999;
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
        .plan-device-icon {
          display: none;
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
          color: #339999;
        }
        .temp-icon {
          display: none;
        }
      }
      .delete-btn {
        position: absolute;
        top: 10px;
        left: 84px;
        z-index: 10;
        padding: 5px;
      }
      .preview-btn {
        position: absolute;
        top: 10px;
        left: 180px;
        z-index: 10;
        padding: 5px;
      }
      .plan-bgupload {
        position: absolute;
        left: 10px;
        top: 10px;
        z-index: 10;
        .el-upload--text {
          width: auto;
          height: auto;
          border: none;
        }
      }
    }
  }
}
</style>
