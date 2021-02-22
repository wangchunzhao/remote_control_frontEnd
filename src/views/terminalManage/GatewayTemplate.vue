<template>
  <div class="gatewayManager page-backgroundConfig">
    <div label="网关模板" name="second" class="templateList content-box">
      <div style="margin-bottom: 18px;">
        <el-button type="primary" size="small" @click.native="openDialog('addTemplate')">
          <c-svg name="plus" />
          添加模板
        </el-button>
      </div>
      <el-table :data="templateTable" style="width: 100%">
        <el-table-column sortable prop="name" label="模板名称" />
        <el-table-column prop="desc" label="来源" />
        <el-table-column sortable prop="CREATETIME" label="创建日期" />
        <el-table-column sortable prop="num" label="点位数量" />
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click.native="watchTemplate(scope.row.id, scope.row.TYPE)">
              查看
            </el-button>
            <el-button v-if="scope.row.TYPE === 1" type="text" @click.native="openDialog('configTemplate', scope.row.id)">
              编辑
            </el-button>
            <el-button v-if="scope.row.TYPE === 1" type="text" @click.native="clickShareBtn(scope.row.id)">
              分享
            </el-button>
            <el-button v-if="scope.row.TYPE === 1" type="text" class="btn-danger" @click.native="delTemplate(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 编辑已经存在的网关||添加点位模板通用弹窗 -->
    <el-dialog v-loading="senserLoading" element-loading-text="加载中..." :title="operationType === 'configSenser' ? '编辑网关' : '点位模板'" :visible.sync="configDialogVisible" width="99%" top="1vh" :custom-class="currentGateway.dType === 1 ? 'senser-template' : ''" @close="dialogClose">
      <el-row :gutter="30">
        <div v-if="operationType !== 'configSenser'" style="text-align: center;">
          <span>模板名称：&nbsp;&nbsp;</span>
          <el-input v-model.trim="currentTemplate.name" placeholder="请输入模板名称" style="width: 200px;" />
        </div>
        <el-col>
          <div class="table-head">
            <span class="title" :style="{paddingBottom: !currentGateway.editable ? '20px' : ''}">
              点位列表
              <el-tooltip placement="right">
                <div slot="content" class="tooltip-info-wrap">
                  <div class="tooltip-title">
                    唯一性：
                  </div>
                  <p>
                    不可同时存在两个以上具有相同从站地址、功能码、寄存器地址、地址位的传感器
                  </p>
                  <div class="tooltip-title">
                    映射：
                  </div>
                  <p>
                    映射参数由4个数{x1,x2,x3,x4}组成,如: -1000~1000 -> -100 ~ 100 表示将原始值缩小10倍
                    <br>
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
                        当功能码为 01读写/02只读时，数据格式只能为 bit，字节顺序和地址位只能为 空。
                      </li>
                      <li>
                        当功能码为 03读写/04只读，数据格式为 16位有符号数(默认)/16位无符号数时，
                        <br>
                        字节顺序可选 AB(默认)/BA，地址位只能为空。
                      </li>
                      <li>
                        当功能码为 03读写/04只读，数据格式为 16位按位读取时，字节顺序可选 AB(默认)/BA，
                        <br>
                        地址位非空，默认 1。
                      </li>
                      <li>
                        当功能码为 03读写/04只读，数据格式为 32位有符号数/32位无符号数/32位浮点型数时，
                        <br>
                        字节顺序可选 ABCD(默认)/CDAB/BADC/DCBA，地址位只能为 空。
                      </li>
                    </ul>
                  </p>
                </div>
                <c-svg name="what" class-name="icon-what" />
              </el-tooltip>
            </span>
            <div v-if="currentGateway.editable">
              <el-tooltip placement="top" effect="light" content="在点位列表中添加一行">
                <el-button size="small" @click.native="clickAddRow">
                  添加点位
                </el-button>
              </el-tooltip>
              <el-tooltip placement="top" effect="light">
                <div slot="content" style="text-align: center;font-size: 12px;">
                  通过Excel样表<br>编辑点位并上传<br><a href="javascript:;" style="color: #409EFF;" @click="downloadTemplate">样式表下载<c-svg name="download" /></a>
                </div>
                <el-button v-if="currentGateway.dType !== 1" class="file-btn" size="small">
                  上传Excel
                  <input v-if="configDialogVisible" id="fileInput" type="file" multiple="false" accept=".xlsx" @change="uploadExcel($event)">
                </el-button>
              </el-tooltip>
              <el-tooltip v-if="currentGateway.dType !== 1" placement="top" effect="light" content="将点位列表导出成 Excel">
                <el-button size="small" @click.native="exportExcel">
                  导出Excel
                </el-button>
              </el-tooltip>
              <el-tooltip placement="top" effect="light" content="验证点位列表数据的正确性">
                <el-button size="small" @click.native="handleCheckData">
                  数据校验
                </el-button>
              </el-tooltip>
              <el-dropdown trigger="click" style="margin-left: 10px;">
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
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <el-table id="senserTable" key="byTemplate" ref="custom-table" class="gmdialogtable" highlight-current-row :data="senserTable" style="width: 100%" empty-text="暂无配置信息" @selection-change="handleSelectionChange" @cell-click="handleCellClick">
            <el-table-column fixed type="selection" align="center" width="35" />
            <el-table-column v-if="currentGateway.editable" fixed type="index" width="50" />
            <el-table-column v-if="currentGateway.editable" fixed label="操作" width="130">
              <template slot-scope="scope">
                <el-button type="danger" round size="mini" style="padding: 5px;" icon="el-icon-delete" @click.native="deleteSenser(scope.$index, scope.row.pointID)" />
                <el-button v-if="scope.row.pointType !== '2'" size="mini" style="padding: 5px;" round @click.native="copyRow(scope.row)">
                  <c-svg name="paste" />
                </el-button>
                <el-button type="success" round size="mini" style="padding: 5px;" :icon="scope.row.editable ? 'el-icon-check' : 'el-icon-edit'" @click.native="clickEdit(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="传感器名称" fixed min-width="150">
              <template slot-scope="scope">
                <el-popover :popper-class="scope.row['sensorName'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['sensorName'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['sensorName'].msg}">
                    <el-input v-if="scope.row.editable" v-model.trim="scope.row['sensorName'].value" size="mini" @blur="handleBlur($event, scope.row['sensorName'])" />
                    <span v-else>{{ scope.row['sensorName'].value }}</span>
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="点位类型" width="150">
              <template slot-scope="scope">
                <el-popover :popper-class="scope.row['sensorTypeId'].msg+'popover-visibility'" placement="top" trigger="hover">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['sensorTypeId'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['sensorTypeId'].msg}">
                    <!-- <el-select v-if="scope.row.editable" @change="handleChange(scope.row, 'sensorTypeId')" v-model="scope.row['sensorTypeId'].value" placeholder="请选择" size="mini">
                                            <el-option label="开关型" :value="2"></el-option>
                                            <el-option label="数值型" :value="1"></el-option>
                                        </el-select> -->

                    <!-- @change="changePointType(scope.row)" -->
                    <el-select v-if="scope.row.editable" v-model="scope.row['sensorTypeId'].value" filterable placeholder="请选择点位类型" size="small" @change="handleChange(scope.row, 'sensorTypeId')">
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
                          <span style="float: left;margin-right: 25px;">{{ item.TypeName }}</span>
                          <span v-if="group.label === '状态量'" style="float: right; color: #8492a6; font-size: 13px">{{ item.Value }}</span>
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
                <el-popover :popper-class="scope.row['decimal'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['decimal'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['decimal'].msg}">
                    <el-select v-if="scope.row.editable" v-model="scope.row['decimal'].value" :disabled="scope.row.typeSection === 'state'" size="mini" @change="handleChange(scope.row, 'decimal')">
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
                <el-popover :popper-class="scope.row['unit'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['unit'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['unit'].msg}">
                    <!-- <el-autocomplete v-if="scope.row.editable" size="mini" class="inline-input" v-model.trim="scope.row['unit'].value" :fetch-suggestions="unitQuerySearch" placeholder="可输入" @blur="handleBlur($event, scope.row['unit'])"></el-autocomplete>
                                        <span v-else>{{scope.row['unit'].value}}</span> -->
                    <el-select v-if="scope.row.editable" v-model.trim="scope.row['unit'].value" :disabled="scope.row.typeSection === 'state'" class="inline-input" size="mini" placeholder="请选择" @blur="handleBlur($event, scope.row['unit'])">
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
                <el-popover v-if="scope.row.pointType !== '2'" :popper-class="scope.row['field1'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['field1'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['field1'].msg}">
                    <div v-if="scope.row.editable" class="field-wrap">
                      <el-input v-model.trim="scope.row['field1'].value" class="el-input-padding-0" size="mini" placeholder="x1" @blur="handleBlur($event, scope.row['field1'])" />~
                      <el-input v-model.trim="scope.row['field2'].value" class="el-input-padding-0" size="mini" placeholder="x2" @blur="handleBlur($event, scope.row['field1'])" />→
                      <el-input v-model.trim="scope.row['field3'].value" class="el-input-padding-0" size="mini" placeholder="x3" @blur="handleBlur($event, scope.row['field1'])" />~
                      <el-input v-model.trim="scope.row['field4'].value" class="el-input-padding-0" size="mini" placeholder="x4" @blur="handleBlur($event, scope.row['field1'])" />
                      <el-dropdown>
                        <span class="el-dropdown-link">
                          <i class="el-icon-caret-bottom shortcut-field" />
                        </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item @click.native="shortcutField(scope.row, '', '', '', '')">
                            无
                          </el-dropdown-item>
                          <el-dropdown-item @click.native="shortcutField(scope.row, -1000, 1000, -100, 100)">
                            -1000 ~ 1000 → -100 ~ 100
                          </el-dropdown-item>
                          <el-dropdown-item @click.native="shortcutField(scope.row, -10000, 10000, -1000, 1000)">
                            -10000 ~ 10000 → -1000 ~ 1000
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                    <span v-else>{{ scope.row['field1'].value !== '' && scope.row['field1'].value !== null ? `${scope.row['field1'].value} ~ ${scope.row['field2'].value} → ${scope.row['field3'].value} ~ ${scope.row['field4'].value}` : '' }}</span>
                  </div>
                </el-popover>
                <span v-else>****</span>
              </template>
            </el-table-column>
            <el-table-column label="从站地址" width="70">
              <template slot-scope="scope">
                <el-popover v-if="scope.row.pointType !== '2'" :popper-class="scope.row['address'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['address'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['address'].msg}">
                    <el-input v-if="scope.row.editable" v-model.trim="scope.row['address'].value" size="mini" placeholder="1-255" @blur="handleBlur($event, scope.row['address'])" />
                    <span v-else>{{ scope.row['address'].value }}</span>
                  </div>
                </el-popover>
                <span v-else>****</span>
              </template>
            </el-table-column>
            <el-table-column label="功能码" width="95">
              <template slot-scope="scope">
                <el-popover v-if="scope.row.pointType !== '2'" :popper-class="scope.row['funcode'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['funcode'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['funcode'].msg}">
                    <el-select v-if="scope.row.editable" v-model="scope.row['funcode'].value" placeholder="请选择" size="mini" @change="handleChange(scope.row, 'funcode')">
                      <el-option label="01读写" :value="1" />
                      <el-option label="02只读" :value="2" />
                      <el-option label="03读写" :value="3" />
                      <el-option label="04只读" :value="4" />
                    </el-select>
                    <span v-else>{{ scope.row.funcode.value===1?'01读写':scope.row.funcode.value===2?'02只读':scope.row.funcode.value===3?'03读写':scope.row.funcode.value===4?'04只读':'' }}</span>
                  </div>
                </el-popover>
                <span v-else>****</span>
              </template>
            </el-table-column>
            <el-table-column label="寄存器地址" width="85">
              <template slot-scope="scope">
                <el-popover v-if="scope.row.pointType !== '2'" :popper-class="scope.row['bias'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['bias'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['bias'].msg}">
                    <el-input v-if="scope.row.editable" v-model.trim="scope.row['bias'].value" size="mini" placeholder="0-65535" @blur="handleBlur($event, scope.row['bias'])" />
                    <span v-else>{{ scope.row['bias'].value }}</span>
                  </div>
                </el-popover>
                <span v-else>****</span>
              </template>
            </el-table-column>
            <el-table-column label="数据格式" width="120">
              <template slot-scope="scope">
                <el-popover v-if="scope.row.pointType !== '2'" :popper-class="scope.row['datatype'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['datatype'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['datatype'].msg}">
                    <el-select v-if="scope.row.editable" v-model="scope.row['datatype'].value" placeholder="请选择" size="mini" @change="handleChange(scope.row, 'datatype')">
                      <el-option label="16位有符号数" :value="1" />
                      <el-option label="16位无符号数" :value="2" />
                      <el-option label="32位有符号数" :value="3" />
                      <el-option label="32位无符号数" :value="4" />
                      <el-option label="32位浮点型数" :value="5" />
                      <el-option label="16位按位读取" :value="6" />
                      <el-option label="bit" :value="7" />
                    </el-select>
                    <span v-else>{{ scope.row.datatype.value===1?'16位有符号数':scope.row.datatype.value===2?'16位无符号数':scope.row.datatype.value===3?
                      '32位有符号数':scope.row.datatype.value===4?'32位无符号数':scope.row.datatype.value===5?'32位浮点型数'
                        :scope.row.datatype.value===6?'16位按位读取':scope.row.datatype.value===7?'bit':'' }}</span>
                  </div>
                </el-popover>
                <span v-else>****</span>
              </template>
            </el-table-column>
            <el-table-column label="字节顺序" width="80">
              <template slot-scope="scope">
                <el-popover v-if="scope.row.pointType !== '2'" :popper-class="scope.row['orderStr'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['orderStr'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['orderStr'].msg}">
                    <el-select v-if="scope.row.editable" v-model="scope.row['orderStr'].value" placeholder="请选择" size="mini" @change="handleChange(scope.row, 'orderStr')">
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
                <el-popover v-if="scope.row.pointType !== '2'" :popper-class="scope.row['datas'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['datas'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['datas'].msg}">
                    <el-select v-if="scope.row.editable" v-model="scope.row['datas'].value" placeholder="请选择" size="mini" @change="handleChange(scope.row, 'datas')">
                      <el-option label="空" value="" />
                      <el-option v-for="item in 16" :key="item" :label="item" :value="item.toString()" />
                    </el-select>
                    <span v-else>{{ scope.row['datas'].value }}</span>
                  </div>
                </el-popover>
                <span v-else>****</span>
              </template>
            </el-table-column>
            <el-table-column label="采集周期/s" fixed="right" width="85">
              <template slot-scope="scope">
                <el-popover :popper-class="scope.row['cycle'].msg+'popover-visibility'" trigger="hover" placement="top">
                  <p><span class="error-type">错误原因： </span> {{ scope.row['cycle'].msg }}</p>
                  <div slot="reference" :class="{'error': scope.row['cycle'].msg}">
                    <el-autocomplete
                      v-if="scope.row.editable"
                      v-model.trim="scope.row['cycle'].value"
                      size="mini"
                      :fetch-suggestions="(queryString, cb) => {cb([{value: '10'}, {value: '30'}, {value: '60'}, {value: '120'}])}"
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
              <th>传感器名称</th>
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
              <td>{{ item.field1.value !== '' ? `${item.field1.value}/${item.field2.value}/${item.field3.value}/${item.field4.value}` : '' }}</td>
              <td>{{ item.address.value }}</td>
              <td>{{ item.funcode.value===1?'01读写':item.funcode.value===2?'02只读':item.funcode.value===3?'03读写':item.funcode.value===4?'04只读':'' }}</td>
              <td>{{ item.bias.value }}</td>
              <td>
                {{ item.datatype.value===1?'16位有符号数':item.datatype.value===2?'16位无符号数':item.datatype.value===3?
                  '32位有符号数':item.datatype.value===4?'32位无符号数':item.datatype.value===5?'32位浮点型数'
                    :item.datatype.value===6?'16位按位读取':item.datatype.value===7?'bit':'' }}
              </td>
              <td>{{ item.orderStr.value }}</td>
              <td>{{ item.datas.value }}</td>
              <td>{{ item.cycle.value }}</td>
            </tr>
          </table>
        </el-col>
      </el-row>
      <div style="text-align: center;">
        <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="senserPagination.total" :page-sizes="[10, 20, 50, 100]" :page-size="senserPagination.pageSize" :current-page.sync="senserPagination.currentPage" @size-change="handleSenserSizeChange" @current-change="handleSenserCurrentChange" />
      </div>
      <span v-if="currentGateway.editable" slot="footer">
        <el-button :loading="submitLoading" type="primary" @click.native="submitSenserData('gatewayForm')">保存配置</el-button>
      </span>
    </el-dialog>
    <!-- 显示模板详细信息的弹窗 -->
    <el-dialog v-loading="templateDialogLoading" element-loading-text="加载中..." :title="currentTemplate.name" :visible.sync="templateDialog" :width="currentTemplate.type === 1 ? '90%' : '50%'" custom-class="template-dialog" @close="templateDialogClose">
      <el-table :data="senserData" stripe style="width: 100%" border>
        <el-table-column type="index" />
        <el-table-column label="传感器名称">
          <template slot-scope="scope">
            {{ scope.row.sensorName.value }}
          </template>
        </el-table-column>
        <el-table-column label="点位类型">
          <template slot-scope="scope">
            {{ getPointTypeLabel(scope.row.sensorTypeId.value) }}
          </template>
        </el-table-column>
        <el-table-column label="小数位">
          <template slot-scope="scope">
            {{ scope.row.decimal.value }}
          </template>
        </el-table-column>
        <el-table-column label="单位">
          <template slot-scope="scope">
            {{ scope.row.unit.value }}
          </template>
        </el-table-column>
        <el-table-column v-if="currentTemplate.type === 1" label="映射">
          <template slot-scope="scope">
            {{ scope.row.field1.value ? `${scope.row.field1.value}/${scope.row.field2.value}/${scope.row.field3.value}/${scope.row.field4.value}` : '' }}
          </template>
        </el-table-column>
        <el-table-column v-if="currentTemplate.type === 1" label="从站地址">
          <template slot-scope="scope">
            {{ scope.row.address.value }}
          </template>
        </el-table-column>
        <el-table-column v-if="currentTemplate.type === 1" label="功能码">
          <template slot-scope="scope">
            {{ scope.row.funcode.value===1?'01读写':scope.row.funcode.value===2?'02只读':scope.row.funcode.value===3?'03读写':scope.row.funcode.value===4?'04只读':'' }}
          </template>
        </el-table-column>
        <el-table-column v-if="currentTemplate.type === 1" label="寄存器地址">
          <template slot-scope="scope">
            {{ scope.row.bias.value }}
          </template>
        </el-table-column>
        <el-table-column v-if="currentTemplate.type === 1" label="数据格式">
          <template slot-scope="scope">
            {{ scope.row.datatype.value===1 ?'16位有符号数':scope.row.datatype.value===2?'16位无符号数':scope.row.datatype.value===3?'32位有符号数':scope.row.datatype.value===4?'32位无符号数':scope.row.datatype.value===5?'32位浮点型数':scope.row.datatype.value===6?'16位按位读取':scope.row.datatype.value===7?'bit':'' }}
          </template>
        </el-table-column>
        <el-table-column v-if="currentTemplate.type === 1" label="字节顺序">
          <template slot-scope="scope">
            {{ scope.row.orderStr.value }}
          </template>
        </el-table-column>
        <el-table-column v-if="currentTemplate.type === 1" label="地址位">
          <template slot-scope="scope">
            {{ scope.row.datas.value }}
          </template>
        </el-table-column>
        <el-table-column label="采集周期/s">
          <template slot-scope="scope">
            {{ scope.row.cycle.value }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :visible.sync="shareDialog" :show-close="false" custom-class="share-dialog">
      <el-input v-model.trim="userFilterText" size="small" suffix-icon="el-icon-search" clearable placeholder="邮箱/手机/用户名" />
      <div style="color:#83a1a5;padding-top: 15px;">
        成员列表：
      </div>
      <div class="search-result thin-scroll" v-loading="filterLoading">
        <template v-for="(item, index) in userList" >
          <div :key="index" v-show="userList.length" v-if="~~item.user !== userId" class="result-item" @click="selectUser(item)">
            <div v-show="item.check === 1" class="corner-label">
              <c-svg name="true" />
            </div>
            <img :src="item.avatar" class="avatar">
            <span class="nickname">{{ item.nickname }}</span>
          </div>
        </template>
        <div v-show="!userList.length && userFilterText" style="padding: 70px;text-align:center;">
          没有找到该用户
        </div>
        <div v-if="!userList.length && !userFilterText" style="color: #ccc;text-align: center;line-height: 200px;">
          可通过搜索进行分享
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getTempById, addTemplate, updateTemplate, getTempByUid, deleteTemplate, regionUser, deleteUser, getUserbyPro } from '@/api/device_new'
import FileSaver from 'file-saver'
import { dataTransform, addRow, checkData, copy, batchCopy } from '@/utils/sensor'
import { fetchPointTypeList } from '@/api/pointType'
import debounce from 'lodash/debounce'
import { storageName } from '@/utils/index'

