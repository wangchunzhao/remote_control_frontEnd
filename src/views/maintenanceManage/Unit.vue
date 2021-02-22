<template>
  <div class="content-box maintenhance-unit">
    <el-card shadow="never">
      <div class="wrap">
        <div class="left-wrap">
          <div
            v-for="(item, index) in deviceTypes"
            :key="index"
            class="type-list"
            :class="{ active: currentType === item.id }"
            @click="handleClickType(item)"
          >
            {{ item.mname }}
          </div>
        </div>
        <div class="right-wrap">
          <div class="card-title">
            {{ currentTypeName }}
          </div>
          <div style="margin: 20px 0 15px 0;">
            <el-button type="primary" size="medium" @click.native="clickAdd">
              添加单位
            </el-button>
            <el-button type="danger" size="medium" @click.native="removeUnit">
              移除单位
            </el-button>
            <treeselect
              v-model="filterForm.subareas"
              :default-expand-level="1"
              :multiple="false"
              :options="treeOptions"
              style="line-height: 20px;width: 250px;display: inline-block;margin-left: 10px;vertical-align: bottom;"
              placeholder="按服务范围选择"
              :normalizer="normalizer"
            />
            <el-input
              v-model.trim="filterForm.text"
              size="medium"
              clearable
              style="width: 200px;float: right;"
              placeholder="搜索单位名称"
              suffix-icon="el-icon-search"
            />
          </div>
          <el-table
            v-loading="tableLoading"
            :data="tableData"
            style="width: 100%;margin-top: 20px;"
            @sort-change="sortChange"
            @selection-change="val => (multipleSelection = val)"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="#" width="50px" />
            <el-table-column
              prop="CompanyName"
              sortable="custom"
              label="单位名称"
            />
            <el-table-column prop="Nickname" label="负责人" />
            <el-table-column prop="Mobile" label="联系电话" />
            <el-table-column prop="SubareaName" label="管理范围" />
            <el-table-column prop="name" label="操作">
              <template slot-scope="{ row }">
                <el-button
                  type="text"
                  :class="{ 'btn-danger': row.Flag == 1 }"
                  @click.native="updateState(row)"
                >
                  {{ row.Flag === 1 ? '停用' : '启用' }}
                </el-button>
                <span>|</span>
                <el-button type="text" @click.native="clickEdit(row)">
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            :current-page.sync="pagination.currentPage"
            :page-size.sync="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
    <el-dialog
      :title="unitForm.id ? '编辑单位信息' : '添加维保单位'"
      :visible.sync="dialogVisible"
      width="500px"
      @close="dialogClose"
    >
      <el-form
        ref="unitForm"
        :model="unitForm"
        :rules="unitFormRule"
        label-width="100px"
        size="medium"
        style="margin-right: 50px;"
      >
        <el-form-item label="单位名称" prop="name">
          <el-autocomplete
            v-model="unitForm.name"
            :fetch-suggestions="querySearch"
            style="width: 100%;"
            placeholder="请输入内容"
            @select="handleSelect"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="user">
          <el-input v-model="unitForm.user" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="unitForm.phone">
            <el-select
              slot="prepend"
              v-model="unitForm.areaCode"
              style="width: 90px;"
            >
              <el-option label="+86" value="+86" />
              <el-option label="+886" value="+886" />
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item label="管理范围" prop="scope">
          <treeselect
            v-model="unitForm.scope"
            :default-expand-level="1"
            :multiple="true"
            :options="treeOptions"
            style="line-height: 20px;"
            placeholder="请选择"
            :normalizer="normalizer"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="dialogVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" size="medium" @click="submit('unitForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSubareaTree } from '@/api/subarea'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {
  getMaintenanceUnitList,
  getModelList,
  addMaintenanceUnit,
  getMaintenanceUnit,
  updateMaintenanceUnit,
  startStopMaintenanceUnit,
  deleteMaintenanceUnit
} from '@/api/maintenanceUnit'
import { getCompanyList } from '@/api/company'
import { validatePhone } from '@/utils/checkAreaCode'

