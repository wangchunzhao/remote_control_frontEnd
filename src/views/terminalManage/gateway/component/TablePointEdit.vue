<template>
  <div
    class="point-edit-table"
    v-loading="tableLoading"
    element-loading-text="加载中..."
  >
    <el-table
      id="senserTable"
      ref="senserTable"
      highlight-current-row
      :data="senserTable"
      style="width: 100%"
      empty-text="暂无点位数据"
      @selection-change="handleSelectionChange"
      @cell-click="handleCellClick"
    >
      <el-table-column fixed type="selection" align="center" width="45" />
      <el-table-column fixed type="index" width="40" />
      <el-table-column fixed label="操作" width="120">
        <template slot-scope="{ row, $index }">
          <el-tooltip
            :open-delay="300"
            effect="dark"
            content="删除"
            placement="top"
          >
            <el-button
              style="padding: 5px;"
              round
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click.native="deleteSenser($index)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip
            :open-delay="300"
            effect="dark"
            content="复制"
            placement="top"
          >
            <el-button
              size="mini"
              style="padding: 5px;"
              round
              plain
              @click.native="copyRow(row)"
            >
              <c-svg name="paste" />
            </el-button>
          </el-tooltip>
          <el-tooltip
            :open-delay="300"
            effect="dark"
            content="编辑"
            placement="top"
          >
            <el-button
              round
              type="success"
              size="mini"
              style="padding: 5px;"
              :icon="row.editable ? 'el-icon-check' : 'el-icon-edit'"
              @click.native="clickEdit(row)"
            >
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="点位名称" fixed min-width="130">
        <template slot-scope="scope">
          <el-popover
            :popper-class="scope.row['sensorName'].msg + 'popover-visibility'"
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
            :popper-class="scope.row['sensorTypeId'].msg + 'popover-visibility'"
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
            :popper-class="scope.row['decimal'].msg + 'popover-visibility'"
            trigger="hover"
            placement="top"
          >
            <div>
              <span class="error-type">错误原因： </span>
              {{ scope.row['decimal'].msg }}
            </div>
            <div slot="reference" :class="{ error: scope.row['decimal'].msg }">
              <el-select
                v-if="scope.row.editable"
                v-model="scope.row['decimal'].value"
                :disabled="scope.row.typeSection === 'state'"
                size="mini"
                @change="handleChange(scope.row, 'decimal')"
                placeholder=""
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
            <div slot="reference" :class="{ error: scope.row['unit'].msg }">
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
      <el-table-column label="映射" min-width="200">
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
            <div slot="reference" :class="{ error: scope.row['field1'].msg }">
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
                      @click.native="shortcutField(scope.row, '', '', '', '')"
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
                        shortcutField(scope.row, -10000, 10000, -1000, 1000)
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
            :popper-class="scope.row['funcode'].msg + 'popover-visibility'"
            trigger="hover"
            placement="top"
          >
            <div>
              <span class="error-type">错误原因： </span>
              {{ scope.row['funcode'].msg }}
            </div>
            <div slot="reference" :class="{ error: scope.row['funcode'].msg }">
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
            <div slot="reference" :class="{ error: scope.row['bias'].msg }">
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
            :popper-class="scope.row['datatype'].msg + 'popover-visibility'"
            trigger="hover"
            placement="top"
          >
            <div>
              <span class="error-type">错误原因： </span>
              {{ scope.row['datatype'].msg }}
            </div>
            <div slot="reference" :class="{ error: scope.row['datatype'].msg }">
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
      <el-table-column label="字节顺序" width="90">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.pointType !== '2'"
            :popper-class="scope.row['orderStr'].msg + 'popover-visibility'"
            trigger="hover"
            placement="top"
          >
            <div>
              <span class="error-type">错误原因： </span>
              {{ scope.row['orderStr'].msg }}
            </div>
            <div slot="reference" :class="{ error: scope.row['orderStr'].msg }">
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
      <el-table-column label="地址位" width="75">
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
            <div slot="reference" :class="{ error: scope.row['datas'].msg }">
              <el-select
                v-if="scope.row.editable"
                v-model="scope.row['datas'].value"
                placeholder="请选择"
                size="mini"
                @change="handleChange(scope.row, 'datas')"
              >
                <el-option label="空" :value="undefined" />
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
      <el-table-column label="采集周期/s" width="100">
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
            <div slot="reference" :class="{ error: scope.row['cycle'].msg }">
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
          {{
            item.field1.value !== '' && item.field1.value !== null
              ? `${item.field1.value}/${item.field2.value}/${item.field3.value}/${item.field4.value}`
              : ''
          }}
        </td>
        <td>
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
        </td>
        <td>{{ item.bias.value }}</td>
        <td>
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
        </td>
        <td>{{ item.orderStr.value }}</td>
        <td>{{ item.datas.value }}</td>
        <td>{{ item.cycle.value }}</td>
      </tr>
    </table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        :current-page.sync="pagination.currentPage"
        @size-change="handleSenserSizeChange"
        @current-change="handlePagination"
      />
    </div>
  </div>
