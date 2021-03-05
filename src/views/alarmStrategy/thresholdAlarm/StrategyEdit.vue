<template>
  <div class="alarm-stragegy-edit content-box">
    <el-form
      ref="basicForm"
      :model="basicForm"
      :rules="basicFormRules"
      label-width="80px"
      size="medium"
    >
      <div class="custom-panel">
        <div class="custom-panel-header">
          基本信息
        </div>
        <div class="custom-panel-body">
          <el-form-item label="所属项目" prop="project">
            <el-select
              v-model="basicForm.project"
              filterable
              placeholder="请选择项目"
              :disabled="
                Boolean($route.query.id) || Boolean($route.query.projectId)
              "
              style="width: 360px;"
              @change="handleChangeProject"
            >
              <el-option
                v-for="item in proList"
                :key="item.id"
                :value="item.id"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="策略名称" prop="name">
            <el-input
              v-model.trim="basicForm.name"
              placeholder="请输入策略名称"
              style="width: 360px;"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="basicForm.remark"
              :rows="3"
              type="textarea"
              placeholder="请输入备注细则"
              style="width: 360px;"
            />
          </el-form-item>
          <el-form-item
            class="inline-form-item"
            label="设备类型"
            prop="systemTypeId"
          >
            <el-select
              v-model="basicForm.systemTypeId"
              placeholder="请选择设备类型"
              size="small"
              :disabled="Boolean($route.query.id)"
              style="width:360px;"
              @change="changeDeviceTypeId"
            >
              <el-option
                v-for="item in deviceTypeOptions"
                :label="item.name"
                :value="item.BigTypeId"
                :key="item.BigTypeId"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <div>
            <el-form-item
              class="inline-form-item"
              label="点位类型"
              prop="pointType"
            >
              <el-select
                v-model="basicForm.pointType"
                placeholder="请选择点位类型"
                size="small"
                :disabled="Boolean($route.query.id)"
                style="width:360px;"
                @change="changePointType"
              >
                <el-option-group
                  v-for="group in pointTypeList"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="item in group.options"
                    :key="item.ID"
                    :label="item.TypeName"
                    :value="item.ID"
                  >
                    <span style="float: left;margin-right: 25px;">{{
                      item.TypeName
                    }}</span>
                    <span
                      v-if="group.label === '状态量'"
                      style="float: right; color: #8492a6; font-size: 13px"
                      >{{ item.Value }}</span
                    >
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
            <!-- <el-tooltip
              class="item"
              effect="dark"
              content="单条报警策略中只能配置一种类型点位的报警"
              placement="right"
            >
              <c-svg
                name="attention"
                style="font-size: 16px;margin-left: 15px;"
              />
            </el-tooltip> -->
          </div>
          <el-form-item class="inline-form-item" label="报警点位" required>
            <div class="transfer-wrap">
              <Transfer v-model="basicForm.points" :data="pointSource" />
            </div>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <div class="custom-panel">
      <div class="custom-panel-header">
        报警规则
        <el-button
          :disabled="!Boolean(basicForm.pointType)"
          type="primary"
          size="small"
          style="margin-left: 20px;"
          @click.native="addRegularItem"
        >
          新增时间段
        </el-button>
      </div>
      <div class="custom-panel-body">
        <el-form
          v-if="currentPointType === 'simulate'"
          ref="simulateRegularForm"
          :model="simulateRegularForm"
          label-width="80px"
          size="small"
        >
          <div
            v-for="(regular, index) in simulateRegularForm.regulars"
            :key="index"
            :class="[
              'box-light',
              index + 1 === simulateRegularForm.regulars.length
                ? 'scroll-target'
                : ''
            ]"
          >
            <el-form-item
              :prop="'regulars.' + index + '.time'"
              :rules="{
                type: 'array',
                required: true,
                message: '选择时间范围',
                trigger: 'change'
              }"
              label-width="0"
            >
              <el-popover
                v-model="regular.popoverVisible"
                placement="top"
                width="190"
                trigger="click"
              >
                <p>确定要删除这条报警规则吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button
                    size="mini"
                    type="text"
                    @click="regular.popoverVisible = false"
                  >
                    取消
                  </el-button>
                  <el-button
                    type="primary"
                    size="mini"
                    @click="removeRegularItem(index, regular)"
                  >
                    确定
                  </el-button>
                </div>
                <el-tooltip
                  slot="reference"
                  class="item"
                  effect="dark"
                  content="删除该时间段报警规则"
                  placement="top"
                >
                  <el-button class="delete-icon-btn" type="text">
                    <i class="el-icon-delete-solid"></i>
                  </el-button>
                </el-tooltip>
              </el-popover>

              <el-time-picker
                v-model="regular.time"
                is-range
                format="HH:mm:ss"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围"
                :clearable="false"
                style="width: 220px;"
                @change="changeSimulateTimeRange(index)"
              />
            </el-form-item>

            <div style="margin-bottom: 15px;">
              <span class="box-light-title-weight">触发规则</span>
            </div>
            <div
              class="regular-row2"
              :style="{ color: regular.check1 ? '' : '#D5D5D5' }"
            >
              <el-switch
                v-model="regular.check1"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                @change="toggleSimulateTriggerCondition(regular)"
              />
              <span style="margin: 0 10px 0 15px;">超过上上限</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.limitValue1'"
                :rules="{ validator: checkLimit, trigger: 'blur' }"
                label-width="0"
              >
                <el-input
                  v-model="regular.limitValue1"
                  :disabled="!regular.check1"
                  placeholder="输入阈值"
                />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">持续</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.duration1'"
                :rules="{ validator: checkDuration, trigger: 'blur' }"
                label-width="0"
              >
                <el-input
                  v-model="regular.duration1"
                  :disabled="!regular.check1"
                  placeholder="输入时间"
                />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;"
                >分钟后产生报警，报警类型</span
              >
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="regular.alarmType1"
                  placeholder="报警类型"
                  filterable
                  @change="val => changeAlarmType(val, regular, 'level1')"
                  :disabled="!regular.check1"
                  style="width:200px;"
                >
                  <el-option
                    v-for="item in alarmTypeOptions"
                    :label="item.Name"
                    :key="item.Id"
                    :value="item.Id"
                  />
                </el-select>
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">，报警等级</span>
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="regular.level1"
                  :disabled="!regular.check1"
                  placeholder="请选择报警等级"
                  style="width:100px;"
                >
                  <el-option label="记录报警" :value="4" />
                  <el-option label="一般报警" :value="3" />
                  <el-option label="重要报警" :value="2" />
                  <el-option label="紧急报警" :value="1" />
                </el-select>
              </el-form-item>
            </div>
            <div
              class="regular-row2"
              :style="{ color: regular.check2 ? '' : '#D5D5D5' }"
            >
              <el-switch
                v-model="regular.check2"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                @change="toggleSimulateTriggerCondition(regular)"
              />
              <span style="margin: 0 24px 0 15px;">超过上限</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.limitValue2'"
                :rules="{ validator: checkLimit, trigger: 'blur' }"
                label-width="0"
              >
                <el-input
                  v-model="regular.limitValue2"
                  :disabled="!regular.check2"
                  placeholder="输入阈值"
                />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">持续</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.duration2'"
                :rules="{ validator: checkDuration, trigger: 'blur' }"
                label-width="0"
              >
                <el-input
                  v-model="regular.duration2"
                  :disabled="!regular.check2"
                  placeholder="输入时间"
                />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;"
                >分钟后产生报警，报警类型</span
              >
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="regular.alarmType2"
                  @change="val => changeAlarmType(val, regular, 'level2')"
                  placeholder="报警类型"
                  filterable
                  :disabled="!regular.check2"
                  style="width:200px;"
                >
                  <el-option
                    v-for="item in alarmTypeOptions"
                    :label="item.Name"
                    :key="item.Id"
                    :value="item.Id"
                  />
                </el-select>
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">，报警等级</span>
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="regular.level2"
                  :disabled="!regular.check2"
                  placeholder="请选择报警等级"
                  style="width:100px;"
                >
                  <el-option label="记录报警" :value="4" />
                  <el-option label="一般报警" :value="3" />
                  <el-option label="重要报警" :value="2" />
                  <el-option label="紧急报警" :value="1" />
                </el-select>
              </el-form-item>
            </div>
            <div
              class="regular-row2"
              :style="{ color: regular.check3 ? '' : '#D5D5D5' }"
            >
              <el-switch
                v-model="regular.check3"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                @change="toggleSimulateTriggerCondition(regular)"
              />
              <span style="margin: 0 24px 0 15px;">低于下限</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.limitValue3'"
                :rules="{ validator: checkLimit, trigger: 'blur' }"
                label-width="0"
              >
                <el-input
                  v-model="regular.limitValue3"
                  :disabled="!regular.check3"
                  placeholder="输入阈值"
                />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">持续</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.duration3'"
                :rules="{ validator: checkDuration, trigger: 'blur' }"
                label-width="0"
              >
                <el-input
                  v-model="regular.duration3"
                  :disabled="!regular.check3"
                  placeholder="输入时间"
                />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;"
                >分钟后产生报警，报警类型</span
              >
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="regular.alarmType3"
                  placeholder="报警类型"
                  @change="val => changeAlarmType(val, regular, 'level3')"
                  :disabled="!regular.check3"
                  filterable
                  style="width:200px;"
                >
                  <el-option
                    v-for="item in alarmTypeOptions"
                    :label="item.Name"
                    :key="item.Id"
                    :value="item.Id"
                  />
                </el-select>
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">，报警等级</span>
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="regular.level3"
                  :disabled="!regular.check3"
                  placeholder="请选择报警等级"
                  style="width:100px;"
                >
                  <el-option label="记录报警" :value="4" />
                  <el-option label="一般报警" :value="3" />
                  <el-option label="重要报警" :value="2" />
                  <el-option label="紧急报警" :value="1" />
                </el-select>
              </el-form-item>
            </div>
            <div
              class="regular-row2"
              :style="{ color: regular.check4 ? '' : '#D5D5D5' }"
            >
              <el-switch
                v-model="regular.check4"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                @change="toggleSimulateTriggerCondition(regular)"
              />
              <span style="margin: 0 10px 0 15px;">低于下下限</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.limitValue4'"
                :rules="{ validator: checkLimit, trigger: 'blur' }"
                label-width="0"
              >
                <el-input
                  v-model="regular.limitValue4"
                  :disabled="!regular.check4"
                  placeholder="输入阈值"
                />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">持续</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.duration4'"
                :rules="{ validator: checkDuration, trigger: 'blur' }"
                label-width="0"
              >
                <el-input
                  v-model="regular.duration4"
                  :disabled="!regular.check4"
                  placeholder="输入时间"
                />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;"
                >分钟后产生报警，报警类型</span
              >
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="regular.alarmType4"
                  @change="val => changeAlarmType(val, regular, 'level4')"
                  placeholder="报警类型"
                  filterable
                  :disabled="!regular.check4"
                  style="width:200px;"
                >
                  <el-option
                    v-for="item in alarmTypeOptions"
                    :label="item.Name"
                    :key="item.Id"
                    :value="item.Id"
                  />
                </el-select>
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">，报警等级</span>
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="regular.level4"
                  :disabled="!regular.check4"
                  placeholder="请选择报警等级"
                  style="width:100px;"
                >
                  <el-option label="记录报警" :value="4" />
                  <el-option label="一般报警" :value="3" />
                  <el-option label="重要报警" :value="2" />
                  <el-option label="紧急报警" :value="1" />
                </el-select>
              </el-form-item>
            </div>
            <div style="margin-bottom: 15px;">
              <span class="box-light-title-weight">清除规则</span>
            </div>
            <el-form-item
              :prop="'regulars.' + index + '.delayNoticeTime'"
              :rules="{ validator: checkDelayNoticeTime, trigger: 'blur' }"
              label-width="0"
            >
              <div class="regular-row2">
                数值恢复持续&nbsp;
                <el-input
                  v-model.trim.number="regular.delayNoticeTime"
                  class="width85"
                />
                &nbsp;分钟后清除报警
              </div>
            </el-form-item>

            <div style="margin-bottom: 15px;">
              <el-checkbox
                v-model="regular.thresholdCheck"
                style="margin-right: 10px"
              />
              <span class="box-light-title-weight" style="margin-right: 0px;"
                >阈值死区</span
              >
              <el-tooltip
                class="item"
                effect="dark"
                content="在原报警阈值上下增加两个界限，使报警触发区域变成带状，避免波动引起的误报"
                placement="right"
              >
                &nbsp;&nbsp;<c-svg
                  name="what"
                  style="font-size: 16px;margin-left: 15px;"
                  class-name="icon-what"
                />
              </el-tooltip>
            </div>
            <el-form-item
              class="inline-form-item width85"
              style="margin-bottom: 0;"
              :prop="'regulars.' + index + '.threshold'"
              :rules="{ validator: checkThreshold, trigger: 'blur' }"
              label-width="0"
            >
              <el-input
                placeholder="请输入"
                v-model="regular.threshold"
                :disabled="!regular.thresholdCheck"
              />
            </el-form-item>
            <el-alert
              v-if="regular.errorMsg"
              :title="regular.errorMsg"
              type="error"
              :closable="false"
              show-icon
              style="width: 620px;"
            />
          </div>
        </el-form>
        <el-form
          v-if="currentPointType === 'state'"
          ref="stateRegularForm"
          :model="stateRegularForm"
          label-width="80px"
          size="small"
        >
          <div
            v-for="(regular, index) in stateRegularForm.regulars"
            :key="index"
            :class="[
              'box-light',
              index + 1 === stateRegularForm.regulars.length
                ? 'scroll-target'
                : ''
            ]"
          >
            <el-form-item
              :prop="'regulars.' + index + '.time'"
              :rules="{
                type: 'array',
                required: true,
                message: '选择时间范围',
                trigger: 'change'
              }"
              label-width="0"
            >
              <el-popover
                v-model="regular.popoverVisible"
                placement="top"
                width="190"
                trigger="click"
              >
                <p>确定要删除这条报警规则吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button
                    size="mini"
                    type="text"
                    @click="regular.popoverVisible = false"
                  >
                    取消
                  </el-button>
                  <el-button
                    type="primary"
                    size="mini"
                    @click="removeRegularItem(index, regular)"
                  >
                    确定
                  </el-button>
                </div>
                <el-tooltip
                  slot="reference"
                  class="item"
                  effect="dark"
                  content="删除该时间段报警规则"
                  placement="top"
                >
                  <el-button class="delete-icon-btn" type="text">
                    <i class="el-icon-delete-solid"></i>
                  </el-button>
                </el-tooltip>
              </el-popover>
              <el-time-picker
                v-model="regular.time"
                is-range
                format="HH:mm:ss"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围"
                :clearable="false"
                style="width: 220px;"
                @change="changeStateTimeRange(index)"
              />
            </el-form-item>
            <div style="margin-bottom: 15px;">
              <span class="box-light-title-weight">触发规则</span>
            </div>
            <div
              v-for="(item, index1) in regular.states"
              :key="index1"
              :style="{ color: item.check ? '' : '#D5D5D5' }"
            >
              <el-switch
                v-model="item.check"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                @change="toggleStateTriggerCondition(regular)"
              />
              <span style="margin: 0 10px 0 15px;">触发</span>
              <el-tag
                :type="item.check ? '' : 'info'"
                size="small"
                style="font-size: 12px;"
              >
                {{ item.tag }}
              </el-tag>
              <span style="margin: 0 10px 0 10px;">状态持续</span>
              <el-form-item
                class="inline-form-item width85"
                :prop="'regulars.' + index + '.states.' + index1 + '.duration'"
                :rules="{ validator: checkStateDuration, trigger: 'blur' }"
                label-width="0"
              >
                <el-input v-model="item.duration" :disabled="!item.check" />
              </el-form-item>
              <span style="margin: 0 10px 0 10px;"
                >分钟后产生报警，报警类型</span
              >
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="item.alarmType"
                  @change="val => changeAlarmType(val, item, 'level')"
                  placeholder="报警类型"
                  filterable
                  :disabled="!item.check"
                  style="width:200px;"
                >
                  <el-option
                    v-for="item in alarmTypeOptions"
                    :label="item.Name"
                    :key="item.Id"
                    :value="item.Id"
                  />
                </el-select>
              </el-form-item>
              <span style="margin: 0 10px 0 10px;">，报警等级</span>
              <el-form-item class="inline-form-item" label-width="0">
                <el-select
                  v-model="item.level"
                  :disabled="!item.check"
                  placeholder="请选择报警等级"
                  style="width:100px;"
                >
                  <el-option label="记录报警" :value="4" />
                  <el-option label="一般报警" :value="3" />
                  <el-option label="重要报警" :value="2" />
                  <el-option label="紧急报警" :value="1" />
                </el-select>
              </el-form-item>
            </div>
            <div style="margin-bottom: 15px;">
              <span class="box-light-title-weight">清除规则</span>
            </div>
            <el-form-item
              :prop="'regulars.' + index + '.delayNoticeTime'"
              :rules="{ validator: checkStateDelayNoticeTime, trigger: 'blur' }"
              label-width="0"
            >
              <div class="regular-row2">
                数值恢复持续&nbsp;
                <el-input
                  v-model.trim.number="regular.delayNoticeTime"
                  class="width85"
                />
                &nbsp;分钟后清除报警
              </div>
            </el-form-item>
            <el-alert
              v-if="Boolean(regular.errorMsg)"
              :title="regular.errorMsg"
              :closable="false"
              type="error"
              show-icon
              style="width: 583px;"
            />
          </div>
        </el-form>
        <div class="box-light" style="margin-top: 24px;">
          <div style="margin-bottom: 15px;position:relative;">
            <span class="box-light-title-weight">
              报警升级
            </span>
          </div>
          <el-form
            ref="alarmUpdateForm"
            :model="alarmUpdateForm"
            :rules="alarmUpdateFormRules"
            label-width="80px"
            inline
            size="small"
          >
            <div>
              <el-switch
                v-model="alarmUpdateForm.upgrade1"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                @change="$refs['alarmUpdateForm'].validate()"
              />
              <span
                class="box-light-title"
                style="margin-top: 5px;margin-left: 10px"
              >
                <el-tag size="small" class="record-tag">记录</el-tag
                >&nbsp;&nbsp;到&nbsp;
                <el-tag size="small" class="normal-tag">一般</el-tag>
                &nbsp;升级时间间隔：
              </span>
              <el-form-item label-width="0" prop="updateTime1">
                <el-input
                  v-model.trim="alarmUpdateForm.updateTime1"
                  :disabled="!alarmUpdateForm.upgrade1"
                  placeholder="请输入"
                  style="width: 70px;"
                />
              </el-form-item>
              <span style="margin-top: 10px;margin-left:10px;color:#656565;"
                >分钟</span
              >
            </div>
            <div>
              <el-switch
                v-model="alarmUpdateForm.upgrade2"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                @change="$refs['alarmUpdateForm'].validate()"
              />
              <span
                class="box-light-title"
                style="margin-top: 5px;margin-left: 10px"
              >
                <el-tag size="small" class="normal-tag">一般</el-tag
                >&nbsp;&nbsp;到&nbsp;
                <el-tag size="small" class="important-tag">重要</el-tag>
                &nbsp;升级时间间隔：
              </span>
              <el-form-item label-width="0" prop="updateTime2">
                <el-input
                  v-model.trim="alarmUpdateForm.updateTime2"
                  :disabled="!alarmUpdateForm.upgrade2"
                  placeholder="请输入"
                  style="width: 70px;"
                />
              </el-form-item>
              <span style="margin-top: 10px;margin-left:10px;color:#656565;"
                >分钟</span
              >
            </div>
            <div>
              <el-switch
                v-model="alarmUpdateForm.upgrade3"
                active-color="#409EFF"
                inactive-color="#dcdfe6"
                @change="$refs['alarmUpdateForm'].validate()"
              />
              <span
                class="box-light-title"
                style="margin-top: 5px;margin-left: 10px"
              >
                <el-tag size="small" class="important-tag">重要</el-tag
                >&nbsp;&nbsp;到&nbsp;
                <el-tag size="small" class="emergency-tag">紧急</el-tag>
                &nbsp;升级时间间隔：
              </span>
              <el-form-item label-width="0" prop="updateTime3">
                <el-input
                  v-model.trim="alarmUpdateForm.updateTime3"
                  :disabled="!alarmUpdateForm.upgrade3"
                  placeholder="请输入"
                  style="width: 70px;"
                />
              </el-form-item>
              <span style="margin-top: 10px;margin-left:10px;color:#656565;"
                >分钟</span
              >
            </div>
          </el-form>
        </div>
        <div
          v-if="currentPointType !== 'state'"
          class="box-light"
          style="margin-top: 24px;"
        >
          <div style="margin-bottom: 15px;position:relative;">
            <el-checkbox
              @change="$refs['normalValueForm'].validate()"
              v-model="normalValueForm.normalSet"
              style="margin-right: 10px;"
            ></el-checkbox>
            <span class="box-light-title-weight">
              有效数值范围
            </span>
          </div>
          <el-form
            ref="normalValueForm"
            :model="normalValueForm"
            :rules="normalValueFormRules"
            label-width="80px"
            inline
            size="small"
          >
            <div class="regular-row2">
              <el-form-item
                label-width="0"
                prop="normalMin"
                style="margin-bottom: 0;"
              >
                <el-input
                  v-model.trim="normalValueForm.normalMin"
                  :disabled="!normalValueForm.normalSet"
                  placeholder="请输入"
                  style="width: 120px;"
                />
              </el-form-item>
              <span style="margin-right: 10px;line-height: 32px;">到</span>
              <el-form-item
                label-width="0"
                prop="normalMax"
                style="margin-bottom: 0;"
              >
                <el-input
                  v-model.trim="normalValueForm.normalMax"
                  :disabled="!normalValueForm.normalSet"
                  placeholder="请输入"
                  style="width: 120px;"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <el-form
      ref="noticeForm"
      :model="noticeForm"
      :rules="noticeFormRules"
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
          <div class="box-light" style="margin-top: 24px;">
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
    <div class="custom-panel">
      <div class="custom-panel-header">
        联系人
        <user-select :data="userList" @change="selectUser">
          <el-button
            type="primary"
            size="mini"
            circle
            icon="el-icon-plus"
            style="margin-left: 30px;"
          />
        </user-select>
      </div>
      <div class="custom-panel-body">
        <el-table :data="contactTableData" style="width: 100%;">
          <el-table-column label="操作" width="60px">
            <template slot-scope="scope">
              <el-button
                type="text"
                class="btn-danger"
                @click.native="deleteContact(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column min-width="100" prop="name" label="姓名" />
          <el-table-column min-width="100" prop="mobile" label="电话" />
          <el-table-column
            min-width="100"
            prop="binding"
            label="是否绑定公众号"
          />
          <el-table-column min-width="230" prop="level" label="接收通知等级">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.levels"
                size="small"
                multiple
                placeholder="请选择接收通知等级"
                style="width:210px;"
              >
                <el-option label="一般" :value="3" />
                <el-option label="重要" :value="2" />
                <el-option label="紧急" :value="1" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column min-width="230" prop="range" label="接收通知时段">
            <template slot-scope="scope">
              <el-time-picker
                v-model="scope.row.range[0]"
                format="HH:mm:ss"
                range-separator="至"
                :clearable="false"
                placeholder="选择开始时间"
                size="small"
                style="width: 120px;"
              />
              <span>至</span>
              <el-time-picker
                v-model="scope.row.range[1]"
                format="HH:mm:ss"
                :clearable="false"
                placeholder="选择结束时间"
                size="small"
                style="width: 120px;"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="custom-panel">
      <div class="custom-panel-body" style="text-align: center;">
        <el-button size="medium" @click.native="$router.back()">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          size="medium"
          style="margin-left: 40px;"
          @click.native="submit"
        >
          提交
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Transfer from '../component/Transfer'
import UserSelect from '../component/UserSelect'
import { fetchPointTypeList } from '@/api/pointType'
import { getModelListByProject } from '@/api/model'
import {
  queryProjectPoint,
  queryProjectConcats,
  getAlarmTypes,
  alarmStrategyAdd,
  queryAlarmStrategy,
  alarmStrategyUpdate
} from '@/api/alarmStrategyNew'
import { logSnapShotFactory } from '@/utils/logSnapShot'
import { storageName } from '@/utils/index'
export default {
  components: {
    Transfer,
    UserSelect
  },
  data() {
    // 检测模拟量报警恢复时通知，延时 分钟推送
    const checkDelayNoticeTime = (rule, value, callback) => {
      // const index = this.getIndex(rule.field)
      // if (this.simulateRegularForm.regulars[index].noticeCheck) {
      const result = this.isInteger(value)
      if (!result.res) {
        callback(new Error(result.msg))
      } else {
        callback()
      }
      // }
      //  else {
      //   callback()
      // }
    }
    // 检测阈值死区
    const checkThreshold = (rule, value, callback) => {
      const index = this.getIndex(rule.field)
      if (this.simulateRegularForm.regulars[index].thresholdCheck) {
        const result = this.isInteger(value)
        if (!result.res) {
          callback(new Error(result.msg))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const checkLimit = (rule, value, callback) => {
      const index = this.getIndex(rule.field)
      const limitValueIndex = rule.field.split('.')[2].replace('limitValue', '')
      if (this.simulateRegularForm.regulars[index]['check' + limitValueIndex]) {
        const result = this.isInteger(value)
        if (!result.res) {
          callback(new Error(result.msg))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const checkDuration = (rule, value, callback) => {
      const index = this.getIndex(rule.field)
      const durationIndex = rule.field.split('.')[2].replace('duration', '')
      if (this.simulateRegularForm.regulars[index]['check' + durationIndex]) {
        const result = this.isInteger(value)
        if (!result.res) {
          callback(new Error(result.msg))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    // 检测状态量报警恢复时通知，延时 分钟推送
    const checkStateDelayNoticeTime = (rule, value, callback) => {
      // const index = this.getIndex(rule.field)
      const result = this.isInteger(value)
      if (!result.res) {
        callback(new Error(result.msg))
      } else {
        callback()
      }
    }
    const checkStateDuration = (rule, value, callback) => {
      const { index1, index2 } = this.getIndex(rule.field)
      if (this.stateRegularForm.regulars[index1].states[index2].check) {
        const result = this.isInteger(value)
        if (!result.res) {
          callback(new Error(result.msg))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const checkRepeatTime = (rule, value, callback) => {
      if (this.noticeForm.repeatCheck) {
        const result = this.isInteger(value)
        if (!result.res) {
          callback(new Error(result.msg))
        } else {
          if (parseInt(value) >= 5) {
            callback()
          } else {
            callback(new Error('时间间隔最小5分钟'))
          }
        }
      } else {
        callback()
      }
    }
    const checkUpdateTime = (rule, value, callback) => {
      // fule.filed: 'upgrade3' | 'upgrade1' | 'upgrade2'
      const index = rule.field.charAt(rule.field.length - 1)
      if (this.alarmUpdateForm['upgrade' + index]) {
        const result = this.isInteger(value)
        if (!result.res) {
          callback(new Error(result.msg))
        } else {
          if (parseInt(value) < 0) {
            callback(new Error('最小为0'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    }
    const checkNormalValue = (rule, value, callback) => {
      if (this.normalValueForm.normalSet) {
        const result = this.isInteger(value)
        if (!result.res) {
          callback(new Error(result.msg))
        } else {
          const { normalMax, normalMin } = this.normalValueForm
          // 比较最大最小值大小
          if (normalMax && normalMin) {
            if (Number(normalMax) < Number(normalMin)) {
              callback(new Error('最大值应该大于最小值'))
            } else {
              callback()
            }
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    }
    return {
      basicForm: {
        name: '',
        project: '',
        remark: '',
        systemTypeId: '',
        pointType: '',
        points: []
      },
      basicFormRules: {
        project: [
          { required: true, message: '请选择所属项目', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入策略名称', trigger: 'blur' },
          { min: 2, max: 25, message: '长度在 2 到 25 个字符', trigger: 'blur' }
        ],
        systemTypeId: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        pointType: [
          { required: true, message: '请选择点位类型', trigger: 'change' }
        ]
      },
      deviceTypeOptions: [],
      pointTypeList: [],
      pointSource: [],
      alarmTypeOptions: [],
      currentPointType: 'simulate',
      simulateRegularForm: {
        regulars: [
          {
            popoverVisible: false,
            time: [
              new Date(2000, 10, 10, 0, 0, 0),
              new Date(2000, 10, 10, 23, 59, 59)
            ],
            noticeCheck: false,
            delayNoticeTime: 0,
            thresholdCheck: false,
            threshold: undefined,
            check1: true,
            limitValue1: undefined,
            duration1: 5,
            level1: 1,
            alarmType1: undefined,
            check2: false,
            limitValue2: '',
            duration2: 5,
            level2: 1,
            alarmType2: undefined,
            check3: false,
            limitValue3: undefined,
            duration3: undefined,
            level3: 1,
            alarmType3: undefined,
            check4: false,
            limitValue4: undefined,
            duration4: undefined,
            level4: 1,
            alarmType4: undefined,
            errorMsg: ''
          }
        ]
      },
      stateRegularForm: {
        regulars: [],
        stateOptions: []
      },
      alarmUpdateForm: {
        upgrade1: false,
        upgrade2: false,
        upgrade3: false,
        updateTime1: undefined,
        updateTime2: undefined,
        updateTime3: undefined
      },
      alarmUpdateFormRules: {
        updateTime1: [{ validator: checkUpdateTime, trigger: 'blur' }],
        updateTime2: [{ validator: checkUpdateTime, trigger: 'blur' }],
        updateTime3: [{ validator: checkUpdateTime, trigger: 'blur' }]
      },
      normalValueForm: {
        normalSet: false,
        normalMax: undefined,
        normalMin: undefined
      },
      normalValueFormRules: {
        normalMax: [{ validator: checkNormalValue, trigger: 'blur' }],
        normalMin: [{ validator: checkNormalValue, trigger: 'blur' }]
      },
      noticeForm: {
        normal: ['微信', 'App'],
        important: ['微信', 'App'],
        emergency: ['弹屏', '微信', 'App'],
        recovery: false,
        repeatCheck: false,
        repeatTime: undefined
      },
      noticeFormRules: {
        repeatTime: [{ validator: checkRepeatTime, trigger: 'blur' }]
      },
      contactTableData: [],
      userList: [],
      checkDelayNoticeTime,
      checkThreshold,
      checkLimit,
      checkDuration,
      checkStateDuration,
      checkStateDelayNoticeTime,
      submitLoading: false,
      uid: JSON.parse(sessionStorage.getItem(storageName('userInfo'))).uid
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    }
  },
  mounted() {
    if (this.$route.query.id) {
      queryAlarmStrategy({
        ID: this.$route.query.id
      })
        .then(res => {
          if (res.data.Code !== 200) {
            this.$message.error('策略查询失败')
            return false
          }
          const data = res.data.Data
          data.basicForm.points = data.checkPoint
          this.basicForm = data.basicForm
          this.normalValueForm.normalSet = this.basicForm.normalSet
          this.normalValueForm.normalMax = this.basicForm.normalMax
          this.normalValueForm.normalMin = this.basicForm.normalMin
          this.noticeForm = data.noticeForm

          const {
            upgrade1,
            upgrade2,
            upgrade3,
            updateTime1,
            updateTime2,
            updateTime3
          } = this.noticeForm
          this.alarmUpdateForm.upgrade1 = upgrade1
          this.alarmUpdateForm.upgrade2 = upgrade2
          this.alarmUpdateForm.upgrade3 = upgrade3
          this.alarmUpdateForm.updateTime1 = updateTime1
          this.alarmUpdateForm.updateTime2 = updateTime2
          this.alarmUpdateForm.updateTime3 = updateTime3

          if (data.simulateRegulars.length) {
            data.simulateRegulars.forEach(item => {
              item.time = [
                this.stringToDate(item.time[0]),
                this.stringToDate(item.time[1])
              ]
            })
          } else {
            data.stateRegulars.forEach(item => {
              item.time = [
                this.stringToDate(item.time[0]),
                this.stringToDate(item.time[1])
              ]
            })
          }
          this.simulateRegularForm.regulars = data.simulateRegulars
          this.stateRegularForm.regulars = data.stateRegulars

          data.concats.forEach(item => {
            item.range = [
              this.stringToDate(item.range[0]),
              this.stringToDate(item.range[1])
            ]
          })
          this.contactTableData = data.concats
          this.fetchPointList()
          this.fetchUserList(this.basicForm.ID)
          this.fetchAlarmTypeOptions(this.basicForm.systemTypeId)
          this.fetchPointTypeList(this.basicForm.project)
          this.fetchDeviceTypeOptions(this.basicForm.project)
        })
        .catch(err => {
          this.$message.error('策略获取失败')
          console.error(err)
        })
    }
    if (this.$route.params.payload) {
      const {
        basicForm,
        alarmUpdateForm,
        noticeForm,
        contactTableData,
        simulateRegularForm,
        stateRegularForm
      } = this.$route.params.payload
      this.basicForm = basicForm
      this.normalValueForm.normalSet = this.basicForm.normalSet
      this.normalValueForm.normalMax = this.basicForm.normalMax
      this.normalValueForm.normalMin = this.basicForm.normalMin
      this.alarmUpdateForm = alarmUpdateForm
      this.noticeForm = noticeForm
      this.contactTableData = contactTableData
      this.simulateRegularForm = simulateRegularForm
      this.stateRegularForm = stateRegularForm
      this.fetchPointList()
      this.fetchUserList(this.basicForm.ID)
      this.fetchAlarmTypeOptions(this.basicForm.systemTypeId)
      this.fetchPointTypeList(this.basicForm.project)
      this.fetchDeviceTypeOptions(this.basicForm.project)
    }
    if (this.$route.query.projectId) {
      this.basicForm.project = this.$route.query.projectId
      this.handleChangeProject(this.basicForm.project)
    }
  },
  methods: {
    // 修改项目
    handleChangeProject(val) {
      this.fetchUserList()
      this.clearForm()
      this.contactTableData = []

      this.pointTypeList = []
      this.basicForm.pointType = ''
      this.fetchPointTypeList(val)

      this.basicForm.systemTypeId = ''
      this.deviceTypeOptions = []
      this.fetchDeviceTypeOptions(val)

      this.basicForm.points = []
      this.pointSource = []
    },
    // 修改设备类型触发
    changeDeviceTypeId(val) {
      this.alarmTypeOptions = []
      this.basicForm.points = []
      this.pointSource = []
      this.fetchAlarmTypeOptions(val)
      if (typeof this.basicForm.pointType === 'number') {
        this.fetchPointList()
      }
    },
    // 修改点位类型触发
    changePointType(val) {
      if (typeof this.basicForm.systemTypeId === 'number') {
        // 已经选中了设备类型
        this.fetchPointList()
      }
      this.basicForm.points = []
      this.pointSource = []
      this.clearForm()
      // 判断当前点位是模拟量还是状态量
      this.pointTypeList[0].options.forEach(item => {
        if (item.ID === val) {
          this.currentPointType = 'state'
          let temp1 = item.Value.split(' | ')
          let temp2 = temp1.map(item => item.split('：'))
          temp2.forEach(item => {
            this.stateRegularForm.stateOptions.push({
              tag: item[1],
              value: item[0]
            })
          })
          let states = this.stateRegularForm.stateOptions.map(
            (item, index) => ({
              tag: item.tag,
              tag_value: item.value,
              check: index === 0,
              limitValue: undefined,
              duration: 5,
              level: 1,
              errorMsg: ''
            })
          )
          this.stateRegularForm.regulars.push({
            popoverVisible: false,
            time: [
              new Date(2000, 10, 10, 0, 0, 0),
              new Date(2000, 10, 10, 23, 59, 59)
            ],
            noticeCheck: false,
            delayNoticeTime: 0,
            states
          })
        }
      })
      this.pointTypeList[1].options.forEach(item => {
        if (item.ID === val) {
          this.currentPointType = 'simulate'
        }
      })
    },
    // 添加规则表单
    addRegularItem() {
      if (this.currentPointType === 'simulate') {
        this.simulateRegularForm.regulars.push({
          time: [
            new Date(2000, 10, 10, 0, 0, 0),
            new Date(2000, 10, 10, 23, 59, 59)
          ],
          noticeCheck: false,
          delayNoticeTime: 0,
          thresholdCheck: false,
          threshold: undefined,
          check1: true,
          limitValue1: undefined,
          duration1: 5,
          level1: 1,
          alarmType1: undefined,
          check2: false,
          limitValue2: undefined,
          duration2: 5,
          level2: 1,
          alarmType2: undefined,
          check3: false,
          limitValue3: undefined,
          duration3: 5,
          level3: 1,
          alarmType3: undefined,
          check4: false,
          limitValue4: undefined,
          duration4: 5,
          level4: 1,
          alarmType4: undefined,
          errorMsg: ''
        })
      } else {
        let states = this.stateRegularForm.stateOptions.map((item, index) => ({
          tag: item.tag,
          tag_value: item.value,
          check: index === 0,
          limitValue: undefined,
          duration: 5,
          level: 1,
          errorMsg: ''
        }))
        this.stateRegularForm.regulars.push({
          popoverVisible: false,
          time: [
            new Date(2000, 10, 10, 0, 0, 0),
            new Date(2000, 10, 10, 23, 59, 59)
          ],
          noticeCheck: false,
          delayNoticeTime: 0,
          states
        })
      }
      this.$nextTick(() => {
        this.smoothScroll('.scroll-target')
      })
    },
    // 删除规则表单
    removeRegularItem(index, regular) {
      regular.popoverVisible = false
      if (this.currentPointType === 'state') {
        this.stateRegularForm.regulars.splice(index, 1)
      } else {
        this.simulateRegularForm.regulars.splice(index, 1)
      }
    },
    submit() {
      let res = [] // 4个或5个表单的基本验证情况
      this.$refs['basicForm'].validate(valid => {
        if (valid) {
          res.push(true)
        } else {
          res.push(false)
          return false
        }
      })

      this.$refs['alarmUpdateForm'].validate(valid => {
        if (valid) {
          res.push(true)
        } else {
          res.push(false)
          return false
        }
      })

      if (this.currentPointType === 'state') {
        this.$refs['stateRegularForm'].validate(valid => {
          if (valid) {
            res.push(true)
          } else {
            res.push(false)
            return false
          }
        })
      } else {
        this.$refs['simulateRegularForm'].validate(valid => {
          if (valid) {
            res.push(true)
            if (this.simulateRegularForm.regulars.length) {
              this.simulateRegularForm.regulars.forEach(item => {
                let limitValues = []
                let alarmLevels = []
                for (let i = 1; i <= 4; i++) {
                  if (item['check' + i]) {
                    // 只验证已经被开启的规则
                    limitValues.push(item['limitValue' + i])
                    alarmLevels.push(item['level' + i])
                  }
                }
                // 比较各个限定值的大小关系（上上限 > 上限 > 下限 > 下下限）
                if (!this.compare(limitValues)) {
                  this.$set(
                    item,
                    'errorMsg',
                    '错误的限定值大小关系（上上限 > 上限 > 下限 > 下下限）'
                  )
                } else {
                  this.$set(item, 'errorMsg', '')
                }
                // 比较报警等级的大小
                if (item.check1 && item.check2) {
                  // 上上限和上限开关都打开
                  if (item.level2 <= item.level1) {
                    let errorMsg = item.errorMsg
                      ? item.errorMsg +
                        '   &    ' +
                        '上上限的报警等级必须大于上限'
                      : '上上限的报警等级必须大于上限'
                    this.$set(item, 'errorMsg', errorMsg)
                  }
                }
                if (item.check3 && item.check4) {
                  // 下限和下下限开关都打开
                  if (item.level4 >= item.level3) {
                    let errorMsg = item.errorMsg
                      ? item.errorMsg +
                        '   &    ' +
                        '下限的报警等级必须小于下下限'
                      : '下限的报警等级必须小于下下限'
                    this.$set(item, 'errorMsg', errorMsg)
                  }
                }
              })
            }
          } else {
            res.push(false)
            return false
          }
        })
        this.$refs['normalValueForm'].validate(valid => {
          if (valid) {
            res.push(true)
          } else {
            res.push(false)
            return false
          }
        })
      }
      this.$refs['noticeForm'].validate(valid => {
        if (valid) {
          res.push(true)
        } else {
          res.push(false)
          return false
        }
      })
      if (!this.basicForm.points.length) {
        this.$message.warning('请至少选择一个报警点位')
        return false
      }
      if (this.contactTableData.some(item => !item.levels.length)) {
        this.$message.warning('请为所有的报警联系人添加接收通知等级')
        return false
      }
      this.$nextTick(() => {
        if (
          res.includes(false) ||
          document.querySelectorAll('.el-alert--error').length
        ) {
          this.$message({
            message: '请确保不存在错误提示后再提交',
            type: 'warning',
            duration: 3000
          })
          return false
        }
        let form = {}
        let basicForm = JSON.parse(JSON.stringify(this.basicForm))
        basicForm.points = basicForm.points.map(item => item.point)
        basicForm.Run = this.$route.query.Run ? 1 : 0
        if (this.currentPointType !== 'state') {
          basicForm.normalSet = this.normalValueForm.normalSet
          basicForm.normalMax = this.normalValueForm.normalMax
          basicForm.normalMin = this.normalValueForm.normalMin
        }
        form.basicForm = basicForm
        if (this.currentPointType === 'state') {
          let stateRegulars = JSON.parse(
            JSON.stringify(this.stateRegularForm.regulars)
          )
          stateRegulars.forEach(item => {
            item.time = [
              this.timeFormat(item.time[0]),
              this.timeFormat(item.time[1])
            ]
          })
          form.stateRegulars = stateRegulars
          form.strategyType = 2 // 模拟量传1 状态的话传 2
        } else {
          let simulateRegulars = JSON.parse(
            JSON.stringify(this.simulateRegularForm.regulars)
          )
          simulateRegulars.forEach(item => {
            item.time = [
              this.timeFormat(item.time[0]),
              this.timeFormat(item.time[1])
            ]
          })
          form.simulateRegulars = simulateRegulars
          form.strategyType = 1 // 模拟量传1 状态的话传 2
        }
        form.noticeForm = { ...this.noticeForm, ...this.alarmUpdateForm }

        let contactTableData = JSON.parse(JSON.stringify(this.contactTableData))
        contactTableData.forEach(item => {
          item.range = [
            this.timeFormat(item.range[0]),
            this.timeFormat(item.range[1])
          ]
        })
        form.concats = contactTableData
        this.submitLoading = true
        if (this.$route.query.id) {
          form.basicForm.ID = this.$route.query.id

          const { fileName, bucketName, objectName } = logSnapShotFactory(
            document.querySelector('.alarm-stragegy-edit')
          )
          form.StorageSpaceExtendList = {
            FileNameList: [fileName],
            BucketName: bucketName,
            ObjectName: objectName
          }
          // 编辑策略
          alarmStrategyUpdate(form)
            .then(res => {
              if (res.data.Code === 200) {
                if (res.data.Data.IsSuccess) {
                  this.$message.success('报警策略编辑成功')
                  this.$router.go(-1)
                } else {
                  this.$message.error('报警策略编辑失败')
                }
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          const { fileName, bucketName, objectName } = logSnapShotFactory(
            document.querySelector('.alarm-stragegy-edit')
          )
          form.StorageSpaceExtendList = {
            FileNameList: [fileName],
            BucketName: bucketName,
            ObjectName: objectName
          }
          // 新增策略
          alarmStrategyAdd(form)
            .then(res => {
              if (res.data.Code === 200) {
                if (res.data.Data.IsSuccess) {
                  this.$message.success('报警策略新增成功')
                  this.$router.go(-1)
                } else {
                  this.$message.error('报警策略新增失败')
                }
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
            })
            .finally(() => {
              this.submitLoading = false
            })
        }
      })
    },
    // 校验模拟量规则时间段是否重合
    changeSimulateTimeRange(index) {
      let otherRanges = this.simulateRegularForm.regulars
        .filter((item, i) => i !== index && item.time)
        .map(item => item.time)
      // 当前的时间段和其它时间段做对比。
      if (
        !this.isOverlay(
          this.simulateRegularForm.regulars[index].time,
          otherRanges
        )
      ) {
        let regular = JSON.parse(
          JSON.stringify(this.simulateRegularForm.regulars[index])
        )
        regular.time = ''
        regular.errorMsg = '当前时间段与其它时间段有重合部分'
        this.$message.warning('当前时间段与其它时间段有重合部分')
        this.$set(this.simulateRegularForm.regulars, index, regular)
      } else {
        let regular = JSON.parse(
          JSON.stringify(this.simulateRegularForm.regulars[index])
        )
        regular.errorMsg = ''
        this.$set(this.simulateRegularForm.regulars, index, regular)
      }
    },
    // 校验状态量规则时间段是否重合
    changeStateTimeRange(index) {
      let otherRanges = this.stateRegularForm.regulars
        .filter((item, i) => i !== index && item.time)
        .map(item => item.time)
      // 当前的时间段和其它时间段做对比。
      if (
        !this.isOverlay(this.stateRegularForm.regulars[index].time, otherRanges)
      ) {
        let regular = JSON.parse(
          JSON.stringify(this.stateRegularForm.regulars[index])
        )
        regular.time = ''
        regular.errorMsg = '当前时间段与其它时间段有重合部分'
        this.$set(this.stateRegularForm.regulars, index, regular)
      } else {
        let regular = JSON.parse(
          JSON.stringify(this.stateRegularForm.regulars[index])
        )
        regular.errorMsg = ''
        this.$set(this.stateRegularForm.regulars, index, regular)
      }
    },
    // 修改报警类型时触发
    changeAlarmType(val, regular, prop) {
      const temp = this.alarmTypeOptions.find(item => item.Id === val)
      if (temp) {
        regular[prop] = temp.Level
      }
    },
    toggleSimulateTriggerCondition(regular) {
      if (
        !(regular.check1 || regular.check2 || regular.check3 || regular.check4)
      ) {
        regular.error = true
        regular.errorMsg = '请至少开启一项触发条件'
      } else {
        regular.errorMsg = ''
      }
      this.$refs.simulateRegularForm.validate()
    },
    toggleStateTriggerCondition(regular) {
      let res = regular.states.map(item => {
        return item.check
      })
      if (!res.includes(true)) {
        // 说明全部关闭了
        regular.errorMsg = '请至少开启一项触发条件'
      } else {
        regular.errorMsg = ''
      }
      this.$refs.stateRegularForm.validate()
    },
    // 选择联系人接收通知的等级
    selectAlarmLevel(row, level) {
      if (row.levels.includes(level)) {
        row.levels = row.levels.filter(item => item !== level)
      } else {
        row.levels.push(level)
      }
    },
    // 获取点位类型
    fetchPointTypeList(project) {
      fetchPointTypeList(project).then(res => {
        const data = res.data.Data
        this.pointTypeList = [
          {
            label: '状态量',
            options: data.State
          },
          {
            label: '模拟量',
            options: data.Analog
          }
        ]
        if (this.basicForm.pointType) {
          // 说明是编辑策略，不是新增
          // 判断当前点位是模拟量还是状态量
          this.pointTypeList[0].options.forEach(item => {
            if (item.ID === this.basicForm.pointType) {
              this.currentPointType = 'state'
              let temp1 = item.Value.split(' | ')
              let temp2 = temp1.map(item => item.split('：'))
              temp2.forEach(item => {
                this.stateRegularForm.stateOptions.push({
                  tag: item[1],
                  value: item[0]
                })
              })
              // eslint-disable-next-line no-unused-vars
              let states = this.stateRegularForm.stateOptions.map(
                (item, index) => ({
                  tag: item.tag,
                  tag_value: item.value,
                  check: index === 0,
                  limitValue: undefined,
                  duration: 5,
                  level: 1,
                  errorMsg: ''
                })
              )
            }
          })
          this.pointTypeList[1].options.forEach(item => {
            if (item.ID === this.basicForm.pointType) {
              this.currentPointType = 'simulate'
            }
          })
        }
      })
    },
    // 清空表单
    clearForm() {
      this.basicForm.points = []
      this.pointSource = []
      this.simulateRegularForm.regulars = []
      this.simulateRegularForm.regulars.push({
        popoverVisible: false,
        time: [
          new Date(2000, 10, 10, 0, 0, 0),
          new Date(2000, 10, 10, 23, 59, 59)
        ],
        noticeCheck: false,
        delayNoticeTime: 0,
        thresholdCheck: false,
        threshold: undefined,
        check1: true,
        limitValue1: undefined,
        duration1: 5,
        level1: 1,
        alarmType1: undefined,
        check2: false,
        limitValue2: undefined,
        duration2: 5,
        level2: 1,
        alarmType2: undefined,
        check3: false,
        limitValue3: undefined,
        duration3: 5,
        level3: 1,
        alarmType3: undefined,
        check4: false,
        limitValue4: undefined,
        duration4: 5,
        level4: 1,
        alarmType4: undefined,
        errorMsg: ''
      })
      this.stateRegularForm.regulars = []
      this.stateRegularForm.stateOptions = []
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
    // 删除联系人
    deleteContact(user) {
      this.contactTableData = this.contactTableData.filter(
        item => item.userId !== user.userId
      )
      this.userList.forEach(item => {
        if (item.userId === user.userId) {
          item.check = false
        }
      })
    },
    fetchPointList() {
      this.pointSource = []
      queryProjectPoint({
        projectID: this.basicForm.project,
        typeID: this.basicForm.pointType,
        systemTypeId: this.basicForm.systemTypeId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.pointSource = res.data.Data
          } else {
            this.pointSource = []
          }
        })
        .catch(err => {
          console.error(err)
          this.pointSource = []
        })
    },
    fetchDeviceTypeOptions(projectId) {
      getModelListByProject({
        projectId: projectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.deviceTypeOptions = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchAlarmTypeOptions(id) {
      getAlarmTypes({
        SystemId: id
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.alarmTypeOptions = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchUserList(strategyID = 0) {
      this.userList = []
      queryProjectConcats({
        strategyID: strategyID,
        project: this.basicForm.project
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.forEach(item => {
              if (!item.levels) {
                item.levels = []
              }
            })
            this.userList = data
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 是否是数字
    isInteger(n) {
      if (n === '') {
        return { res: false, msg: '必填' }
      }
      if (parseFloat(n, 10) != n) {
        return { res: false, msg: '必须是数字' }
      }
      return { res: true }
    },
    getIndex(string) {
      let arr = string.split('.')
      if (arr.length === 3) {
        return arr[1]
      } else {
        return {
          index1: arr[1],
          index2: arr[3]
        }
      }
    },
    smoothScroll(element) {
      document.querySelector(element).scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      })
    },
    // 比较传入的数组是不是由大到小排列，且没有重复项
    compare(arr) {
      if ([...new Set(arr)].length !== arr.length) {
        // 说明有相等的数
        return false
      }
      let temp = arr.slice()
      if (temp.sort((a, b) => b - a).join(',') !== arr.join(',')) {
        // 说明不是由小到大排列
        return false
      }
      return true
    },
    isOverlay(range, ranges) {
      if (!ranges.length) {
        return true
      }
      let res = true
      let r = [
        new Date(range[0]).getHours() * 60 * 60 +
          new Date(range[0]).getMinutes() * 60 +
          new Date(range[0]).getSeconds(),
        new Date(range[1]).getHours() * 60 * 60 +
          new Date(range[1]).getMinutes() * 60 +
          new Date(range[1]).getSeconds()
      ]
      let rs = ranges.map(item => {
        return [
          new Date(item[0]).getHours() * 60 * 60 +
            new Date(item[0]).getMinutes() * 60 +
            new Date(item[0]).getSeconds(),
          new Date(item[1]).getHours() * 60 * 60 +
            new Date(item[1]).getMinutes() * 60 +
            new Date(item[1]).getSeconds()
        ]
      })
      console.log('[2173]-StrategyEdit.vue', r, rs)
      for (let i = 0; i < rs.length; i++) {
        // 比较（a,b）(x,y)两个时间段有没有重合，只要满足（y<a || b<x）
        if (!(rs[i][1] < r[0] || r[1] < rs[i][0])) {
          res = false
          break
        }
      }
      return res
    },
    timeFormat(time) {
      const date = new Date(time)
      let hour = date.getHours()
      let minute = date.getMinutes()
      let second = date.getSeconds()
      return `${hour > 9 ? hour : '0' + hour}:${
        minute > 9 ? minute : '0' + minute
      }:${second > 9 ? second : '0' + second}`
    },
    stringToDate(string) {
      return new Date('2018/8/30 ' + string)
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-stragegy-edit {
  .custom-panel {
    background: rgba(255, 255, 255, 1);
    border-radius: 5px;
    margin-bottom: 22px;
  }
  .custom-panel-header {
    padding: 16px 24px;
    font-size: 16px;
    font-weight: bold;
    color: #3c3c3c;
    border-bottom: 1px solid #dcdfe6;
  }
  .custom-panel-body {
    padding: 24px;
  }
  .box-light {
    position: relative;
    padding: 24px;
    margin: 0 84px;
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
    margin-right: 15px;
    color: #656565;
    margin-top: 10px;
  }
  .attention-text {
    color: #878787;
  }
  .notice-row {
    display: flex;
    align-items: flex-start;
    .el-form-item {
      margin-bottom: 0;
    }
  }
  .regular-row1 {
    display: flex;
    justify-content: space-between;
    width: 970px;
    & > div {
      flex: 1;
      color: #656565;
    }
  }
  .regular-row2 {
    color: #656565;
  }
  .inline-form-item {
    display: inline-block;
  }
  .width85 {
    width: 85px;
  }
  .marginTop10 {
    margin-top: 10px;
  }
  .transfer-wrap {
    display: inline-block;
    width: 1000px;
  }
}
</style>

<style lang="scss">
.alarm-stragegy-edit {
  .el-input__inner {
    font-size: 13px;
  }
  .record-tag {
    background: rgba(236, 254, 245, 1);
    color: #31ba7f;
    border-color: #31ba7f;
  }
  .normal-tag {
    background: rgba(244, 248, 255, 1);
    color: #2b76ff;
    border-color: #2b76ff;
  }
  .important-tag {
    background: rgba(254, 250, 234, 1);
    color: #ff9306;
    border-color: #ff9306;
  }
  .emergency-tag {
    background: rgba(254, 240, 240, 1);
    color: #fe786b;
    border-color: #fe786b;
  }
}
</style>
