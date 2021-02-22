<template>
  <div class="sensor-manage content-box">
    <div style="margin-bottom: 16px;">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        v-permission="[platform === 'DEVICE_CONNECT' ? 96 : 75]"
        @click.native="dialogVisible = true"
      >
        注册
      </el-button>
      <el-tooltip placement="top" effect="light" style="display: inline-block;">
        <div slot="content" style="text-align: center;font-size: 12px;">
          <a
            href="javascript:;"
            style="color:rgb(24, 144, 255);"
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
            :loading="uploadLoading"
            size="small"
            v-permission="[platform === 'DEVICE_CONNECT' ? 96 : 75]"
            style="margin: 0 10px;"
          >
            批量导入
          </el-button>
        </el-upload>
      </el-tooltip>
      <el-button @click.native="handleClickEdit" size="small">
        批量变更
      </el-button>
      <el-button
        v-permission="[platform === 'DEVICE_CONNECT' ? 97 : 76]"
        type="danger"
        size="small"
        @click.native="handleRemove"
      >
        从项目中移除
      </el-button>
      <el-select
        v-model="filterForm.project"
        placeholder="请选择项目"
        size="small"
        v-if="platform === 'DEVICE_CONNECT'"
        style="margin-left: 10px;"
        clearable
        filterable
        @change="changeProject"
      >
        <el-option
          v-for="item in proList"
          :key="item.id"
          :value="item.id"
          :label="item.label"
        />
      </el-select>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        placeholder="查找序列号"
        style="width: 200px;float: right;"
        suffix-icon="el-icon-search"
      />
    </div>

    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
      element-loading-text="加载中..."
      @selection-change="handleSelectionChange"
      @cell-click="cellDblclick"
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column type="selection" width="55" fixed />
      <el-table-column
        label="序列号"
        width="100"
        sortable="custom"
        prop="Tag"
        fixed
      />
      <el-table-column
        label="类型"
        width="100"
        prop="SensorTagType"
        column-key="SensorTagType"
        :filters="[{ text: 'T', value: 1 }, { text: 'T/H', value: 2 }]"
      >
        <template slot-scope="{ row }">
          {{ row.SensorTagType === 1 ? 'T' : 'T/H' }}
        </template>
      </el-table-column>
      <el-table-column
        label="电量%"
        width="120"
        sortable="custom"
        prop="Battery"
      >
        <template slot-scope="{ row }">
          <el-link
            @click.native="watchHistoryChart(row.Sensor.id, 'Battery')"
            v-if="row.Sensor && row.Sensor.battery"
            :underline="false"
            type="primary"
          >
            {{ row.Sensor.battery }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="Voltage"
        width="120"
        sortable="custom"
        label="电压V"
      >
        <template slot-scope="{ row }">
          <el-link
            @click.native="watchHistoryChart(row.Sensor.id, 'Voltage')"
            v-if="row.Sensor && row.Sensor.voltage"
            :underline="false"
            type="primary"
          >
            {{ row.Sensor.voltage }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="温度℃"
        width="120"
        sortable="custom"
        prop="TValue"
      >
        <template slot-scope="{ row }">
          <el-link
            @click.native="watchHistoryChart(row.Sensor.id, 'TValue')"
            v-if="row.Sensor && row.Sensor.tValue"
            :underline="false"
            type="primary"
          >
            {{ row.PointList && row.Sensor.tValue }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="湿度%"
        width="120"
        sortable="custom"
        prop="HValue"
      >
        <template slot-scope="{ row }">
          <el-link
            @click.native="watchHistoryChart(row.Sensor.id, 'HValue')"
            v-if="row.Sensor && row.Sensor.hValue"
            :underline="false"
            type="primary"
          >
            {{ row.Sensor.hValue }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="Rssi"
        width="120"
        sortable="custom"
        label="信号强度"
      >
        <template slot-scope="{ row }">
          <el-link
            @click.native="watchHistoryChart(row.Sensor.id, 'Rssi')"
            v-if="row.Sensor && row.Sensor.rssi"
            :underline="false"
            type="primary"
          >
            {{ row.Sensor.rssi }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="记录时间" width="200" sortable prop="rTime">
        <template slot-scope="{ row }">
          {{ row.Sensor && row.Sensor.rTime ? row.Sensor.rTime : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="上传时间" width="200" sortable prop="uTime">
        <template slot-scope="{ row }">
          {{ row.Sensor && row.Sensor.uTime ? row.Sensor.uTime : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="所属项目" width="200" prop="ProjectName" />
      <el-table-column label="关联设备" width="120" prop="MName" />
      <el-table-column width="120" label="采集间隔/秒" prop="Cycle">
        <template slot-scope="{ row }">
          <template v-if="row.cycleEditable">
            <el-input
              v-model.number="row.Sensor.cycle"
              size="mini"
              placeholder=""
            >
              <el-button
                @click.native="
                  () => {
                    row.cycleEditable = false
                    row.Sensor.cycle = row.cycleOld
                  }
                "
                type="text"
                slot="prefix"
                style="padding: 0"
              >
                <i
                  style="font-size: 16px"
                  class="el-icon-close el-input__icon"
                ></i>
              </el-button>
              <el-button
                @click.native="() => handleUpdateSensor('Cycle', row)"
                type="text"
                slot="suffix"
                style="padding: 0"
              >
                <i
                  style="font-size: 16px"
                  class="el-icon-check el-input__icon"
                ></i>
              </el-button>
            </el-input>
          </template>
          <div v-else style="cursor: pointer">
            {{ row.Sensor && row.Sensor.cycle ? row.Sensor.cycle : '-' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="TOffset" width="100" label="温度修正">
        <template slot-scope="{ row }">
          <template v-if="row.tOffsetEditable">
            <el-input v-model="row.Sensor.tOffset" size="mini" placeholder="">
              <el-button
                @click.native="
                  () => {
                    row.tOffsetEditable = false
                    row.Sensor.tOffset = row.tOffsetOld
                  }
                "
                type="text"
                slot="prefix"
                style="padding: 0"
              >
                <i
                  style="font-size: 16px"
                  class="el-icon-close el-input__icon"
                ></i>
              </el-button>
              <el-button
                @click.native="() => handleUpdateSensor('TOffset', row)"
                type="text"
                slot="suffix"
                style="padding: 0"
              >
                <i
                  style="font-size: 16px"
                  class="el-icon-check el-input__icon"
                ></i>
              </el-button>
            </el-input>
          </template>
          <div v-else style="cursor: pointer">
            {{ row.Sensor && row.Sensor.tOffset ? row.Sensor.tOffset : '-' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="HOffset" width="100" label="湿度修正">
        <template slot-scope="{ row }">
          <template v-if="row.hOffsetEditable">
            <el-input v-model="row.Sensor.hOffset" size="mini" placeholder="">
              <el-button
                @click.native="
                  () => {
                    row.hOffsetEditable = false
                    row.Sensor.hOffset = row.hOffsetOld
                  }
                "
                type="text"
                slot="prefix"
                style="padding: 0"
              >
                <i
                  style="font-size: 16px"
                  class="el-icon-close el-input__icon"
                ></i>
              </el-button>
              <el-button
                @click.native="() => handleUpdateSensor('HOffset', row)"
                type="text"
                slot="suffix"
                style="padding: 0"
              >
                <i
                  style="font-size: 16px"
                  class="el-icon-check el-input__icon"
                ></i>
              </el-button>
            </el-input>
          </template>
          <div v-else style="cursor: pointer">
            {{ row.Sensor && row.Sensor.hOffset ? row.Sensor.hOffset : '-' }}
          </div>
        </template>
      </el-table-column>
      <!--      <el-table-column-->
      <!--        prop="Delay"-->
      <!--        width="130"-->
      <!--        label="报警延时/分"-->
      <!--        sortable="custom"-->
      <!--      >-->
      <!--        <template slot-scope="{ row }">-->
      <!--          <template v-if="row.delayEditable">-->
      <!--            <el-input-->
      <!--              v-model.number="row.Sensor.delay"-->
      <!--              size="mini"-->
      <!--              placeholder=""-->
      <!--            >-->
      <!--              <el-button-->
      <!--                @click.native="-->
      <!--                  () => {-->
      <!--                    row.delayEditable = false-->
      <!--                    row.Sensor.delay = row.delayOld-->
      <!--                  }-->
      <!--                "-->
      <!--                type="text"-->
      <!--                slot="prefix"-->
      <!--                style="padding: 0"-->
      <!--              >-->
      <!--                <i-->
      <!--                  style="font-size: 16px"-->
      <!--                  class="el-icon-close el-input__icon"-->
      <!--                ></i>-->
      <!--              </el-button>-->
      <!--              <el-button-->
      <!--                @click.native="() => handleUpdateSensor('Delay', row)"-->
      <!--                type="text"-->
      <!--                slot="suffix"-->
      <!--                style="padding: 0"-->
      <!--              >-->
      <!--                <i-->
      <!--                  style="font-size: 16px"-->
      <!--                  class="el-icon-check el-input__icon"-->
      <!--                ></i>-->
      <!--              </el-button>-->
      <!--            </el-input>-->
      <!--          </template>-->
      <!--          <div v-else style="cursor: pointer">-->
      <!--            {{ null !== row.Sensor.delay ? row.Sensor.delay : '-' }}-->
      <!--          </div>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column
        fixed="right"
        width="130"
        prop="TAlarm"
        label="声光报警开关"
        sortable="custom"
      >
        <template slot-scope="{ row }">
          <el-switch
            v-if="row.Sensor"
            v-model="row.Sensor.tAlarmSwitch"
            @change="() => handleUpdateSensor('TAlarm', row)"
          >
          </el-switch>
          <span v-else></span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="{ row }">
          <el-button
            style="padding: 0;"
            @click.native="() => watchOriginalData(row)"
            type="text"
          >
            查原始数据
          </el-button>
          <el-button
            style="margin-left: 0"
            type="text"
            @click.native="handleWatch(row)"
          >
            查历史数据
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      title="注册传感器"
      :visible.sync="dialogVisible"
      width="450px"
      @close="handleDialogClose"
    >
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        size="medium"
      >
        <el-form-item label="所属项目" prop="project">
          <el-select
            v-model="addForm.project"
            filterable
            placeholder="请选择项目"
            :disabled="platform !== 'DEVICE_CONNECT'"
            clearable
            style="width: 200px;"
          >
            <el-option
              v-for="item in proList"
              :key="item.id"
              :value="item.id"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select
            v-model="addForm.type"
            filterable
            placeholder="请选择类型"
            clearable
            style="width: 200px;"
          >
            <el-option :value="1" label="温度" />
            <el-option :value="2" label="温湿度" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="(no, index) in addForm.nos"
          :key="index"
          :label="'传感器编号'"
          :prop="'nos.' + index + '.value'"
          :rules="{
            required: true,
            message: '传感器编号不能为空',
            trigger: 'blur'
          }"
        >
          <el-input
            v-model="no.value"
            placeholder="请输入传感器编号"
            style="width: 200px;"
          />
          <el-button
            v-if="index !== 0"
            class="btn-danger"
            type="text"
            @click.native="removeInput(index)"
          >
            <i
              class="el-icon-remove"
              style="font-size: 18px;margin-left: 5px;"
            />
          </el-button>
        </el-form-item>
        <el-button
          type="text"
          style="margin-left: 100px;"
          @click.native="addInput"
        >
          <i class="el-icon-plus" />
          新增
        </el-button>
      </el-form>
      <span slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm('addForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <HistoryDialog
      ref="historyDialog"
      :showRelatePointDisabled="true"
      :point-ids="history.point"
    />
    <SingleHistoryDialog
      :type="current.type"
      :id="current.id"
      ref="singleHistoryDialog"
    />
    <OriginalDataTable ref="originalDataTable" />
    <FormEdit
      ref="formEdit"
      :ids="
        multipleSelection.map(t => {
          return t.Tag
        })
      "
      @refresh="fetchSensorList"
    />
  </div>
</template>

<script>
import {
  sensorTagList,
  batchAddSensorTag,
  batchDeleteSensorTag,
  updateSensor,
  importSensorTag
} from '@/api/device_new'
import HistoryDialog from '@/components/HistoryDialog'
import SingleHistoryDialog from '@/components/SingleHistoryDialog'
import OriginalDataTable from './OriginalDataTable'
import FormEdit from './component/FormEdit'

export default {
  name: 'SensorIndex',
  components: {
    HistoryDialog,
    SingleHistoryDialog,
    OriginalDataTable,
    FormEdit
  },
  data() {
    return {
      uploadLoading: false,
      current: {
        id: null,
        type: ''
      },
      filterForm: {
        text: '',
        project: '',
        types: undefined,
        sortType: undefined,
        isAsc: false
      },
      history: {
        point: null
      },
      tableLoading: false,
      multipleSelection: [],
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },

      dialogVisible: false,
      addForm: {
        project: this.$store.state.app.project
          ? this.$store.state.app.project.id
          : '',
        type: '',
        nos: [
          {
            value: ''
          }
        ]
      },
      addFormRules: {
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        project: [{ required: true, message: '请选择项目', trigger: 'change' }]
      },
      statusList: [
        {
          label: '正常',
          value: 0
        },
        {
          label: '测试',
          value: 1
        },
        {
          label: '维修',
          value: 2
        },
        {
          label: '校验',
          value: 3
        },
        {
          label: '封存',
          value: 4
        },
        {
          label: '报废',
          value: 5
        }
      ]
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchSensorList()
    }
  },
  mounted() {
    if (this.platform === 'BUSINESS') {
      this.filterForm.project = this.projectId
    }
    this.fetchSensorList()
  },
  methods: {
    cellDblclick(row, e) {
      console.log(e.property, 'e.property')
      if ('TOffset' === e.property) {
        this.$set(row, 'tOffsetEditable', true)
        this.$set(row, 'tOffsetOld', row.Sensor ? row.Sensor.tOffset : '')
      } else if ('HOffset' === e.property) {
        this.$set(row, 'hOffsetEditable', true)
        this.$set(row, 'hOffsetOld', row.Sensor ? row.Sensor.hOffset : '')
      } else if ('Delay' === e.property) {
        this.$set(row, 'delayEditable', true)
        this.$set(row, 'delayOld', row.Sensor ? row.Sensor.delay : '')
      } else if ('Cycle' === e.property) {
        this.$set(row, 'cycleEditable', true)
        this.$set(row, 'cycleOld', row.Sensor ? row.Sensor.cycle : '')
      }
    },
    handleClickEdit() {
      if (!this.multipleSelection.length)
        return this.$message('请至少选中一项'), false
      this.$refs.formEdit.openDialog()
    },
    handleUpdateSensor(prop, row) {
      let form = null
      let value = ''
      switch (prop) {
        case 'TAlarm':
          form = {
            tAlarm: row.Sensor && row.Sensor.tAlarm === 1 ? 0 : 1
          }
          value = row.Sensor && row.Sensor.tAlarm === 1 ? 0 : 1
          break
        case 'TOffset':
          form = {
            tOffset: row.Sensor.tOffset
          }
          value = row.Sensor.tOffset
          break
        case 'HOffset':
          form = {
            hOffset: row.Sensor.hOffset
          }
          value = row.Sensor.hOffset
          break
        case 'Delay':
          form = {
            delay: row.Sensor.delay
          }
          value = row.Sensor.delay
          break
        case 'Cycle':
          form = {
            cycle: row.Sensor.cycle
          }
          value = row.Sensor.cycle
          break
        default:
          break
      }
      if (
        'TAlarm' !== prop &&
        row.Sensor &&
        !/^[-+]?[0-9]+(\.[0-9]+)?$/.test(value)
      ) {
        this.$message('请输入数字')
        return
      }
      if (prop === 'Cycle') {
        const val = parseInt(row.Sensor.cycle)
        if (val <= 0 || val % 10 !== 0) {
          this.$message('采集间隔是10秒的整数倍')
          return
        }
      }
      if (prop === 'Delay') {
        const val = parseInt(row.Sensor.delay)
        if (val <= 0) {
          this.$message('报警延时是一个大于0的整数')
          return
        }
      }

      updateSensor(
        Object.assign(
          {
            SensorIdList: [row.Tag]
          },
          form
        )
      )
        .then(res => {
          if (200 === res.data.Code)
            if (res.data.Data) {
              this.$message.success('更新成功')
              switch (prop) {
                case 'TOffset':
                  row.tOffsetEditable = false
                  break
                case 'HOffset':
                  row.hOffsetEditable = false
                  break
                case 'Delay':
                  row.delayEditable = false
                  break
                case 'Cycle':
                  row.cycleEditable = false
                  break
                default:
                  break
              }
            } else {
              this.$message.error('更新失败')
            }
          else {
            this.$message.error(res.data.Message)
            this.fetchSensorList()
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('更新失败，请刷新页面')
        })
    },
    watchOriginalData(row) {
      this.$refs.originalDataTable.openDialog(row)
    },
    watchHistoryChart(t, e) {
      this.current.id = t
      this.current.type = e
      this.$refs.singleHistoryDialog.toggleDialog()
    },
    changeAlarm(row) {
      console.log(row)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    changeProject() {
      this.fetchSensorList()
    },
    // 下载样表
    downloadTemplate() {
      window.location.href =
        'https://cdn.sinocold.net/excel_template/%E4%BC%A0%E6%84%9F%E5%99%A8%E6%89%B9%E9%87%8F%E4%B8%8A%E4%BC%A0%E6%A0%B7%E8%A1%A8.xlsx'
    },
    // 上传样表
    uploadExcel(file) {
      this.uploadLoading = true
      const formData = new FormData()
      formData.append('file', file)
      formData.append('companyId', this.companyId)
      importSensorTag(formData)
        .then(res => {
          if (res.data.Code === 200) {
            const desc = res.data.Data.Description
            if (desc.length) {
              let descText = ''
              desc.forEach(item => {
                descText += `
                <div>第${item.ErrTag}行，Message：${item.ErrMessage}</div>
              `
              })
              this.$notify({
                title: '错误提示',
                duration: 10000,
                dangerouslyUseHTMLString: true,
                message: descText
              })
              return false
            } else {
              this.$message.success('导入成功')
            }
            this.fetchSensorList()
          } else {
            this.$message.error('导入失败')
          }
        })
        .catch(err => {
          this.$message.error('导入失败')
          console.error(err)
        })
        .finally(() => {
          this.uploadLoading = false
        })
      return false
    },
    handleRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$confirm('确认要移除选中的传感器', '提示', { type: 'warning' }).then(
        () => {
          batchDeleteSensorTag({
            sensorTagIdList: this.multipleSelection.map(
              item => item.SensorTagId
            )
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('传感器移除成功')
                this.fetchSensorList()
              } else {
                this.$message.error('移除失败')
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
      )
    },
    sortChange(val) {
      this.filterForm.sortType = val.prop
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchSensorList()
    },
    // 传感器表格筛选
    filterChange(filter) {
      if (filter.SensorTagType) {
        this.filterForm.types = filter.SensorTagType
      }
      this.pagination.currentPage = 1
      this.fetchSensorList()
    },
    handleCurrentChange() {
      this.fetchSensorList()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchSensorList()
    },
    handleWatch(row) {
      let ids = []
      if (row.SensorTagType === 2) {
        row.PointList.forEach(item => {
          ids.push(item.PointId)
        })
      } else {
        ids = [row.PointList[0].PointId]
      }
      this.history.point = ids
      this.$refs.historyDialog.toggleDialog()
    },
    removeInput(index) {
      this.addForm.nos.splice(index, 1)
    },
    addInput() {
      this.addForm.nos.push({
        value: ''
      })
    },
    handleDialogClose() {
      // this.addForm.project = ''
      this.addForm.nos = [
        {
          value: ''
        }
      ]
    },
    submitAddForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          batchAddSensorTag({
            projectId: this.addForm.project,
            tagType: this.addForm.type,
            CompanyId: this.companyId,
            tagList: this.addForm.nos.map(item => item.value)
          })
            .then(res => {
              if (res.data.Code === 200) {
                if (res.data.Data.Description.length) {
                  const desc = res.data.Data.Description
                  if (desc.length) {
                    let descText = ''
                    desc.forEach(item => {
                      descText += `
                      <div>${item.ErrTag}，Message：${item.ErrMessage}</div>
                    `
                    })
                    this.$notify({
                      title: '错误提示',
                      duration: 10000,
                      dangerouslyUseHTMLString: true,
                      message: descText
                    })
                  }
                } else {
                  this.$message.success('传感器注册成功')
                }
                this.dialogVisible = false
                this.fetchSensorList()
              } else {
                this.$message.error('传感器注册失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('注册失败')
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    fetchSensorList() {
      this.tableLoading = true
      let SortType = this.filterForm.sortType
      let IsAsc = this.filterForm.isAsc
      let data = {
        projectId: this.filterForm.project || undefined,
        CompanyId: this.companyId,
        SensorTagType: this.filterForm.types,
        Tag: this.filterForm.text,
        PageIndex: this.pagination.currentPage,
        PageSize: this.pagination.size,
        IsAsc,
        SortType
      }
      for (const key in data) {
        if (
          data[key] === '' ||
          (typeof data[key] === 'object' && data[key].length === 0)
        ) {
          delete data[key]
        }
      }
      sensorTagList(data)
        .then(res => {
          if (res.data.Code === 200) {
            let list = res.data.Data.Data
            list.map(item => {
              if (item.Sensor) {
                item.Sensor.tAlarmSwitch =
                  item.Sensor.tAlarm === 1 ? true : false
              } else {
                item.Sensor = {
                  id: '',
                  name: '',
                  tValue: '',
                  tOffset: '',
                  hValue: '',
                  hOffset: '',
                  rssi: '',
                  voltage: '',
                  battery: '',
                  cycle: '',
                  cTime: '',
                  rTime: '',
                  uTime: '',
                  mac: '',
                  tMin: '',
                  tMax: '',
                  tAlarm: '',
                  delay: '',
                  status: ''
                }
              }
            })
            if ((SortType === 'rTime' || SortType === 'uTime') && !IsAsc) {
              list.reverse()
            }
            this.tableData = list
            this.pagination.total = res.data.Data.TotalCount
          } else {
            this.$message.error('传感器列表获取失败')
          }
        })
        .catch(err => {
          this.$message.error('传感器列表获取失败')
          console.error(err)
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.sensor-manage {
  background-color: #fff;
  border-radius: 4px;
}
</style>

<style lang="scss">
.sensor-manage {
  .el-dialog__footer {
    text-align: right;
  }
}
</style>
