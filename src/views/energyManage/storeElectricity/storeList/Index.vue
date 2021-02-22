<template>
  <div class="content-box">
    <div class="table-tool-box">
      <!-- <el-button
        size="small"
        plain
        @click="() => $refs.dialogSetPrice.openDialog()"
      >
        电价设置
      </el-button> -->
      <el-button
        :loading="switchLoading"
        size="small"
        v-permission="[154]"
        @click.native="() => handleSwitch('close')"
        plain
      >
        强制拉闸
      </el-button>
      <el-button
        :loading="switchLoading"
        @click.native="() => handleSwitch('open')"
        size="small"
        v-permission="[154]"
        plain
      >
        强制合闸
      </el-button>
      <el-input
        v-model.trim="filterForm.text"
        size="small"
        clearable
        class="filter-input"
        placeholder="搜索商户名称"
        suffix-icon="el-icon-search"
      />
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      fit
      element-loading-text="加载中..."
      style="width: 100%;"
      @filter-change="filterChange"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="电表ID" sortable="custom" prop="MeterId">
        <template slot-scope="{ row }">
          <el-link
            @click.native="() => $refs.dialogRecord.openDialog(row.MeterId)"
            type="primary"
            :underline="false"
          >
            {{ row.MeterId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="商户名称" prop="ShopName" />
      <el-table-column
        column-key="MeterUsageStatus"
        prop="MeterUsageStatus"
        :filters="useStateMap"
        label="使用状态"
      >
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :type="
              (
                useStateMap.find(v => v.value === row.MeterUsageStatus) || {
                  tagType: 'info'
                }
              ).tagType
            "
          >
            {{
              (
                useStateMap.find(v => v.value === row.MeterUsageStatus) || {
                  text: '-'
                }
              ).text
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="联系人" prop="Contact" />
      <el-table-column label="手机号" prop="Mobile" />
      <el-table-column label="电价（元/度）" prop="Price" />
      <el-table-column label="余额（元）" sortable="custom" prop="Balance" />
      <el-table-column label="剩余电量" sortable="custom" prop="Energy" />
      <el-table-column
        column-key="ConnectStatus"
        prop="ConnectStatus"
        :filters="connectStateMap"
        label="连接状态"
      >
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :type="
              (
                connectStateMap.find(v => v.value === row.ConnectStatus) || {
                  tagType: 'info'
                }
              ).tagType
            "
          >
            {{
              (
                connectStateMap.find(v => v.value === row.ConnectStatus) || {
                  text: '-'
                }
              ).text
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        column-key="Switch"
        prop="Switch"
        :filters="switchStateMap"
        label="合闸状态"
      >
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :type="
              (
                switchStateMap.find(v => v.value === row.Switch) || {
                  tagType: 'info'
                }
              ).tagType
            "
          >
            {{
              (
                switchStateMap.find(v => v.value === row.Switch) || {
                  text: '-'
                }
              ).text
            }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="pagination.total > 0"
      :total="pagination.total"
      :page.sync="pagination.page"
      :limit.sync="pagination.limit"
      @pagination="fetchTableData"
    />
    <DialogSetPrice ref="dialogSetPrice" />
    <DialogRecord ref="dialogRecord" />
  </div>
</template>

<script>
import Pagination from '@/components/pagination/Index' // secondary package based on el-pagination
import debounce from 'lodash/debounce'
import DialogSetPrice from './DialogSetPrice'
import DialogRecord from './DialogRecord'
import { getMeterPage, meterSwitch } from '@/api/meter'
const useStateMap = [
  {
    value: 0,
    text: '正常',
    tagType: 'success'
  },
  {
    value: 1,
    text: '报警',
    tagType: 'warning'
  },
  {
    value: 2,
    text: '欠费',
    tagType: 'danger'
  }
]
const connectStateMap = [
  {
    value: -1,
    text: '离线',
    tagType: 'info'
  },
  {
    value: 1,
    text: '在线',
    tagType: 'success'
  }
]

const switchStateMap = [
  {
    value: 0,
    text: '拉闸',
    tagType: 'info'
  },
  {
    value: 1,
    text: '合闸',
    tagType: 'success'
  }
]
export default {
  components: { Pagination, DialogSetPrice, DialogRecord },
  data() {
    return {
      switchLoading: false,
      tableData: null,
      tableLoading: false,
      pagination: {
        total: 0,
        limit: 10,
        page: 1
      },
      multipleSelection: [],
      filterForm: {
        text: '',
        useStates: [],
        connectStates: [],
        switchStates: [],
        sortProp: undefined,
        isAsc: undefined
      },
      useStateMap,
      connectStateMap,
      switchStateMap
    }
  },
  watch: {
    'filterForm.text'() {
      this.pagination.page = 1
      this.fetchTableData()
    }
  },
  created() {
    this.fetchTableData()
  },
  computed: {
    projectId() {
      return this.$store.state.app.project.id
    }
  },
  methods: {
    // 拉闸合闸
    handleSwitch(action) {
      if (!this.multipleSelection.length) {
        this.$message('请选择需要操作的电表')
        return
      }
      this.$confirm(
        `确认要对选中的电表进行${action === 'close' ? '拉闸' : '合闸'}操作?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.switchLoading = true
          let isSwitch = false
          if (action === 'close') {
            // 强制拉闸
            isSwitch = false
          } else if (action === 'open') {
            // 强制合闸
            isSwitch = true
          }
          meterSwitch({
            meterIdList: this.multipleSelection.map(v => v.MeterId),
            isSwitch
          })
            .then(res => {
              if (res.data.Code === 200) {
                const data = res.data.Data
                if (!data.ErrList.length) {
                  this.$message.success('操作成功，状态修改生效需要一会儿')
                } else {
                  let descText = ''
                  data.ErrList.forEach(item => {
                    descText += `
                        <div>电表-${item.ErrKey} 操作失败，Message：${item.ErrMessage}</div>
                      `
                  })
                  this.$notify({
                    title: '错误提示',
                    duration: 10000,
                    dangerouslyUseHTMLString: true,
                    message: descText
                  })
                }
              } else {
                this.$message.error('操作失败')
              }
            })
            .catch(err => {
              console.error(err)
              this.$message.error('操作失败')
            })
            .finally(() => {
              this.fetchTableData()
              this.switchLoading = false
            })
        })
        .catch(() => {})
    },
    /**
     * 表格排序
     */
    sortChange(val) {
      const { prop, order } = val
      this.filterForm.sortProp = prop
      this.filterForm.isAsc = order === 'ascending'
      this.fetchTableData()
    },
    /**
     * 表格筛选
     */
    filterChange(filter) {
      if (filter.ConnectStatus) {
        this.filterForm.connectStates = filter.ConnectStatus
      } else if (filter.Switch) {
        this.filterForm.switchStates = filter.Switch
      } else if (filter.MeterUsageStatus) {
        this.filterForm.useStates = filter.MeterUsageStatus
      }
      this.pagination.page = 1
      this.fetchTableData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
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
          switchStates,
          connectStates,
          useStates
        } = this.filterForm
        const { page, limit } = this.pagination
        getMeterPage({
          ProjectId: this.projectId,
          ShopName: text,
          MeterUsageStatusList: useStates,
          ConnectStatusList: connectStates,
          SwitchList: switchStates,
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
    )
  }
}
</script>
