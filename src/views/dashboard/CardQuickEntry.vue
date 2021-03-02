<template>
  <el-card shadow="never" class="box-card card-quick-entry">
    <div slot="header" class="clearfix">
      <div style="display: flex;align-items: center;">
        <div class="card-title">快捷入口</div>
        <!--        <el-dropdown :hide-on-click="false" trigger="click">-->
        <!--          <el-button-->
        <!--            type="text"-->
        <!--            style="padding: 0;"-->
        <!--            class="el-dropdown-link"-->
        <!--            :loading="chooseLoading"-->
        <!--          >-->
        <!--            调整-->
        <!--          </el-button>-->
        <!--          <el-dropdown-menu-->
        <!--            slot="dropdown"-->
        <!--            class="dropdown-box"-->
        <!--            v-loading="chooseLoading"-->
        <!--          >-->
        <!--            <el-dropdown-item>-->
        <!--              <el-checkbox-->
        <!--                :indeterminate="isIndeterminate"-->
        <!--                v-model="checkAll"-->
        <!--                @change="handleCheckAllChange"-->
        <!--              >-->
        <!--                {{ choosePointIdList.length }}/{{ typeOptions.length }}-->
        <!--              </el-checkbox>-->
        <!--            </el-dropdown-item>-->
        <!--            <el-checkbox-group-->
        <!--              v-model="choosePointIdList"-->
        <!--              @change="handleCheckedChange"-->
        <!--            >-->
        <!--              <el-dropdown-item-->
        <!--                :divided="index === 0"-->
        <!--                v-for="(item, index) in typeOptions"-->
        <!--                :key="index"-->
        <!--              >-->
        <!--                <el-checkbox :label="item.id" :disabled="item.disabled">{{-->
        <!--                  item.name-->
        <!--                }}</el-checkbox>-->
        <!--              </el-dropdown-item>-->
        <!--            </el-checkbox-group>-->
        <!--          </el-dropdown-menu>-->
        <!--        </el-dropdown>-->
      </div>
    </div>
    <el-row>
      <el-col :span="8">
        <div
          class="entry-btn"
          @click="checkJumpRoutingPermission({ name: 'projectMember' }, [55])"
        >
          <div class="icon-wrap">
            <c-svg name="user2" class="quick-item-icon" />
          </div>

          <span class="btn-text">添加成员</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div
          class="entry-btn"
          @click="
            checkJumpRoutingPermission({ name: 'energyManage_Preview' }, [120])
          "
        >
          <div class="icon-wrap">
            <c-svg name="linechart" class="quick-item-icon" />
          </div>
          <span class="btn-text">能耗分析</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div
          class="entry-btn"
          @click="checkJumpRoutingPermission({ name: 'repairOrder' }, [40])"
        >
          <div class="icon-wrap">
            <c-svg name="gongdan" class="quick-item-icon" />
          </div>
          <span class="btn-text">添加工单</span>
        </div>
      </el-col>
      <el-col :span="8" v-if="findChildSystem('冷冻冷藏', 'entryCheck')">
        <div class="entry-btn" @click="findChildSystem('冷冻冷藏')">
          <div class="icon-wrap">
            <c-svg name="lengdong1" class="quick-item-icon" />
          </div>
          <span class="btn-text">冷冻冷藏</span>
        </div>
      </el-col>
      <el-col :span="8" v-if="findChildSystem('配电质量', 'entryCheck')">
        <div class="entry-btn" @click="findChildSystem('配电质量')">
          <div class="icon-wrap">
            <c-svg name="peidian" class="quick-item-icon" />
          </div>
          <span class="btn-text">配电质量</span>
        </div>
      </el-col>
      <el-col :span="8" v-if="findChildSystem('环境监测', 'entryCheck')">
        <div class="entry-btn" @click="findChildSystem('环境监测')">
          <div class="icon-wrap">
            <c-svg name="huanjing" class="quick-item-icon" />
          </div>
          <span class="btn-text">环境监测</span>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { checkPermission } from '@/utils/permissions'
import debounce from 'lodash/debounce'
import { getModelListByProject } from '@/api/model'
import store from '@/store'

export default {
  data() {
    return {
      chooseLoading: false,
      isIndeterminate: true,
      checkAll: false,
      typeOptions: [],
      choosePointIdList: []
    }
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    //查找子系统
    findChildSystem(name, type = 'routerCheck') {
      let flag = false
      let path = ''
      let sid = ''
      for (let i = 0; i < this.typeOptions.length; i++) {
        if (name === this.typeOptions[i].name) {
          flag = true
          path = this.typeOptions[i].path
          sid = this.typeOptions[i].BigTypeId
          break
        }
      }
      if (type !== 'routerCheck') {
        return flag
      }
      if (flag) {
        this.$router.push({
          path: path,
          query: { sid, routeType: 'monitorRoute' }
        })
      } else {
        this.$message.error('当前项目暂无此系统')
      }
    },
    //校验权限
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
      let Options = this.typeOptions
      let List = this.choosePointIdList
      let choosePointIdList = []
      List = val
        ? Options.map(item => item.BigTypeId)
        : Options.map(item => {
            if (item.disabled) {
              return item.BigTypeId
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
    //选择器校验
    checkBoxReg() {
      this.checkAll =
        this.choosePointIdList.length > 0 &&
        this.choosePointIdList.length === this.typeOptions.length
      this.isIndeterminate =
        this.choosePointIdList.length > 0 &&
        this.choosePointIdList.length < this.typeOptions.length
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
        this.chooseLoading = true
        getModelListByProject({
          projectId: store.state.app.project.id
        })
          .then(res => {
            let data = res.data
            if (data.Code === 200) {
              this.typeOptions = data.Data
              this.typeOptions.map(item => {
                item.disable = false
              })
            } else {
              this.typeOptions = []
              this.$message.error('获取列表失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.typeOptions = []
            this.$message.error('获取列表失败')
          })
          .finally(() => {
            this.chooseLoading = false
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
.card-quick-entry {
  flex: 1;
  .entry-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 88px;
    .quick-item-icon {
      font-size: 36px;
      color: #1890ff;
    }
    .icon {
      font-size: 37px;
    }
    .btn-text {
      margin-top: 8px;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #8fa2b5;
      line-height: 22px;
      text-align: center;
    }
  }
}
</style>

<style lang="scss">
.card-quick-entry {
  .el-card__body {
    padding: 0;
  }
}
</style>
