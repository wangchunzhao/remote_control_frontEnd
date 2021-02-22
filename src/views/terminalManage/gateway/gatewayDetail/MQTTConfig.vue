<template>
  <div class="content-box">
    <div style="text-align: center;margin-top: 15px;">
      <el-upload
        class="upload-demo"
        drag
        action="#233"
        :before-upload="uploadMQTTConfig"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          <span v-if="!configBuffer"
            >将配置文件拖到此处，或<em>点击上传</em></span
          >
          <em v-else>配置文件已上传，确认后点击『更新配置』按钮</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          <!-- 只能上传JSON文件，且符合相关规则 -->
        </div>
      </el-upload>
      <el-button
        type="primary"
        style="margin-top: 10px;"
        @click.native="updateMQTT"
      >
        更新配置
      </el-button>
    </div>
    <div style="margin-top: 30px;">
      <el-table
        v-loading="MQTTPointLoading"
        :data="MQTTPointList"
        style="width: 100%;"
        highlight-current-row
      >
        <el-table-column type="index" label="序号" width="80px" />
        <el-table-column label="点位名称" prop="pointName" />
        <el-table-column label="数值" prop="value" />
        <el-table-column label="更新时间">
          <template slot="header" slot-scope="{}">
            <span>更新时间</span>
            <el-button
              icon="el-icon-refresh"
              type="text"
              style="float: right;font-size: 20px;padding: 0;"
              @click.native="fetchMQTTPointList()"
            />
          </template>
          <template slot-scope="{ row }">
            {{ _dateFormat(row.updateDateTime, 'YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          background
          :current-page.sync="pagination.currentPage"
          :page-size.sync="pagination.size"
          layout="total, prev, pager, next, jumper"
          :total="pagination.total"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt'
import { Buffer } from 'buffer'
import { getDeviceMQTTPointPage } from '@/api/device_new'

export default {
  props: {
    gatewayInfo: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      configBuffer: '',

      MQTTPointLoading: false,
      MQTTPointList: [],

      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      }
    }
  },
  watch: {
    gatewayInfo: {
      handler: function(val) {
        if (val.id) {
          this.fetchMQTTPointList()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 上传mqtt网关配置文件
    uploadMQTTConfig(file) {
      if (file.name.indexOf('.db') === -1) {
        this.$message('配置文件格式错误')
        return false
      }
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      const that = this
      reader.onload = function() {
        that.configBuffer = Buffer.from(this.result)
      }
      return false
    },
    handleCurrentChange() {
      this.fetchMQTTPointList()
    },
    // 编辑mqtt网关
    updateMQTT() {
      if (this.configBuffer) {
        // 说明上传了配置文件
        const client = mqtt.connect('wss:mqtt.coolcare.link:8084/mqtt', {
          connectTimeout: 40000, // 超时时间
          // 认证信息
          clientId: `mqttjs_${Math.random()
            .toString(16)
            .substr(2, 10)}_${this.userId}`,
          username: 'webclient',
          password: 'webclient.coolcare@Sinocold'
        })
        client.on('error', error => {
          this.$message.error('与服务器连接失败')
          console.error('连接失败:', error)
        })
        client.on('connect', () => {
          // 订阅一个主题(配置/控制/重启指令的响应)
          client.subscribe(
            `gw/mq/${this.gatewayInfo.DESCRIBES}/response`,
            { qos: 1 },
            error => {
              if (!error) {
                // 下发指令
                client.publish(
                  `gw/mq/${this.gatewayInfo.DESCRIBES}/config`,
                  this.configBuffer,
                  error => {
                    if (error) {
                      this.$message.error('配置失败，请检查你提交的配置文件')

                      console.error(error)
                    } else {
                      this.$message.success('配置成功')
                      this.mqttDialogVisible = false
                    }
                    client.end()
                  }
                )
              } else {
                this.$message.error('配置下发失败')
                client.end()
              }
            }
          )
          // 连接后40秒自己断开连接
          setTimeout(() => {
            client.end()
          }, 40 * 1000)
        })
      } else {
        this.$message('请上传配置文件')
      }
    },
    fetchMQTTPointList() {
      this.MQTTPointLoading = true
      getDeviceMQTTPointPage({
        deviceID: this.gatewayInfo.id,
        pageIndex: this.pagination.currentPage,
        pageSize: this.pagination.size
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.MQTTPointList = data.Data.Data
            this.pagination.total = data.Data.TotalCount
          } else {
            this.MQTTPointList = []
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.MQTTPointLoading = false
        })
    }
  }
}
</script>
