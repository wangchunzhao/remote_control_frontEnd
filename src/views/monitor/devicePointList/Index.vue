<template>
  <div class="monitor-devicePointList">
    <page-header
      :title="$route.query.deviceName || '所有参数'"
      :showBack="true"
    >
      <template v-slot:right>
        <el-tag
          v-if="deviceInfo.ModelTreeStatus"
          :type="statusOptions[deviceInfo.ModelTreeStatus].type"
          size="mini"
          style="margin-left: 15px"
        >
          {{ statusOptions[deviceInfo.ModelTreeStatus].label }}
        </el-tag>
      </template>
    </page-header>
    <!--    关键点位-->
    <div class="key-point-box">
      <div class="key-point-control-box">
        <div class="key-point-control-title">关键点位</div>
        <div style="flex: 1;display: flex;align-items: center">
          <el-form
            ref="form"
            :model="form"
            :rules="formRules"
            style="margin-left: 15px;"
            inline
            size="medium"
            label-width="90px"
            :hide-required-asterisk="true"
          >
            <el-form-item label="" prop="dateRange">
              <el-date-picker
                v-model="form.dateRange"
                type="datetimerange"
                :picker-options="pickerOptions"
                format="yyyy-MM-dd HH:mm"
                range-separator="至"
                style="width: 350px;"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
                @change="handleDateRangeChange"
                :disabled="keyPointLoading"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              label=""
              prop="interval"
              style="margin-left: 15px;"
              :rules="[
                {
                  required: true,
                  message: '超过查询限制，请修改起止时间或时间间隔',
                  min: intervalMin,
                  type: 'number',
                  trigger: 'blur'
                }
              ]"
            >
              <el-input
                placeholder=""
                style="width: 225px;"
                clearable
                v-model.trim.number="form.interval"
                :disabled="keyPointLoading"
              >
                <template slot="prepend">
                  <span>间隔（分钟)</span>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <el-dropdown :hide-on-click="false" trigger="click">
          <el-button
            type="text"
            style="padding: 0;"
            class="el-dropdown-link"
            :loading="keyPointLoading"
          >
            <i class="el-icon-s-operation"></i>
            调整显示点位
          </el-button>
          <el-dropdown-menu
            slot="dropdown"
            class="dropdown-box"
            v-loading="keyPointLoading"
          >
            <el-dropdown-item>
              <el-checkbox
                :indeterminate="isIndeterminate"
                v-model="checkAll"
                @change="handleCheckAllChange"
              >
                {{ choosePointIdList.length }}/{{ typeOptions.length }}
              </el-checkbox>
            </el-dropdown-item>
            <el-checkbox-group
              v-model="choosePointIdList"
              @change="handleCheckedChange"
            >
              <el-dropdown-item
                :divided="index === 0"
                v-for="(item, index) in typeOptions"
                :key="index"
              >
                <el-checkbox :label="item.id" :disabled="item.disabled">{{
                  item.name
                }}</el-checkbox>
              </el-dropdown-item>
            </el-checkbox-group>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div
        class="content-box no-key-point-box"
        v-if="!keyPointList.length"
        v-loading="keyPointLoading"
      >
        <img
          class="no-key-point-icon"
          src="https://front-end-assets.oss-cn-shanghai.aliyuncs.com/images/3.%E9%80%9A%E7%94%A8%E7%BB%84%E4%BB%B6%EF%BC%8F%E5%BD%A9%E8%89%B2%E7%89%88%EF%BC%8F%E6%B5%81%E6%B1%97%E8%A1%A8%E6%83%85.png"
          alt=""
        />
        <div class="no-key-point-text">暂未匹配到默认点位</div>
        <div class="no-key-point-text">
          您可点击右上方「调整显示点位」进行查看
        </div>
      </div>
      <div
        class="content-box key-point-box"
        v-else
        v-for="(item, index) in keyPointList"
        :key="index"
      >
        <KeyPointHistoryDialog
          :ref="'keyPointHistoryDialog' + index"
          @requestReg="KeyPointRequestReg"
          @requestChart="KeyPointRequestChart"
          :keyPointIndex="index"
          :point-ids="item.point"
          :device-id="item.deviceId"
        ></KeyPointHistoryDialog>
      </div>
    </div>
    <!--    基本信息-->
    <div class="content-box">
      <InfoCollapse
        @refreshDeviceBaseInfo="refreshDeviceBaseInfo"
      ></InfoCollapse>
    </div>
    <!--    点位数据-->
    <div class="content-box">
      <PointDataList ref="pointDataList"></PointDataList>
    </div>
    <!--    报警、维修记录-->
    <div class="content-box record-list-box">
      <RecordList></RecordList>
    </div>
  </div>
