<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="650px"
    @close="handleClose"
    custom-class="waybill-detail-dialog"
  >
    <div slot="title">
      <span style="line-height: 24px;font-size: 18px;color: #303133;">
        运单详情：{{ data.WaybillNumber }}
        <el-tag
          size="small"
          v-if="!loading"
          :type="
            data.TransportStatus === 0
              ? ''
              : data.TransportStatus === 1
              ? 'success'
              : data.TransportStatus === 2
              ? 'info'
              : ''
          "
        >
          {{
            data.TransportStatus === 0
              ? '未启运'
              : data.TransportStatus === 1
              ? '运输中'
              : data.TransportStatus === 2
              ? '已完成'
              : ''
          }}
        </el-tag>
      </span>
    </div>
    <div v-loading="loading">
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            运送车辆
          </div>
        </el-col>
        <el-col :span="20">
          <div class="column-value">
            <el-select
              v-if="editAble.car"
              v-model="data.CarId"
              placeholder="请选择车辆"
              clearable
              size="mini"
              @change="handleCarChange"
              @clear="
                () => {
                  data.CarId = ''
                  data.CarNumber = ''
                }
              "
            >
              <el-option
                v-for="item in carOptions"
                :key="item.Key"
                :label="item.Value"
                :value="item.Key"
              />
            </el-select>
            <span v-else>
              {{ data.CarNumber }}
            </span>

            <el-button
              v-if="data.TransportStatus === 0"
              type="text"
              @click.native="handleSave('car')"
            >
              <c-svg :name="editAble.car ? 'true' : 'bianji'" />
            </el-button>
          </div>
        </el-col>
      </el-row>
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            出发地
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            <el-input
              v-if="editAble.startPlace"
              v-model="data.Departure"
              size="mini"
            />
            <span v-else>
              {{ data.Departure }}
            </span>

            <el-button
              v-if="data.TransportStatus === 0"
              type="text"
              @click.native="handleSave('startPlace')"
            >
              <c-svg :name="editAble.startPlace ? 'true' : 'bianji'" />
            </el-button>
          </div>
        </el-col>
        <el-col :span="4" class="column-label">
          <div>
            目的地
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            <el-input
              v-if="editAble.endPlace"
              v-model="data.Destination"
              size="mini"
            />
            <span v-else>
              {{ data.Destination }}
            </span>

            <el-button
              v-if="data.TransportStatus === 0"
              type="text"
              @click.native="handleSave('endPlace')"
            >
              <c-svg :name="editAble.endPlace ? 'true' : 'bianji'" />
            </el-button>
          </div>
        </el-col>
      </el-row>
      <el-row class="row" type="flex">
        <el-col :span="4" class="column-label">
          <div>
            绑定终端
          </div>
        </el-col>
        <el-col :span="20">
          <div class="column-value">
            <div v-if="!editAble.terminal">
              <el-tag
                @click.native="handleWatchHistory(item.PointId)"
                v-for="item in data.Waybill_Management_TagList"
                :key="item.PointId"
                size="small"
                style="margin-right: 5px;cursor: pointer;"
              >
                {{ item.Tag }}
              </el-tag>
            </div>

            <el-select
              v-else
              v-model="data.terminalIds"
              multiple
              placeholder="请选择数据终端"
              clearable
              filterable
              size="mini"
              style="width: 100%;"
              @change="handleTerminalChange"
            >
              <el-option-group
                v-for="group in terminalOptions"
                :key="group.label"
                :label="group.label"
              >
                <el-option
                  v-for="item in group.options"
                  :key="item.Key"
                  :label="item.Value"
                  :value="item.Key"
                />
              </el-option-group>
            </el-select>
            <el-button
              v-if="data.TransportStatus === 0 || data.TransportStatus === 1"
              type="text"
              @click.native="handleSave('terminal')"
            >
              <c-svg :name="editAble.terminal ? 'true' : 'bianji'" />
            </el-button>
          </div>
        </el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="4">
          <div class="column-label">
            绑定时间
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ data.BindTime }}
          </div>
        </el-col>
        <el-col :span="4">
          <div class="column-label">
            操作者
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ data.BindName }}
          </div>
        </el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="4">
          <div class="column-label">
            启运时间
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ data.TransportStartTime }}
          </div>
        </el-col>
        <el-col :span="4">
          <div class="column-label">
            操作者
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ data.CarrierName }}
          </div>
        </el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="4">
          <div class="column-label">
            结束时间
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ data.TransportEndTime }}
          </div>
        </el-col>
        <el-col :span="4">
          <div class="column-label">
            操作者
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column-value">
            {{ data.EndName }}
          </div>
        </el-col>
      </el-row>
    </div>

    <history-dialog
      :appendToBody="true"
      :startTime="new Date(data.BindTime)"
      :endTime="data.UnbindTime ? new Date(data.UnbindTime) : new Date()"
      ref="historyDialog"
      :point-ids="historyPointIds"
    />
  </el-dialog>
</template>

