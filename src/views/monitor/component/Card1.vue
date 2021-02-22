<template>
  <div
    :class="[
      'monitor-device-card1',
      data.modelConnectStatus === 1
        ? 'offline'
        : data.modelConnectStatus === 3
        ? 'alarm'
        : null
    ]"
    @click="() => goAllPointPage(data)"
  >
    <div class="card1-body">
      <div style="position: relative;">
        <div class="card1-head">
          <el-tooltip
            class="item"
            effect="dark"
            content="报警原因"
            placement="top"
          >
            <div slot="content">
              <div
                v-for="(item, index) in data.ModelTreeAlarmList"
                :key="index"
              >
                {{
                  `${item.PointName}，${item.DATA_NAME}，${item.ALARM_SETTING}`
                }}
              </div>
            </div>
            <span v-if="data.modelConnectStatus === 3" class="state-icon-wrap">
              <c-svg name="warning-circle-fill" />
            </span>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="离线" placement="top">
            <span v-if="data.modelConnectStatus === 1" class="state-icon-wrap">
              <c-svg name="lixian" />
            </span>
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            :content="data.mname"
            placement="top"
          >
            <span class="card1-title">{{ data.mname }}</span>
          </el-tooltip>
        </div>
        <!-- <div @click.stop> 是为了阻止dropdown 的click事件冒泡 -->
        <div @click.stop>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <i class="el-icon-more"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                @click.native.stop="
                  () =>
                    handleClickBind({
                      id: data.mtid,
                      name: data.mname
                    })
                "
                >绑定摄像头</el-dropdown-item
              >
              <el-dropdown-item disabled>编辑设备</el-dropdown-item>
              <el-dropdown-item v-permission="[29]" disabled
                >移除设备</el-dropdown-item
              >
              <el-dropdown-item
                v-permission="[129]"
                @click.native.stop="() => handleDefrost()"
                >手动化霜</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div class="card1-time">更新时间：{{ data.lastUpdateTime }}</div>
      <div class="card1-simulator-wrap">
        <div @click.stop="() => $emit('watchHistory', data.num1.id, data.mtid)">
          <span>{{
            data.num1 && data.modelConnectStatus !== 1 ? data.num1.val : '--'
          }}</span>
          <span style="font-size: 14px;">℃</span>
        </div>
        <div
          @click.stop="() => $emit('watchHistory', data.num2.id, data.mtid)"
          v-if="data.num2"
        >
          <span>{{
            data.num2 && data.modelConnectStatus !== 1 ? data.num2.val : '--'
          }}</span>
          <span style="font-size: 14px;">%</span>
        </div>
      </div>
    </div>

    <div class="card1-state-wrap">
      <el-tooltip
        class="item"
        :open-delay="500"
        effect="dark"
        content="制冷状态"
        placement="bottom-end"
      >
        <span
          @click.stop="() => $emit('watchHistory', data.state1.id, data.mtid)"
          v-if="data.state1"
          class="card1-state-item"
        >
          <c-svg
            :class="data.state1.val === 0 ? null : 'icon-blue'"
            name="zhileng"
          />
        </span>
      </el-tooltip>
      <el-tooltip
        class="item"
        :open-delay="500"
        effect="dark"
        content="风机状态"
        placement="bottom-end"
      >
        <span
          @click.stop="() => $emit('watchHistory', data.state3.id, data.mtid)"
          v-if="data.state3"
          class="card1-state-item"
        >
          <c-svg
            :class="data.state3.val === '关' ? null : 'icon-blue'"
            name="fengji1"
          />
        </span>
      </el-tooltip>
      <el-tooltip
        class="item"
        :open-delay="500"
        effect="dark"
        content="除霜状态"
        placement="bottom-end"
      >
        <span
          @click.stop="() => $emit('watchHistory', data.state2.id, data.mtid)"
          v-if="data.state2"
          class="card1-state-item"
        >
          <c-svg
            :class="data.state2.val === '关' ? null : 'icon-yellow'"
            name="chushuang"
          />
        </span>
      </el-tooltip>

      <el-tooltip
        class="item"
        :open-delay="500"
        effect="dark"
        content="库门状态"
        placement="bottom-end"
      >
        <span
          @click.stop="() => $emit('watchHistory', data.state4.id, data.mtid)"
          v-if="data.state4"
          class="card1-state-item"
        >
          <c-svg
            :class="data.state4.val === '关' ? null : 'icon-yellow'"
            name="kumen"
          />
        </span>
      </el-tooltip>
      <el-tooltip
        class="item"
        :open-delay="500"
        effect="dark"
        content="监控视频"
        placement="bottom-end"
      >
        <span
          v-if="data.isMonitor"
          @click.stop="watchVideo"
          class="card1-state-item"
        >
          <c-svg
            :class="data.monitorOnline ? 'icon-blue' : null"
            name="video-fill"
          />
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { getPointConfig } from '@/api/device_new'
import mqtt from 'mqtt'
import { writeGateway } from '@/api/device_new'
import { addLog } from '@/api/log'

