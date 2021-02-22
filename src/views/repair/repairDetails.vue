<template>
  <div class="r-details pdg2">
    <div>
      <div class="info_module">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="r-info">
              <c-svg name="repire" class="r-info-icon" />
              <h1 class="r-num">单号：{{ essentialInfo.Repair_Orderno }}</h1>
            </div>
          </el-col>
          <el-col :span="12">
            <el-col
              :span="24"
              style="text-align:right;margin-right:20px"
              class="r-rinfo"
            >
              <el-button size="small" @click="repairPrint">
                打印
              </el-button>
              <el-button size="small" disabled>
                导出
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == -1 &&
                    userInfo.uid === essentialInfo.Companyid
                "
                size="small"
                type="primary"
                @click="handleSubmit"
              >
                提交
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == -1 &&
                    userInfo.uid === essentialInfo.Companyid
                "
                size="small"
                type="primary"
                @click="handleDelete"
              >
                删除
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 0 &&
                    userInfo.uid === essentialInfo.Companyid
                "
                size="small"
                type="primary"
                @click="handleRevoke"
              >
                撤销
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 0 &&
                    userInfo.uid === essentialInfo.Repair_unitID
                "
                size="small"
                type="primary"
                @click="handleReceive"
              >
                受理
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 1 &&
                    userInfo.uid === essentialInfo.Repair_unitID
                "
                size="small"
                type="primary"
                @click="handleDivision"
              >
                派工
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 1 &&
                    userInfo.uid === essentialInfo.Repair_unitID
                "
                size="small"
                type="primary"
                @click="handleAccept"
              >
                维修
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 1 &&
                    userInfo.uid === essentialInfo.Repair_unitID
                "
                size="small"
                type="primary"
                @click.native="remoteDialogVisible = true"
              >
                远程
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 2 &&
                    userInfo.uid === essentialInfo.Repair_UserID
                "
                size="small"
                type="primary"
                @click="handleAccept"
              >
                接受
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 2 &&
                    userInfo.uid === essentialInfo.Repair_UserID
                "
                size="small"
                type="primary"
                @click="refuseDialogVisible = true"
              >
                拒绝
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 3 &&
                    userInfo.uid === essentialInfo.Repair_UserID
                "
                size="small"
                type="primary"
                @click="handleFinished"
              >
                完工
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 4 &&
                    (userInfo.uid === essentialInfo.Repair_unitID ||
                      userInfo.uid === essentialInfo.Companyid)
                "
                size="small"
                type="primary"
                @click="checkDialogVisible = true"
              >
                验收
              </el-button>
              <el-button
                v-show="
                  essentialInfo.Status == 5 &&
                    userInfo.uid === essentialInfo.Companyid
                "
                size="small"
                type="primary"
                @click="rateDialogVisible = true"
              >
                评价
              </el-button>
            </el-col>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="16">
            <div style="padding:10px 40px;">
              <el-col :span="10" class="table-cell">
                <div class="table-title">
                  报修人：
                </div>
                <div>{{ essentialInfo.Repair_man }}</div>
              </el-col>
              <el-col :span="14" class="table-cell">
                <div class="table-title">
                  故障设备：
                </div>
                <div>
                  {{ essentialInfo.bigname }}{{ essentialInfo.Smallname }}
                </div>
              </el-col>
              <el-col :span="10" class="table-cell">
                <div class="table-title">
                  报修时间：
                </div>
                <div>{{ essentialInfo.CreateTime }}</div>
              </el-col>
              <el-col :span="14" class="table-cell">
                <div class="table-title">
                  希望完成日期：
                </div>
                <div>{{ essentialInfo.Desired_date }}</div>
              </el-col>
              <el-col :span="10" class="table-cell">
                <div class="table-title">
                  项目：
                </div>
                <div>{{ essentialInfo.address }}{{ essentialInfo.pname }}</div>
              </el-col>
              <el-col :span="14" class="table-cell">
                <div class="table-title">
                  故障描述：
                </div>
                <div class="table-describe">
                  {{ essentialInfo.Fault_description }}
                </div>
                <div
                  v-show="essentialInfo.photo !== null"
                  style="color:#409EFF;cursor:pointer;"
                  @click="imgDialog(essentialInfo.photo)"
                >
                  <c-svg name="img" class="r-img" />查看照片
                </div>
              </el-col>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="r-rinfos">
              <div class="rinfo-title">
                状态
              </div>
              <div class="rinfo-status">
                {{
                  essentialInfo.Status == -1
                    ? '未提交'
                    : essentialInfo.Status == 0
                    ? '待受理'
                    : essentialInfo.Status == 1
                    ? '待派工'
                    : essentialInfo.Status == 2
                    ? '待接单'
                    : essentialInfo.Status == 3
                    ? '维修中'
                    : essentialInfo.Status == 4
                    ? '待验收'
                    : essentialInfo.Status == 5
                    ? '已完成'
                    : '已评价'
                }}
              </div>
            </div>
            <div class="r-rinfos">
              <div class="rinfo-title">
                评价
              </div>
              <el-rate v-model="essentialInfo.evaluate" disabled class="star" />
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div>
      <div class="info_module">
        <div class="el-steps el-steps--horizontal">
          <div
            v-for="(item, index) in stepInfo"
            :key="index"
            class="el-step is-horizontal is-center"
            style="flex-basis: 25%;"
          >
            <div
              class="el-step__head"
              :class="item.Status == null ? 'is-wait' : 'is-finish'"
            >
              <div class="el-step__line" style="margin-right: 0px;">
                <i
                  class="el-step__line-inner"
                  :class="item.Status == null ? 'step_noline' : 'step_line'"
                  style="width: 100%;"
                />
              </div>
              <el-popover
                placement="top-start"
                :title="item.Operator"
                width="200"
                trigger="hover"
                :disabled="item.Status == null"
              >
                <div
                  style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
                >
                  <span>维保范围：</span
                  ><span :title="item.Description">{{ item.Description }}</span>
                </div>
                <div
                  style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
                >
                  <span>公司：</span
                  ><span :title="item.Company">{{ item.Company }}</span>
                </div>
                <div>电话：{{ item.Phone }}</div>
                <div slot="reference" class="el-step__icon is-text">
                  <div class="el-step__icon-inner">
                    <c-svg
                      v-show="item.Status == null ? false : true"
                      name="duihao"
                      class="r-step-img"
                    />{{ item.Status != null ? '' : index + 1 }}
                  </div>
                </div>
              </el-popover>
            </div>
            <div class="el-step__main">
              <div
                class="el-step__title"
                :class="item.Status == null ? 'is-wait' : 'is-finish'"
              >
                {{
                  index == 0
                    ? '报修发起'
                    : index == 1
                    ? '受理报修'
                    : index == 2
                    ? '维修接单'
                    : index == 3
                    ? '维修验收'
                    : '完工'
                }}
              </div>
              <div
                class="el-step__executor"
                :class="item.Status == null ? 'is-wait' : 'is-finish'"
              >
                {{ item.Operator }}
              </div>
              <div
                class="el-step__description"
                :class="item.Status == null ? 'is-wait' : 'is-finish'"
              >
                {{ item.CreateTime }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="info_table clearfix">
        <el-col :span="24" class="commonHeader" style="padding:0 20px">
          <span class="commonTitle">操作日志</span>
        </el-col>
        <el-table :data="tableLog" style="padding:15px;">
          <el-table-column prop="Action" label="操作类型" min-width="180" />
          <el-table-column prop="Operator" label="操作人" min-width="180" />
          <el-table-column prop="CreateTime" label="操作时间" min-width="180" />
          <el-table-column prop="Description" label="备注" min-width="180" />
          <el-table-column label="操作详情" min-width="100">
            <template>
              <el-button type="text">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页小工具-->
        <!-- <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="Pagesize" :page-sizes="[15, 25,50]"
                :page-size="show_number" layout="total, sizes, prev, pager, next, jumper" :total="total" style="text-align:center;margin-top:5px">
                </el-pagination> -->
      </div>
    </div>
    <el-dialog
      class="imgdialog"
      :visible.sync="imgDialogVisible"
      style="margin-top: 0;"
    >
      <el-carousel :interval="5000" arrow="always">
        <el-carousel-item v-for="item in seeBigImg" :key="item">
          <img width="100%" height="100%" :src="item" alt="" />
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
    <!-- 撤销弹窗 -->
    <el-dialog
      title="撤销"
      :visible.sync="revokeDialogVisible"
      class="dialogBox"
    >
      <el-form ref="revokeForm" :model="revokeForm" label-position="right">
        <el-form-item label="撤销原因" label-width="80px" prop="revokeReason">
          <el-select
            v-model="revokeForm.revokeReason"
            placeholder="请选择撤销原因"
            style="width:100%"
          >
            <el-option key="1" label="误报" value="误报" />
            <el-option key="2" label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="备注信息"
          label-width="80px"
          prop="revokeRemark"
          style="margin-bottom:0;"
        >
          <el-input
            v-model="revokeForm.revokeRemark"
            type="textarea"
            :rows="2"
            placeholder="请输入"
            resize="none"
            style="width:100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" style="text-align:center;">
        <el-button type="primary" size="small" @click="submitRevoke">
          提交
        </el-button>
      </div>
    </el-dialog>
    <!-- 派工弹窗 -->
    <el-dialog
      title="主管派工"
      :visible.sync="divisionDialogVisible"
      class="dialogBox"
    >
      <el-form
        ref="divisionForm"
        :model="divisionForm"
        :rules="rules"
        label-position="right"
      >
        <el-form-item label="服务类型" label-width="100px" prop="repairType">
          <el-select
            v-model="divisionForm.repairType"
            placeholder="请选择服务类型"
            style="width:100%;"
          >
            <el-option
              v-for="item in ways"
              :key="item.id"
              :label="item.name"
              :value="item.id.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="派工" label-width="100px" prop="repairMan">
          <el-select
            v-model="divisionForm.repairMan"
            placeholder="请选择维修工"
            style="width:100%;"
            @change="changeValue"
          >
            <el-option
              v-for="item in manList"
              :key="item.id"
              :label="item.nickname"
              :value="item.RepairUserID.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="指定服务时间"
          label-width="100px"
          prop="repairDate"
        >
          <el-date-picker
            v-model="divisionForm.repairDate"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            style="width:100%;"
          />
        </el-form-item>
        <el-form-item
          label="备注"
          label-width="100px"
          prop="remark"
          style="margin-bottom:0;"
        >
          <el-input
            v-model="divisionForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入10字以上"
            resize="none"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button
          type="primary"
          size="small"
          @click="submitDivision('divisionForm')"
        >
          提交
        </el-button>
      </div>
    </el-dialog>
    <!-- 远程维修弹窗 -->
    <el-dialog
      title="主管远程维修"
      :visible.sync="remoteDialogVisible"
      class="dialogBox"
    >
      <div class="ct">
        处理方法
      </div>
      <el-input
        v-model="repairWay"
        type="textarea"
        :rows="2"
        placeholder="请输入10字以上"
        resize="none"
      />
      <div class="cm">
        处理结果
      </div>
      <el-input
        v-model="repairResult"
        type="textarea"
        :rows="2"
        placeholder="请输入10字以上"
        resize="none"
      />
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button type="primary" size="small" @click="submitRemote">
          提交
        </el-button>
      </div>
    </el-dialog>
    <!-- 拒单弹窗 -->
    <el-dialog
      title="维修工拒绝接单"
      :visible.sync="refuseDialogVisible"
      class="dialogBox"
    >
      <el-form
        ref="refuseForm"
        :model="refuseForm"
        :rules="refuseRule"
        label-position="right"
      >
        <el-form-item label="拒绝原因" label-width="100px" prop="refuseReason">
          <el-select
            v-model="refuseForm.refuseReason"
            placeholder="请选择拒绝原因"
            style="width:100%;"
          >
            <el-option key="1" label="时间冲突" value="时间冲突" />
            <el-option key="2" label="出差在外" value="出差在外" />
            <el-option key="3" label="无法维修" value="无法维修" />
            <el-option key="4" label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="详细说明"
          label-width="100px"
          prop="refuseRemark"
          style="margin-bottom:0;"
        >
          <el-input
            v-model="refuseForm.refuseRemark"
            type="textarea"
            :rows="2"
            placeholder="请输入10字以上"
            resize="none"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align:center;">
        <el-button
          type="primary"
          size="small"
          @click="submitRefuse('refuseForm')"
        >
          提交
        </el-button>
      </div>
    </el-dialog>
    <!-- 验收弹窗 -->
    <el-dialog
      title="验收"
      :visible.sync="checkDialogVisible"
      class="dialogBox"
    >
      <div class="passBtn">
        <el-button
          size="small"
          :class="show == true ? 'el-button--primary' : ''"
          @click="handlePass(1)"
        >
          通过
        </el-button>
        <el-button
          size="small"
          :class="show == false ? 'el-button--primary' : ''"
          @click="handlePass(2)"
        >
          不通过
        </el-button>
      </div>
      <div v-show="!show">
        <div class="passBtn">
          <el-button
            size="small"
            :class="nopass == 4 ? 'el-button--primary' : ''"
            @click="handleCheckFailure(4)"
          >
            补全信息
          </el-button>
          <el-button
            size="small"
            :class="nopass == 3 ? 'el-button--primary' : ''"
            @click="handleCheckFailure(3)"
          >
            二次维修
          </el-button>
          <el-button
            size="small"
            :disabled="disabled"
            :class="nopass == 1 ? 'el-button--primary' : ''"
            @click="handleCheckFailure(1)"
          >
            重新派工
          </el-button>
        </div>
        <div class="cm">
          详细说明
        </div>
        <el-input
          v-model="repairResult"
          type="textarea"
          :rows="2"
          placeholder="请输入10字以上"
          resize="none"
        />
      </div>
      <div v-show="!show" slot="footer" style="text-align: center;">
        <el-button type="primary" size="small" @click="submitnoPass">
          提交
        </el-button>
      </div>
      <div v-show="show">
        <el-form ref="forms" :model="forms" label-position="right">
          <el-form-item label="维修结算" label-width="100px" prop="pay_type">
            <el-select
              v-model="forms.pay_type"
              placeholder="请选择"
              style="width:100%;"
            >
              <el-option key="1" label="无偿维修" value="1" />
              <el-option key="2" label="有偿结算" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item
            label="维修费用/元"
            label-width="100px"
            prop="pay_money"
          >
            <el-input v-model="forms.pay_money" />
          </el-form-item>
          <el-form-item
            label="验收批注"
            prop="pay_content"
            label-width="100px"
            style="margin-bottom:0;"
          >
            <el-input
              v-model="forms.pay_content"
              type="textarea"
              :rows="2"
              placeholder="请输入10字以上"
              resize="none"
            />
          </el-form-item>
        </el-form>
      </div>
      <div v-show="show" slot="footer" style="text-align: center;">
        <el-button type="primary" size="small" @click="submitPass('forms')">
          提交
        </el-button>
      </div>
    </el-dialog>
    <!-- 评分弹窗 -->
    <el-dialog title="评价" :visible.sync="rateDialogVisible" class="dialogBox">
      <el-form ref="rateForm" :model="rateForm" label-position="right">
        <el-form-item label="评价" label-width="80px" prop="score">
          <el-rate v-model="rateForm.score" class="star" />
        </el-form-item>
        <el-form-item
          label="备注"
          label-width="80px"
          prop="rateRemark"
          style="margin-bottom:0;"
        >
          <el-input
            v-model="revokeForm.rateRemark"
            type="textarea"
            :rows="2"
            placeholder="请输入维修评价......"
            resize="none"
            style="width:100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" style="text-align:center;">
        <el-button type="primary" size="small" @click="submitRate">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  repairDelete,
  repairStatus,
  repairAcceptance,
  repairuserList,
  repairDispatching,
  repairDispatchingAcceptance,
  remoteRepairprocessdetails,
  repairCheck,
  repairEvaluate,
  queryRepairorderReport,
  repairScheduleWebNew,
  repairScheduleLogWebNew
} from '@/api/repair'
import { storageName } from '@/utils/index'

