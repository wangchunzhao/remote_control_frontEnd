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
            class="card-device-dropdown-box"
            v-loading="chooseLoading"
          >
            <div style="padding: 0 20px">
              <div style="display: flex;align-items: center">
                <div style="margin-right: 10px">
                  {{ choosePointIdList.length }}/10
                </div>
                <el-input
                  size="small"
                  placeholder="请输入"
                  v-model="filterForm.text"
                  clearable
                ></el-input>
              </div>
            </div>
            <div
              v-if="filterList.length === 0"
              class="no-data"
              style="display: flex;flex-direction: column;align-items: center;margin: 50px 0;"
            >
              <img
                style="width: 60px;"
                src="
          https://cdn.sinocold.net/images/empty.png"
                alt="暂无数据"
              />
              <div
                style="
                  margin-top: 20px;
                  text-align: center;
                  font-size: 14px;
                  font-family: PingFangSC-Regular, PingFang SC;
                  font-weight: 400;
                  color: rgba(0, 0, 0, 0.45);
                  line-height: 22px;
                "
              >
                暂无数据
              </div>
            </div>
            <el-checkbox-group
              v-model="choosePointIdList"
              @change="handleCheckedChange"
            >
              <div
                v-for="(item1, index1) in filterList"
                :key="index1"
                v-if="item1"
              >
                <el-dropdown-item divided>
                  <div
                    class="card-device-dropdown-item-title"
                    @click="handleDropTitleItem(index1)"
                  >
                    <div>{{ item1.SmallTypeName }}</div>
                    <c-svg
                      :name="item1.show ? 'top' : 'bottom'"
                      style="width: 16px;height: 16px"
                    ></c-svg>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item
                  v-show="item1.show"
                  v-for="(item, index) in item1.data"
                  :key="index"
                >
                  <div class="card-device-dropdown-item-box">
                    <el-checkbox
                      :label="item.ModelTreeId"
                      :disabled="item.disabled"
                    >
                      <div class="card-device-dropdown-item-text">
                        {{ item.ModelTreeName }}
                      </div>
                    </el-checkbox>
                  </div>
                </el-dropdown-item>
              </div>
            </el-checkbox-group>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div v-loading="tableLoading" class="main-body">
      <div v-if="tableData.length === 0" class="no-data">
        <img
          style="width: 80px;"
          src="
          https://cdn.sinocold.net/images/empty.png"
          alt="暂无数据"
        />
        <div>暂无数据</div>
        <div class="no-data-remark">点击右上角「调整」添加</div>
      </div>
      <div
        v-for="(item, index) in tableData"
        :key="index"
        class="list-item"
        :class="
          item.modelConnectStatus === 1
            ? 'offline-item'
            : item.modelConnectStatus === 3
            ? 'alarm-item'
            : 'online-item'
        "
      >
        <!--        在线、离线-->
        <div v-if="item.modelConnectStatus !== 3">
          <div class="item-top">
            <div class="item-title">
              {{ item.mname }}
            </div>
            <div class="item-value" v-if="item.num1">
              {{
                item.num1 && item.modelConnectStatus !== 1
                  ? item.num1.val + '℃'
                  : '--℃'
              }}
            </div>
            <div v-else-if="item.num2">
              {{
                item.num2 && item.modelConnectStatus !== 1
                  ? item.num2.val + '%'
                  : '--%'
              }}
            </div>
            <div v-else></div>
          </div>
          <!--          卡片模式2/3-->
          <el-row
            class="item-center"
            :gutter="24"
            v-if="!SMALL_TYPE1.includes(item.SmallTypeId) && item.PointList"
          >
            <el-col
              :span="12"
              v-for="(point, opintIndex) in item.PointList.length > 3
                ? item.PointList.slice(0, 4)
                : item.PointList"
              :key="opintIndex"
            >
              <div
                @click.stop="
                  () => $emit('watchHistory', point.point, item.mtid)
                "
              >
                {{ point.pname }}：{{ point.valuename }}
              </div>
            </el-col>
          </el-row>
          <div
            class="item-bottom"
            v-if="SMALL_TYPE1.includes(item.SmallTypeId)"
          >
            <el-tooltip
              class="item"
              :open-delay="500"
              effect="dark"
              content="制冷状态"
              placement="bottom-end"
            >
              <div
                class="item-bottom-item"
                @click.stop="
                  () => $emit('watchHistory', item.state1.id, item.mtid)
                "
                v-if="item.state1"
              >
                <div
                  class="item-bottom-item-icon item-bottom-item-icon-online"
                  :class="
                    item.state1.val === 0
                      ? 'item-bottom-item-icon-offline'
                      : 'item-bottom-item-icon-online'
                  "
                />
                <div class="item-bottom-item-text">制冷</div>
              </div>
            </el-tooltip>
            <el-tooltip
              class="item"
              :open-delay="500"
              effect="dark"
              content="风机状态"
              placement="bottom-end"
            >
              <div
                class="item-bottom-item"
                @click.stop="
                  () => $emit('watchHistory', item.state3.id, item.mtid)
                "
                v-if="item.state3"
              >
                <div
                  class="item-bottom-item-icon item-bottom-item-icon-online"
                  :class="
                    item.state3.val === '关'
                      ? 'item-bottom-item-icon-offline'
                      : 'item-bottom-item-icon-online'
                  "
                />
                <div class="item-bottom-item-text">风机</div>
              </div>
            </el-tooltip>
            <el-tooltip
              class="item"
              :open-delay="500"
              effect="dark"
              content="除霜状态"
              placement="bottom-end"
            >
              <div
                class="item-bottom-item"
                @click.stop="
                  () => $emit('watchHistory', item.state2.id, item.mtid)
                "
                v-if="item.state2"
              >
                <div
                  class="item-bottom-item-icon item-bottom-item-icon-online"
                  :class="
                    item.state2.val === '关'
                      ? 'item-bottom-item-icon-offline'
                      : 'item-bottom-item-icon-online'
                  "
                />
                <div class="item-bottom-item-text">化霜</div>
              </div>
            </el-tooltip>
            <el-tooltip
              class="item"
              :open-delay="500"
              effect="dark"
              content="库门状态"
              placement="bottom-end"
            >
              <div
                class="item-bottom-item"
                @click.stop="
                  () => $emit('watchHistory', item.state4.id, item.mtid)
                "
                v-if="item.state4"
              >
                <div
                  class="item-bottom-item-icon item-bottom-item-icon-online"
                  :class="
                    item.state4.val === '关'
                      ? 'item-bottom-item-icon-offline'
                      : 'item-bottom-item-icon-online'
                  "
                />
                <div class="item-bottom-item-text">库门</div>
              </div>
            </el-tooltip>
            <el-tooltip
              class="item"
              :open-delay="500"
              effect="dark"
              content="监控视频"
              placement="bottom-end"
            >
              <div class="item-bottom-item" v-if="item.isMonitor">
                <div
                  class="item-bottom-item-icon item-bottom-item-icon-online"
                  :class="
                    !item.monitorOnline === '关'
                      ? 'item-bottom-item-icon-offline'
                      : 'item-bottom-item-icon-online'
                  "
                />
                <div class="item-bottom-item-text">监控</div>
              </div>
            </el-tooltip>
          </div>
        </div>
        <!--        报警-->
        <el-tooltip
          class="item"
          effect="dark"
          content="报警原因"
          placement="top"
        >
          <div slot="content">
            <div
              v-for="(alarm, alarmIndex) in item.ModelTreeAlarmList"
              :key="alarmIndex"
            >
              {{
                `${alarm.PointName}，${alarm.DATA_NAME}，${alarm.ALARM_SETTING}`
              }}
            </div>
          </div>
          <div v-if="item.modelConnectStatus === 3">
            <div class="item-top">
              <div class="item-title">
                {{ item.mname }}
              </div>
              <div class="item-value" v-if="item.num1">
                {{
                  item.num1 && item.modelConnectStatus !== 1
                    ? item.num1.val + '℃'
                    : '--℃'
                }}
              </div>
              <div v-else-if="item.num2">
                {{
                  item.num2 && item.modelConnectStatus !== 1
                    ? item.num2.val + '%'
                    : '--%'
                }}
              </div>
              <div v-else></div>
            </div>
            <!--          卡片模式2/3-->
            <el-row
              class="item-center"
              :gutter="24"
              v-if="!SMALL_TYPE1.includes(item.SmallTypeId) && item.PointList"
            >
              <el-col
                :span="12"
                v-for="(point, opintIndex) in item.PointList.length > 3
                  ? item.PointList.slice(0, 4)
                  : item.PointList"
                :key="opintIndex"
                @click.stop="
                  () => $emit('watchHistory', point.point, item.mtid)
                "
              >
                {{ point.pname }}：{{ point.valuename }}
              </el-col>
            </el-row>
            <div
              class="item-bottom"
              v-if="SMALL_TYPE1.includes(item.SmallTypeId)"
            >
              <el-tooltip
                class="item"
                :open-delay="500"
                effect="dark"
                content="制冷状态"
                placement="bottom-end"
              >
                <div
                  class="item-bottom-item"
                  @click.stop="
                    () => $emit('watchHistory', item.state1.id, item.mtid)
                  "
                  v-if="item.state1"
                >
                  <div
                    class="item-bottom-item-icon item-bottom-item-icon-online"
                    :class="
                      item.state1.val === 0
                        ? 'item-bottom-item-icon-offline'
                        : 'item-bottom-item-icon-online'
                    "
                  />
                  <div class="item-bottom-item-text">制冷</div>
                </div>
              </el-tooltip>
              <el-tooltip
                class="item"
                :open-delay="500"
                effect="dark"
                content="风机状态"
                placement="bottom-end"
              >
                <div
                  class="item-bottom-item"
                  @click.stop="
                    () => $emit('watchHistory', item.state3.id, item.mtid)
                  "
                  v-if="item.state3"
                >
                  <div
                    class="item-bottom-item-icon item-bottom-item-icon-online"
                    :class="
                      item.state3.val === '关'
                        ? 'item-bottom-item-icon-offline'
                        : 'item-bottom-item-icon-online'
                    "
                  />
                  <div class="item-bottom-item-text">风机</div>
                </div>
              </el-tooltip>
              <el-tooltip
                class="item"
                :open-delay="500"
                effect="dark"
                content="除霜状态"
                placement="bottom-end"
              >
                <div
                  class="item-bottom-item"
                  @click.stop="
                    () => $emit('watchHistory', item.state2.id, item.mtid)
                  "
                  v-if="item.state2"
                >
                  <div
                    class="item-bottom-item-icon item-bottom-item-icon-online"
                    :class="
                      item.state2.val === '关'
                        ? 'item-bottom-item-icon-offline'
                        : 'item-bottom-item-icon-online'
                    "
                  />
                  <div class="item-bottom-item-text">化霜</div>
                </div>
              </el-tooltip>
              <el-tooltip
                class="item"
                :open-delay="500"
                effect="dark"
                content="库门状态"
                placement="bottom-end"
              >
                <div
                  class="item-bottom-item"
                  @click.stop="
                    () => $emit('watchHistory', item.state4.id, item.mtid)
                  "
                  v-if="item.state4"
                >
                  <div
                    class="item-bottom-item-icon item-bottom-item-icon-online"
                    :class="
                      item.state4.val === '关'
                        ? 'item-bottom-item-icon-offline'
                        : 'item-bottom-item-icon-online'
                    "
                  />
                  <div class="item-bottom-item-text">库门</div>
                </div>
              </el-tooltip>
              <el-tooltip
                class="item"
                :open-delay="500"
                effect="dark"
                content="监控视频"
                placement="bottom-end"
              >
                <div class="item-bottom-item" v-if="item.isMonitor">
                  <div
                    class="item-bottom-item-icon item-bottom-item-icon-online"
                    :class="
                      !item.monitorOnline === '关'
                        ? 'item-bottom-item-icon-offline'
                        : 'item-bottom-item-icon-online'
                    "
                  />
                  <div class="item-bottom-item-text">监控</div>
                </div>
              </el-tooltip>
            </div>
          </div>
        </el-tooltip>
      </div>
    </div>
  </el-card>
