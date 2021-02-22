<template>
  <el-dialog
    width="720px"
    title="下载数据"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      inline
      label-width="100px"
      size="small"
    >
      <el-form-item label="文件类型：" required>
        <el-radio
          v-for="item in fileTypeList"
          :key="item"
          v-model="form.fileType"
          :label="item"
          >{{ item }}</el-radio
        >
      </el-form-item>
      <el-form-item label="时间范围：" style="margin-bottom: 0;">
        <el-form-item label="" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            :disabled="startTimeDisable"
            format="yyyy-MM-dd HH:mm"
            @change="() => (rangeType = undefined)"
            :editable="false"
            type="datetime"
            placeholder="选择日期"
            style="width: 175px;"
          />
        </el-form-item>
        <span style="margin-right: 10px;position: relative;top: 0px">-</span>
        <el-form-item label="" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            :disabled="endTimeDisable"
            format="yyyy-MM-dd HH:mm"
            @change="() => (rangeType = undefined)"
            :editable="false"
            type="datetime"
            placeholder="选择日期"
            style="width: 175px;"
          />
        </el-form-item>
        <el-radio-group
          v-model="rangeType"
          size="small"
          @change="changeRangeType"
          style="margin-left: 10px;"
        >
          <el-radio-button label="昨天"></el-radio-button>
          <el-radio-button label="上周"></el-radio-button>
          <el-radio-button label="上月"></el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="数据处理：" required style="margin-bottom: 0">
        <el-radio v-model="form.dataType" :label="1">原始数据</el-radio>
        <br />
        <el-radio v-model="form.dataType" :label="2"
          >按时间间隔对齐数据</el-radio
        >
        <el-form-item
          label=""
          prop="interval"
          style="transform: translateX(-25px);"
        >
          <el-input
            clearable
            style="width: 160px;"
            :disabled="form.dataType !== 2"
            placeholder="输入时间间隔"
            v-model.number="form.interval"
          ></el-input>
          分钟
        </el-form-item>
      </el-form-item>
      <div>
        <el-form-item label="文件合并：" prop="isFileMerge">
          <el-radio
            :disabled="isFileMergeFalseDisabled"
            v-model="form.isFileMerge"
            :label="false"
            >每个点位生成独立文件</el-radio
          >
          <br />
          <el-radio
            :disabled="isFileMergeTrueDisabled"
            v-model="form.isFileMerge"
            :label="true"
            >所有点位汇总到同一文件</el-radio
          >
        </el-form-item>
      </div>
      <el-form-item label="报警数据：" prop="isAlarmLacy">
        <el-radio
          :disabled="isAlarmLacyFalseDisabled"
          v-model="form.isAlarmLacy"
          :label="false"
          >保留报警期间原始数据</el-radio
        >
        <br />
        <el-radio
          :disabled="isAlarmLacyTrueDisabled"
          v-model="form.isAlarmLacy"
          :label="true"
          >报警期间数据按时间间隔对齐</el-radio
        >
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :loading="submitLoading"
        size="medium"
        type="primary"
        @click.native="submitForm"
        >下 载</el-button
      >
    </span>
    <el-dialog
      title=""
      :visible.sync="progressDialogVisible"
      width="400px"
      top="35vh"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      custom-class="download-progress-dialog"
    >
      <div class="desc-text">
        <c-svg name="cloud-download"></c-svg>
        正在生成第 {{ progressNumber }} 份文件...
      </div>
      <el-progress
        :stroke-width="8"
        :percentage="parseInt((progressNumber / pointIds.length) * 100)"
      ></el-progress>

      <div style="text-align: right;margin-top: 35px;padding-right: 25px;">
        <el-button @click.native="handleCancelDownload" size="small"
          >取消</el-button
        >
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { downHistoryDataToExcelOrPdf } from '@/api/device_new'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // load on demand
dayjs.locale('zh-cn')
const lastDay = [
  dayjs()
    .subtract(1, 'day')
    .format('YYYY-MM-DD 00:00'),
  dayjs().format('YYYY-MM-DD 00:00')
]
const lastWeek = [
  dayjs()
    .subtract(1, 'week')
    .startOf('week')
    .format('YYYY-MM-DD 00:00'),
  dayjs()
    .startOf('week')
    .format('YYYY-MM-DD 00:00')
]
const lastMonth = [
  dayjs()
    .subtract(1, 'month')
    .startOf('month')
    .format('YYYY-MM-DD 00:00'),
  dayjs()
    .startOf('month')
    .format('YYYY-MM-DD 00:00')
]