export default {
  components: {
    Treeselect
  },
  data() {
    const checkPhone = (rule, value, callback) => {
      if (validatePhone(this.unitForm.areaCode, value)) {
        callback()
      } else {
        callback(new Error('手机号格式错误'))
      }
    }
    return {
      treeOptions: [],
      normalizer(node) {
        return {
          id: node.SubareaId,
          label: node.SubareaName,
          children: node.Children
        }
      },

      filterForm: {
        text: '',
        orderBy: undefined,
        subareas: undefined
      },
      deviceTypes: [],
      currentType: '',
      currentTypeName: '',
      multipleSelection: [],
      tableData: [],
      tableLoading: false,
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },

      dialogVisible: false,
      unitForm: {
        name: '',
        user: '',
        phone: '',
        areaCode: '+86',
        scope: null,
        id: '',
        companyId: ''
      },
      unitFormRule: {
        name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
        user: [
          { required: true, message: '请输入负责人名称', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        scope: [
          {
            required: true,
            type: 'array',
            message: '请选择服务范围',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    currentType() {
      this.fetchTableData()
    },
    'filterForm.text'() {
      this.fetchTableData()
    },
    'filterForm.subareas'() {
      this.fetchTableData()
    }
  },
  mounted() {
    getSubareaTree({
      companyId: this.$store.state.app.company.id
    })
      .then(res => {
        const data = res.data
        if (data.Code === 200) {
          this.walk([data.Data])
          this.treeOptions = [data.Data]
        }
      })
      .catch(err => {
        console.error(err)
      })
    getModelList({
      Industry: 0
    })
      .then(res => {
        const data = res.data
        if (data.Code === 200) {
          if (data.Data.length) {
            this.currentType = data.Data[0].id
            this.currentTypeName = data.Data[0].mname
          }
          this.deviceTypes = data.Data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    handleClickType(item) {
      this.currentType = item.id
      this.currentTypeName = item.mname
    },
    // 点击添加
    clickAdd() {
      this.dialogVisible = true
    },
    sortChange(val) {
      this.filterForm.orderBy = val.order === 'ascending' ? 1 : 2
      this.fetchTableData()
    },
    // 点击编辑
    clickEdit(row) {
      this.dialogVisible = true
      getMaintenanceUnit({
        Maintenance_UnitId: row.Maintenance_UnitId
      })
        .then(res => {
          const data = res.data.Data
          this.unitForm.scope = data.SubareaId
            ? data.SubareaId.split(',').map(item => parseInt(item))
            : null
          this.unitForm.name = data.CompanyName
          this.unitForm.user = data.Nickname
          this.unitForm.phone = data.Mobile
          this.unitForm.id = row.Maintenance_UnitId
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 启用、停用
    updateState(row) {
      startStopMaintenanceUnit({
        Maintenance_UnitId: row.Maintenance_UnitId
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            row.Flag = row.Flag === 1 ? 0 : 1
            this.$message.success('状态修改成功')
          } else {
            this.$message.error('状态修改失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('状态修改失败')
        })
    },
    // 删除维保单位
    removeUnit() {
      if (!this.multipleSelection.length) {
        this.$message('请选择要移除的维保单位')
        return false
      }
      this.$confirm('确认要移除选中的维保单位？', '提示', { type: 'warning' })
        .then(() => {
          deleteMaintenanceUnit({
            Maintenance_UnitId: this.multipleSelection
              .map(item => item.Maintenance_UnitId)
              .join(',')
          })
            .then(res => {
              const data = res.data
              if (data.Code === 200) {
                this.$message.success('维保单位移除成功')
                this.fetchTableData()
              } else {
                this.$message.error('维保单位移除失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('维保单位移除失败')
            })
        })
        .catch(() => {})
    },
    querySearch(queryString, cb) {
      getCompanyList({
        companyName: queryString
      })
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data
            data.forEach(item => {
              item.value = item.CompanyName
            })
            cb(data)
          } else {
            cb([])
          }
        })
        .catch(err => {
          cb([])
          console.error(err)
        })
    },
    handleSelect(item) {
      this.unitForm.user = item.Nickname
      this.unitForm.phone = item.Mobile
      this.unitForm.companyId = item.CompanyId
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.unitForm.id) {
            // 编辑
            updateMaintenanceUnit({
              Maintenance_UnitId: this.unitForm.id,
              SubareaIdList: this.unitForm.scope,
              TypeID: this.currentType
            })
              .then(res => {
                if (res.data.Code === 200) {
                  this.dialogVisible = false
                  this.fetchTableData()
                  this.$message.success('维保单位编辑成功')
                } else {
                  this.$message.error('维保单位编辑失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('维保单位编辑失败')
              })
          } else {
            // 新增
            addMaintenanceUnit({
              CompanyId: this.unitForm.companyId || undefined,
              CompanyName: this.unitForm.name,
              CustomerId: this.$store.state.app.company.id,
              SubareaIdList: this.unitForm.scope,
              TypeID: this.currentType,
              Mobile: this.unitForm.phone,
              Nickname: this.unitForm.user
            })
              .then(res => {
                if (res.data.Code === 200) {
                  this.dialogVisible = false
                  this.fetchTableData()
                  this.$message.success('维保单位添加成功')
                } else {
                  this.$message.error('维保单位添加失败')
                }
              })
              .catch(err => {
                console.error(err)
                this.$message.error('维保单位添加失败')
              })
          }
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    dialogClose() {
      this.unitForm.name = ''
      this.unitForm.user = ''
      this.unitForm.phone = ''
      this.unitForm.scope = null
      this.unitForm.id = ''
      this.unitForm.companyId = ''
      this.$refs.unitForm.resetFields()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    fetchTableData() {
      this.tableLoading = true
      const { text, orderBy, subareas } = this.filterForm
      getMaintenanceUnitList({
        companyId: this.$store.state.app.company.id,
        typeId: this.currentType,
        pageIndex: this.pagination.currentPage,
        pageSize: this.pagination.size,
        companyName: text,
        orderby: orderBy,
        subareas: subareas ? [subareas] : undefined
      })
        .then(res => {
          const data = res.data
          if (data.Code === 200) {
            this.tableData = data.Data.Data
            this.pagination.total = data.Data.TotalCount
          } else {
            this.tableData = []
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('维保单位获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    // 删除空的Children
    walk(arr) {
      arr.forEach(item => {
        if (item.Children) {
          if (!item.Children.length) {
            delete item.Children
          } else {
            this.walk(item.Children)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenhance-unit {
  background-color: transparent;
  padding: 0;
  .wrap {
    display: flex;
  }
  .left-wrap {
    flex: 0 0 250px;
  }
  .right-wrap {
    flex: 1;
    padding: 10px 25px;
    border-left: 1px solid #ebeef5;
  }
  .type-list {
    padding: 0 20px;
    height: 45px;
    line-height: 45px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    &.active {
      background: #e6f7ff;
      color: #1890ff;
    }
    &:hover {
      // background: #E6F7FF;
      color: #1890ff;
    }
  }
  .el-pagination {
    margin-top: 15px;
    text-align: center;
  }
}
</style>

<style lang="scss">
.maintenhance-unit {
  .el-card__body {
    padding: 15px 0;
  }
}
</style>
