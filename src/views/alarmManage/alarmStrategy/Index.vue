<template>
  <div class="content-box">
    <div class="table-tool-box">
      <el-button
        size="small"
        type="primary"
        v-permission="[38]"
        @click.native="
          $router.push({
            name: 'thresholdAlarmEditInBusiness',
            query: {
              projectId: projectId
            }
          })
        "
      >
        新增
      </el-button>
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%;"
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column prop="strategyName" sortable="custom" label="策略名称">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            v-if="checkPermission([38])"
            @click.native="
              () => {
                $router.push({
                  name: 'thresholdAlarmEditInBusiness',
                  query: { id: row.ID, Run: row.Run }
                })
              }
            "
          >
            {{ row.strategyName }}
          </el-button>
          <span v-else>{{ row.strategyName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        column-key="typeName"
        prop="typeName"
        :filters="pointTypeOptions"
        label="点位类型"
      />
      <el-table-column prop="pointNumber" sortable="custom" label="点位数量">
        <template slot-scope="{ row }">
          <el-button
            @click.native="handleClickPointNumber(row.ID)"
            type="text"
            >{{ row.pointNumber }}</el-button
          >
        </template>
      </el-table-column>

      <el-table-column label="报警规则">
        <template slot-scope="{ row }">
          <el-tooltip class="item" effect="dark" placement="top">
            <div slot="content">
              <div style="line-height: 20px;">
                触发规则：
              </div>
              <template v-if="row.RuleSimulate && row.RuleSimulate.length">
                <div
                  v-for="(item, index) in row.RuleSimulate"
                  :key="index + item"
                  style="line-height: 20px;"
                >
                  {{ item.RuleText }}
                </div>
              </template>
              <template v-if="row.RuleState && row.RuleState.length">
                <div
                  v-for="(item, index) in row.RuleState"
                  :key="index + item"
                  style="line-height: 20px;"
                >
                  {{ item.RuleText }}
                </div>
              </template>
              <template>
                {{
                  row.RuleState === null && !row.RuleSimulate.length ? '无' : ''
                }}
                {{
                  row.RuleSimulate === null && !row.RuleState.length ? '无' : ''
                }}
              </template>
              <div style="line-height: 20px;margin-top: 15px;">
                清除规则：
              </div>

              <template v-if="row.AlarmClear">
                <div
                  v-for="(item, index) in row.AlarmClear"
                  :key="index"
                  style="line-height: 20px;"
                >
                  {{ item.RuleText }}
                </div>
              </template>
              <span v-if="row.AlarmClear">
                {{ !row.AlarmClear.length ? '无' : '' }}
              </span>

              <div style="line-height: 20px;margin-top: 15px;">
                报警升级：
              </div>
              <div style="line-height: 20px;">
                {{ row.Upgrade1 }}
              </div>
              <div style="line-height: 20px;">
                {{ row.Upgrade2 }}
              </div>
              <div style="line-height: 20px;">
                {{ row.Upgrade3 }}
              </div>
              {{ !row.Upgrade1 && !row.Upgrade2 && !row.Upgrade3 ? '无' : '' }}
            </div>
            <div class="hover-cursor">
              <div class="text-ellipsis">
                触发规则：{{
                  row.RuleSimulate &&
                    row.RuleSimulate.map(item => item.RuleText).join(';')
                }}
                {{
                  row.RuleState &&
                    row.RuleState.map(item => item.RuleText).join(';')
                }}
                <template>
                  {{
                    row.RuleState === null && !row.RuleSimulate.length
                      ? '无'
                      : ''
                  }}
                  {{
                    row.RuleSimulate === null && !row.RuleState.length
                      ? '无'
                      : ''
                  }}
                </template>
              </div>
              <div class="text-ellipsis">
                清除规则：{{
                  row.AlarmClear &&
                    row.AlarmClear.map(item => item.RuleText).join(';')
                }}
                <span v-if="row.AlarmClear">
                  {{ !row.AlarmClear.length ? '无' : '' }}
                </span>
              </div>

              <div class="text-ellipsis">
                报警升级：{{
                  `${row.Upgrade1 ? row.Upgrade1 + '; ' : ''}${
                    row.Upgrade2 ? row.Upgrade2 + '; ' : ''
                  }${row.Upgrade3 ? row.Upgrade3 + '; ' : ''}`
                }}
                {{
                  !row.Upgrade1 && !row.Upgrade2 && !row.Upgrade3 ? '无' : ''
                }}
              </div>
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="通知规则">
        <template slot-scope="{ row }">
          <el-tooltip class="item" effect="dark" placement="top">
            <div slot="content">
              <div style="line-height: 20px;">
                通知方式：
              </div>
              <div style="line-height: 20px;">一般报警 - {{ row.normal }}</div>
              <div style="line-height: 20px;">
                重要报警 - {{ row.important }}
              </div>
              <div style="line-height: 20px;">
                紧急报警 - {{ row.emergency }}
              </div>
              <div style="line-height: 20px;margin-top: 15px;">
                清除时通知：
              </div>
              <div style="line-height: 20px;">{{ row.Clear }}</div>
              <div style="line-height: 20px;margin-top: 15px;">
                重复通知：
              </div>
              <div style="line-height: 20px;">{{ row.Repeat || '无' }}</div>
            </div>
            <div class="hover-cursor">
              <div class="text-ellipsis">
                通知方式：{{
                  handleNoticeText(row.normal, row.important, row.emergency)
                }}
              </div>

              <div class="text-ellipsis">清除时通知：{{ row.Clear }}</div>
              <div class="text-ellipsis">
                重复通知：{{ row.Repeat || '无' }}
              </div>
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="UserNumber" label="通知人数" sortable="custom">
        <template slot-scope="{ row }">
          <el-tooltip
            v-if="row.Receive"
            class="item"
            effect="dark"
            placement="top"
          >
            <div slot="content">
              <div
                v-for="(item, index) in row.Receive"
                :key="index"
                style="line-height: 22px;"
              >
                {{ item.RuleText }}
              </div>
            </div>
            <span class="hover-cursor">{{ row.UserNumber }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="Run" label="报警启停" width="100">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.Run"
            class="el-switch-innertext"
            v-permission="[38]"
            :active-value="1"
            :inactive-value="0"
            active-text="开"
            inactive-text="关"
            @change="handleClickSwitch(row)"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission([38])" label="操作" width="95">
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="handleClickCopy(row)">
            复制
          </el-button>
          <el-button
            @click.native="() => handleClickDelete(row)"
            type="text"
            class="btn-danger"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
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
    <PointDialog ref="pointDialog" />
  </div>
</template>

<script>
import PointDialog from './PointDialog'
import {
  alarmStrategyDel,
  getAlarmStrategyListView,
  getAlarmStrategyListType,
  getAlarmStrategyNum,
  alarmStrategyRun,
  queryAlarmStrategy
} from '@/api/alarmStrategyNew'
import { checkPermission } from '@/utils/permissions'

export default {
  components: {
    PointDialog
  },
  data() {
    return {
      filterForm: {
        sortProp: undefined,
        isAsc: undefined,
        type: []
      },
      pointTypeOptions: [],

      tableLoading: false,
      tableData: [{ name: 'utopia' }],
      pagination: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      checkPermission
    }
  },
  watch: {
    projectId() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  mounted() {
    this.fetchTableData()
    getAlarmStrategyListType({
      projectId: this.projectId
    })
      .then(res => {
        if (res.data.Code === 200) {
          const data = res.data.Data
          data.forEach(item => {
            item.text = item.TypeName
            item.value = item.ID
          })
          this.pointTypeOptions = data
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  methods: {
    handleClickCopy(row) {
      queryAlarmStrategy({
        ID: row.ID
      })
        .then(res => {
          if (res.data.Code !== 200) {
            this.$message.error('策略查询失败')
            return false
          }
          const payload = {}
          const data = res.data.Data
          data.basicForm.points = []
          data.basicForm.name += '-复制'
          delete data.basicForm.ID
          payload.basicForm = data.basicForm
          payload.noticeForm = data.noticeForm

          const {
            upgrade1,
            upgrade2,
            upgrade3,
            updateTime1,
            updateTime2,
            updateTime3
          } = data.noticeForm
          payload.alarmUpdateForm = {
            upgrade1: upgrade1,
            upgrade2: upgrade2,
            upgrade3: upgrade3,
            updateTime1: updateTime1,
            updateTime2: updateTime2,
            updateTime3: updateTime3
          }

          if (data.simulateRegulars.length) {
            data.simulateRegulars.forEach(item => {
              item.time = [
                this.stringToDate(item.time[0]),
                this.stringToDate(item.time[1])
              ]
            })
          } else {
            data.stateRegulars.forEach(item => {
              item.time = [
                this.stringToDate(item.time[0]),
                this.stringToDate(item.time[1])
              ]
            })
          }
          payload.simulateRegularForm = {
            regulars: data.simulateRegulars
          }
          payload.stateRegularForm = {
            regulars: data.stateRegulars,
            stateOptions: []
          }

          data.concats.forEach(item => {
            item.range = [
              this.stringToDate(item.range[0]),
              this.stringToDate(item.range[1])
            ]
          })
          payload.contactTableData = data.concats
          this.$router.push({
            name: 'thresholdAlarmEditInBusiness',
            params: {
              payload
            }
          })
        })
        .catch(err => {
          this.$message.error('策略查询失败')
          console.error(err)
        })
    },
    handleClickDelete(row) {
      this.$confirm('确认要删选中策略？', '提示', { type: 'warning' }).then(
        () => {
          getAlarmStrategyNum({ id: row.ID }).then(res => {
            const data = res.data
            if (data.Code === 200 && data.Data.IsSuccess) {
              this.$confirm(
                '该策略产生的报警未完全消除，删除策略将导致这些报警无法删除，是否继续删除?',
                '提示',
                {
                  confirmButtonText: '删除',
                  cancelButtonText: '取消',
                  type: 'warning'
                }
              )
                .then(() => {
                  this.delete(row.ID)
                })
                .catch(() => {})
            } else {
              this.delete(row.ID)
            }
          })
        }
      )
    },
    delete(id) {
      alarmStrategyDel({
        ID: id,
        storageSpaceExtendList: undefined
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.$message.success('报警策略删除成功')
            this.fetchTableData()
          } else {
            this.$message.error('报警策略删除失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('报警策略删除失败')
        })
    },
    // 点击点位数量
    handleClickPointNumber(id) {
      this.$refs.pointDialog.openDialog(id)
    },
    handleClickSwitch(row) {
      if (row.Run === 0) {
        // 关闭操作
        getAlarmStrategyNum({ id: row.ID }).then(res => {
          const data = res.data
          if (data.Code === 200 && data.Data.IsSuccess) {
            this.$confirm(
              '该策略产生的报警未完全消除，关闭策略将导致这些报警无法消除，是否继续关闭?',
              '提示',
              {
                confirmButtonText: '关闭',
                cancelButtonText: '取消',
                type: 'warning'
              }
            )
              .then(() => {
                this.toggle(row)
              })
              .catch(() => {
                row.Run = row.Run === 1 ? 0 : 1
              })
          } else {
            this.toggle(row)
          }
        })
      } else {
        this.toggle(row)
      }
    },
    toggle(row) {
      alarmStrategyRun({
        ID: row.ID
      })
        .then(res => {
          if (res.data.Code === 200) {
            if (!res.data.Data.IsSuccess) {
              this.$message.error('操作失败')
              row.Run = row.Run === 1 ? 0 : 1
            } else {
              if (row.Run) {
                this.$message.success('策略已成功开启')
              } else {
                this.$message.success('策略已成功关闭')
              }
            }
          }
        })
        .catch(err => {
          this.$message.error('策略开关失败')
          console.error(err)
        })
    },
    // 表格排序
    sortChange(val) {
      if (val.prop === 'strategyName') {
        this.filterForm.sortProp = 1
      } else if (val.prop === 'pointNumber') {
        this.filterForm.sortProp = 2
      } else if (val.prop === 'UserNumber') {
        this.filterForm.sortProp = 3
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.typeName) {
        this.filterForm.type = filter.typeName
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 分页
    handleCurrentChange() {
      this.fetchTableData()
    },
    // 表格每页数量
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    // 获取表格数据
    fetchTableData() {
      this.tableLoading = true
      const { text, sortProp, isAsc, type } = this.filterForm
      const { currentPage, size } = this.pagination
      getAlarmStrategyListView({
        projectId: this.projectId,
        companyId: this.companyId,
        userID: undefined,
        typeID: undefined,
        typeIDList: type.length ? type : undefined,
        strategyName: text,
        pageSize: size,
        pageIndex: currentPage,
        OrderByField: sortProp,
        IsDesc: isAsc
      })
        .then(res => {
          let data = res.data
          if (data.Code === 200) {
            this.tableData = data.Data.Data
            this.pagination.total = data.Data.TotalCount
          } else {
            this.tableData = []
            this.pagination.total = 0
            this.$message.error('列表获取失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.tableData = []
          this.pagination.total = 0
          this.$message.error('列表获取失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    handleNoticeText(normal, important, emergency) {
      let str = ''
      if (normal) {
        str += normal + ','
      }
      if (important) {
        str += important + ','
      }
      if (emergency) {
        str += emergency + ','
      }
      return [...new Set(str.split(','))].join(',')
    },
    stringToDate(string) {
      return new Date('2018/8/30 ' + string)
    }
  }
}
</script>

<style lang="scss" scoped>
.hover-cursor {
  cursor: pointer;
}
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}
</style>