async function loop(func, num) {
  for (let i = 0; i < num; i++) {
    await timeout(func)
  }
  function timeout(func) {
    return new Promise(resolve => {
      setTimeout(() => {
        func()
        resolve()
      }, 8 * 1000)
    })
  }
}

export default {
  props: {
    bigTypeId: Number,
    smallTypeId: Number,
    data: Object
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  methods: {
    // 点击手动化霜
    handleDefrost() {
      this.$confirm('确认要进行『手动化霜』操作？', '提示', { type: 'warning' })
        .then(() => {
          this.handleWrite()
        })
        .catch(() => {})
    },
    handleWrite() {
      const point = this.data.PointList.find(v => v.pname === '手动化霜')
      if (!point) {
        this.$message('当前设备没有『手动化霜』点位，无法手动化霜')
        return
      }
      getPointConfig({
        pointID: point.point
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            if (data.Type === 'NotWrite') {
              this.$message('当前设备暂不支持手动化霜')
              return
            }
            if (data.Type === 'MQTT') {
              this.handleAddLog(1)
              // 关闭之前的websocket连接
              this.mqttClient && this.mqttClient.end()
              this.mqttClient = mqtt.connect(
                'wss:mqtt.coolcare.link:8084/mqtt',
                {
                  connectTimeout: 40000, // 超时时间
                  // 认证信息
                  clientId: `mqttjs_${Math.random()
                    .toString(16)
                    .substr(2, 10)}_${this.userId}`,
                  username: 'webclient',
                  password: 'webclient.coolcare@Sinocold'
                }
              )
              this.mqttClient.on('connect', () => {
                // mqtt网关的写入操作
                const deviceCode = data.MONITORY_ADDR.split('.')[0]
                const tagCode = data.MONITORY_ADDR.replace(deviceCode + '.', '')
                const payload = [
                  {
                    operate: 'write',
                    deviceCode: deviceCode,
                    tagCode: tagCode,
                    val: '1'
                  }
                ]

                // 下发写指令
                this.mqttClient.publish(
                  `gw/mq/${data.DESCRIBES}/service`,
                  JSON.stringify(payload),
                  error => {
                    if (error) {
                      this.$message.error('指令下发失败')
                      console.error(error)
                    }
                  }
                )
                // 写指令下发后，如果写操作15秒内没有返回，则主动去查询实时数据
                let timer = setTimeout(() => {
                  this.subscribeRealTimeData(
                    this.mqttClient,
                    data.DESCRIBES,
                    deviceCode,
                    tagCode
                  )
                }, 15 * 1000)
                this.mqttClient.subscribe(
                  `gw/mq/${data.DESCRIBES}/response`,
                  { qos: 1 },
                  error => {
                    if (error) {
                      console.error(error)
                    }
                  }
                )

                this.mqttClient.on('message', (topic, message) => {
                  const res = JSON.parse(message.toString())
                  if (res.message) {
                    // 写操作有message这个字段返回
                    clearTimeout(timer)
                    if (res.status !== undefined) {
                      // 新版本mqtt网关有status这个字段返回
                      if (res.status === true) {
                        this.$message.success('指令下发成功')
                        if (res.value === '1') {
                          this.data.state2.val = '开'
                          this.data.state1.val === 0
                        } else {
                          this.$message('操作失败')
                        }
                      } else {
                        this.$message.error('指令下发失败')
                      }
                    } else {
                      // 老版本mqtt网关没有status和value字段返回,所以直接订阅时间数据
                      this.subscribeRealTimeData(
                        this.mqttClient,
                        data.DESCRIBES,
                        deviceCode,
                        tagCode
                      )
                    }
                  }
                  if (res.time) {
                    // 订阅的实时消息有time这个字段
                    if (res[deviceCode][tagCode] === 1) {
                      this.data.state2.val = '开'
                      this.data.state1.val === 0
                    } else {
                      this.$message('操作失败')
                    }
                    // 查询到实时数据后直接取消订阅
                    this.mqttClient.unsubscribe(
                      `gw/mq/${data.DESCRIBES}/realtime/#`
                    )
                  }
                })
              })
            } else {
              writeGateway({
                pointID: point.point,
                writeData: 1
              })
                .then(res => {
                  if (res.data.Code === 200 && res.data.Data.IsSuccess) {
                    this.$message.success('指令下发成功')
                    // 发5次请求，每次延时4秒后刷新数据
                    loop(() => {
                      this.$emit('refresh')
                    }, 8)
                  } else {
                    this.$message.error('指令下发失败')
                  }
                })
                .catch(err => {
                  console.error(err)
                })
            }
          }
        })
        .catch(err => {
          console.log(err)
          this.$message.error('网关配置信息获取失败')
        })
    },
    // 订阅一个点位的实时数据
    subscribeRealTimeData(mqttClient, DESCRIBES, deviceCode, tagCode) {
      mqttClient.publish(
        `gw/mq/${DESCRIBES}/inquire`,
        JSON.stringify({
          operate: 'read',
          devices: [
            {
              deviceCode: deviceCode,
              tags: [{ tagCode: tagCode }]
            }
          ]
        })
      )
      // 订阅一个主题(点位实时数据)
      mqttClient.subscribe(
        `gw/mq/${DESCRIBES}/realtime/#`,
        { qos: 1 },
        error => {
          if (error) {
            // ('订阅成功')
            console.log('订阅realtime失败：', error)
          }
        }
      )
    },
    /**
     * 写操作日志上传
     */
    handleAddLog(writeValue) {
      const { mname } = this.data
      const pointId = this.data.PointList.find(v => v.pname === '手动化霜')
        .point
      addLog({
        CompanyId: this.companyId,
        ProjectId: this.projectId,
        LogModelId: 6,
        LogModelActionId: 32,
        LogModelActionName: '远程参数修改',
        Content: `对 ${mname} / 手动化霜 写入值 ${writeValue}`,
        RequestContent: `pointID=${pointId}&writeData=${writeValue}`
      }).catch(() => {
        console.log(
          `日志：『对 ${mname} / 手动化霜 写入值 ${writeValue}』生成失败`
        )
      })
    },
    /**
     * 查看所有点位
     */
    goAllPointPage(data) {
      this.$router.push({
        name: 'devicePointList',
        query: {
          mtid: data.mtid,
          deviceName: data.mname,
          from: this.$route.name,
          path: this.$route.path,
          BigTypeId: this.bigTypeId,
          SmallTypeId: this.smallTypeId
        }
      })
    },
    /**
     * 点击绑定摄像头
     */
    handleClickBind(payload) {
      this.$emit('clickBindCamera', payload)
    },
    /**
     * 点击摄像头图标
     */
    watchVideo() {
      this.$emit('open-video-dialog', { deviceId: this.data.mtid })
    }
  },
  beforeDestroy() {
    // 如果是mqtt网关，关闭websocket连接
    this.mqttClient && this.mqttClient.end()
  }
}
</script>

