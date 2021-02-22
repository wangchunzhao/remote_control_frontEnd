<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        size="small"
        type="primary"
        @click="() => $refs.tablePointEdit.addNewRow()"
      >
        新增点位
      </el-button>
      <el-tooltip placement="top" effect="light" style="display: inline-block;">
        <div slot="content" style="text-align: center;font-size: 12px;">
          通过Excel样表<br />编辑点位并上传<br /><a
            href="javascript:;"
            style="color:#409EFF;"
            @click="downloadTemplate"
          >
            样式表下载
            <c-svg name="download" />
          </a>
        </div>
        <el-upload
          action="123"
          :show-file-list="false"
          accept=".xlsx"
          :before-upload="file => $refs.tablePointEdit.uploadExcel(file)"
        >
          <el-button size="small" style="margin: 0 10px;">
            导入点位
          </el-button>
        </el-upload>
      </el-tooltip>
      <el-dropdown trigger="click" style="margin-right: 10px;">
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
      <el-button
        size="small"
        plain
        @click="() => $refs.tablePointEdit.exportExcel()"
      >
        导出为表格
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="查找点位名称"
        suffix-icon="el-icon-search"
      />
    </div>
    <div v-loading="tableLoading">
      <TablePointEdit
        :name-filter="filterForm.text"
        :point-list="pointList"
        ref="tablePointEdit"
      />
    </div>
    <div style="text-align: center;margin-top: 20px;">
      <el-button
        :loading="applyLoading"
        type="primary"
        :disabled="tableLoading"
        @click.native="() => submit(true)"
      >
        发布上线
      </el-button>
      <el-button
        :disabled="tableLoading"
        :loading="saveLoading"
        plain
        @click.native="submit(false)"
        >保存点位</el-button
      >
    </div>
  </div>
</template>

<script>
import TablePointEdit from '../component/TablePointEdit'
import {
  getDeviceModulePointList,
  addOrUpdateDeviceModule
} from '@/api/deviceModule'
import { Decrypt } from '@/utils/secret'

export default {
  props: {
    info: Object
  },
  components: { TablePointEdit },
  data() {
    return {
      pointList: null,
      tableLoading: false,
      filterForm: {
        text: ''
      },
      applyLoading: false,
      saveLoading: false
    }
  },
  computed: {
    userId() {
      return this.$store.state.app.userInfo.uid
    }
  },
  watch: {
    info(val) {
      if (val && val.DeviceModuleId) {
        this.fetchTableData(val.DeviceModuleId)
      }
    },
    'filterForm.text'(val) {
      this.$refs.tablePointEdit.handlePagination(1, val)
    }
  },
  methods: {
    /**
     * 获取表格数据
     */
    fetchTableData(id) {
      this.pointList = []
      this.tableLoading = true
      getDeviceModulePointList({
        deviceModuleId: id,
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
    },
    // 下载模板
    downloadTemplate() {
      window.open(
        'https://front-end-assets.oss-cn-shanghai.aliyuncs.com/excel_template/%E6%A8%A1%E5%9D%97%E6%A8%A1%E7%89%88.xlsx',
        '_blank'
      )
    },
    submit(isApply) {
      const list = this.$refs.tablePointEdit.submit()
      if (list && list.length) {
        const update = () => {
          if (isApply) {
            this.applyLoading = true
          } else {
            this.saveLoading = true
          }
          const {
            BaudRate,
            DataBit,
            CheckBit,
            StopBit,
            DeviceModuleId,
            DeviceModuleName
          } = this.info
          addOrUpdateDeviceModule({
            DeviceModuleId: DeviceModuleId,
            UserId: this.userId,
            DeviceModuleName: DeviceModuleName,
            PointNum: list.length,
            BaudRate: BaudRate,
            DataBit: DataBit,
            CheckBit: CheckBit,
            StopBit: StopBit,
            DeviceModulePointList: list,
            IsUpdateDevice: isApply
          })
            .then(res => {
              if (res.data.Code === 200 && res.data.Data > 0) {
                this.$message.success(
                  isApply ? '已创建发布任务，生效需要一段时间' : '保存成功'
                )
                this.fetchTableData(DeviceModuleId)
              } else {
                this.$message.error(res.data.Message)
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('编辑失败')
            })
            .finally(() => {
              this.applyLoading = false
              this.saveLoading = false
            })
        }
        if (!isApply) {
          update()
          return
        }
        this.$confirm(
          '发布上线后，所有关联的网关点位将更新到最新状态，请确认点位信息准确无误。',
          '提示',
          {
            confirmButtonText: '确定发布',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
          .then(() => {
            update()
          })
          .catch(() => {})
      }
    }
  }
}
</script>
