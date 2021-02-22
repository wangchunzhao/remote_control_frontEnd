<template>
  <div class="content-box modbus-config">
    <el-row :gutter="30">
      <el-col>
        <div class="tool-btn-wrap">
          <div>
            <el-tooltip
              placement="top"
              effect="light"
              content="在点位列表中添加一行"
            >
              <el-button size="small" @click.native="clickAddRow">
                添加点位
              </el-button>
            </el-tooltip>
            <el-tooltip
              placement="top"
              effect="light"
              style="display: inline-block;"
            >
              <div slot="content" style="text-align: center;font-size: 12px;">
                通过Excel样表<br />编辑点位并上传<br /><a
                  href="javascript:;"
                  style="color: #409EFF;"
                  @click="downloadTemplate"
                  >样式表下载<c-svg name="download"
                /></a>
              </div>
              <el-upload
                action="123"
                :show-file-list="false"
                accept=".xlsx"
                :before-upload="uploadExcel"
              >
                <el-button
                  size="small"
                  style="margin: 0 10px;"
                >
                  导入点位
                </el-button>
              </el-upload>
            </el-tooltip>

            <el-dropdown trigger="click">
              <el-button size="small">
                批量操作<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="batchPaste">
                  批量复制
                </el-dropdown-item>
                <el-dropdown-item @click.native="batchDel">
                  批量删除
                </el-dropdown-item>
                <el-dropdown-item divided @click.native="batchEditAddress">
                  修改从站地址
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-tooltip
              placement="top"
              effect="light"
              content="将点位列表导出成 Excel"
            >
              <el-button style="margin-left: 10px;" size="small" @click.native="exportExcel">
                导出为表格
              </el-button>
            </el-tooltip>
          </div>
          <div>
            <el-tooltip placement="right">
              <div slot="content" class="tooltip-info-wrap">
                <div class="tooltip-title">
                  唯一性：
                </div>
                <p>
                  不可同时存在两个以上具有相同从站地址、点位名称的点位
                </p>
                <div class="tooltip-title">
                  映射：
                </div>
                <p>
                  映射参数由4个数{x1,x2,x3,x4}组成,如: -1000~1000 -> -100 ~ 100
                  表示将原始值缩小10倍
                  <br />
                  计算公式为 [输出值] = (x4-x3)/(x2-x1)*([原始值]-x1)+x3
                </p>
                <div class="tooltip-title">
                  从站地址：
                </div>
                <p>一个 1-255 之间的整数。</p>
                <div class="tooltip-title">
                  寄存器地址：
                </div>
                <p>一个 0-65535 之间的整数。</p>
                <div class="tooltip-title">
                  采样周期：
                </div>
                <p>可选择 10s/30s/60s/120s 或自定义(手动输入60的倍数)。</p>
                <div class="tooltip-title">
                  功能码 / 数据格式 / 字节顺序 / 地址位：
                </div>
                <p>
                  <ul>
                    <li>
                      当功能码为 01读写/02只读时，数据格式只能为
                      bit，字节顺序和地址位只能为 空。
                    </li>
                    <li>
                      当功能码为 03读写/04只读，数据格式为
                      16位有符号数(默认)/16位无符号数时，
                      <br />
                      字节顺序可选 AB(默认)/BA，地址位只能为空。
                    </li>
                    <li>
                      当功能码为 03读写/04只读，数据格式为
                      16位按位读取时，字节顺序可选 AB(默认)/BA，
                      <br />
                      地址位非空，默认 1。
                    </li>
                    <li>
                      当功能码为 03读写/04只读，数据格式为
                      32位有符号数/32位无符号数/32位浮点型数时，
                      <br />
                      字节顺序可选 ABCD(默认)/CDAB/BADC/DCBA，地址位只能为 空。
                    </li>
                  </ul>
                </p>
              </div>
              <c-svg name="what" class-name="icon-what" />
            </el-tooltip>
            <el-tooltip
              placement="top"
              effect="light"
              content="验证点位列表数据的正确性"
            >
              <el-button size="small" @click.native="handleCheckData">
                数据校验
              </el-button>
            </el-tooltip>
            <el-button
              :loading="submitLoading"
              type="primary"
              size="small"
              @click.native="submitSenserData"
            >
              保存配置
            </el-button>
          </div>
        </div>
        <div style="margin-bottom: 15px;" class="clearfix">
          <el-alert
            v-if="isEdit"
            style="width: 600px;float: right;"
            title="检测到你已经更新了配置数据，记得点击『保存配置』以上传配置数据"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
        <el-table
          id="senserTable"
          key="byTemplate"
          ref="custom-table"
          class="gmdialogtable"
          highlight-current-row
          :data="senserTable"
          v-loading="tableLoading"
          style="width: 100%"
          empty-text="暂无配置信息"
          @selection-change="handleSelectionChange"
          @cell-click="handleCellClick"
        >
          <el-table-column fixed type="selection" align="center" width="35" />
          <el-table-column fixed type="index" width="50" />
          <el-table-column fixed label="操作" width="130">
            <template slot-scope="scope">
              <el-button
                type="danger"
                round
                size="mini"
                style="padding: 5px;"
                icon="el-icon-delete"
                @click.native="deleteSenser(scope.$index, scope.row.pointID)"
              />
              <el-button
                v-if="scope.row.pointType !== '2'"
                size="mini"
                style="padding: 5px;"
                round
                @click.native="copyRow(scope.row)"
              >
                <c-svg name="paste" />
              </el-button>
              <el-tooltip class="item" effect="dark" :content="scope.row.editable ? '保存' : '编辑'" placement="top">
                <el-button
                  type="success"
                  round
                  size="mini"
                  style="padding: 5px;"
                  :icon="scope.row.editable ? 'el-icon-check' : 'el-icon-edit'"
                  @click.native="clickEdit(scope.row)"
                />
               </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column fixed label="从站地址" width="70">
            <template slot-scope="scope">
              <el-popover
                :popper-class="
                  scope.row['address'].msg + 'popover-visibility'
                "
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['address'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['address'].msg }"
                >
                  <el-input
                    v-if="scope.row.editable"
                    v-model.trim="scope.row['address'].value"
                    size="mini"
                    placeholder="1-255"
                    @blur="handleBlur($event, scope.row['address'])"
                  />
                  <span v-else>{{ scope.row['address'].value }}</span>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="点位名称" fixed min-width="150">
            <template slot-scope="scope">
              <el-popover
                :popper-class="
                  scope.row['sensorName'].msg + 'popover-visibility'
                "
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['sensorName'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['sensorName'].msg }"
                >
                  <el-input
                    v-if="scope.row.editable"
                    v-model.trim="scope.row['sensorName'].value"
                    size="mini"
                    @blur="handleBlur($event, scope.row['sensorName'])"
                  />
                  <span v-else>{{ scope.row['sensorName'].value }}</span>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="点位类型" width="150">
            <template slot-scope="scope">
              <el-popover
                :popper-class="
                  scope.row['sensorTypeId'].msg + 'popover-visibility'
                "
                placement="top"
                trigger="hover"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['sensorTypeId'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['sensorTypeId'].msg }"
                >
                  <el-select
                    v-if="scope.row.editable"
                    v-model="scope.row['sensorTypeId'].value"
                    filterable
                    placeholder="请选择点位类型"
                    size="small"
                    @change="handleChange(scope.row, 'sensorTypeId')"
                  >
                    <el-option-group
                      v-for="group in pointTypeOptions"
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
                  <div v-else>
                    {{ getPointTypeLabel(scope.row.sensorTypeId.value) }}
                  </div>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="小数位" width="60">
            <template slot-scope="scope">
              <el-popover
                :popper-class="
                  scope.row['decimal'].msg + 'popover-visibility'
                "
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['decimal'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['decimal'].msg }"
                >
                  <el-select
                    v-if="scope.row.editable"
                    v-model="scope.row['decimal'].value"
                    :disabled="scope.row.typeSection === 'state'"
                    size="mini"
                    @change="handleChange(scope.row, 'decimal')"
                  >
                    <el-option label="0" :value="0" />
                    <el-option label="1" :value="1" />
                    <el-option label="2" :value="2" />
                    <el-option label="3" :value="3" />
                    <el-option label="4" :value="4" />
                  </el-select>
                  <span v-else>{{ scope.row['decimal'].value }}</span>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="单位" width="95">
            <template slot-scope="scope">
              <el-popover
                :popper-class="scope.row['unit'].msg + 'popover-visibility'"
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['unit'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['unit'].msg }"
                >
                  <el-select
                    v-if="scope.row.editable"
                    v-model.trim="scope.row['unit'].value"
                    :disabled="scope.row.typeSection === 'state'"
                    class="inline-input"
                    size="mini"
                    placeholder="请选择"
                    @blur="handleBlur($event, scope.row['unit'])"
                  >
                    <el-option
                      v-for="item in scope.row.unitOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                  <span v-else>{{ scope.row['unit'].value }}</span>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="映射" min-width="240">
            <template slot-scope="scope">
              <el-popover
                v-if="scope.row.pointType !== '2'"
                :popper-class="scope.row['field1'].msg + 'popover-visibility'"
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['field1'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['field1'].msg }"
                >
                  <div v-if="scope.row.editable" class="field-wrap">
                    <el-input
                      v-model.trim="scope.row['field1'].value"
                      class="el-input-padding-0"
                      size="mini"
                      placeholder="x1"
                      @blur="handleBlur($event, scope.row['field1'])"
                    />~
                    <el-input
                      v-model.trim="scope.row['field2'].value"
                      class="el-input-padding-0"
                      size="mini"
                      placeholder="x2"
                      @blur="handleBlur($event, scope.row['field1'])"
                    />→
                    <el-input
                      v-model.trim="scope.row['field3'].value"
                      class="el-input-padding-0"
                      size="mini"
                      placeholder="x3"
                      @blur="handleBlur($event, scope.row['field1'])"
                    />~
                    <el-input
                      v-model.trim="scope.row['field4'].value"
                      class="el-input-padding-0"
                      size="mini"
                      placeholder="x4"
                      @blur="handleBlur($event, scope.row['field1'])"
                    />
                    <el-dropdown>
                      <span class="el-dropdown-link">
                        <i class="el-icon-caret-bottom shortcut-field" />
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                          @click.native="
                            shortcutField(scope.row, '', '', '', '')
                          "
                        >
                          无
                        </el-dropdown-item>
                        <el-dropdown-item
                          @click.native="
                            shortcutField(scope.row, -1000, 1000, -100, 100)
                          "
                        >
                          -1000 ~ 1000 → -100 ~ 100
                        </el-dropdown-item>
                        <el-dropdown-item
                          @click.native="
                            shortcutField(
                              scope.row,
                              -10000,
                              10000,
                              -1000,
                              1000
                            )
                          "
                        >
                          -10000 ~ 10000 → -1000 ~ 1000
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                  <span v-else>{{
                    scope.row['field1'].value !== '' &&
                    scope.row['field1'].value !== null
                      ? `${scope.row['field1'].value} ~ ${scope.row['field2'].value} → ${scope.row['field3'].value} ~ ${scope.row['field4'].value}`
                      : ''
                  }}</span>
                </div>
              </el-popover>
              <span v-else>****</span>
            </template>
          </el-table-column>
          <el-table-column label="功能码" width="95">
            <template slot-scope="scope">
              <el-popover
                v-if="scope.row.pointType !== '2'"
                :popper-class="
                  scope.row['funcode'].msg + 'popover-visibility'
                "
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['funcode'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['funcode'].msg }"
                >
                  <el-select
                    v-if="scope.row.editable"
                    v-model="scope.row['funcode'].value"
                    placeholder="请选择"
                    size="mini"
                    @change="handleChange(scope.row, 'funcode')"
                  >
                    <el-option label="01读写" :value="1" />
                    <el-option label="02只读" :value="2" />
                    <el-option label="03读写" :value="3" />
                    <el-option label="04只读" :value="4" />
                  </el-select>
                  <span v-else>{{
                    scope.row.funcode.value === 1
                      ? '01读写'
                      : scope.row.funcode.value === 2
                      ? '02只读'
                      : scope.row.funcode.value === 3
                      ? '03读写'
                      : scope.row.funcode.value === 4
                      ? '04只读'
                      : ''
                  }}</span>
                </div>
              </el-popover>
              <span v-else>****</span>
            </template>
          </el-table-column>
          <el-table-column label="寄存器地址" width="85">
            <template slot-scope="scope">
              <el-popover
                v-if="scope.row.pointType !== '2'"
                :popper-class="scope.row['bias'].msg + 'popover-visibility'"
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['bias'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['bias'].msg }"
                >
                  <el-input
                    v-if="scope.row.editable"
                    v-model.trim="scope.row['bias'].value"
                    size="mini"
                    placeholder="0-65535"
                    @blur="handleBlur($event, scope.row['bias'])"
                  />
                  <span v-else>{{ scope.row['bias'].value }}</span>
                </div>
              </el-popover>
              <span v-else>****</span>
            </template>
          </el-table-column>
          <el-table-column label="数据格式" width="120">
            <template slot-scope="scope">
              <el-popover
                v-if="scope.row.pointType !== '2'"
                :popper-class="
                  scope.row['datatype'].msg + 'popover-visibility'
                "
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['datatype'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['datatype'].msg }"
                >
                  <el-select
                    v-if="scope.row.editable"
                    v-model="scope.row['datatype'].value"
                    placeholder="请选择"
                    size="mini"
                    @change="handleChange(scope.row, 'datatype')"
                  >
                    <el-option label="16位有符号数" :value="1" />
                    <el-option label="16位无符号数" :value="2" />
                    <el-option label="32位有符号数" :value="3" />
                    <el-option label="32位无符号数" :value="4" />
                    <el-option label="32位浮点型数" :value="5" />
                    <el-option label="16位按位读取" :value="6" />
                    <el-option label="bit" :value="7" />
                  </el-select>
                  <span v-else>{{
                    scope.row.datatype.value === 1
                      ? '16位有符号数'
                      : scope.row.datatype.value === 2
                      ? '16位无符号数'
                      : scope.row.datatype.value === 3
                      ? '32位有符号数'
                      : scope.row.datatype.value === 4
                      ? '32位无符号数'
                      : scope.row.datatype.value === 5
                      ? '32位浮点型数'
                      : scope.row.datatype.value === 6
                      ? '16位按位读取'
                      : scope.row.datatype.value === 7
                      ? 'bit'
                      : ''
                  }}</span>
                </div>
              </el-popover>
              <span v-else>****</span>
            </template>
          </el-table-column>
          <el-table-column label="字节顺序" width="80">
            <template slot-scope="scope">
              <el-popover
                v-if="scope.row.pointType !== '2'"
                :popper-class="
                  scope.row['orderStr'].msg + 'popover-visibility'
                "
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['orderStr'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['orderStr'].msg }"
                >
                  <el-select
                    v-if="scope.row.editable"
                    v-model="scope.row['orderStr'].value"
                    placeholder="请选择"
                    size="mini"
                    @change="handleChange(scope.row, 'orderStr')"
                  >
                    <el-option label="空" value="" />
                    <el-option label="ABCD" value="ABCD" />
                    <el-option label="CDAB" value="CDAB" />
                    <el-option label="BADC" value="BADC" />
                    <el-option label="DCBA" value="DCBA" />
                    <el-option label="AB" value="AB" />
                    <el-option label="BA" value="BA" />
                  </el-select>
                  <span v-else>{{ scope.row['orderStr'].value }}</span>
                </div>
              </el-popover>
              <span v-else>****</span>
            </template>
          </el-table-column>
          <el-table-column label="地址位" width="60">
            <template slot-scope="scope">
              <el-popover
                v-if="scope.row.pointType !== '2'"
                :popper-class="scope.row['datas'].msg + 'popover-visibility'"
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['datas'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['datas'].msg }"
                >
                  <el-select
                    v-if="scope.row.editable"
                    v-model="scope.row['datas'].value"
                    placeholder="请选择"
                    size="mini"
                    @change="handleChange(scope.row, 'datas')"
                  >
                    <el-option label="空" value="" />
                    <el-option
                      v-for="item in 16"
                      :key="item"
                      :label="item"
                      :value="item.toString()"
                    />
                  </el-select>
                  <span v-else>{{ scope.row['datas'].value }}</span>
                </div>
              </el-popover>
              <span v-else>****</span>
            </template>
          </el-table-column>
          <el-table-column label="采集周期/s" fixed="right" width="85">
            <template slot-scope="scope">
              <el-popover
                :popper-class="scope.row['cycle'].msg + 'popover-visibility'"
                trigger="hover"
                placement="top"
              >
                <div>
                  <span class="error-type">错误原因： </span>
                  {{ scope.row['cycle'].msg }}
                </div>
                <div
                  slot="reference"
                  :class="{ error: scope.row['cycle'].msg }"
                >
                  <el-autocomplete
                    v-if="scope.row.editable"
                    v-model.trim="scope.row['cycle'].value"
                    size="mini"
                    :fetch-suggestions="
                      (queryString, cb) => {
                        cb([
                          { value: '10' },
                          { value: '30' },
                          { value: '60' },
                          { value: '120' }
                        ])
                      }
                    "
                    placeholder="可输入"
                    @blur="handleBlur($event, scope.row['cycle'])"
                  />
                  <span v-else>{{ scope.row['cycle'].value }}</span>
                </div>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>

        <!-- 这个表不显示，只是为了给用下下载Excel提供数据源 -->
        <table id="excel-table" style="display:none">
          <tr>
            <th>点位名称</th>
            <th>点位类型</th>
            <th>小数位</th>
            <th>单位</th>
            <th>映射</th>
            <th>从站地址</th>
            <th>功能码</th>
            <th>寄存器地址</th>
            <th>数据格式</th>
            <th>字节顺序</th>
            <th>地址位</th>
            <th>采集周期/s</th>
          </tr>
          <tr v-for="(item, index) in senserData" :key="index">
            <td>{{ item.sensorName.value }}</td>
            <td>{{ getPointTypeLabel(item.sensorTypeId.value) }}</td>
            <td>{{ item.decimal.value }}</td>
            <td>{{ item.unit.value }}</td>
            <td>
              <span v-if="item.pointType === '2'">
                ***
              </span>
              <span v-else>
                {{
                  item.field1.value !== ''
                    ? `${item.field1.value}/${item.field2.value}/${item.field3.value}/${item.field4.value}`
                    : ''
                }}
              </span>

            </td>
            <td>{{ item.address.value }}</td>
            <td>
              <span v-if="item.pointType === '2'">
                ***
              </span>
              <span v-else>
                {{
                  item.funcode.value === 1
                    ? '01读写'
                    : item.funcode.value === 2
                    ? '02只读'
                    : item.funcode.value === 3
                    ? '03读写'
                    : item.funcode.value === 4
                    ? '04只读'
                    : ''
                }}
              </span>
            </td>
            <td>
              <span v-if="item.pointType === '2'">
                ***
              </span>
              <span v-else>
                {{ item.bias.value }}
              </span>
            <td>
              <span v-if="item.pointType === '2'">
                ***
              </span>
              <span v-else>
                {{
                  item.datatype.value === 1
                    ? '16位有符号数'
                    : item.datatype.value === 2
                    ? '16位无符号数'
                    : item.datatype.value === 3
                    ? '32位有符号数'
                    : item.datatype.value === 4
                    ? '32位无符号数'
                    : item.datatype.value === 5
                    ? '32位浮点型数'
                    : item.datatype.value === 6
                    ? '16位按位读取'
                    : item.datatype.value === 7
                    ? 'bit'
                    : ''
                }}
              </span>
            </td>
            <td>
              <span v-if="item.pointType === '2'">
                ***
              </span>
              <span v-else>
                {{ item.orderStr.value }}
              </span>
            </td>
            <td>
              <span v-if="item.pointType === '2'">
                ***
              </span>
              <span v-else>
                {{ item.datas.value }}
              </span>
            </td>
            <td>{{ item.cycle.value }}</td>
          </tr>
        </table>
      </el-col>
    </el-row>
    <div style="text-align: center;margin-top: 25px;">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        :current-page.sync="pagination.currentPage"
        @size-change="handleSenserSizeChange"
        @current-change="handleSenserCurrentChange"
      />
    </div>
    <BatchEditAddressDialog @change="() => isEdit = true" :list="multipleSelection" ref="batchEditAddressDialog" />
  </div>