export default {
  name: 'GatewayIndex',
  data() {
    return {
      gatewayType: '',
      pointTypeOptions: [],
      currentGateway: {
        editable: true
      },
      multipleSelection: [],
      senserData: [], // 所有的传感器
      senserTable: [], // 一页的传感器
      senserPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20
      },
      configDialogVisible: false,
      operationType: 'configSenser', // 区分添加模板还是配置网关
      senserLoading: false,
      submitLoading: false,
      templateTable: [],
      currentTemplate: {
        type: 0,
        name: '',
        id: ''
      },
      templateDialog: false,
      templateDialogLoading: false,
      shareDialog: false,
      userFilterText: '',
      filterLoading: false,
      userList: [],
      selectedUser: [],
      userId: JSON.parse(sessionStorage.getItem(storageName('userInfo'))).uid
    }
  },
  watch: {
    userFilterText() {
      this.fetchUserList()
    }
  },
  mounted() {
    this.fetchTemplateList()
  },
  methods: {
    // 显示 dialog
    async openDialog(type, id, sn, projectId = 0, dType, protocol) {
      this.configDialogVisible = true
      this.operationType = type
      this.currentGateway.id = id
      this.currentGateway.sn = sn
      await fetchPointTypeList(projectId).then(res => {
        const data = res.data.Data
        this.pointTypeOptions = [{
          label: '状态量',
          options: data.State
        }, {
          label: '模拟量',
          options: data.Analog
        }]
      }).catch(err => {
        console.error(err)
        this.$message.error('服务器错误')
      })
      if (protocol) {
        this.currentGateway.editable = false
      } else {
        this.currentGateway.editable = true
      }
      this.currentGateway.dType = dType // dtype判断网关是用户自定义生成还是通过模板生成 0是用户自定义的，1是通过模板产生的。
      if (type === 'configTemplate') {
        this.senserLoading = true
        getTempById({
          tids: id
        }).then(({ data }) => {
        if (data.Code === 200) {
          this.currentTemplate.name = data.Data[0].name
          const sensorItems = JSON.parse(data.Data[0].value).sensorItem
          this.senserData = dataTransform(sensorItems, 'templateFromServer', this.pointTypeOptions)
          this.senserTable = this.senserData.slice(0, this.senserPagination.pageSize)
          this.senserPagination.total = this.senserData.length
        } else {
          this.$message.error('模板信息获取失败')
        }
        }).catch(err => {
          console.error(err)
        }).then(() => {
          this.senserLoading = false
        })
      }
    },
    // 传感器分页
    handleSenserCurrentChange(pageIndex) {
      if (this.gatewayType === 'Tcp') {
        this.tcpSenserPagination.total = this.tcpSenserData.length
        this.tcpSenserTable = this.tcpSenserData.slice((pageIndex - 1) * this.tcpSenserPagination.pageSize, (pageIndex - 1) * this.tcpSenserPagination.pageSize + this.tcpSenserPagination.pageSize)
      } else {
        this.senserPagination.total = this.senserData.length
        this.senserTable = this.senserData.slice((pageIndex - 1) * this.senserPagination.pageSize, (pageIndex - 1) * this.senserPagination.pageSize + this.senserPagination.pageSize)
      }
    },
    // 传感器分页
    handleSenserSizeChange(val) {
      if (this.gatewayType === 'Tcp') {
        this.tcpSenserPagination.pageSize = val
        this.tcpSenserPagination.currentPage = 1
      } else {
        this.senserPagination.pageSize = val
        this.senserPagination.currentPage = 1
      }
      this.handleSenserCurrentChange(1)
    },
    // 关闭 dialog 时清空数据
    dialogClose() {
      this.senserData = []
      this.senserTable = []

      this.currentTemplate.id = ''
      this.currentTemplate.name = ''
      this.currentTemplate.type = 0
    },
    // 查看模板
    async watchTemplate(id, type) {
      this.currentTemplate.type = type
      this.templateDialog = true
      this.templateDialogLoading = true
      await fetchPointTypeList(0).then(res => {
        const data = res.data.Data
        this.pointTypeOptions = [{
          label: '状态量',
          options: data.State
        }, {
          label: '模拟量',
          options: data.Analog
        }]
      }).catch(err => {
        console.error(err)
        this.$message.error('服务器错误')
      })
      getTempById({
        tids: id
      }).then(({data}) => {
        if (data.Code === 200) {
          this.currentTemplate.name = data.Data[0].name
          const sensorItems = JSON.parse(data.Data[0].value).sensorItem
          this.senserData = dataTransform(sensorItems, 'templateFromServer', this.pointTypeOptions)
        } else {
          this.$message.error('模板信息获取失败')
        }
      }).catch(err => {
        console.error(err)
        this.$message.error('模板信息获取失败')
      }).finally(() => {
        this.templateDialogLoading = false
      })
    },
    templateDialogClose() {
      this.senserData = []
      this.currentTemplate.name = ''
    },
    // 点击分享按钮
    clickShareBtn(id) {
      this.currentTemplate.id = id
      this.shareDialog = true
      this.userFilterText = ''
      this.fetchUserList()
    },
    // 分享点击选中
    selectUser(item) {
      if (item.check === 0) {
        regionUser({
          uids: item.user,
          tid: this.currentTemplate.id
        }).then(res => {
          if (res.data.Code === 200) {
            this.$message({
              type: 'success',
              message: '分享成功 '
            })
          } else {
            this.$message.error('分享失败')
          }
        }).catch(err => {
          console.error(err)
        })
      } else {
        deleteUser({
          uids: item.user,
          tid: this.currentTemplate.id
        }).then(res => {
          if (res.data.Code === 200) {
            this.$message({
              type: 'success',
              message: '成功取消分享 '
            })
          } else {
            this.$message.error('取消分享失败')
          }
        }).catch(err => {
          console.error(err)
        })
      }
      item.check = item.check === 1 ? 0 : 1
    },
    // 删除模板
    delTemplate(id) {
      this.$confirm('确认要删除该网关模板？', '提示', { type: 'warning' }).then(() => {
        deleteTemplate({
          tid: id
        }).then(res => {
          if (res.data.Code === 200) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.fetchTemplateList()
          } else {
            this.$message.error('删除失败')
          }
        }).catch(err => {
          this.$message.error('删除失败')
          console.error(err)
        })
      }).catch((err) => {
        console.error(err)
      })
    },
    // 提交网关数据
    submitSenserData() {
      if (this.operationType !== 'configSenser' && !this.currentTemplate.name) {
        this.$message('请输入模板名称')
        return false
      }
      const result = checkData(this.senserData)
      if (result.errPages.length) {
        this.$notify({
          title: '警告',
          message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
          type: 'warning',
          duration: 10000
        })
        return false
      }
      this.$nextTick(() => {
        try {
          if (document.querySelectorAll('.error').length === 0) {
            let data = {}
            data.sensorItem = []
            for (let i = 0; i < this.senserData.length; i++) {
              let temp = {}
              if (this.senserData[i].field1.value === '') { // 如果没有填写了映射
                temp.field1 = ''
                temp.field2 = ''
                temp.field3 = ''
                temp.field4 = ''
              } else {
                temp.field1 = this.senserData[i].field1.value
                temp.field2 = this.senserData[i].field2.value
                temp.field3 = this.senserData[i].field3.value
                temp.field4 = this.senserData[i].field4.value
              }

              temp.decimal = this.senserData[i].decimal.value
              temp.sensorName = this.senserData[i].sensorName.value
              temp.sensorTypeId = this.senserData[i].sensorTypeId.value
              temp.unit = this.senserData[i].unit.value
              temp.address = this.senserData[i].address.value
              temp.bias = this.senserData[i].bias.value
              temp.funcode = this.senserData[i].funcode.value
              temp.datatype = this.senserData[i].datatype.value
              temp.datas = this.senserData[i].datas.value.toString()
              temp.orderStr = this.senserData[i].orderStr.value
              temp.cycle = this.senserData[i].cycle.value

              temp.lastUpdateDate = ''
              temp.sensorId = this.senserData[i].pointID ? this.senserData[i].pointID : 0
              temp.modbusId = this.senserData[i].modbusId ? this.senserData[i].modbusId : ''
              if (this.senserData[i].pointType !== '1' && this.senserData[i].pointType !== '2') {
                // 说明这个点位是通过点击添加点位按钮添加的。
                this.senserData[i].pointType = '1'
              }
              temp.pointType = this.senserData[i].pointType
              if (this.operationType === 'configSenser') {
                temp.iswrite = '0'
                temp.iocUrl = ''
                temp.isLine = '0'
                temp.isOpen = '0'
                temp.tag = ''
                temp.lastUpdateDate = ''
                temp.switcher = ''
                temp.symbol = ''
                temp.createDate = new Date().format('yyyy-MM-dd hh:mm:ss')
              }
              data.sensorItem.push(temp)
            }
            if (!data.sensorItem.length) {
              this.$message('请确保最少有一条传感器记录')
              return
            }
            if (this.operationType !== 'configSenser') {
              if (this.operationType === 'addTemplate') {
                this.submitLoading = true
                addTemplate({
                  id: undefined,
                  name: this.currentTemplate.name,
                  value: JSON.stringify(data),
                  num: data.sensorItem.length,
                  TYPE: 2,
                  CREATETIME: undefined,
                  FLAG: undefined
                }).then(res => {
                  if (res.data.Code === 200) {
                    this.$message.success('添加成功')
                    this.fetchTemplateList() // 更新模板列表
                    this.configDialogVisible = false
                  } else {
                    this.$message.error('服务器错误，模板添加失败')
                  }
                }).catch(err => {
                  console.error(err)
                  this.$message.error('服务器错误，模板添加失败')
                }).finally(() => {
                  this.submitLoading = false
                })
              } else if (this.operationType === 'configTemplate') {
                this.submitLoading = true
                updateTemplate({
                  id: this.currentGateway.id,
                  name: this.currentTemplate.name,
                  value: JSON.stringify(data),
                  num: data.sensorItem.length,
                  TYPE: 2,
                  CREATETIME: undefined,
                  FLAG: undefined
                }).then(res => {
                  if (res.data.Code === 200) {
                    this.$message({
                      message: '模板更新成功',
                      type: 'success'
                    })
                    this.fetchTemplateList() // 更新模板列表
                    this.configDialogVisible = false
                  } else {
                    this.$message.error('模板更新失败')
                  }
                }).catch(err => {
                  console.error(err)
                  this.$message.error('服务器错误，模板更新失败')
                }).finally(() => {
                  this.submitLoading = false
                })
              }
            }
          } else {
            this.$message('请确保提交的数据不存在错误再提交!')
          }
        } catch (error) {
          console.error(error)
        }
      })
    },
    // 添加一行
    clickAddRow() {
      if (this.gatewayType === 'Tcp') {
        addRow(this.tcpSenserData, this.gatewayType)
        this.tcpSenserPagination.currentPage = 1
      } else {
        addRow(this.senserData)
        this.senserPagination.currentPage = 1
      }
      this.handleSenserCurrentChange(1)
    },
    // 下载模板
    downloadTemplate() {
      window.location.href = 'https://cdn.sinocold.net/excel_template/%E7%BD%91%E5%85%B3%E6%A8%A1%E6%9D%BF_v2.xlsx'
    },
    // 上传 excel 文件
    uploadExcel(evt) {
      var reader = new FileReader()
      reader.onload = (e) => {
        /* read workbook */
        var bstr = e.target.result
        var wb = XLSX.read(bstr, {
          type: 'binary'
        })
        this.senserData.unshift(...dataTransform(this.toJson(wb).Sheet1, 'fromExcel', this.pointTypeOptions))
        let result = checkData(this.senserData)
        this.senserPagination.currentPage = 1
        this.handleSenserCurrentChange(1)
        if (result.errPages.length) {
          this.$notify({
            title: '警告',
            message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
            type: 'warning',
            duration: 10000
          })
        }
        evt.target.value = ''
      }
      reader.readAsBinaryString(evt.target.files[0])
      return false
    },
    // 删除行 （点位列表）
    deleteSenser(index) {
      this.$confirm('确认要删除该点位？', '提示', { type: 'warning' }).then(() => {
        this.senserData.splice((this.senserPagination.currentPage - 1) * 20 + index, 1)
        this.handleSenserCurrentChange(this.senserPagination.currentPage)
      })
    },
    // 通过checkbox选择表格中的行时触发
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 批量删除
    batchDel() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一行')
        return false
      }
      this.$confirm('确认要删除这些监测点位？', '提示', { type: 'warning' }).then(() => {
        let selection = this.multipleSelection.map(item => item.flag)
        this.senserData = this.senserData.filter(item => {
          return !(selection.indexOf(item.flag) > -1)
        })
        this.handleSenserCurrentChange(this.senserPagination.currentPage)
      })
    },
    // 批量复制
    batchPaste() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一行')
        return false
      }
      batchCopy(this.senserData, JSON.parse(JSON.stringify(this.multipleSelection)))
      this.senserPagination.currentPage = 1
      this.handleSenserCurrentChange(1)
      this.$refs['custom-table'].clearSelection()
      this.$message.success('已成功复制指定行至列表头部')
    },
    // 点击按钮后校验数据
    handleCheckData() {
      let result
      if (this.gatewayType === 'Tcp') {
        result = checkData(this.tcpSenserData, this.gatewayType)
      } else {
        result = checkData(this.senserData)
      }
      if (result.errPages.length) {
        this.$notify({
          title: '警告',
          message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
          type: 'warning',
          duration: 10000
        })
        return false
      }
      this.$nextTick(() => {
        if (document.querySelectorAll('.error').length === 0) {
          this.$message.success('点位数据无冲突')
        }
      })
    },
    // 进入和退出编辑
    clickEdit(row) {
      row.editable = !row.editable
      if (!row.editable) {
        if (this.gatewayType === 'Tcp') {
          checkData([row], this.gatewayType)
        } else {
          checkData([row])
        }
      }
    },
    // 复制
    copyRow(currentRow) {
      if (this.gatewayType === 'Tcp') {
        copy(this.tcpSenserData, JSON.parse(JSON.stringify(currentRow)), this.gatewayType)
        this.tcpSenserPagination.currentPage = 1
      } else {
        copy(this.senserData, JSON.parse(JSON.stringify(currentRow)))
        this.senserPagination.currentPage = 1
      }
      this.handleSenserCurrentChange(1)
      this.$message.success('已成功复制指定行至列表头部')
    },
    // 点击单元格进入可编辑模式
    handleCellClick(row, column, cell) {
      if (cell.querySelector('.cell-value')) { // 避免点击编号和操作单元格时出错
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
    unitQuerySearch(queryString, cb) {
      const options = [{
        value: '℃',
        label: '℃'
      }, {
        value: '%',
        label: '%'
      }, {
        value: 'm',
        label: 'm'
      }, {
        value: 'bar',
        label: 'bar'
      }, {
        value: 'Pa',
        label: 'Pa'
      }, {
        value: 'A',
        label: 'A'
      }, {
        value: 'V',
        label: 'V'
      }, {
        value: 'kW',
        label: 'kW'
      }, {
        value: 'KWh',
        label: 'KWh'
      }]
      cb(queryString ? options.filter(item => item.value.toLowerCase().indexOf(queryString.toLowerCase() === 0)) : options)
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
            item.Value && (unitOptions = item.Value.split('|').map(v => v.trim()))
            row.unitOptions = unitOptions
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
        if (row.datatype.value === 1 || row.datatype.value === 2 || row.datatype.value === 6) {
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
    // 将表格内容导出成 excel
    exportExcel() {
      const result = checkData(this.senserData)
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
        let wb = XLSX.utils.table_to_book(document.querySelector('#excel-table'))
        /* get binary string as output */
        var wbout = XLSX.write(wb, {
          bookType: 'xlsx',
          type: 'binary'
        })
        /* force a download */
        FileSaver.saveAs(new Blob([this.s2ab(wbout)], {
          type: 'application/octet-stream'
        }), 'File.xlsx')
      }, 0)
    },
    toJson(workBook) {
      let result = []
      workBook.SheetNames.forEach((sheetName) => {
        let roa = XLSX.utils.sheet_to_row_object_array(workBook.Sheets[sheetName])
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
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
        return buf
      } else {
        buf = new Array(s.length)
        for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF
        return buf
      }
    },
    // 查询模板列表
    fetchTemplateList() {
      getTempByUid().then(res => {
        if (res.data.Code === 200) {
          this.templateTable = res.data.Data
        } else {
          this.$message.error('模板列表获取失败')
          this.templateTable = []
        }
      }).catch(err => {
        console.error(err)
      })
    },
    isEmptyObject(obj) {
      for (const prop in obj) {
        return false
      }
      return true
    },
    // 获取用户列表（可分享用户）
    fetchUserList: debounce(function() {
      if (this.userFilterText === JSON.parse(sessionStorage.getItem(storageName('userInfo'))).nickname) {
        this.$message.info('不能分享给自己')
        this.userFilterText = ''
      }
      this.filterLoading = true
      getUserbyPro({
        tid: this.currentTemplate.id,
        inp: this.userFilterText
      }).then(res => {
        if (res.data.Code === 200) {
          this.userList = res.data.Data
        } else {
          this.userList = []
        }
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.filterLoading = false
      })
    }, 1000, {
      leading: true
    }),
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
    }
  }
}
</script>
<style lang="scss">

