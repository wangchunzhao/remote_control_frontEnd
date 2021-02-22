<template>
  <div v-loading="pageLoading" class="car-manage content-box">
    <div style="margin-bottom: 20px;">
      车牌号：
      <el-input
        v-model="filterForm.mName"
        style="width: 200px;margin-right: 20px;"
        placeholder="请输入"
        clearable
        size="small"
      />
      在线状态：
      <el-select
        v-model="filterForm.status"
        placeholder="请选择"
        style="width: 200px;margin-right: 20px;"
        clearable
        size="small"
      >
        <el-option label="使用中" value="1" />
        <el-option label="未使用" value="0" />
      </el-select>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-search"
        @click.native="fetchCarList"
      >
        搜索
      </el-button>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-refresh"
        @click.native="resetcarList"
      >
        重置
      </el-button>
    </div>
    <div class="coldCar_section" style="position: relative">
      <el-row>
        <el-col
          v-for="cell in carList"
          :key="cell.id"
          class="device-card"
          style="max-width:300px"
        >
          <div class="deviceLink" @click="goPage(cell, 'carDetail')">
            <el-card :body-style="{ padding: '0px' }">
              <div
                class="device-pic"
                :style="{
                  backgroundSize: cell.img ? 'contain' : '',
                  backgroundImage: cell.img
                    ? `url(${BASE_URI + cell.img}`
                    : `url(https://cdn.sinocold.net/images/monitorDashboard/device_no_image_placeholder.svg)`
                }"
              >
                <!-- <img
                  :src="
                    cell.img
                      ? host + cell.img
                      : 'https://cdn.sinocold.net/images/monitorDashboard/device_no_image_placeholder.svg'
                  "
                  :class="{ active: !cell.img }"
                /> -->
              </div>
              <div style="padding:9px 14px 10px 14px;box-sizing:border-box;">
                <div class="device-card_name">
                  {{ cell.mName }}
                  <div style="float:right;margin-top:2px;">
                    <span
                      class="use_sign"
                      :class="
                        cell.status === 1
                          ? 'in_use'
                          : cell.status === 0
                          ? 'un_use'
                          : 'un_bound'
                      "
                    /><span style="float:right">{{
                      cell.status === 1
                        ? '使用中'
                        : cell.status === 0
                        ? '未使用'
                        : '未绑定'
                    }}</span>
                  </div>
                </div>
                <div
                  v-if="cell.children.length < 5"
                  class="device-card_wrapper"
                >
                  <div
                    v-for="point in cell.children"
                    :key="point.id"
                    class="device-card_title"
                    :class="point.atype > 0 ? 'alarm-alert' : ''"
                    @click.stop.prevent="
                      openHistoryDialog(cell.children, point.point, point.name)
                    "
                  >
                    {{ point.name
                    }}<span class="device-card_num">{{ point.valuename }}</span>
                  </div>
                </div>
                <div v-else class="device-card_wrapper">
                  <div
                    v-for="point in cell.children"
                    :key="point.id"
                    class="device-card_title2"
                    :class="point.atype > 0 ? 'alarm-alert' : ''"
                    @click.stop.prevent="
                      openHistoryDialog(cell.children, point.point, point.name)
                    "
                  >
                    <span class="device-point_title">{{ point.name }}</span
                    ><span class="device-card_num">{{ point.valuename }}</span>
                  </div>
                </div>
                <div class="device-card_btnwrapper">
                  <el-button
                    type="primary"
                    size="mini"
                    class="device-card_button"
                    @click.stop.prevent="goPage(cell, 'carTrack')"
                  >
                    查看车辆轨迹
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="pagination.currentPage"
        :page-sizes="[12, 24, 48]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <HistoryDialog ref="historyDialog" :point-ids="searchId" />
  </div>
</template>
<script>
import { getCarList } from '@/api/car'
import HistoryDialog from '@/components/HistoryDialog'

