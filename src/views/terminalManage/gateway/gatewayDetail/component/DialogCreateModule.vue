<template>
  <el-dialog
    width="100%"
    title="创建从站设备"
    :visible.sync="dialogVisible"
    @close="handleClose"
    :close-on-press-escape="false"
    :before-close="handleBeforeClose"
    custom-class="dialog-create-module_JKFSDKJSDHNFL"
  >
    <el-tabs v-model="activeTabKey" tab-position="left">
      <el-tab-pane
        v-for="(item, index) in tabs"
        :name="item.key"
        :key="item.key"
        :label="`(${item.address}) ${item.moduleName}`"
      >
        <div class="top-wrap">
          <div>
            <span>从站设备名称：</span>
            <el-input
              v-model.trim="item.moduleName"
              placeholder="请输入"
              size="small"
              clearable
              style="width: 160px;"
            />
            <span style="margin-left: 24px;">从站地址：</span>
            <el-input
              v-model.trim="item.address"
              placeholder="(1-255)"
              size="small"
              clearable
              style="width: 160px;"
            />
            <span style="margin-left: 15px;">所属品类：</span>
            <el-cascader
              size="small"
              v-model="item.deviceType"
              clearable
              filterable
              :options="monitroTypeOptions"
              :props="{
                value: 'ID',
                label: 'TypeName',
                children: 'subset'
              }"
            />
          </div>
          <div>
            <el-button
              size="small"
              type="danger"
              plain
              v-if="tabs.length > 1"
              @click.native="() => handleModuleDelete(index)"
            >
              删除设备
            </el-button>
            <el-tooltip
              placement="top"
              effect="light"
              content="在点位列表中添加一行"
            >
              <el-button
                size="small"
                @click.native="() => $refs.tablePointEdit[index].addNewRow()"
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
                  file => $refs.tablePointEdit[index].uploadExcel(file)
                "
              >
                <el-button size="small" style="margin: 0 10px;">
                  导入点位
                </el-button>
              </el-upload>
            </el-tooltip>
            <el-dropdown trigger="click" style="margin-left: 10px;">
              <el-button size="small">
                批量操作<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  @click.native="() => $refs.tablePointEdit[index].batchPaste()"
                >
                  批量复制
                </el-dropdown-item>
                <el-dropdown-item
                  @click.native="() => $refs.tablePointEdit[index].batchDel()"
                >
                  批量删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <TablePointEdit
          ref="tablePointEdit"
          :point-list="item.pointList"
          style="margin: 0 24px 20px 24px"
        />
      </el-tab-pane>
      <el-tab-pane disabled name="fourth">
        <span slot="label"
          ><i class="el-icon-plus" style="margin-right: 6px;"></i
          >新建从站设备</span
        >
      </el-tab-pane>
    </el-tabs>
    <span slot="footer">
      <el-button @click.native="() => handleSingleCheck()" plain size="medium"
        >数据校验</el-button
      >
      <el-button
        :loading="submitLoading"
        @click.native="submit"
        type="primary"
        size="medium"
        >创 建</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import TablePointEdit from '../../component/TablePointEdit'
