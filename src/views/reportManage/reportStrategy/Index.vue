<template>
  <div class="report-manage-strategy">
    <page-header v-if="$route.meta.customHeader" :title="$route.meta.title">
      <template v-slot:right>
        <el-button
          v-permission="[109]"
          @click.native="handleAddPane"
          size="mini"
          type="primary"
          style="margin-left: 15px;"
        >
          新增
        </el-button>
      </template>
    </page-header>
    <div v-if="tableData.length" v-loading="tableLoading" :key="tabKey">
      <el-tabs class="page-tabs" v-model="activeName">
        <el-tab-pane
          v-for="(item, index) in tableData"
          :label="item.ReportStrategyName"
          :name="`${item.ReportStrategyId}`"
          :key="index"
          v-nodata="!tableData.length"
        >
          <strategyPane
            :info="item"
            @refresh="fetchTableData"
            @deletePane="deletePane"
          ></strategyPane>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!--缺省页-->
    <div class="content-box no-data" v-else v-loading="tableLoading">
      <img
        style="width: 80px;"
        src="
          https://cdn.sinocold.net/images/empty.png"
        alt="暂无数据"
      />
      <div class="no-data-text">暂无数据</div>
      <div class="no-data-remark">您可通过左上角「新增」添加</div>
    </div>
    <AddStrategyPane ref="addStrategyPane" @addPane="addPane"></AddStrategyPane>
  </div>
</template>

<script>
import strategyPane from './strategyPane'
import AddStrategyPane from './AddStrategyPane'
import { getReportStrategyPage } from '@/api/reportStrategy'

export default {
  components: {
    strategyPane,
    AddStrategyPane
  },
  data() {
    return {
      tableLoading: true,
      activeName: '',
      tabKey: 1,
      tableData: []
    }
  },
  computed: {
    companyId() {
      return this.$store.state.app.company.id
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    // 点击新增策略
    handleAddPane() {
      let noFinishPane = this.tableData.filter(
        item => item.ReportStrategyId === 'add'
      )
      if (noFinishPane.length) {
        this.$message.error('请先完善上一次添加的策略信息')
        return
      }
      this.$refs.addStrategyPane.openDialog()
    },
    // 新增策略
    addPane(name) {
      this.tableData.push({
        ProjectList: [],
        ReportStrategyId: 'add',
        CompanyId: this.companyId,
        ReportStrategyName: name,
        Cycle: 0,
        Content: undefined,
        Alarm: undefined,
        LowTModelTreeUpper: undefined,
        LowTModelTreeLower: undefined,
        MiddleTModelTreeUpper: undefined,
        MiddleTModelTreeLower: undefined,
        HighTModelTreeUpper: undefined,
        HighTModelTreeLower: undefined,
        DefrostingTUpper: undefined,
        IPAPUpper: undefined,
        IPAPLower: undefined,
        Created: new Date().toISOString()
      })
      this.$nextTick(() => {
        this.activeName = 'add'
      })
    },
    // 删除策略
    deletePane(id) {
      this.tableData = this.tableData.filter(
        item => item.ReportStrategyId !== id
      )
      this.tabKey++
      this.$nextTick(() => {
        this.activeName = this.tableData.length
          ? `${this.tableData[0].ReportStrategyId}`
          : ''
      })
    },
    // 获取数据
    fetchTableData() {
      this.tableLoading = true
      getReportStrategyPage({
        CompanyId: this.companyId,
        PageIndex: 1,
        PageSize: 9999
      })
        .then(res => {
          if (res.data.Code === 200) {
            let data = res.data.Data.Data
            this.tableData = data
            this.$nextTick(() => {
              if (data.length) {
                if (this.activeName === 'add') {
                  this.activeName = `${data[data.length - 1].ReportStrategyId}`
                } else {
                  this.activeName = `${data[0].ReportStrategyId}`
                }
              } else {
                this.activeName = ''
              }
            })
          } else {
            this.$message.error('获取列表失败')
            this.tableData = []
            this.activeName = ''
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取列表失败')
          this.tableData = []
          this.activeName = ''
        })
        .finally(() => {
          this.tableLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.no-data-text {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
  line-height: 22px;
}
.no-data-remark {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #1890ff;
  line-height: 22px;
}
</style>