export default {
  components: {
    HistoryDialog
  },
  data() {
    return {
      pageLoading: true,
      carList: [],
      pagination: {
        size: 12,
        currentPage: 1,
        total: 0
      },
      searchId: null,
      searchHisFormRules: {
        starttime: [
          {
            type: 'date',
            required: true,
            message: '请选择开始时间',
            trigger: 'change'
          }
        ],
        endtime: [
          {
            type: 'date',
            required: true,
            message: '请选择结束时间',
            trigger: 'change'
          }
        ],
        interval: [
          { required: true, message: '请输入时间间隔' },
          { type: 'number', message: '时间间隔必须为数字' }
        ]
      },

      filterForm: {
        mName: '',
        status: '',
        pid: Number(this.$store.state.app.pid)
      },
      BASE_URI
    }
  },
  mounted() {
    this.fetchCarList()
  },
  methods: {
    // 获取冷藏车列表
    fetchCarList() {
      this.pageLoading = true
      this.carList = []
      const { mName, status, pid } = this.filterForm
      getCarList({
        mName,
        status: status || -2,
        ProjectId: pid,
        BigTypeId: 314,
        PageSize: this.pagination.size,
        PageIndex: this.pagination.currentPage
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.pagination.total = data.TotalCount
            this.carList = data.Data
          } else {
            this.pagination.total = 0
            this.initData = []
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.pageLoading = false
        })
    },
    // 重置冷藏车表格
    resetcarList() {
      this.filterForm.status = ''
      this.filterForm.mName = ''
      this.pagination.currentPage = 1
      this.pagination.size = 12
      this.fetchCarList()
    },
    // 处理当前页数
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.fetchCarList()
    },
    // 处理分页显示个数
    handleSizeChange(val) {
      this.pagination.size = val
      this.fetchCarList()
    },
    // 历史数据对话框
    openHistoryDialog(pointList) {
      this.$refs.historyDialog.toggleDialog()
      let arr = []
      pointList.forEach(item => {
        arr.push(item.point)
      })
      this.searchId = arr
    },
    // 跳转详情页
    goPage(data, target) {
      const obj = {
        sid: data.SerivceID,
        cid: data.sn,
        name: data.mName
      }
      this.$store.commit('UPDATE_CARDATA', Object.assign({}, obj))
      // 根据option判断进入详情页还是地图详情页
      if (target === 'carDetail') {
        this.$router.push({
          name: 'carDetail',
          query: { carId: data.id, systemId: 314 }
        })
      } else {
        if (!data.sn) {
          this.$message('该车辆未绑定轨迹采集设备')
        } else {
          this.$router.push({
            name: 'carTrack',
            query: { carId: data.id, carNumber: data.mName }
          })
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.car-manage {
  box-sizing: border-box;
  position: relative;
  .device-card {
    box-sizing: border-box;
    padding: 0 10px 20px 10px;
    @media (max-width: 1500px) {
      & {
        width: 20%;
      }
    }
    @media (min-width: 1500px) {
      & {
        width: 16.66667%;
      }
    }
    @media (max-width: 1200px) {
      & {
        width: 25%;
      }
    }
  }
  .deviceLink {
    color: #303133;
    display: block;
    cursor: pointer;
    .device-pic {
      width: 100%;
      display: block;
      padding: 35% 0;
      background-color: #dedde0;
      background-repeat: no-repeat;
      background-position: center;

      text-align: center;
      border-bottom: 1px solid #dedde0;
      img {
        height: 100%;
        width: 100%;
      }
      .active {
        vertical-align: middle;
        width: 71px;
      }
      .noimg {
        width: 0;
        height: 100%;
        display: inline-block;
        vertical-align: middle;
      }
    }
    .device-card_name {
      font-size: 16px;
      margin-bottom: 10px;
      line-height: 20px;
      .in_use {
        background: #24b47e;
      }
      .un_use {
        background: #dbdbdb;
      }
      .un_bound {
        background: #ff2825;
      }
      .use_sign {
        width: 0.6em;
        height: 0.6em;
        margin-right: 3px;
        border-radius: 50%;
        display: inline-block;
        vertical-align: 1px;
      }
    }
    .device-card_wrapper {
      display: block;
      overflow-y: auto;
      height: 88px;
    }
    .device-card_wrapper2 {
      height: 108px;
      transition: height 0.3s linear;
      overflow: hidden;
    }
    .device-card_params {
      height: 100px;
      width: 100%;
      padding: 10px 0;
      box-sizing: border-box;
      .point-param {
        line-height: 20px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
    .device-card_title {
      line-height: 22px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
      .device-card_num {
        float: right;
        color: #1890ff;
      }
    }
    .device-card_title2 {
      line-height: 22px;
      width: 50%;
      display: inline-flex;
      display: -webkit-inline-flex;
      display: -ms-inline-flex;
      justify-content: space-between;
      box-sizing: border-box;
      &:nth-child(odd) {
        padding-right: 10px;
        border-right: 1px solid #dedde0;
      }
      &:nth-child(even) {
        padding-left: 10px;
      }
      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
      .device-card_num {
        color: #1890ff;
        max-width: 66px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .device-card_btnwrapper {
      display: block;
      &:after,
      &:before {
        display: table;
        content: '';
      }
      &:after {
        clear: both;
      }
      .device-card_button {
        float: right;
      }
    }
  }
}
.alarm-alert {
  background: rgba(234, 32, 0, 0.4);
}
</style>
<style lang="scss">
.coldcar_container {
  .el-dialog {
    min-width: 960px;
  }
}
.circlepoint {
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-right: 5px;
  border-radius: 50%;
}
.placehold {
  width: 100%;
  height: 400px;
  background-size: contain;
  background: url('https://cdn.sinocold.net/images/no-data.png')
    center center no-repeat;
}
.history-dialog2 {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