import { randomString } from '@/utils/index'
import { addOrUpdateDeviceModule } from '@/api/deviceModule'
import { monitorTypeList } from '@/api/monitorTypeProject'
export default {
  props: {
    gatewayInfo: Object
  },
  components: {
    TablePointEdit
  },
  data() {
    return {
      dialogVisible: false,
      activeTabKey: '',
      tabs: [],
      submitLoading: false,
      monitroTypeOptions: [] //所属品类列表
    }
  },
  computed: {
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  mounted() {
    this.fetchMonitorTypeOption()
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
      const randomKey = randomString(10)
      this.tabs = [
        {
          moduleName: 'NewDevice',
          address: 1,
          deviceType: [],
          key: randomKey,
          pointList: []
        }
      ]
      this.activeTabKey = randomKey
      this.$nextTick(() => {
        this.clickListener = () => {
          this.tabs.push({
            moduleName: 'NewDevice',
            address: 1,
            deviceType: [],
            key: randomString(10),
            pointList: []
          })
        }
        document
          .querySelector(
            '.dialog-create-module_JKFSDKJSDHNFL .el-tabs__item.is-disabled'
          )
          .addEventListener('click', this.clickListener)
      })
    },
    handleBeforeClose(done) {
      this.$confirm('退出编辑将不会保存当前内容，确认要退出吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          document
            .querySelector(
              '.dialog-create-module_JKFSDKJSDHNFL .el-tabs__item.is-disabled'
            )
            .removeEventListener('click', this.clickListener)
          done()
        })
        .catch(() => {})
    },
    handleClose() {
      this.dialogVisible = false
      this.tabs = []
      this.activeTabKey = ''
    },
    handleModuleDelete(index) {
      this.tabs.splice(index, 1)
      this.activeTabKey = this.tabs[0].key
    },
    // 验证单一一个
    handleSingleCheck() {
      let hasError = false
      const currentModuleIndex = this.tabs.findIndex(
        v => v.key === this.activeTabKey
      )
      const currentModule = this.tabs[currentModuleIndex]
      if (!currentModule.moduleName) {
        this.$message('请填写从站设备名称')
        hasError = true
        return true
      }
      if (!this.checkAddress(currentModule.address)) {
        this.$message(
          `${currentModule.moduleName} 的从站地址应该是一个 1-255 之间的整数`
        )
        hasError = true
        return true
      }
      if (
        !this.$refs.tablePointEdit[currentModuleIndex].handleCheckData(
          `(${currentModule.address}) ${currentModule.moduleName}`
        )
      ) {
        hasError = true
        return true
      }
      currentModule.pointList = this.$refs.tablePointEdit[
        currentModuleIndex
      ].submit()
      if (!currentModule.pointList || !currentModule.pointList.length) {
        hasError = true
        return true
      }
      if (hasError) {
        return false
      }
      this.$message.success(
        `(${currentModule.address}) ${currentModule.moduleName} 检验成功`
      )
      return true
    },
    // 下载模板
    downloadTemplate() {
      window.open(
        'https://front-end-assets.oss-cn-shanghai.aliyuncs.com/excel_template/%E6%A8%A1%E5%9D%97%E6%A8%A1%E7%89%88.xlsx',
        '_blank'
      )
    },
    submit() {
      let hasError = false
      this.tabs.some((module_, index) => {
        if (!module_.moduleName) {
          this.$message('请填写从站设备名称')
          hasError = true
          return true
        }
        if (!this.checkAddress(module_.address)) {
          this.$message(
            `${module_.moduleName} 的从站地址应该是一个 1-255 之间的整数`
          )
          hasError = true
          return true
        }
        if (
          !this.$refs.tablePointEdit[index].handleCheckData(
            `(${module_.address}) ${module_.moduleName}`
          )
        ) {
          hasError = true
          return true
        }
        module_.pointList = this.$refs.tablePointEdit[index].submit()
        if (!module_.pointList || !module_.pointList.length) {
          hasError = true
          return true
        }
      })
      if (hasError) {
        return
      }
      this.submitLoading = true
      const { BaudRate, CheckBit, StopBit, DataBit } = this.gatewayInfo
      Promise.all(
        this.tabs.map(module_ => {
          return addOrUpdateDeviceModule({
            DeviceModuleId: undefined,
            UserId: this.userId,
            DeviceModuleName: module_.moduleName,
            PointNum: module_.pointList.length,
            SmallTypeId: module_.deviceType.length
              ? module_.deviceType[2]
              : undefined,
            BaudRate,
            DataBit,
            CheckBit,
            StopBit,
            DeviceModulePointList: module_.pointList
          })
        })
      )
        .then(results => {
          let modules = []
          let isSuccess = results.every((res, index) => {
            if (res.data.Code === 200 && res.data.Data > 0) {
              modules.push({
                DeviceModuleId: res.data.Data,
                Address: this.tabs[index].address
              })
              return true
            } else {
              return false
            }
          })
          if (isSuccess) {
            this.$message.success('添加成功')
          } else {
            this.$message.error('部分从站设备添加失败')
          }
          this.$emit('change', modules)
          this.dialogVisible = false
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    isInteger(n) {
      if (n === '') {
        return false
      }
      return parseInt(n, 10) == n
    },
    checkAddress(value) {
      if (this.isInteger(value)) {
        if (Number(value) < 1 || Number(value) > 255) {
          return false
        }
      } else {
        return false
      }
      return true
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
.dialog-create-module_JKFSDKJSDHNFL {
  max-width: 1800px;
  .top-wrap {
    margin: 20px 24px;
    display: flex;
    justify-content: space-between;
  }
  .el-dialog__body {
    padding: 0;
  }
  div.el-tabs__nav-scroll {
    padding-left: 0;
  }
  .el-tabs--left {
    display: flex;
  }
  .el-tabs__header.is-left {
    flex: 0 0 160px;
    height: auto;
  }
  .el-tabs__nav-wrap {
    height: 100%;
  }
  .el-tabs__content {
    flex: 1;
    min-height: 300px;
  }
  .el-tabs__item {
    font-weight: normal;
    padding: 0 30px !important;
  }
  .el-tabs__item.is-disabled {
    cursor: pointer;
    color: #303133;
  }
  .el-tabs--left .el-tabs__item.is-left {
    text-align: left;
  }
}
</style>
