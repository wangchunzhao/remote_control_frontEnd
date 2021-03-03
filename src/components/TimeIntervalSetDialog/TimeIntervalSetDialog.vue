<template>
  <el-dialog
    title="时段设置"
    width="800px"
    top="100px"
    :visible.sync="dialogVisible"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    @close="handleClose"
    class="timeIntervalSetDialog"
  >
    <div>
      <!--      顶部设置区-->
      <div class="dialog-top">
        <div class="dialog-top-part">
          <div class="dialog-top-part-title">时段分类</div>
          <el-input
            type="number"
            :disabled="keyDown"
            v-model="type"
            size="mini"
            style="width: 80px"
          ></el-input>
        </div>
      </div>
      <div class="dialog-top-remind">
        按住「shift」键可进行批量框选
      </div>
      <!--      表哥区-->
      <div class="table-box">
        <div
          class="canvas-box"
          id="timeIntervalSetDialogCanvasBox"
          v-show="keyDown"
          @mousemove.self="mouseMove"
          @mousedown="mouseDown"
          @mouseup="mouseUp"
        >
          <div class="choose-area-box"></div>
        </div>

        <el-table
          v-loading="tableLoading"
          :data="timeIntervalList"
          :key="timeIntervalKey"
          stripe
          fit
          height="888px"
        >
          <el-table-column
            v-for="(item, index) in tableCols"
            :prop="item"
            :label="
              item === 'Title'
                ? ''
                : [
                    '未知',
                    '周日',
                    '周一',
                    '周二',
                    '周三',
                    '周四',
                    '周五',
                    '周六'
                  ][item]
            "
            :key="item + index"
          >
            <template slot-scope="{ row }">
              <div v-if="item === 'Title'" class="choose-item-row-title">
                {{ row.Title }}
              </div>
              <div v-else>
                <div
                  v-if="!keyDown"
                  class="table-select-item"
                  :style="{
                    'background-color': row[item]
                      ? bgColor[row[item]].color
                      : 'none'
                  }"
                >
                  <el-select
                    v-model="row[item]"
                    placeholder="请选择"
                    size="mini"
                    popper-class="timeIntervalSetDialog-select"
                  >
                    <el-option
                      v-for="item in typeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </div>
                <div v-else class="choose-item-select">
                  {{ row[item] }}
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer">
      <el-button
        size="medium"
        type="primary"
        @click.native="submit"
        :loading="submitLoading"
      >
        确 定
      </el-button>
    </div>
    <ChangeTimeIntervalDialog
      :appendToBody="true"
      :options="typeOptions"
      @changeType="changeTimeInterval"
      @changeModel="changeModel"
      ref="changeTimeIntervalDialog"
    ></ChangeTimeIntervalDialog>
  </el-dialog>
</template>

