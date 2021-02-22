<template>
  <div>
    <div class="repairIndex content-box">
      <el-form
        ref="searchForm"
        :model="searchForm"
        label-width="70px"
        size="small"
      >
        <el-row :gutter="48">
          <el-col :span="8">
            <el-form-item label="维修状态" prop="repairStatus">
              <el-select
                v-model="searchForm.repairStatus"
                size="small"
                placeholder="请选择"
                class="w100"
                @change="QueryRepair_order"
              >
                <el-option label="全部" value="-2" />
                <el-option label="待受理" value="0" />
                <el-option label="待派工" value="1" />
                <el-option label="待接单" value="2" />
                <el-option label="维修中" value="3" />
                <el-option label="待验收" value="4" />
                <el-option label="完成" value="5" />
                <el-option label="已评价" value="6" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目" prop="projectName">
              <el-select
                v-model="searchForm.projectName"
                collapse-tags
                class="w100"
                size="small"
                filterable
                multiple
                @change="QueryRepair_order"
              >
                <el-option
                  v-for="item in projectList"
                  :key="item.id"
                  :value="item.id"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="formVisible" :span="8" style="height: 55px;">
            <el-form-item label="报修时间" prop="repairTime">
              <el-date-picker
                v-model="searchForm.repairTime"
                size="small"
                style="width:100%"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions2"
                format="yyyy-MM-dd"
                value-format="yyyy-M-d"
                @change="formatTime"
              />
            </el-form-item>
          </el-col>

          <el-col v-show="formVisible" :span="8">
            <el-form-item label="维修分项" prop="repairType">
              <el-popover
                ref="typePopover"
                placement="bottom"
                width="300"
                trigger="click"
                popper-class="repair-item-popover"
              >
                <el-tree
                  :data="typeTreeData"
                  node-key="id"
                  accordion
                  :props="typeTreeProps"
                  highlight-current
                  class="subTree thin-scroll"
                  @node-click="typeTreeClick"
                />
              </el-popover>
              <el-select
                ref="typeInput"
                v-model="searchForm.repairType"
                v-popover:typePopover
                size="small"
                placeholder="选择类型"
                popper-class="repair-subitem-select"
                style="display: block;"
              />
            </el-form-item>
          </el-col>
          <el-col v-show="formVisible" :span="8">
            <el-form-item label="维修设备" prop="equipment">
              <el-select
                v-model="searchForm.equipment"
                class="w100"
                placeholder="请选择"
                size="small"
                @change="QueryRepair_order"
              >
                <el-option
                  v-for="item in deviceList"
                  :key="item.id"
                  :label="item.mname"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="formVisible" :span="8">
            <el-form-item label="受理人" prop="receiver">
              <el-select
                v-model="searchForm.receiver"
                class="w100"
                filterable
                multiple
                placeholder="请选择"
                size="small"
                @change="QueryRepair_order"
              >
                <el-option
                  v-for="item in acceptList"
                  :key="item.id"
                  :label="item.nickname"
                  :value="item.RepairUserID"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="formVisible" :span="8">
            <el-form-item label="受理用时" prop="receiveTime">
              <el-select
                v-model="searchForm.receiveTime"
                class="w100"
                filterable
                placeholder="请选择"
                size="small"
                @change="QueryRepair_order"
              >
                <el-option label="全部" value="0" />
                <el-option label="30分钟内" value="30" />
                <el-option label="60分钟内" value="60" />
                <el-option label="90分钟内" value="90" />
                <el-option label="120分钟内" value="129" />
                <el-option label="大于120分钟" value="121" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="formVisible" :span="8">
            <el-form-item label="其他方式" prop="repairInfo">
              <el-input
                v-model.trim="searchForm.repairInfo"
                placeholder="输入维修内容查询"
                size="small"
                @keyup.enter.native="QueryRepair_order"
              />
            </el-form-item>
          </el-col>
          <el-col v-show="formVisible" :span="8">
            <el-form-item prop="repairMan">
              <el-input
                v-model.trim="searchForm.repairMan"
                placeholder="输入报修人/电话查询"
                size="small"
                @keyup.enter.native="QueryRepair_order"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8" :style="{ float: formVisible ? 'right' : 'auto' }">
            <el-form-item>
              <el-button
                size="small"
                icon="el-icon-refresh"
                type="danger"
                @click="clearBtn"
              >
                重置
              </el-button>
              <el-button
                size="small"
                type="text"
                :icon="formVisible ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
                @click="formVisible = !formVisible"
              >
                {{ formVisible ? '收起' : '展开' }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div v-loading="loading" element-loading-text="加载中...">
        <el-table :data="data" highlight-current-row fit>
          <el-table-column label="维修单号" width="270">
            <template slot-scope="scope">
              <el-button type="text" @click="handleSkipRepair(scope.row)">
                {{ scope.row.Repair_Orderno }}
              </el-button>
              <el-tag
                style="margin-left: 10px;"
                :class="{
                  noSubmit: scope.row.Status == -1,
                  noAcceptance: scope.row.Status == 0,
                  noDivision: scope.row.Status == 1,
                  noAccept: scope.row.Status == 2,
                  repairing: scope.row.Status == 3,
                  noCheck: scope.row.Status == 4,
                  haveDone: scope.row.Status > 4
                }"
                :type="
                  scope.row.Status == -1
                    ? 'warning'
                    : scope.row.Status == 0
                    ? 'danger'
                    : scope.row.Status == 1
                    ? 'warning'
                    : scope.row.Status == 2
                    ? ''
                    : scope.row.Status == 3
                    ? 'success'
                    : scope.row.Status == 4
                    ? 'warning'
                    : ''
                "
                size="small"
              >
                {{
                  scope.row.Status == -1
                    ? '待提交'
                    : scope.row.Status == 0
                    ? '待受理'
                    : scope.row.Status == 1
                    ? '待派工'
                    : scope.row.Status == 2
                    ? '待接单'
                    : scope.row.Status == 3
                    ? '维修中'
                    : scope.row.Status == 4
                    ? '待验收'
                    : '已维修'
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="EquipmentName"
            label="故障设备"
            min-width="180"
          />
          <el-table-column
            prop="Fault_description"
            label="故障内容"
            min-width="200"
          />
          <el-table-column prop="Repair_man" label="报修人" width="100" />
          <el-table-column prop="CreateTime" label="报修时间" width="180" />
          <el-table-column prop="nickname" label="受理人" width="100" />
          <el-table-column label="操作" min-width="80">
            <template slot-scope="scope">
              <el-button
                v-show="
                  scope.row.Status == -1 && userInfo.uid === scope.row.Companyid
                "
                type="text"
                style="color:#88E2A3;"
                @click="handleSubmit(scope.row)"
              >
                提交
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == -1 && userInfo.uid === scope.row.Companyid
                "
                type="text"
                style="color:#FDA75A;"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 0 && userInfo.uid === scope.row.Companyid
                "
                type="text"
                style="color:#FDA75A;"
                @click="handleRevoke(scope.row)"
              >
                撤销
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 0 &&
                    userInfo.uid === scope.row.Repair_unitID
                "
                type="text"
                style="color:#88E2A3;"
                @click="handleReceive(scope.row)"
              >
                受理
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 1 &&
                    userInfo.uid === scope.row.Repair_unitID
                "
                type="text"
                style="color:#FDA75A;"
                @click="handleDivision(scope.row)"
              >
                派工
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 1 &&
                    userInfo.uid === scope.row.Repair_unitID
                "
                type="text"
                style="color:#FDA75A;"
                @click="handleAccept(scope.row)"
              >
                维修
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 1 &&
                    userInfo.uid === scope.row.Repair_unitID
                "
                type="text"
                style="color:#f191f4;"
                @click="handleRemote(scope.row)"
              >
                远程
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 2 &&
                    userInfo.uid === scope.row.Repair_User
                "
                type="text"
                style="color:#7FB4EF;"
                @click="handleAccept(scope.row)"
              >
                接受
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 2 &&
                    userInfo.uid === scope.row.Repair_User
                "
                type="text"
                style="color:#FF9382;"
                @click="handleRefuse(scope.row)"
              >
                拒绝
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 3 &&
                    userInfo.uid === scope.row.Repair_User
                "
                type="text"
                style="color:#91cef4;"
                @click="handleFinished(scope.row)"
              >
                完工
              </el-button>
              <el-button
                v-show="
                  scope.row.Status == 4 &&
                    (userInfo.uid === scope.row.Repair_unitID ||
                      userInfo.uid === scope.row.Companyid)
                "
                type="text"
                style="color:#FF9382;"
                @click="handleCheck(scope.row)"
              >
                验收
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页小工具-->
        <el-pagination
          background
          :current-page="Pagesize"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="show_number"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          class="pagination-wrap"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
        <!-- </div> -->
      </div>
      <!--派工弹窗-->
      <el-dialog
        class="dialogBox"
        title="主管派工"
        :visible.sync="dialogDivisionVisible"
      >
        <el-form ref="formm" :model="form" :rules="rules" label-position="left">
          <el-form-item label="服务类型" label-width="120px" prop="repair_type">
            <el-select v-model="form.repair_type" placeholder="请选择服务类型">
              <el-option
                v-for="item in ways"
                :key="item.id"
                :label="item.name"
                :value="item.id.toString()"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="派工" label-width="120px" prop="repair_man">
            <el-select
              v-model="form.repair_man"
              placeholder="请选择维修工"
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
            label-width="120px"
            prop="repair_date"
          >
            <el-date-picker
              v-model="form.repair_date"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions"
            />
          </el-form-item>
          <el-form-item label="维修初诊" prop="repair_content">
            <el-input
              v-model="form.repair_content"
              type="textarea"
              :rows="2"
              placeholder="请输入10字以上"
              resize="none"
            />
          </el-form-item>
        </el-form>
        <div>
          <div class="ct">
            应带备件
          </div>
          <el-button
            type="text"
            class="add"
            size="small"
            @click.native="addRow(1)"
          >
            添加
          </el-button>
        </div>
        <el-table
          :data="should"
          highlight-current-row
          max-height="120"
          @cell-click="handleCellClick"
        >
          <el-table-column type="index" width="70" label="序号" />
          <el-table-column label="备件名称">
            <template slot-scope="scope">
              <span class="cell-value">{{ scope.row['Sparepart_name'] }}</span>
              <div class="cell-input">
                <input
                  v-model="scope.row['Sparepart_name']"
                  class="not-el-input"
                  @blur="handleBlur($event, scope.row['Sparepart_name'])"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="备件规格">
            <template slot-scope="scope">
              <span class="cell-value">{{ scope.row['Sparepart_size'] }}</span>
              <div class="cell-input">
                <input
                  v-model="scope.row['Sparepart_size']"
                  class="not-el-input"
                  @blur="handleBlur($event, scope.row['Sparepart_size'])"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="70">
            <template slot-scope="scope">
              <span class="cell-value">{{ scope.row['Number'] }}</span>
              <div class="cell-input">
                <input
                  v-model.number="scope.row['Number']"
                  type="number"
                  @blur="handleBlur($event, scope.row['Number'])"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="注释">
            <template slot-scope="scope">
              <span class="cell-value">{{ scope.row['Remarks'] }}</span>
              <div class="cell-input">
                <input
                  v-model="scope.row['Remarks']"
                  class="not-el-input"
                  @blur="handleBlur($event, scope.row['Remarks'])"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70">
            <template slot-scope="scope">
              <el-button
                v-show="scope.row['ID'] == null ? true : false"
                type="text"
                size="small"
                style="color:#88E2A3;"
                @click.native="handleAdd(scope.row, 1)"
              >
                保存
              </el-button>
              <el-button
                v-show="scope.row['ID'] != null ? true : false"
                type="text"
                size="small"
                style="color:#88E2A3;"
                @click.native="handleUpdate(scope.row, 1)"
              >
                修改
              </el-button>
              <el-button
                v-show="scope.row['ID'] != null ? true : false"
                type="text"
                size="small"
                style="color:#FDA75A;"
                @click.native="handleDeleteRow(scope.row, 1)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div>
          <div class="cm">
            所需工具
          </div>
          <el-button
            type="text"
            class="add"
            size="small"
            @click.native="addRow(2)"
          >
            添加
          </el-button>
        </div>
        <el-table
          :data="need"
          highlight-current-row
          max-height="120"
          @cell-click="handleCellClick"
        >
          <el-table-column type="index" width="70" label="序号" />
          <el-table-column label="工具名称">
            <template slot-scope="scope">
              <span class="cell-value">{{ scope.row['Tool_name'] }}</span>
              <div class="cell-input">
                <input
                  v-model="scope.row['Tool_name']"
                  class="not-el-input"
                  @blur="handleBlur($event, scope.row['Tool_name'])"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="70">
            <template slot-scope="scope">
              <span class="cell-value">{{ scope.row['Number'] }}</span>
              <div class="cell-input">
                <input
                  v-model.number="scope.row['Number']"
                  type="number"
                  class="not-el-input"
                  @blur="handleBlur($event, scope.row['Number'])"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template slot-scope="scope">
              <span class="cell-value">{{ scope.row['Remarks'] }}</span>
              <div class="cell-input">
                <input
                  v-model="scope.row['Remarks']"
                  class="not-el-input"
                  @blur="handleBlur($event, scope.row['Remarks'])"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                v-show="scope.row['ID'] == null ? true : false"
                type="text"
                size="small"
                style="color:#88E2A3;"
                @click="handleAdd(scope.row, 2)"
              >
                保存
              </el-button>
              <el-button
                v-show="scope.row['ID'] != null ? true : false"
                type="text"
                size="small"
                style="color:#88E2A3;margin-left:0;"
                @click="handleUpdate(scope.row, 2)"
              >
                修改
              </el-button>
              <el-button
                v-show="scope.row['ID'] != null ? true : false"
                type="text"
                size="small"
                style="color:#FDA75A;"
                @click="handleDeleteRow(scope.row, 2)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer" style="text-align: center;">
          <el-button
            type="primary"
            size="small"
            @click="submitDivision('formm')"
          >
            提交
          </el-button>
        </div>
      </el-dialog>
      <!-- 远程维修弹窗 -->
      <el-dialog
        class="dialogBox"
        title="主管远程维修"
        :visible.sync="dialogRepairVisible"
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
          v-model="repair_Result"
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
      <!-- 维修工拒绝接单弹窗 -->
      <el-dialog
        class="dialogBox"
        title="维修工拒绝接单"
        :visible.sync="dialogRefuseVisible"
      >
        <el-form
          ref="formrefuse"
          :model="formrefuse"
          :rules="ruleRefuse"
          label-position="left"
        >
          <el-form-item
            label="拒绝原因"
            label-width="100px"
            prop="repair_result"
          >
            <el-select
              v-model="formrefuse.repair_result"
              placeholder="请选择拒绝原因"
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
            prop="repairResult"
            style="margin-bottom:0;"
          >
            <el-input
              v-model="formrefuse.repairResult"
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
            @click="submitRefuse('formrefuse')"
          >
            提交
          </el-button>
        </div>
      </el-dialog>
      <!-- 验收弹窗 -->
      <el-dialog
        class="dialogBox"
        :title="title"
        :visible.sync="dialogPassVisible"
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
          <el-form ref="forms" :model="forms" label-position="left">
            <el-form-item label="维修结算" label-width="100px" prop="pay_type">
              <el-select
                v-model="forms.pay_type"
                placeholder="请选择"
                @change="ChargeMode"
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
              <el-input v-model="forms.pay_money" :disabled="disable" />
            </el-form-item>
            <el-form-item
              label="验收批注"
              label-width="100px"
              prop="pay_content"
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
      <!--  撤销弹窗 -->
      <el-dialog
        class="dialogBox"
        title="撤销"
        :visible.sync="dialogRevokeVisible"
      >
        <el-form ref="formrevoke" :model="formrevoke" label-position="left">
          <el-form-item
            label="撤销原因"
            label-width="80px"
            prop="repair_result"
          >
            <el-select
              v-model="formrevoke.repair_result"
              placeholder="请选择撤销原因"
            >
              <el-option key="1" label="误报" value="误报" />
              <el-option key="2" label="其他原因" value="其他原因" />
            </el-select>
          </el-form-item>
          <el-form-item
            label="备注信息"
            label-width="80px"
            prop="repairResult"
            style="margin-bottom:0;"
          >
            <el-input
              v-model="formrevoke.repairResult"
              type="textarea"
              :rows="2"
              placeholder="请输入"
              resize="none"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" style="text-align: center;">
          <el-button type="primary" size="small" @click="submitRevoke">
            提交
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import {
  repairuserList,
  addRepairsparepart,
  addRepairtool,
  updateRepairspareparts,
  updateRepairtool,
  deleteRepairspareparts,
  repairDelete,
  repairStatus,
  repairAcceptance,
  repairDispatching,
  remoteRepairprocessdetails,
  repairDispatchingAcceptance,
  repairCheck,
  getRepairProjectDevice,
  queryRepairorder,
  repairsparepartList,
  repairtoolList,
  deleteRepairtool
} from '@/api/repair'
// import { userGetMonitorType } from '@/api/asset'
import { storageName } from '@/utils/index'

export default {
  data() {
    return {
      deviceList: [],
      acceptList: [],
      manList: [],
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
      data: [],
      input: '',
      Pagesize: 1,
      show_number: 10,
      total: null,
      startTime: '',
      endTime: '',
      projectid: '', // int项目id
      dialogDivisionVisible: false,
      dialogRepairVisible: false,
      dialogRefuseVisible: false,
      dialogPassVisible: false,
      dialogRevokeVisible: false,
      order: '',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      form: {
        repair_type: '',
        repair_man: '',
        repair_date: '',
        repair_content: ''
      },
      rules: {
        repair_type: [
          { required: true, message: '请选择服务类型', trigger: 'change' }
        ],
        repair_man: [
          { required: true, message: '请选择维修工', trigger: 'change' }
        ]
      },
      formrefuse: {
        repair_result: '',
        repairResult: ''
      },
      ruleRefuse: {
        repair_result: [
          { required: true, message: '请选择拒绝类型', trigger: 'change' }
        ],
        repairResult: [
          { required: true, message: '请填写拒绝原因', trigger: 'blur' }
        ]
      },
      forms: {
        pay_type: '',
        pay_money: '',
        pay_content: ''
      },
      formrevoke: {
        repair_result: '',
        repairResult: ''
      },
      should: [],
      need: [],
      repairWay: '',
      repair_Result: '',
      repairResult: '',
      show: true,
      NICKNAME: '',
      nopass: 5,
      disabled: false,
      loading: false,
      title: '主管验收',
      userInfo: {},
      disable: false,
      temp: '',
      searchForm: {
        repairStatus: '-2',
        repairTime: '',
        projectName: '',
        repairType: '',
        equipment: '',
        receiver: '',
        receiveTime: '0',
        repairMan: '',
        bigClass: '',
        smallClass: ''
      },
      formVisible: false,
      pickerOptions2: {
        shortcuts: [
          {
            text: '全部',
            onClick(picker) {
              const end = ''
              const start = ''
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '今天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const date = new Date()
              let start, end
              start = date.setTime(date.getTime() - 3600 * 1000 * 24)
              end = start
              picker.$emit('pick', [new Date(start), new Date(end)])
            }
          },
          {
            text: '本周',
            onClick(picker) {
              const date = new Date()
              let WeekFirstDay = new Date(date - (date.getDay() - 1) * 86400000)
              let WeekLastDay = new Date(
                (WeekFirstDay / 1000 + 6 * 86400) * 1000
              )
              picker.$emit('pick', [WeekFirstDay, WeekLastDay])
            }
          },
          {
            text: '本月',
            onClick(picker) {
              const date = new Date()
              let MonthFirstDay = new Date(
                date.getFullYear(),
                date.getMonth(),
                1
              )
              let MonthNextFirstDay = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                1
              )
              let MonthLastDay = new Date(MonthNextFirstDay - 86400000)
              picker.$emit('pick', [MonthFirstDay, MonthLastDay])
            }
          },
          {
            text: '本年',
            onClick(picker) {
              let start = new Date(new Date().getFullYear() + '/1/1')
              let end = new Date(new Date().getFullYear() + '/12/31')
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      typeTreeProps: {
        children: 'subset',
        label: 'TypeName'
      },
      typeTreeData: []
    }
  },
  computed: {
    projectList() {
      return this.$store.state.app.proList
    }
  },
  mounted() {
    this.userInfo = JSON.parse(sessionStorage.getItem(storageName('userInfo')))
    this.QueryRepair_order()
    this.fetchclassList()
    // 获取受理人list
    repairuserList()
      .then(res => {
        this.acceptList = JSON.parse(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    // 处理时间
    formatTime(val) {
      this.startTime = val[0]
      this.endTime = val[1]
      this.QueryRepair_order()
    },
    ChargeMode() {
      if (this.forms.pay_type == 1) {
        this.disable = true
      } else {
        this.disable = false
      }
    },
    // 点击添加按钮添加工具/备件
    addRow(val) {
      if (val === 1) {
        this.should.push({
          ID: null,
          Repair_Orderno: '',
          Sparepart_name: '',
          Sparepart_size: '',
          Number: null,
          Remarks: ''
        })
      }
      if (val === 2) {
        this.need.push({
          ID: null,
          Repair_Orderno: '',
          Tool_name: '',
          Number: null,
          Remarks: ''
        })
      }
    },
    // 保存
    handleAdd(row, val) {
      if (val === 1) {
        // 保存添加的备件
        addRepairsparepart({
          Repair_Orderno: this.order,
          Sparepart_name: row.Sparepart_name,
          arepart_size: row.Sparepart_size,
          Number: row.Number,
          Remarks: row.Remarks
        })
          .then(res => {
            var result = JSON.parse(res.data)
            if (result) {
              this.$message({ message: '操作成功', type: 'success' })
              this.QueryRepair_order()
              this.Repair_sparepartList()
            } else {
              this.$message.error('操作失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
      if (val === 2) {
        // 保存添加的工具
        addRepairtool({
          Repair_Orderno: this.order,
          Tool_name: row.Tool_name,
          Number: row.Number,
          Remarks: row.Remarks
        })
          .then(res => {
            var result = JSON.parse(res.data)
            if (result) {
              this.$message({ message: '操作成功', type: 'success' })
              this.QueryRepair_order()
              this.Repair_toolList()
            } else {
              this.$message.error('操作失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    // 修改
    handleUpdate(row, val) {
      if (val === 1) {
        // 修改备件
        updateRepairspareparts({
          ID: row.ID,
          Sparepart_name: row.Sparepart_name,
          Sparepart_size: row.Sparepart_size,
          Number: row.Number,
          Remarks: row.Remarks
        })
          .then(res => {
            var result = JSON.parse(res.data)
            if (result) {
              this.$message({ message: '操作成功', type: 'success' })
              this.QueryRepair_order()
              this.Repair_sparepartList()
            } else {
              this.$message.error('操作失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
      if (val === 2) {
        // 修改工具
        updateRepairtool({
          ID: row.ID,
          Tool_name: row.Tool_name,
          Number: row.Number,
          Remarks: row.Remarks
        })
          .then(res => {
            var result = JSON.parse(res.data)
            if (result) {
              this.$message({ message: '操作成功', type: 'success' })
              this.QueryRepair_order()
              this.Repair_toolList()
            } else {
              this.$message.error('操作失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    // 删除
    handleDeleteRow(row, val) {
      this.$confirm('此操作将永远删除该条数据，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        if (val === 1) {
          // 删除备件
          deleteRepairspareparts(row.ID)
            .then(res => {
              var result = JSON.parse(res.data)
              if (result) {
                this.$message({ message: '操作成功', type: 'success' })
                this.QueryRepair_order()
                this.Repair_sparepartList()
              } else {
                this.$message.error('操作失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
        if (val === 2) {
          // 删除工具
          deleteRepairtool(row.ID)
            .then(res => {
              var result = JSON.parse(res.data)
              if (result) {
                this.$message({ message: '操作成功', type: 'success' })
                this.QueryRepair_order()
                this.Repair_toolList()
              } else {
                this.$message.error('操作失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
      })
    },
    // 清空筛选条件
    clearBtn() {
      this.$refs.searchForm.resetFields()
      this.searchForm.bigClass = ''
      this.searchForm.smallClass = ''
      this.startTime = ''
      this.endTime = ''
      this.QueryRepair_order()
    },
    handleSizeChange(val) {
      this.show_number = val
      this.QueryRepair_order()
    },
    handleCurrentChange(val) {
      this.Pagesize = val
      this.QueryRepair_order()
    },
    handleSkipRepair(row) {
      this.order = row.Repair_Orderno
      this.$router.push({
        path: '/repairMaintain/repairDetails',
        query: { Repair_Orderno: row.Repair_Orderno }
      })
    },
    // 提交
    handleSubmit(row) {
      this.statu = 0
      this.order = row.Repair_Orderno
      this.$confirm('是否提交该条报修？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.Repair_Status()
        this.QueryRepair_order()
      })
    },
    // 删除
    handleDelete(row) {
      this.$confirm('此操作将永远删除该条数据，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        repairDelete(row.Repair_Orderno)
          .then(res => {
            var result = JSON.parse(res.data)
            if (result) {
              this.$message({ message: '删除成功', type: 'success' })
              this.QueryRepair_order()
            } else {
              this.$message.error('删除失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      })
    },
    // 撤销
    handleRevoke(row) {
      this.order = row.Repair_Orderno
      this.statu = -1
      this.dialogRevokeVisible = true
    },
    // 撤销提交
    submitRevoke() {
      var disc = this.formrevoke.repair_result + this.formrevoke.repairResult
      repairStatus({
        Repair_Orderno: this.order,
        Status: this.statu,
        UserName: this.userInfo.nickname,
        Describe: disc
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message({ message: '操作成功', type: 'success' })
            this.dialogRevokeVisible = false
            this.QueryRepair_order()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 受理
    handleReceive(row) {
      // 报修受理
      this.$confirm('确定要受理该条报修吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        repairAcceptance({
          Repair_Orderno: row.Repair_Orderno,
          Repair_type: row.Repair_type,
          AcceptanceUser: this.userInfo.uid,
          UserName: this.userInfo.nickname
        })
          .then(res => {
            var result = JSON.parse(res.data)
            if (result) {
              this.$message({ message: '受理成功', type: 'success' })
              this.QueryRepair_order()
            } else {
              this.$message.error('受理失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      })
    },
    // 派工
    handleDivision(row) {
      this.dialogDivisionVisible = true
      this.order = row.Repair_Orderno
      // 根据用户查询维修成员列表
      repairuserList()
        .then(res => {
          this.manList = JSON.parse(res.data)
          this.Repair_sparepartList()
          this.Repair_toolList()
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 派工提交
    submitDivision(Name) {
      this.$refs[Name].validate(valid => {
        if (valid) {
          var service_time
          if (this.form.repair_date) {
            service_time = new Date(this.form.repair_date).format('yyyy/MM/dd')
          } else {
            service_time = ''
          }
          repairDispatching({
            Repair_Orderno: this.order,
            Service_type: this.form.repair_type,
            Repair_User: this.form.repair_man,
            Repair_UserName: this.NICKNAME,
            Service_time: service_time,
            UserName: this.userInfo.nickname
          })
            .then(res => {
              var result = JSON.parse(res.data)
              if (result) {
                this.$message({ message: '派工成功', type: 'success' })
                this.$refs[Name].resetFields()
                this.dialogDivisionVisible = false
                this.QueryRepair_order()
              } else {
                this.$message.error('派工失败')
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
    // 远程
    handleRemote(row) {
      this.dialogRepairVisible = true
      this.order = row.Repair_Orderno
    },
    // 远程提交
    submitRemote() {
      remoteRepairprocessdetails({
        Repair_orderno: this.order,
        Repair_process: this.repairWay,
        Repair_result: this.repair_Result
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message({ message: '操作成功', type: 'success' })
            this.repairWay = ''
            this.repair_Result = ''
            this.dialogRepairVisible = false
            this.statu = 4
            this.Repair_Status()
            this.QueryRepair_order()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 接受
    handleAccept(row) {
      // 接单
      this.$confirm('确定要接受/维修该条报修吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        repairDispatchingAcceptance({
          Repair_Orderno: row.Repair_Orderno,
          Status: 3,
          Describe: '',
          UserName: this.userInfo.nickname
        })
          .then(res => {
            var result = JSON.parse(res.data)
            if (result) {
              this.$message({ message: '操作成功', type: 'success' })
              this.QueryRepair_order()
            } else {
              this.$message.error('操作失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
      })
    },
    // 拒绝
    handleRefuse(row) {
      this.dialogRefuseVisible = true
      this.order = row.Repair_Orderno
    },
    // 拒绝接单提交
    submitRefuse(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var reason =
            this.formrefuse.repair_result + this.formrefuse.repairResult
          repairDispatchingAcceptance({
            Repair_Orderno: this.order,
            Status: 1,
            Describe: reason,
            UserName: this.userInfo.nickname
          })
            .then(res => {
              var result = JSON.parse(res.data)
              if (result) {
                this.$message({ message: '操作成功', type: 'success' })
                this.dialogRefuseVisible = false
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
    // 完工
    handleFinished(row) {
      this.statu = 4
      this.order = row.Repair_Orderno
      this.$confirm('确定该条报修已完工吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.Repair_Status()
        this.QueryRepair_order()
      })
    },
    // 验收
    handleCheck(row) {
      this.dialogPassVisible = true
      this.order = row.Repair_Orderno
      if (row.Repair_type === '1') {
        this.disabled = true
        this.title = '维修总结'
      }
    },
    // 根据下拉框选择项拿到value对应的label
    changeValue(value) {
      let obj = {}
      obj = this.manList.find(item => {
        return item.RepairUserID === Number(value)
      })
      if (obj !== undefined) {
        this.NICKNAME = obj.nickname
      }
    },
    handlePass(val) {
      if (val === 1) {
        this.nopass = 5
        this.show = true
      } else {
        this.nopass = 4
        this.show = false
      }
    },
    // 处理不通过
    handleCheckFailure(val) {
      this.nopass = val
    },
    // 主管验收通过提交
    submitPass(formName) {
      // 更新维修单验收状态
      repairCheck({
        Repair_Orderno: this.order,
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
            this.dialogPassVisible = false
            this.QueryRepair_order()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 主管验收不通过提交
    submitnoPass() {
      // 更新维修单验收状态
      repairCheck({
        Repair_Orderno: this.order,
        Status: this.nopass,
        Describe: this.repairResult,
        UserName: this.userInfo.nickname
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message({ message: '操作成功', type: 'success' })
            this.repairResult = ''
            this.dialogPassVisible = false
            this.nopass = 6
            this.QueryRepair_order()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 点击单元格进入可编辑模式
    handleCellClick(row, column, cell) {
      if (cell.querySelector('.cell-value')) {
        // 避免点击编号和操作单元格时出错
        cell.querySelector('.cell-value').style.display = 'none'
        let nodeInputWrap = cell.querySelector('.cell-input')
        nodeInputWrap.style.display = 'inline-block'
        if (cell.querySelector('.not-el-input')) {
          cell.querySelector('.not-el-input').select()
        }
      }
      return
    },
    // 编辑模式下输入框失去焦点后触发
    handleBlur(e) {
      e.target.parentNode.style.display = 'none'
      e.target.parentNode.previousSibling.previousSibling.style.display =
        'inline-block'
    },
    // 查询设备
    GetRepair_ProjectDevice() {
      if (this.searchForm.smallClass === '') {
        return false
      }
      getRepairProjectDevice(
        this.searchForm.smallClass,
        this.searchForm.projectName.join(',')
      )
        .then(res => {
          this.deviceList = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取维修大类小类数据
    fetchclassList() {
      // userGetMonitorType()
      //   .then(res => {
      //     this.typeTreeData = JSON.parse(res.data)
      //   })
      //   .catch(err => {
      //     console.error(err)
      //   })
    },
    // 查询
    QueryRepair_order() {
      this.loading = true
      queryRepairorder({
        Operator: this.userInfo.uid, // 用户id
        Projectid:
          this.searchForm.projectName.length === 0
            ? ''
            : this.searchForm.projectName.join(','), // 项目名称
        // TopType: 1,   // 维修分项大类
        DownType: this.searchForm.smallClass, // 维修分项小类
        Equipment: this.searchForm.equipment, // 维修设备
        Repair_man_phone: this.searchForm.repairMan, // 报修人
        Repair_unitids: '',
        Fault_description: this.searchForm.repairInfo, // 维修内容
        Status: this.searchForm.repairStatus, // 维修状态
        StartTime: this.startTime, // 维修开始时间
        EndTime: this.endTime, // 维修结束时间
        AcceptanceTime: this.searchForm.receiveTime, // 维修受理用时
        Repair_Orderno: '',
        AcceptanceUser:
          this.searchForm.receiver.length === 0
            ? ''
            : this.searchForm.receiver.join(','), // 受理人
        Repair_User: '',
        show_number: this.show_number, // 页码
        pagesize: this.Pagesize // 码数
      })
        .then(res => {
          this.loading = false
          this.data = JSON.parse(res.data).data
          this.total = JSON.parse(res.data).sumCount
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 查询维修备件
    Repair_sparepartList() {
      repairsparepartList(this.order)
        .then(res => {
          this.should = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 查询维修工具
    Repair_toolList() {
      repairtoolList(this.order)
        .then(res => {
          this.need = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 更新维修单状态
    Repair_Status() {
      repairStatus({
        Repair_Orderno: this.order,
        Status: this.statu,
        UserName: this.userInfo.nickname
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result) {
            this.$message({ message: '操作成功', type: 'success' })
            this.QueryRepair_order()
          } else {
            this.$message.error('操作失败')
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 维修分项下拉选择框
    typeTreeClick(data, node) {
      if (node.level === 1) {
        this.searchForm.repairType = node.data.TypeName
        this.QueryRepair_order()
      }
      if (node.level === 2) {
        this.searchForm.repairType =
          node.parent.data.TypeName + '/' + node.data.TypeName
        this.searchForm.smallClass = node.data.ID
        this.QueryRepair_order()
      }
      // if(data.id.split(',')[0]==='1'){
      //     this.searchForm.bigClass=data.id.split(',')[0]
      //     this.searchForm.repairType=data.name
      //     //使用temp作为中介值,保存大类的名称,在使用小类名称的时候,展示出所属大类的名称
      //     this.temp=data.name
      // }else{
      //     this.searchForm.smallClass=data.id.split(',')[1]
      //     this.GetRepair_ProjectDevice()
      //     this.searchForm.repairType=this.temp+'/'+data.name
      // }
    }
  }
}
</script>
<style lang="scss">
.repairOddNumber {
  cursor: pointer;
}
.noSubmit,
.noDivision,
.noCheck {
  color: #faad14;
}
.noAcceptance {
  color: #f5222d;
}
.noAccept,
.haveDone {
  color: #1890ff;
}
.repairing {
  color: #52c41a;
}
.repair-subitem-select {
  display: none;
}
.repair-item-popover {
  .subTree {
    height: 300px;
    overflow: auto;
    border: none;
  }
}
@media (max-width: 1200px) {
  .notic {
    display: none;
  }
}
@import 'src/assets/style/repair.scss';
</style>
