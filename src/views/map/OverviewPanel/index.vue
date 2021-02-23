<template>
  <div class="map-overview">
    <div class="main-wrap">
      <div class="top-tool">
        <el-dropdown @command="filterBySubarea">
          <div class="subarea-select-trigger">
            所有项目
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
        <c-svg class="full-screen-btn" name="quanping"></c-svg>
      </div>
      <div class="flex-row">
        <div class="item1">
          <div class="value-text">
            188
            <c-svg style="color: #00EE9F;" class="icon" name="mendian"></c-svg>
          </div>
          <div class="label-text">门店数量</div>
        </div>
        <div class="item1">
          <div class="value-text">
            188
            <c-svg style="color: #FFCF02;" class="icon" name="baojing"></c-svg>
          </div>
          <div class="label-text">当前报警</div>
        </div>
        <div class="item1">
          <div class="value-text">
            188
            <c-svg style="color: #00C0FF;" class="icon" name="nenghao1"></c-svg>
          </div>
          <div class="label-text">今日能耗</div>
        </div>
      </div>

      <div class="section-wrap">
        <div class="section-head" style="background-color: #15D37B;">
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
              540
              <span style="font-size: 20px;margin-left: -10px;">/640</span>
            </div>
          </div>
          <div>
            <div class="label-text">在线机组</div>
            <div class="value-text">
              74
              <span style="font-size: 20px;margin-left: -10px;">/90</span>
            </div>
          </div>
        </div>
      </div>
      <div class="section-wrap">
        <div class="section-head" style="background-color: #FFCF02;">
          <span>
            报警统计
          </span>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="flex-row" style="padding: 0 16px;">
          <div>
            <div class="label-text">今日报警</div>
            <div class="value-text">
              188
            </div>
          </div>
          <div>
            <div class="label-text">本月报警</div>
            <div class="value-text">
              188
            </div>
          </div>
          <div>
            <div class="label-text">上月报警</div>
            <div class="value-text">
              188
            </div>
          </div>
        </div>
      </div>

      <div class="section-wrap">
        <div class="section-head" style="background-color: #00C0FF;">
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
              188
              <span class="secondary-text">万度</span>
            </div>
          </div>
          <div>
            <div class="label-text">本月能耗</div>
            <div class="value-text">
              188
              <span class="secondary-text">万度</span>
            </div>
          </div>
          <div>
            <div class="label-text">上月能耗</div>
            <div class="value-text">
              188
              <span class="secondary-text">万度</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-wrap">
        <div class="section-head" style="background-color: #782BFF;">
          <span>
            维修统计
          </span>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="flex-row" style="padding: 0 16px;">
          <div>
            <div class="label-text">待接单</div>
            <div class="value-text">
              188
            </div>
          </div>
          <div>
            <div class="label-text">待签到</div>
            <div class="value-text">
              188
            </div>
          </div>
          <div>
            <div class="label-text">维保中</div>
            <div class="value-text">
              188
            </div>
          </div>
          <div>
            <div class="label-text">待验收</div>
            <div class="value-text">
              188
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="edit-btn">
        编辑
      </div>
    </div>
  </div>
</template>

<script>
import { getUserSubareaList } from '@/api/subarea'

export default {
  data() {
    return {
      subareaOptions: [],
      subareaId: ''
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  watch: {
    companyId() {
      this.fetchSubareaOptions()
    }
  },
  mounted() {
    this.fetchSubareaOptions()
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.map-overview {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  margin-top: 50px;
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
      cursor: pointer;
    }
  }
  .section-wrap {
    margin-top: 26px;
  }
  .section-head {
    margin: 0 11px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px;
    margin-bottom: 10px;
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
