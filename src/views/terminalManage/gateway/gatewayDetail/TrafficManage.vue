<template>
  <div class="gateway-traffic">
    <div style="margin-bottom: 16px;">
      <el-button v-if="editPermission" size="small" @click.native="handleBind">
        {{ isBindCard ? '解除绑定' : '绑定通讯卡' }}
      </el-button>
    </div>
    <el-table
      :data="tableData"
      :show-header="false"
      border
      style="width: 100%"
      element-loading-text="加载中..."
    >
      <el-table-column prop="label1" class-name="label-column" />
      <el-table-column prop="value1" />
      <el-table-column prop="label2" class-name="label-column" />
      <el-table-column prop="value2" />
      <el-table-column prop="label3" class-name="label-column" />
      <el-table-column prop="value3" />
    </el-table>
  </div>
</template>

<script>
import {
  cardUsageInfo,
  deviceBindICCID,
  deviceUnBindICCID
} from '@/api/device_new'
export default {
  props: {
    deviceId: {
      type: Number,
      required: true,
      default: function() {
        return 0
      }
    },
    editPermission: Boolean
  },
  data() {
    return {
      isBindCard: false,
      tableData: []
    }
  },
  watch: {
    deviceId() {
      this.fetchCardInfo()
    }
  },
  computed: {
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  methods: {
    // 绑定通讯卡
    handleBind() {
      if (this.isBindCard) {
        this.$confirm('解绑后将无法查看通讯卡信息，确认要解除绑定？', '提示', {
          type: 'warning'
        })
          .then(() => {
            deviceUnBindICCID(this.deviceId)
              .then(res => {
                if (res.data.Code === 200) {
                  this.$message.success('解绑成功')
                  this.isBindCard = false
                  this.tableData = []
                } else {
                  this.$message.error('解绑失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('解绑失败')
              })
          })
          .catch(() => {})
      } else {
        this.$prompt('绑定通讯卡', '', {
          inputValue: '',
          confirmButtonText: '确定',
          inputPlaceholder: '请输入通讯卡号',
          inputValidator: function(value) {
            if (value.length) {
              return true
            } else {
              return '请填写卡号'
            }
          },
          inputErrorMessage: '',
          cancelButtonText: '取消'
        })
          .then(({ value }) => {
            deviceBindICCID({
              ICCID: value,
              deviceID: this.deviceId
            })
              .then(res => {
                if (res.data.Code === 200) {
                  this.isBindCard = true
                  this.$message.success('通讯卡绑定成功')
                  this.fetchCardInfo()
                } else {
                  this.$message.error(res.data.Message)
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('绑定失败')
              })
          })
          .catch(() => {})
      }
    },
    fetchCardInfo() {
      cardUsageInfo(this.deviceId)
        .then(res => {
          if (res.data.Code === 600) {
            // this.$message(res.data.Message)
            console.error(res.data.Message)
            this.$emit('updateBindState', false)
          } else {
            console.log('[127]-TrafficManage.vue', res)
            this.isBindCard = true
            this.$emit('updateBindState', true)
            const data = res.data.Data
            this.tableData = [
              {
                label1: '通讯卡号',
                value1: data.iccid,
                label2: '运行状态',
                value2: this.handleStatus(data.account_status),
                label3: '运营商',
                value3:
                  data.carrier === 0
                    ? '中国移动'
                    : data.carrier === 1
                    ? '中国联通'
                    : data.carrier === 2
                    ? '中国通信'
                    : ''
              },
              {
                label1: '流量套餐',
                value1: data.data_plan,
                label2: '本月用量/MB',
                value2: data.data_usage,
                label3: '剩余流量/MB',
                value3: data.data_balance
              },
              {
                label1: '激活日期',
                value1: data.active_date,
                label2: '计费结束日期',
                value2: data.expiry_date
              }
            ]
          }
          console.log('[163]-TrafficManage.vue', this.tableData)
        })
        .catch(err => {
          console.error(err)
        })
    },
    handleStatus(status) {
      switch (status) {
        case '00':
          return '正使用'
        case '10':
          return '测试期'
        case '02':
          return '停机'
        case '03':
          return '预销号'
        case '04':
          return '销号'
        case '11':
          return '沉默期'
        case '12':
          return '停机保号'
        case '99':
          return '未知'
        default:
          break
      }
    }
  }
}
</script>

<style lang="scss">
.gateway-traffic {
  .label-column {
    background-color: #f2f6fc !important;
  }

  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: #fff;
  }
}
</style>
