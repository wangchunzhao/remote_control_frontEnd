<template>
  <div class="content-box tcp-config">
    <el-row :gutter="30">
      <el-col>
        <div class="table-head">
          <div style="margin-bottom: 15px;">
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
              content="验证点位列表数据的正确性"
            >
              <el-button size="small" @click.native="handleCheckData">
                数据校验
              </el-button>
            </el-tooltip>
          </div>
        </div>
        <el-table
          id="senserTable"
          key="byTemplate"
          ref="custom-table"
          class="gmdialogtable"
          highlight-current-row
          :data="tcpSenserTable"
          style="width: 100%"
          empty-text="暂无配置信息"
          @selection-change="handleSelectionChange"
          @cell-click="handleCellClick"
        >
          <el-table-column
            prop="channel"
            label="通道号"
            width="100"
            type="index"
          >
            <template slot-scope="scope">
              <span>{{
                senserPagination.pageSize * (senserPagination.currentPage - 1) +
                  1 +
                  scope.$index
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="145">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.pointType !== '2'"
                size="mini"
                style="padding: 5px;"
                round
                @click.native="copyRow(scope.row)"
              >
                <c-svg name="paste" />
              </el-button>
              <el-button
                type="success"
                round
                size="mini"
                style="padding: 5px;"
                :icon="scope.row.editable ? 'el-icon-check' : 'el-icon-edit'"
                @click.native="clickEdit(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="点位类型" width="170">
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
          <el-table-column label="传感器名称" min-width="150">
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
          <el-table-column label="小数位">
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
          <el-table-column label="单位">
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
        </el-table>
      </el-col>
    </el-row>
    <div style="text-align: center;margin-top: 25px;">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="senserPagination.total"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="senserPagination.pageSize"
        :current-page.sync="senserPagination.currentPage"
        @size-change="handleSenserSizeChange"
        @current-change="handleSenserCurrentChange"
      />
      <el-button
        :loading="tcpSubmitLoading"
        type="primary"
        style="margin-top: 20px;"
        @click.native="submitSenserData"
      >
        保存配置
      </el-button>
    </div>
  </div>
</template>

<script>
import { fetchPointTypeList } from '@/api/pointType'
import { getTCPConfig, addDevicePoint } from '@/api/device_new'
import { dataTransform, addRow, checkData, copy } from '@/utils/sensor'

export default {
  props: {
    gatewayInfo: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      tcpSenserData: [], // 所有的传感器
      tcpSenserTable: [], // 一页的传感器
      senserPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20
      },

      tcpSubmitLoading: false,
      multipleSelection: [],
      pointTypeOptions: []
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
      await fetchPointTypeList(this.gatewayInfo.PID)
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
      getTCPConfig(this.gatewayInfo.id)
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            this.tcpSenserData = dataTransform(
              data.point_list,
              'tcpGateway',
              this.pointTypeOptions
            )
            this.senserPagination.total = this.tcpSenserData.length
            this.tcpSenserTable = this.tcpSenserData.slice(
              0,
              this.senserPagination.pageSize
            )
          } else {
            this.$message.error('网关配置获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('网关配置获取失败')
        })
    },

    // 通过checkbox选择表格中的行时触发
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 进入和退出编辑
    clickEdit(row) {
      row.editable = !row.editable
      if (!row.editable) {
        checkData([row], this.senserPagination.pageSize, 'TCP')
      }
    },
    // 复制
    copyRow(currentRow) {
      copy(this.tcpSenserData, JSON.parse(JSON.stringify(currentRow)), 'TCP')
      this.senserPagination.currentPage = 1
      this.handleSenserCurrentChange(1)
      this.$message.success('已成功复制指定行至列表头部')
    },
    // 添加一行
    clickAddRow() {
      addRow(this.tcpSenserData)
      this.senserPagination.currentPage = 1
      this.handleSenserCurrentChange(1)
    },
    // 删除行 （点位列表）
    // deleteSenser(index, id) {
    //   if (id) {
    //     let exitSenserCount = 0 // 已经存在于数据库的传感器数量的
    //     this.tcpSenserData.forEach(item => {
    //       item.pointID && (exitSenserCount = exitSenserCount + 1)
    //     })
    //     if (exitSenserCount === 1) {
    //       this.$message('请确保最少有一条已经上线的点位')
    //       return
    //     }
    //   }
    //   this.$confirm('确认要删除该点位？', '提示', { type: 'warning' }).then(
    //     () => {
    //       this.tcpSenserData.splice(
    //         (this.senserPagination.currentPage - 1) * 20 + index,
    //         1
    //       )
    //       this.handleSenserCurrentChange(this.senserPagination.currentPage)
    //       // 如果 id 存在的话（说明该数据已经存在于数据库），发起删除请求
    //       if (id) {
    //         delSensor(id)
    //           .then(res => {
    //             if (JSON.parse(res.data).flag !== '00') {
    //               this.$message.error('后台删除失败')
    //             }
    //           })
    //           .catch(err => {
    //             console.error(err)
    //             this.$message.error('服务器错误,删除失败')
    //           })
    //       }
    //     }
    //   )
    // },
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
      result = checkData(
        this.tcpSenserData,
        this.senserPagination.pageSize,
        'TCP'
      )
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
    // 传感器分页
    handleSenserSizeChange(val) {
      this.senserPagination.pageSize = val
      this.senserPagination.currentPage = 1
      this.handleSenserCurrentChange(1)
    },
    // 传感器分页
    handleSenserCurrentChange(pageIndex) {
      this.senserPagination.total = this.tcpSenserData.length
      this.tcpSenserTable = this.tcpSenserData.slice(
        (pageIndex - 1) * this.senserPagination.pageSize,
        (pageIndex - 1) * this.senserPagination.pageSize +
          this.senserPagination.pageSize
      )
    },
    // 提交网关数据
    submitSenserData() {
      let data = {}
      const result = checkData(
        this.tcpSenserData,
        this.senserPagination.pageSize,
        'TCP'
      )
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
        if (document.querySelectorAll('.error').length !== 0) {
          this.$message('请确保提交的数据不存在错误再提交')
          return false
        }
        this.tcpSubmitLoading = true
        data.PointList = []
        for (let i = 0; i < this.tcpSenserData.length; i++) {
          let temp = {}
          temp.Decimal = this.tcpSenserData[i].decimal.value
          temp.PointName = this.tcpSenserData[i].sensorName.value
          temp.PointType = this.tcpSenserData[i].sensorTypeId.value
          temp.Unit = this.tcpSenserData[i].unit.value
          temp.Channel = i + 1
          if (this.tcpSenserData[i].field1.value === '') {
            // 如果没有填写了映射
            temp.Map = ''
          } else {
            temp.Map = `${this.tcpSenserData[i].field1.value},${this.tcpSenserData[i].field2.value},${this.tcpSenserData[i].field3.value},${this.tcpSenserData[i].field4.value}`
          }
          data.PointList.push(temp)
        }
        if (!data.PointList.length) {
          this.$message('请确保最少有一条传感器记录')
          this.tcpSubmitLoading = false
          return
        }
        data.DvcName = this.gatewayInfo.NAME
        data.DvcNo = this.gatewayInfo.DESCRIBES
        data.ProjectID = this.gatewayInfo.PID
        addDevicePoint(data)
          .then(res => {
            if (res.data.Code === 200 && res.data.Data.IsSuccess) {
              this.$message({
                message: '网关配置成功',
                type: 'success'
              })
              this.$emit('change')
            } else {
              this.$message.error('网关配置失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('服务器错误')
          })
          .finally(() => {
            this.tcpSubmitLoading = false
          })
      })
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
    }
  }
}
</script>

<style lang="scss">
.tcp-config {
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
  }
}
</style>