const oneSeasonTime = 90 * 3600 * 1000 * 24
const oneMonthTime = 31 * 3600 * 1000 * 24
const oneYearTime = 365 * 3600 * 1000 * 24
const halfYearTime = 182 * 3600 * 1000 * 24

export default {
  props: {
    pointIds: Array
  },
  data() {
    const validateInterval = (rule, value, callback) => {
      if (this.form.dataType === 1) {
        callback()
      } else {
        // 开始、结束时间差
        const diff = dayjs(this.form.endTime).diff(
          dayjs(this.form.startTime, 'day')
        )
        if (diff <= oneMonthTime) {
          callback()
        } else if (diff > oneMonthTime && diff < oneSeasonTime) {
          if (value >= 10) {
            callback()
          } else {
            callback(new Error('当前时间范围内，间隔最小为 10'))
          }
        } else if (diff > oneSeasonTime && diff < halfYearTime) {
          if (value >= 20) {
            callback()
          } else {
            callback(new Error('当前时间范围内，间隔最小为 20'))
          }
        } else if (diff > halfYearTime && diff < oneYearTime) {
          if (value >= 60) {
            callback()
          } else {
            callback(new Error('当前时间范围内，间隔最小为 60'))
          }
        } else if (diff > oneYearTime) {
          if (value >= 120) {
            callback()
          } else {
            callback(new Error('当前时间范围内，间隔最小为 120'))
          }
        }
      }
    }
    return {
      dialogVisible: false,

      form: {
        fileType: '',
        startTime: lastDay[0],
        endTime: lastDay[1],
        dataType: undefined,
        interval: 2,
        isAlarmLacy: undefined,
        isFileMerge: undefined
      },
      fileTypeList: [],
      startTimeDisable: false,
      endTimeDisable: false,
      rangeType: '昨天',
      rules: {
        startTime: [
          {
            required: true,
            message: '选择开始时间',
            trigger: 'change'
          }
        ],
        endTime: [
          {
            required: true,
            message: '选择结束时间',
            trigger: 'change'
          }
        ],
        interval: [
          { validator: validateInterval, trigger: 'blur' },
          { type: 'number', message: '整数' }
        ]
      },
      submitLoading: false,

      progressDialogVisible: false,
      progressNumber: 1,
      fileList: []
    }
  },
  watch: {
    'form.fileType'() {
      // 切换文件类型后重置选项
      this.form.dataType = 1
      this.form.isFileMerge = false
      this.form.isAlarmLacy = false
    },
    'form.startTime'() {
      this.handleTimeChange(this.form.startTime, this.form.endTime)
    },
    'form.endTime'() {
      this.handleTimeChange(this.form.startTime, this.form.endTime)
    },
    isAlarmLacyFalseDisabled(val) {
      if (val === true) {
        // 如果保留报警原始不据不可选，那么默认选中报警数据对齐
        this.form.isAlarmLacy = true
      }
    },

    isAlarmLacyTrueDisabled(val) {
      if (val === true) {
        // 如果报警数据对齐不可选，那么默认选中保留报警原始数据
        this.form.isAlarmLacy = false
      }
    },
    isFileMergeTrueDisabled(val) {
      // 如果所有点位汇总到同一文件不可选，默认选中每个点位生成独立xls文件
      if (val === true) {
        this.form.isFileMerge = false
      }
    },
    isFileMergeFalseDisabled(val) {
      if (val === true) {
        this.form.isFileMerge = true
      }
    }
  },
  computed: {
    isFileMergeFalseDisabled() {
      // if (this.form.fileType === 'Excel') {
      //   if (this.form.dataType === 1 && this.form.isAlarmLacy === false) {
      //     // 原始数据+独立文件+保留报警数据
      //     return false
      //   }
      // } else {
      //   return false
      // }
      return false
    },
    // 所有点位汇总到同一文件是否可选
    isFileMergeTrueDisabled() {
      // 文件类型是pdf时，不可选 所有点位汇总到一个文件
      if (this.form.fileType === 'Excel') {
        if (this.form.dataType === 2) {
          // 只有选中原始数据时可以选择
          return false
        }
      }
      return true
    },
    // 保留报警原始数据是否可选
    isAlarmLacyFalseDisabled() {
      // console.log(this.form.fileType, this.form.isFileMerge)
      if (this.form.fileType === 'Excel') {
        if (this.form.isFileMerge === false) {
          // 1 原始数据+独立文件+保留报警数据
          // 2 数据对齐+独立文件+保留报警数据
          return false
        }
      } else {
        if (this.form.isFileMerge === false) {
          return false
        }
      }

      return true
    },
    // 报警数据对齐是否可选
    isAlarmLacyTrueDisabled() {
      if (this.form.fileType === 'Excel') {
        if (this.form.dataType === 2) {
          // 3 数据对齐+独立文件+报警数据对齐
          // 4 数据对齐+合并文件+报警数据对齐
          return false
        }
      } else {
        if (this.form.dataType === 2 && this.form.isFileMerge === false) {
          return false
        }
      }

      return true
    },
    platform() {
      return this.$store.state.permissions.platform
    },
    projectPermissions() {
      return this.$store.state.permissions.projectPermissions
    },
    companyPermissions() {
      return this.$store.state.permissions.companyPermissions
    }
  },
  mounted() {
    if (this.platform === PLATFORM.business) {
      if (this.projectPermissions.includes(112)) {
        this.fileTypeList.push('Excel')
      }
      if (this.projectPermissions.includes(111)) {
        this.fileTypeList.push('PDF')
      }
    } else {
      if (this.companyPermissions.includes(104)) {
        this.fileTypeList.push('Excel')
      }
      if (this.companyPermissions.includes(103)) {
        this.fileTypeList.push('PDF')
      }
    }
    this.form.fileType = this.fileTypeList[0]

    // 触发computed
    this.form.dataType = 1
    this.form.isFileMerge = false
    this.form.isAlarmLacy = false
  },
  methods: {
    openDialog() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      // this.form.startTime = lastDay[0]
      // this.form.endTime = lastDay[1]
      // this.rangeType = '昨天'
      // this.form.interval = 2
      // this.$refs.form.resetFields()
    },
    changeRangeType(val) {
      switch (val) {
        case '昨天':
          this.form.startTime = lastDay[0]
          this.form.endTime = lastDay[1]
          break
        case '上周':
          this.form.startTime = lastWeek[0]
          this.form.endTime = lastWeek[1]
          break
        case '上月':
          this.form.startTime = lastMonth[0]
          this.form.endTime = lastMonth[1]
          break
        default:
          break
      }
    },
    handleCancelDownload() {
      this.progressDialogVisible = false
      this.fileList = []
      this.progressNumber = 1
      this.submitLoading = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {
            fileType,
            startTime,
            endTime,
            dataType,
            interval,
            isFileMerge,
            isAlarmLacy
          } = this.form

          if (
            dataType === 1 &&
            new Date(endTime).getTime() - new Date(startTime).getTime() >
              oneMonthTime
          ) {
            this.$message('原始数据下载时间范围不可以超过1个月')
            return false
          }
          this.submitLoading = true

          if (isFileMerge) {
            // 所有点位汇总到同一文件
            downHistoryDataToExcelOrPdf({
              start: startTime,
              end: endTime,
              pointIdList: this.pointIds,
              tmes: dataType === 1 ? undefined : interval,
              fileType: fileType === 'Excel' ? 1 : 0,
              isZip: true,
              isAlarmLacy: isAlarmLacy,
              isMerge: isFileMerge,
              zipFileList: [],
              responseType: 'blob'
            })
              .then(res => {
                if (
                  res.headers['content-type'] ===
                  'application/json; charset=utf-8'
                ) {
                  // blob转json
                  var reader = new FileReader()
                  reader.onload = e => {
                    const temp = JSON.parse(e.target.result)
                    this.$message(temp.Message)
                  }
                  reader.readAsText(res.data)
                } else {
                  const blob = new Blob([res.data])
                  const blobUrl = window.URL.createObjectURL(blob)
                  saveAs(
                    blobUrl,
                    `history${this._dateFormat(
                      startTime,
                      'YYYYMMDDHHmm'
                    )}_${this._dateFormat(endTime, 'YYYYMMDDHHmm')}.zip`
                  )
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('下载失败')
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            this.progressDialogVisible = true
            // eslint-disable-next-line no-inner-declarations
            const fetchData = (id, index, total) => {
              return downHistoryDataToExcelOrPdf({
                start: startTime,
                end: endTime,
                pointIdList: id,
                tmes: dataType === 1 ? undefined : interval,
                fileType: fileType === 'Excel' ? 1 : 0,
                isZip: index === total ? true : false,
                isAlarmLacy: isAlarmLacy,
                isMerge: isFileMerge,
                zipFileList: index === total ? this.fileList : [],
                responseType: index === total ? 'blob' : undefined
              })
            }
            const loop = async () => {
              for (
                let i = 1, total = this.pointIds.length + 1;
                i <= total;
                i++
              ) {
                if (i === total && !this.fileList.length) {
                  // 如果是最后一次请求，但fileList为空，也就是所有的点位都没有数据
                  this.$message('无文件可供下载，选中所有点位都没有数据')
                  continue
                }
                const res = await fetchData(
                  this.pointIds[i - 1],
                  i,
                  total
                ).catch(err => {
                  console.error(err)
                })

                // 如果是最后一次请求，结果返回的是文件流
                if (i === total) {
                  if (this.submitLoading) {
                    if (
                      res.headers['content-type'] ===
                      'application/json; charset=utf-8'
                    ) {
                      // blob转json
                      var reader = new FileReader()
                      reader.onload = e => {
                        const temp = JSON.parse(e.target.result)
                        this.$message(temp.Message)
                      }
                      reader.readAsText(res.data)
                      continue
                    }
                    const blob = new Blob([res.data])
                    const blobUrl = window.URL.createObjectURL(blob)
                    saveAs(
                      blobUrl,
                      `history${this._dateFormat(
                        startTime,
                        'YYYYMMDDHHmm'
                      )}_${this._dateFormat(endTime, 'YYYYMMDDHHmm')}.zip`
                    )
                  }
                } else {
                  if (res.data.Code === 200) {
                    this.fileList.push(...res.data.Data)
                  } else {
                    this.$notify.error({
                      title: '错误',
                      message: `第${i}个文件生成失败，失败原因：${res.data.Message}`
                    })
                  }
                  this.progressNumber = i
                }
              }
            }
            loop()
              .catch(err => {
                console.error(err)
              })
              .finally(() => {
                this.progressDialogVisible = false
                this.fileList = []
                setTimeout(() => {
                  this.progressNumber = 1
                }, 1000)
                this.submitLoading = false
              })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleTimeChange(start, end) {
      // 开始、结束时间差
      const diff = dayjs(end).diff(dayjs(start, 'day'))
      if (diff < oneMonthTime) {
        this.form.interval = 2
      } else if (diff > oneMonthTime && diff < oneSeasonTime) {
        this.form.interval = 10
      } else if (diff > oneSeasonTime && diff < halfYearTime) {
        this.form.interval = 20
      } else if (diff > halfYearTime && diff < oneYearTime) {
        this.form.interval = 60
      } else if (diff > oneYearTime) {
        this.form.interval = 120
      }
    }
  }
}
</script>

<style lang="scss">
.download-progress-dialog {
  .el-dialog__header {
    display: none;
  }
  .desc-text {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    .icon {
      font-size: 20px;
      margin-right: 10px;
    }
  }
}
</style>
