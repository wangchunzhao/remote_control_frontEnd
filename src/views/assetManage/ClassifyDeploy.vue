<template>
  <div class="classify content-box">
    <div class="header bg-fff">
      <el-form
        :inline="true"
        :model="formInline"
        class="compactform1"
        style="overflow:hidden;"
      >
        <el-row :gutter="48" style="margin:0px;">
          <el-col :span="8">
            <el-form-item label="项目选择">
              <el-select
                v-model="value"
                placeholder="请选择项目"
                size="small"
                filterable
                @change="switchProject"
              >
                <el-option
                  v-for="item in proList"
                  :key="item.id"
                  :value="item.id"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16" style="text-align:right;">
            <el-dropdown trigger="click" class="dropdown">
              <el-button type="primary" size="small">
                从项目复制<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="copyProperty(1)">
                  复制资产分类
                </el-dropdown-item>
                <!-- <el-dropdown-item @click.native="copyProperty(2)">
                  复制监控分类
                </el-dropdown-item> -->
              </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown trigger="click" class="dropdown">
              <el-button size="small">
                导入Excel<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <span type="text" class="file-btn">
                    导入资产分类
                    <input
                      id="fileInput"
                      type="file"
                      multiple="false"
                      accept=".xlsx,.xls"
                      @change="uploadExcel($event, 1)"
                    />
                  </span>
                </el-dropdown-item>
                <!-- <el-dropdown-item>
                  <span type="text" class="file-btn">
                    导入监控分类
                    <input id="fileInput" type="file" multiple="false" accept=".xlsx,.xls" @change="uploadExcel($event,2)">
                  </span>
                </el-dropdown-item> -->
              </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown trigger="click" class="dropdown">
              <el-button size="small">
                导出Excel<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="exportExcel(1)">
                  导出资产分类
                </el-dropdown-item>
                <!-- <el-dropdown-item @click.native="exportExcel(2)">
                  导出监控分类
                </el-dropdown-item> -->
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="classify-box">
      <div class="asset-wrap">
        <div
          style="overflow:hidden;;line-height:30px; padding:20px 15px 0px 15px; border-bottom:1px solid #F7F7F7;"
        >
          <div style="color:#3C3C3C; font-size:16px;float:left;">
            资产分类
          </div>
          <div style="float:right;" class="thin-scroll">
            <el-input
              v-model="filterText"
              placeholder="请输入类别名称"
              size="small"
              clearable
              style="margin-bottom:20px; width:200px;"
            >
              <i slot="suffix" class="el-input__icon el-icon-search" />
            </el-input>
          </div>
        </div>
        <div
          style="padding:20px 33px;max-height: 550px;overflow: auto;"
          class="thin-scroll"
        >
          <el-tree
            ref="tree1"
            class="filter-tree"
            :data="data1"
            empty-text="暂无数据"
            :render-content="renderContent"
            :expand-on-click-node="false"
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="monitor-wrap">
        <div
          style="overflow:hidden;;line-height:30px; padding:20px 15px 0px 15px; border-bottom:1px solid #F7F7F7;"
        >
          <div style="color:#3C3C3C; font-size:16px;float:left;">
            监控分类
          </div>
          <div style="float:right;">
            <el-input
              v-model="filterText2"
              placeholder="请输入类别名称"
              size="small"
              clearable
              style="margin-bottom:20px; width:200px;"
            >
              <i slot="suffix" class="el-input__icon el-icon-search" />
            </el-input>
          </div>
        </div>
        <div
          style="padding:20px 33px;max-height: 550px;overflow: auto;"
          class="thin-scroll"
        >
          <el-tree
            ref="tree2"
            class="filter-tree"
            :data="data2"
            empty-text="暂无数据"
            :render-content="renderContent2"
            :expand-on-click-node="false"
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode2"
            @node-click="handleNodeClick"
          />
        </div>
      </div>
    </div>
    <el-dialog
      :title="this.dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="dialogClose"
    >
      <div v-if="dialogSubmit !== '导 入'" style="margin-bottom:20px;">
        选择项目：
        <el-select
          v-model="value2"
          placeholder="请选择项目"
          size="small"
          @change="switchProject2"
        >
          <el-option
            v-for="item in proList"
            :key="item.id"
            :value="item.id"
            :label="item.label"
          />
        </el-select>
      </div>
      <div v-if="dialogSubmit === '复 制'" style="overflow:hidden;">
        <div style="float:left;padding-top:9px;">
          {{ this.classifyValue }}
        </div>
        <div style="float:left; min-width:140px;">
          <el-tree
            class="filter-tree"
            :data="data3"
            :render-content="renderContent3"
            empty-text="暂无数据"
            :props="defaultProps"
            default-expand-all
          />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="submitBtnFn">{{
          this.dialogSubmit
        }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="新增下级分类"
      :visible.sync="dialogVisible2"
      width="30%"
      @close="dialogClose2"
    >
      <span>
        <el-form :inline="true" :model="formInline2" style="overflow:hidden;">
          <el-form-item label="分类名称：">
            <el-input
              v-model="value3"
              placeholder="请输入分类名称"
              clearable
              size="small"
            />
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="addNewChild">新 增</el-button>
      </span>
    </el-dialog>
    <!-- 这个表不显示，只是为了给用下下载Excel提供数据源 -->
    <!-- 资产导出表 -->
    <table id="excel-table" style="display:none">
      <tr>
        <th>资产分类编码</th>
        <th>资产分类名称</th>
        <th>上级资产分类名称</th>
      </tr>
      <tr v-for="(item, index) in tableData" :key="index">
        <td>{{ item.index }}</td>
        <td>{{ item.TypeName }}</td>
        <td>{{ item.preName }}</td>
      </tr>
    </table>

    <!-- 监控导出表 -->
    <table id="excel-table2" style="display:none">
      <tr>
        <th>监控分类编码</th>
        <th>监控分类名称</th>
        <th>上级监控分类名称</th>
      </tr>
      <tr v-for="(item, index) in tableData2" :key="index">
        <td>{{ item.index }}</td>
        <td>{{ item.TypeName }}</td>
        <td>{{ item.preName }}</td>
      </tr>
    </table>
  </div>
</template>
<script>
import FileSaver from 'file-saver'
import { assetsTypeList } from '@/api/assetTypeProject'
import { monitorTypeList } from '@/api/monitorTypeProject'

import {
  monitorTypeExport,
  assetsTypeAdd,
  assetsTypeDelete,
  assetsTypeUpdate,
  monitorTypeAdd,
  monitorTypeDelete,
  monitorTypeUpdate,
  monitorTypeCopy
} from '@/api/asset'

import { assetsTypeCopy, assetsTypeExport } from '@/api/assetTypeProject'
export default {
  data() {
    return {
      formInline: {},
      formInline2: {},
      value: this.$store.state.app.pid,
      value2: this.$store.state.app.pid,
      value3: '',
      dialogTitle: '',
      projectid: this.$store.state.app.pid,
      projectIdNew: this.$store.state.app.pid,
      dialogSubmit: '',
      projectName: this.$store.state.app.project.label,
      currentNode: {
        id: '',
        pid: '',
        element: '',
        node: ''
      },
      dialogVisible: false,
      addNewChildData: null,
      dialogVisible2: false,
      senserData: [],
      classifyValue: '',
      filterText: '',
      tableData: null,
      tableData2: null,
      filterText2: '',
      updateFileName: '',
      addNewChildRoot: null,
      upFileloading: false,
      upChecked: true,
      PID: '',
      data1: [],
      data2: [],
      data3: [],
      defaultProps: {
        children: 'subset',
        label: 'TypeName'
      }
    }
  },
  computed: {
    proList() {
      const arr = [...this.$store.state.app.proList]
      return arr
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree1.filter(val)
    },
    filterText2(val) {
      this.$refs.tree2.filter(val)
    }
  },
  mounted() {
    this.getAssetsTypeList()
    this.getMonitorTypeList()
  },
  methods: {
    // 新增节点弹窗重置数据
    dialogClose2() {
      this.value3 = ''
    },
    // 关闭弹窗重置数据
    dialogClose() {
      if (this.dialogSubmit === '导 入') {
        let inputValue = document.getElementById('fileInput')
        if (inputValue.value !== '' || inputValue.value !== null) {
          inputValue.value = ''
        }
        this.updateFileName = ''
      }
    },
    // 弹窗确认
    submitBtnFn() {
      if (this.dialogSubmit === '导 入') {
        let inputValue = document.getElementById('fileInput')
        if (inputValue.value === '' || inputValue.value === null) {
          this.dialogVisible = false
          this.$message({
            type: 'info',
            message: '未选择文件'
          })
          return false
        } else {
          this.dialogVisible = false
          assetsTypeExport({ projectId: this.projectid, list: this.senserData })
            .then(() => {
              this.getAssetsTypeList()
            })
            .catch(err => {
              console.error(err)
            })
        }
      } else {
        this.dialogVisible = false
        if (this.dialogTitle === '复制资产分类') {
          assetsTypeCopy(this.projectIdNew, this.projectid)
            .then(res => {
              if (res.data.Code === 200 && res.data.Data) {
                this.$message({
                  type: 'success',
                  message: '复制成功'
                })
              } else {
                this.$message({
                  type: 'info',
                  message: '复制失败'
                })
              }
              this.getAssetsTypeList()
            })
            .catch(err => {
              console.error(err)
            })
        } else {
          monitorTypeCopy(this.projectIdNew, this.projectid)
            .then(res => {
              if (res.data.Code === 200) {
                this.$message({
                  type: 'success',
                  message: '复制成功'
                })
              } else {
                this.$message({
                  type: 'info',
                  message: '复制失败'
                })
              }
              this.getMonitorTypeList()
            })
            .catch(err => {
              console.error(err)
            })
        }
      }
    },
    // 导出表数据
    tableDataFn(data) {
      if (data.subset != null) {
        let arr = data.subset
        let arr2 = []
        for (let i = 0; i < arr.length; i++) {
          arr2.push({ index: i + 1, TypeName: arr[i].TypeName })
          for (let j = 0; j < arr[i].subset.length; j++) {
            arr2.push({
              index: i + 1 + '.' + (j + 1),
              TypeName: arr[i].subset[j].TypeName,
              preName: arr[i].TypeName
            })
          }
        }
        // this.tableData = arr2;
        return arr2
      } else {
        this.$message({
          type: 'info',
          message: '暂无数据'
        })
      }
    },
    // 页面渲染数据
    transformTreeData(data, type) {
      if (data.subset != null) {
        let arr = data.subset
        let arr2 = []
        for (let i = 0; i < arr.length; i++) {
          if (type === 1) {
            arr2.push({
              index: i + 1 + ' -',
              TypeName: arr[i].TypeName,
              ID: arr[i].ID,
              subset: arr[i].subset,
              pid: this.data1[0].ID
            })
          } else {
            arr2.push({
              index: i + 1 + ' -',
              TypeName: arr[i].TypeName,
              ID: arr[i].ID,
              subset: arr[i].subset,
              pid: this.data2[0].ID
            })
          }
          for (let j = 0; j < arr[i].subset.length; j++) {
            arr[i].subset[j].index = i + 1 + '.' + (j + 1) + ' -'
            arr[i].subset[j].pid = arr[i].ID
          }
        }
        return arr2
      } else {
        this.$message({
          type: 'info',
          message: '暂无数据'
        })
      }
    },
    // 将资产表格内容导出成 excel
    exportExcel(type) {
      if (type === 1) {
        // 前端生成资产Excel表
        setTimeout(() => {
          let wb = XLSX.utils.table_to_book(
            document.querySelector('#excel-table')
          )
          //  get binary string as output
          var wbout = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'binary'
          })
          //  force a download
          FileSaver.saveAs(
            new Blob([this.s2ab(wbout)], {
              type: 'application/octet-stream'
            }),
            this.projectName + '资产分类' + '.xlsx'
          )
        }, 0)
      } else {
        // 前端生成监控分类Excel表
        setTimeout(() => {
          let wb = XLSX.utils.table_to_book(
            document.querySelector('#excel-table2')
          )
          //  get binary string as output
          var wbout = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'binary'
          })
          //  force a download
          FileSaver.saveAs(
            new Blob([this.s2ab(wbout)], {
              type: 'application/octet-stream'
            }),
            this.projectName + '监控分类' + '.xlsx'
          )
        }, 0)
      }
    },
    s2ab(s) {
      let buf
      if (typeof ArrayBuffer !== 'undefined') {
        buf = new ArrayBuffer(s.length)
        var view = new Uint8Array(buf)
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
      } else {
        buf = new Array(s.length)
        for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff
        return buf
      }
    },
    // 上传 excel 文件并解析
    uploadExcel(evt, type) {
      var rABS = false
      this.senserData = []
      this.upFileloading = true
      let fileType = evt.target.files[0].type
      // 兼容edge上不支持accept
      if (
        fileType !== 'application/vnd.ms-excel' &&
        fileType !==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        this.$message('请选择.xls .xlsx格式的文件')
        let inputValue = document.getElementById('fileInput')
        inputValue.value = ''
        this.updateFileName = ''
        return false
      }
      var reader = new FileReader()
      reader.onload = e => {
        /* read workbook */
        var bstr = e.target.result
        var wb
        if (rABS) {
          wb = XLSX.read(bstr, {
            type: 'binary'
          })
        } else {
          var arr = this.toArrData(bstr)
          wb = XLSX.read(btoa(arr), { type: 'base64' })
        }
        this.upFileloading = false
        // this.updateFileName = evt.target.files[0].name;//显示上传文件名称
        if (type == 1) {
          this.senserData.push(
            ...this.classifyDeployDataTransform(this.toJson(wb), 'fromExcel', 1)
          )
          if (!this.upChecked) {
            let fileInput = document.getElementById('fileInput')
            fileInput.value = ''
            return false
          }
          assetsTypeExport({ projectId: this.projectid, list: this.senserData })
            .then(res => {
              if (res.data) {
                this.$message({
                  type: 'success',
                  message: '导入完成!'
                })
              } else {
                this.$message({
                  type: 'info',
                  message: '导入失败!'
                })
              }
              let fileInput = document.getElementById('fileInput')
              fileInput.value = ''
              this.getAssetsTypeList()
            })
            .catch(err => {
              console.error(err)
            })
        } else {
          this.senserData.push(
            ...this.classifyDeployDataTransform(this.toJson(wb), 'fromExcel', 2)
          )
          if (!this.upChecked) {
            let fileInput = document.getElementById('fileInput')
            fileInput.value = ''
            return false
          }
          monitorTypeExport({
            projectId: this.projectid,
            list: this.senserData
          })
            .then(res => {
              if (res.data) {
                this.$message({
                  type: 'success',
                  message: '导入完成!'
                })
              } else {
                this.$message({
                  type: 'info',
                  message: '导入失败!'
                })
              }
              let fileInput = document.getElementById('fileInput')
              fileInput.value = ''
              this.getMonitorTypeList()
            })
            .catch(err => {
              console.error(err)
            })
        }
      }
      if (rABS) {
        reader.readAsBinaryString(evt.target.files[0])
      } else {
        reader.readAsArrayBuffer(evt.target.files[0])
      }
    },
    //
    classifyDeployDataTransform(data, type, num) {
      if (type === 'fromExcel') {
        if (num === 1) {
          for (let i = 0; i < data.length; i++) {
            data[i]['TypeName'] = data[i]['资产分类名称']
            data[i]['TopTypeName'] = data[i]['上级资产分类名称']
            if (data[i]['TypeName'] == undefined) {
              this.$message('无法识别内容，导入失败')
              this.upChecked = false
              return false
            } else {
              this.upChecked = true
            }
            delete data[i]['上级资产分类名称']
            delete data[i]['资产分类编码']
            delete data[i]['资产分类名称']
          }
        } else {
          for (let i = 0; i < data.length; i++) {
            data[i]['TypeName'] = data[i]['监控分类名称']
            data[i]['TopTypeName'] = data[i]['上级监控分类名称']
            if (data[i]['TypeName'] == undefined) {
              this.$message('无法识别内容，导入失败')
              this.upChecked = false
              return false
            } else {
              this.upChecked = true
            }
            delete data[i]['上级监控分类名称']
            delete data[i]['监控分类编码']
            delete data[i]['监控分类名称']
          }
        }
      }
      return data
    },
    // 文件流转BinaryString
    toArrData(data) {
      var o = ''
      var l = 0
      var w = 10240
      for (; l < data.byteLength / w; ++l)
        o += String.fromCharCode.apply(
          null,
          new Uint8Array(data.slice(l * w, l * w + w))
        )
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
      return o
    },
    // 格式转换
    toJson(workBook) {
      let result = []
      workBook.SheetNames.forEach(sheetName => {
        let roa = XLSX.utils.sheet_to_row_object_array(
          workBook.Sheets[sheetName]
        )
        if (roa.length > 0) {
          // result[sheetName] = roa;
          result = roa
        }
      })
      return result
    },
    // 导入资产分类
    // incProperty(){
    //     this.dialogTitle = '导入资产分类';
    //     this.dialogVisible = true;
    //     this.dialogSubmit = '导 入';
    // },
    // tree node  编辑确认事件
    editOk(data, e) {
      e.stopPropagation()
      e.target.parentNode.previousSibling.style.display = 'inline-block'
      e.target.parentNode.style.display = 'none'
      // 如果没修改则不发送请求
      if (data.TypeName === e.target.previousSibling.value) {
        return false
      }
      // 如果为空不让保存
      if (
        e.target.previousSibling.value == '' ||
        e.target.previousSibling.value == null
      ) {
        this.$message({
          type: 'info',
          message: '更改失败，名称不能为空'
        })
        return false
      }
      data.cname = e.target.previousSibling.value
      data.TypeName = data.cname
      assetsTypeUpdate({
        ID: data.ID,
        PID: data.pid,
        TypeName: data.TypeName,
        projectId: this.projectid
      })
        .then(() => {
          this.getAssetsTypeList()
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 资产 tree node 删除事件
    removeFn(e, data) {
      e.stopPropagation()
      this.$confirm('确认要删除该节点？', '提示', { type: 'warning' }).then(
        () => {
          assetsTypeDelete({ ID: data.ID, projectId: this.projectid })
            .then(res => {
              if (res.data === 0) {
                this.$message({
                  type: 'info',
                  message: '删除失败'
                })
              } else if (res.data === 1) {
                this.$message({
                  type: 'success',
                  message: '删除成功'
                })
              } else {
                this.$message({
                  type: 'danger',
                  message: '不可删除资产中存在该分类资产'
                })
              }
              this.getAssetsTypeList()
            })
            .catch(err => {
              console.error(err)
            })
        }
      )
    },
    // 提交新增节点
    addNewChild() {
      this.dialogVisible2 = false
      if (this.addNewChildRoot === 1) {
        assetsTypeAdd({
          PID: this.PID,
          TypeName: this.value3,
          projectId: this.projectid
        })
          .then(res => {
            if (res.data) {
              this.$message({
                type: 'success',
                message: '添加成功'
              })
            } else {
              this.$message({
                type: 'info',
                message: '添加失败'
              })
            }
            this.getAssetsTypeList()
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        monitorTypeAdd({
          PID: this.PID,
          TypeName: this.value3,
          projectId: this.projectid
        })
          .then(res => {
            if (res.data) {
              this.$message({
                type: 'success',
                message: '添加成功'
              })
            } else {
              this.$message({
                type: 'info',
                message: '添加失败'
              })
            }
            this.getMonitorTypeList()
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    // 资产 tree node 添加事件
    appendFn(data, e, type) {
      // data.ID  父ID
      e.stopPropagation()
      this.dialogVisible2 = true
      this.PID = data.ID
      this.addNewChildRoot = type
    },
    // 资产 tree node 编辑事件
    edit(e) {
      e.stopPropagation()

      // Node.previousElementSibling ||Node.previousSibling 兼容FF
      // let previous_Sibling = e.target.parentNode.previousElementSibling || e.target.parentNode.previousSibling;
      this.currentNode.element.querySelector('.label').style.display = 'none'
      this.currentNode.element.querySelector('.input-wrap').style.display =
        'inline-block'
    },
    // 监控 tree node 添加事件
    appendFn2(data, e, type) {
      // data.ID  父ID
      e.stopPropagation()
      this.dialogVisible2 = true
      this.PID = data.ID
      this.addNewChildRoot = type
    },
    // 监控 tree node 编辑事件
    edit2(e) {
      e.stopPropagation()

      // Node.previousElementSibling ||Node.previousSibling 兼容FF
      // let previous_Sibling = e.target.parentNode.previousElementSibling || e.target.parentNode.previousSibling;
      this.currentNode.element.querySelector('.label').style.display = 'none'
      this.currentNode.element.querySelector('.input-wrap').style.display =
        'inline-block'
    },
    // tree node  编辑确认事件
    editOk2(data, e) {
      e.stopPropagation()
      e.target.parentNode.previousSibling.style.display = 'inline-block'
      e.target.parentNode.style.display = 'none'
      // 如果没修改则不发送请求
      if (data.TypeName === e.target.previousSibling.value) {
        return false
      }
      // 如果为空不让保存
      if (
        e.target.previousSibling.value == '' ||
        e.target.previousSibling.value == null
      ) {
        this.$message({
          type: 'info',
          message: '更改失败，名称不能为空'
        })
        return false
      }
      data.cname = e.target.previousSibling.value
      data.TypeName = data.cname
      monitorTypeUpdate({
        ID: data.ID,
        PID: data.pid,
        TypeName: data.TypeName,
        projectId: this.projectid
      })
        .then(() => {
          this.getMonitorTypeList()
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 监控 tree node 删除事件
    removeFn2(e, data) {
      e.stopPropagation()
      this.$confirm('确认要删除该节点？', '提示', { type: 'warning' }).then(
        () => {
          monitorTypeDelete({ ID: data.ID, projectId: this.projectid })
            .then(res => {
              if (res.data === 0) {
                this.$message({
                  type: 'info',
                  message: '删除失败'
                })
              } else if (res.data === 1) {
                this.$message({
                  type: 'success',
                  message: '删除成功'
                })
              } else {
                this.$message({
                  type: 'danger',
                  message: '不可删除资产中存在该分类资产'
                })
              }
              this.getMonitorTypeList()
            })
            .catch(err => {
              console.error(err)
            })
        }
      )
    },
    // tree node 点击事件
    handleNodeClick(obj, node, self) {
      return false // 目前禁止监控分类的修改
      // eslint-disable-next-line no-unreachable
      this.filterText = ''
      this.currentNode.element = self.$el
      this.currentNode.pid = obj.project
      this.currentNode.id = node.data.id
      this.currentNode.node = node
      if (node.level === 1) {
        self.$el.querySelector('.editBtn').style.display = 'none'
        self.$el.querySelector('.removeBtn').style.display = 'none'
      }
      if (node.level === 3) {
        self.$el.querySelector('.appendBtn').style.display = 'none'
      }
      // this.fetchDeviceListByDeviceSet(this.currentNode.id, this.currentNode.pid);
      if (node.data.count) {
        // 如果点击的节点是“设备集合”结点
        // this.fetchDeviceListByDeviceSet(this.currentNode.id, this.currentNode.pid);
      } else {
        let btns = document.querySelectorAll('.operation-wrap')
        for (let i = 0; i < btns.length; i++) {
          btns[i].style.display = 'none'
        }
        self.$el.querySelector('.operation-wrap').style.display = 'inline-block'
      }
    },
    // 资产tree 的渲染函数
    renderContent(h, { node, data }) {
      let rightHTML = ''
      rightHTML = (
        <span style="float: right;display:none;" class="operation-wrap">
          <el-button
            class="editBtn hoverBtn"
            size="mini"
            type="primary"
            style="padding: 4px;"
            on-click={event => {
              this.edit(event)
            }}
          >
            <i class="el-icon-edit edit-btn"></i>
          </el-button>
          <el-button
            class="appendBtn hoverBtn"
            size="mini"
            type="primary"
            style="padding: 4px;"
            on-click={event => {
              this.appendFn(data, event, 1)
            }}
          >
            <i class="el-icon-plus append-btn"></i>
          </el-button>
          <el-button
            class="removeBtn hoverBtn"
            size="mini"
            type="danger"
            style="padding: 4px;"
            on-click={event => {
              this.removeFn(event, data)
            }}
          >
            <i class="el-icon-delete remove-btn"></i>
          </el-button>
        </span>
      )
      return (
        <span style="white-space: normal;flex: 1;line-height: 34px;">
          <span>
            <svg class="icon" aria-hidden="true">
              <use xlinkHref="#icon-ceng"></use>
            </svg>
            <span style="margin-left:10px;">{data.index}</span>
            <span class="label">{node.label}</span>
            <span class="input-wrap" style="display:none">
              <input class="label-input" type="text" value={node.label} />
              <button
                on-click={event => this.editOk(data, event, node)}
                class="editOk-btn"
              >
                OK
              </button>
            </span>
          </span>
          {rightHTML}
        </span>
      )
    },
    // 监控tree 的渲染函数
    renderContent2(h, { node, data }) {
      let rightHTML = ''
      rightHTML = (
        <span style="float: right;display:none;" class="operation-wrap">
          <el-button
            class="editBtn hoverBtn"
            size="mini"
            type="primary"
            style="padding: 4px;"
            on-click={event => {
              this.edit2(event)
            }}
          >
            <i class="el-icon-edit edit-btn"></i>
          </el-button>
          <el-button
            class="appendBtn hoverBtn"
            size="mini"
            type="primary"
            style="padding: 4px;"
            on-click={event => {
              this.appendFn2(data, event, 2)
            }}
          >
            <i class="el-icon-plus append-btn"></i>
          </el-button>
          <el-button
            class="removeBtn hoverBtn"
            size="mini"
            type="danger"
            style="padding: 4px;"
            on-click={event => {
              this.removeFn2(event, data)
            }}
          >
            <i class="el-icon-delete remove-btn"></i>
          </el-button>
        </span>
      )
      return (
        <span style="white-space: normal;flex: 1;line-height: 34px;">
          <span>
            <svg class="icon" aria-hidden="true">
              <use xlinkHref="#icon-ceng"></use>
            </svg>
            <span style="margin-left:10px;">{data.index}</span>
            <span class="label">{node.label}</span>
            <span class="input-wrap" style="display:none">
              <input class="label-input" type="text" value={node.label} />
              <button
                on-click={event => this.editOk2(data, event, node)}
                class="editOk-btn"
              >
                OK
              </button>
            </span>
          </span>
          {rightHTML}
        </span>
      )
    },
    // 复制 tree 的渲染函数
    renderContent3(h, { node, data }) {
      return (
        <span style="white-space: normal;flex: 1;line-height: 34px;">
          <span>
            <svg class="icon" aria-hidden="true">
              <use xlinkHref="#icon-ceng"></use>
            </svg>
            <span style="margin-left:10px;">{data.index}</span>
            <span class="label">{node.label}</span>
          </span>
        </span>
      )
    },

    // 复制资产分类
    copyProperty(type) {
      if (type === 1) {
        this.dialogVisible = true
        this.dialogTitle = '复制资产分类'
        this.classifyValue = '资产分类：'
        this.dialogSubmit = '复 制'
        this.copyDataFn()
      } else {
        this.dialogVisible = true
        this.dialogTitle = '复制监控分类'
        this.classifyValue = '监控分类：'
        this.dialogSubmit = '复 制'
        this.copyDataFn()
      }
    },
    // 节点数据筛选
    filterNode2(value, data) {
      if (!value) return true
      return data.TypeName.indexOf(value) !== -1
    },
    // 节点数据筛选
    filterNode(value, data) {
      if (!value) return true
      return data.TypeName.indexOf(value) !== -1
    },
    // 复制dialog项目选择
    switchProject2(value) {
      this.$store.commit('UPDATE_CHECKID', value)
      this.projectIdNew = value
      // eslint-disable-next-line no-unused-vars
      let obj = this.proList.find(item => {
        return item.id === value
      })
      this.copyDataFn()
    },
    // 复制数据加载
    copyDataFn() {
      if (this.dialogTitle === '复制资产分类') {
        assetsTypeList({
          projectId: this.projectIdNew
        })
          .then(res => {
            if (res.data.Code === 200) {
              this.data3 = []
              let data = res.data.Data
              this.data3.push(data)
              this.data3[0].subset = this.transformTreeData(data, 1)
            }
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        monitorTypeList({
          projectId: this.projectIdNew,
          industry: undefined
        })
          .then(res => {
            this.data3 = []
            let data = res.data.Data
            this.data3.push(data)
            this.data3[0].subset = this.transformTreeData(data, 2)
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
    // 项目切换加载数据
    switchProject(value) {
      this.$store.commit('UPDATE_CHECKID', value)
      this.proList.forEach(item => {
        item.id === value && this.$store.commit('CHANGE_PROJECT', item)
      })
      this.projectid = value
      let obj = {}
      obj = this.proList.find(item => {
        return item.id === value
      })
      this.projectName = obj.label
      this.getAssetsTypeList()
      this.getMonitorTypeList()
    },
    // 监控分类列表数据
    getMonitorTypeList() {
      monitorTypeList({
        projectId: 0,
        industry: this.$store.state.app.project.Industry
      })
        .then(res => {
          this.data2 = []
          const data = res.data.Data
          this.data2.push(data)
          this.data2[0].subset = this.transformTreeData(data, 2)
          this.tableData2 = this.tableDataFn(data)
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 资产分类列表数据
    getAssetsTypeList() {
      assetsTypeList({
        projectId: this.projectid
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.data1 = []
            let data = res.data.Data
            this.data1.push(data)
            this.data1[0].subset = this.transformTreeData(data, 1)
            this.tableData = this.tableDataFn(data)
          }
          // this.data1 = []
          // let data = JSON.parse(res.data)
          // this.data1.push(data)
          // this.data1[0].subset = this.transformTreeData(data, 1)
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.classify {
  padding: 3px;
  overflow: hidden;
  background-color: transparent;
  .header {
    padding: 20px 15px 10px 15px;
    border-radius: 4px;
    overflow: hidden;
  }
  .classify-box {
    display: flex;
    margin-top: 25px;
  }
  .asset-wrap {
    flex: 1;
    margin-right: 15px;
    padding-bottom: 25px;
    // max-height: 550px;
    background-color: #fff;
    border-radius: 4px;
    overflow: hidden;
  }
  .monitor-wrap {
    flex: 1;
    margin-left: 15px;
    padding-bottom: 25px;
    // max-height: 550px;
    background-color: #fff;
    border-radius: 4px;
    overflow: hidden;
  }
  .dropdown {
    margin: 4px 0px 0px 15px;
  }
}
</style>
<style lang="scss">
.classify {
  .compactform1 {
    .el-form-item {
      display: flex;
      .el-form-item__label {
        margin-left: 15px;
      }
      .el-form-item__content {
        flex: 3;
        .el-select--small {
          width: 100%;
        }
      }
    }
  }
  .projectEdit .el-tag--success {
    margin-left: 0px;
  }
  .label {
    margin-left: 10px;
  }
  .hoverBtn {
    border-radius: 50%;
  }
  .label-input {
    width: auto;
    height: 25px;
    border-radius: 3px;
    outline: none;
    border: 1px solid rgb(191, 199, 217);
    padding: 0 4px;
  }
  .el-tree-node__content:hover {
    background-color: #eaf6fe;
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: #eaf6fe;
  }
  .editOk-btn {
    border: none;
    outline: none;
    background: none;
    color: #20a0ff;
    border-radius: 4px;
    margin-left: 4px;
    cursor: pointer;
  }
}
.file-btn {
  position: relative;
  overflow: hidden;
  color: #606266;
  input {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 20px;
    opacity: 0;
  }
}
.file-btn:hover {
  color: #20a0ff;
}
</style>
