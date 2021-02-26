<template>
  <el-dialog
    width="550px"
    title="统计指标"
    class="site-config-dialog"
    append-to-body
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div class="config-box">
      <img
        src="https://cdn.sinocold.net/images/%E7%BB%9F%E8%AE%A1%E6%8C%87%E6%A0%87icon.svg"
        alt=""
      />
      <div class="config-box-right">
        <div style="color: #595959;font-size: 20px;">
          报警统计
        </div>
        <el-switch
          @change="val => handleSwitchChange(val, 'showAlarm')"
          v-model="showAlarm"
        >
        </el-switch>
      </div>
    </div>
    <div class="config-box">
      <img
        src="https://cdn.sinocold.net/images/%E7%BB%9F%E8%AE%A1%E6%8C%87%E6%A0%87icon.svg"
        alt=""
      />
      <div class="config-box-right">
        <div style="color: #595959;font-size: 20px;">
          维修统计
        </div>
        <el-switch
          @change="val => handleSwitchChange(val, 'showRepair')"
          v-model="showRepair"
        >
        </el-switch>
      </div>
    </div>
    <div class="config-box">
      <img
        src="https://cdn.sinocold.net/images/%E7%BB%9F%E8%AE%A1%E6%8C%87%E6%A0%87icon.svg"
        alt=""
      />
      <div class="config-box-right">
        <div style="color: #595959;font-size: 20px;">
          设备运行
        </div>
        <el-switch
          @change="val => handleSwitchChange(val, 'showDevice')"
          v-model="showDevice"
        >
        </el-switch>
      </div>
    </div>
    <div class="config-box">
      <img
        src="https://cdn.sinocold.net/images/%E7%BB%9F%E8%AE%A1%E6%8C%87%E6%A0%87icon.svg"
        alt=""
      />
      <div class="config-box-right">
        <div style="color: #595959;font-size: 20px;">
          能耗统计
        </div>
        <el-switch
          @change="val => handleSwitchChange(val, 'showEnergy')"
          v-model="showEnergy"
        >
        </el-switch>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { setCompanyTotal } from '@/api/companyTotal'
export default {
  data() {
    return {
      dialogVisible: false,
      showAlarm: true,
      showRepair: true,
      showDevice: true,
      showEnergy: true
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    openDialog(payload) {
      this.dialogVisible = true
      if (payload) {
        this.showAlarm = payload.showAlarm
        this.showRepair = payload.showRepair
        this.showDevice = payload.showDevice
        this.showEnergy = payload.showEnergy
      }
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleSwitchChange(val, type) {
      this.$emit('change', {
        type,
        val
      })
      const typeMap = {
        showAlarm: 0,
        showRepair: 1,
        showDevice: 3,
        showEnergy: 4
      }
      setCompanyTotal({
        CompanyId: this.companyId,
        TotalType: typeMap[type],
        IsEnabled: val
      }).catch(err => {
        console.error(err)
        this.$message.error('设置失败')
      })
    }
  }
}
</script>

<style lang="scss">
.site-config-dialog {
  .el-dialog__body {
    padding: 10px;
    padding-bottom: 30px;
    display: flex;
    flex-wrap: wrap;
  }
  .config-box {
    flex: 0 0 220px;
    display: flex;
    margin: 10px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 10px 0px 10px 20px;
    border-radius: 4px;
    img {
      flex: 0 0 100px;
      width: 100px;
      height: 100px;
    }
    .config-box-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
    }
  }
}
</style>
