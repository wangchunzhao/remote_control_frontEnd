<template>
  <el-row
    :gutter="20"
    class="dataenter content-box"
    style="position:relative;margin: 24px auto 24px auto !important;background: transparent;padding: 8px 15px;"
  >
    <el-col :span="24" class="commonWrapper">
      <div class="commonBox clear-fix bg-fff" style="margin-bottom:20px">
        <el-col :span="24" class="commonHeader">
          <c-svg name="bar_chart" class-name="commonImg" />
          <span class="commonTitle">数据录入</span>
        </el-col>
        <el-col :span="24" style="padding-top:10px;">
          <div class="enterList">
            <span class="enterCondition">录入类型</span>
            <el-select v-model="InputType" size="small" style="width:114px;">
              <el-option
                v-for="item in optionType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="enterList">
            <span class="enterCondition">能源类型</span>
            <el-select
              v-model="dtids"
              style="width:114px;"
              size="small"
              @change="change1"
            >
              <el-option
                v-for="item in optionsOnes"
                :key="item.dtid"
                :label="item.dtname"
                :value="item.dtid"
              />
            </el-select>
          </div>
          <div class="enterList">
            <span class="enterCondition">录入值类型</span>
            <el-select
              v-model="insertType"
              placeholder="————"
              style="width:114px;"
              size="small"
            >
              <el-option
                v-for="item in options2"
                :key="item.dtid"
                :label="item.dtname"
                :value="item.dtid"
              />
            </el-select>
          </div>
          <div class="enterList">
            <div class="selecter">
              <input v-model="Name" class="inputCondition" placeholder="区域" />
              <c-svg
                name="close"
                class-name="icon-close"
                @click.native="clearInput"
              />
            </div>
            <el-button
              class="selectBtn"
              style="margin-left:-5px;line-height:0;"
              @click="chosePoint"
            >
              选择
            </el-button>
            <div v-show="showPoint" class="treeList">
              <div
                :span="24"
                style="height:32px;line-height:32px;border-bottom:1px solid #F3F5F9;font-size:18px;margin:0 0 10px 20px;"
              >
                选择节点
              </div>
              <div>
                <el-tree
                  :data="energyListTwo"
                  class="thin-scroll"
                  :default-expand-all="true"
                  :props="defaultPropsTwo"
                  :highlight-current="true"
                  @node-click="handleNodeClick2"
                />
              </div>
              <div :span="24" style="text-align: center; margin: 0 auto;">
                <el-button
                  size="small"
                  type="text"
                  class="btn btnCancel"
                  @click="cancle"
                >
                  取消
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  class="btn btnSave"
                  @click="save"
                >
                  确定
                </el-button>
              </div>
            </div>
          </div>
          <div class="enterList">
            <span class="enterCondition">设备列表</span>
            <el-select
              v-model="deviceList"
              style="width:114px;height:36px;"
              size="small"
            >
              <el-option
                v-for="item in options3"
                :key="item.point"
                :label="item.pname"
                :value="item.point"
                style="font-size:14px;"
              />
            </el-select>
          </div>
          <div class="enterList">
            <el-date-picker
              v-model="datatime"
              :editable="false"
              type="datetime"
              placeholder="日期"
              :picker-options="pickerOptions0"
              style="width:190px;color:#324057;"
              size="small"
            />
          </div>
          <div class="enterList">
            <el-tooltip
              class="item"
              effect="dark"
              content="历史参考值:0kwh"
              placement="top"
            >
              <input
                id="insertNum"
                v-model="value4"
                placeholder="请输入数值型数据"
                class="enterInput1"
                style="width:130px;"
              />
            </el-tooltip>
            <el-button
              class="insertBtn"
              style="margin-left:-5px;"
              type="primary"
              size="small"
              @click="insertBtn"
            >
              录入
            </el-button>
          </div>
        </el-col>
      </div>
    </el-col>
    <el-col :span="24">
      <div class="left commonWrapper">
        <div class="energy-left commonBox bg-fff">
          <el-col :span="24" class="commonHeader">
            <c-svg name="bar_chart" class-name="commonImg" />
            <span class="commonTitle">数据查询</span>
          </el-col>
          <el-col :span="24" class="time">
            <el-date-picker
              v-model="startDate"
              type="date"
              :editable="false"
              placeholder="开始日期"
              :picker-options="startDateOptions"
              style="margin-bottom:10px;width:49%;font-size:12px;color:#324057;"
              size="small"
              class="prefix-suffix-icon"
              @change="handleChange"
            />
            <el-date-picker
              v-model="endDate"
              type="date"
              :editable="false"
              placeholder="结束日期"
              :picker-options="endDateOptions"
              style="margin-bottom:10px;width:49%;font-size:12px;color:#324057;"
              size="small"
              class="prefix-suffix-icon"
            />
          </el-col>
          <el-col :span="24">
            <el-button
              style="width:100%;font-size:14px;color:#fff;"
              type="primary"
              size="small"
              @click="queryBtn"
            >
              确认查询
            </el-button>
          </el-col>
          <el-col :span="24" class="tabChose">
            <el-tabs v-model="activeName">
              <el-tab-pane label="业态功能" name="first">
                <el-select
                  v-model="dtid"
                  style="width:40%;margin-bottom:25px;"
                  size="small"
                  @change="changeOne"
                  @visible-change="visiblechange"
                >
                  <el-option
                    v-for="item in optionsOne"
                    :key="item.dtid"
                    :label="item.dtname"
                    :value="item.dtid"
                  />
                </el-select>
                <el-tree
                  ref="treeyetai"
                  :data="energyListOne"
                  node-key="no"
                  class="thin-scroll"
                  :props="defaultPropsOne"
                  :default-expand-all="true"
                  :highlight-current="true"
                  @node-click="handleNodeClickOne"
                />
              </el-tab-pane>
              <el-tab-pane label="区域位置" name="second">
                <el-select
                  v-model="tid"
                  style="width:40%;margin-bottom:25px;"
                  size="small"
                  @change="changeTwo"
                  @visible-change="visiblechange"
                >
                  <el-option
                    v-for="item in optionsTwo"
                    :key="item.dtid"
                    :label="item.dtname"
                    :value="item.dtid"
                  />
                </el-select>
                <el-select
                  v-model="value"
                  style="width:49%;"
                  placeholder="————"
                  size="small"
                  @change="changeThree"
                >
                  <el-option
                    v-for="item in optionsThree"
                    :key="item.dtid"
                    :label="item.dtname"
                    :value="item.dtid"
                  />
                </el-select>
                <el-tree
                  ref="treequyu"
                  :data="energyListTwo"
                  node-key="no"
                  class="thin-scroll"
                  :props="defaultPropsTwo"
                  :default-expand-all="true"
                  :highlight-current="true"
                  @node-click="handleNodeClickTwo"
                />
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </div>
      </div>
      <div class="right commonWrapper">
        <el-col :span="24" style="padding-right:0">
          <div class="commonBox insertList bg-fff">
            <el-col :span="24" class="commonHeader">
              <c-svg name="table" class-name="commonImg" />
              <span class="commonTitle">数据录入</span>
            </el-col>
            <el-col :span="24" class="thin-scroll" style="margin-top:10px;">
              <el-table :data="dataList" highlight-current-row max-height="580">
                <el-table-column type="index" width="80" />
                <el-table-column prop="area" label="监测区域" />
                <el-table-column prop="pname" label="监测点" />
                <el-table-column prop="value" label="值" align="right" />
                <el-table-column prop="unit" label="单位" />
                <el-table-column
                  prop="updateTime"
                  label="录入时间"
                  :formatter="formatter"
                />
                <el-table-column label="数据链接">
                  <template>
                    <el-button size="small">
                      <c-svg name="chart" />
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column prop="datavalue" label="能耗统计">
                  <template>
                    <el-button size="small">
                      <c-svg name="nenghao_1" />
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column prop="datavalue" label="报警设置">
                  <template>
                    <el-button size="small">
                      <c-svg name="configicon" />
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column label="类型">
                  <template>
                    <span>状态</span>
                  </template>
                </el-table-column>
              </el-table>
              <!--分页小工具-->
              <el-pagination
                background
                :current-page="Pagesize"
                :page-sizes="[15, 25, 50]"
                :page-size="show_number"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                style="margin-top:10px;float:right;"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </el-col>
          </div>
        </el-col>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import {
  fetchEnergyTypeTopList,
  fetchEnergyTypeList,
  fetchEnergy_type,
  fetchEnergy_tree,
  addDataInput,
  queryPointsList,
  queryData_InputList,
  queryData_InputCount
} from '@/api/energy.js'
import { storageName } from '@/utils/index'

