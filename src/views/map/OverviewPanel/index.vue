<template>
  <div class="map-overview">
    <div class="main-wrap">
      <div class="top-tool">
        <el-dropdown @command="filterBySubarea">
          <div class="subarea-select-trigger">
            {{
              subareaId
                ? subareaOptions.find(v => v.Id === subareaId).Name
                : '所有分区'
            }}
            <i class="el-icon-caret-bottom"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :command="item.Id"
              v-for="item in subareaOptions"
              :key="item.Id"
              >{{ item.Name }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <c-svg
          @click.native="
            () => $store.commit('TOGGLE_MAP_OVERVIEW_HEADER_VISIBLE')
          "
          class="full-screen-btn"
          name="fullscreen"
        ></c-svg>
      </div>
      <div class="flex-row">
        <div class="item1">
          <div class="value-text">
            {{ getProjectNum() }}
            <c-svg style="color: #00EE9F;" class="icon" name="mendian"></c-svg>
          </div>
          <div class="label-text">门店数量</div>
        </div>
        <div class="item1">
          <div class="value-text">
            {{ typeof currentAlarmNum === 'number' ? currentAlarmNum : '-' }}
            <c-svg style="color: #FFCF02;" class="icon" name="baojing"></c-svg>
          </div>
          <div class="label-text">当前报警</div>
        </div>
        <div class="item1">
          <div class="value-text">
            {{
              typeof energyOverviewData !== 'undefined'
                ? numberFormat(energyOverviewData.ToDayEnergy, [
                    '度',
                    '万度',
                    '亿度',
                    '万亿度'
                  ]).value
                : '-'
            }}
            <span class="secondary-text">
              {{
                numberFormat(
                  energyOverviewData && energyOverviewData.LastMonthEnergy,
                  ['度', '万度', '亿度', '万亿度']
                ).unit
              }}
            </span>
            <c-svg style="color: #00C0FF;" class="icon" name="nenghao1"></c-svg>
          </div>
          <div class="label-text">今日能耗</div>
        </div>
      </div>

      <div v-show="showDevice" class="section-wrap">
        <div
          @click="
            () =>
              $store.dispatch('ChangePlatfromAndGoPage', {
                platform: PLATFORM.dataAnalysis,
                pagePath: '/analysis/device'
              })
          "
          class="section-head"
          style="background-color: #15D37B;"
        >
          <span>
            设备运行
            <c-svg name="info-circle"></c-svg>
          </span>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="flex-row" style="padding: 0 16px;">
          <div>
            <div class="label-text">在线末端设备</div>
            <div class="value-text">
              {{
                typeof deviceOverviewData !== 'undefined'
                  ? deviceOverviewData.OnlineCooler +
                    deviceOverviewData.OnlineRefrigeratory
                  : '-'
              }}
              <span style="font-size: 22px;margin-left: -10px;">
                /
                {{
                  typeof deviceOverviewData !== 'undefined'
                    ? deviceOverviewData.CoolerTotal +
                      deviceOverviewData.RefrigeratoryTotal
                    : '-'
                }}
              </span>
            </div>
          </div>
          <div>
            <div class="label-text">在线机组</div>
            <div class="value-text">
              {{
                typeof deviceOverviewData !== 'undefined'
                  ? deviceOverviewData.OnlineAircrew
                  : '-'
              }}
              <span style="font-size: 22px;margin-left: -10px;">
                /
                {{
                  typeof deviceOverviewData !== 'undefined'
                    ? deviceOverviewData.AircrewTotal
                    : '-'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showAlarm" class="section-wrap">
        <div
          @click="() => $router.push('/alarmManageWithAllProject/index')"
          class="section-head"
          style="background-color: #FFCF02;"
        >
          <span>
            报警统计
          </span>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="flex-row" style="padding: 0 16px;">
          <div>
            <div class="label-text">今日报警</div>
            <div class="value-text">
              {{
                typeof alarmOverviewData !== 'undefined'
                  ? alarmOverviewData.AlarmNum.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label-text">本月报警</div>
            <div class="value-text">
              {{
                typeof alarmOverviewData !== 'undefined'
                  ? alarmOverviewData.MonthAlarmNum.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label-text">上月报警</div>
            <div class="value-text">
              {{
                typeof alarmOverviewData !== 'undefined'
                  ? alarmOverviewData.LastMonthAlarmNum.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="showEnergy" class="section-wrap">
        <div
          @click="
            () =>
              $store.dispatch('ChangePlatfromAndGoPage', {
                platform: PLATFORM.dataAnalysis,
                pagePath: '/analysis/energyConsumption'
              })
          "
          class="section-head"
          style="background-color: #00C0FF;"
        >
          <span>
            能耗统计
            <c-svg name="info-circle"></c-svg>
          </span>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="flex-row" style="padding: 0 16px;">
          <div>
            <div class="label-text">今日能耗</div>
            <div class="value-text">
              {{
                typeof energyOverviewData !== 'undefined'
                  ? numberFormat(energyOverviewData.ToDayEnergy, [
                      '度',
                      '万度',
                      '亿度',
                      '万亿度'
                    ]).value
                  : '-'
              }}
              <span class="secondary-text">
                {{
                  numberFormat(
                    energyOverviewData && energyOverviewData.LastMonthEnergy,
                    ['度', '万度', '亿度', '万亿度']
                  ).unit
                }}
              </span>
            </div>
          </div>
          <div>
            <div class="label-text">本月能耗</div>
            <div class="value-text">
              {{
                typeof energyOverviewData !== 'undefined'
                  ? numberFormat(energyOverviewData.MonthEnergy, [
                      '度',
                      '万度',
                      '亿度',
                      '万亿度'
                    ]).value
                  : '-'
              }}
              <span class="secondary-text">
                {{
                  numberFormat(
                    energyOverviewData && energyOverviewData.LastMonthEnergy,
                    ['度', '万度', '亿度', '万亿度']
                  ).unit
                }}
              </span>
            </div>
          </div>
          <div>
            <div class="label-text">上月能耗</div>
            <div class="value-text">
              {{
                typeof energyOverviewData !== 'undefined'
                  ? numberFormat(energyOverviewData.LastMonthEnergy, [
                      '度',
                      '万度',
                      '亿度',
                      '万亿度'
                    ]).value
                  : '-'
              }}
              <span class="secondary-text">
                {{
                  numberFormat(
                    energyOverviewData && energyOverviewData.LastMonthEnergy,
                    ['度', '万度', '亿度', '万亿度']
                  ).unit
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showRepair" class="section-wrap">
        <div class="section-head" style="background-color: #782BFF;">
          <span>
            维修统计
          </span>
        </div>
        <div class="flex-row" style="padding: 0 16px;">
          <div>
            <div class="label-text">待接单</div>
            <div class="value-text">
              {{
                typeof repairOverviewData !== 'undefined'
                  ? repairOverviewData.WaitOrderTotal.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label-text">待签到</div>
            <div class="value-text">
              {{
                typeof repairOverviewData !== 'undefined'
                  ? repairOverviewData.WaitSignTotal.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label-text">维保中</div>
            <div class="value-text">
              {{
                typeof repairOverviewData !== 'undefined'
                  ? repairOverviewData.RepairingTotal.toLocaleString('en-US')
                  : '-'
              }}
            </div>
          </div>
          <div>
            <div class="label-text">待验收</div>
            <div class="value-text">
              {{
                typeof repairOverviewData !== 'undefined'
                  ? repairOverviewData.WaitAcceptanceTotal.toLocaleString(
                      'en-US'
                    )
                  : '-'
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div @click="onClickConfig" class="edit-btn">
        编辑
      </div>
    </div>
    <ConfigDialog ref="configDialog" @change="handleConfigChange" />
  </div>
</template>

<script>
import { getUserSubareaList } from '@/api/subarea'
import { mapGetters } from 'vuex'
import { getAlarmMessageByUserId } from '@/api/alarmActive'
import { getRepairOverview } from '@/api/maintenanceStatistical'
import { getAlarmOverNum } from '@/api/alarmActive'
import { getEnergyTotal } from '@/api/energy'
import { getModelTreeRun } from '@/api/modelTree'
import ConfigDialog from './ConfigDialog'
import { getCompanyTotalList } from '@/api/companyTotal'

export default {
  components: {
    ConfigDialog
  },
  data() {
    return {
      subareaOptions: [],
      subareaId: undefined,
      currentAlarmNum: undefined,
      deviceOverviewData: undefined,
      alarmOverviewData: undefined,
      repairOverviewData: undefined,
      energyOverviewData: undefined,

      showAlarm: false,
      showRepair: false,
      showDevice: false,
      showEnergy: false,

      PLATFORM
    }
  },
  computed: {
    ...mapGetters(['proList', 'companyId'])
  },
  watch: {
    companyId: {
      handler: function() {
        this.fetchSubareaOptions()
        this.fetchConfig()
        this.subareaId = undefined
        this.fetchAllData()
      },
      immediate: true
    }
  },
  methods: {
    fetchAllData() {
      this.getAlarmCount()
      this.fetchAlarmOverviewData()
      this.fetchRepaorOverviewData()
      this.fetchEnergyOverviewData()
      this.fetchDeviceOverviewData()
    },
    getProjectNum() {
      if (!this.subareaId && !this.proList) {
        return '-'
      }
      if (this.subareaId) {
        return this.proList.filter(v => v.ParentSubareaId === this.subareaId)
          .length
      }
      return this.proList.length
    },
    fetchSubareaOptions() {
      getUserSubareaList({
        companyId: this.companyId
      }).then(res => {
        if (res.data.Code === 200) {
          this.subareaOptions = res.data.Data
          this.subareaId = this.subareaOptions[0].Id
        }
      })
    },
    filterBySubarea(id) {
      this.subareaId = id
      this.fetchAllData()
    },
    async getAlarmCount() {
      try {
        const { data } = await getAlarmMessageByUserId({
          pageIndex: 1,
          pageSize: 1,
          companyId: this.companyId,
          subareaIdList: this.subareaId ? [this.subareaId] : undefined
        })
        if (data.Code === 200) {
          this.currentAlarmNum = data.Data.TotalCount
        } else {
          this.currentAlarmNum = undefined
        }
      } catch (err) {
        this.currentAlarmNum = undefined
        console.error(err)
      }
    },
    async fetchDeviceOverviewData() {
      try {
        const { data } = await getModelTreeRun({
          CompanyId: this.companyId,
          SubareaIdList: this.subareaId ? [this.subareaId] : []
        })
        if (data.Code === 200) {
          this.deviceOverviewData = data.Data
        } else {
          this.deviceOverviewData = undefined
        }
      } catch (err) {
        console.error(err)
        this.deviceOverviewData = undefined
      }
    },
    async fetchAlarmOverviewData() {
      try {
        const { data } = await getAlarmOverNum({
          companyId: this.companyId,
          subareaIdList: this.subareaId ? [this.subareaId] : undefined
        })
        if (data.Code === 200) {
          this.alarmOverviewData = data.Data
        } else {
          this.alarmOverviewData = undefined
        }
      } catch (err) {
        console.error(err)
        this.alarmOverviewData = undefined
      }
    },
    async fetchRepaorOverviewData() {
      try {
        const { data } = await getRepairOverview({
          projectId: this.companyId,
          idType: 1,
          subareaIdList: this.subareaId ? [this.subareaId] : undefined
        })
        if (data.Code === 200) {
          this.repairOverviewData = data.Data
        } else {
          this.repairOverviewData = undefined
        }
      } catch (err) {
        console.error(err)
        this.repairOverviewData = undefined
      }
    },
    async fetchEnergyOverviewData() {
      try {
        const { data } = await getEnergyTotal({
          CompanyId: this.companyId,
          SubareaIdList: this.subareaId ? [this.subareaId] : []
        })
        if (data.Code === 200) {
          this.energyOverviewData = data.Data
        } else {
          this.energyOverviewData = undefined
        }
      } catch (err) {
        console.error(err)
        this.energyOverviewData = undefined
      }
    },
    handleConfigChange(payload) {
      // 下面代码类似：this['showAlarm'] = true
      this[payload.type] = payload.val
    },
    fetchConfig() {
      getCompanyTotalList({
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.forEach(v => {
              if (v.TotalType === 0) {
                this.showAlarm = v.IsEnabled
              } else if (v.TotalType === 1) {
                this.showRepair = v.IsEnabled
              } else if (v.TotalType === 3) {
                this.showDevice = v.IsEnabled
              } else if (v.TotalType === 4) {
                this.showEnergy = v.IsEnabled
              }
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    onClickConfig() {
      this.$refs.configDialog.openDialog({
        showDevice: this.showDevice,
        showAlarm: this.showAlarm,
        showRepair: this.showRepair,
        showEnergy: this.showEnergy
      })
    },
    numberFormat(value, units) {
      if (typeof value !== 'number') {
        return {
          value: '-',
          unit: units[0]
        }
      } else if (value === 0) {
        return {
          value: 0,
          unit: units[0]
        }
      }
      const param = {}
      const k = 10000
      const index = Math.floor(Math.log(value) / Math.log(k))
      param.value = (value / Math.pow(k, index))
        .toFixed(1)
        .toLocaleString('en-US')
      param.unit = units[index]
      return param
    }
  }
}
</script>

<style lang="scss" scoped>
.map-overview {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  background: rgba(40, 51, 73, 0.5);
  .main-wrap {
    flex: 1;
  }
  .top-tool {
    display: flex;
    justify-content: space-between;
    padding: 16px;
    color: #fff;
    font-size: 18px;
    .subarea-select-trigger {
      cursor: pointer;
      color: #fff;
      font-size: 18px;
    }
    .full-screen-btn {
      font-size: 20px;
      cursor: pointer;
    }
  }
  .section-wrap {
    margin-top: 15px;
  }
  .section-head {
    margin: 0 11px;
    padding: 7px;
    margin-bottom: 14px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    cursor: pointer;
  }
  .flex-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
  }
  .item1 {
    padding-left: 26px;
    .value-text {
      position: relative;
    }
    .icon {
      position: absolute;
      left: -24px;
      top: 10px;
      font-size: 18px;
    }
  }
  .label-text {
    color: #fff;
    font-size: 14px;
  }
  .value-text {
    font-size: 31px;
    line-height: 40px;
    color: #fff;
    font-family: DINPro-Medium, DINPro;
  }
  .secondary-text {
    font-size: 14px;
    margin-left: -6px;
  }
  .footer {
    border-top: 1px solid #fff;
    text-align: center;
    padding: 8px;
    opacity: 0.4;
  }
  .edit-btn {
    display: inline-block;
    width: 70px;
    height: 24px;
    background: rgba(40, 51, 73, 0.5);
    border-radius: 2px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #ffffff;
    line-height: 22px;
    cursor: pointer;
  }
}
</style>
