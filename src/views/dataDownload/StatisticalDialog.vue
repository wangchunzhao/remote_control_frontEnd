<template>
  <el-dialog
    width="720px"
    title="下载数据"
    :visible.sync="dialogVisible"
    @close="handleClose"
  >
    <div style="position: fixed;right: 999999px;bottom: 99999px">
      <!--    <div>-->
      <HistoryListDialog
        v-for="index of canvasNum"
        :key="index"
        :canvasIndex="index"
        :groupList="groupList"
        @dramImgCallback="dramImgCallback"
        :interval="30"
        :rangeType="rangeType"
        :startTime="new Date(form.startTime)"
        :endTime="new Date(form.endTime)"
        :ref="'historyListDialog' + index"
      />
    </div>
    <div style="z-index: 99999">
      <!--      <div v-for="(item, index) in canvasImgArr" :key="index">-->
      <!--        <img :src="item.img" alt="" />-->
      <!--      </div>-->
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        inline
        label-width="100px"
        size="small"
      >
        <el-form-item label="文件类型：" required>
          <el-radio v-model="form.fileType" label="pdf">PDF</el-radio>
        </el-form-item>
        <el-form-item label="时间范围：" style="margin-bottom: 0;">
          <el-form-item label="" prop="startTime">
            <el-date-picker
              v-model="form.startTime"
              format="yyyy-MM-dd HH:mm"
              :disabled="submitLoading || !canEdit"
              @change="
                () => {
                  rangeType = undefined
                }
              "
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
              format="yyyy-MM-dd HH:mm"
              :disabled="submitLoading || !canEdit"
              @change="
                () => {
                  rangeType = undefined
                }
              "
              :editable="false"
              type="datetime"
              placeholder="选择日期"
              style="width: 175px;"
            />
          </el-form-item>
          <el-radio-group
            v-model="rangeType"
            size="small"
            :disabled="submitLoading || !canEdit"
            @change="changeRangeType"
            style="margin-left: 10px;"
          >
            <el-radio-button label="昨天"></el-radio-button>
            <el-radio-button label="上周"></el-radio-button>
            <el-radio-button label="上月"></el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button
          :loading="submitLoading || !canEdit"
          size="medium"
          type="primary"
          @click.native="drawChildrenCanvas"
          >下 载</el-button
        >
      </span>
    </div>
  </el-dialog>
</template>

<script>
import { getPointStatisticData } from '@/api/device_new'
import { htmlToPdf } from '@/api/uploader'
import HistoryListDialog from './HistoryListDialog'
import dayjs from 'dayjs'
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