</template>

<script>
import { fetchPointTypeList } from '@/api/pointType'
import { getDeviceConfig, updateDevicesNEWModbus } from '@/api/device_new'
import BatchEditAddressDialog from './component/DialogBatchEditAddress'
import {
  dataTransform,
  addRow,
  checkData,
  copy,
  batchCopy
} from '@/utils/sensor'
import FileSaver from 'file-saver'
import { storageName } from '@/utils/index'
import { Encrypt } from '@/utils/secret'

export default {
  props: {
    gatewayInfo: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  components: {
    BatchEditAddressDialog,
  },
  data() {
    return {
      isEdit: false,
      filterText: '',
      senserData: [], // 所有的点位
      senserTable: [], // 一页的点位
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20
      },
      tableLoading: false,
      submitLoading: false,
      multipleSelection: [],
      pointTypeOptions: [],
      deleteSenserIds: []
    }
  },
  watch: {
    gatewayInfo: {
      handler: function(val) {
        if (val.id) {
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    async init() {
      await fetchPointTypeList(this.gatewayInfo.ProjectID)
        .then(res => {
          const data = res.data.Data
          this.pointTypeOptions = [
            {
              label: '状态量',
              options: data.State
            },
            {
              label: '模拟量',
              options: data.Analog
            }
          ]
        })
        .catch(err => {
          console.error(err)
          this.$message.error('服务器错误')
        })
      this.fetchTableData()
    },
    // 通过checkbox选择表格中的行时触发
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 下载模版
    downloadTemplate() {
      window.location.href =
        'https://cdn.sinocold.net/excel_template/%E7%BD%91%E5%85%B3%E6%A8%A1%E6%9D%BF_v2.xlsx'
    },
    // 进入和退出编辑
    clickEdit(row) {
      row.editable = !row.editable
      if (!row.editable) {
        checkData([row])
        this.isEdit = true
      }
    },
    // 上传 excel 文件
    uploadExcel(file) {
      var reader = new FileReader()
      reader.onload = e => {
        /* read workbook */
        var bstr = e.target.result
        var wb = XLSX.read(bstr, {
          type: 'binary'
        })
        this.senserData.unshift(
          ...dataTransform(
            this.toJson(wb).Sheet1,
            'fromExcel',
            this.pointTypeOptions
          )
        )
        let result = checkData(this.senserData, this.pagination.pageSize)
        this.pagination.currentPage = 1
        this.handleSenserCurrentChange(1)
        if (result.errPages.length) {
          this.$notify({
            title: '警告',
            message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
            type: 'warning',
            duration: 10000
          })
        }
        this.isEdit = true
      }
      reader.readAsBinaryString(file)
      return false
    },
    // 复制
    copyRow(currentRow) {
      this.isEdit = true
      copy(this.senserData, JSON.parse(JSON.stringify(currentRow)))
      this.pagination.currentPage = 1
      this.handleSenserCurrentChange(1)
      this.$message.success('已成功复制指定行至列表头部')
    },
    // 添加一行
    clickAddRow() {
      this.isEdit = true
      addRow(this.senserData)
      this.pagination.currentPage = 1
      this.handleSenserCurrentChange(1)
    },
    // 删除行 （点位列表）
    deleteSenser(index, id) {
      this.$confirm('确认要删除该点位？', '提示', { type: 'warning' }).then(
        () => {
          this.isEdit = true
          this.senserData.splice(
            (this.pagination.currentPage - 1) * 20 + index,
            1
          )
          this.handleSenserCurrentChange(this.pagination.currentPage)
          // 如果 id 存在的话（说明该数据已经存在于数据库）
          if (id) {
            this.deleteSenserIds.push(id)
          }
        }
      )
    },
    // 批量复制
    batchPaste() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一行')
        return false
      }
      this.isEdit = true
      batchCopy(
        this.senserData,
        JSON.parse(JSON.stringify(this.multipleSelection))
      )
      this.pagination.currentPage = 1
      this.handleSenserCurrentChange(1)
      this.$refs['custom-table'].clearSelection()
      this.$message.success('已成功复制指定行至列表头部')
    },
    // 批量删除
    batchDel() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一行')
        return false
      }
      let exitSenserCount = 0 // 已经存在于数据库的点位数量的
      let selectExitSenserCount = 0 // 当前选中的已经存在于数据库的点位数量的
      this.senserData.forEach(item => {
        item.pointID && (exitSenserCount = exitSenserCount + 1)
      })
      this.multipleSelection.forEach(item => {
        item.pointID && (selectExitSenserCount = selectExitSenserCount + 1)
      })
      this.$confirm('确认要删除这些监测点位？', '提示', {
        type: 'warning'
      }).then(() => {
        this.isEdit = true
        let selection = this.multipleSelection.map(item => item.flag)
        this.multipleSelection.forEach(item => {
          if (item.pointID) {
            this.deleteSenserIds.push(item.pointID)
          }
        })
        this.senserData = this.senserData.filter(item => {
          return !(selection.indexOf(item.flag) > -1)
        })
        this.handleSenserCurrentChange(this.pagination.currentPage)
      })
    },
    // 点击批量修改从站地址
    batchEditAddress() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一行')
        return false
      }
      this.$refs.batchEditAddressDialog.openDialog()
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
      return false
    },
    // 点击后添加默认的映射
    shortcutField(row, field1, field2, field3, field4) {
      row.field1 = {
        value: field1,
        msg: ''
      }
      row.field2 = {
        value: field2,
        msg: ''
      }
      row.field3 = {
        value: field3,
        msg: ''
      }
      row.field4 = {
        value: field4,
        msg: ''
      }
    },
    // 编辑模式下输入框失去焦点后触发
    handleBlur(e, obj) {
      // 修改后将错误信息删除，默认用户已经修改正确
      obj.msg = ''
    },
    // 点击按钮后校验数据
    handleCheckData() {
      let result
      result = checkData(this.senserData, this.pagination.pageSize)
      if (result.errPages.length) {
        this.$notify({
          title: '警告',
          message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
          type: 'warning',
          duration: 10000
        })
        return false
      } else {
         this.$message.success('点位数据无冲突')
      }
    },
    // 点位分页
    handleSenserSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.handleSenserCurrentChange(1)
    },
    // 点位分页
    handleSenserCurrentChange(pageIndex) {
      this.pagination.total = this.senserData.length
      this.senserTable = this.senserData.slice(
        (pageIndex - 1) * this.pagination.pageSize,
        (pageIndex - 1) * this.pagination.pageSize +
          this.pagination.pageSize
      )
    },
    // 提交网关数据
    submitSenserData() {
      const result = checkData(this.senserData, this.pagination.pageSize)
      if (result.errPages.length) {
        this.$notify({
          title: '警告',
          message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
          type: 'warning',
          duration: 10000
        })
        return false
      }
      try {
        let pointList = []
        for (let i = 0; i < this.senserData.length; i++) {
          const item = this.senserData[i]
          let temp = {}
          if (item.field1.value === '') {
            // 如果没有填写了映射
            temp.field1 = ''
            temp.field2 = ''
            temp.field3 = ''
            temp.field4 = ''
          } else {
            temp.field1 = item.field1.value
            temp.field2 = item.field2.value
            temp.field3 = item.field3.value
            temp.field4 = item.field4.value
          }

          temp.Decimal = item.decimal.value || 0
          temp.sensorName = item.sensorName.value
          temp.sensorTypeId = item.sensorTypeId.value
          temp.unit = item.unit.value
          temp.address = item.address.value
          temp.bias = item.bias.value
          temp.funcode = item.funcode.value
          temp.datatype = item.datatype.value
          temp.datas = item.datas.value || undefined
          temp.orderStr = item.orderStr.value
          temp.cycle = item.cycle.value

          temp.lastUpdateDate = ''
          temp.sensorId = item.pointID
            ? item.pointID
            : 0
          if (temp.sensorId) {
            temp.lastUpdateDate = this._dateFormat(
              new Date(),
              'YYYY-MM-DD HH:mm'
            )
          } else {
            temp.createDate = temp.lastUpdateDate = this._dateFormat(
              new Date(),
              'YYYY-MM-DD HH:mm'
            )
          }
          temp.modbusId = item.modbusId
            ? item.modbusId
            : ''

            // pointType === '2' 不可编辑和查看映射、功能码、寄存器地址、数据格式、字节顺序、地址位 ， pointType === '1' 正好相反
          if (
            item.pointType !== '1' &&
            item.pointType !== '2'
          ) {
            // 说明这个点位是刚刚通过点击添加点位按钮添加的。因为已经存在的点位，pointType有值
            item.pointType = '1'
          }
          temp.pointType = item.pointType
          temp.iswrite = '0'
          temp.iocUrl = ''
          temp.isLine = '0'
          temp.isOpen = '0'
          temp.tag = ''
          temp.switcher = ''
          temp.symbol = ''
          pointList.push(temp)
        }
        // let data = {}
        // data.sensorItem = pointList
        // data.deviceNoOld = this.gatewayInfo.DESCRIBES
        // data.userId = '40'
        // data.defaultTime = '120'
        // data.agreement = 'modbus'
        // data.faultDelay = ''
        // data.isShare = '0'
        // data.userKey = '7a29438732d24d259712c231eb4d63a0'
        // data.uid = JSON.parse(sessionStorage.getItem(storageName('userInfo'))).uid
        // data.linktype = 'modbus'
        // data.deviceName = this.gatewayInfo.NAME
        // data.remark = this.gatewayInfo.DESCRIBES
        // data.pid = this.gatewayInfo.ProjectID
        // data.deviceId = this.gatewayInfo.id

        this.submitLoading = true
        const { DeviceId, DESCRIBES, DeviceName } = this.gatewayInfo
        updateDevicesNEWModbus({
          DeviceModuleAndAddressList: [],
          DeletePointIdList: this.deleteSenserIds,
          CustomPointIdList: pointList,
          // 添加或者修改类型 0:自定义点位添加 1:模块添加
          AddOrUpdateModbusDeviceType: 0,
          deviceId: DeviceId,
          remark: DESCRIBES,
          deviceName: DeviceName
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.$message.success('网关配置修改成功')
              this.isEdit = false
              this.fetchTableData()
              this.$emit('change')
            } else {
              this.$message.error('网关配置失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('网关配置失败')
          })
          .finally(() => {
            this.submitLoading = false
          })
      } catch (error) {
        console.error(error)
      }
    },
    // 将表格内容导出成 excel
    exportExcel() {
      const result = checkData(this.senserData, this.pagination.pageSize)
      if (result.errPages.length) {
        this.$notify({
          title: '警告',
          message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
          type: 'warning',
          duration: 10000
        })
        return false
      }
      setTimeout(() => {
        let wb = XLSX.utils.table_to_book(
          document.querySelector('#excel-table')
        )
        /* get binary string as output */
        var wbout = XLSX.write(wb, {
          bookType: 'xlsx',
          type: 'binary'
        })
        /* force a download */
        FileSaver.saveAs(
          new Blob([this.s2ab(wbout)], {
            type: 'application/octet-stream'
          }),
          'File.xlsx'
        )
      }, 0)
    },
    // 编辑模式下选择器选择后触发
    handleChange(row, prop) {
      // 修改后将错误信息删除，默认用户已经修改正确
      row[prop].msg = ''
      if (prop === 'sensorTypeId') {
        row.decimal.msg = ''
        row.unit.msg = ''
        row.unit.value = ''
        // 判断当前点位是模拟量还是状态量,如果是模拟量的话，获取单位列表
        this.pointTypeOptions[0].options.forEach(item => {
          if (item.ID === row.sensorTypeId.value) {
            row.typeSection = 'state'
            row.decimal.value = ''
          }
        })
        this.pointTypeOptions[1].options.forEach(item => {
          if (item.ID === row.sensorTypeId.value) {
            row.typeSection = 'simulate'
            row.decimal.value = 0
            // 获取单位列表
            let unitOptions = []
            item.Value && (unitOptions = item.Value.split('|'))
            row.unitOptions = unitOptions.map(v => v.trim())
          }
        })
        return false
      }
      if (prop === 'funcode') {
        // 当功能码为：01/02 数据格式只能为bit 不可更改 字节顺序为空 不可更改 地址位为空 不可更改
        if (row.funcode.value === 1 || row.funcode.value === 2) {
          row.datatype.value = 7
          row.datatype.msg = ''
          row.orderStr.value = ''
          row.orderStr.msg = ''
          row.datas.value = ''
          row.datas.msg = ''
        }
      }
      if (prop === 'datatype' && row.datas.msg !== '') {
        if (row.datatype.value === 6 && row.datas.value) {
          row.datas.msg = ''
        }
        if (row.datatype.value !== 6 && !row.datas.value) {
          row.datas.msg = ''
        }
        return false
      }
      if (prop === 'datatype') {
        if (
          row.datatype.value === 1 ||
          row.datatype.value === 2 ||
          row.datatype.value === 6
        ) {
          row.orderStr = {
            value: 'AB',
            msg: ''
          }
        } else if (row.datatype.value === 7) {
          row.orderStr = {
            value: '',
            msg: ''
          }
        } else {
          row.orderStr = {
            value: 'ABCD',
            msg: ''
          }
        }
      }
    },
    fetchTableData() {
      this.tableLoading = true
      getDeviceConfig({
        deviceID: this.gatewayInfo.id
      })
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            this.senserData = dataTransform(
              data.point_list,
              'fromServer',
              this.pointTypeOptions
            )
            this.pagination.total = this.senserData.length
            this.senserTable = this.senserData.slice(
              0,
              this.pagination.pageSize
            )
          } else {
            this.$message.error('配置获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('配置获取失败')
        }).finally(() => {
          this.tableLoading = false
        })
    },
    // 获取点位类型的文字描述
    getPointTypeLabel(id) {
      let label = ''
      this.pointTypeOptions[0].options.forEach(item => {
        if (item.ID === id) {
          label = item.TypeName
        }
      })
      this.pointTypeOptions[1].options.forEach(item => {
        if (item.ID === id) {
          label = item.TypeName
        }
      })
      return label
    },
    toJson(workBook) {
      let result = []
      workBook.SheetNames.forEach(sheetName => {
        let roa = XLSX.utils.sheet_to_row_object_array(
          workBook.Sheets[sheetName]
        )
        if (roa.length > 0) {
          result[sheetName] = roa
        }
      })
      return result
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
    }
  }
}
</script>

