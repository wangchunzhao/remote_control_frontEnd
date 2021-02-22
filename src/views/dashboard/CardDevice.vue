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
              <el-checkbox
                :indeterminate="isIndeterminate"
                v-model="checkAll"
                @change="handleCheckAllChange"
              >
                {{ choosePointIdList.length }}/{{ tableData.length }}
              </el-checkbox>
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
                <el-checkbox :label="item.id" :disabled="item.disabled">{{
                  item.name
                }}</el-checkbox>
              </el-dropdown-item>
            </el-checkbox-group>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div v-nodata="isNoData" v-loading="tableLoading" class="main-body">
      <div
        v-for="(item, index) in tableData"
        :key="index"
        class="list-item online-item offline-item alarm-item"
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
      chooseLoading: false,
      isIndeterminate: true,
      checkAll: false,
      choosePointIdList: [],

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
    //选择当个点位显示
    handleCheckedChange() {
      this.editDefaultPoint()
    },
    //全选点位显示
    handleCheckAllChange(val) {
      let Options = this.tableData
      let List = this.choosePointIdList
      let choosePointIdList = []
      List = val
        ? Options.map(item => item.id)
        : Options.map(item => {
            if (item.disabled) {
              return item.id
            }
          })
      List.map(item => {
        if (item) {
          choosePointIdList.push(item)
        }
      })
      this.choosePointIdList = [...new Set(choosePointIdList)]
      this.editDefaultPoint()
    },
    checkBoxReg() {
      this.checkAll =
        this.choosePointIdList.length > 0 &&
        this.choosePointIdList.length === this.tableData.length
      this.isIndeterminate =
        this.choosePointIdList.length > 0 &&
        this.choosePointIdList.length < this.tableData.length
    },
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
}
</style>
<style lang="scss">
.card-device {
  .el-card__body {
    height: 400px;
    overflow-y: auto;
    padding-top: 20px;
  }
}
</style>
