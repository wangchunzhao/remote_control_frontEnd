<template>
  <el-card shadow="never" class="box-card card-device">
    <div slot="header" class="clearfix">
      <div
        style="display: flex;align-items: center;justify-content: space-between"
      >
        <div class="card-title">星标设备</div>
        <el-dropdown :hide-on-click="false" trigger="click">
          <el-button
            type="text"
            style="padding: 5px 0;"
            class="el-dropdown-link"
            :loading="chooseLoading"
          >
            调整
          </el-button>
          <el-dropdown-menu
            slot="dropdown"
            class="dropdown-box"
            v-loading="chooseLoading"
          >
            <el-dropdown-item>
              {{ choosePointIdList.length }}/10
            </el-dropdown-item>
            <el-checkbox-group
              v-model="choosePointIdList"
              @change="handleCheckedChange"
            >
              <el-dropdown-item
                :divided="index === 0"
                v-for="(item, index) in tableData"
                :key="index"
              >
                <el-checkbox :label="item" :disabled="item.disabled">
                  设备名称{{ index + 1 }}
                </el-checkbox>
              </el-dropdown-item>
            </el-checkbox-group>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div v-loading="tableLoading" class="main-body">
      <div v-if="tableData.length === 0" class="no-data">暂无数据</div>
      <div
        class="list-item online-item"
        v-for="(item, index) in tableData"
        :key="index"
        :class="
          index < 2 ? 'online-item' : index < 3 ? 'offline-item' : 'alarm-item'
        "
      >
        <div class="item-top">
          <div class="item-title">
            CLT10.1双面岛柜(无盖）P
          </div>
          <div class="item-value">
            -19.7°C
          </div>
        </div>
        <el-row class="item-center" :gutter="24">
          <el-col :span="12">吸气压力：0.8bar</el-col>
          <el-col :span="12">排气压力：12.6bar</el-col>
        </el-row>
        <div class="item-bottom">
          <div class="item-bottom-item">
            <div class="item-bottom-item-icon item-bottom-item-icon-online" />
            <div class="item-bottom-item-text">液位报警</div>
          </div>
          <div class="item-bottom-item">
            <div class="item-bottom-item-icon item-bottom-item-icon-offline" />
            <div class="item-bottom-item-text">总低压报警</div>
          </div>
        </div>
      </div>
      <!--      <div-->
      <!--        v-for="(item, index) in tableData"-->
      <!--        :key="index"-->
      <!--        class="list-item"-->
      <!--        :class="-->
      <!--          item.modelConnectStatus === 1-->
      <!--            ? 'offline-item'-->
      <!--            : item.modelConnectStatus === 3-->
      <!--            ? 'alarm-item'-->
      <!--            : 'online-item'-->
      <!--        "-->
      <!--      >-->
      <!--在线、离线-->
      <!--        <div v-if="item.modelConnectStatus !== 3">-->
      <!--          <div class="item-top">-->
      <!--            <div class="item-title">-->
      <!--              {{ item.mname }}-->
      <!--            </div>-->
      <!--            <div class="item-value" v-if="item.num2">-->
      <!--              item.num2 && item.modelConnectStatus !== 1 ? item.num2.val : '&#45;&#45;'-->
      <!--            </div>-->
      <!--            <div v-else></div>-->
      <!--          </div>-->
      <!--          <el-row class="item-center" :gutter="24" v-if="!SMALL_TYPE1.includes(item.SmallTypeId)">-->
      <!--            <el-col :span="12">吸气压力：0.8bar</el-col>-->
      <!--            <el-col :span="12">排气压力：12.6bar</el-col>-->
      <!--          </el-row>-->
      <!--          <div class="item-bottom">-->
      <!--            <div class="item-bottom-item">-->
      <!--              <div class="item-bottom-item-icon item-bottom-item-icon-online" />-->
      <!--              <div class="item-bottom-item-text">液位报警</div>-->
      <!--            </div>-->
      <!--            <div class="item-bottom-item">-->
      <!--              <div-->
      <!--                class="item-bottom-item-icon item-bottom-item-icon-offline"-->
      <!--              />-->
      <!--              <div class="item-bottom-item-text">总低压报警</div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--        报警-->
      <!--        <el-tooltip-->
      <!--          v-else-->
      <!--          class="item"-->
      <!--          effect="dark"-->
      <!--          content="报警原因"-->
      <!--          placement="top"-->
      <!--        >-->
      <!--          <div slot="content">-->
      <!--            <div v-for="(item, index) in data.ModelTreeAlarmList" :key="index">-->
      <!--              {{-->
      <!--                `${item.PointName}，${item.DATA_NAME}，${item.ALARM_SETTING}`-->
      <!--              }}-->
      <!--            </div>-->
      <!--          </div>-->
      <!--          <div class="item-top">-->
      <!--            <div class="item-title">-->
      <!--              CLT10.1双面岛柜(无盖）P-->
      <!--            </div>-->
      <!--            <div class="item-value" v-if="item.num2">-->
      <!--              item.num2 && item.modelConnectStatus !== 1 ? item.num2.val : '&#45;&#45;'-->
      <!--            </div>-->
      <!--            <div v-else></div>-->
      <!--          </div>-->
      <!--          <el-row class="item-center" :gutter="24">-->
      <!--            <el-col :span="12">吸气压力：0.8bar</el-col>-->
      <!--            <el-col :span="12">排气压力：12.6bar</el-col>-->
      <!--          </el-row>-->
      <!--          <div class="item-bottom">-->
      <!--            <div class="item-bottom-item">-->
      <!--              <div class="item-bottom-item-icon item-bottom-item-icon-online" />-->
      <!--              <div class="item-bottom-item-text">液位报警</div>-->
      <!--            </div>-->
      <!--            <div class="item-bottom-item">-->
      <!--              <div-->
      <!--                class="item-bottom-item-icon item-bottom-item-icon-offline"-->
      <!--              />-->
      <!--              <div class="item-bottom-item-text">总低压报警</div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </el-tooltip>-->
      <!--      </div>-->
    </div>
  </el-card>
</template>

<script>
import debounce from 'lodash/debounce'
import { checkPermission } from '@/utils/permissions'
import { SMALL_TYPE1, BIG_TYPE1 } from '@/views/monitor/type'
import { queryDeviceInfo } from '@/api/model'

export default {
  data() {
    return {
      tableLoading: false,
      isNoData: false,
      tableData: [1, 2, 3, 4, 5, 6, 7, 8],
      chooseLoading: false,
      choosePointIdList: []
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    platform() {
      return this.$store.state.permissions.platform
    },
    projectList() {
      return this.$store.state.app.proList
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  created() {
    // this.fetchTableData()
  },
  methods: {
    checkJumpRoutingPermission(routerParmas = {}, permission = []) {
      if (checkPermission(permission)) {
        this.$router.push(routerParmas)
      } else {
        this.$message.error('当前账号暂无相关权限,请联系管理员')
      }
    },
    //选择当个点位显示
    handleCheckedChange() {
      this.editDefaultPoint()
    },
    //选择验证
    checkBoxReg() {},
    //设置显示的点位
    editDefaultPoint(type = true) {
      // this.chooseLoading = true
      // editModelTreeShowPoint({
      //   modelTreeId: this.$route.query.mtid - 0,
      //   pointIdList: this.choosePointIdList
      // })
      //     .then(res => {
      //       if (!type) {
      //         return
      //       } else if (res.data.Code === 200 && res.data.Data) {
      //         this.$message.success('调整显示点位成功')
      //       } else {
      //         this.$message.error('调整显示点位失败')
      //       }
      //     })
      //     .catch(err => {
      //       console.error(err)
      //       this.$message.error('调整显示点位失败')
      //     })
      //     .finally(() => {
      //       this.checkBoxReg()
      //       this.chooseLoading = false
      //     })
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        queryDeviceInfo({
          IsGetAsteriskModelTree: true,
          ProjectId: this.projectId,
          UId: this.userId,
          BigTypeId: undefined,
          SmallTypeId: undefined,
          ModelTreeName: undefined,
          ModelTreeStatusList: undefined,
          PageIndex: 1,
          PageSize: 10
        })
          .then(res => {
            if (res.data.Code === 200) {
              let data = res.data.Data.Data
              data.forEach(item1 => {
                if (SMALL_TYPE1.includes(item1.SmallTypeId)) {
                  item1.isMonitor = false
                  item1.monitorOnline = false
                  item1.PointList.length &&
                    item1.PointList.forEach(item => {
                      item.alarmactive !== 0 && (item1.alarm = true)
                      if (
                        item.pname === '库温' ||
                        item.pname === '温度' ||
                        item.pname === '控制温度'
                      ) {
                        item1.num1 = {
                          val: item.value,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.pname === '湿度') {
                        item1.num2 = {
                          val: item.value,
                          alarm: item.alarmactive !== 0
                        }
                      } else if (item.pname.indexOf('制冷状态') > -1) {
                        item1.state1 = {
                          val: item.value,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.pname === '化霜状态') {
                        item1.state2 = {
                          val: item.valuename,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.pname === '风机状态') {
                        item1.state3 = {
                          val: item.valuename,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.pname === '库门状态') {
                        item1.state4 = {
                          val: item.valuename,
                          alarm: item.alarmactive !== 0,
                          id: item.point
                        }
                      } else if (item.type === 57) {
                        item1.isMonitor = true
                        item.value === 1 && (item1.monitorOnline = true)
                      }
                    })
                }
              })

              this.cardList = data
            } else {
              this.cardList = []
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.tableLoading = false
          })
      },
      1000,
      {
        leading: true
      }
    )
  }
}
</script>

<style lang="scss" scoped>
.card-device {
  .list-item {
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 2px;
  }
  .online-item {
    background: #f6faff;
  }
  .offline-item {
    background: #d8dbdd;
  }
  .alarm-item {
    background: #fff1f1;
  }
  .item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .item-title {
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 24px;
  }
  .item-value {
    font-size: 20px;
    font-family: DINPro-Medium, DINPro;
    font-weight: 500;
    color: #1890ff;
    line-height: 24px;
  }
  .item-center {
    margin-bottom: 4px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #8fa2b5;
    line-height: 24px;
  }
  .item-bottom {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .item-bottom-item {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
  .item-bottom-item:nth-child(1) {
    margin-left: 0;
  }
  .item-bottom-item-icon {
    width: 6px;
    height: 6px;
    border-radius: 3px;
  }
  .item-bottom-item-icon-online {
    background: #24d415;
  }
  .item-bottom-item-icon-offline {
    background: #afafaf;
  }
  .item-bottom-item-text {
    margin-left: 6px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #8fa2b5;
    line-height: 24px;
  }
  .no-data {
    margin-top: 200px;
    text-align: center;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 22px;
  }
}
</style>
<style lang="scss">
.card-device {
  .el-card__body {
    height: 420px;
    overflow-y: auto;
    padding-top: 20px;
  }
}
</style>