</template>

<script>
import KeyPointHistoryDialog from './KeyPointHistoryDialog'
import PointDataList from './PointDataList'
import InfoCollapse from './InfoCollapse'
import RecordList from './RecordList'
import {
  queryPointRead,
  getModelTreeShowPoint,
  editModelTreeShowPoint,
  getModelPropertyList
} from '@/api/model_new'
export default {
  components: {
    KeyPointHistoryDialog,
    PointDataList,
    InfoCollapse,
    RecordList
  },
  data() {
    return {
      intervalMin: 0,
      form: {
        interval: 2,
        startTime: new Date(new Date().getTime() - 24 * 3600 * 1000),
        endTime: new Date(),
        pointIds: [],
        pointIdsByAdd: [], // 用户自己添加的点位
        dateRange: [
          new Date(new Date().getTime() - 24 * 3600 * 1000),
          new Date()
        ],
        showRelatePoint: false, // 是否显示关联点位
        model: 'chart',
        showStatistical: false, // 显示统计
        showThreshold: false // 显示阈值
      },
      deviceInfo: {}, //设备基本信息
      isIndeterminate: true,
      keyPointLoading: false,
      checkAll: false,
      choosePointList: [], //选择的点位列表
      choosePointIdList: [], //选择的点位ID列表
      keyPointList: [], //关键点位列表
      keyPointChartList: [], //关键点位实例列表
      keyPointFinishNum: 0, //关键点位请求完成数

      formRules: {
        dateRange: [
          {
            type: 'array',
            required: true,
            message: '请选择时间范围',
            trigger: 'change'
          }
        ],
        startTime: [
          {
            type: 'date',
            required: true,
            message: '选择开始时间',
            trigger: 'change'
          }
        ],
        endTime: [
          {
            type: 'date',
            required: true,
            message: '选择结束时间',
            trigger: 'change'
          }
        ]
      },
      statusOptions: {
        '-1': {
          label: '离线',
          type: 'info'
        },
        0: {
          label: '在线',
          type: 'success'
        },
        1: {
          label: '报警',
          type: 'danger'
        }
      },
      typeOptions: [],
      pickerOptions: {
        disabledDate: time => {
          return time > Date.now()
        },
        shortcuts: [
          {
            text: '近一天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  watch: {
    'form.interval'(val) {
      if (val !== '' && this.form.startTime && this.form.endTime) {
        this.$refs.form.validate(valid => {
          if (valid && this.keyPointList.length) {
            for (let i = 0; i < this.keyPointList.length; i++) {
              this.$refs[`keyPointHistoryDialog${i}`][0].updateDialog(this.form)
            }
          } else {
            return false
          }
        })
      }
    },
    choosePointIdList(val = []) {
      let _this = this
      this.keyPointLoading = true
      let keyPointList = []
      let choosePointList = []
      let pointList = []
      // 给选中点位按点位类型分组
      if (val.length) {
        let Options = this.typeOptions
        val.map(item => {
          Options.map(item1 => {
            if (item === item1.id) {
              choosePointList.push(item1)
            }
          })
        })

        for (let i = 0; i < choosePointList.length; i++) {
          if (pointList.length) {
            let flag = false
            for (let j = 0; j < pointList.length; j++) {
              if (choosePointList[i].type === pointList[j].type) {
                flag = true
                pointList[j].point.push(choosePointList[i].id)
                break
              }
            }
            if (!flag) {
              pointList.push({
                type: choosePointList[i].type,
                point: [choosePointList[i].id]
              })
            }
          } else {
            pointList.push({
              type: choosePointList[i].type,
              point: [choosePointList[i].id]
            })
          }
        }
        pointList.map(item => {
          keyPointList.push({
            point: item.point,
            deviceId: this.$route.query.mtid - 0
          })
        })
      }

      this.choosePointList = choosePointList
      this.checkBoxReg()
      this.keyPointList = keyPointList
      this.keyPointChartList = []
      this.form.interval = 2
      this.form.startTime = new Date(new Date().getTime() - 24 * 3600 * 1000)
      this.form.endTime = new Date()
      this.form.dateRange = [
        new Date(new Date().getTime() - 24 * 3600 * 1000),
        new Date()
      ]
      this.$nextTick(() => {
        _this.$refs.form.validate(valid => {
          if (valid && _this.keyPointList.length) {
            for (let i = 0; i < _this.keyPointList.length; i++) {
              _this.$refs[`keyPointHistoryDialog${i}`][0].toggleDialog(
                this.form
              )
            }
          }
        })
      })
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.getAllPoint()
  },
  methods: {
    refreshDeviceBaseInfo(info) {
      this.deviceInfo = info
    },
    KeyPointRequestChart({ chart, index }) {
      this.keyPointChartList[index] = chart
      if (this.keyPointChartList.length === this.keyPointList.length) {
        for (let i = 0; i < this.keyPointChartList.length; i++) {
          if (!this.keyPointChartList[i]) {
            return
          }
        }
        // 图标联动
        echarts.connect('keyPoint')
      }
    },
    KeyPointRequestReg() {},
    checkBoxReg() {
      this.checkAll =
        this.choosePointIdList.length > 0 &&
        this.choosePointIdList.length === this.typeOptions.length
      this.isIndeterminate =
        this.choosePointIdList.length > 0 &&
        this.choosePointIdList.length < this.typeOptions.length
    },
    //全选点位显示
    handleCheckAllChange(val) {
      let Options = this.typeOptions
      let List = this.choosePointIdList
      let choosePointIdList = []
      List = val
        ? Options.map(item => item.id)
        : Options.map(item => {
            if (item.disabled) {
              return item.id
            }
          })
      List.map(item => {
        if (item) {
          choosePointIdList.push(item)
        }
      })
      this.choosePointIdList = [...new Set(choosePointIdList)]
      this.editDefaultPoint()
    },
    //选择当个点位显示
    handleCheckedChange() {
      this.editDefaultPoint()
    },
    handleDateRangeChange(val) {
      if (val) {
        this.form.startTime = this._dateFormat(val[0], 'YYYY-MM-DD HH:mm')
        this.form.endTime = this._dateFormat(val[1], 'YYYY-MM-DD HH:mm')
        this.$refs['form'].validate(valid => {
          if (valid && this.keyPointList.length) {
            for (let i = 0; i < this.keyPointList.length; i++) {
              this.$refs[`keyPointHistoryDialog${i}`][0].updateDialog(this.form)
            }
          }
        })
      } else {
        this.form.startTime = ''
        this.form.endTime = ''
      }
    },
    //获取所有点位
    getAllPoint() {
      this.keyPointLoading = true
      queryPointRead({
        mtid: this.$route.query.mtid - 0,
        mtidList: undefined,
        BigTypeId: undefined,
        ProjectId: this.projectId,
        LevelList: [],
        area: undefined,
        stime: undefined,
        etime: undefined,
        typeCn: undefined,
        alarmLevel: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            let List = res.data.Data.Data
            List.map(item => {
              item.disabled = false
            })
            this.typeOptions = List
          } else {
            this.$message.error('获取点位列表失败')
            this.checkBoxReg()
            this.keyPointLoading = false
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取点位列表失败')
          this.checkBoxReg()
          this.keyPointLoading = false
        })
        .finally(() => {
          this.getChoosePoint()
        })
    },
    //获取默认选中点位
    getChoosePoint() {
      getModelTreeShowPoint({
        modelTreeId: this.$route.query.mtid - 0
      })
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            this.choosePointIdList = data.length
              ? data.map(item => item.Key)
              : []
          } else {
            this.$message.error('获取默认点位失败')
            this.checkBoxReg()
            this.keyPointLoading = false
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取默认点位失败')
          this.checkBoxReg()
          this.keyPointLoading = false
        })
        .finally(() => {
          if (this.choosePointIdList.length) {
            this.checkBoxReg()
            this.keyPointLoading = false
          } else {
            this.getDefaultPointList()
          }
        })
    },
    //获取关键点位（默认选中）
    getDefaultPointList() {
      getModelPropertyList({
        modelTreeId: this.$route.query.mtid - 0,
        isGetGroup: true
      })
        .then(res => {
          if (res.data.Code === 200) {
            let Options = [...this.typeOptions]
            let List = res.data.Data
            let choosePointIdList = [...this.choosePointIdList]
            if (List.length && Options.length) {
              for (let i = 0; i < List.length; i++) {
                let GroupList = []
                if (List[i].Group && List[i].Group.indexOf('/') > -1) {
                  GroupList = List[i].Group.split('/')
                }
                for (let j = 0; j < Options.length; j++) {
                  if (GroupList.length) {
                    let GroupList = List[i].Group.split('/')
                    for (let k = 0; k < GroupList.length; k++) {
                      if (
                        Options[j].name &&
                        GroupList[k] &&
                        Options[j].name.indexOf(GroupList[k]) > -1
                      ) {
                        choosePointIdList.push(Options[j].id)
                      }
                    }
                  } else if (
                    Options[j].name &&
                    List[i].Group &&
                    Options[j].name.indexOf(List[i].Group) > -1
                  ) {
                    // Options[j].disabled = true
                    choosePointIdList.push(Options[j].id)
                  }
                }
              }
            }
            this.typeOptions = Options
            this.choosePointIdList = [...new Set(choosePointIdList)]
          } else {
            this.$message.error('获取动态属性失败')
            this.checkBoxReg()
            this.keyPointLoading = false
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取动态属性失败')
          this.checkBoxReg()
          this.keyPointLoading = false
        })
        .finally(() => {
          this.checkBoxReg()
          this.keyPointLoading = false
          if (this.choosePointIdList.length) {
            this.editDefaultPoint(false)
          }
        })
    },
    //设置显示的点位
    editDefaultPoint(type = true) {
      this.keyPointLoading = true
      editModelTreeShowPoint({
        modelTreeId: this.$route.query.mtid - 0,
        pointIdList: this.choosePointIdList
      })
        .then(res => {
          if (!type) {
            return
          } else if (res.data.Code === 200 && res.data.Data) {
            this.$message.success('调整显示点位成功')
          } else {
            this.$message.error('调整显示点位失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('调整显示点位失败')
        })
        .finally(() => {
          this.checkBoxReg()
          this.keyPointLoading = false
        })
    }
  }
}
</script>

<style lang="scss">
.monitor-devicePointList {
  .key-point-box {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
<style lang="scss" scoped>
.key-point-control-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 32px 0;
}
.key-point-control-title {
  font-size: 20px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 28px;
}
.dropdown-box {
  max-height: 400px;
  overflow: auto;
}
.no-key-point-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
  padding-bottomg: 40px;
}
.no-key-point-icon {
  display: block;
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}
.no-key-point-text {
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
  line-height: 22px;
  text-align: center;
}
</style>
