<template>
  <el-card shadow="never" class="box-card card-alarm">
    <div slot="header" class="clearfix">
      <span class="card-title">报警</span>
      <el-button
        type="text"
        style="float: right;padding: 5px 0;"
        @click.native="
          checkJumpRoutingPermission({ name: 'alarmManageIndex' }, [34])
        "
      >
        全部报警
      </el-button>
    </div>
    <div v-loading="tableLoading" class="main-body">
      <div v-if="tableData.length === 0" class="no-data">暂无数据</div>
      <div v-for="(item, index) in tableData" :key="index" class="list-item">
        <div class="item-top">
          <div class="item-title">
            {{ item.PointName }}
          </div>
          <div style="flex:1;margin-left: 12px">
            <el-tag
              size="small"
              :type="
                item.Level === 3
                  ? 'primary'
                  : item.Level === 4
                  ? 'info'
                  : item.Level === 2
                  ? 'warning'
                  : 'danger'
              "
            >
              {{
                item.Level === 1
                  ? '紧急'
                  : item.Level === 2
                  ? '重要'
                  : item.Level === 3
                  ? '一般'
                  : '记录'
              }}
            </el-tag>
          </div>
          <div class="item-time">
            {{ _dateFormat(item.Acttime, 'YYYY-MM-DD HH:mm') }}
          </div>
        </div>
        <div class="item-value">
          {{ item.AlarmType }}
        </div>
      </div>
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
      time: 60  // 获取电费预警延时 单位s
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
          num: 10,
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
.card-alarm {
  .list-item {
    &:first-of-type {
      padding-top: 0;
    }
    padding: 16px 0;
    border-bottom: 1px solid #e9e9e9;
  }
  .item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .item-title {
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 22px;
  }
  .item-time {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #8fa2b5;
    line-height: 20px;
  }
  .item-value {
    width: 100%;
    font-size: 16px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #8fa2b5;
    line-height: 22px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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
.card-alarm {
  .el-card__body {
    height: 420px;
    overflow-y: auto;
    padding-top: 20px;
  }
}
</style>
