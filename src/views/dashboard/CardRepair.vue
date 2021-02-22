<template>
  <el-card shadow="never" class="box-card card-repair">
    <div slot="header" class="clearfix">
      <span class="card-title">维修信息</span>
      <el-button
        type="text"
        style="float: right;padding: 5px 0;"
        @click.native="
          checkJumpRoutingPermission({ name: 'repairOrder' }, [40])
        "
      >
        全部工单
      </el-button>
    </div>
    <div v-nodata="isNoData" v-loading="tableLoading" class="main-body">
      <div v-for="(item, index) in tableData" :key="index" class="list-item">
        <div class="item-top">
          <div class="item-title">
            {{ item.ModelTreeName }}
          </div>
          <div class="item-time">
            {{ _dateFormat(item.CreateTime, 'YYYY-MM-DD HH:mm') }}
          </div>
        </div>
        <div class="item-value">
          {{ item.FaultContent }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import debounce from 'lodash/debounce'
import { checkPermission } from '@/utils/permissions'
import { getNewRepairActivePage } from '@/api/newRepairActive'
import { randomString } from '@/utils'

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
        getNewRepairActivePage({
          CompanyId: this.companyId,
          Status: [1],
          ProjectIdList: [this.projectId],
          BigTypeId: undefined,
          SmallTypeId: undefined,
          EquipmentId: undefined,
          AcceptanceTime: undefined,
          IsApp: false,
          IsMy: true,
          pageSize: 9999,
          pageIndex: 1
        })
          .then(res => {
            let data = res.data
            if (data.Code === 200) {
              this.tableData = data.Data.Data
              this.tableData.forEach(v => {
                v.ref_FaultContent = randomString(10)
              })
            } else {
              this.tableData = []
              this.$message.error('获取维修列表失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.tableData = []
            this.$message.error('获取维修列表失败')
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
.main-body {
  min-height: 200px;
}
.card-repair {
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
}
</style>
<style lang="scss">
.card-repair {
  .el-card__body {
    height: 420px;
    overflow-y: auto;
    padding-top: 0;
  }
}
</style>
