<template>
  <div class="relicBasicInfo-swiper">
    <div class="panel-header">
      <span class="title">
        参考图片
      </span>
      <el-button
        style="padding: 3px 8px;"
        @click.native="handleClickEdit"
        size="mini"
        v-permission="[28]"
        plain
      >
        <c-svg name="bianji"></c-svg>
        编辑</el-button
      >
    </div>

    <div v-show="list.length" style="width: 1050px;margin: 0 auto;">
      <el-carousel :interval="4000" type="card" height="295px">
        <el-carousel-item v-for="(item, index) in list" :key="item + index">
          <img :src="item" style="width: 100%; height: 100%;" alt="" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <ImageListDialog @change="handleImgChange" ref="imageListDialog" />
  </div>
</template>

<script>
import ImageListDialog from './ImageListDialog'
import { updateModelInfo } from '@/api/modelInfo'
import Viewer from 'viewerjs'
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
      if (this.viewer) {
        this.viewer.destroy()
      }
      this.$nextTick(() => {
        this.viewer = new Viewer(
          document.querySelector(
            '.relicBasicInfo-swiper .el-carousel__container'
          )
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
        ReferencePictures: val
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
    }
  }
}
</script>

<style lang="scss">
.relicBasicInfo-swiper {
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
}
</style>
