<template>
  <div class="gateway-traffic">
    <div style="margin-bottom: 16px;">
      <el-button size="small" @click.native="handleBind">
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
      <el-table-column prop="label1" width="120" class-name="label-column" />
      <el-table-column prop="value1" />
      <el-table-column prop="label2" width="120" class-name="label-column" />
      <el-table-column prop="value2" />
      <el-table-column prop="label3" width="120" class-name="label-column" />
      <el-table-column prop="value3" />
    </el-table>
  </div>
</template>

<script>
import { collectorSIMBinding, getSimMonthInfo } from '@/api/collector'
import { terminalSIMBinding } from '@/api/terminal'
export default {
  props: {
    sim: {
      type: String,
      required: true,
      default: function() {
        return ''
      }
    },
    collectorId: {
      type: Number,
      default: function() {
        return 0
      }
    },
    recordId: {
      type: Number,
      default: function() {
        return 0
      }
    }
  },
  data() {
    return {
      isBindCard: false,
      tableData: []
    }
  },
  watch: {
    sim: {
      handler: function(val) {
        if (val) {
          this.isBindCard = true
          this.simNumber = val
          this.fetchCardInfo()
        } else {
          this.tableData = []
          this.isBindCard = false
          this.simNumber = ''
        }
      },
      immediate: true
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
            if (this.collectorId) {
              collectorSIMBinding({
                CollectorSIM: '',
                CollectorID: this.collectorId
              })
                .then(res => {
                  if (res.data.Code === 200) {
                    this.isBindCard = true
                    this.simNumber = ''
                    this.tableData = []
                    this.$message.success('解绑成功')
                    this.$emit('bind-complete')
                  } else {
                    this.$message.error('解绑失败')
                  }
                })
                .catch(err => {
                  console.error(err)
                  this.$message.error('解绑失败')
                })
            } else {
              terminalSIMBinding({
                terminalSIM: '',
                terminalID: this.recordId
              })
                .then(res => {
                  if (res.data.Code === 200) {
                    this.isBindCard = true
                    this.simNumber = ''
                    this.tableData = []
                    this.$message.success('解绑成功')
                    this.$emit('bind-complete')
                  } else {
                    this.$message.error('解绑失败')
                  }
                })
                .catch(err => {
                  console.error(err)
                  this.$message.error('解绑失败')
                })
            }
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
            if (this.collectorId) {
              collectorSIMBinding({
                CollectorSIM: value,
                CollectorID: this.collectorId
              })
                .then(res => {
                  if (res.data.Code === 200) {
                    this.isBindCard = true
                    this.simNumber = value
                    this.$message.success('通讯卡绑定成功')
                    this.fetchCardInfo()
                    this.$emit('bind-complete')
                  } else {
                    this.$message.error('绑定失败')
                  }
                })
                .catch(err => {
                  console.error(err)
                  this.$message.error('绑定失败')
                })
            } else {
              terminalSIMBinding({
                terminalSIM: value,
                terminalID: this.recordId
              })
                .then(res => {
                  if (res.data.Code === 200) {
                    this.isBindCard = true
                    this.simNumber = value
                    this.$message.success('通讯卡绑定成功')
                    this.fetchCardInfo()
                    this.$emit('bind-complete')
                  } else {
                    this.$message.error('绑定失败')
                  }
                })
                .catch(err => {
                  console.error(err)
                  this.$message.error('绑定失败')
                })
            }
          })
          .catch(() => {})
      }
    },
    fetchCardInfo() {
      getSimMonthInfo({
        sim: this.simNumber
      })
        .then(res => {
          if (res.data.Code === 600) {
            console.error(res.data.Message)
            this.$message.error('流量查询失败')
          } else {
            this.isBindCard = true
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
