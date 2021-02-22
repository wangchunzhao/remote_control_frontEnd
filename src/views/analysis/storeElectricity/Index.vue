<template>
  <div class="analysis-store-electricity content-box">
    <div class="table-tool-box">
      <el-button
        @click.native="onExport"
        :loading="exportLoading"
        type="primary"
        size="small"
      >
        {{ scope === 'Subarea' ? '导出' : '导出进销存报表' }}
      </el-button>

      <el-date-picker
        v-model="filterForm.date"
        type="month"
        :clearable="false"
        size="small"
        :format="`M[月][  （${filterForm.dateRange}]）`"
        style="margin: 0 15px;width: 290px;"
      >
      </el-date-picker>
      <el-cascader
        size="small"
        ref="cascader"
        :show-all-levels="false"
        @visible-change="cascaderVisibleCanage"
        v-model="filterForm.subarea"
        :options="cascaderOptions"
        :props="{
          checkStrictly: true,
          value: 'SubareaId',
          label: 'SubareaName',
          children: 'Children'
        }"
        style="margin-right: 15px;"
      ></el-cascader>
      <el-button
        @click.native="() => $refs.dialogSetDay.openDialog()"
        size="small"
        plain
      >
        设置截至日期
      </el-button>
    </div>
    <div class="alert-wrap">
      <div>
        <c-svg name="info-circle-fill"></c-svg>
        商户电费总计：<span
          class="bold-text"
          style="color: rgba(24, 144, 255, 1);"
          >{{
            previewData
              ? numberFormat(previewData.TotalCost, [
                  '元',
                  '万元',
                  '亿',
                  '万亿'
                ]).value
              : '-'
          }}</span
        >
        &nbsp;
        {{
          previewData
            ? numberFormat(previewData.TotalCost, ['元', '万元', '亿', '万亿'])
                .unit
            : '万元'
        }}
        &nbsp;&nbsp;&nbsp; 商户用电量总计：
        <span class="bold-text"
          >{{
            previewData
              ? numberFormat(previewData.TotalEnergy, [
                  '度',
                  '万度',
                  '亿度',
                  '万亿'
                ]).value
              : '-'
          }}&nbsp;
          {{
            previewData
              ? numberFormat(previewData.TotalEnergy, [
                  '度',
                  '万度',
                  '亿度',
                  '万亿'
                ]).unit
              : '万度'
          }}</span
        >
        &nbsp;&nbsp;&nbsp; 充值金额总计：
        <span class="bold-text"
          >{{
            previewData
              ? numberFormat(previewData.TotalAddition, [
                  '元',
                  '万元',
                  '亿',
                  '万亿'
                ]).value
              : '-'
          }}&nbsp;
          {{
            previewData
              ? numberFormat(previewData.TotalAddition, [
                  '元',
                  '万元',
                  '亿',
                  '万亿'
                ]).unit
              : '万元'
          }}</span
        >
      </div>
    </div>
    <el-table
      v-loading="tableLoading"
      v-if="scope === 'Subarea'"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
    >
      <el-table-column label="排名">
        <template slot-scope="{ $index }">
          {{ (pagination.page - 1) * pagination.limit + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="项目" prop="ProjectName" />
      <el-table-column label="总用电量/度" prop="TotalEnergy" />
      <el-table-column label="总电费/元" prop="TotalCost" />
      <el-table-column label="总充值金额/元" prop="TotalAddition" />
    </el-table>
    <el-table
      v-else
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
    >
      <el-table-column label="商户编码">
        <template slot-scope="{ row }">
          {{ row.ShopId }}
        </template>
      </el-table-column>
      <el-table-column label="商户名称" prop="ShopName" />
      <el-table-column label="单价（元/度）" prop="Price" />
      <el-table-column label="总用电量/度" prop="TotalEnergy" />
      <el-table-column label="总电费/元" prop="TotalCost" />
      <el-table-column label="总充值金额/元" prop="TotalAddition" />
    </el-table>
    <pagination
      v-show="pagination.total > 0"
      :total="pagination.total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      @pagination="fetchTableData"
    />
    <DialogSetDay ref="dialogSetDay" />
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import DialogSetDay from './DialogSetDay'
import {
  getCompanyDeadline,
  getMeterSubareaStatisticsPage,
  getMeterStatisticsTotal,
  exportMeterSubareaStatistics,
  exportMeterShopStatistics
} from '@/api/meter'

import dayjs from 'dayjs'
export default {
  components: { Pagination, DialogSetDay },
  data() {
    return {
      exportLoading: false,
      dateNode: 31,
      scope: 'Subarea',
      previewData: null,
      tableData: null,
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      multipleSelection: [],
      filterForm: {
        date: new Date(),
        dateRange: '',
        projectIds: [],
        subarea: '',
        sortProp: undefined,
        isAsc: undefined
      },
      downloadLoading: false,
      cascaderOptions: []
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.page = 1
      this.fetchTableData()
    },
    'filterForm.date'() {
      this.filterForm.dateRange = this.formateDate(
        this.filterForm.date,
        this.dateNode
      )
      this.fetchTableData()
    }
  },
  computed: {
    company() {
      return this.$store.state.app.company
    },
    subarea() {
      return this.$store.state.app.subarea
    }
  },
  async mounted() {
    this.filterForm.subarea = this.company.id
    this.cascaderOptions = [
      {
        SubareaId: this.company.id,
        SubareaName: this.company.label,
        Children: this.subarea,
        Remark: '分区'
      }
    ]
    try {
      const res = await this.fetchDateNode()
      if (res.data.Code === 200) {
        this.dateNode = res.data.Data
      }
      this.filterForm.dateRange = this.formateDate(
        this.filterForm.date,
        this.dateNode
      )
      this.$nextTick(() => {
        try {
          const selectNode = this.$refs.cascader.getCheckedNodes()[0]
          this.scope = selectNode.data.Remark === '分区' ? 'Subarea' : 'Project'
          this.filterForm.projectIds = this.getProjectIds(selectNode.data)
          this.fetchStatisticalData()
          this.fetchTableData()
        } catch (err) {
          this.$message('未知错误')
          return
        }
      })
    } catch (err) {
      console.log(err)
    }
  },
  methods: {
    onExport() {
      this.exportLoading = true
      const { date, projectIds } = this.filterForm
      if (!projectIds.length) {
        // 选中的节点没有项目
        this.$message('没有数据可供导出')
        this.exportLoading = false
        return
      }
      if (this.scope === 'Subarea') {
        exportMeterSubareaStatistics({
          ProjectIdList: projectIds,
          Month: dayjs(date)
            .startOf('month')
            .format('YYYY-MM-DD'),
          IsStatisticsShop: this.scope === 'Subarea' ? false : true
        })
          .then(res => {
            if (res.data.Code === 200) {
              window.open(res.data.Data, '_blank')
            } else {
              this.$message.error('导出失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('导出失败')
          })
          .finally(() => {
            this.exportLoading = false
          })
      } else {
        exportMeterShopStatistics({
          ProjectIdList: projectIds,
          Month: dayjs(date)
            .startOf('month')
            .format('YYYY-MM-DD'),
          IsStatisticsShop: this.scope === 'Subarea' ? false : true
        })
          .then(res => {
            if (res.data.Code === 200) {
              window.open(res.data.Data, '_blank')
            } else {
              this.$message.error('导出失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('导出失败')
          })
          .finally(() => {
            this.exportLoading = false
          })
      }
    },
    cascaderVisibleCanage(val) {
      if (!val) {
        try {
          const selectNode = this.$refs.cascader.getCheckedNodes()[0]
          this.scope = selectNode.data.Remark === '分区' ? 'Subarea' : 'Project'
          this.filterForm.projectIds = this.getProjectIds(selectNode.data)
        } catch (err) {
          this.$message('未知错误')
          return
        }
        this.fetchStatisticalData()
        this.pagination.page = 1
        this.fetchTableData()
      }
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        try {
          this.tableLoading = true
          const { date, projectIds } = this.filterForm
          if (!projectIds.length) {
            // 选中的节点没有项目
            this.tableData = []
            this.pagination.total = 0
            this.tableLoading = true
            return
          }
          const { page, limit } = this.pagination
          getMeterSubareaStatisticsPage({
            ProjectIdList: projectIds,
            Month: dayjs(date)
              .startOf('month')
              .format('YYYY-MM-DD'),
            IsStatisticsShop: this.scope === 'Subarea' ? false : true,
            PageIndex: page,
            PageSize: limit
          })
            .then(res => {
              if (page === this.pagination.page) {
                if (res.data.Code === 200) {
                  this.tableData = res.data.Data.Data
                  this.pagination.total = res.data.Data.TotalCount
                } else {
                  this.tableData = []
                  this.pagination.total = 0
                  this.$message.error('列表获取失败')
                }
              }
            })
            .finally(() => {
              this.tableLoading = false
            })
        } catch (err) {
          console.error(err)
          this.tableData = []
          this.pagination.total = 0
          this.$message.error('列表获取失败')
        }
      },
      1000,
      {
        leading: true
      }
    ),
    fetchStatisticalData() {
      const { date, projectIds } = this.filterForm
      if (!projectIds.length) {
        // 选中的节点没有项目
        this.previewData = null
        return
      }
      getMeterStatisticsTotal({
        ProjectIdList: projectIds,
        Month: dayjs(date)
          .startOf('month')
          .format('YYYY-MM-DD'),
        IsStatisticsShop: this.scope === 'Subarea' ? false : true
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.previewData = res.data.Data
          } else {
            this.previewData = null
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    fetchDateNode() {
      return getCompanyDeadline({
        companyId: this.company.id
      })
    },
    formateDate(date, dateNode) {
      const endDate = dayjs(date).date(dateNode)
      const startDate = endDate.subtract(1, 'month').date(dateNode)
      return `${startDate.format('YYYY-MM-DD')} 至 ${endDate.format(
        'YYYY-MM-DD'
      )}`
    },
    numberFormat(value, units) {
      if (!value) {
        return {
          value: '-',
          unit: units[1]
        }
      }
      var param = {}
      var k = 10000,
        i
      i = Math.floor(Math.log(value) / Math.log(k))
      param.value = (value / Math.pow(k, i)).toFixed(2)
      param.unit = units[i]
      return param
    },
    getProjectIds(node_) {
      let projectIds = []
      const walk = node => {
        if (node.Children && node.Children.length) {
          node.Children.forEach(v => {
            walk(v)
          })
        } else {
          if (node.ProjectId) {
            projectIds.push(node.ProjectId)
          }
        }
      }
      walk(node_)
      return projectIds
    }
  }
}
</script>

<style lang="scss" scoped>
.analysis-store-electricity {
  .alert-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border-radius: 4px;
    background: rgba(230, 247, 255, 1);
    border: 1px solid rgba(186, 231, 255, 1);
    margin-bottom: 16px;
    color: rgba(0, 0, 0, 0.65);
    .icon {
      color: rgba(24, 144, 255, 1);
      width: 18px;
      height: 18px;
      margin-right: 6px;
      transform: translateY(2px);
    }
  }
  .bold-text {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    font-family: Helvetica Neue Medium;
    font-weight: 500;
  }
}
</style>
