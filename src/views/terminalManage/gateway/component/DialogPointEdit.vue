<template>
  <el-dialog
    :title="module_.id ? '编辑从站设备' : '创建从站设备'"
    :visible.sync="dialogVisible"
    width="100%"
    top="15vh"
    :append-to-body="true"
    custom-class="point-edit-dialog"
    @close="dialogClose"
  >
    <div v-loading="tableLoading" element-loading-text="加载中...">
      <el-row :gutter="30">
        <el-col>
          <div style="margin-bottom: 20px;" class="clearfix">
            <span
              ><span style="color: #F56C6C;">*&nbsp;</span
              >从站设备名称：&nbsp;&nbsp;</span
            >
            <el-input
              v-model.trim="module_.name"
              placeholder="请输入"
              size="small"
              clearable
              style="width: 160px;"
            />
            <span style="margin-left: 15px;">波特率：&nbsp;&nbsp;</span>
            <el-select
              filterable
              style="width: 90px"
              clearable
              v-model="module_.baudRate"
              size="small"
              placeholder=""
            >
              <el-option
                v-for="item in baudRateOptions"
                :key="item.Value"
                :label="item.Value"
                :value="item.Value"
              >
              </el-option>
            </el-select>
            <span style="margin-left: 15px;">数据位：&nbsp;&nbsp;</span>
            <el-select
              filterable
              style="width:65px"
              clearable
              v-model="module_.dataBit"
              size="small"
              placeholder=""
            >
              <el-option
                v-for="item in dataBitOptions"
                :key="item.Key"
                :label="item.Value"
                :value="item.Key"
              >
              </el-option>
            </el-select>
            <span style="margin-left: 15px;">校验位：&nbsp;&nbsp;</span>
            <el-select
              filterable
              style="width: 65px"
              clearable
              v-model="module_.checkBit"
              size="small"
              placeholder=""
            >
              <el-option
                v-for="item in checkBitOptions"
                :key="item.Key"
                :label="item.Value"
                :value="item.Key"
              >
              </el-option>
            </el-select>
            <span style="margin-left: 15px;">停止位：&nbsp;&nbsp;</span>
            <el-select
              filterable
              style="width: 75px"
              clearable
              v-model="module_.stopBit"
              size="small"
              placeholder=""
            >
              <el-option
                v-for="item in stopBitOptions"
                :key="item.Key"
                :label="item.Value"
                :value="item.Key"
              >
              </el-option>
            </el-select>
            <span style="margin-left: 15px;">所属品类：&nbsp;&nbsp;</span>
            <el-cascader
              size="small"
              v-model="module_.deviceType"
              clearable
              filterable
              :options="monitroTypeOptions"
              :props="{
                value: 'ID',
                label: 'TypeName',
                children: 'subset'
              }"
            />
            <div style="float: right;">
              <el-tooltip
                placement="top"
                effect="light"
                content="在点位列表中添加一行"
              >
                <el-button
                  size="small"
                  @click.native="() => $refs.tablePointEdit.addNewRow()"
                >
                  新增点位
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
                    style="color:#409EFF;"
                    @click="downloadTemplate"
                    >样式表下载<c-svg name="download"
                  /></a>
                </div>
                <el-upload
                  action="123"
                  :show-file-list="false"
                  accept=".xlsx"
                  :before-upload="
                    file => $refs.tablePointEdit.uploadExcel(file)
                  "
                >
                  <el-button size="small" style="margin: 0 10px;">
                    导入点位
                  </el-button>
                </el-upload>
              </el-tooltip>
              <el-tooltip
                placement="top"
                effect="light"
                content="将点位列表导出成 Excel"
              >
                <el-button
                  size="small"
                  @click.native="() => $refs.tablePointEdit.exportExcel()"
                >
                  导出为表格
                </el-button>
              </el-tooltip>
              <el-dropdown trigger="click" style="margin-left: 10px;">
                <el-button size="small">
                  批量操作<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    @click.native="() => $refs.tablePointEdit.batchPaste()"
                  >
                    批量复制
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click.native="() => $refs.tablePointEdit.batchDel()"
                  >
                    批量删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <TablePointEdit ref="tablePointEdit" :point-list="pointList" />
        </el-col>
      </el-row>
    </div>
    <span slot="footer">
      <el-button
        @click.native="() => $refs.tablePointEdit.handleCheckData()"
        size="medium"
        >数据校验</el-button
      >
      <el-button
        :loading="submitLoading"
        type="primary"
        size="medium"
        @click.native="submit"
        >确定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import {
  addOrUpdateDeviceModule,
  getDeviceModulePointList,
  getDeviceModulePage
} from '@/api/deviceModule'
import { getDeviceNumRule } from '@/api/device_new'
import TablePointEdit from './TablePointEdit'
import { Decrypt } from '@/utils/secret'
import { monitorTypeList } from '@/api/monitorTypeProject'