.gatewayManager {
  .file-btn {
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
  .el-tabs__nav-scroll{
    padding-left: 40px;
    background: #fff;
  }
  .el-tabs__content{
    padding: 10px 30px 20px 30px;
  }
  .error {
    width: 100%;
    height: 25px;
  }
  .error:after {
    content: "";
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
  .gmdialogtable{
    input {
        padding: 5px;
    }
    div.cell{
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
      transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
      width: 100%;
      height: 22px;
      &:focus {
        outline: none;
        border-color: #20a0ff;
      }
    }
  }
  .table-head {
    text-align: right;
    margin: 15px 5px;
    .title {
      font-size: 18px;
      float: left;
    }
  }
  #senserTable .el-select input {
    height: 25px;
  }
  #senserTable .cell * {
    outline: none;
  }
  .el-dialog__footer {
    text-align: center;
  }
  .online {
    &:before {
      content: '';
      display: inline-block;
      width: .6em;
      height: .6em;
      margin-right: 6px;
      border-radius: 50%;
      background: green;
    }
  }
  .offline {
    &:before {
      content: '';
      display: inline-block;
      width: .6em;
      height: .6em;
      margin-right: 6px;
      border-radius: 50%;
      background: #dbdbdb;
    }
  }
  .senser-template {
    width: 900px;
  }
}
.share-dialog {
  width: 393px;
  .el-dialog__header {
    padding: 0;
  }
  .search-result {
    margin-top: 5px;
    padding: 10px;
    border: 1px solid #ccc;
    height: 275px;
    border-radius: 4px;
    overflow-y: auto;
  }
  .result-item {
    display: inline-block;
    width: 140px;
    height: 50px;
    border: 1px dashed #CCC;
    padding: 5px;
    position: relative;
    line-height: 40px;
    font-size: 14px;
    background: #FFF;
    margin: 0 5px 10px 5px;
    cursor: pointer;
    .nickname {
      margin-left: 5px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
      width: 100px;
    }
  }
  .is-member {
    cursor: not-allowed;
  }
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    vertical-align: middle;
  }
}
.gatewayList, .templateList{
  border-radius: 4px;
  overflow: hidden;
}

.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  border-top-width: 2px;
  border-top-color: #399998;
  border-bottom-color: transparent;
}
@keyframes shine {
  0% {
    box-shadow: 0 0 0 0 hsla(0, 92%, 48%, 0.4);
  }
  100% {
    box-shadow: 0 0 0 10px hsla(0, 7%, 53%, 0);
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
  transform: translateY(0px);
  margin-left: 10px;
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
