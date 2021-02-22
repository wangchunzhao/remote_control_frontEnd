<template>
  <div class="point-type content-box">
    <div>
      <el-button
        v-permission="[101]"
        size="small"
        type="primary"
        @click.native="openEditDialog(-1)"
      >
        新增
      </el-button>
      <el-button
        v-permission="[101]"
        size="small"
        type="danger"
        @click.native="handleDelete"
      >
        删除
      </el-button>

      <el-input
        v-model.trim="filterText"
        size="small"
        clearable
        placeholder="请输入类型名"
        style="float:right;width: 190px"
      >
        <i slot="suffix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <div v-loading="tableLoading" element-loading-text="加载中...">
      <div class="table-title">
        状态量：
      </div>
      <el-table
        :data="tableData1"
        style="width: 100%;margin-top: 20px;"
        @selection-change="handleSelectionChange1"
      >
        <el-table-column
          type="selection"
          width="55"
          :selectable="
            (row, index) => {
              return row.Edit !== 0
            }
          "
        />
        <el-table-column prop="TypeName" label="类型名称" />
        <el-table-column prop="Value" label="状态值" />
        <el-table-column prop="UpdateTime" label="最后修改时间" />
        <el-table-column prop="Operator" label="修改人" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.Edit !== 0"
              type="text"
              @click.native="openEditDialog(scope.row.ID)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-title">
        模拟量：
      </div>
      <el-table
        :data="tableData2"
        style="width: 100%;margin-top: 20px;"
        @selection-change="handleSelectionChange2"
      >
        <el-table-column
          type="selection"
          width="55"
          :selectable="
            (row, index) => {
              return row.Edit !== 0
            }
          "
        />
        <el-table-column prop="TypeName" label="类型名称" />
        <el-table-column prop="Value" label="单位" />
        <el-table-column prop="UpdateTime" label="最后修改时间" />
        <el-table-column prop="Operator" label="修改人" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.Edit !== 0"
              type="text"
              @click.native="openEditDialog(scope.row.ID)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      title="新增/修改点位类型"
      :visible.sync="dialogVisible"
      width="450px"
      @close="dialogClose"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="formRules"
        size="medium"
        label-width="80px"
        style="margin: 0 20px;"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model.trim="form.name" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="数值类型" prop="type">
          <el-select
            v-model="form.type"
            placeholder="请选择数值类型"
            style="width: 200px"
            @change="changeValueType"
          >
            <el-option label="状态量" :value="1" />
            <el-option label="模拟量" :value="2" />
          </el-select>
        </el-form-item>
        <div v-if="form.type === 2">
          <el-form-item label="单位">
            <el-button type="text" @click.native="addFormItem">
              添加
            </el-button>
          </el-form-item>
          <el-form-item
            v-for="(item, index) in form.list"
            :key="item.key"
            :rules="{ required: true, message: '请输入单位', trigger: 'blur' }"
            :prop="'list.' + index + '.unit'"
            class="custom-form-item1"
          >
            <el-input v-model.trim="item.unit" />
            <el-button
              type="text"
              class="btn-danger"
              @click.native="delFormItem(index)"
            >
              删除
            </el-button>
          </el-form-item>
        </div>
        <div v-if="form.type === 1">
          <el-form-item label="状态值">
            <el-button type="text" @click.native="addFormItem">
              添加
            </el-button>
          </el-form-item>
          <div
            v-for="(state, index) in form.list"
            :key="index"
            class="custom-form-item2"
          >
            <el-form-item
              :rules="{ validator: checkValue, trigger: 'blur' }"
              :prop="'list.' + index + '.value'"
              label-width="0"
            >
              <el-input v-model.trim="state.value" placeholder="数值" />
            </el-form-item>
            <span>:</span>
            <el-form-item
              :rules="[
                { required: true, message: '请输入状态描述', trigger: 'blur' },
                { validator: checkLabel, trigger: 'blur' }
              ]"
              :prop="'list.' + index + '.showvalue'"
              label-width="0"
            >
              <el-input v-model.trim="state.showvalue" placeholder="状态描述" />
            </el-form-item>
            <el-button
              type="text"
              class="btn-danger"
              @click.native="delFormItem(index)"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button
          :loading="submitLoading"
          type="primary"
          size="small"
          @click.native="submit"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  addPointType,
  fetchPointTypeList,
  delPointType,
  queryPointType,
  updatePointType
} from '@/api/pointType'
export default {
  data() {
    const checkValue = (rule, value, callback) => {
      const result = this.isInteger(value)
      if (!result.res) {
        callback(new Error(result.msg))
      } else {
        const temp = this.form.list.map(item => item.value.toString())
        if (temp.indexOf(value) !== temp.lastIndexOf(value)) {
          callback(new Error('值不可重复'))
        } else {
          callback()
        }
      }
    }
    const checkLabel = (rule, value, callback) => {
      const temp = this.form.list.map(item => item.showvalue.toString())
      if (temp.indexOf(value) !== temp.lastIndexOf(value)) {
        callback(new Error('描述不可重复'))
      } else {
        callback()
      }
    }
    return {
      currentProject:
        this.$store.state.app.pid === '0'
          ? this.$store.state.app.proList[0].id
          : this.$store.state.app.pid,
      pointType: '',
      submitLoading: false,
      filterText: '',
      tableData1: [],
      tableData2: [],
      multipleSelection1: [],
      multipleSelection2: [],
      tableLoading: false,
      currentTypeId: -1,
      dialogVisible: false,
      form: {
        name: '',
        type: 1,
        list: []
      },
      formRules: {
        name: [
          { required: true, message: '请输入类型名称', trigger: 'blur' },
          { min: 1, max: 25, message: '长度在 1 到 25 个字符', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请选择数值类型', trigger: 'change' }]
      },
      checkValue,
      checkLabel
    }
  },
  computed: {
    proList() {
      return this.$store.state.app.proList
    },
    project() {
      return this.$store.state.app.pid
    }
  },
  watch: {
    project(val) {
      this.currentProject = val
      this.fetchPointTypeList()
    },
    filterText() {
      this.fetchPointTypeList()
    }
  },
  mounted() {
    this.fetchPointTypeList()
  },
  methods: {
    // 项目切换加载数据
    changeProject(value) {
      this.currentProject = value
      // this.proList.forEach(item => {
      //   if (item.id === value) {
      //     this.$store.dispatch('ChangeProject', item)
      //   }
      // })
      this.fetchPointTypeList()
    },
    handleSelectionChange1(val) {
      this.multipleSelection1 = val
    },
    handleSelectionChange2(val) {
      this.multipleSelection2 = val
    },
    handleDelete() {
      this.$confirm('确认要删除选中的点位类型？', '提示', {
        type: 'warning'
      }).then(() => {
        let ids = [
          ...this.multipleSelection1.map(item => item.ID),
          ...this.multipleSelection2.map(item => item.ID)
        ]
        delPointType({
          projectId: this.currentProject,
          ID: ids
        })
          .then(res => {
            if (res.data === 0) {
              this.$message.error('点位类型删除失败')
            } else if (res.data === 1) {
              this.$message.success('点位类型删除成功')
              this.fetchPointTypeList()
            } else {
              this.$message('选中的点位类型中某些已被使用，点位类型不可删除')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('删除失败')
          })
      })
    },
    openEditDialog(Id) {
      this.currentTypeId = Id
      if (Id !== -1) {
        // 编辑占位
        queryPointType(Id, this.currentProject)
          .then(res => {
            const data = res.data
            this.form.name = data.TypeName
            this.form.type = data.type
            this.form.list = data.list
          })
          .catch(err => {
            console.error(err)
          })
      }
      this.dialogVisible = true
    },
    // 修改数值类型
    changeValueType() {
      this.form.list = []
    },
    // 动态添加表单
    addFormItem() {
      if (this.form.type === 2) {
        this.form.list.push({ unit: '', key: Date.now() })
      } else {
        this.form.list.push({
          showvalue: '',
          value: ''
        })
      }
    },
    // 动态删除表单
    delFormItem(index) {
      if (this.form.type === 2) {
        this.form.list.splice(index, 1)
      } else {
        this.form.list.splice(index, 1)
      }
    },
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (!this.form.list.length) {
            if (this.form.type === 1) {
              this.$message('请至少添加一个状态值')
            } else {
              this.$message('请至少添加一个单位')
            }
            return false
          }
          this.submitLoading = true
          let form = {}
          form.TypeName = this.form.name
          form.type = this.form.type
          form.projectId = this.currentProject
          form.list = this.form.list
          form.ID = this.currentTypeId === -1 ? undefined : this.currentTypeId
          if (this.currentTypeId === -1) {
            // 新增
            addPointType(form)
              .then(res => {
                if (res.data) {
                  this.$message.success('点位类型添加成功')
                  this.fetchPointTypeList()
                } else {
                  this.$message.error('添加失败')
                }
                this.fetchPointTypeList()
              })
              .catch(err => {
                console.error(err)
              })
              .finally(() => {
                this.dialogVisible = false
                this.submitLoading = false
              })
          } else {
            // 修改
            updatePointType(form)
              .then(res => {
                if (res.data) {
                  this.$message.success('点位类型修改成功')
                  this.fetchPointTypeList()
                } else {
                  this.$message.error('修改失败')
                }
                this.fetchPointTypeList()
              })
              .catch(err => {
                console.error(err)
              })
              .finally(() => {
                this.dialogVisible = false
                this.submitLoading = false
              })
          }
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    dialogClose() {
      this.form.name = ''
      this.form.type = 1
      this.form.list = []
    },
    fetchPointTypeList() {
      this.tableLoading = true
      fetchPointTypeList(this.currentProject, this.filterText)
        .then(res => {
          if (res.data.Code === 200) {
            const data = res.data.Data
            this.tableData2 = data.Analog
            this.tableData1 = data.State
          } else {
            this.tableData2 = []
            this.tableData1 = []
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    // 是否是数字
    isInteger(n) {
      if (n === '') {
        return { res: false, msg: '必填' }
      }
      if (parseInt(n, 10) != n) {
        return { res: false, msg: '必须是整数' }
      }
      return { res: true }
    }
  }
}
</script>

<style lang="scss" scoped>
.point-type {
  background: #fff;
  padding: 24px 32px;
}
.table-title {
  font-weight: bold;
  font-size: 15px;
  margin-top: 25px;
}
</style>

<style lang="scss">
.point-type {
  .custom-form-item1 {
    .el-form-item__content {
      display: flex;
    }
    .el-input {
      flex: 0 0 200px;
    }
    .el-button {
      flex: 0 0 60px;
    }
  }
  .custom-form-item2 {
    display: flex;
    align-items: flex-start;
    margin-left: 80px;
    & > span {
      flex: 0 0 20px;
      text-align: center;
      margin-top: 10px;
    }
    .el-button {
      flex: 0 0 50px;
    }
    div:first-child {
      flex: 2;
    }
    div:nth-child(3) {
      flex: 3;
    }
  }
}
</style>
