<template>
  <div class="relicBasicInfo-drawing">
    <div class="panel-header">
      <span class="title">
        图纸信息
      </span>
      <el-button
        style="padding: 3px 8px;"
        @click.native="handleClickEdit"
        size="mini"
        plain
        v-permission="[28]"
      >
        <c-svg name="bianji"></c-svg>
        编辑</el-button
      >
    </div>
    <div v-show="list.length" style="margin: 0 30px;">
      <div class="swiper-container2">
        <div id="relicBasicInfo-drawings" class="swiper-wrapper">
          <div
            v-for="(item, index) in list"
            :key="item + index"
            class="swiper-slide"
            :style="{ width: calcWidth(item) }"
          >
            <img :src="item" style="width: 100%; height: 100%;" alt="" />
          </div>
        </div>
        <div class="swiper-scrollbar swiper-scrollbar2"></div>
      </div>
    </div>

    <ImageListDialog
      :isCropper="false"
      @change="handleImgChange"
      ref="imageListDialog"
    />
  </div>
</template>

<script>
import ImageListDialog from './ImageListDialog'
import { updateModelInfo } from '@/api/modelInfo'
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import Swiper from 'swiper'
import 'swiper/css/swiper.min.css'
export default {
  props: {
    systemId: String,
    projectId: Number,
    imgList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  components: {
    ImageListDialog
  },
  data() {
    return {
      list: []
    }
  },
  watch: {
    imgList(val) {
      this.list = val
    },
    list() {
      this.$nextTick(() => {
        if (this.viewer) {
          this.viewer.destroy()
        }
        new Swiper('.swiper-container2', {
          slidesPerView: 'auto',
          spaceBetween: 20,
          loop: false,
          freeMode: true,
          scrollbar: {
            el: '.swiper-scrollbar2'
          },
          mousewheel: true
        })

        this.viewer = new Viewer(
          document.getElementById('relicBasicInfo-drawings')
        )
      })
    }
  },
  methods: {
    handleClickEdit() {
      this.$refs.imageListDialog.openDialog(this.list)
    },
    handleImgChange(val) {
      updateModelInfo({
        projectId: this.projectId,
        modelId: this.systemId,
        Drawing: val
      })
        .then(res => {
          this.list = val
          if (res.data.Code !== 200 || res.data.Data.IsSuccess !== true) {
            this.$message.error('更新失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('更新失败')
        })
    },
    getWidthHeight(url) {
      // https://cdn.sinocold.net/开发/cultural_relic/3761662923fb419299428166fec5d192$dbQJ4W0BMH2_cNUggUZT&500*333.jpg
      const filename = url.substring(url.lastIndexOf('/') + 1).split('.')[0]
      const str = filename.split('&')[1]
      const [width, height] = str.split('*')
      return {
        width,
        height
      }
    },
    calcWidth(url) {
      const { width, height } = this.getWidthHeight(url)
      return (width / height) * 270 + 'px'
    }
  }
}
</script>

<style lang="scss">
.relicBasicInfo-drawing {
  overflow: hidden;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 4px;
  padding: 16px 0;
  .panel-header {
    display: flex;
    align-items: center;
    padding: 0 30px 16px 30px;
    .title {
      font-size: 16px;
      font-weight: 500;
      margin-right: 15px;
    }
  }
  .swiper-container2 {
    position: relative;
    height: 270px;
    overflow: hidden;
    background-color: #fff;
  }
  .swiper-pagination2 {
    text-align: center;
  }
  .swiper-slide {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 300ms;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    overflow: hidden;
  }
}
</style>
