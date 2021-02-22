<template>
  <div class="store-payrecord content-box">
    <div class="left-wrap">
      <div class="title">商户列表</div>
      <div style="margin: 0 16px;">
        <el-input
          v-model.trim="listFilterText"
          size="small"
          clearable
          placeholder="搜索"
          suffix-icon="el-icon-search"
        />
      </div>

      <ul v-if="storeList.length" class="store-list">
        <li
          @click="() => onSelectStore(null)"
          :class="{ active: currentStore === null }"
        >
          <c-svg style="font-size: 16px;" name="quanbushanghu"></c-svg>
          <span>全部商户</span>
        </li>
        <li
          @click="() => onSelectStore(item)"
          v-for="item in storeList"
          :key="item.Key"
          :title="item.Value"
          :class="{ active: currentStore && currentStore.Key === item.Key }"
        >
          <c-svg name="shangcheng"></c-svg>
          <span>{{ item.Value }}</span>
        </li>
      </ul>
      <div v-else style="color: #999;text-align: center;line-height: 60px;">
        暂无数据
      </div>
    </div>
    <div class="right-wrap">
      <div class="title">
        {{ currentStore ? currentStore.Value : '全部商户' }}
      </div>
      <div style="padding: 16px 24px;">
        <div class="table-tool-box">
          <el-date-picker
            v-model="filterForm.date"
            type="month"
            @change="onDateRangeChange"
            :clearable="false"
            size="small"
            :format="`M[月][  （${filterForm.dateRangeString}]）`"
            style="margin: 0 15px;width: 290px;"
          >
          </el-date-picker>
          <div class="right-wrap">
            <el-button
              :loading="exportLoading"
              @click.native="handleExport"
              type="primary"
              size="small"
              v-permission="[156]"
              style="margin-right: 15px;"
            >
              导出
            </el-button>
            <el-badge
              :hidden="hideFilterNotice"
              is-dot
              class="item"
              style="margin-top: 0px;"
            >
              <el-button
                @click.native="() => $refs.dialogFilterForm.openDialog()"
                type="text"
                style="padding: 0;"
                >筛选<i class="el-icon-arrow-down"></i
              ></el-button>
            </el-badge>
            <el-input
              v-model.trim="filterForm.text"
              size="small"
              clearable
              style="margin-left: 15px;"
              placeholder="搜索商户名称"
              suffix-icon="el-icon-search"
            />
          </div>
        </div>
        <el-table
          v-loading="tableLoading"
          :data="tableData"
          fit
          element-loading-text="加载中..."
          style="width: 100%;"
        >
          <el-table-column label="充值日期" sortable="custom" prop="created">
            <template slot-scope="{ row }">
              {{ _dateFormat(row.created, 'YYYY-MM-DD HH:mm') }}
            </template>
          </el-table-column>
          <el-table-column prop="meter_id" label="电表ID"> </el-table-column>
          <el-table-column label="充值金额（元）" prop="addition" />
          <el-table-column label="充前金额" prop="balance" />
          <el-table-column label="电价（元/度）" prop="price" />
          <el-table-column prop="MeterOrderType" label="充值类型">
            <template slot-scope="{ row }">
              <el-tag
                size="small"
                :type="
                  rechargeTypeMap.find(v => v.value === row.MeterOrderType)
                    .tagType
                "
              >
                {{
                  rechargeTypeMap.find(v => v.value === row.MeterOrderType).text
                }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="商户编号" prop="shop_id" />
          <el-table-column
            column-key="shop_name"
            prop="shop_name"
            :filters="[{ text: 'Text1', value: 'Value1' }]"
            label="商户名称"
          >
            <template slot-scope="{ row }">
              {{ row.shop_name }}
            </template>
          </el-table-column>
          <el-table-column label="购电单号" prop="order_no" />
          <el-table-column label="充值订单号" prop="external_order_no" />
          <el-table-column prop="operator_name" label="充值操作员">
          </el-table-column>
        </el-table>
        <pagination
          v-show="pagination.total > 0"
          :total="pagination.total"
          :page.sync="pagination.page"
          :limit.sync="pagination.limit"
          @pagination="fetchTableData"
        />
      </div>
    </div>
    <DialogFilterForm
      :projectId="projectId"
      :rechargeTypeOptions="rechargeTypeMap"
      @change="filterFormChange"
      ref="dialogFilterForm"
    />
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import DialogFilterForm from './DialogFilterForm'
import dayjs from 'dayjs'
import {
  getMeterOrderPage,
  getShopDropdownList,
  exportMeterOrder,
  getCompanyDeadline
} from '@/api/meter'
const rechargeTypeMap = [
  {
    text: '正常充值',
    value: 0,
    tagType: 'success'
  },
  {
    text: '退租退费',
    value: 1,
    tagType: 'warning'
  }
]
export default {
  components: { Pagination, DialogFilterForm },
  data() {
    return {
      storeListSource: [],
      currentStore: null,
      dateNode: 31,
      listFilterText: '',
      tableData: null,
      tableLoading: false,
      exportLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      multipleSelection: [],
      filterForm: {
        text: '',
        date: new Date(),
        dateRangeString: undefined,
        sortProp: undefined,
        isAsc: undefined,
        operator: [],
        rechargeType: undefined,
        meterIds: [],
        powerPurchaseOrder: '',
        rechargeOrder: ''
      },
      downloadLoading: false,
      cascaderOptions: [
        {
          value: 'zhinan',
          label: '指南',
          children: [
            {
              value: 'shejiyuanze',
              label: '设计原则',
              children: [
                {
                  value: 'kekong',
                  label: '可控'
                }
              ]
            },
            {
              value: 'daohang',
              label: '导航',
              children: [
                {
                  value: 'dingbudaohang',
                  label: '顶部导航'
                }
              ]
            }
          ]
        }
      ],
      rechargeTypeMap
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.page = 1
      this.fetchTableData()
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    },
    storeList() {
      return this.storeListSource.filter(
        v =>
          v.Value.toLowerCase().indexOf(this.listFilterText.toLowerCase()) > -1
      )
    },
    hideFilterNotice() {
      return (
        !this.filterForm.operator.length &&
        !this.filterForm.rechargeType &&
        !this.filterForm.meterIds.length &&
        !this.filterForm.powerPurchaseOrder &&
        !this.filterForm.rechargeOrder
      )
    },
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  async created() {
    try {
      const res = await this.fetchDateNode()
      if (res.data.Code === 200) {
        this.dateNode = res.data.Data
      }
      this.filterForm.dateRangeString = this.formateDate(
        this.filterForm.date,
        this.dateNode
      )
      this.fetchTableData()
    } catch (err) {
      console.log(err)
    }
    this.fetchStoreList()
  },
  methods: {
    onSelectStore(store) {
      this.currentStore = store
      this.pagination.page = 1
      this.fetchTableData()
    },
    filterFormChange(form) {
      Object.assign(this.filterForm, form)
      this.pagination.page = 1
      this.fetchTableData()
    },
    onDateRangeChange(val) {
      this.filterForm.dateRangeString = this.formateDate(val, this.dateNode)
      this.fetchTableData()
    },
    handleExport() {
      this.exportLoading = true
      const {
        text,
        sortProp,
        isAsc,
        dateRangeString,
        meterIds,
        operator,
        rechargeType,
        powerPurchaseOrder,
        rechargeOrder
      } = this.filterForm
      const storeId = this.currentStore ? this.currentStore.Key : undefined
      exportMeterOrder({
        ProjectId: this.projectId,
        ShopId: storeId,
        OperatorIdList: operator,
        MeterOrderType: rechargeType,
        MeterIdList: meterIds,
        ExternalOrderNo: rechargeOrder,
        OrderNo: powerPurchaseOrder,
        ShopName: text,
        CreateTimeQuantum: {
          StartDate: dateRangeString.split(' 至 ')[0],
          EndDate: dateRangeString.split(' 至 ')[1]
        },
        SortType: sortProp,
        IsAsc: isAsc
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
    },
    /**
     * 获取表格数据
     */
    fetchTableData: debounce(
      function() {
        this.tableLoading = true
        const {
          text,
          sortProp,
          isAsc,
          dateRangeString,
          meterIds,
          operator,
          rechargeType,
          powerPurchaseOrder,
          rechargeOrder
        } = this.filterForm
        const storeId = this.currentStore ? this.currentStore.Key : undefined
        const { page, limit } = this.pagination
        getMeterOrderPage({
          ProjectId: this.projectId,
          ShopId: storeId,
          OperatorIdList: operator,
          MeterOrderType: rechargeType,
          MeterIdList: meterIds,
          ExternalOrderNo: rechargeOrder,
          OrderNo: powerPurchaseOrder,
          ShopName: text,
          CreateTimeQuantum: {
            StartDate: dateRangeString.split(' 至 ')[0],
            EndDate: dateRangeString.split(' 至 ')[1]
          },
          SortType: sortProp,
          IsAsc: isAsc,
          PageIndex: page,
          PageSize: limit
        })
          .then(res => {
            if (
              page === this.pagination.page &&
              text === this.filterForm.text
            ) {
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
          .catch(err => {
            console.error(err)
            if (
              page === this.pagination.page &&
              text === this.filterForm.text
            ) {
              this.tableData = []
              this.pagination.total = 0
              this.$message.error('列表获取失败')
            }
          })
          .finally(() => {
            this.tableLoading = false
          })
      },
      1000,
      {
        leading: true
      }
    ),
    fetchDateNode() {
      return getCompanyDeadline({
        companyId: this.companyId
      })
    },
    formateDate(date, dateNode) {
      const endDate = dayjs(date).date(dateNode)
      const startDate = endDate.subtract(1, 'month').date(dateNode)
      return `${startDate.format('YYYY-MM-DD')} 至 ${endDate.format(
        'YYYY-MM-DD'
      )}`
    },
    fetchStoreList() {
      getShopDropdownList({
        projectId: this.projectId
      })
        .then(res => {
          if (res.data.Code === 200) {
            this.storeListSource = res.data.Data
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
div.store-payrecord {
  padding: 0;
  display: flex;
  .left-wrap {
    flex: 0 0 210px;
    min-width: 0;
    border-right: 1px solid rgba(0, 0, 0, 0.09);
    .title {
      font-weight: 500;
      margin: 16px 24px;
    }
  }
  .right-wrap {
    flex: 1;
    .title {
      font-size: 16px;
      font-weight: 500;
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.09);
    }
  }
  .store-list {
    margin: 12px 16px;
    padding: 0;
    list-style: none;
    li {
      padding: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      color: rgba(0, 0, 0, 0.65);
      .icon {
        margin-right: 6px;
      }
      &.active {
        background-color: #f5f7fa;
      }
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>