export default {
  components: {
    TablePointEdit
  },
  data() {
    return {
      tableLoading: false,
      dialogVisible: false,
      module_: {
        name: '',
        deviceType: [],
        dataBit: undefined,
        stopBit: undefined,
        baudRate: undefined,
        checkBit: undefined,
        id: ''
      },
      multipleSelection: [],
      pointList: [], // 所有的点位
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20
      },
      dataBitOptions: [],
      stopBitOptions: [],
      baudRateOptions: [],
      checkBitOptions: [],
      monitroTypeOptions: [], //所属品类列表
      submitLoading: false
    }
  },
  computed: {
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  mounted() {
    this.fetchMonitorTypeOption()
    getDeviceNumRule({
      deviceTypeList: ['BaudRate', 'CheckBit', 'StopBit', 'DataBit']
    }).then(res => {
      if (res.data.Code === 200) {
        const data = res.data.Data
        this.baudRateOptions = data.BaudRate
        this.checkBitOptions = data.CheckBit
        this.dataBitOptions = data.DataBit.map(v => {
          v.Key = parseInt(v.Key)
          return v
        })
        this.stopBitOptions = data.StopBit
      }
    })
  },
  methods: {
    // 编辑会转设备id,新增不会
    openDialog(moduleInfo) {
      this.dialogVisible = true
      if (moduleInfo) {
        this.module_.id = moduleInfo.id
        this.fetchBasicInfo()
        this.tableLoading = false
        getDeviceModulePointList({
          deviceModuleId: moduleInfo.id,
          isGetAll: true
        })
          .then(res => {
            if (res.data.Code == 200) {
              this.pointList = JSON.parse(Decrypt(res.data.Data))
            } else {
              this.$message.error('从站设备点位获取失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('从站设备点位获取失败')
          })
          .finally(() => {
            this.tableLoading = false
          })
      }
    },
    dialogClose() {
      this.dialogVisible = false
      this.module_.id = ''
      this.module_.name = ''
      this.module_.deviceType = []
      this.module_.baudRate = undefined
      this.module_.checkBit = undefined
      this.module_.stopBit = undefined
      this.module_.dataBit = undefined
      this.$refs.tablePointEdit.reset()
    },
    // 下载模板
    downloadTemplate() {
      window.open(
        'https://front-end-assets.oss-cn-shanghai.aliyuncs.com/excel_template/%E6%A8%A1%E5%9D%97%E6%A8%A1%E7%89%88.xlsx',
        '_blank'
      )
    },
    // 提交点位数据
    submit() {
      if (!this.module_.name) {
        this.$message('请输入设备名称')
        return false
      }
      const pointList = this.$refs.tablePointEdit.submit()
      if (!pointList) {
        return
      }
      this.submitLoading = true
      const {
        id,
        name,
        dataBit,
        stopBit,
        checkBit,
        baudRate,
        deviceType
      } = this.module_
      addOrUpdateDeviceModule({
        DeviceModuleId: id || undefined,
        UserId: this.userId,
        DeviceModuleName: name,
        SmallTypeId: deviceType.length ? deviceType[2] : undefined,
        PointNum: pointList.length,
        BaudRate: baudRate,
        DataBit: dataBit,
        CheckBit: checkBit,
        StopBit: stopBit,
        DeviceModulePointList: pointList
      })
        .then(res => {
          if (res.data.Code === 200 && res.data.Data > 0) {
            this.$message.success(id ? '编辑成功' : '添加成功')
            this.dialogVisible = false
            this.$emit('refresh')
          } else {
            this.$message.error(res.data.Message)
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error(id ? '编辑失败' : '添加失败')
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    fetchBasicInfo() {
      getDeviceModulePage({
        DeviceModuleId: this.module_.id,
        DeviceModuleName: undefined,
        SortType: undefined,
        IsAsc: undefined,
        pageIndex: undefined,
        pageSize: undefined
      })
        .then(res => {
          if (res.data.Code == 200) {
            const moduleInfo = res.data.Data.Data[0]
            this.module_.baudRate = moduleInfo.BaudRate
            this.module_.dataBit = moduleInfo.DataBit
            this.module_.checkBit = moduleInfo.CheckBit
            this.module_.stopBit = moduleInfo.StopBit
            this.module_.name = moduleInfo.DeviceModuleName
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    async fetchMonitorTypeOption() {
      let monitroTypeOptions = [
        {
          ID: 1,
          TypeName: '冷链',
          subset: []
        },
        {
          ID: 2,
          TypeName: '商超',
          subset: []
        },
        {
          ID: 3,
          TypeName: '养殖业',
          subset: []
        },
        {
          ID: 4,
          TypeName: '文物监测',
          subset: []
        }
      ]
      await Promise.all([
        monitorTypeList({
          industry: 1
        }),
        monitorTypeList({
          industry: 2
        }),
        monitorTypeList({
          industry: 3
        }),
        monitorTypeList({
          industry: 4
        })
      ])
        .then(([res1, res2, res3, res4]) => {
          if (res1.data.Code === 200) {
            monitroTypeOptions[0].subset = res1.data.Data.subset
          }
          if (res2.data.Code === 200) {
            monitroTypeOptions[1].subset = res2.data.Data.subset
          }
          if (res3.data.Code === 200) {
            monitroTypeOptions[2].subset = res3.data.Data.subset
          }
          if (res4.data.Code === 200) {
            monitroTypeOptions[3].subset = res4.data.Data.subset
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取所属品类列表失败')
        })
        .finally(() => {
          this.monitroTypeOptions = monitroTypeOptions
        })
    }
  }
}
</script>

<style lang="scss">
.point-edit-dialog {
  max-width: 1700px !important;
}
</style>
