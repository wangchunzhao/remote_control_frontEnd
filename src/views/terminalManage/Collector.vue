<template>
  <div class="sensor-manage content-box">
    <div style="margin-bottom: 16px;">
      <el-button
        type="primary"
        size="small"
        v-permission="[platform === 'DEVICE_CONNECT' ? 92 : 71]"
        icon="el-icon-plus"
        @click.native="addFormDialogVisible = true"
      >
        注册
      </el-button>
      <el-button
        v-permission="[platform === 'DEVICE_CONNECT' ? 93 : 72]"
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
        style="margin-left: 10px;"
        v-if="platform === 'DEVICE_CONNECT'"
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
        placeholder="查找序列号/车牌号"
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
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="序列号"
        sortable="custom"
        prop="CollectorNumber"
      />
      <el-table-column
        label="类型"
        column-key="CollectorType"
        prop="CollectorType"
        :filters="[
          { text: '4G', value: 1 },
          { text: 'WiFi', value: 2 },
          { text: '以太网', value: 3 },
          { text: '有线-2T', value: 4 },
          { text: '有线-3T', value: 5 }
        ]"
      >
        <template slot-scope="{ row }">
          <!-- 1.4G 2.WiFi 3.以太网 4.有线-2T 5.有线-3T -->
          {{
            row.CollectorType === 1
              ? '4G'
              : row.CollectorType === 2
              ? 'WiFi'
              : row.CollectorType === 3
              ? '以太网'
              : row.CollectorType === 4
              ? '有线-2T'
              : row.CollectorType === 5
              ? '有线-3T'
              : '-'
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="是否定位"
        prop="ISGps"
        column-key="ISGps"
        :filters="[{ text: '否', value: 0 }, { text: '是', value: 1 }]"
      >
        <template slot-scope="{ row }">
          {{ row.ISGps === 0 ? '否' : '是' }}
        </template>
      </el-table-column>
      <el-table-column width="80" prop="isOnline" label="状态">
        <template slot-scope="{ row }">
          <el-tag size="small" :type="row.isOnline === 1 ? 'primary' : 'info'">
            {{ row.isOnline === 1 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="所属项目" prop="projectName" />
      <el-table-column label="绑定车辆" prop="MName" />
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button
            v-permission="[platform === 'DEVICE_CONNECT' ? 94 : 73]"
            type="text"
            @click.native="clickBindCard(row)"
          >
            绑定车辆
          </el-button>
          <el-button
            type="text"
            @click.native="
              $router.push({
                name: 'terminalTrack',
                query: {
                  serviceId: row.ServiceID,
                  entityName: row.CollectorNumber
                }
              })
            "
          >
            查轨迹
          </el-button>
          <!-- 有线-2T 有线-3T才能查看数据  -->
          <el-button
            v-if="[4, 5].includes(row.CollectorType)"
            type="text"
            @click.native="checkHistory(row)"
          >
            查看数据
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
      title="注册采集器"
      :visible.sync="addFormDialogVisible"
      width="570px"
      @close="handleDialogClose"
    >
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        size="medium"
        inline
      >
        <div>
          <el-form-item label="所属项目" prop="project">
            <el-select
              v-model="addForm.project"
              filterable
              :disabled="platform !== 'DEVICE_CONNECT'"
              placeholder="请选择项目"
              clearable
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
        </div>
        <div>
          <el-form-item label="类型" prop="type">
            <el-select
              v-model="addForm.type"
              filterable
              placeholder="请选择类型"
              clearable
              style="width: 180px;"
            >
              <!-- 1.4G 2.WiFi 3.以太网 4.有线-2T 5.有线-3T -->
              <el-option :value="1" label="4G" />
              <el-option :value="2" label="WiFi" />
              <el-option :value="3" label="以太网" />
              <el-option :value="4" label="有线-2T" />
              <el-option :value="5" label="有线-3T" />
            </el-select>
          </el-form-item>
        </div>

        <div v-for="(item, index) in addForm.items" :key="index">
          <el-form-item
            :label="'采集器' + (index + 1)"
            :prop="'items.' + index + '.no'"
            :rules="{
              validator: validateNo,
              trigger: 'blur'
            }"
          >
            <el-input
              v-model="item.no"
              placeholder="请输入采集器编号"
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
          @click.native="addInput"
        >
          <i class="el-icon-plus" />
          新增
        </el-button>
      </el-form>
      <span slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button size="medium" @click="addFormDialogVisible = false"
          >取 消</el-button
        >
        <el-button
          size="medium"
          type="primary"
          @click="submitAddForm('addForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog title="通讯卡信息" :visible.sync="trafficDialog" width="1000px;">
      <TrafficManage
        :sim="currentCollector.sim"
        :collector-id="currentCollector.id"
        @bind-complete="fetchTableData()"
      />
    </el-dialog>
    <el-dialog
      :visible.sync="bindCarDialogVisible"
      width="500px"
      title="绑定车辆"
      top="22vh"
      @close="handleBindCarDialogClose"
    >
      <el-form
        ref="bindCarForm"
        :model="bindCarForm"
        label-width="100px"
        size="medium"
      >
        <el-form-item
          label="车牌号"
          prop="car"
          :rules="{
            required: true,
            message: '车牌号不能为空',
            trigger: 'blur'
          }"
        >
          <el-select
            v-model="bindCarForm.car"
            filterable
            allow-create
            default-first-option
            :placeholder="currentCollector.MName || '请选择车牌号'"
          >
            <el-option
              v-for="item in carOptions"
              :key="item.id"
              :label="item.mname"
              :value="item.id"
            />
          </el-select>
          <el-tooltip placement="top" content="输入车牌号并提交即可新增车辆">
            <c-svg name="what" style="font-size: 18px;margin-left: 18px;" />
          </el-tooltip>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button
          v-if="currentCollector.MName"
          type="danger"
          size="medium"
          :loading="unBindLoading"
          @click="unBind"
          >解除绑定</el-button
        >
        <el-button
          size="medium"
          :loading="bindLoading"
          type="primary"
          @click="submitBindCarForm('bindCarForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <history-dialog
      ref="historyDialog"
      :showRelatePointDisabled="true"
      :point-ids="pointList"
    />
  </div>
</template>

<script>
import {
  batchAddCollector,
  collectorIsExists,
  getCollectorIsBinding,
  collectorBinding,
  collectorList,
  collectorUntying,
  batchDeleteCollector
} from '@/api/collector'
import TrafficManage from './component/TrafficManage'

export default {
  name: 'CollectorIndex',
  components: {
    TrafficManage
  },
  data() {
    const validateNo = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入编号'))
      } else {
        collectorIsExists({
          collectorNumber: value
        })
          .then(res => {
            if (res.data.Data.IsExist) {
              callback(new Error('该编号已被使用'))
            } else {
              callback()
            }
          })
          .catch(err => {
            console.error(err)
            callback()
          })
      }
    }
    return {
      filterForm: {
        text: '',
        project: '',
        collectorType: [],
        isGps: [],
        sortProp: undefined,
        isAsc: false
      },
      filter: '',
      projectFilter: '',
      tableLoading: false,
      multipleSelection: [],
      tableData: [],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },

      addFormDialogVisible: false,
      addForm: {
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
      addFormRules: {
        project: [{ required: true, message: '请选择项目', trigger: 'change' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      },
      validateNo,

      trafficDialog: false,

      currentCollector: {
        id: '',
        projectId: this.$store.state.app.project
          ? this.$store.state.app.project.id
          : '',
        sim: '',
        MName: ''
      },
      unBindLoading: false,
      bindLoading: false,
      bindCarDialogVisible: false,
      bindCarForm: {
        car: ''
      },
      carOptions: [],

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
    userId() {
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
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  mounted() {
    if (this.platform === 'BUSINESS') {
      this.filterForm.project = this.projectId
    }
    this.fetchTableData()
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 表格筛选-修改项目
    changeProject() {
      this.fetchTableData()
    },
    unBind() {
      this.$confirm('确认要解除绑定的车辆吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.unBindLoading = true
          collectorUntying({
            CollectorID: this.currentCollector.id
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('解绑成功')
                this.bindCarDialogVisible = false
                this.fetchTableData()
              } else {
                this.$message.success('解绑失败')
              }
            })
            .catch(() => {
              this.$message.success('解绑失败')
            })
            .finally(() => {
              this.unBindLoading = false
            })
        })
        .catch(() => {})
    },
    handleRemove() {
      if (!this.multipleSelection.length) {
        this.$message('请至少选中一项')
        return false
      }
      this.$confirm('确认要移除选中的采集器', '提示', { type: 'warning' }).then(
        () => {
          batchDeleteCollector({
            collectorIDList: this.multipleSelection.map(
              item => item.CollectorID
            )
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('采集器移除成功')
                this.fetchTableData()
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
    checkHistory(row) {
      if (!row.PointList.length) {
        this.$message('采集器下没有点位，无法查看')
        return
      }
      this.pointList = row.PointList.map(v => v.Key)
      this.$refs.historyDialog.toggleDialog()
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'CollectorNumber') {
        this.filterForm.sortProp = 0
      } else if (val.prop === 'isOnline') {
        this.filterForm.sortProp = undefined
      } else {
        this.filterForm.sortProp = undefined
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.CollectorType) {
        this.filterForm.collectorType = filter.CollectorType
      } else if (filter.ISGps) {
        this.filterForm.isGps = filter.ISGps
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    removeInput(index) {
      this.addForm.items.splice(index, 1)
    },
    addInput() {
      this.addForm.items.push({
        communicationCard: '',
        no: ''
      })
    },
    // 新增采集器弹窗关闭
    handleDialogClose() {
      // this.addForm.project = ''
      this.addForm.type = ''
      this.addForm.items = [
        {
          communicationCard: '',
          no: ''
        }
      ]
    },
    // 新增采集器
    submitAddForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const CollectorNumberList = []
          this.addForm.items.forEach(item => {
            CollectorNumberList.push({
              CollectorNumber: item.no,
              CollectorSIM: item.communicationCard
            })
          })
          batchAddCollector({
            ProjectId: this.addForm.project,
            CollectorType: this.addForm.type,
            CollectorNumberList
          })
            .then(res => {
              if (res.data.Code === 200) {
                if (res.data.Data.Description.length) {
                  this.$message('部分采集器注册失败，采集器没有点位')
                } else {
                  this.$message.success('采集器注册成功')
                }
                this.addFormDialogVisible = false
                this.fetchTableData()
              } else {
                this.$message.error('采集器注册失败')
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
    clickTrafficQuery(row) {
      this.currentCollector = {
        id: row.CollectorID,
        projectId: row.projectId,
        sim: row.collectorSIM
      }
      this.trafficDialog = true
    },
    // 点击表格中的修改绑定车辆按钮
    clickBindCard(row) {
      getCollectorIsBinding({
        projectID: row.projectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.carOptions = res.data.Data
          } else {
            this.carOptions = []
          }
        })
        .catch(err => {
          console.error(err)
          this.carOptions = []
        })
      this.currentCollector = {
        id: row.CollectorID,
        projectId: row.projectId,
        sim: row.collectorSIM,
        MName: row.MName
      }
      this.bindCarDialogVisible = true
    },
    handleBindCarDialogClose() {
      this.bindCarForm = {
        carNumber: ''
      }
    },
    // 绑定车牌号
    submitBindCarForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const { car } = this.bindCarForm
          this.bindLoading = true
          collectorBinding({
            CollectorID: this.currentCollector.id,
            mtid: typeof car === 'number' ? car : undefined,
            ProjectId: this.currentCollector.projectId,
            NumberPlates: typeof car === 'string' ? car : undefined
          })
            .then(res => {
              if (res.data.Code === 200) {
                this.$message.success('车辆绑定成功')
                this.bindCarDialogVisible = false
                this.fetchTableData()
              } else {
                this.$message.error('车辆绑定失败')
              }
            })
            .catch(err => {
              this.$message.error('车辆绑定失败')
              console.error(err)
            })
            .finally(() => {
              this.bindLoading = false
            })
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    fetchTableData() {
      this.tableLoading = true
      collectorList({
        CollectorNumber: this.filterForm.text,
        projectId: this.filterForm.project || undefined,
        collectorType: this.filterForm.collectorType.join(','),
        isgps: this.filterForm.isGps.join(','),
        userID: this.userId,
        companyId: this.companyId,
        SortType: this.filterForm.sortProp,
        IsAsc: this.filterForm.isAsc,
        PageIndex: this.pagination.currentPage,
        PageSize: this.pagination.size
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.tableData = res.data.Data.Data
            this.pagination.total = res.data.Data.TotalCount
          } else {
            this.$message.error('采集器列表获取失败')
          }
        })
        .catch(err => {
          this.$message.error('采集器列表获取失败')
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
