<template>
  <el-dialog
    width="950px"
    custom-class="asset-detail"
    title="资产详情"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div class="section-title">
      基本信息
    </div>
    <div class="table">
      <div class="table-cell">
        <span class="cell-label">资产名称</span>
        <span class="cell-value">{{ basicInfo.ModelTreeName || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">资产编码</span>
        <span class="cell-value">{{ basicInfo.AssetsCode || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">资产分类</span>
        <span class="cell-value">{{ basicInfo.AssetsTypeName || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">型号</span>
        <span class="cell-value">{{ basicInfo.Type || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">出厂编号</span>
        <span class="cell-value">{{ basicInfo.SerialNumber || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">创建时间</span>
        <span class="cell-value">{{ basicInfo.CreateTime || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">项目</span>
        <span class="cell-value">{{ basicInfo.ProjectName || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">状态</span>
        <span class="cell-value">{{
          (statusMap.find(v => v.value === basicInfo.Status) || { text: '' })
            .text
        }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">修改时间</span>
        <span class="cell-value">{{ basicInfo.UpdateTime || '-' }}</span>
      </div>
    </div>
    <div class="divide"></div>
    <div class="section-title">
      安装信息
    </div>
    <div class="table">
      <div class="table-cell">
        <span class="cell-label">安装日期</span>
        <span class="cell-value">{{ basicInfo.InstallDate }}</span>
      </div>
      <template v-if="basicInfo.installInfo">
        <div
          :key="index"
          v-for="(key, index) in Object.keys(basicInfo.installInfo)"
          class="table-cell"
        >
          <span class="cell-label">{{ key }}</span>
          <span class="cell-value">{{ basicInfo.installInfo[key] }}</span>
        </div>
      </template>
    </div>
    <div
      v-if="basicInfo.AssetsType === 66"
      style="margin: 20px 0 16px 6px;color: rgba(0,0,0,0.65);"
    >
      安装图片
    </div>
    <div v-if="basicInfo.AssetsType === 66" class="install-images">
      <el-image
        class="install-image"
        v-for="image in basicInfo.imageList"
        :key="image.url"
        :src="image.url"
        :preview-src-list="basicInfo.imageList.map(v => v.url)"
      >
      </el-image>
    </div>
    <div
      v-if="basicInfo.AssetsType === 66"
      style="margin: 20px 0 16px 6px;color: rgba(0,0,0,0.65);"
    >
      附件文档
    </div>
    <template v-if="basicInfo.AssetsType === 66">
      <div v-for="(row, index) in basicInfo.docList" :key="index" class="table">
        <div class="table-cell">
          <span class="cell-label">型号</span>
          <span class="cell-value">{{ row.model }}</span>
        </div>
        <div class="table-cell">
          <span class="cell-label">内机数量</span>
          <span class="cell-value">{{ row.number }}</span>
        </div>
        <div class="table-cell">
          <span class="cell-label">设定温度（℃）</span>
          <span class="cell-value">{{ row.temp }}</span>
        </div>
      </div>
    </template>

    <div class="divide"></div>
    <div class="section-title">
      合同信息
    </div>
    <div class="table">
      <div class="table-cell">
        <span class="cell-label">销售合同号</span>
        <span class="cell-value">{{ basicInfo.ContractNo || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">经销商</span>
        <span class="cell-value">{{ basicInfo.DealerName || '-' }}</span>
      </div>
      <div class="table-cell">
        <span class="cell-label">客户名称</span>
        <span class="cell-value">{{ basicInfo.CustomerName || '-' }}</span>
      </div>
    </div>
    <span slot="footer">
      <el-button
        @click.native="() => (dialogVisible = false)"
        size="medium"
        plain
        >取 消</el-button
      >
      <el-button
        v-if="checkPermission([146])"
        @click.native="() => $refs.dialogAssetEdit.openDialog(basicInfo)"
        size="medium"
        type="primary"
        >修 改</el-button
      >
    </span>
    <DialogAssetEdit @complete="afterEdit" ref="dialogAssetEdit" />
  </el-dialog>
</template>

<script>
import DialogAssetEdit from './DialogAssetEdit'
import { getModelTreeExtend } from '@/api/assets'
import { checkPermission } from '@/utils/permissions'

export default {
  props: {
    id: {
      type: Number,
      default: function() {
        return 0
      }
    },
    statusMap: Array
  },
  components: {
    DialogAssetEdit
  },
  data() {
    return {
      dialogVisible: false,
      basicInfo: {},
      checkPermission
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      this.fetchData()
    },
    handleClose() {
      this.dialogVisible = false
    },
    afterEdit() {
      this.fetchData()
      this.$emit('complate')
    },
    fetchData() {
      getModelTreeExtend({
        modelTreeId: this.id
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.imageList = []
            data.docList = []
            data.installInfo = null
            if (data.JsonContent) {
              const JsonContent = JSON.parse(data.JsonContent)
              data.imageList = JsonContent.imageList
              data.docList = JsonContent.freezereList
              if (JsonContent.systemInfo['安装日期']) {
                delete JsonContent.systemInfo['安装日期']
              }
              data.installInfo = JsonContent.systemInfo
            }
            if (data.InstallDate === '0001-01-01 00:00:00') {
              data.InstallDate = '-'
            } else {
              data.InstallDate = this._dateFormat(
                data.InstallDate,
                'YYYY-MM-DD HH:mm'
              )
            }
            this.basicInfo = data
          } else {
            this.$message.error('资产详情获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('资产详情获取失败')
        })
    }
  }
}
</script>

<style lang="scss">
.asset-detail {
  .section-title {
    height: 24px;
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 24px;
    margin-bottom: 16px;
  }
  .table {
    display: flex;
    flex-wrap: wrap;
  }
  .table-cell {
    flex: 0 0 calc(100% / 3);
    display: flex;
    border-bottom: 1px solid rgba(0, 0, 0, 0.09);
    .cell-label {
      flex: 0 0 100px;
      padding: 10px 15px;
      line-height: 22px;
      font-weight: 500;
      background-color: rgba(0, 0, 0, 0.02);
    }
    .cell-value {
      padding: 10px 16px;
      line-height: 22px;
      flex: 1;
    }
  }
  .install-images {
    display: flex;
    flex-wrap: wrap;
    .install-image {
      width: 88px;
      height: 88px;
      margin-bottom: 10px;
      margin-right: 10px;
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.15);
      padding: 6px;
    }
  }
  .divide {
    height: 2px;
    background-color: #e8e8e8;
    margin: 24px 0;
  }
  .el-dialog__body {
    padding: 20px;
  }
}
</style>
