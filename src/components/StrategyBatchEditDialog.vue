<template>
  <el-dialog
    width="560px"
    title="批量设置"
    custom-class="crop-dialog"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="noticeForm"
      :model="noticeForm"
      label-width="80px"
      size="small"
    >
      <div class="custom-panel">
        <div class="custom-panel-header">
          通知规则
        </div>
        <div class="custom-panel-body">
          <div class="box-light">
            <div style="margin-bottom: 15px;">
              <span class="box-light-title-weight">
                通知方式
              </span>
              <el-tooltip
                class="item"
                effect="dark"
                content="使用短信方式通知需要支付相关通信费用"
                placement="right"
              >
                <c-svg name="attention" style="font-size: 16px;" />
              </el-tooltip>
            </div>
            <div class="notice-row">
              <span class="box-light-title">记录报警：</span>
              <span style="height: 37px;line-height: 37px;color:#606266;"
                >不通知</span
              >
            </div>
            <div class="notice-row">
              <span class="box-light-title">一般报警：</span>
              <el-form-item label-width="0">
                <el-checkbox-group v-model="noticeForm.normal">
                  <el-checkbox label="弹屏" />
                  <el-checkbox label="App" />
                  <el-checkbox label="微信" />
                  <el-checkbox label="短信" />
                </el-checkbox-group>
              </el-form-item>
            </div>
            <div class="notice-row">
              <span class="box-light-title">重要报警：</span>
              <el-form-item label-width="0">
                <el-checkbox-group v-model="noticeForm.important">
                  <el-checkbox label="弹屏" />
                  <el-checkbox label="App" />
                  <el-checkbox label="微信" />
                  <el-checkbox label="短信" />
                </el-checkbox-group>
              </el-form-item>
            </div>
            <div class="notice-row">
              <span class="box-light-title">紧急报警：</span>
              <el-form-item label-width="0">
                <el-checkbox-group v-model="noticeForm.emergency">
                  <el-checkbox label="弹屏" />
                  <el-checkbox label="App" />
                  <el-checkbox label="微信" />
                  <el-checkbox label="短信" />
                </el-checkbox-group>
              </el-form-item>
            </div>
          </div>
        </div>
      </div>

      <div class="custom-panel contact-user">
        <div class="custom-panel-header">
          联系人
          <user-select :data="userList" @change="selectUser">
            <el-button
              type="primary"
              size="mini"
              circle
              icon="el-icon-plus"
              style="margin-left: 7px;"
            />
          </user-select>
        </div>
        <div class="custom-panel-body">
          <div
            class="box-light"
            v-for="(item, index) in contactTableData"
            :key="index"
          >
            <div class="notice-row">
              <div class="box-light-title">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="使用短信、语音电话方式通知需要支付相关通信费用"
                  placement="right"
                >
                  <c-svg name="attention" style="font-size: 16px;" />
                </el-tooltip>
                姓名
              </div>
              <el-select
                v-model="item.text"
                filterable
                placeholder="请输入名称"
                style="width: 245px"
                size="small"
                :filter-method="inputSelectFilter"
              >
                <el-option
                  v-for="item1 in userFilterList"
                  :key="item1.Key"
                  :label="item1.Value"
                  :value="item1.Key"
                  :class="item1.Key === userId ? 'now-user-item' : 'user-item'"
                  :disabled="item1.Key === userId"
                >
                  <el-image class="user-img" :src="item1.Extend" />
                  <span class="user-name">{{ item1.Value }}</span>
                  <span class="user-phone">{{ item1.Title }}</span>
                </el-option>
              </el-select>
              <div class="notice-user-phone">15574336353</div>
              <c-svg
                style="font-size: 18px;color: #19AD19;"
                name="wechat-fill"
              />
              <el-link :underline="false" @click="handleDelete(index)">
                <c-svg
                  name="delete"
                  style="font-size: 18px;color: #F56C6C;margin-left: 15px"
                ></c-svg>
              </el-link>
            </div>
            <div class="notice-row">
              <div class="box-light-title">接收通知等级</div>
              <el-select
                v-model="item.levels"
                filterable
                placeholder="请输入名称"
                style="width: 245px"
                size="small"
              >
                <el-option label="一般" :value="3" />
                <el-option label="重要" :value="2" />
                <el-option label="紧急" :value="1" />
              </el-select>
            </div>
            <div class="notice-row">
              <div class="box-light-title">接收时间段</div>
              <el-time-picker
                v-model="item.startTime"
                format="HH:mm:ss"
                range-separator="至"
                :clearable="false"
                placeholder="开始时间"
                size="small"
                style="width: 115px;"
              />
              <div>至</div>
              <el-time-picker
                v-model="item.endTime"
                format="HH:mm:ss"
                :clearable="false"
                placeholder="结束时间"
                size="small"
                style="width: 115px;"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="custom-panel">
        <div class="custom-panel-header">
          <el-link
            :underline="false"
            @click="
              () => {
                showMoreOption = !showMoreOption
              }
            "
            style="color: #199BFF"
          >
            高级选项
            <i class="el-icon-arrow-down" v-show="!showMoreOption"></i>
            <i class="el-icon-arrow-up" v-show="showMoreOption"></i>
          </el-link>
        </div>
        <div class="custom-panel-body" v-show="showMoreOption">
          <div class="box-light">
            <div style="position:relative;">
              <span class="box-light-title-weight">
                清除时通知
              </span>
              <el-switch
                v-model="noticeForm.recovery"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                style=""
              />
            </div>
          </div>
          <div class="box-light" style="margin-top: 24px;">
            <div style="margin-bottom: 15px;position:relative;">
              <span class="box-light-title-weight">
                重复通知
              </span>
              <el-switch
                v-model="noticeForm.repeatCheck"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                style=""
                @change="$refs['noticeForm'].validate()"
              />
            </div>
            <div class="notice-row">
              <span class="box-light-title">报警持续</span>
              <el-form-item label-width="0" prop="repeatTime">
                <el-input
                  v-model.trim="noticeForm.repeatTime"
                  :disabled="!noticeForm.repeatCheck"
                  placeholder="请输入"
                  style="width: 70px;"
                />
              </el-form-item>
              <span style="margin-top: 10px;margin-left:10px;color:#656565;"
                >分钟无响应，产生新消息通知</span
              >
            </div>
          </div>
        </div>
      </div>
    </el-form>
    <span slot="footer">
      <el-button size="medium" type="primary" @click.native="submit"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import UserSelect from './UserSelect'
