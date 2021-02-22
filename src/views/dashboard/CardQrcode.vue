<template>
  <el-card shadow="never" class="box-card card-qrcode">
    <div slot="header" class="clearfix">
      <span class="card-title">微信公众号</span>
    </div>
    <div class="main-body">
      <div class="qicode-box">
        <img
          class="qrcode"
          src="https://front-end-assets.oss-cn-shanghai.aliyuncs.com/images/c1db124cb50e5f47c2a2e4ca5ce021e5.png"
          alt=""
        />
      </div>
      <div class="qrcode-text">扫码关注，绑定后接收报警推送</div>
    </div>
  </el-card>
</template>

<script>
import debounce from 'lodash/debounce'
import { checkPermission } from '@/utils/permissions'
import { getAlarmAct } from '@/api/alarmActive'

export default {
  data() {
    return {
      tableLoading: false,
      isNoData: false,
      tableData: [],
      timer: null, // 定时器
      time: 60 // 获取电费预警延时 单位s
    }
  },
  computed: {
    project() {
      return this.$store.state.app.project
    }
  },
  created() {
    this.clearTimer()
    this.fetchTableData()
    const _this = this
    this.timer = setInterval(() => {
      _this.fetchTableData()
    }, _this.time * 1000)
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    checkJumpRoutingPermission(routerParmas = {}, permission = []) {
      if (checkPermission(permission)) {
        this.$router.push(routerParmas)
      } else {
        this.$message.error('当前账号暂无相关权限,请联系管理员')
      }
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        getAlarmAct({
          pid: undefined,
          page: 1,
          num: 99999,
          bstime: undefined,
          betime: undefined,
          area: [this.project.id].join(','),
          acontent: undefined,
          IsRepair: false,
          commentUser: undefined,
          type: undefined,
          companyId: this.companyId,
          status: 0,
          ContinuedStartTime: undefined,
          ContinuedEndTime: undefined
        })
          .then(res => {
            let data = res.data
            if (data.Code === 200) {
              this.tableData = data.Data.Data
              this.tableData.forEach(item => {
                item.NoticeUser = item.NoticeUser && item.NoticeUser.split(';')
              })
            } else {
              this.tableData = []
              this.$message.error('获取报警列表失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.tableData = []
            this.$message.error('获取报警列表失败')
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
.card-qrcode {
  height: 330px;
}
.qicode-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qrcode {
  width: 213px;
  height: 213px;
}
.qrcode-text {
  margin-top: 5px;
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #8fa2b5;
  line-height: 22px;
  text-align: center;
}
</style>
