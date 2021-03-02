<template>
  <div class="report-manage-strategy">
    <page-header v-if="$route.meta.customHeader" :title="$route.meta.title">
      <template v-slot:right>
        <el-button
          v-permission="[131]"
          @click.native="$refs.addStrategyPane.openDialog"
          size="mini"
          type="primary"
          style="margin-left: 15px;"
        >
          新增
        </el-button>
      </template>
    </page-header>
    <el-tabs class="page-tabs" v-model="activeName">
      <el-tab-pane
        label="基础版"
        v-for="(item, index) in tableData"
        :name="item.id"
        :key="index"
      >
        <strategyPane :info="item" @refresh="fetchTableData"></strategyPane>
      </el-tab-pane>
    </el-tabs>
    <AddStrategyPane
      ref="addStrategyPane"
      @refresh="fetchTableData"
    ></AddStrategyPane>
  </div>
</template>

<script>
import strategyPane from './strategyPane'
import AddStrategyPane from './AddStrategyPane'

export default {
  components: {
    strategyPane,
    AddStrategyPane
  },
  data() {
    return {
      activeName: '1',
      tableData: [{ id: '1' }, { id: '2' }, { id: '3' }]
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
    // 获取表格数据
    fetchTableData(tab = '') {
      if (tab === 'add') {
        this.activeName = ''
      }
    }
  }
}
</script>

<style lang="scss">
.report-manage-strategy {
}
</style>