<style lang="scss">
.modbus-config {
  .error {
    width: 100%;
    height: 25px;
  }
  .error:after {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: red;
    border-radius: 50%;
    position: absolute;
    right: 17px;
    top: 50%;
    transform: translateY(-50%);
    animation: shine 2s linear infinite;
  }
  .field-wrap {
    display: flex;
    align-items: center;
    .el-dropdown {
      font-size: 10px;
    }
  }
  .shortcut-field {
    padding: 5px;
    color: #409EFF;
    cursor: pointer;
  }
  .el-table .cell {
    height: 36px;
    line-height: 36px;
  }
  .gmdialogtable {
    input {
      padding: 5px;
    }
    .el-input__inner {
      height: 25px !important;
      line-height: 25px;
    }
    div.cell {
      padding-left: 6px;
      padding-right: 6px;
    }
  }
  .cell-input {
    display: none;
    input {
      padding-left: 7px;
      appearance: none;
      background-color: #fff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #bfcbd9;
      box-sizing: border-box;
      color: #1f2d3d;
      font-size: inherit;
      line-height: 1;
      outline: none;
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      width: 100%;
      height: 22px;
      &:focus {
        outline: none;
        border-color: #20a0ff;
      }
    }
  }
  #senserTable .el-select input {
    height: 25px;
  }
  #senserTable .cell * {
    outline: none;
  }
  .tool-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  }
}
.error-type {
  font-weight: 600;
}
.popover-visibility {
  visibility: hidden;
}
.el-input-padding-0 {
  input {
    padding: 0 2px;
  }
}
.icon-what {
  transform: translateY(6px);
  margin-right: 10px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  &:hover {
    color: #409EFF;
  }
}
.tooltip-info-wrap {
  line-height: 1.9;
  .tooltip-title {
    border-bottom: 1px dotted #c4c5c5;
    margin: 10px 0;
  }
  p {
    padding-left: 10px;
  }
}
</style>