export default {
  props: {
    pointIds: Array,
    multipleSelection: Array
  },
  components: { HistoryListDialog },
  data() {
    return {
      dialogVisible: false,
      canEdit: true,
      canvasNum: 1, // 曲线图数量
      canvasImgArr: [],
      groupList: [], // 按设备分组
      form: {
        fileType: 'pdf',
        startTime: lastDay[0],
        endTime: lastDay[1]
      },
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
        ]
      },
      submitLoading: false,
      canvasDataNum: 10 // 每个曲线图最多折线数量
    }
  },
  methods: {
    canvasGrouping() {
      let map = {},
        dest = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        let ai = this.multipleSelection[i]
        if (!map[ai.PointTypeId]) {
          dest.push({
            id: ai.id,
            name: ai.name,
            PointTypeId: ai.PointTypeId,
            typeCn: ai.typeCn,
            canvasNum: 1, // 该类型点位 曲线图数量
            data: [ai], // 点位列表
            idList: [ai.id] // 点位ID列表
          })
          map[ai.PointTypeId] = ai
        } else {
          for (let j = 0; j < dest.length; j++) {
            let dj = dest[j]
            if (dj.PointTypeId == ai.PointTypeId) {
              dj.data.push(ai)
              dj.idList.push(ai.id)
              break
            }
          }
        }
      }
      this.canvasNum = dest.length
      dest.map(item => {
        let dataLength = Math.ceil(item.data.length / this.canvasDataNum)
        item.canvasNum = dataLength
        if (dataLength > 1) {
          this.canvasNum += dataLength - 1
        }
      })

      this.groupList = dest
    },
    openDialog() {
      this.canvasGrouping() // 给选择的数据分组（按点位类型分组）

      this.dialogVisible = true
      this.canvasImgArr = []
      this.canEdit = true
      this.submitLoading = false
      let _this = this
      // canvas初始化
      setTimeout(() => {
        for (let i = 1; i <= _this.canvasNum; i++) {
          this.canvasImgArr.push({
            finished: false, // canvas完成状态（只表示渲染完成，不表示渲染成功）
            img: '', // 图片base64
            canvasIndex: i - 1 // 下标
          })

          if (
            _this.$refs[`historyListDialog${i}`] &&
            _this.$refs[`historyListDialog${i}`][0]
          ) {
            _this.$refs[`historyListDialog${i}`][0].customDialog()
          }
        }
      })
    },
    // 渲染canvas
    drawChildrenCanvas() {
      let _this = this
      this.canEdit = false
      this.submitLoading = true
      this.canvasImgArr.map(item => {
        item.finished = false
        item.data = [] // 该曲线图对应的数据列表
        item.idList = [] // 该曲线图对应的ID列表
      })
      setTimeout(() => {
        for (let i = 1; i <= _this.canvasNum; i++) {
          if (
            _this.$refs[`historyListDialog${i}`] &&
            _this.$refs[`historyListDialog${i}`][0]
          ) {
            _this.$refs[`historyListDialog${i}`][0].fetchChartSeries()
          }
        }
      })
    },
    dramImgCallback(obj = {}) {
      // 依据曲线图下标替换数据
      this.canvasImgArr[obj.canvasIndex] = {
        ...obj
      }
      let canEdit = true
      // 判断所有曲线图是否渲染完成
      this.canvasImgArr.map(item => {
        if (!item.finished) {
          canEdit = false
        }
      })
      this.canEdit = canEdit
      // 所有曲线渲染完成，提交绘制PDF
      if (canEdit) {
        this.submitForm()
      }
    },
    handleClose() {
      let _this = this
      for (let i = 1; i <= _this.canvasNum; i++) {
        if (
          _this.$refs[`historyListDialog${i}`] &&
          _this.$refs[`historyListDialog${i}`][0]
        ) {
          _this.$refs[`historyListDialog${i}`][0].handleClose()
        }
      }
      this.form.startTime = lastDay[0]
      this.form.endTime = lastDay[1]
      this.rangeType = '昨天'
      this.dialogVisible = false
      // this.form.startTime = lastDay[0]
      // this.form.endTime = lastDay[1]
      // this.rangeType = '昨天'
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
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const { startTime, endTime } = this.form
          getPointStatisticData({
            start: this._dateFormat(startTime, 'YYYY-MM-DD HH:mm'),
            end: this._dateFormat(endTime, 'YYYY-MM-DD HH:mm'),
            pointIdList: this.pointIds
          })
            .then(res => {
              if (res.data.Code === 200) {
                const data = res.data.Data
                if (!data.PointList) {
                  this.$message('当前选中点位无统计数据')
                  this.submitLoading = false
                  return
                }
                let PointList = data.PointList
                let pdfPart = ''

                // 表格分类
                for (let i = 0; i < this.canvasImgArr.length; i++) {
                  let canvasTable = ''
                  let canvasTableList = []
                  let data = this.canvasImgArr[i].data
                  data.map(item => {
                    for (let j = 0; j < PointList.length; j++) {
                      if (item.id === PointList[j].PointId) {
                        canvasTableList.push(PointList[j])
                      }
                    }
                  })
                  canvasTableList.map(item => {
                    canvasTable += `
                      <tr>
                        <th>${item.PointName}</th>
                        <th>${item.Max}</th>
                        <th>${item.Min}</th>
                        <th>${item.Avg}</th>
                      </tr>
                    `
                  })

                  // PDF单元（一个折线图+一个表格）
                  pdfPart += `
                  <div style="width: 100%;background: #fff">
                    <div style="margin: 40px 0 15px 0;font-weight: bold;font-size: 16px;">历史数据曲线</div>
                    <div style="width: 100%;background: #fff">
                      <img src="${this.canvasImgArr[i].img}" alt="" style="display: block;width: 100%;height: auto">
                    </div>
                    <div style="margin-bottom: 15px;font-weight: bold;font-size: 16px;">历史数据统计</div>
                    <div style="box-sizing: border-box;width: 100%;padding: 0 30px">
                      <table v-if="data" border="1" style="width: 100%;">
                        <tr>
                          <th>点位</th>
                          <th>最大值</th>
                          <th>最小值</th>
                          <th>平均值</th>
                        </tr>
                        ${canvasTable}
                      </table>
                    </div>
                    <div style="width: 100%;height: 2px;background: #c9c9c9;margin: 30px 0"></div>
                  </div>
                  `
                }
                // 总PDF
                let htmlText = `
              <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <meta http-equiv="X-UA-Compatible" content="ie=edge">
                  <title>Document</title>
                </head>
                <style>
                  table {
                    border-collapse: collapse;
                  }
                  table, th, td {
                    border: 1px solid #ccc;
                    text-align: center;
                  }
                  th, td {
                    padding: 6px 15px;
                    font-weight: bold;
                    color: #3c3c3c
                  }
                  img{
                    width: 100%;
                    height: auto;
                  }
                </style>
              <body>
                <div style="text-align: center;margin: 25px 0;font-weight: bold;font-size: 20px;">${
                  this.$store.state.app.company.label
                }（${
                  this.$store.state.app.project.ProjectName
                }）（ ${this._dateFormat(
                  startTime,
                  'YYYY-MM-DD HH:mm'
                )} 至 ${this._dateFormat(endTime, 'YYYY-MM-DD HH:mm')}）
                </div>
                <div style="width: 100%">${pdfPart}</div>
              </body>
              </html>
            `
                const formData = new FormData()
                formData.append('BucketName', 'back-end-assets')
                formData.append('ObjectName', 'Temp/')
                formData.append('htmlText', htmlText)
                htmlToPdf(formData)
                  .then(({ data }) => {
                    if (data.Code === 200) {
                      window.open(data.Data, '_blank')
                    } else {
                      this.$message.error('导出失败')
                    }
                  })
                  .catch(err => {
                    console.error(err)
                    this.$message.error('导出失败')
                  })
                  .finally(() => {
                    this.submitLoading = false
                  })
              } else {
                this.$message.error('导出失败')
                this.submitLoading = false
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('导出失败')
              this.submitLoading = false
            })
        } else {
          console.log('error submit!!')
          this.submitLoading = false
          return false
        }
      })
    }
  }
}
</script>