import { queryProjectConcats } from '@/api/alarmStrategyNew'
export default {
  components: {
    UserSelect
  },
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    }
  },
  computed: {
    userId: function() {
      return this.$store.state.app.userInfo.uid
    }
  },
  data() {
    return {
      dialogVisible: false,
      showMoreOption: false,
      idList: [],
      userList: [],
      userFilterList: [],
      contactTableData: [{}],

      noticeForm: {
        normal: ['微信', 'App'],
        important: ['微信', 'App'],
        emergency: ['弹屏', '微信', 'App'],
        recovery: false,
        repeatCheck: false,
        repeatTime: undefined
      }
    }
  },
  created() {
    this.fetchUserList()
  },
  methods: {
    openDialog(idList) {
      this.dialogVisible = true
      this.$refs.noticeForm && this.$refs.noticeForm.clearValidate()
      this.idList = idList
    },
    handleClose() {
      this.dialogVisible = false
      this.idList = []
      this.contactTableData = []
      this.userFilterList = this.userList
    },
    handleAdd() {
      this.contactTableData.push({})
    },
    handleDelete(index) {
      this.contactTableData.splice(index, 1)
    },
    submit() {},
    fetchUserList(strategyID = 0) {
      this.userList = []
      this.userFilterList = []
      // queryProjectConcats({
      //   strategyID: strategyID,
      //   project: this.basicForm.project
      // })
      //     .then(res => {
      //       if (res.data.Code === 200) {
      //         const data = res.data.Data
      //         data.forEach(item => {
      //           if (!item.levels) {
      //             item.levels = []
      //           }
      //         })
      //         this.userList = data
      //       }
      //     })
      //     .catch(err => {
      //       console.error(err)
      //     })
    },
    // 选择联系人
    selectUser(user) {
      if (user.check) {
        user.range = [
          new Date('2016', '9', '06', '00', '00', '00'),
          new Date('2016', '9', '06', '23', '59', '59')
        ]
        // 默认选中所有的通知等级
        user.levels = [1, 2, 3]
        this.contactTableData.push(user)
      } else {
        this.contactTableData = this.contactTableData.filter(
          item => item.userId !== user.userId
        )
      }
    },
    // 用户名称全值筛选
    inputSelectFilter(val) {
      this.userFilterList = this.userList.filter(item => item.Value === val)
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-panel {
  background: rgba(255, 255, 255, 1);
  border-radius: 5px;
}
.custom-panel-header {
  padding: 16px 0;
  font-size: 16px;
  font-weight: bold;
  color: #3c3c3c;
}
.box-light {
  position: relative;
  padding: 24px;
  background: rgba(250, 250, 250, 1);
  border-radius: 5px;
  & + .box-light {
    margin-top: 24px;
  }
}
.delete-icon-btn {
  margin-right: 10px;
  color: #ff4d4f;
  i {
    font-size: 16px;
  }
  &:hover {
    color: #ff7875;
  }
}
.box-light-title-weight {
  margin-right: 24px;
  font-size: 14px;
  font-weight: bold;
}
.box-light-title {
  margin-right: 5px;
  color: #656565;
}
.attention-text {
  color: #878787;
}
.notice-row {
  display: flex;
  align-items: center;
  .el-form-item {
    margin-bottom: 0;
  }
}
.contact-user {
  margin-bottom: 15px;
  .box-light {
    padding: 12px 0 12px 12px;
  }
  .box-light-title {
    width: 90px;
    text-align: right;
  }
  .notice-row {
    margin-bottom: 12px;
  }
}
.notice-user-phone {
  margin-left: 8px;
  margin-right: 5px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #000000;
  line-height: 20px;
}
.now-user-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  line-height: 21px;
  height: 40px;
}
.user-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
  line-height: 21px;
  height: 40px;
}
.user-img {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 15px;
}
.user-name {
  margin-left: 15px;
}
.user-phone {
  margin-left: 15px;
}
</style>