<script>
import { getTimeInterval, setTimeInterval } from '@/api/timeInterval'
import ChangeTimeIntervalDialog from './ChangeTimeIntervalDialog'
import { bgColor } from './itemStyleJs'
export default {
  components: {
    ChangeTimeIntervalDialog
  },
  props: {
    appendToBody: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    projectId: {
      type: Number,
      default: function() {
        return -1
      }
    },
    companyId: {
      type: Number,
      default: function() {
        return -1
      }
    }
  },
  watch: {
    type(val) {
      let typeOptions = []
      if (val) {
        for (let i = 0; i < val; i++) {
          typeOptions.push({
            label: 'T' + (i + 1),
            value: 'T' + (i + 1)
          })
        }
      } else {
        typeOptions = []
      }
      this.typeOptions = typeOptions
      if (val - 0 < 2) {
        this.$message.error('时段分类最小值为2')
        this.type = '2'
      } else {
        this.timeIntervalList.map(item => {
          if (val) {
            for (let i = 1; i <= 7; i++) {
              if (item[i + ''] && item[i + ''].indexOf('T') >= 0) {
                let Classify = item[i + ''].split('T')[1]
                if (val - 0 < Classify - 0) {
                  item[i + ''] = ''
                }
              }
            }
          } else {
            item['1'] = ''
            item['2'] = ''
            item['3'] = ''
            item['4'] = ''
            item['5'] = ''
            item['6'] = ''
            item['7'] = ''
          }
        })
        this.timeIntervalKey++
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      tableLoading: false,
      timeIntervalKey: 1,
      type: '', //时段分类
      typeOptions: [],
      chooseList: [], //框选列表
      timeIntervalList: [], // 时间数据列表
      tableCols: ['Title', '2', '3', '4', '5', '6', '7', '1'], // 表格标题列表
      form: undefined, //获取到的
      bgColor,

      changeBoxShowStatus: false, // 批量框选显示状态
      keyDown: false, // 当前模式 false:单选 true:批量框选
      canvas: null, // canvas实例
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isDown: false, //是否在框选区域按下鼠标
      chooseBoxDom: null,
      tableWidth: 95, // 框选表格单元宽度
      tableHeight: 35 // 框选表格单元高度
    }
  },
  methods: {
    // 获取随机颜色
    getRandomColor() {
      // return (
      //   '#' +
      //   (function(color) {
      //     return (color += '0123456789abcdef'[
      //       Math.floor(Math.random() * 16)
      //     ]) && color.length == 6
      //       ? color
      //       : arguments.callee(color)
      //   })('')
      // )
    },
    //更换时段设置模式
    changeModel() {
      this.resetChooseItem()
      this.changeBoxShowStatus = false
      this.keyDown = false
      this.canvas = null
      this.startX = 0
      this.startY = 0
      this.endX = 0
      this.endY = 0
      this.isDown = false //是否在框选区域按下鼠标
    },
    // 鼠标移动
    mouseMove(e) {
      if (this.isDown) {
        this.endX = e.offsetX
        this.endY = e.offsetY
        if (this.endX < this.startX) {
          this.chooseBoxDom.style.left = this.endX + 'px'
        }
        if (this.endY < this.startY) {
          this.chooseBoxDom.style.top = this.endY + 'px'
        }
        let width = this.endX - this.startX
        let height = this.endY - this.startY
        width = width < 0 ? width * -1 : width
        height = height < 0 ? height * -1 : height
        this.chooseBoxDom.style.width = width + 'px'
        this.chooseBoxDom.style.height = height + 'px'
      }
    },
    //松开鼠标
    mouseUp(e) {
      this.isDown = false
      this.filterTimeInterval()
    },
    // 按下鼠标
    mouseDown(e) {
      this.resetChooseItem()
      this.isDown = true
      let chooseBoxDom = document.getElementsByClassName('choose-area-box')[0]
      chooseBoxDom.style.left = e.offsetX + 'px'
      chooseBoxDom.style.top = e.offsetY + 'px'
      this.chooseBoxDom = chooseBoxDom
      this.startX = e.offsetX
      this.startY = e.offsetY
    },
    // 筛选框选的单元
    filterTimeInterval() {
      let isNomal = this.startX < this.endX
      let startX = isNomal ? this.startX : this.endX
      let startY = isNomal ? this.startY : this.endY
      let endX = isNomal ? this.endX : this.startX
      let endY = isNomal ? this.endY : this.startY
      let startRowNum = Math.ceil(startY / this.tableHeight)
      let startColumnNum = Math.ceil(startX / this.tableWidth)
      let endRowNum = Math.ceil(endY / this.tableHeight)
      let endColumnNum = Math.ceil(endX / this.tableWidth)
      let startRow = startRowNum < endRowNum ? startRowNum : endRowNum
      let startColumn =
        startColumnNum < endColumnNum ? startColumnNum : endColumnNum
      let endRow = startRowNum < endRowNum ? endRowNum : startRowNum
      let endColumn =
        startColumnNum < endColumnNum ? endColumnNum : startColumnNum
      let chooseList = []
      for (let i = 1; i <= 24; i++) {
        if (i >= startRow && i <= endRow) {
          for (let j = 1; j <= 7; j++) {
            if (j >= startColumn && j <= endColumn) {
              chooseList.push({
                Hour: i - 1 < 10 ? `0${i - 1}` : i - 1 + '',
                Week: j === 7 ? 1 : j + 1
              })
            }
          }
        }
      }
      if (chooseList.length) {
        this.chooseList = chooseList
        this.changeBoxShowStatus = true
        this.$refs.changeTimeIntervalDialog.openDialog(chooseList)
      } else {
        this.chooseList = []
        this.$message.error('请至少选中一个单元格')
      }
    },
    // 重置框选数据
    resetChooseItem() {
      if (this.chooseBoxDom) {
        this.chooseBoxDom.style.width = '0px'
        this.chooseBoxDom.style.height = '0px'
      }
      this.chooseBoxDom = null
      this.startX = 0
      this.startY = 0
      this.endX = 0
      this.endY = 0
    },
    // 批量更改时段
    changeTimeInterval(val) {
      let list = []
      this.chooseList.map(item => {
        let flag = false
        for (let i = 0; i < list.length; i++) {
          if (list[i].Hour === item.Hour) {
            flag = true
            list[i][item.Week + ''] = val
          }
        }
        if (!flag) {
          let obj = {
            Hour: item.Hour
          }
          obj[item.Week + ''] = val
          list.push(obj)
        }
      })
      list.map(item => {
        for (let i = 0; i < this.timeIntervalList.length; i++) {
          if (item.Hour === this.timeIntervalList[i].Hour) {
            this.timeIntervalList[i] = Object.assign(
              this.timeIntervalList[i],
              item
            )
          }
        }
      })
    },
    openDialog() {
      this.dialogVisible = true
      this.tableLoading = true
      this.typeOptions = []
      document.onkeydown = e => {
        if (
          e.keyCode &&
          e.keyCode === 16 &&
          this.dialogVisible &&
          !this.changeBoxShowStatus
        ) {
          this.resetChooseItem()
          this.keyDown = true
          this.$message('您已进入框选模式')
        }
      }
      document.onkeyup = e => {
        if (this.keyDown && this.dialogVisible && !this.changeBoxShowStatus) {
          this.resetChooseItem()
          this.keyDown = false
          this.canvas = null
          this.startX = 0
          this.startY = 0
          this.endX = 0
          this.endY = 0
          this.isDown = false //是否在框选区域按下鼠标
        }
      }
      getTimeInterval({
        projectId: this.projectId,
        companyId: this.companyId
      })
        .then(res => {
          if (res.data.Code === 200) {
            let timeIntervalList = new Array(24)
            if (
              res.data.Data &&
              res.data.Data.TimeIntervalItemList &&
              res.data.Data.TimeIntervalItemList.length
            ) {
              this.form = res.data.Data
              this.type = res.data.Data.Classify
              let list = res.data.Data.TimeIntervalItemList
              list.map(item => {
                timeIntervalList[item.Hour - 0] = timeIntervalList[
                  item.Hour - 0
                ]
                  ? timeIntervalList[item.Hour - 0]
                  : {}
                timeIntervalList[item.Hour - 0]['Title'] = item.Hour + ':00'
                timeIntervalList[item.Hour - 0]['Hour'] = item.Hour
                timeIntervalList[item.Hour - 0][
                  ['0', '1', '2', '3', '4', '5', '6', '7'][item.Week]
                ] = item.Classify
              })
            } else {
              this.type = '2'
              for (let i = 0; i < timeIntervalList.length; i++) {
                timeIntervalList[i] = {
                  Title: i < 10 ? '0' + i + ':00' : i + ':00',
                  Hour: i < 10 ? '0' + i : i + '',
                  '1': 'T1',
                  '2': 'T1',
                  '3': 'T1',
                  '4': 'T1',
                  '5': 'T1',
                  '6': 'T1',
                  '7': 'T1'
                }
              }
            }
            this.timeIntervalList = timeIntervalList
          } else {
            this.$message.error('获取时段失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取时段失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    handleClose() {
      this.resetChooseItem()
      this.dialogVisible = false
      this.keyDown = false
      this.submitLoading = false
    },
    submit() {
      if (!this.type) {
        this.$message.error('请设置时段分类')
        return
      } else if (this.type - 0 < 2) {
        this.$message.error('时段分类最小值为2')
        return
      }
      let timeIntervalList = []
      for (let j = 0; j < this.timeIntervalList.length; j++) {
        for (let i = 1; i <= 7; i++) {
          if (!this.timeIntervalList[j][i + '']) {
            this.$message.error('请设置所有时段后上传')
            return
          }
          let obj = {
            Hour: this.timeIntervalList[j].Hour,
            Week: i,
            Classify: this.timeIntervalList[j][i + '']
          }
          if (this.form) {
            obj.TimeIntervalId = this.form.TimeIntervalId
          }
          timeIntervalList.push(obj)
        }
      }
      this.submitLoading = true
      let data = {
        ProjectId: this.projectId,
        CompanyId: this.companyId,
        Classify: this.type - 0,
        TimeIntervalItemList: timeIntervalList
      }
      if (this.form) {
        data.TimeIntervalId = this.form.TimeIntervalId
      }
      setTimeInterval(data)
        .then(res => {
          if (res.data.Code === 200 && res.data.Data) {
            this.$message.success('设置时段成功')
            this.$emit('refresh')
            this.handleClose()
          } else {
            this.$message.error(res.data.Message)
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('设置时段失败')
        })
    }
  }
}
</script>

<style lang="scss">
.timeIntervalSetDialog {
  .dialog-top {
    display: flex;
  }
  .dialog-top-part {
    margin-right: 15px;
    display: flex;
    align-items: center;
  }
  .dialog-top-part-title {
    margin-right: 5px;
  }
  .dialog-top-remind {
    margin-top: 5px;
    margin-bottom: 20px;
    text-align: left;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 20px;
  }
  .table-select-item {
    border-radius: 4px;
  }
  .choose-item-row-title {
    user-select: none;
  }
  .choose-item {
    user-select: none;
    border-radius: 4px;
    width: 85px;
    height: 28px;
    line-height: 28px;
    text-align: center;
  }
  .choose-item-select {
    user-select: none;
    border-radius: 4px;
    width: 85px;
    height: 28px;
    line-height: 28px;
    text-align: center;
  }
  tbody td {
    padding-top: 3px;
    padding-bottom: 3px;
  }
  .cell {
    text-align: center;
  }
  tbody {
    .cell {
      padding: 0 5px;
    }
    .el-input__inner {
      user-select: none;
      border: none;
      color: #000;
    }
    input {
      user-select: none;
      background: none;
    }
    .el-select .el-input .el-select__caret {
      color: #000;
    }
  }
  .table-box {
    position: relative;
  }
  .canvas-box {
    z-index: 2;
    position: absolute;
    left: 95px;
    top: 48px;
    //background: blue;
    //opacity: 0.2;
    width: 665px;
    height: 840px;
  }
  .choose-area-box {
    z-index: 3;
    position: absolute;
    background: red;
    opacity: 0.4;
  }
}
</style>