export default {
  data() {
    return {
      imgDialogVisible: false,
      evaluate: null,
      essentialInfo: {},
      port:
        process.env.NODE_ENV === 'production'
          ? 'https://sinocold.net:8443'
          : 'https://sinocold.net:8443',
      seeBigImg: [],
      stepInfo: [],
      tableLog: [],
      userInfo: {},
      revokeDialogVisible: false,
      revokeForm: {
        revokeReason: '',
        revokeRemark: ''
      },
      divisionDialogVisible: false,
      ways: [
        {
          id: 1,
          name: '保内维修'
        },
        {
          id: 2,
          name: '保外维修'
        }
      ],
      divisionForm: {
        repairType: '',
        repairMan: '',
        repairDate: '',
        remark: ''
      },
      rules: {
        repairType: [
          { required: true, message: '请选择服务类型', trigger: 'change' }
        ],
        repairMan: [
          { required: true, message: '请选择维修工', trigger: 'change' }
        ]
      },
      manList: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      NICKNAME: '',
      remoteDialogVisible: false,
      repairWay: '',
      repairResult: '',
      refuseDialogVisible: false,
      refuseForm: {
        refuseReason: '',
        refuseRemark: ''
      },
      refuseRule: {
        refuseReason: [
          { required: true, message: '请选择拒绝类型', trigger: 'change' }
        ],
        refuseRemark: [
          { required: true, message: '请填写拒绝原因', trigger: 'blur' }
        ]
      },
      checkDialogVisible: false,
      nopass: 5,
      show: true,
      disabled: false,
      forms: {
        pay_type: '',
        pay_money: '',
        pay_content: ''
      },
      rateDialogVisible: false,
      rateForm: {
        score: null,
        rateRemark: ''
      }
    }
  },
  mounted() {
    this.userInfo = JSON.parse(sessionStorage.getItem(storageName('userInfo')))
    this.QueryRepair_orderReport()
    this.Repair_ScheduleWebNew()
    this.Repair_ScheduleLogWebNew()
  },
  methods: {
    // 打印
    repairPrint() {
      this.printstatus = true
      // var oldhtml = document.body.innerHTML;
      setTimeout(function() {
        let newhtml = document.getElementById('printId').outerHTML
        document.body.innerHTML = newhtml
        window.print()
        window.location.reload()
        this.printstatus = false
      }, 100)
      // document.body.innerHTML = oldhtml;
    },
    // 查看大图
    imgDialog(url) {
      this.imgDialogVisible = true
      var seeBImg = url.split(',')
      seeBImg.forEach(item => {
        this.seeBigImg.push(this.port + '/' + item)
      })
    },
    // “提交”按钮
    handleSubmit() {
      this.status = 0
      this.$confirm('是否提交该条报修？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.Repair_Status()
        this.QueryRepair_orderReport()
        this.Repair_ScheduleWebNew()
        this.Repair_ScheduleLogWebNew()
      })
    },
    // “删除”按钮
    handleDelete() {
      this.$confirm('此操作将永远删除该条数据，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        repairDelete(this.$route.query.Repair_Orderno).then(res => {
          if (JSON.parse(res.data)) {
            this.$message({ message: '删除成功', type: 'success' })
            this.$router.go(-1)
          } else {
            this.$message.error('删除失败')
          }
        })
      })
    },
    // “撤销”按钮
    handleRevoke() {
      this.status = -1
      this.revokeDialogVisible = true
    },
    // 提交撤销
    submitRevoke() {
      var disc = this.revokeForm.revokeReason + this.revokeForm.revokeRemark
      repairStatus({
        Repair_Orderno: this.$route.query.Repair_Orderno,
        Status: this.status,
        UserName: this.userInfo.nickname,
        Describe: disc
      })
        .then(res => {
          if (JSON.parse(res.data)) {
            this.$message({ message: '操作成功', type: 'success' })
            this.revokeDialogVisible = false
            this.QueryRepair_orderReport()
            this.Repair_ScheduleWebNew()
            this.Repair_ScheduleLogWebNew()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // “受理”按钮
    handleReceive() {
      this.$confirm('确定要受理该条报修吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        repairAcceptance({
          Repair_Orderno: this.$route.query.Repair_Orderno,
          AcceptanceUser: this.userInfo.uid,
          UserName: this.userInfo.nickname
        })
          .then(res => {
            if (JSON.parse(res.data)) {
              this.$message({ message: '受理成功', type: 'success' })
              this.QueryRepair_orderReport()
              this.Repair_ScheduleWebNew()
              this.Repair_ScheduleLogWebNew()
            } else {
              this.$message.error('受理失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      })
    },
    // “派工”按钮
    handleDivision() {
      this.divisionDialogVisible = true
      // 根据用户查询维修成员列表
      repairuserList()
        .then(res => {
          this.manList = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    changeValue(value) {
      let obj = {}
      obj = this.manList.find(item => {
        return item.RepairUserID === Number(value)
      })
      if (obj !== undefined) {
        this.NICKNAME = obj.nickname
      }
    },
    // 提交派工
    submitDivision(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var service_time
          if (this.divisionForm.repairDate) {
            service_time = new Date(this.divisionForm.repairDate).format(
              'yyyy/MM/dd'
            )
          } else {
            service_time = ''
          }
          repairDispatching({
            Repair_Orderno: this.$route.query.Repair_Orderno,
            Service_type: this.divisionForm.repairType,
            Repair_User: this.divisionForm.repairMan,
            Repair_UserName: this.NICKNAME,
            Service_time: service_time,
            UserName: this.userInfo.nickname
          })
            .then(res => {
              if (JSON.parse(res.data)) {
                this.$message({ message: '派工成功', type: 'success' })
                this.$refs[formName].resetFields()
                this.divisionDialogVisible = false
                this.QueryRepair_orderReport()
                this.Repair_ScheduleWebNew()
                this.Repair_ScheduleLogWebNew()
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
      })
    },
    // “维修/接受”按钮
    handleAccept() {
      this.$confirm('确定要接受/维修该条报修吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        repairDispatchingAcceptance({
          Repair_Orderno: this.$route.query.Repair_Orderno,
          Status: 3,
          Describe: '',
          UserName: this.userInfo.nickname
        })
          .then(res => {
            if (JSON.parse(res.data)) {
              this.$message({ message: '操作成功', type: 'success' })
              this.QueryRepair_orderReport()
              this.Repair_ScheduleWebNew()
              this.Repair_ScheduleLogWebNew()
            } else {
              this.$message.error('操作失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      })
    },
    // 提交远程
    submitRemote() {
      remoteRepairprocessdetails({
        Repair_orderno: this.$route.query.Repair_Orderno,
        Repair_process: this.repairWay,
        Repair_result: this.repairResult
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message({ message: '操作成功', type: 'success' })
            this.repairWay = ''
            this.repairResult = ''
            this.remoteDialogVisible = false
            this.status = 4
            this.Repair_Status()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 提交拒绝
    submitRefuse(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var reason =
            this.refuseForm.refuseReason + this.refuseForm.refuseRemark
          repairDispatchingAcceptance({
            Repair_Orderno: this.$route.query.Repair_Orderno,
            Status: 1,
            Describe: reason,
            UserName: this.userInfo.nickname
          })
            .then(res => {
              var result = JSON.parse(res.data)
              if (result) {
                this.$message({ message: '操作成功', type: 'success' })
                this.refuseDialogVisible = false
                this.QueryRepair_order()
              } else {
                this.$message.error('操作失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        } else {
          return
        }
      })
    },
    // “完工”按钮
    handleFinished() {
      this.status = 4
      this.$confirm('确定该条报修已完工吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.Repair_Status()
        this.QueryRepair_orderReport()
        this.Repair_ScheduleWebNew()
        this.Repair_ScheduleLogWebNew()
      })
    },
    // 处理选择‘通过’或‘不通过’
    handlePass(val) {
      if (val === 1) {
        this.nopass = 5
        this.show = true
      } else {
        this.nopass = 4
        this.show = false
      }
    },
    // 不通过的处理方式
    handleCheckFailure(val) {
      this.nopass = val
    },
    submitnoPass() {
      // 更新维修单验收状态
      repairCheck({
        Repair_Orderno: this.$route.query.Repair_Orderno,
        Status: this.nopass,
        Describe: this.repairResult,
        UserName: this.userInfo.nickname
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message({ message: '操作成功', type: 'success' })
            this.repairResult = ''
            this.checkDialogVisible = false
            this.nopass = 6
            this.QueryRepair_orderReport()
            this.Repair_ScheduleWebNew()
            this.Repair_ScheduleLogWebNew()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    submitPass(formName) {
      // 更新维修单验收状态
      repairCheck({
        Repair_Orderno: this.$route.query.Repair_Orderno,
        Status: 5,
        Settlement: this.forms.pay_type,
        Cost: this.forms.pay_money,
        Describe: this.forms.pay_content,
        UserName: this.userInfo.nickname
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message({ message: '操作成功', type: 'success' })
            this.$refs[formName].resetFields()
            this.checkDialogVisible = false
            this.QueryRepair_orderReport()
            this.Repair_ScheduleWebNew()
            this.Repair_ScheduleLogWebNew()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 提交“评价”
    submitRate() {
      repairEvaluate({
        Repair_Orderno: this.$route.query.Repair_Orderno,
        Evaluate: this.rateForm.rateRemark,
        Score: this.rateForm.score
      })
        .then(res => {
          if (JSON.parse(res.data)) {
            this.rateDialogVisible = false
            this.$message({ message: '操作成功', type: 'success' })
            this.QueryRepair_orderReport()
            this.Repair_ScheduleWebNew()
            this.Repair_ScheduleLogWebNew()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 查询维修详情基本信息
    QueryRepair_orderReport() {
      queryRepairorderReport(this.$route.query.Repair_Orderno)
        .then(res => {
          this.essentialInfo = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 查询维修进度
    Repair_ScheduleWebNew() {
      repairScheduleWebNew(this.$route.query.Repair_Orderno)
        .then(res => {
          this.stepInfo = JSON.parse(res.data)
          for (let i = this.stepInfo.length; i < 5; i++) {
            this.stepInfo.push({
              Repair_Orderno: '',
              Operator: '',
              CreateTime: '',
              Status: null,
              Description: '',
              Company: '',
              Phone: ''
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 查询维修操作日志
    Repair_ScheduleLogWebNew() {
      repairScheduleLogWebNew(this.$route.query.Repair_Orderno)
        .then(res => {
          this.tableLog = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 更新维修单状态
    Repair_Status() {
      repairStatus({
        Repair_Orderno: this.$route.query.Repair_Orderno,
        Status: this.status,
        UserName: this.userInfo.nickname
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message({ message: '操作成功', type: 'success' })
          } else {
            this.$message.error('操作失败')
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
.r-details {
  color: #324057;
  .info_module {
    padding: 10px;
  }
  .info_module,
  .info_table {
    border-radius: 4px;
    margin-bottom: 20px;
    background: #fff;
  }
  .r-info {
    display: flex;
    align-items: center; //子元素垂直居中
    .r-info-icon {
      font-size: 36px;
      margin-right: 12px;
    }
    .r-num {
      font-size: 16px;
    }
  }
  .dialogBox .el-dialog .ct {
    margin: 0 10px 12px 0;
    display: inline-block;
  }
  .dialogBox .el-dialog .cm {
    margin: 12px 10px 12px 0;
    display: inline-block;
  }
  .r-img {
    margin-right: 10px;
    font-size: 20px;
    vertical-align: middle;
  }
  .r-rinfo {
    text-align: right;
  }
  .r-rinfos {
    text-align: right;
    line-height: 40px;
    width: 49%;
    display: inline-block;
    .rinfo-title {
      color: #999;
    }
    .rinfo-status {
      font-size: 30px;
    }
  }
  .el-steps {
    .step_line {
      border-width: 1px;
    }
    .step_noline {
      border-width: 0px;
    }
  }
  .commonHeader {
    height: 46px;
    border-bottom: 1px solid #dedfe0;
    .commonTitle {
      height: 26px;
      line-height: 46px;
      font-size: 15px;
      font-weight: bold;
    }
  }
  .imgdialog .el-dialog .el-dialog__header {
    border: 0;
  }
  .table-cell {
    div {
      display: table-cell;
      padding-bottom: 20px;
      vertical-align: top;
      &:nth-child(2) {
        color: rgba(0, 0, 0, 0.65);
      }
    }
    .table-title {
      white-space: nowrap;
    }
    .table-describe {
      width: 200px;
      white-space: wrapper;
    }
    .r-step-img {
      font-size: 20px;
    }
  }
  .dialogBox .el-dialog {
    width: 600px;
  }
  .passBtn {
    text-align: center;
    margin-bottom: 10px;
  }
}
.star .el-rate__icon {
  font-size: 30px;
}
.el-step__executor {
  color: #324057;
  line-height: 30px;
}
.el-step__executor.is-finish {
  color: #409eff;
}
@media (max-width: 1180px) {
  .r-details .table-cell .table-describe {
    width: 100px;
  }
}
@media (max-width: 1330px) {
  .r-details .r-rinfos {
    width: 100%;
    line-height: 30px;
    .rinfo-status {
      font-size: 20px;
    }
  }
}
</style>