export default {
  data() {
    return {
      energyListOne: [],
      defaultPropsOne: {
        children: 'Child',
        label: 'name'
      },
      energyListTwo: [],
      defaultPropsTwo: {
        children: 'Child',
        label: 'mname'
      },
      activeName: 'first',
      startDateOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      endDateOptions: {
        disabledDate(time) {
          return (
            time.getTime() < Date.now() - 8.64e7 || time.getTime() > Date.now()
          )
        }
      },
      pickerOptions0: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      startDate: Date.now(),
      endDate: Date.now(),
      optionsOne: [
        {
          dtid: '',
          dtname: ''
        }
      ],
      dtid: '',
      optionsOnes: [
        {
          dtid: '',
          dtname: ''
        }
      ],
      dtids: '',
      optionsTwo: [
        {
          dtid: '',
          dtname: ''
        }
      ],
      tid: '',
      optionsThree: [
        {
          dtid: '',
          dtname: ''
        }
      ],
      value: '',
      datatime: '',
      options2: [
        {
          dtid: '',
          dtname: ''
        }
      ],
      insertType: '',
      options3: [
        {
          point: '',
          pname: ''
        }
      ],
      deviceList: '',
      Name: '',
      value4: '',
      dataList: [],
      showPoint: false,
      show_number: 15, // 每页显示记录条数
      Pagesize: 1, // 当前页码
      total: 0,
      dataOne: [],
      dataTwo: [],
      subid: '',
      dtypeid: '',
      name: '',
      subid1: '',
      subid2: '',
      dtypeid1: '',
      name1: '',
      name2: '',
      functiontype: 0,
      optionType: [
        {
          label: '表头值',
          value: 0
        },
        {
          label: '消耗值',
          value: 1
        }
      ],
      InputType: 0,
      selectedid: null,
      vchange: false
    }
  },
  mounted: function() {
    this.selectedid = JSON.parse(
      sessionStorage.getItem(storageName('project'))
    ).id
    // 获取能耗类型列表
    fetchEnergyTypeTopList()
      .then(res => {
        var result = JSON.parse(res.data)
        if (result.success) {
          this.optionsOne = result.list
          this.dtid = this.optionsOne[1].dtid
          this.optionsOnes = result.list
          this.dtids = this.optionsOnes[1].dtid
          this.optionsTwo = result.list
          this.tid = this.optionsTwo[1].dtid
          this.dtypeid = this.dtid
          this.GetEnergyTypeList(this.dtid)
          this.GetEnergy_tree(this.selectedid, this.dtid)
          // 获取能耗业态功能树结构
          fetchEnergy_type(this.selectedid, 0, this.dtid)
            .then(res => {
              var result_t = JSON.parse(res.data)
              if (result_t.success) {
                this.energyListOne = result_t.list
                this.subid = this.energyListOne[0].mtid
                this.dtypeid = this.energyListOne[0].tid
                this.name = this.energyListOne[0].name
                this.subid1 = this.energyListOne[0].mtid
                this.dtypeid1 = this.energyListOne[0].tid
                this.$nextTick(() => {
                  this.$refs.treeyetai.setCurrentKey(this.energyListOne[0].no)
                })
                this.name1 = this.energyListOne[0].name
                this.functiontype = 0
                // 默认显示的数据
                this.startDate =
                  new Date(this.startDate).format('yyyy/MM/dd') + '   00:00:00'
                this.endDate =
                  new Date(this.endDate).format('yyyy/MM/dd') + '   23:59:59'
                // 数据录入记录
                this.QueryData_InputList(this.selectedid)
                this.QueryData_InputCount(this.selectedid)
              }
            })
            .catch(err => {
              console.error(err)
            })
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    // 处理结束时间范围限制
    handleChange(date) {
      this.endDateOptions = {
        disabledDate(time) {
          return (
            time.getTime() < new Date(date).getTime() ||
            time.getTime() > Date.now()
          )
        }
      }
    },
    // 时间格式处理
    formatter(row, column) {
      return row[column.property].replace('T', ' ')
    },
    visiblechange() {
      this.vchange = true // 控制初始化加载下拉框
    },
    // 业内动态下拉框change事件
    changeOne: function() {
      if (this.vchange) {
        this.dtypeid = this.dtid
        fetchEnergy_type(this.selectedid, 0, this.dtypeid)
          .then(res => {
            var resultT = JSON.parse(res.data)
            if (resultT.success) {
              this.energyListOne = resultT.list
              this.subid1 = this.energyListOne[0].mtid
              this.dtypeid1 = this.energyListOne[0].tid
              this.name1 = this.energyListOne[0].name
            } else {
              this.energyListOne = []
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    // 区域位置下拉框change事件
    changeTwo: function() {
      if (this.vchange) {
        this.typeid = this.tid
        this.value = ''
        fetchEnergyTypeList(this.typeid)
          .then(res => {
            var result_tl = JSON.parse(res.data)
            if (result_tl.success) {
              this.optionsThree = result_tl.list
            }
          })
          .catch(err => {
            console.error(err)
          })
        fetchEnergy_tree(this.selectedid, 0, this.typeid)
          .then(res => {
            var data = JSON.parse(res.data)
            if (data.success) {
              this.energyListTwo = data.list
              this.subid2 = this.energyListTwo[0].mtid
              this.name2 = this.energyListTwo[0].mname
              this.dtypeid2 = this.tid
            } else {
              this.energyListTwo = []
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    changeThree: function() {
      this.dtypeid = this.value
      if (this.value.length > 0) {
        fetchEnergy_tree(this.selectedid, 0, this.dtypeid)
          .then(res => {
            var data = JSON.parse(res.data)
            if (data.success) {
              this.energyListTwo = JSON.parse(res.data).list
              this.subid2 = this.energyListTwo[0].mtid
              this.name2 = this.energyListTwo[0].mname
              this.dtypeid2 = this.value
            } else {
              this.energyListTwo = []
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    change1: function() {
      if (this.vchange) {
        this.typeid = this.dtids
        this.insertType = ''
        fetchEnergyTypeList(this.typeid)
          .then(res => {
            var result_T = JSON.parse(res.data)
            if (result_T.success) {
              this.options2 = result_T.list
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    queryBtn() {
      if (this.activeName === 'first') {
        this.subid = this.subid1
        this.name = this.name1
        this.dtypeid = this.dtypeid1
      } else {
        this.subid = this.subid2
        this.name = this.name2
      }
      if (this.startDate === undefined || this.startDate === '') {
        this.$message({
          message: '请选择查询的开始时间',
          type: 'warning'
        })
        return
      } else {
        this.startDate = new Date(this.startDate).format('yyyy/MM/dd') // 开始时间
      }
      if (this.endDate === undefined || this.endDate === '') {
        this.$message({
          message: '请选择查询的结束时间',
          type: 'warning'
        })
        return
      } else {
        this.endDate = new Date(this.endDate).format('yyyy/MM/dd') // 结束时间
      }
      if (this.startDate === this.endDate) {
        this.startDate = this.startDate + '   00:00:00'
        this.endDate = this.endDate + '   23:59:59'
      }
      this.QueryData_InputList(this.selectedid)
      this.QueryData_InputCount(this.selectedid)
    },
    // 录入
    insertBtn() {
      if (this.insertType.length === 0) {
        this.$message('请先选择录入值类型')
        return
      }
      if (this.Name.length === 0) {
        this.$message('请选择区域')
        return
      }
      if (this.deviceList.length === 0) {
        this.$message('请选择设备')
        return
      }
      if (this.datatime.length === 0) {
        this.$message('请选择日期')
        return
      }
      var insertNum
      if (this.value4.length === 0) {
        insertNum = document.getElementById('insertNum')
        insertNum.style.border = '1px solid red'
        return
      } else {
        var reg1 = /^[1-9]\d*$|^0$/
        if (!reg1.test(this.value4)) {
          insertNum = document.getElementById('insertNum')
          insertNum.style.border = '1px solid red'
          this.$message('请填写数值型数据')
          return
        }
      }
      var updateTime = new Date(this.datatime).format('yyyy/MM/dd hh:mm:ss')
      var userInfo = JSON.parse(sessionStorage.getItem(storageName('userInfo')))
      addDataInput({
        InputType: this.InputType,
        point: this.deviceList,
        mtid: this.Mtid,
        value: this.value4,
        updateTime: updateTime,
        updateUser: userInfo.nickname
      })
        .then(res => {
          var result = JSON.parse(res.data)
          if (result.success) {
            this.$message({
              message: '录入成功',
              type: 'success'
            })
            this.insertType = ''
            this.Name = ''
            this.deviceList = ''
            this.datatime = ''
            this.value4 = ''
            this.QueryData_InputList(this.selectedid)
            this.QueryData_InputCount(this.selectedid)
          } else {
            this.$message.error(result.msg)
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    handleNodeClickOne(energyListOne) {
      this.subid1 = energyListOne.mtid
      this.dtypeid = energyListOne.tid
      this.name1 = energyListOne.name
      this.functiontype = 0
    },
    handleNodeClickTwo(energyListTwo) {
      this.subid2 = energyListTwo.mtid
      this.name2 = energyListTwo.mname
      if (this.value) {
        this.dtypeid = this.value
      } else {
        this.dtypeid = this.dtid
      }
      this.functiontype = 1
    },
    chosePoint() {
      this.showPoint = true
    },
    handleNodeClick2(energyListTwo) {
      this.mtid = energyListTwo.mtid
      this.name = energyListTwo.mname
    },
    // 数据录入树“取消”与“确定”按钮事件
    cancle() {
      this.showPoint = false
    },
    save() {
      this.showPoint = false
      this.deviceList = ''
      this.Mtid = this.mtid
      this.Name = this.name
      queryPointsList({
        Project: this.selectedid,
        mtid: this.Mtid,
        pointtype: this.insertType
      })
        .then(res => {
          this.options3 = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    clearInput() {
      this.Name = ''
      this.Mtid = ''
      this.options3 = []
      this.deviceList = ''
    },
    // 每页显示条数改变
    handleSizeChange(val) {
      this.show_number = val
      queryData_InputList({
        Project: this.selectedid,
        mtid: this.subid,
        pointtype: this.dtypeid,
        StartTime: this.startDate,
        EndTime: this.endDate,
        Pagesize: this.Pagesize,
        show_number: this.show_number
      })
        .then(res => {
          this.dataList = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 当前页码
    handleCurrentChange(val) {
      this.Pagesize = val
      queryData_InputList({
        Project: this.selectedid,
        mtid: this.subid,
        pointtype: this.dtypeid,
        StartTime: this.startDate,
        EndTime: this.endDate,
        Pagesize: this.Pagesize,
        show_number: this.show_number
      })
        .then(res => {
          this.dataList = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 区域位置的第二个下拉选择框
    GetEnergyTypeList(typeid) {
      fetchEnergyTypeList(typeid)
        .then(res => {
          this.optionsThree = JSON.parse(res.data).list
          this.options2 = JSON.parse(res.data).list
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 获取能耗区域位置树结构
    GetEnergy_tree(id, typeid) {
      fetchEnergy_tree(id, 0, typeid)
        .then(res => {
          var sult = JSON.parse(res.data)
          if (sult.success) {
            this.energyListTwo = sult.list
            this.subid2 = this.energyListTwo[0].mtid
            this.$nextTick(() => {
              this.$refs.treequyu.setCurrentKey(this.energyListTwo[0].no)
            })
            this.dtypeid2 = this.tid
            this.name2 = this.energyListTwo[0].mname
          } else {
            this.energyListTwo = []
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 数据录入记录
    QueryData_InputList(id) {
      queryData_InputList({
        Project: id,
        mtid: this.subid,
        pointtype: this.dtypeid,
        StartTime: this.startDate,
        EndTime: this.endDate,
        Pagesize: 1,
        show_number: 15
      })
        .then(res => {
          var datalist = JSON.parse(res.data)
          if (datalist.length === 0) {
            this.dataList = []
          } else {
            this.dataList = JSON.parse(res.data)
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 数据录入数量
    QueryData_InputCount(id) {
      queryData_InputCount({
        Project: id,
        mtid: this.subid,
        pointtype: this.dtypeid,
        StartTime: this.startDate,
        EndTime: this.endDate,
        Pagesize: 1,
        show_number: 15
      })
        .then(res => {
          this.total = JSON.parse(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
<style scoped lang="scss">
.left {
  width: 272px;
  float: left;
  box-sizing: border-box;
}
.commonWrapper {
  color: #324057;
  .commonBox {
    border-radius: 4px;
    margin-bottom: 20px;
    .commonHeader {
      height: 46px;
      padding: 10px;
      color: #324057;
      border-bottom: 1px solid #dedfe0;
      .commonImg {
        float: left;
        margin-right: 5px;
        height: 20px;
        width: 20px;
      }
      .squareDown {
        float: right;
        margin-top: 12px;
        margin-right: 10px;
        height: 20px;
        width: 20px;
        cursor: pointer;
        .commonIcon {
          float: left;
        }
      }
      .commonTitle {
        float: left;
        height: 26px;
        line-height: 26px;
        font-size: 15px;
        font-weight: bold;
      }
    }
  }
}
.right {
  padding-left: 10px;
  margin-left: 272px;
  box-sizing: border-box;
}
.dataenter {
  color: #324057;
  font-size: 12px;
}
.boxShadow {
  background: #fff;
  border-radius: 4px;
}
.energy-left {
  height: 700px;
}
.time {
  margin-top: 10px;
}
.icon-close {
  font-size: 14px;
  position: absolute;
  top: 8px;
  right: 5px;
  cursor: pointer;
}
.el-tree {
  border: none;
  max-height: 420px;
  overflow-y: auto;
}
.icon-close {
  position: absolute;
  top: 8px;
  right: 5px;
  cursor: pointer;
}
.dataenterTop {
  height: 124px;
}
.insertList {
  height: 700px;
}
.enterList {
  display: inline-block;
  margin: 10px 5px;
  position: relative;
}
.btn {
  font-size: 14px;
  width: 62px;
  height: 34px;
  border-radius: 4px;
  border: 1px solid #c0ccda;
  margin-bottom: 10px;
}
.btnCancel {
  background: #fff;
}
.btnSave {
  color: #fff;
}
.treeList {
  position: absolute;
  z-index: 2;
  min-width: 320px;
  border: 1px solid #c0ccda;
  background: #fff;
  top: 50px;
}
.treeList:before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 40%;
  width: 0;
  height: 0;
  border-left: 13px solid transparent;
  border-bottom: 16px solid #f3f5f9;
  border-right: 13px solid transparent;
}
.enterCondition {
  font-size: 14px;
  padding-right: 6px;
}
.enterInput1 {
  width: 112px;
  height: 30px;
  border-radius: 4px 0 0 4px;
  border: 1px solid #dcdfe6;
}
.selecter {
  position: relative;
  display: inline-block;
  vertical-align: top;
}
.inputCondition {
  width: 108px;
  height: 30px;
  line-height: 30px;
  border-radius: 4px 0 0 4px;
  border: 1px solid #dcdfe6;
}
input::-webkit-input-placeholder {
  /* Chrome/Opera/Safari */
  padding-left: 15px;
}
input::-moz-placeholder {
  /* Firefox 19+ */
  padding-left: 15px;
}
input:-ms-input-placeholder {
  /* IE 10+ */
  padding-left: 15px;
}
input:-moz-placeholder {
  /* Firefox 18- */
  padding-left: 15px;
}
.selectBtn {
  width: 62px;
  height: 32px;
  border-radius: 0 4px 4px 0;
  border: 1px solid #dcdfe6;
  background: #f9fafc;
}
.insertBtn {
  width: 62px;
  height: 32px;
  border-radius: 0 4px 4px 0;
  vertical-align: top;
}
@media (max-width: 1540px) {
  .dataenterTop {
    height: 180px;
  }
}
</style>

<style lang="scss">
.time .el-input--prefix .el-input__inner {
  padding-left: 28px;
}
</style>