<style lang="scss" scoped>
.monitor-device-card1 {
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition: 0.3s;
  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  cursor: pointer;
  &.offline {
    &:before {
      display: none;
    }
    .card1-body {
      background-color: rgba(191, 191, 191, 1);
      color: #fff;
    }
  }
  &.alarm {
    .card1-body {
      background-color: rgba(168, 7, 26, 1);
      color: #fff;
    }
  }
  &.offline,
  &.alarm {
    .card1-time {
      color: #fff;
    }
    .el-icon-more {
      color: #fff;
    }
  }
  .card1-head {
    padding: 15px 16px 10px 16px;
    display: flex;
    align-items: center;
    margin-right: 20px;
  }
  .el-dropdown {
    position: absolute;
    right: 10px;
    top: 15px;
  }
  .state-icon-wrap {
    margin-right: 10px;
    .icon {
      font-size: 17px;
    }
  }
  .card1-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 10px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
  }
  .card1-time {
    padding: 0 16px;
    color: #8d8d8d;
    font-size: 12px;
  }
  .card1-simulator-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 20px;
    font-size: 26px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    & > div {
      cursor: pointer;
    }
  }
  .card1-state-wrap {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 21px;
    box-sizing: border-box;
    margin: 10px 0;
    height: 21px;
    box-sizing: border-box;
    .icon {
      font-size: 21px;
      color: rgba(0, 0, 0, 0.15);
    }
    .icon-blue {
      color: rgba(24, 144, 255, 1);
    }
    .icon-green {
      color: rgba(82, 196, 26, 1);
    }
    .icon-yellow {
      color: rgba(250, 173, 20, 1);
    }
  }
  .card1-state-item {
    flex: 1;
    text-align: center;
    position: relative;
    cursor: pointer;
    &::after {
      content: '';
      display: inline-block;
      height: 15px;
      width: 1px;
      position: absolute;
      right: 0;
      top: 5px;
      background-color: rgba(0, 0, 0, 0.1);
    }
    &:last-of-type {
      &::after {
        display: none;
      }
    }
  }

  i.el-icon-more {
    cursor: pointer;
  }
}
</style>