</template>

<script>
import debounce from 'lodash/debounce'
import { checkPermission } from '@/utils/permissions'
import { SMALL_TYPE1, BIG_TYPE1 } from '@/views/monitor/type'
import { queryDeviceInfo } from '@/api/model'
import { getModelTreePage } from '@/api/model_new'
import { setModelTreeAsterisk, cancelModelTreeAsterisk } from '@/api/modelTree'

export default {
  data() {
    return {
      tableLoading: false,
      isNoData: false,
      tableData: [],
      chooseLoading: false,
      choosePointIdList: [],
      oldChoosePointIdList: [],
      filterList: [],
      List: [],
      filterForm: {
        text: ''
      },
      BIG_TYPE1,
      SMALL_TYPE1
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
  watch: {
    'filterForm.text'() {
      this.filterListFun()
    }
  },
  created() {
    this.fetchTableData()
    this.getAlldeviceList()
  },
  methods: {
    //点击下拉菜单标题栏
    handleDropTitleItem(index) {
      this.filterList[index].show = !this.filterList[index].show
    },
    //校验权限
    checkJumpRoutingPermission(routerParmas = {}, permission = []) {
      if (checkPermission(permission)) {
        this.$router.push(routerParmas)
      } else {
        this.$message.error('当前账号暂无相关权限,请联系管理员')
      }
    },
    //编辑点位
    handleCheckedChange(v) {
      this.List.map(item => {
        for (let i = 0; i < item.data.length; i++) {
          if (!v.includes(item.data[i].ModelTreeId) && v.length === 10) {
            item.data[i].disabled = true
          } else {
            item.data[i].disabled = false
          }
        }
      })
      this.List = [...this.List]
      this.filterListFun()
      let modelTreeIdList = this.oldChoosePointIdList.filter(
        item => !v.includes(item)
      )
      if (modelTreeIdList.length) {
        //取消星标
        cancelModelTreeAsterisk(modelTreeIdList)
          .then(res => {
            if (res.data.Code === 200 && res.data.Data) {
              this.setAsterisk()
            } else {
              this.$message.error('调整失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('调整失败')
          })
      } else {
        this.setAsterisk()
      }
    },
    //设置星标设备
    setAsterisk() {
      setModelTreeAsterisk(this.choosePointIdList)
        .then(res => {
          if (res.data.Code === 200 && res.data.Data) {
            this.$message.success('调整成功')
            this.fetchTableData()
          } else {
            this.$message.error('调整失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('调整失败')
        })
    },
    //选择验证
    getAlldeviceList() {
      this.filterForm.text = ''
      this.ModelTreeIdList = []
      getModelTreePage({
        ProjectId: this.projectId,
        PageIndex: 1,
        PageSize: 9999
      })
        .then(res => {
          if (res.data.Code === 200) {
            let List = []
            let data = res.data.Data.Data
            data.map(item => {
              let flag = false
              for (let i = 0; i < List.length; i++) {
                if (List[i].SmallTypeId === item.SmallTypeId) {
                  List[i].data.push(item)
                  flag = true
                  break
                }
              }
              if (!flag) {
                List.push({
                  SmallTypeId: item.SmallTypeId,
                  SmallTypeName: item.SmallTypeName,
                  level: 0,
                  show: false,
                  data: [item]
                })
              }
            })
            this.filterList = List
            this.List = List
          } else {
            this.filterList = []
            this.List = []
          }
        })
        .catch(err => {
          console.error(err)
          this.filterList = []
          this.List = []
        })
    },
    //筛选过滤
    filterListFun() {
      let filterList = []
      if (this.filterForm.text) {
        let List = JSON.parse(JSON.stringify(this.List))
        filterList = List.map(item => {
          item.show = true
          if (
            item.SmallTypeName &&
            item.SmallTypeName.indexOf &&
            item.SmallTypeName.indexOf(this.filterForm.text) >= 0
          ) {
            return item
          } else {
            for (let i = 0; i < item.data.length; i++) {
              if (
                item.data[i].ModelTreeName &&
                item.data[i].ModelTreeName.indexOf &&
                item.data[i].ModelTreeName.indexOf(this.filterForm.text) >= 0
              ) {
                item.data = [item.data[i]]
                return item
              }
            }
          }
        })
      } else {
        filterList = this.List
      }
      this.filterList = filterList.filter(item => item)
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
              this.choosePointIdList = res.data.Data.Data.map(item => item.mtid)
              this.oldChoosePointIdList = res.data.Data.Data.map(
                item => item.mtid
              )
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
              this.tableData = data
            } else {
              this.tableData = []
            }
          })
          .catch(err => {
            console.error(err)
            this.tableData = []
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
    margin-top: 150px;
    text-align: center;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 22px;
  }
  .no-data-remark {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #1890ff;
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
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
.card-device-dropdown-box {
  max-height: 400px !important;
  overflow-y: auto;
  overflow-x: hidden;
  .el-checkbox {
    display: flex;
    align-items: center;
    height: 36px;
  }
}
.card-device-dropdown-item-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-device-dropdown-item-box {
  max-width: 150px;
}
.card-device-dropdown-item-text {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
