<template>
  <div class="recorder-manage content-box">
    <div style="margin-bottom: 16px;">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        v-permission="[platform === 'DEVICE_CONNECT' ? 89 : 68]"
        @click.native="registerDialog = true"
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
          v-permission="[platform === 'DEVICE_CONNECT' ? 89 : 68]"
          :before-upload="uploadExcel"
        >
          <el-button
            :loading="uploadLoading"
            size="small"
            style="margin: 0 10px;"
          >
            批量导入
          </el-button>
        </el-upload>
      </el-tooltip>
      <el-button
        v-permission="[platform === 'DEVICE_CONNECT' ? 90 : 69]"
        type="danger"
        size="small"
        @click.native="handleRemove"
      >
        从项目中移除
      </el-button>
      <el-select
        v-model="filterForm.projectId"
        placeholder="请选择项目"
        v-if="platform === 'DEVICE_CONNECT'"
        size="small"
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
        v-model="filterForm.terminalNumber"
        size="small"
        clearable
        placeholder="查找序列号"
        style="width: 200px;float: right;"
        suffix-icon="el-icon-search"
      />
    </div>
    <el-table
      v-loading="tableLoading"
      :data="terminalData"
      style="width:100%"
      element-loading-text="加载中..."
      @selection-change="val => (multipleSelection = val)"
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="terminalNumber"
        min-width="120"
        label="序列号"
        sortable="custom"
      />
      <el-table-column
        prop="terminalType"
        label="类型"
        min-width="50"
        column-key="terminalType"
        :filters="[{ text: 'T', value: 1 }, { text: 'T/H', value: 2 }]"
      >
        <template slot-scope="{ row }">
          <span>{{ row.terminalType === 1 ? 'T' : 'T/H' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="连接状态"
        min-width="80"
        column-key="status"
        :filters="[{ text: '在线', value: 2 }, { text: '离线', value: 1 }]"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status === 2 ? 'success' : 'info'"
            size="small"
          >
            {{ scope.row.status === 2 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        min-width="50"
        prop="amount"
        label="电量"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.amount + '%' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="50"
        prop="temperature"
        label="温度"
        sortable="custom"
      >
        <template slot-scope="{ row }">
          {{ row.temperature + '℃' }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="50"
        prop="humidity"
        label="湿度"
        sortable="custom"
      >
        <template slot-scope="{ row }">
          {{ row.terminalType === 2 ? row.humidity + '%' : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="update_time"
        label="数据更新时间"
        min-width="90"
        sortable="custom"
      />
      <el-table-column prop="projectName" min-width="90" label="所属项目" />
      <el-table-column label="操作" width="180">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="checkHistory(row)">
            查数据
          </el-button>
          <el-button
            type="text"
            @click.native="
              $router.push({
                name: 'terminalTrack',
                query: {
                  serviceId: row.ServiceID,
                  entityName: row.terminalNumber
                }
              })
            "
          >
            查轨迹
          </el-button>
          <el-button type="text" @click.native="clickTrafficQuery(row)">
            查流量
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        background
        :current-page.sync="filterForm.pagesize"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="filterForm.show_number"
        layout="total, sizes, prev, pager, next, jumper"
        :total="terminaltableTotal"
        @size-change="handletermSizeChange"
        @current-change="handletermCurrentChange"
      />
    </div>
    <el-dialog
      :visible.sync="registerDialog"
      title="注册记录仪"
      width="570px"
      :show-close="false"
      @closed="closeregisterDialog"
    >
      <el-form
        ref="registerForm"
        :model="registerForm"
        label-width="100px"
        size="medium"
        inline
        :rules="registerterminalRules"
      >
        <el-form-item label="所属项目" prop="project">
          <el-select
            v-model="registerForm.project"
            filterable
            placeholder="请选择"
            :disabled="platform !== 'DEVICE_CONNECT'"
            style="width: 180px;"
          >
            <el-option
              v-for="item in proList"
              :key="item.id"
              :value="item.id"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <div>
          <el-form-item label="类型" prop="type">
            <el-select
              v-model="registerForm.type"
              filterable
              placeholder="请选择类型"
              clearable
              style="width: 180px;"
            >
              <el-option :value="1" label="温度" />
              <el-option :value="2" label="温湿度" />
            </el-select>
          </el-form-item>
        </div>

        <div v-for="(item, index) in registerForm.items" :key="index">
          <el-form-item
            :label="'记录仪' + (index + 1)"
            :prop="'items.' + index + '.no'"
            :rules="{ validator: checkterminalNum, trigger: 'blur' }"
          >
            <el-input
              v-model.trim="item.no"
              placeholder="请输入记录仪序列号"
              style="width: 180px;"
            />
          </el-form-item>
          <el-form-item :prop="'items.' + index + '.communicationCard'">
            <el-input
              v-model="item.communicationCard"
              placeholder="请输入通讯卡号（选填）"
              style="width: 180px;"
            />
            <el-button
              v-if="index !== 0"
              class="btn-danger"
              type="text"
              style="padding: 6px;"
              @click.native="removeInput(index)"
            >
              <i
                class="el-icon-remove"
                style="font-size: 18px;margin-left: 5px;"
              />
            </el-button>
          </el-form-item>
        </div>
        <el-button
          type="text"
          style="margin-left: 100px;"
          @click.native="addformItem"
        >
          <i class="el-icon-plus" />
          新增
        </el-button>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="registerDialog = false"
          >取 消</el-button
        >
        <el-button size="medium" type="primary" @click="registerTerminal"
          >注册</el-button
        >
      </span>
    </el-dialog>
    <el-dialog title="通讯卡信息" :visible.sync="trafficDialog" width="1000px;">
      <TrafficManage
        :sim="currentRecord.sim"
        :record-id="currentRecord.id"
        @bind-complete="fetchTerminalList()"
      />
    </el-dialog>
    <HistoryDialog
      ref="historyDialog"
      :showRelatePointDisabled="true"
      :point-ids="pointList"
    />
  </div>
</template>

<script>
import HistoryDialog from '@/components/HistoryDialog'
import TrafficManage from './component/TrafficManage'
import {
  batchDeleteTerminal,
  getTerminalList,
  batchAddTerminal,
  terminalIsExists,
  importTerminal
} from '@/api/terminal'

export default {
  name: 'RecorderIndex',
  components: {
    HistoryDialog,
    TrafficManage
  },
  data() {
    return {
      uploadLoading: false,
      filterForm: {
        projectId: undefined,
        status: 0,
        types: undefined,
        terminalNumber: '',
        pagesize: 1,
        show_number: 10,
        sortProp: undefined,
        isAsc: undefined
      },
      terminaltableTotal: 0,
      multipleSelection: [],

      trafficDialog: false,
      currentRecord: {
        sim: '',
        id: ''
      },

      tableLoading: false,
      terminalData: [],
      registerDialog: false,
      registerForm: {
        project: this.$store.state.app.project
          ? this.$store.state.app.project.id
          : '',
        type: '',
        items: [
          {
            no: '',
            communicationCard: ''
          }
        ]
      },
      registerterminalRules: {
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        project: [{ required: true, message: '请选择项目', trigger: 'change' }]
      },
      pointList: null
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    },
    companyId() {
      return this.$store.state.app.company.id
    },
    userID() {
      return this.$store.state.app.userInfo.uid
    },
    projectId() {
      return this.$store.state.app.project.id
    },
    platform() {
      return this.$store.state.permissions.platform
    }
  },
  watch: {
    'filterForm.terminalNumber': function() {
      this.fetchTerminalList()
    }
  },
  mounted() {
    if (this.platform === 'BUSINESS') {
      this.filterForm.projectId = this.projectId
    }
    this.fetchTerminalList()
  },
  methods: {
    sortChange(val) {
      // 0:更新时间 1:序列号 2:电量 3:温度 4:湿度
      if (val.prop === 'update_time') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'terminalNumber') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'amount') {
        this.filterForm.sortProp = 2
      } else if (val.prop === 'temperature') {
        this.filterForm.sortProp = 3
      } else if (val.prop === 'humidity') {
        this.filterForm.sortProp = 4
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTerminalList()
    },
    filterChange(filter) {
      if (filter.status) {
        if (filter.status.length === 2 || filter.status.length === 0) {
          // 说明选了在线和离线 或点击了重置
          this.filterForm.status = 0
        } else {
          this.filterForm.status = filter.status[0]
        }
      } else if (filter.terminalType) {
        this.filterForm.types = filter.terminalType
      }
      this.fetchTerminalList()
    },
    // 下载样表
    downloadTemplate() {
      window.location.href =
        'https://cdn.sinocold.net/excel_template/%E8%AE%B0%E5%BD%95%E4%BB%AA%E6%89%B9%E9%87%8F%E4%B8%8A%E4%BC%A0%E6%A0%B7%E8%A1%A8.xlsx'
    },
    // 批量上传
    uploadExcel(file) {
      this.uploadLoading = true
      const formData = new FormData()
      formData.append('file', file)
      importTerminal(formData)
        .then(res => {
          if (res.data.Code === 200) {
            const desc = res.data.Data.Description
            if (desc.length) {
              let descText = ''
              desc.forEach(item => {
                descText += `
                <div>第${item.ErrKey}行，Message：${item.ErrMessage}</div>
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
            this.fetchTerminalList()
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
    changeProject() {
      this.fetchTerminalList()
    },
    handleRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$confirm('确认要移除选中的记录仪', '提示', { type: 'warning' }).then(
        () => {
          batchDeleteTerminal({
            terminalIDList: this.multipleSelection.map(item => item.terminalID)
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('移除成功')
                this.fetchTerminalList()
              } else {
                this.$message.error('移除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('移除失败')
            })
        }
      )
    },
    fetchTerminalList() {
      this.tableLoading = true
      const {
        projectId,
        status,
        terminalNumber,
        pagesize,
        show_number,
        sortProp,
        isAsc,
        types
      } = this.filterForm
      getTerminalList({
        projectId: projectId || undefined,
        status,
        terminalNumber,
        terminalType: types && types.join(','),
        PageIndex: pagesize,
        PageSize: show_number,
        SortType: sortProp,
        IsAsc: isAsc,
        companyId: this.companyId,
        userID: this.userID
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.terminalData = data.Data
            this.terminaltableTotal = data.TotalCount
          } else {
            this.$message.error('列表加载失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('列表加载失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    closeregisterDialog() {
      this.$refs['registerForm'].resetFields()
      this.registerForm.items = [
        {
          no: '',
          communicationCard: ''
        }
      ]
    },
    registerTerminal() {
      this.$refs['registerForm'].validate(valid => {
        if (valid) {
          const obj = {}
          obj.projectId = this.registerForm.project
          let TerminalNumberList = []
          this.registerForm.items.forEach(item => {
            TerminalNumberList.push({
              TerminalNumber: item.no,
              TerminalSIM: item.communicationCard
            })
          })
          batchAddTerminal({
            ProjectId: obj.projectId,
            TerminalType: this.registerForm.type,
            TerminalNumberList
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('注册终端成功')
                this.fetchTerminalList()
              } else {
                this.$message.error('注册失败')
              }
              this.registerDialog = false
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
    checkterminalNum(rule, value, callback) {
      const reg = /^[a-zA-Z0-9]+$/
      if (!value) {
        return callback(new Error('请输入终端编号'))
      } else if (!reg.test(value)) {
        return callback(new Error('请输入正确的终端编号'))
      } else {
        terminalIsExists({
          terminalNumber: value
        })
          .then(res => {
            if (!res.data.Data.IsExist) {
              callback()
            } else {
              callback(new Error('该终端编号已存在'))
            }
          })
          .catch(err => {
            console.error(err)
            callback(new Error('该终端编号已存在'))
          })
      }
    },
    removeInput(index) {
      this.registerForm.items.splice(index, 1)
    },
    addformItem() {
      this.registerForm.items.push({
        no: '',
        communicationCard: ''
      })
    },
    handletermSizeChange(val) {
      this.filterForm.show_number = val
      this.fetchTerminalList()
    },
    handletermCurrentChange(val) {
      this.filterForm.pagesize = val
      this.fetchTerminalList()
    },

    clickTrafficQuery(row) {
      this.currentRecord = {
        id: row.terminalID,
        sim: row.TerminalSIM
      }
      this.trafficDialog = true
    },

    checkHistory(row) {
      if (row.terminalType === 1) {
        this.pointList = [row.tpointID]
      } else {
        this.pointList = [row.hpointID, row.tpointID]
      }
      this.$refs.historyDialog.toggleDialog()
    }
  }
}
</script>

<style lang="scss">
.recorder-manage {
  background-color: #fff;
}
</style>
