<template>
  <el-row :gutter="20" class="repairTeam">
    <el-col :span="24">
      <div class="left">
        <div class="left-content">
          <c-svg name="team" class="leftImg" />
          <div class="leftName">
            我的团队
          </div>
        </div>
      </div>
      <div class="right">
        <el-col :sm="8" :md="8" :lg="6">
          <div class="mg-bot">
            <el-input
              ref="input"
              v-model.trim="inputTeam"
              placeholder="输入成员手机号，搜索并添加"
              size="large"
              suffix-icon="el-icon-search"
              clearable
              @keyup.enter.native="searchMember"
              @clear="closemember"
            />
          </div>
          <div v-show="memberlist" class="mg-bot">
            <div class="boxShadow resultBox">
              <div style="height:15px;">
                <c-svg
                  name="close"
                  style="float:right;margin-right:15px;"
                  @click.native="closemember"
                />
              </div>
              <div class="resultContent">
                <el-col v-show="!no_memb" :span="24" class="nodata">
                  暂无数据
                </el-col>
                <el-col v-show="no_memb" :span="24" class="record">
                  <span>{{ memberData.nickname }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    class="addCompany"
                    @click="addMember(memberData.id)"
                  >
                    添加
                  </el-button>
                </el-col>
              </div>
              <el-col
                v-show="!no_memb"
                :span="24"
                class="record notice"
                @click.native="invites"
              >
                邀请该手机号主人开通
              </el-col>
            </div>
          </div>
        </el-col>
        <el-col :span="24">
          <div
            class="boxShadow insideBox clearfix"
            style="padding-bottom:15px;"
          >
            <el-table
              :data="memberTable"
              highlight-current-row
              style="width: 100%"
            >
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column label="照片" width="90">
                <template slot-scope="scope">
                  <img
                    :src="scope.row.avatar"
                    style="width:25px;height:25px;margin-top:8px;"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="nickname" label="姓名" min-width="120" />
              <el-table-column
                prop="Describe"
                label="维保范围备注"
                min-width="150"
              />
              <el-table-column prop="mobile" label="联系电话" min-width="150" />
              <el-table-column prop="Email" label="邮箱" min-width="150" />
              <el-table-column prop="cname" label="公司" min-width="180" />
              <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    type="text"
                    class="btn-danger"
                    @click="remove(scope.row.id)"
                  >
                    移除
                  </el-button>
                  <el-button
                    size="small"
                    type="text"
                    @click="updateremark(scope.row.id)"
                  >
                    修改备注
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </div>
    </el-col>
    <el-col :span="24" style="margin-top:20px;">
      <div class="left">
        <div class="left-content">
          <c-svg name="team" class="leftImg" />
          <div class="leftName">
            所属团队
          </div>
        </div>
      </div>
      <div class="right">
        <el-col :span="24">
          <div
            class="boxShadow insideBox clearfix"
            style="padding-bottom:15px;"
          >
            <el-table
              :data="repaircteam"
              highlight-current-row
              style="width:100%"
            >
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column label="照片" width="90">
                <template slot-scope="scope">
                  <img
                    :src="port + scope.row.avatar"
                    style="width:25px;height:25px;margin-top:8px;"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="nickname" label="姓名" min-width="120" />
              <el-table-column prop="Describe" label="描述" min-width="150" />
              <el-table-column prop="mobile" label="联系电话" min-width="150" />
              <el-table-column prop="Email" label="邮箱" min-width="150" />
              <el-table-column prop="cname" label="公司" min-width="180" />
              <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    type="text"
                    class="btn-danger"
                    @click="remove(scope.row.id)"
                  >
                    退出
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import {
  deleteRepairuser,
  updateRepairuser,
  queryrepairuser,
  addrepairuser,
  repairuserList,
  userRepairList,
  registersms,
  invitationrepairuser
} from '@/api/repair'
import { storageName } from '@/utils/index'

export default {
  data() {
    return {
      inputCompany: '',
      inputTeam: '',
      companiselist: false,
      memberlist: false,
      memberTable: [],
      phone: null,
      memberData: {},
      no_memb: false,
      invite: false,
      userInfo: {},
      repaircteam: []
    }
  },
  mounted: function() {
    this.userInfo = JSON.parse(sessionStorage.getItem(storageName('userInfo')))
    this.MemberList()
    this.User_RepairList()
  },
  methods: {
    closemember() {
      this.memberlist = false
      this.$refs.input.$el.querySelector('input').style.borderColor = '#bfcbd9'
    },
    close_m_invite() {
      this.invite = false
    },
    remove(id) {
      this.$confirm('此操作将永远删除该条数据，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteRepairuser(id)
          .then(res => {
            var result = JSON.parse(res.data)
            if (result) {
              this.$message('删除成功')
              this.MemberList()
              this.User_RepairList()
            } else {
              this.$message.error('删除失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      })
    },
    updateremark(id) {
      this.$prompt('请输入备注内容', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        updateRepairuser({ ID: id, Describe: value })
          .then(() => {
            this.MemberList()
            this.User_RepairList()
          })
          .catch(err => {
            console.error(err)
          })
      })
    },
    // 根据手机号查询成员
    searchMember() {
      if (/[^0-9.]/g.test(this.inputTeam) || this.inputTeam.length === 0) {
        this.$refs.input.$el.querySelector('input').style.borderColor = 'red'
      } else {
        this.$refs.input.$el.querySelector('input').style.borderColor =
          '#bfcbd9'
        this.memberlist = true
        queryrepairuser(this.inputTeam)
          .then(res => {
            var data = JSON.parse(res.data)
            if (data) {
              this.memberData = data
              this.no_memb = true
            } else {
              this.no_memb = false
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    // 添加维修成员
    addMember(id) {
      addrepairuser({ RepairUserID: id })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message('添加成功')
            this.memberlist = false
            this.MemberList()
          } else {
            this.$message.error('添加失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 根据用户查询维修成员列表
    MemberList() {
      repairuserList()
        .then(res => {
          this.memberTable = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    User_RepairList() {
      userRepairList()
        .then(res => {
          this.repaircteam = res.data
        })
        .catch(err => {
          console.error(err)
        })
    },
    // invite事件
    invites() {
      // 用户未注册邀请开通
      registersms(this.userInfo.nickname, this.inputTeam)
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            invitationrepairuser({ mobile: this.inputTeam })
              .then(res => {
                var results = JSON.parse(res.data)
                if (results) {
                  this.$message('邀请成功')
                  this.memberlist = false
                  this.inputTeam = ''
                } else {
                  this.$message.error('邀请失败')
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            this.$message.error('邀请失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
<style lang="scss">
.repairTeam {
  font-size: 13px;
  color: #324057;
  margin-top: 20px;
  .boxShadow {
    border-radius: 4px;
    background: #fff;
  }
  .mg-bot {
    margin-bottom: 20px;
  }
  .left {
    height: 235px;
    box-sizing: border-box;
    float: left;
    background: #f6f6f6;
    width: 70px;
    border-radius: 12px;
    .left-content {
      width: 30px;
      text-align: center;
      margin: 0 auto;
      .leftImg {
        width: 26px;
        height: 26px;
        margin: 28px 0 15px;
      }
      .leftName {
        font-size: 20px;
        color: #324057;
        line-height: 36px;
      }
    }
  }
  .right {
    height: 235px;
    width: 100%;
    margin-left: 70px;
    width: -moz-calc(100% - 70px);
    width: -webkit-calc(100% - 70px);
    width: calc(100% - 70px);
    box-sizing: border-box;
    .resultBox {
      height: 130px;
      padding-top: 10px;
      .resultContent {
        height: 80px;
        overflow-y: auto;
        .nodata {
          line-height: 100%;
        }
      }
      .record {
        line-height: 40px;
        .el-button {
          margin-left: 20px;
        }
      }
      .notice {
        color: #58abdf;
        text-decoration: underline;
        cursor: pointer;
      }
    }
    .invitationBox {
      height: 177px;
      padding-top: 25px;
    }
  }
}
</style>
