<template>
  <div class="pdg">
    <div class="detectioncontent" style="margin-top: 20px;">
      <div class="bg-fff boxShadow" style="padding:32px;" label-width="70px">
        <el-form
          :inline="true"
          :model="formInline"
          class="demo-form-inline compactform1"
        >
          <el-row :gutter="48">
            <el-col :span="8">
              <el-form-item label="选择项目" prop="repairStatus">
                <el-select
                  v-model="value"
                  placeholder="请选择项目"
                  class="mgr10"
                  size="small"
                  @change="switchProject"
                >
                  <el-option
                    v-for="item in proList"
                    :key="item.id"
                    :value="item.id"
                    :label="item.label"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="搜索查询" prop="repairStatus">
                <el-input
                  v-model="searchInput"
                  size="small"
                  style="margin-right:10%;"
                  clearable
                  placeholder="请输入关键字"
                  @keyup.enter.native="searchKeyWords"
                >
                  <i slot="suffix" class="el-input__icon el-icon-search" />
                </el-input>
              </el-form-item>
            </el-col>
            <el-col
              :span="8"
              :style="{ float: formVisible ? 'right' : 'auto' }"
            >
              <el-form-item style="margin-right:0px; text-align:right;">
                <el-button
                  class="headbtns"
                  icon="el-icon-plus"
                  type="primary"
                  size="small"
                  @click="centerDialogVisible = true"
                >
                  导入计划
                </el-button>
                <el-button
                  class="headbtns"
                  plain
                  size="small"
                  @click="executePause"
                >
                  执行/暂停
                </el-button>
                <el-button
                  class="headbtns"
                  plain
                  size="small"
                  @click="exportExcel"
                >
                  导出
                </el-button>
                <el-button
                  class="headbtns"
                  icon="el-icon-delete"
                  type="danger"
                  size="small"
                  @click="delCheckData"
                >
                  删除
                </el-button>
                <!-- <el-button size="small" type='text' :icon="formVisible?'el-icon-arrow-up':'el-icon-arrow-down'" @click='formVisible=!formVisible'>
                                {{formVisible?'收起':'展开'}}
                            </el-button> -->
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-dialog
          title="导入规划"
          :visible.sync="centerDialogVisible"
          width="30%"
        >
          <span>
            <el-form
              ref="ruleForm"
              :model="ruleForm"
              label-width="100px"
              class="demo-ruleForm"
            >
              <el-form-item label="计划名称">
                <el-input
                  v-model="dialogPname"
                  style="width:215px;"
                  @blur="judgeValue"
                />
              </el-form-item>
              <el-form-item label="所属项目">
                <el-select
                  v-model="value3"
                  placeholder="请选择项目"
                  class="mgr10"
                  size="small"
                  @change="switchProject2"
                >
                  <el-option
                    v-for="item in proList2"
                    :key="item.id"
                    :value="item.id"
                    :label="item.label"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="上传文件">
                <span size="mini" class="file-btn">
                  <c-svg name="shangchuan" class="iconsize" />
                  上传文件
                  <input
                    v-if="configDialogVisible"
                    id="fileInput"
                    type="file"
                    multiple="false"
                    accept=".xlsx,.xls"
                    @change="uploadExcel($event)"
                  />
                </span>
                <p>{{ updateFileName }}</p>
                <div>支持拓展名：.xls .xlsx</div>
              </el-form-item>
            </el-form>
          </span>
          <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="cancelEntry">取 消</el-button>
            <el-button
              v-if="dialogPname == ''"
              size="mini"
              type="primary"
              :disabled="true"
              >导 入</el-button
            >
            <el-button v-else size="mini" type="primary" @click="addPointData"
              >导 入</el-button
            >
          </span>
        </el-dialog>
        <el-table
          ref="multipleTable"
          v-loading="alarmTableLoading"
          :data="tableData"
          tooltip-effect="dark"
          element-loading-text="加载中..."
          class="entrytable"
          highlight-current-row
          style="width: 100%;margin-top:20px; border-radius:6px;"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" align="center" />
          <el-table-column label="计划名称" prop="PlanName">
            <!-- <template slot-scope="scope">
                        <el-input v-if="scope.row.editable" @blur="clickEdit(scope.row)" size="mini" v-model.trim="scope.row.planName"></el-input>
                        <span v-else>
                            {{ scope.row.planName }}
                        </span>
                    </template> -->
          </el-table-column>
          <el-table-column prop="projectName" label="项目">
            <!-- <template slot-scope="scope">
                        <el-input v-if="scope.row.editable" @blur="clickEdit(scope.row)" size="mini" v-model.trim="scope.row.project"></el-input>
                        <span v-else>
                            {{ scope.row.project }}
                        </span>
                    </template> -->
          </el-table-column>
          <el-table-column
            prop="customizedTime"
            label="制订时间"
            show-overflow-tooltip
            :formatter="transformDate"
          />
          <el-table-column prop="userName" label="制订人" show-overflow-tooltip>
            <!-- <template slot-scope="scope">
                        <el-input v-if="scope.row.editable" @blur="clickEdit(scope.row)" size="mini" v-model.trim="scope.row.planPeo"></el-input>
                        <span v-else>
                            {{ scope.row.planPeo }}
                        </span>
                    </template> -->
          </el-table-column>
          <el-table-column prop="edition" label="版本号" show-overflow-tooltip>
            <template slot-scope="scope">
              <span> V{{ scope.row.edition }} </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{
                scope.row.status == 0 || scope.row.status == '执行中'
                  ? '执行中'
                  : scope.row.status == 1 || scope.row.status == '已暂停'
                  ? '已暂停'
                  : ''
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-button
                type="text"
                size="mini"
                @click="openCompileDialog(scope.row)"
              >
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 数据编辑dialog -->
        <el-dialog
          :title="projectTitle"
          :visible.sync="centerDialogVisible2"
          width="70%"
          @close="clearVisible2"
        >
          <el-table
            ref="multipleTable"
            :data="compileData"
            tooltip-effect="dark"
            class="entrytable"
            border
            style="width: 100%;margin-top:20px; border-radius:6px;"
          >
            <el-table-column label="操作">
              <template slot-scope="scope">
                <button class="entryTableBtn" @click="clickEdit(scope.row)">
                  {{ scope.row.editable ? '保存' : '编辑' }}
                </button>
                <button class="entryTableBtn" @click="copy(scope.row)">
                  复制
                </button>
                <button
                  class="entryTableBtn"
                  type="danger"
                  @click="delEntryData(scope.$index, compileData)"
                >
                  删除
                </button>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="点检类型">
              <template slot-scope="scope">
                <el-input
                  v-if="scope.row.editable"
                  v-model.trim="scope.row.type"
                  size="mini"
                />
                <span v-else>
                  {{ scope.row.type }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="content"
              label="点检项"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-input
                  v-if="scope.row.editable"
                  v-model.trim="scope.row.content"
                  size="mini"
                />
                <span v-else>
                  {{ scope.row.content }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="userName"
              label="点检人"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span v-if="scope.row.editable">
                  <el-popover
                    ref="popover1"
                    placement="bottom"
                    width="280"
                    trigger="click"
                    popper-class="contact-popover"
                    @hide="inviteAble = false"
                  >
                    <ul
                      v-if="suggestContact"
                      class="device-contact-list thin-scroll"
                    >
                      <li
                        class="device-contact-list-item"
                        @click="
                          selectUser(
                            suggestContact.nickname,
                            suggestContact.mobile,
                            suggestContact.id,
                            'userName'
                          )
                        "
                      >
                        <div class="contact-avatar">
                          <img
                            :src="suggestContact.avatar"
                            width="25px"
                            height="25px"
                            alt=""
                          />
                        </div>
                        <div class="contact-info">
                          <div class="contact-username">
                            {{ suggestContact.nickname }}
                          </div>
                          <div class="contact-phone">
                            {{ suggestContact.mobile }}
                          </div>
                        </div>
                      </li>
                    </ul>
                    <div
                      v-show="
                        !suggestContact && !contactFilterLoading && !inviteAble
                      "
                      class="no-contact"
                    >
                      {{
                        scope.row.userName
                          ? '没有找到该用户'
                          : '请输入用户名或手机号查找'
                      }}
                    </div>
                    <div v-show="contactFilterLoading" class="loading-mask">
                      <i class="el-icon-loading" />
                    </div>
                    <div v-show="inviteAble" class="register-invite">
                      没有找到该用户&nbsp;
                      <el-button
                        type="text"
                        @click.native="invite(scope.row.userName)"
                        >邀请加入</el-button
                      >
                    </div>
                  </el-popover>
                  <el-input
                    v-model.trim="scope.row.userName"
                    v-popover:popover1
                    clearable
                    size="mini"
                    placeholder="通过用户名或手机号搜索"
                    @input="fetchSuggestContact(scope.row, scope.$index)"
                    @focus="fetchSuggestContact(scope.row, scope.$index)"
                  />
                </span>
                <!-- <el-input v-if="scope.row.editable" v-model.trim="scope.row.userName" size="mini"></el-input> -->
                <span v-else>
                  {{ scope.row.userName }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="cycle"
              label="点检周期"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-select
                  v-if="scope.row.editable"
                  v-model="scope.row.cycle"
                  size="mini"
                  placeholder="请选择"
                  @change="versionsChange"
                >
                  <el-option
                    v-for="item in versionsData"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <span v-else>
                  {{
                    scope.row.cycle == 1
                      ? '每日一次'
                      : scope.row.cycle == 2
                      ? '每周一次'
                      : scope.row.cycle == 3
                      ? '每月一次'
                      : ''
                  }}
                  <!-- {{ scope.row.value1 }} -->
                </span>
              </template>
            </el-table-column>
          </el-table>
          <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="centerDialogVisible2 = false"
              >取 消</el-button
            >
            <el-button size="mini" type="primary" @click="saveCompileData"
              >保 存</el-button
            >
          </span>
        </el-dialog>
        <!-- 这个表不显示，只是为了给用下下载Excel提供数据源 -->
        <table id="excel-table" style="display:none">
          <tr>
            <th>点检类型</th>
            <th>点检项</th>
            <th>点检人账号</th>
            <th>点检周期</th>
          </tr>
          <tr v-for="(item, index) in compileData" :key="index">
            <td>{{ item.type }}</td>
            <td>{{ item.content }}</td>
            <td>{{ item.mobile }}</td>
            <td>{{ item.cycle }}</td>
          </tr>
        </table>

        <!-- 分页 -->
        <div class="block" style="text-align:center; margin-top:20px;">
          <el-pagination
            background
            :page-sizes="[10, 20, 50, 100]"
            :page-size="this.num"
            :current-page="this.currentPage"
            layout="total, sizes, prev, pager, next, jumper"
            :total="this.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { pointEntryDataTransform } from '@/utils/sensor'
import {
  deletespotcheckplan,
  getspotcheckplan,
  statusspotcheckplan,
  updatespotcheckplan,
  inserspotcheckplan,
  queryspotcheckplan,
  queryspotcheckplanrow
} from '@/api/keep'
import { storageName } from '@/utils/index'
import { queryContact } from '@/api/user'

export default {
  data() {
    return {
      currentPage: 1, // 当前页
      total: 0,
      num: 10,
      projectid: 0,
      searchInput: '',
      alarmTableLoading: false,
      form: {},
      userInfo: null,
      myHeader: {
        Authorization: ''
      },
      updateFileName: '',
      suggestContact: null,
      inviteAble: false, // 能否邀请
      restaurants: [],
      timeout: null,
      handleDataArr: [],
      userNameInputIndex: null,
      configDialogVisible: true,
      centerDialogVisible: false,
      centerDialogVisible2: false,
      contactFilterLoading: false,
      senserData: [],
      formVisible: false,
      excelUpUrl: '',
      excelUpPar: null,
      delids: [],
      querytext: '',
      assetForm: {
        ID: null,
        action: null,
        check_user: null,
        content: '',
        cycle: null,
        editable: false,
        mobile: null,
        planID: null,
        type: '',
        userName: ''
      },
      compileData: [],
      projectTitle: '全部项目 设备点检',
      ruleForm: {},
      dialogPname: '',
      formInline: {},
      versionsData: [
        {
          value: 1,
          label: '每日一次'
        },
        {
          value: 2,
          label: '每周一次'
        },
        {
          value: 3,
          label: '每月一次'
        }
      ],
      value2: '',
      tableData: [],
      value: '0',
      value3: '',
      port: _host
    }
  },
  computed: {
    proList() {
      const obj = {
        id: '0',
        label: '全部项目'
      }
      const arr = [...this.$store.state.app.proList]
      arr.unshift(obj)
      return arr
    },
    proList2() {
      const arr = [...this.$store.state.app.proList]
      return arr
    }
  },
  mounted() {
    this.getQuerySpotcheckPlan()
    this.getQuerySpotcheckPlanRow()
  },

  methods: {
    // 清空操作数据
    clearVisible2() {
      this.handleDataArr = []
    },
    // 根据用户名或手机号获取可添加的设备联系人
    fetchSuggestContact(filter, index) {
      this.contactFilterLoading = true
      this.userNameInputIndex = index
      queryContact(filter.userName)
        .then(res => {
          let data = res.data.Data
          this.suggestContact = data
          this.inviteAble = false
          if (!data) {
            // 如果查找手机号，且没有查询到，则可以邀请对方注册
            if (/^1[0-9]{10}$/.test(filter)) {
              this.inviteAble = true
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
        .then(() => {
          this.contactFilterLoading = false
        })
    },
    // 选择管理员
    selectUser(nickname, mobile, id, type) {
      if (type === 'userName') {
        this.$refs.popover1.showPopper = false
        // this.assetForm.userName = `${nickname}`;
        // this.assetForm.administratorId = id;
        this.compileData[this.userNameInputIndex].userName = `${nickname}`
        this.compileData[this.userNameInputIndex].check_user = `${id}`
      }
      this.suggestContact = []
    },

    // 文件上传之前
    excelBeforeUpload(file) {
      const extension = file.name.split('.')[1] === 'xls'
      const extension2 = file.name.split('.')[1] === 'xlsx'
      if (!extension && !extension2) {
        this.$message.warning('上传失败，只能上传.xls .xlsx格式的文件')
      }
    },
    handleRemove() {},
    handlePreview() {},
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      )
    },
    // 更改点检周期
    versionsChange() {},
    // 保存数据
    saveCompileData() {
      if (this.handleDataArr.length < 1) {
        this.centerDialogVisible2 = false
        this.$message({
          type: 'info',
          message: '数据未修改!'
        })
        return false
      }
      this.centerDialogVisible2 = false
      updatespotcheckplan({ dataTable: this.handleDataArr })
        .then(() => {
          this.$alert(
            `<p><i class="el-icon-success saveicon" style="color:#339999; font-size:22px; vertical-align: sub;";></i><span style="font-size:16px;color:rgba(0,0,0,0.85);padding-left:12px;font-family:MicrosoftYaHei-Bold;font-weight:600;">计划修改完成</span></p><p style="color:#656565;font-size=12px;margin-top:10px;">修改后的点检计划将在下个周期开始生效。</p>`,
            '',
            {
              confirmButtonText: '确定',
              center: true,
              dangerouslyUseHTMLString: true
            }
          )
          this.getQuerySpotcheckPlan()
          this.getQuerySpotcheckPlanRow()
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 复制数据
    copy(row) {
      let temp = {}
      temp.ID = ''
      temp.check_user = row.check_user
      temp.type = row.type
      temp.action = 'add'
      temp.mobile = row.mobile
      temp.planID = row.planID
      temp.content = row.content
      temp.userName = row.userName
      temp.cycle = row.cycle
      temp.editable = false
      this.compileData.unshift(temp)
      this.handleDataArr.push(temp)
      this.$message('已成功复制指定行至列表头部')
    },
    // 批量删除
    delCheckData() {
      if (this.senserData.length < 1) {
        this.$message('请选择需要删除的计划')
        return false
      }
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deletespotcheckplan(this.delids.join(','))
            .then(() => {
              this.getQuerySpotcheckPlan()
              this.getQuerySpotcheckPlanRow()
            })
            .catch(err => {
              console.error(err)
            })
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {})
    },
    // 删除数据
    delEntryData(index, rows) {
      rows[index].action = 'del'
      this.handleDataArr.push(...rows.splice(index, 1))
      this.$message({
        type: 'success',
        message: '删除成功!'
      })
    },
    // 转换导入数据时间格式
    transformDate(row) {
      let time = new Date(row.customizedTime).format('yyyy/MM/dd')
      return time
    },
    // 导入计划取消
    cancelEntry() {
      let inputValue = document.getElementById('fileInput')
      inputValue.value = ''
      this.centerDialogVisible = false
      this.dialogPname = ''
      this.senserData = []
      this.updateFileName = ''
    },
    // 判断是否输入了计划名称
    judgeValue() {
      if (this.dialogPname == '') {
        this.$message('请输入计划名称')
      }
    },
    // 将表格内容导出成 excel
    exportExcel() {
      // checkData(this.tableData);
      // 通过url下载导出文件
      if (this.delids.length < 1) {
        this.$message('请选择要导出的计划')
        return false
      }
      this.userInfo = JSON.parse(
        sessionStorage.getItem(storageName('userInfo'))
      )
      let userID = this.userInfo.uid
      // exportspotcheck(this.delids.join(','),userID).then(res=>{
      window.open(
        `${_host}/api/Spotcheck/Export_SpotCheck?planID=${this.delids}&userID=${userID}`
      )
      // }).catch(err=>{
      //     console.error(err);
      // })
    },
    s2ab(s) {
      let buf
      if (typeof ArrayBuffer !== 'undefined') {
        buf = new ArrayBuffer(s.length)
        var view = new Uint8Array(buf)
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
      } else {
        buf = new Array(s.length)
        for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff
        return buf
      }
    },
    clickEdit(row) {
      row.editable = !row.editable
      if (row.action === 'up') {
        return false
      } else if (row.action === 'add') {
        row.action = 'add'
      } else {
        row.action = 'up'
        this.handleDataArr.push(row)
      }
    },
    // 进入和退出编辑
    openCompileDialog(rows) {
      this.centerDialogVisible2 = true
      getspotcheckplan(`${rows.ID}`)
        .then(res => {
          let data = JSON.parse(res.data)
          Object.assign(this.assetForm, data)
          this.compileData = data
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 编辑模式下输入框失去焦点后触发
    handleBlur(e, obj) {
      // 修改后将错误信息删除，默认用户已经修改正确
      obj.msg = ''
    },
    // 双击某行进入可编辑模式
    rowClickRow(row) {
      row.editable = !row.editable
      // if (!row.editable) {
      //     checkData([row])
      // }
    },
    // 上传 excel 文件并解析
    uploadExcel(evt) {
      var rABS = false
      this.senserData = []
      let fileType = evt.target.files[0].type
      // 兼容edge上不支持accept
      if (
        fileType !== 'application/vnd.ms-excel' &&
        fileType !==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        this.$message('请选择.xls .xlsx格式的文件')
        let inputValue = document.getElementById('fileInput')
        inputValue.value = ''
        this.updateFileName = ''
        return false
      }
      var reader = new FileReader()
      reader.onload = e => {
        /* read workbook */
        var bstr = e.target.result
        var wb
        if (rABS) {
          wb = XLSX.read(bstr, {
            type: 'binary'
          })
        } else {
          var arr = this.toArrData(bstr)
          wb = XLSX.read(btoa(arr), { type: 'base64' })
        }
        this.senserData.push(
          ...pointEntryDataTransform(this.toJson(wb), 'fromExcel')
        )
        this.$message({
          type: 'success',
          message: '上传完成!'
        })
        this.updateFileName = evt.target.files[0].name // 显示上传文件名称
      }
      if (rABS) {
        reader.readAsBinaryString(evt.target.files[0])
      } else {
        reader.readAsArrayBuffer(evt.target.files[0])
      }
    },
    // 文件流转BinaryString
    toArrData(data) {
      var o = ''
      var l = 0
      var w = 10240
      for (; l < data.byteLength / w; ++l)
        o += String.fromCharCode.apply(
          null,
          new Uint8Array(data.slice(l * w, l * w + w))
        )
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
      return o
    },
    // 导入数据
    addPointData() {
      inserspotcheckplan({
        planName: this.dialogPname,
        projectID: this.projectid,
        excelTable: this.senserData
      })
        .then(res => {
          let data = JSON.parse(res.data)
          let txt = data.text.join(',')
          this.$alert(txt, '', {
            confirmButtonText: '确定',
            center: true,
            dangerouslyUseHTMLString: true
          })
          this.projectid = ''
          this.getQuerySpotcheckPlan()
          this.getQuerySpotcheckPlanRow()
        })
        .catch(err => {
          console.error(err)
        })
      this.cancelEntry()
    },
    toJson(workBook) {
      let result = []
      workBook.SheetNames.forEach(sheetName => {
        let roa = XLSX.utils.sheet_to_row_object_array(
          workBook.Sheets[sheetName]
        )
        if (roa.length > 0) {
          // result[sheetName] = roa;
          result = roa
        }
      })
      return result
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    // 多选
    handleSelectionChange(val) {
      let ids = []
      this.senserData = val
      val.forEach(function(el) {
        ids.push(el.ID)
      })
      this.delids = ids
    },
    // 执行/暂停
    executePause() {
      statusspotcheckplan(this.delids.join(','))
        .then(res => {
          if (res.data == true) {
            this.$message({
              type: 'success',
              message: '状态变更成功，次日生效!'
            })
            this.senserData.forEach(function(el) {
              if (el.status == 0) {
                el.status = 1
              } else if (el.status == 1) {
                el.status = 0
              }
            })
          } else {
            this.$message('请选择计划！')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    //   搜索关键字
    searchKeyWords() {
      this.alarmTableLoading = true
      this.getQuerySpotcheckPlan()
      this.getQuerySpotcheckPlanRow()
    },
    // 获取列表数据
    getQuerySpotcheckPlan() {
      this.alarmTableLoading = true
      queryspotcheckplan({
        projectID: this.projectid,
        querytext: this.searchInput,
        pagesize: this.currentPage,
        show_number: this.num
      })
        .then(res => {
          let data = JSON.parse(res.data)
          this.tableData = data
          this.alarmTableLoading = false
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取点检计划总数
    getQuerySpotcheckPlanRow() {
      queryspotcheckplanrow({
        projectID: this.projectid,
        querytext: this.searchInput
      })
        .then(res => {
          let data = JSON.parse(res.data)
          this.total = data
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 项目切换加载数据
    switchProject(value) {
      this.$store.commit('UPDATE_CHECKID', value)
      this.projectid = value
      let obj = {}
      obj = this.proList.find(item => {
        return item.id === value
      })
      this.projectTitle = obj.label + ' 设备点检'
      this.getQuerySpotcheckPlan()
    },
    // 项目切换加载数据
    switchProject2(value) {
      this.$store.commit('UPDATE_CHECKID', value)
      this.projectid = value
      let obj = {}
      obj = this.proList2.find(item => {
        return item.id === value
      })
      this.projectTitle = obj.label + ' 设备点检'
    },
    // 页面显示条数
    handleSizeChange(val) {
      this.num = val
      this.getQuerySpotcheckPlan()
    },
    // 当前页
    handleCurrentChange(val) {
      this.currentPage = val
      this.getQuerySpotcheckPlan()
    }
  }
}
</script>
<style lang="scss" scoped>
.detectioncontent {
  background-color: #f5f5f5;
  .mgr10 {
    margin-right: 10px;
  }

  .file-btn {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    -webkit-transition: 0.1s;
    transition: 0.1s;
    font-weight: 500;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 4px;
    input {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 30px;
      opacity: 0;
      cursor: pointer;
    }
  }
  .file-btn:hover {
    color: #339999;
    border-color: rgb(194, 224, 224);
    background-color: rgb(235, 245, 245);
  }
  .contact-popover {
    padding: 0;
    .loading-mask {
      height: 48px;
      text-align: center;
      line-height: 48px;
    }
    .no-contact {
      height: 48px;
      text-align: center;
      line-height: 48px;
      color: #ccc;
    }
    .el-icon-loading {
      font-size: 25px;
    }
    .register-invite {
      height: 48px;
      text-align: center;
      line-height: 48px;
    }
  }
  .entrytable {
    .entryTableBtn {
      margin: 3px 5px;
      border: none;
      outline: none;
      background-color: #fff;
      font-weight: 600;
      font-size: 12px;
      color: rgba(18, 143, 233, 1);
      cursor: pointer;
    }
    div.cell {
      width: auto;
    }
  }
  .boxShadow {
    border-radius: 4px;
    background: #fff;
  }
  .headbtns {
    margin-left: 19px;
  }
  .iconsize {
    width: 14px;
    height: 14px;
    vertical-align: sub;
  }
  .headbtns {
    position: relative;
    overflow: hidden;
    input {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      opacity: 0;
    }
  }
}
</style>
<style lang="scss">
.compactform1 {
  .el-form-item {
    display: flex;
    .el-form-item__label {
      margin-left: 15px;
    }
    .el-form-item__content {
      flex: 3;
      .el-select--small {
        width: 100%;
      }
    }
  }
}
.el-input__inner {
  box-shadow: none;
}
.detectioncontent {
  .entrytable {
    th {
      color: #3c3c3c;
      padding: 10px 0px;
    }
    .el-table__row {
      height: 48px;
    }
  }
}
.device-contact-list {
  list-style: none;
  height: 48px;
  overflow: auto;
}
.device-contact-list-item {
  cursor: pointer;
  padding: 6px 15px;
  border-bottom: 1px solid #d8dde4;
  &:hover {
    background: rgb(242, 244, 246);
  }
  .contact-avatar {
    display: table-cell;
    vertical-align: middle;
    width: 25px;
    height: 25px;
    img {
      width: 25px;
      height: 25px;
      border-radius: 50%;
    }
  }
  .contact-info {
    padding-left: 10px;
    display: table-cell;
  }
  .contact-username {
    font-size: 14px;
  }
  .contact-phone {
    font-size: 12px;
    color: #ccc;
  }
}
</style>
