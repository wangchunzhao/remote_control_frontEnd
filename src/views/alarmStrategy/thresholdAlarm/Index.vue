<template>
  <div class="alarm-strategy content-box">
    <div class="clearfix">
      <el-button
        size="small"
        type="primary"
        v-permission="[109]"
        @click.native="$router.push({ name: 'thresholdAlarmEdit' })"
      >
        新增
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        placeholder="搜索策略名称"
        style="float:right;width: 190px"
      >
        <i slot="suffix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      class="strategy-table"
      element-loading-text="加载中..."
      style="width: 100%;margin-top: 20px;"
      @sort-change="sortChange"
      @filter-change="filterChange"
    >
      <el-table-column
        prop="strategyName"
        sortable="custom"
        show-overflow-tooltip
        label="策略名称"
      >
        <template slot-scope="scope">
          <el-button
            v-if="checkPermission([109])"
            type="text"
            @click.native="
              $router.push({
                name: 'thresholdAlarmEdit',
                query: { id: scope.row.ID, Run: scope.row.Run }
              })
            "
          >
            {{ scope.row.strategyName }}
          </el-button>
          <span v-else>{{ scope.row.strategyName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        column-key="ProjectName"
        :filters="projectOptions"
        prop="ProjectName"
        label="所属项目"
      />
      <el-table-column
        prop="typeName"
        column-key="typeName"
        :filters="pointTypeOptions"
        label="点位类型"
      />
      <el-table-column
        width="100"
        sortable="custom"
        prop="pointNumber"
        label="点位数量"
      />
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
      <el-table-column
        sortable="custom"
        prop="UpdateTime"
        width="130"
        label="最后修改时间"
      />
      <el-table-column prop="Operator" width="80" label="修改人" />
      <el-table-column
        :filters="statusOptions"
        prop="Run"
        column-key="Run"
        label="报警启停"
        width="100"
      >
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.Run"
            class="el-switch-innertext"
            v-permission="[109]"
            :active-value="1"
            :inactive-value="0"
            active-text="开"
            inactive-text="关"
            @change="handleClickSwitch(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission([109])" label="操作" width="95">
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
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.pageSize"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script>
import {
  alarmStrategyDel,
  alarmStrategyRun,
  getAlarmStrategyListView,
  getAlarmStrategyScreen,
  getAlarmStrategyNum,
  queryAlarmStrategy
} from '@/api/alarmStrategyNew'
import { checkPermission } from '@/utils/permissions'
import debounce from 'lodash/debounce'
import { storageName } from '@/utils/index'

export default {
  data() {
    return {
      filterForm: {
        text: '',
        isAsc: undefined,
        sortProp: undefined,
        projectIds: [],
        pointTypeIds: [],
        status: []
      },
      projectOptions: [],
      pointTypeOptions: [],
      statusOptions: [],
      tableData: [],
      tableLoading: false,
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10
      },
      checkPermission,
      uid: JSON.parse(sessionStorage.getItem(storageName('userInfo'))).uid
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
  watch: {
    'filterForm.text'() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    $route() {
      this.fetchTableData()
    }
  },
  mounted() {
    this.fetchTableData()
    this.fetchOptions()
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
            name: 'thresholdAlarmEdit',
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
      } else if (val.prop === 'UpdateTime') {
        this.filterForm.sortProp = 4
      }
      this.filterForm.isAsc = val.order === 'ascending'
      this.fetchTableData()
    },
    // 表格筛选
    filterChange(filter) {
      if (filter.ProjectName) {
        this.filterForm.projectIds = filter.ProjectName
      } else if (filter.typeName) {
        this.filterForm.pointTypeIds = filter.typeName
      } else if (filter.Run) {
        this.filterForm.status = filter.Run
      }
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleSizeChange() {
      this.pagination.currentPage = 1
      this.fetchTableData()
    },
    handleCurrentChange() {
      this.fetchTableData()
    },
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const { currentPage, pageSize } = this.pagination
        const {
          text,
          sortProp,
          isAsc,
          projectIds,
          pointTypeIds,
          status
        } = this.filterForm
        getAlarmStrategyListView({
          projectId: undefined,
          projectIdList: projectIds,
          companyId: this.companyId,
          PointId: undefined,
          userID: undefined,
          typeID: undefined,
          typeIDList: pointTypeIds,
          strategyName: text,
          RunList: status,
          pageIndex: currentPage,
          pageSize: pageSize,
          OrderByField: sortProp,
          IsDesc: isAsc
        })
          .then(res => {
            if (currentPage !== this.pagination.currentPage) {
              return false
            }
            if (res.data.Code === 200) {
              const data = res.data.Data.Data
              this.tableData = data
              this.pagination.total = res.data.Data.TotalCount
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.tableLoading = false
          })
      },
      600,
      {
        leading: true
      }
    ),
    fetchOptions() {
      getAlarmStrategyScreen({
        projectIdList: [],
        companyId: this.companyId,
        typeIDList: [],
        RunList: [],
        PointId: undefined,
        strategyName: ''
      })
        .then(res => {
          const data = res.data.Data
          this.projectOptions = data.Project.map(item => ({
            text: item.Name,
            value: item.Id
          }))
          this.pointTypeOptions = data.EventType.map(item => ({
            text: item.Name,
            value: item.Id
          }))
          this.statusOptions = data.Run.map(item => ({
            text: item.Name,
            value: item.Id
          }))
        })
        .catch(err => {
          console.error(err)
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
.alarm-strategy {
  background: #fff;
  border-radius: 4px;
  padding: 24px 32px;
  .hover-cursor {
    cursor: pointer;
  }
  .text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }
}
.no-permission-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 230px);
  .left,
  .right {
    flex: 0 0 50%;
  }
  .left {
    text-align: right;
  }
  img {
    width: 300px;
  }
  p {
    color: #a5a6a9;
    font-size: 30px;
    text-align: left;
    letter-spacing: 3px;
  }
}
</style>
