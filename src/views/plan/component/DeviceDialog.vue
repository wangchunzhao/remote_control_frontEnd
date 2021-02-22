<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    element-loading-text="加载中..."
    custom-class="plan-device-dialog"
    @close="dialogClose"
  >
    <div v-loading="dialogLoading" style="display: flex">
      <div class="planDialog-basic-info">
        <div class="icon-wrap">
          <img
            :src="
              basicInfo.imgUrl
                ? host + basicInfo.imgUrl
                : host + '/static/img/no_image_placeholder.svg'
            "
          />
        </div>
        <div class="device-name">
          {{ basicInfo.cname }}
        </div>
        <!-- <div :class="{'inline': currentSelect.status === '1','off-line': currentSelect.status === '0','alarm': currentSelect.status === '-1'}" class="device-status">
          {{ currentSelect.status === '-1' ? '报警中' :currentSelect.status === '0' ? '停机' : currentSelect.status === '1' ? '运行中' : '' }}
        </div> -->
        <ul class="basic-info-list">
          <li>
            <span class="label">序列号：</span>
            <span class="value">{{ basicInfo.sn }}</span>
          </li>
          <li>
            <span class="label">品牌：</span>
            <span class="value">{{ basicInfo.brand }}</span>
          </li>
          <li>
            <span class="label">型号：</span>
            <span class="value">{{ basicInfo.type }}</span>
          </li>
          <li>
            <span class="label">规格：</span>
            <span class="value">{{ basicInfo.spec }}</span>
          </li>
          <li>
            <span class="label">质保期：</span>
            <span class="value">{{ basicInfo.exp }}</span>
          </li>
          <li>
            <span class="label">制造日期：</span>
            <span class="value">{{ basicInfo.mfg ? basicInfo.mfg : '' }}</span>
          </li>
          <li>
            <span class="label">维护周期：</span>
            <span class="value">{{
              basicInfo.maintainCycle === '0' ? '' : basicInfo.maintainCycle
            }}</span>
          </li>
          <li>
            <span class="label">安装日期：</span>
            <span class="value">{{
              basicInfo.installdate ? basicInfo.installdate : ''
            }}</span>
          </li>
          <li>
            <span class="label">厂家名称：</span>
            <span class="value">{{ basicInfo.vendorname }}</span>
          </li>
          <li>
            <span class="label">集团名称：</span>
            <span class="value">{{ basicInfo.cname }}</span>
          </li>
        </ul>
      </div>
      <div class="planDialog-level-info">
        <div class="level-radio">
          <el-radio-group v-model="level">
            <el-radio-button label="1">
              一级参数
            </el-radio-button>
            <el-radio-button label="2">
              二级参数
            </el-radio-button>
            <el-radio-button label="3">
              三级参数
            </el-radio-button>
          </el-radio-group>
        </div>
        <div style="margin: 10px;overflow: auto">
          <el-table :data="tableData" style="width: 710px;" height="400">
            <el-table-column prop="name" sortable label="名称" />
            <el-table-column prop="area" sortable label="区域" />
            <el-table-column prop="valit" sortable label="当前值" />
            <el-table-column label="操作" width="60">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  @click.native="
                    showHistoryChart([scope.row.pointId], scope.row.mtid)
                  "
                >
                  <c-svg name="chart" />
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <HistoryDialog
      ref="historyDialog"
      :append-to-body="true"
      :point-ids="history.point"
      :device-id="history.deviceId"
    />
  </el-dialog>
</template>

<script>
import { deviceInfo } from '@/api/model'
import { showlevInfo } from '@/api/planNew'
import HistoryDialog from '@/components/HistoryDialog'

export default {
  components: {
    HistoryDialog
  },
  props: {
    deviceId: {
      type: Number,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      basicInfo: {},

      level: '1',
      level1Info: [],
      level2Info: [],
      level3Info: [],
      tableData: [],
      history: {
        point: null,
        deviceId: 0
      },

      dialogLoading: false,
      dialogVisible: false,

      host: _host
    }
  },
  watch: {
    level(val) {
      this.tableData = this[`level${val}Info`]
    },
    deviceId(val) {
      if (!val) {
        return false
      }
      this.dialogLoading = true
      deviceInfo(val)
        .then(res => {
          if (res.data.Code === 200) {
            this.basicInfo = res.data.Data[0]
          } else {
            this.basicInfo = []
          }
        })
        .catch(err => {
          console.error(err)
        })
      showlevInfo(val)
        .then(res => {
          this.dialogLoading = false
          const data = JSON.parse(res.data)
          if (data.success) {
            this.level1Info = data.listone
            this.level2Info = data.listtwo
            this.level3Info = data.listthree
            this.tableData = this.level1Info
          } else {
            this.level1Info = []
            this.level2Info = []
            this.level3Info = []
            this.tableData = []
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.dialogLoading = false
        })
    }
  },
  mounted() {},
  methods: {
    toggleDialog() {
      this.dialogVisible = !this.dialogVisible
    },
    showHistoryChart(pointId, deviceId) {
      this.$refs.historyDialog.toggleDialog()
      this.history.point = pointId
      this.history.deviceId = deviceId
    },
    dialogClose() {}
  }
}
</script>

<style lang="scss">
.el-dialog.plan-device-dialog {
  width: 1000px;
  .el-dialog__body {
    padding: 0;
  }
  .el-dialog__header {
    padding: 0;
  }
  .planDialog-basic-info {
    flex: 0 0 250px;
    padding: 25px 0;
    border-right: 2px solid #c6d3dc;
  }
  .planDialog-level-info {
    flex: 1;
    padding: 25px 0;
  }
  .icon-wrap {
    text-align: center;
    img {
      width: 60px;
    }
  }
  .device-name {
    text-align: center;
    font-size: 15px;
    margin-top: 5px;
  }
  .device-status {
    margin-top: 5px;
    text-align: center;
    letter-spacing: 3px;
    color: #02a9d1;
    font-size: 15px;
  }
  .inline {
    color: #13ce66;
  }
  .off-line {
    color: #d3dce6;
  }
  .alarm {
    color: #ff4949;
  }
  .basic-info-list {
    margin-top: 10px;
    list-style: none;
    padding-left: 20px;
    li {
      padding: 7px 5px;
    }
    .label {
      display: inline-block;
      width: 75px;
      font-weight: bold;
      text-align: right;
    }
  }
  .level-radio {
    text-align: center;
  }
  .historyChart {
    display: flex;
    position: relative;
    .historyChart-form {
      display: flex;
      align-items: center;
      flex: 0 0 250px;
      padding: 0 15px;
      border-right: 2px solid #c6d3dc;
    }
    .el-form-item {
      padding: 0 15px;
    }
    #chart-container {
      flex: 1;
    }
    .pdfWrapper {
      position: absolute;
      top: 460px;
      width: 960px;
      box-sizing: border-box;
      padding: 0 60px;
      background: #fff;
      z-index: -1000;
      display: none;
      .pdf-chart {
        width: 840px;
        height: 460px;
      }
      .pdf-table {
        box-sizing: border-box;
        padding: 0 30px;
      }
      .point-date {
        float: left;
      }
      .point-value {
        float: right;
      }
      .pdf-table-item {
        line-height: 40px;
        overflow: hidden;
        border-bottom: 1px solid #e8e8e8;
      }
    }
  }
}
</style>