</template>

<script>
import {
  dataTransform,
  addRow,
  copy,
  checkData,
  batchCopy
} from '@/utils/templateSensor'
import FileSaver from 'file-saver'
import { fetchPointTypeList } from '@/api/pointType'
export default {
  props: {
    pointList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      tableLoading: false,
      pointTypeOptions: [],
      multipleSelection: [],
      senserData: [], // 所有的点位
      senserTable: [], // 一页的点位
      filterText: '',
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20
      }
    }
  },
  watch: {
    pointList: {
      handler: async function(list) {
        if (!list || !list.length) {
          return
        }
        if (!this.pointTypeOptions.length) {
          await this.fetchPointTypeOptions()
        }
        this.senserData = dataTransform(
          list,
          'templateFromServer',
          this.pointTypeOptions
        )
        this.pagination.total = list.length
        this.senserTable = this.senserData.slice(0, this.pagination.pageSize)
      }
    }
  },
  mounted() {
    this.fetchPointTypeOptions()
  },
  methods: {
    // 编辑会转设备id,新增不会
    openDialog() {
      this.dialogVisible = true
    },
    reset() {
      this.pagination = {
        total: 0,
        currentPage: 1,
        pageSize: 20
      }
      this.senserTable = []
      this.senserData = []
    },
    // 下载模板
    downloadTemplate() {
      window.open(
        'https://front-end-assets.oss-cn-shanghai.aliyuncs.com/excel_template/%E6%A8%A1%E5%9D%97%E6%A8%A1%E7%89%88.xlsx',
        '_blank'
      )
    },
    // 添加一行
    addNewRow() {
      addRow(this.senserData)
      this.pagination.currentPage = 1
      this.handlePagination(1)
    },
    // 通过checkbox选择表格中的行时触发
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
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
    // 删除行 （点位列表）
    deleteSenser(index) {
      this.senserData.splice((this.pagination.currentPage - 1) * 20 + index, 1)
      this.handlePagination(this.pagination.currentPage)
    },
    // 复制
    copyRow(currentRow) {
      copy(this.senserData, JSON.parse(JSON.stringify(currentRow)))
      this.pagination.currentPage = 1
      this.handlePagination(1)
      this.$message.success('已成功复制指定行至列表头部')
    },
    // 批量删除
    batchDel() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一行')
        return false
      }
      this.$confirm('确认要删除这些监测点位？', '提示', {
        type: 'warning'
      }).then(() => {
        let selection = this.multipleSelection.map(item => item.flag)
        this.senserData = this.senserData.filter(item => {
          return !(selection.indexOf(item.flag) > -1)
        })
        this.handlePagination(this.pagination.currentPage)
      })
    },
    // 批量复制
    batchPaste() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一行')
        return false
      }
      batchCopy(
        this.senserData,
        JSON.parse(JSON.stringify(this.multipleSelection))
      )
      this.pagination.currentPage = 1
      this.handlePagination(1)
      this.$refs['senserTable'].clearSelection()
      this.$message.success('已成功复制指定行至列表头部')
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
        this.handlePagination(1)
        if (result.errPages.length) {
          this.$notify({
            title: '警告',
            message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
            type: 'warning',
            duration: 10000
          })
        }
      }
      reader.readAsBinaryString(file)
      return false
    },
    // 进入和退出编辑
    clickEdit(row) {
      row.editable = !row.editable
      if (!row.editable) {
        checkData([row], this.pagination.pageSize)
      }
    },
    unitQuerySearch(queryString, cb) {
      const options = [
        {
          value: '℃',
          label: '℃'
        },
        {
          value: '%',
          label: '%'
        },
        {
          value: 'm',
          label: 'm'
        },
        {
          value: 'bar',
          label: 'bar'
        },
        {
          value: 'Pa',
          label: 'Pa'
        },
        {
          value: 'A',
          label: 'A'
        },
        {
          value: 'V',
          label: 'V'
        },
        {
          value: 'kW',
          label: 'kW'
        },
        {
          value: 'KWh',
          label: 'KWh'
        }
      ]
      cb(
        queryString
          ? options.filter(item =>
              item.value.toLowerCase().indexOf(queryString.toLowerCase() === 0)
            )
          : options
      )
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
    // 点位分页
    handlePagination(pageIndex, nameFilter = '') {
      let senserData = []
      senserData = this.senserData.filter(v => {
        return (
          v.sensorName.value.toLowerCase().indexOf(nameFilter.toLowerCase()) >
          -1
        )
      })

      this.pagination.total = senserData.length
      this.senserTable = senserData.slice(
        (pageIndex - 1) * this.pagination.pageSize,
        (pageIndex - 1) * this.pagination.pageSize + this.pagination.pageSize
      )
    },
    // 点位分页
    handleSenserSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.handlePagination(1)
    },
    handleCheckData(name = '') {
      const result = checkData(this.senserData, this.pagination.pageSize, name)
      if (result.errPages.length) {
        this.$notify({
          title: '警告',
          message: `${name}  请修复第 ${result.errPages.join(', ')} 页的错误`,
          type: 'warning',
          duration: 10000
        })
        return false
      }
      return true
    },
    // 提交点位数据
    submit() {
      const result = checkData(this.senserData, this.pagination.pageSize)
      if (result.errPages.length) {
        this.$notify({
          title: '警告',
          message: `请修复第 ${result.errPages.join(', ')} 页的错误`,
          type: 'warning',
          duration: 10000
        })
        return null
      }
      try {
        if (!this.senserData.length) {
          this.$message('请确保最少有一条点位记录')
          return null
        }
        let list = []
        for (let i = 0; i < this.senserData.length; i++) {
          let item = this.senserData[i]
          let temp = {}
          if (item.field1.value === '' || item.field1.value === null) {
            // 如果没有填写映射
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
          temp.bias = item.bias.value
          temp.funcode = item.funcode.value
          temp.datatype = item.datatype.value
          temp.datas = item.datas.value || undefined
          temp.orderStr = item.orderStr.value
          temp.cycle = item.cycle.value

          temp.DeviceModulePointId = item.DeviceModulePointId
          temp.DeviceModuleId = item.DeviceModuleId
          if (item.DeviceModulePointId) {
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
          list.push(temp)
        }
        return list
      } catch (error) {
        console.error(error)
        return null
      }
    },
    fetchPointTypeOptions() {
      return new Promise((resolve, reject) => {
        fetchPointTypeList(0)
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
            resolve()
          })
          .catch(err => {
            console.error(err)
            reject()
          })
      })
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
.point-edit-table {
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
    color: #409eff;
    cursor: pointer;
  }
  .el-table .cell {
    height: 36px;
    line-height: 36px;
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
  #senserTable input {
    height: 25px;
    padding: 0 5px;
    font-size: 13px;
  }
  #senserTable .cell * {
    outline: none;
  }
  .icon-what {
    transform: translateY(0px);
    margin-left: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    &:hover {
      color: #409eff;
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
      margin: 0;
    }
  }
}
.error-type {
  font-weight: 600;
}
.popover-visibility {
  visibility: hidden;
}
</style>