<script>
import {
  getWaybillManagement,
  getTerminalDropdow,
  getProjectForCarList,
  waybillBindTagsV2Web
} from '@/api/device_new'

export default {
  data() {
    return {
      loading: false,
      dialogVisible: false,
      editAble: {
        car: false,
        startPlace: false,
        endPlace: false,
        terminal: false
      },

      waybillId: '',
      data: {},
      terminalOptions: [],
      carOptions: [],

      historyPointIds: null
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    },
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  methods: {
    // 修改车辆时触发
    handleCarChange(val) {
      this.data.CarNumber = this.carOptions.find(item => item.Key === val).Value
    },
    // 修改绑定的终端时触发
    handleTerminalChange() {
      const terminals = []
      const { terminalIds } = this.data
      this.terminalOptions[0].options.forEach(item => {
        if (terminalIds.indexOf(item.Key) > -1) {
          terminals.push(item)
        }
      })
      this.terminalOptions[1].options.forEach(item => {
        if (terminalIds.indexOf(item.Key) > -1) {
          terminals.push(item)
        }
      })
      this.data.tagTextList = terminals.map(item => item.Value)
    },
    handleSave(type) {
      // if (this.editAble[type]) {
      //   if (type === 'car' && !this.data.CarId) {
      //     this.$message('请选择车辆')
      //     return false
      //   }
      // }
      this.editAble[type] = !this.editAble[type]
      if (this.editAble[type]) {
        return false
      }
      const {
        Departure,
        Destination,
        WaybillNumber,
        CarId,
        CarNumber,
        TempRangeId,
        terminalIds
      } = this.data

      const tags = []
      const terminals = []
      this.terminalOptions[0].options.forEach(item => {
        if (terminalIds.indexOf(item.Key) > -1) {
          terminals.push(item)
        }
      })
      this.terminalOptions[1].options.forEach(item => {
        if (terminalIds.indexOf(item.Key) > -1) {
          terminals.push(item)
        }
      })
      terminals.forEach(item => {
        if (item.Type === 1) {
          tags.push({
            Type: 't',
            TagId: item.Value,
            TagType: item.TagType
          })
        } else {
          tags.push({
            Type: 't',
            TagId: item.Value,
            TagType: item.TagType
          })
          tags.push({
            Type: 'h',
            TagId: item.Value,
            TagType: item.TagType
          })
        }
      })

      waybillBindTagsV2Web({
        CompanyId: this.companyId,
        ProjectId: this.projectId,
        WaybillNumber,
        Departure,
        Destination,
        Tags: tags,
        CarId,
        CarNumber,
        TempRangeId
      })
        .then(res => {
          if (res.data.Code !== 200) {
            this.$message.error(res.data.Message)
          } else {
            this.$message.success('修改成功')
            this.fetchData()
            this.$emit('edit')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('新增失败')
        })
    },
    async openDialog(id) {
      this.dialogVisible = true
      this.loading = true
      this.waybillId = id
      await getTerminalDropdow({
        projectId: this.projectId
      }).then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          data.SensorList.forEach(item => {
            item.TagType = 1
          })
          data.TerminalList.forEach(item => {
            item.TagType = 2
          })
          this.terminalOptions = [
            {
              label: '传感器',
              options: data.SensorList
            },
            {
              label: '记录仪',
              options: data.TerminalList
            }
          ]
        }
      })
      getProjectForCarList({
        projectId: this.projectId
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
        })
      this.fetchData()
    },
    // 查询运单信息
    fetchData() {
      getWaybillManagement({
        waybillManagementId: this.waybillId
      })
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            data.terminalIds = []
            data.tagTextList = [
              ...new Set(data.Waybill_Management_TagList.map(item => item.Tag))
            ]
            this.terminalOptions[0].options.forEach(item => {
              if (data.tagTextList.indexOf(item.Value) > -1) {
                data.terminalIds.push(item.Key)
              }
            })
            this.terminalOptions[1].options.forEach(item => {
              if (data.tagTextList.indexOf(item.Value) > -1) {
                data.terminalIds.push(item.Key)
              }
            })
            this.data = data
          } else {
            this.$message.error('运单信息获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('运单信息获取失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 查看历史记录
    handleWatchHistory(id) {
      this.$refs.historyDialog.toggleDialog()
      this.historyPointIds = [id]
    },
    handleClose() {
      this.dialogVisible = false
      this.editAble = {
        car: false,
        startPlace: false,
        endPlace: false,
        terminal: false
      }
      this.data = {}
    }
  }
}
</script>

<style lang="scss">
.waybill-detail-dialog {
  .row {
    border-bottom: 1px solid #ebeef5;
  }
  .column-label {
    box-sizing: border-box;
    padding: 14px 16px;
    background-color: #f2f6fc;
  }
  .column-value {
    box-sizing: border-box;
    padding: 12px 35px 12px 16px;
    position: relative;
    &:hover {
      .el-button {
        display: inline-block;
      }
    }
    .el-button {
      display: none;
      padding: 0;
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .el-dialog__body {
    padding: 20px;
  }
}
</style>
